/** Representa un descuento configurable con vigencia, porcentaje y estado. */
export interface Descuento {
	id: string;
	codigo: string;
	porcentaje: number;
	fecha_inicio: string;
	fecha_fin: string;
	activo: boolean;
	fecha_creacion?: string;
	fecha_actualizacion?: string;
}

/** Información requerida para crear un código de descuento. */
export interface DescuentoCreate {
	codigo: string;
	porcentaje: number;
	fecha_inicio: string;
	fecha_fin: string;
	activo?: boolean;
	id_usuario_crea?: string | null;
}

/** Campos opcionales para ajustar un descuento existente. */
export interface DescuentoUpdate {
	codigo?: string;
	porcentaje?: number;
	fecha_inicio?: string;
	fecha_fin?: string;
	activo?: boolean;
	id_usuario_edita?: string | null;
}

export interface DescuentoFilters {
	codigo?: string;
	activo?: boolean;
	fechaVigente?: string;
}

export interface DescuentoListResponse {
	data: Descuento[];
	totalItems: number;
	totalPages: number;
	currentPage: number;
}
