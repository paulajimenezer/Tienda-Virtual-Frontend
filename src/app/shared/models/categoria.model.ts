/** Categoría de productos con nombre, descripción y trazabilidad. */
export interface Categoria {
	id: string;
	nombre: string;
	descripcion: string;
	fecha_creacion?: string;
	fecha_actualizacion?: string;
}

/** Datos básicos requeridos para registrar una categoría nueva. */
export interface CategoriaCreate {
	nombre: string;
	descripcion: string;
}

/** Campos modificables utilizados en la actualización de categorías. */
export interface CategoriaUpdate {
	nombre?: string;
	descripcion?: string;
}

export interface CategoriaFilters {
	nombre?: string;
}

export interface CategoriaListResponse {
	data: Categoria[];
	totalItems: number;
	totalPages: number;
	currentPage: number;
}
