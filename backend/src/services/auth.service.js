const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { signToken } = require('../utils/jwt.utils');

class AuthService {
  async register({ correo, password, nombres, apellidos, fecha_nacimiento, telefono, id_rol = 3, responsable = null }) {
    // Validar si el usuario ya existe
    const existing = await query('SELECT id_usuario FROM usuario WHERE correo = $1', [correo.toLowerCase().trim()]);
    if (existing.rowCount > 0) {
      const error = new Error('El correo electrónico ya está registrado.');
      error.statusCode = 400;
      throw error;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Iniciar creación con transacción
    const { pool } = require('../config/database');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const userRes = await client.query(
        `INSERT INTO usuario (id_rol, correo, password_hash, estado)
         VALUES ($1, $2, $3, 'ACTIVO')
         RETURNING id_usuario, id_rol, correo, estado`,
        [id_rol, correo.toLowerCase().trim(), passwordHash]
      );
      const user = userRes.rows[0];

      let perfil = null;

      // Si es PACIENTE (rol 3)
      if (Number(id_rol) === 3) {
        const pacRes = await client.query(
          `INSERT INTO paciente (id_usuario, nombres, apellidos, fecha_nacimiento, telefono, estado)
           VALUES ($1, $2, $3, $4, $5, 'SOLICITANTE')
           RETURNING id_paciente, nombres, apellidos, estado`,
          [user.id_usuario, nombres, apellidos, fecha_nacimiento || null, telefono || null]
        );
        perfil = pacRes.rows[0];

        // Si se proporciona responsable (obligatorio para menores de edad o contacto inicial)
        let respInfo = null;
        if (responsable && responsable.nombres && responsable.apellidos) {
          const respRes = await client.query(
            `INSERT INTO responsable (id_paciente, nombres, apellidos, parentesco, telefono, correo)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
              perfil.id_paciente,
              responsable.nombres.trim(),
              responsable.apellidos.trim(),
              responsable.parentesco ? responsable.parentesco.trim() : null,
              responsable.telefono ? responsable.telefono.trim() : null,
              responsable.correo ? responsable.correo.trim().toLowerCase() : null,
            ]
          );
          respInfo = respRes.rows[0];
          perfil.responsables = [respInfo];
        }

        // Registrar en historial administrativo detallando si es menor de edad con tutor
        const descripcionHistorial = respInfo
          ? `Registro de paciente con tutor/responsable legal: ${respInfo.nombres} ${respInfo.apellidos} (${respInfo.parentesco || 'Responsable'})`
          : 'Registro de autoservicio de nuevo paciente';

        await client.query(
          `INSERT INTO historial_administrativo (id_paciente, id_usuario, tipo_evento, descripcion)
           VALUES ($1, $2, 'PACIENTE_REGISTRADO', $3)`,
          [perfil.id_paciente, user.id_usuario, descripcionHistorial]
        );
      } else if (Number(id_rol) === 2) {
        // Si es PROFESIONAL (creado por admin normalmente)
        const profRes = await client.query(
          `INSERT INTO profesional (id_usuario, nombres, apellidos, telefono, estado)
           VALUES ($1, $2, $3, $4, 'ACTIVO')
           RETURNING id_profesional, nombres, apellidos, estado`,
          [user.id_usuario, nombres, apellidos, telefono || null]
        );
        perfil = profRes.rows[0];
      }

      await client.query('COMMIT');

      // Obtener nombre del rol
      const rolRes = await query('SELECT nombre FROM rol WHERE id_rol = $1', [user.id_rol]);
      const rolNombre = rolRes.rows[0]?.nombre || 'PACIENTE';

      const tokenPayload = {
        id_usuario: user.id_usuario,
        correo: user.correo,
        id_rol: user.id_rol,
        rol: rolNombre,
      };

      const token = signToken(tokenPayload);

      return {
        token,
        usuario: {
          id_usuario: user.id_usuario,
          correo: user.correo,
          rol: rolNombre,
          estado: user.estado,
          perfil,
        },
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async login(correo, password) {
    const userQuery = `
      SELECT u.id_usuario, u.correo, u.password_hash, u.estado, u.id_rol, r.nombre AS rol_nombre,
             p.id_profesional, p.nombres AS prof_nombres, p.apellidos AS prof_apellidos,
             pac.id_paciente, pac.nombres AS pac_nombres, pac.apellidos AS pac_apellidos
      FROM usuario u
      JOIN rol r ON u.id_rol = r.id_rol
      LEFT JOIN profesional p ON p.id_usuario = u.id_usuario
      LEFT JOIN paciente pac ON pac.id_usuario = u.id_usuario
      WHERE u.correo = $1
    `;
    const res = await query(userQuery, [correo.toLowerCase().trim()]);

    if (res.rowCount === 0) {
      const error = new Error('Credenciales incorrectas.');
      error.statusCode = 401;
      throw error;
    }

    const user = res.rows[0];

    if (user.estado !== 'ACTIVO') {
      const error = new Error(`El usuario se encuentra ${user.estado}. No tiene permitido el acceso.`);
      error.statusCode = 403;
      throw error;
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      const error = new Error('Credenciales incorrectas.');
      error.statusCode = 401;
      throw error;
    }

    const tokenPayload = {
      id_usuario: Number(user.id_usuario),
      correo: user.correo,
      id_rol: Number(user.id_rol),
      rol: user.rol_nombre,
      id_profesional: user.id_profesional ? Number(user.id_profesional) : null,
      id_paciente: user.id_paciente ? Number(user.id_paciente) : null,
    };

    const token = signToken(tokenPayload);

    let perfil = null;
    if (user.id_profesional) {
      perfil = {
        id_profesional: Number(user.id_profesional),
        nombres: user.prof_nombres,
        apellidos: user.prof_apellidos,
      };
    } else if (user.id_paciente) {
      perfil = {
        id_paciente: Number(user.id_paciente),
        nombres: user.pac_nombres,
        apellidos: user.pac_apellidos,
      };
    }

    return {
      token,
      usuario: {
        id_usuario: Number(user.id_usuario),
        correo: user.correo,
        rol: user.rol_nombre,
        estado: user.estado,
        perfil,
      },
    };
  }

  async getMe(userId) {
    const userQuery = `
      SELECT u.id_usuario, u.correo, u.estado, u.id_rol, r.nombre AS rol_nombre,
             p.id_profesional, p.nombres AS prof_nombres, p.apellidos AS prof_apellidos, p.telefono AS prof_telefono,
             pac.id_paciente, pac.nombres AS pac_nombres, pac.apellidos AS pac_apellidos, 
             pac.telefono AS pac_telefono, pac.fecha_nacimiento, pac.estado AS pac_estado
      FROM usuario u
      JOIN rol r ON u.id_rol = r.id_rol
      LEFT JOIN profesional p ON p.id_usuario = u.id_usuario
      LEFT JOIN paciente pac ON pac.id_usuario = u.id_usuario
      WHERE u.id_usuario = $1
    `;
    const res = await query(userQuery, [userId]);
    if (res.rowCount === 0) {
      const error = new Error('Usuario no encontrado.');
      error.statusCode = 404;
      throw error;
    }

    const u = res.rows[0];
    return {
      id_usuario: Number(u.id_usuario),
      correo: u.correo,
      rol: u.rol_nombre,
      estado: u.estado,
      profesional: u.id_profesional ? {
        id_profesional: Number(u.id_profesional),
        nombres: u.prof_nombres,
        apellidos: u.prof_apellidos,
        telefono: u.prof_telefono,
      } : null,
      paciente: u.id_paciente ? {
        id_paciente: Number(u.id_paciente),
        nombres: u.pac_nombres,
        apellidos: u.pac_apellidos,
        telefono: u.pac_telefono,
        fecha_nacimiento: u.fecha_nacimiento,
        estado: u.pac_estado,
      } : null,
    };
  }
}

module.exports = new AuthService();
