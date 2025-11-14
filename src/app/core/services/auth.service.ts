import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../../shared/models/usuario.model';

// Legacy/alternate login shape used by older components
export interface LoginRequest {
	nombre_usuario: string;
	contrasena: string;
}

export interface LoginResponse {
	clave: string; // token string in older mock shape or 'access_token'
	nombre_usuario: any; // may contain nested usuario object
	access_token?: string;
	token_type?: string;
	usuario?: unknown;
}

interface LoginCredentials {
	email: string;
	password: string;
}

export interface AuthUser {
	id: string;
	nombre: string;
	apellido: string;
	email: string;
	nombreUsuario?: string;
	activo?: boolean;
	esAdmin?: boolean;
	rol?: string;
	fechaCreacion?: string;
	fechaEdicion?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
	private readonly TOKEN_KEY = 'auth_token';
	private readonly USER_KEY = 'auth_user';
	private readonly ROLE_KEY = 'auth_role';
	private readonly apiUrl = environment.apiUrl;
	private readonly routePermissions: Record<string, Array<'admin' | 'cliente'>> = {
		usuarios: ['admin'],
		categorias: ['admin'],
		productos: ['admin', 'cliente'],
		pedidos: ['admin'],
		facturas: ['admin', 'cliente'],
		descuentos: ['admin'],
		carritos: ['admin', 'cliente']
	};

	private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.loadUserFromStorage());
	readonly currentUser$ = this.currentUserSubject.asObservable();

	constructor(private http: HttpClient) {}

	/**
	 * Login compatible con dos formas de credenciales:
	 * - Nuevo: { email, password }
	 * - Legacy: { nombre_usuario, contrasena }
	 * Devuelve el objeto raw de respuesta (LoginResponse) y además persiste sesión.
	 */
	login(credentials: LoginCredentials | LoginRequest): Observable<LoginResponse> {
		const url = `${this.apiUrl}/auth/login`;
		// Normalizar payload al formato esperado por el backend
		const payload: any = (credentials as any).nombre_usuario
			? { email: (credentials as LoginRequest).nombre_usuario, password: (credentials as LoginRequest).contrasena }
			: credentials;

		return this.http.post<LoginResponse>(url, payload).pipe(
			tap(response => this.persistLogin(response as any))
		);
	}

	/** Verificar estado del servicio de autenticación (endpoint /auth/estado) */
	verificarEstado(): Observable<any> {
		return this.http.get(`${this.apiUrl}/auth/estado`);
	}

	logout(): void {
		this.storeSession(null);
	}

	setUserData(user: any, token?: string | null): void {
		const authUser = this.mapToAuthUser(user as Record<string, unknown>);
		this.storeSession(authUser, token ?? this.getToken());
	}

	isAuthenticated(): boolean {
		return !!this.getToken();
	}

	getToken(): string | null {
		return localStorage.getItem(this.TOKEN_KEY);
	}

	getCurrentUser(): AuthUser | null {
		return this.currentUserSubject.value;
	}

	getUserRole(): string | null {
		const stored = localStorage.getItem(this.ROLE_KEY);
		if (stored) {
			return stored;
		}
		const user = this.currentUserSubject.value;
		if (!user) {
			return null;
		}
		return user.esAdmin ? 'admin' : 'cliente';
	}

	isAdmin(): boolean {
		return this.getUserRole() === 'admin';
	}

	canAccess(routePath: string): boolean {
		if (!this.isAuthenticated()) {
			return false;
		}
		const normalized = (routePath ?? '').replace(/^\//, '');
		const segment = normalized.split('/')[0];
		if (!segment) {
			return true;
		}
		const allowedRoles = this.routePermissions[segment];
		if (!allowedRoles) {
			return true;
		}
		const role = this.getUserRole() ?? 'cliente';
		return allowedRoles.includes(role as 'admin' | 'cliente');
	}

	private persistLogin(response: LoginResponse): void {
		const authUser = this.mapToAuthUser(response.usuario ?? response.nombre_usuario ?? response);
		const tokenStr = (response.access_token as string | undefined) ?? (response.clave as string | undefined) ?? null;
		const roleFromToken = this.extractRoleFromToken(tokenStr);
		const finalUser = roleFromToken
			? { ...authUser, esAdmin: roleFromToken === 'admin', rol: roleFromToken }
			: authUser;

		console.log('💾 Guardando sesión...');
		if (tokenStr) {
			console.log('Token recibido:', tokenStr.substring(0, 20) + '...');
		} else {
			console.log('Token recibido: <vacío>');
		}
		console.log('Usuario mapeado:', finalUser);

		this.storeSession(finalUser, tokenStr);

		// Verificar que se guardó correctamente
		const storedToken = localStorage.getItem(this.TOKEN_KEY);
		console.log('✅ Token guardado en localStorage:', storedToken ? 'Sí' : 'No');
	}

	private storeSession(user: AuthUser | null, token?: string | null): void {
		if (user && token) {
			const normalizedRole = (user.rol ?? (user.esAdmin ? 'admin' : 'cliente')) as 'admin' | 'cliente';
			const normalizedUser: AuthUser = { ...user, rol: normalizedRole, esAdmin: normalizedRole === 'admin' };
			
			localStorage.setItem(this.TOKEN_KEY, token);
			localStorage.setItem(this.USER_KEY, JSON.stringify(normalizedUser));
			localStorage.setItem(this.ROLE_KEY, normalizedRole);
			
			this.currentUserSubject.next(normalizedUser);
		} else {
			localStorage.removeItem(this.TOKEN_KEY);
			localStorage.removeItem(this.USER_KEY);
			localStorage.removeItem(this.ROLE_KEY);
			this.currentUserSubject.next(null);
		}
	}

	private loadUserFromStorage(): AuthUser | null {
		const raw = localStorage.getItem(this.USER_KEY);
		if (!raw) {
			return null;
		}
		try {
			return JSON.parse(raw) as AuthUser;
		} catch {
			localStorage.removeItem(this.USER_KEY);
			return null;
		}
	}

	private mapToAuthUser(raw: unknown): AuthUser {
		const base = (raw as Record<string, unknown>) ?? {};
		const nested = (base['usuario'] ?? base['user'] ?? base['nombre_usuario']) as Record<string, unknown> | undefined;
		const source = nested ?? base;

		const rawRole = this.resolveString(source, ['rol', 'rol_nombre', 'nombre_rol']);
		const normalizedRole = rawRole?.toLowerCase();
		const esAdmin =
			this.resolveBoolean(source, ['esAdmin', 'es_admin', 'es-admin']) ??
			(normalizedRole?.includes('admin') ? true : undefined);

		return {
			id: this.resolveString(source, ['id', 'usuario_id']) ?? '',
			nombre: this.resolveString(source, ['nombre']) ?? '',
			apellido: this.resolveString(source, ['apellido']) ?? '',
			email: this.resolveString(source, ['email']) ?? '',
			nombreUsuario: this.resolveString(source, ['nombre_usuario', 'username', 'userName']),
			activo: this.resolveBoolean(source, ['activo']),
			esAdmin,
			rol: normalizedRole?.includes('admin') ? 'admin' : normalizedRole?.includes('cliente') ? 'cliente' : rawRole,
			fechaCreacion: this.resolveString(source, ['fecha_creacion', 'fechaCreacion']),
			fechaEdicion: this.resolveString(source, ['fecha_actualizacion', 'fecha_actualizada', 'fecha_edicion', 'fechaActualizacion'])
		};
	}

	private resolveString(source: Record<string, unknown>, keys: string[]): string | undefined {
		for (const key of keys) {
			const value = source[key];
			if (typeof value === 'string' && value.trim() !== '') {
				return value;
			}
		}
		return undefined;
	}

	private resolveBoolean(source: Record<string, unknown>, keys: string[]): boolean | undefined {
		for (const key of keys) {
			const value = source[key];
			if (typeof value === 'boolean') {
				return value;
			}
			if (typeof value === 'number') {
				return value !== 0;
			}
			if (typeof value === 'string') {
				const normalized = value.toLowerCase();
				if (['true', '1', 'si', 'sí'].includes(normalized)) {
					return true;
				}
				if (['false', '0', 'no'].includes(normalized)) {
					return false;
				}
			}
		}
		return undefined;
	}

	private extractRoleFromToken(token: string | null): 'admin' | 'cliente' | null {
		if (!token || typeof atob !== 'function') {
			return null;
		}
		try {
			const payloadSegment = token.split('.')[1];
			if (!payloadSegment) {
				return null;
			}
			const payload = JSON.parse(atob(payloadSegment)) as Record<string, unknown>;
			const rawRole = (payload['rol'] ?? payload['role'] ?? payload['rol_nombre']) as string | undefined;
			const normalizedRole = rawRole?.toLowerCase();
			if (normalizedRole?.includes('admin')) {
				return 'admin';
			}
			if (normalizedRole?.includes('cliente') || normalizedRole?.includes('client')) {
				return 'cliente';
			}
			const esAdmin = payload['es_admin'];
			if (typeof esAdmin === 'boolean') {
				return esAdmin ? 'admin' : 'cliente';
			}
		} catch (error) {
			console.warn('No fue posible extraer el rol del token', error);
		}
		return null;
	}
}
