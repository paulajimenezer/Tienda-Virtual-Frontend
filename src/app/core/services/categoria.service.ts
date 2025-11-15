import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Categoria, CategoriaCreate, CategoriaFilters, CategoriaUpdate } from '../../shared/models/categoria.model';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
	private readonly apiUrl = `${environment.apiUrl}/categorias`;

	constructor(private http: HttpClient) {}

	list(filters?: CategoriaFilters): Observable<Categoria[]> {
		let params = new HttpParams();
		if (filters?.nombre) {
			params = params.set('nombre', filters.nombre);
		}
		return this.http.get<Categoria[]>(this.apiUrl, { params });
	}

	getById(id: string): Observable<Categoria> {
		return this.http.get<Categoria>(`${this.apiUrl}/${id}`);
	}

	getByNombre(nombre: string): Observable<Categoria> {
		const encoded = encodeURIComponent(nombre.trim());
		return this.http.get<Categoria>(`${this.apiUrl}/nombre/${encoded}`);
	}

	create(payload: CategoriaCreate): Observable<Categoria> {
		return this.http.post<Categoria>(this.apiUrl, payload);
	}

	update(id: string, payload: CategoriaUpdate): Observable<Categoria> {
		return this.http.put<Categoria>(`${this.apiUrl}/${id}`, payload);
	}

	delete(id: string): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}
}
