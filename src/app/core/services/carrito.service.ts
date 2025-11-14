import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChangePasswordRequest, CreateUsuarioRequest, UpdateUsuarioRequest, UsuarioFilters, Carrito } from '../../shared/models/carrito.model';
import { PaginationParams } from '../models/api-response.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly endpoint = '/carritos';

  constructor(private apiService: ApiService) { }

  /**
   * Obtiene todos los usuarios con paginación
   */
  getCarritos(pagination: PaginationParams, filters?: UsuarioFilters): Observable<Carrito[]> {
    return this.apiService.getPaginated<Carrito>(this.endpoint, pagination, filters);
  }

  /**
   * Obtiene un usuario por ID
   */
  getUsuarioById(id: string): Observable<Carrito> {
    return this.apiService.get<Carrito>(`${this.endpoint}/${id}`);
  }




  /**
   * Crea un nuevo usuario
   */
 /* createUsuario(usuario: CreateCarritoRequest): Observable<Carrito> {
    return this.apiService.post<Carrito>(this.endpoint, usuario);
  }*/

  /**
   * Actualiza un usuario existente
   */
  updateUsuario(id: string, usuario: UpdateUsuarioRequest): Observable<Carrito> {
    return this.apiService.put<Carrito>(`${this.endpoint}/${id}`, usuario);
  }

  /**
   * Elimina un usuario
   */
  deleteUsuario(id: string): Observable<any> {
    return this.apiService.delete<any>(`${this.endpoint}/${id}`);
  }

  /**
   * Desactiva un usuario (soft delete)
   */
  desactivarUsuario(id: string): Observable<Carrito> {
    return this.apiService.patch<Carrito>(`${this.endpoint}/${id}/desactivar`, {});
  }

  /**
   * Cambia la contraseña de un usuario
   */
  changePassword(id: string, passwordData: ChangePasswordRequest): Observable<any> {
    return this.apiService.post<any>(`${this.endpoint}/${id}/cambiar-contraseña`, passwordData);
  }

  /**
   * Obtiene todos los usuarios administradores
   */
  getUsuariosAdmin(): Observable<Carrito[]> {
    return this.apiService.get<Carrito[]>(`${this.endpoint}/admin/lista`);
  }

  /**
   * Verifica si un usuario es administrador
   */
  verificarEsAdmin(id: string): Observable<any> {
    return this.apiService.get<any>(`${this.endpoint}/${id}/es-admin`);
  }
}
