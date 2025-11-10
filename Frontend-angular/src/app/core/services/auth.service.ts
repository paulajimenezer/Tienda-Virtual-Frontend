import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Usuario } from '../../shared/models/usuario.model';
import { ApiService } from './api.service';

export interface LoginRequest {
  nombre_usuario: string;
  contrasena: string;
}

export interface LoginResponse {
  clave: string;
  nombre_usuario: Usuario;
}

export interface User {
  id: string;
  email: string;
  nombre: string;
  nombre_usuario: string;
  telefono?: string;
  activo: boolean;
  es_admin: boolean;
  fecha_creacion: string;
  fecha_edicion?: string;
}

export type UserRole = 'admin' | 'consumidor';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  private readonly ROLE_KEY = 'user_role';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadUserFromStorage();
  }

  /**
   * Inicia sesión del usuario usando el backend real
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('AuthService: Intentando login con credenciales:', credentials);
    return this.apiService.post<LoginResponse>('/auth/login', credentials);
  }

  /**
   * Crea un usuario administrador inicial
   */
  crearAdmin(): Observable<any> {
    return this.apiService.post('/auth/crear-admin', {});
  }

  /**
   * Verifica el estado de autenticación
   */
  verificarEstado(): Observable<any> {
    return this.apiService.get('/auth/estado');
  }

  /**
   * Verifica un usuario por ID
   */
  verificarUsuario(usuarioId: string): Observable<Usuario> {
    return this.apiService.get<Usuario>(`/auth/verificar/${usuarioId}`);
  }

  /**
   * Cierra sesión del usuario
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    this.currentUserSubject.next(null);
  }

  /**
   * Obtiene el token de autenticación
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Guarda los datos del usuario después del login
   */
  setUserData(loginResponse: LoginResponse): void {
    console.log('AuthService: Guardando datos del usuario:', loginResponse);
    localStorage.setItem(this.TOKEN_KEY, loginResponse.clave);
    localStorage.setItem(this.USER_KEY, JSON.stringify(loginResponse.nombre_usuario));
    localStorage.setItem(this.ROLE_KEY, loginResponse.nombre_usuario.es_admin ? 'admin' : 'consumidor');
    this.currentUserSubject.next(loginResponse.nombre_usuario);
    console.log('AuthService: Datos guardados en localStorage');
    console.log('Token:', localStorage.getItem(this.TOKEN_KEY));
    console.log('Usuario:', localStorage.getItem(this.USER_KEY));
  }

  /**
   * Carga los datos del usuario desde el almacenamiento local
   */
  private loadUserFromStorage(): void {
    const userData = localStorage.getItem(this.USER_KEY);
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        this.logout();
      }
    }
  }

  /**
   * Obtiene el rol del usuario actual
   */
  getUserRole(): UserRole | null {
    const user = this.getCurrentUser();
    return user?.es_admin ? 'admin' : 'consumidor';
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: UserRole): boolean {
    return this.getUserRole() === role;
  }

  /**
   * Verifica si el usuario es administrador
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.es_admin || false;
  }

  /**
   * Verifica si el usuario es consumidor
   */
  isConsumidor(): boolean {
    const user = this.getCurrentUser();
    return !user?.es_admin;
  }

  /**
   * Verifica si el usuario puede acceder a una ruta específica
   */
  canAccess(route: string): boolean {
    const role = this.getUserRole();
    
    if (!role) return false;

    // Admin puede acceder a todo
    if (role === 'admin') return true;

    // Consumidor solo puede acceder a productos
    if (role === 'consumidor') {
      return route === 'productos' || route === 'dashboard';
    }

    return false;
  }
}
