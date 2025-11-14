/**
 * Modelo para la entidad Producto
 */
export interface Producto {
  id_producto: string; // UUID
  id: string; // Alias for id_producto for frontend compatibility
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria_id: string; // UUID
  usuario_id: string; // UUID
  activo: boolean; // Status field
  categoria?: { // Optional relationship data
    nombre: string;
  };
  fecha_creacion: string;
  fecha_edicion?: string;
}

/**
 * Modelo para crear un nuevo producto
 */
export interface CreateProductoRequest {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria_id: string;
  usuario_id: string;
}

/**
 * Modelo para actualizar un producto
 */
export interface UpdateProductoRequest {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  stock?: number;
  categoria_id?: string;
  usuario_id?: string;
}

/**
 * Modelo para filtros de productos
 */
export interface ProductoFilters {
  nombre?: string;
  categoria_id?: string;
  precio_min?: number;
  precio_max?: number;
  stock_min?: number;
  activo?: boolean; // Status filter
}

/**
 * Modelo para respuesta paginada de productos
 */
export interface ProductoListResponse {
  data: Producto[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}
