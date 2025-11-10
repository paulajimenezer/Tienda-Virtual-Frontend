/**
 * Modelo para la entidad Categoría
 */
export interface Categoria {
  id_categoria: string; // UUID
  id: string; // Alias for id_categoria for frontend compatibility
  nombre: string;
  descripcion?: string;
  activa: boolean; // Status field
  fecha_creacion: string;
  fecha_edicion?: string;
}

/**
 * Modelo para crear una nueva categoría
 */
export interface CreateCategoriaRequest {
  nombre: string;
  descripcion?: string;
}

/**
 * Modelo para actualizar una categoría
 */
export interface UpdateCategoriaRequest {
  nombre?: string;
  descripcion?: string;
}

/**
 * Modelo para filtros de categorías
 */
export interface CategoriaFilters {
  nombre?: string;
  activa?: boolean; // Status filter
}

/**
 * Modelo para respuesta paginada de categorías
 */
export interface CategoriaListResponse {
  data: Categoria[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}
