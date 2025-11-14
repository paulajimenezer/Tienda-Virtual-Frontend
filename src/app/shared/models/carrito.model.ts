/** Carrito de compras con estado, items asociados y metadatos de auditoría. */
export interface Carrito {
	id: string;
	id_usuario: string;
	activo: boolean;
	estado?: string;
	// Items pueden venir tipados (CarritoItem[]) o como objetos enriquecidos desde el backend
	items?: any[];
	fecha_creacion?: string;
	fecha_actualizacion?: string;

	// Relaciones enriquecidas opcionales devueltas por el backend
	usuario?: import('./usuario.model').Usuario | null;
}

/** Item contenido en un carrito con referencias de producto y precio. */
export interface CarritoItem {
	id: string;
	id_carrito: string;
	id_producto: string;
	cantidad: number;
	precio_unitario: number;
	fecha_creacion?: string;
	fecha_actualizacion?: string;
}

/** Payload para obtener o crear carritos activos por usuario. */
export interface CarritoCreate {
	id_usuario: string;
	id_usuario_crea?: string | null;
}

/** Campos permitidos para actualizar el estado o auditoría del carrito. */
export interface CarritoUpdate {
	estado?: string;
	activo?: boolean;
	id_usuario_edita?: string | null;
}

export interface CarritoFilters {
	id_usuario?: string;
	activo?: boolean;
}

export interface CarritoListResponse {
	data: Carrito[];
	totalItems: number;
	totalPages: number;
	currentPage: number;
}
