/** Modelo de usuario con datos personales, relacionales y metadatos de auditoría. */
export interface Usuario {
	id: string;
	nombre: string;
	apellido: string;
	email: string;
	numero_documento: string;
	id_rol: string;
	id_tipo_documento: string;
	id_sexo?: string | null;
	activo?: boolean;
	fecha_creacion?: string;
	fecha_actualizacion?: string;
}

/** Payload requerido para registrar un usuario incluyendo credenciales y relaciones obligatorias. */
export interface UsuarioCreate {
	nombre: string;
	apellido: string;
	email: string;
	password: string;
	numero_documento: string;
	id_rol: string;
	id_tipo_documento: string;
	id_sexo?: string | null;
	id_usuario_crea?: string | null;
}

/** Conjunto parcial de campos permitidos para actualizar un usuario existente. */
export interface UsuarioUpdate {
	nombre?: string;
	apellido?: string;
	email?: string;
	password?: string;
	numero_documento?: string;
	id_rol?: string;
	id_tipo_documento?: string;
	id_sexo?: string | null;
	activo?: boolean;
	id_usuario_edita?: string | null;
}

export interface UsuarioFilters {
	nombre?: string;
	email?: string;
	id_rol?: string;
	id_tipo_documento?: string;
	activo?: boolean;
}

export interface UsuarioListResponse {
	data: Usuario[];
	totalItems: number;
	totalPages: number;
	currentPage: number;
}

/** Compat: shape usado por el viejo formulario de registro */
export interface CreateUsuarioRequest {
	nombre?: string;
	apellido?: string;
	email?: string;
	password?: string;
	contraseña?: string;
	nombre_usuario?: string;
	telefono?: string;
	es_admin?: boolean;
}
