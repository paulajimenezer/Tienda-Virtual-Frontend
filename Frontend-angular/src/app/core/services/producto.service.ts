import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateProductoRequest, Producto, ProductoFilters, UpdateProductoRequest } from '../../shared/models/producto.model';
import { PaginationParams } from '../models/api-response.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private readonly endpoint = '/productos';

  constructor(private apiService: ApiService) { }

  /**
   * Obtiene todos los productos con paginación
   */
  getProductos(pagination: PaginationParams, filters?: ProductoFilters): Observable<Producto[]> {
    return this.apiService.getPaginated<Producto>(this.endpoint, pagination, filters);
  }

  /**
   * Obtiene un producto por ID
   */
  getProductoById(id: string): Observable<Producto> {
    return this.apiService.get<Producto>(`${this.endpoint}/${id}`);
  }

  /**
   * Crea un nuevo producto
   */
  createProducto(producto: CreateProductoRequest): Observable<Producto> {
    return this.apiService.post<Producto>(this.endpoint, producto);
  }

  /**
   * Actualiza un producto existente
   */
  updateProducto(id: string, producto: UpdateProductoRequest): Observable<Producto> {
    return this.apiService.put<Producto>(`${this.endpoint}/${id}`, producto);
  }

  /**
   * Elimina un producto
   */
  deleteProducto(id: string): Observable<any> {
    return this.apiService.delete<any>(`${this.endpoint}/${id}`);
  }

  /**
   * Obtiene productos por categoría
   */
  getProductosByCategoria(categoriaId: string): Observable<Producto[]> {
    return this.apiService.get<Producto[]>(`${this.endpoint}/categoria/${categoriaId}`);
  }

  /**
   * Obtiene productos por usuario
   */
  getProductosByUsuario(usuarioId: string): Observable<Producto[]> {
    return this.apiService.get<Producto[]>(`${this.endpoint}/usuario/${usuarioId}`);
  }

  /**
   * Busca productos por nombre
   */
  buscarProductos(nombre: string): Observable<Producto[]> {
    return this.apiService.get<Producto[]>(`${this.endpoint}/buscar/${nombre}`);
  }

  /**
   * Actualiza el stock de un producto
   */
  actualizarStock(id: string, nuevoStock: number): Observable<Producto> {
    return this.apiService.patch<Producto>(`${this.endpoint}/${id}/stock`, { stock: nuevoStock });
  }
}
