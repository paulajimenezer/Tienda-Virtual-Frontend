import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Categoria, CategoriaFilters, CreateCategoriaRequest, UpdateCategoriaRequest } from '../../shared/models/categoria.model';
import { PaginationParams } from '../models/api-response.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private readonly endpoint = '/categorias';

  constructor(private apiService: ApiService) { }

  /**
   * Obtiene todas las categorías con paginación
   */
  getCategorias(pagination: PaginationParams, filters?: CategoriaFilters): Observable<Categoria[]> {
    return this.apiService.getPaginated<Categoria>(this.endpoint, pagination, filters);
  }

  /**
   * Obtiene una categoría por ID
   */
  getCategoriaById(id: string): Observable<Categoria> {
    return this.apiService.get<Categoria>(`${this.endpoint}/${id}`);
  }

  /**
   * Crea una nueva categoría
   */
  createCategoria(categoria: CreateCategoriaRequest): Observable<Categoria> {
    return this.apiService.post<Categoria>(this.endpoint, categoria);
  }

  /**
   * Actualiza una categoría existente
   */
  updateCategoria(id: string, categoria: UpdateCategoriaRequest): Observable<Categoria> {
    return this.apiService.put<Categoria>(`${this.endpoint}/${id}`, categoria);
  }

  /**
   * Elimina una categoría
   */
  deleteCategoria(id: string): Observable<any> {
    return this.apiService.delete<any>(`${this.endpoint}/${id}`);
  }

  /**
   * Obtiene una categoría por nombre
   */
  getCategoriaByNombre(nombre: string): Observable<Categoria> {
    return this.apiService.get<Categoria>(`${this.endpoint}/nombre/${nombre}`);
  }
}
