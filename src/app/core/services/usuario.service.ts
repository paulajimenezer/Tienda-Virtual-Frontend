import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Usuario, UsuarioCreate, UsuarioFilters, UsuarioUpdate } from '../../shared/models/usuario.model';
import { PaginationParams } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
	private readonly endpoint = '/usuarios';

	constructor(private apiService: ApiService) {}

	list(pagination?: PaginationParams, filters?: UsuarioFilters): Observable<Usuario[]> {
		const params = this.normalizeFilters(filters);
		if (pagination) {
			return this.apiService.getPaginated<Usuario>(this.endpoint, pagination, params);
		}
		return this.apiService.get<Usuario[]>(this.endpoint, params);
	}

	/** Compat: createUsuario (wrapper antiguo) */
	createUsuario(payload: any) {
		// Map legacy fields to the new UsuarioCreate shape when possible
		const mapped = {
			nombre: payload.nombre ?? payload.nombre_usuario ?? '',
			apellido: payload.apellido ?? '',
			email: payload.email ?? payload.nombre_usuario ?? '',
			password: payload.password ?? payload.contrasena ?? '',
			numero_documento: payload.numero_documento ?? '',
			id_rol: payload.id_rol ?? payload.rol ?? 'cliente',
			id_tipo_documento: payload.id_tipo_documento ?? payload.tipo_documento ?? '',
			id_sexo: payload.id_sexo ?? null,
			id_usuario_crea: payload.id_usuario_crea ?? null
		};
		return this.create(mapped);
	}

	getById(id: string): Observable<Usuario> {
		return this.apiService.get<Usuario>(`${this.endpoint}/${id}`);
	}

	create(payload: UsuarioCreate): Observable<Usuario> {
		return this.apiService.post<Usuario>(this.endpoint, payload);
	}

	update(id: string, payload: UsuarioUpdate): Observable<Usuario> {
		return this.apiService.put<Usuario>(`${this.endpoint}/${id}`, payload);
	}

	delete(id: string): Observable<void> {
		return this.apiService.delete<void>(`${this.endpoint}/${id}`);
	}

	desactivar(id: string): Observable<Usuario> {
		return this.apiService.patch<Usuario>(`${this.endpoint}/${id}/desactivar`, {});
	}

	private normalizeFilters(filters?: UsuarioFilters): Record<string, string> | undefined {
		if (!filters) {
			return undefined;
		}
		const entries = Object.entries(filters)
			.filter(([, value]) => value !== undefined && value !== null && value !== '')
			.map(([key, value]) => [key, String(value)] as const);
		return entries.length ? Object.fromEntries(entries) : undefined;
	}
}
