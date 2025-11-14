/** Representación de producto con atributos comerciales, stock y seguimiento temporal. */
export interface Producto {
	id: string;
	nombre: string;
	descripcion: string;
	precio: number;
	stock: number;
	categoria_id: string;
	usuario_id: string;
	activo?: boolean;
	fecha_creacion?: string;
	fecha_actualizacion?: string;
}

/** Datos necesarios para crear un producto desde el frontend. */
export interface ProductoCreate {
	nombre: string;
	descripcion: string;
	precio: number;
	stock: number;
	categoria_id: string;
	usuario_id: string;
}

/** Campos opcionales para modificar un producto ya registrado. */
export interface ProductoUpdate {
	nombre?: string;
	descripcion?: string;
	precio?: number;
	stock?: number;
	categoria_id?: string;
	usuario_id?: string;
	activo?: boolean;
	id_usuario_edita?: string | null;
}

export interface ProductoFilters {
	nombre?: string;
	categoria_id?: string;
	usuario_id?: string;
	activo?: boolean;
	precioMin?: number;
	precioMax?: number;
}

export interface ProductoListResponse {
	data: Producto[];
	totalItems: number;
	totalPages: number;
	currentPage: number;
}
