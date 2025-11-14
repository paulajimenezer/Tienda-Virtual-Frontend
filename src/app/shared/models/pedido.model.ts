/** Estructura principal de un pedido con totales, estados y vínculos de relación. */
export interface Pedido {
	id: string;
	id_usuario: string;
	id_direccion: string;
	total: number;
	estado: PedidoEstado;
	id_descuento?: string | null;
	fecha_pedido?: string;
	fecha_actualizacion?: string;

	// Relaciones enriquecidas opcionales devueltas por el backend
	usuario?: import('./usuario.model').Usuario | null;
	items?: any[];
	direccion?: any | null;
}

/** Datos mínimos requeridos para generar un pedido en el sistema. */
export interface PedidoCreate {
	id_usuario: string;
	id_direccion: string;
	total: number;
	estado?: PedidoEstado;
	id_descuento?: string | null;
	fecha_pedido?: string;
	id_usuario_crea?: string | null;
}

/** Conjunto editable de campos para actualizar pedidos existentes. */
export interface PedidoUpdate {
	id_direccion?: string;
	total?: number;
	estado?: PedidoEstado;
	id_descuento?: string | null;
	fecha_pedido?: string;
	id_usuario_edita?: string | null;
}

/** Estados permitidos dentro del ciclo de vida de un pedido. */
export type PedidoEstado = "Creado" | "Pagado" | "Enviado" | "Entregado" | "Cancelado";

export interface PedidoFilters {
	id_usuario?: string;
	estado?: PedidoEstado;
	id_descuento?: string | null;
	fechaDesde?: string;
	fechaHasta?: string;
}

export interface PedidoListResponse {
	data: Pedido[];
	totalItems: number;
	totalPages: number;
	currentPage: number;
}
