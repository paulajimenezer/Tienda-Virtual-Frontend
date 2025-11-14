/** Factura emitida para un pedido con totales e información fiscal. */
export interface Factura {
	id: string;
	id_pedido: string;
	numero_factura: string;
	subtotal: number;
	impuesto: number;
	total: number;
	fecha_emision?: string;
	fecha_creacion?: string;
	fecha_actualizacion?: string;

	// Relaciones enriquecidas (opcionales, provistas por endpoints enriquecidos)
	pedido?: import('./pedido.model').Pedido & { items?: any[]; direccion?: any };
	usuario?: import('./usuario.model').Usuario | null;
}

/** Datos necesarios para registrar una factura y sus importes asociados. */
export interface FacturaCreate {
	id_pedido: string;
	numero_factura: string;
	subtotal: number;
	impuesto: number;
	total: number;
	fecha_emision?: string;
	id_usuario_crea?: string | null;
}

/** Campos modificables para actualizar información de la factura. */
export interface FacturaUpdate {
	numero_factura?: string;
	subtotal?: number;
	impuesto?: number;
	total?: number;
	fecha_emision?: string;
	id_usuario_edita?: string | null;
}

export interface FacturaFilters {
	numero_factura?: string;
	id_pedido?: string;
	fechaDesde?: string;
	fechaHasta?: string;
}

export interface FacturaListResponse {
	data: Factura[];
	totalItems: number;
	totalPages: number;
	currentPage: number;
}
