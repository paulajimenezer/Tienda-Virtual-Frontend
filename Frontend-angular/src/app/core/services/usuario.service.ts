import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChangePasswordRequest, CreateUsuarioRequest, UpdateUsuarioRequest, Usuario, UsuarioFilters } from '../../shared/models/usuario.model';
import { PaginationParams } from '../models/api-response.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly endpoint = '/usuarios';

  constructor(private apiService: ApiService) { }

  /**
   * Obtiene todos los usuarios con paginación
   */
  getUsuarios(pagination: PaginationParams, filters?: UsuarioFilters): Observable<Usuario[]> {
    return this.apiService.getPaginated<Usuario>(this.endpoint, pagination, filters);
  }

  /**
   * Obtiene un usuario por ID
   */
  getUsuarioById(id: string): Observable<Usuario> {
    return this.apiService.get<Usuario>(`${this.endpoint}/${id}`);
  }

  /**
   * Obtiene un usuario por email
   */
  getUsuarioByEmail(email: string): Observable<Usuario> {
    return this.apiService.get<Usuario>(`${this.endpoint}/email/${email}`);
  }

  /**
   * Obtiene un usuario por nombre de usuario
   */
  getUsuarioByUsername(username: string): Observable<Usuario> {
    return this.apiService.get<Usuario>(`${this.endpoint}/username/${username}`);
  }

  /**
   * Crea un nuevo usuario
   */
  createUsuario(usuario: CreateUsuarioRequest): Observable<Usuario> {
    return this.apiService.post<Usuario>(this.endpoint, usuario);
  }

  /**
   * Actualiza un usuario existente
   */
  updateUsuario(id: string, usuario: UpdateUsuarioRequest): Observable<Usuario> {
    return this.apiService.put<Usuario>(`${this.endpoint}/${id}`, usuario);
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
  desactivarUsuario(id: string): Observable<Usuario> {
    return this.apiService.patch<Usuario>(`${this.endpoint}/${id}/desactivar`, {});
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
  getUsuariosAdmin(): Observable<Usuario[]> {
    return this.apiService.get<Usuario[]>(`${this.endpoint}/admin/lista`);
  }

  /**
   * Verifica si un usuario es administrador
   */
  verificarEsAdmin(id: string): Observable<any> {
    return this.apiService.get<any>(`${this.endpoint}/${id}/es-admin`);
  }
}
