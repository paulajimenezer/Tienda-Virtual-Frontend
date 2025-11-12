/**
 * Modelo para la entidad Usuario
 */
export interface Usuario {
  id: string; // UUID
  nombre: string;
  apellido?: string;
  nombre_usuario: string;
  email: string;
  numero_documento?: string;
  telefono?: string;
  // IDs normalizadores devueltos por el backend
  id_tipo_documento?: string;
  id_sexo?: string;
  id_rol?: string;
  // Campos derivados opcionales si el backend los entrega ya resueltos
  tipo_documento?: string;
  genero?: string;
  rol?: string;
  activo: boolean;
  es_admin: boolean;
  fecha_creacion: string;
  fecha_edicion?: string;
}

/**
 * Modelo para crear un nuevo usuario
 */
export interface CreateUsuarioRequest {
  nombre: string;
  nombre_usuario: string;
  email: string;
  contraseña: string;
  telefono?: string;
  es_admin?: boolean;
  password: string; // Alias for contraseña for frontend compatibility
  apellido: string; // Additional field for frontend
}

/**
 * Modelo para actualizar un usuario
 */
export interface UpdateUsuarioRequest {
  nombre?: string;
  nombre_usuario?: string;
  email?: string;
  telefono?: string;
  es_admin?: boolean;
  activo?: boolean;
}

/**
 * Modelo para cambiar contraseña
 */
export interface ChangePasswordRequest {
  contraseña_actual: string;
  nueva_contraseña: string;
}

/**
 * Modelo para filtros de usuarios
 */
export interface UsuarioFilters {
  email?: string;
  nombre?: string;
  nombre_usuario?: string;
  activo?: boolean;
  es_admin?: boolean;
}
