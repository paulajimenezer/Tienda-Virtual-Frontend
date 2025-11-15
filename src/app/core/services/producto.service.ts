import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Producto, ProductoCreate, ProductoFilters, ProductoUpdate } from '../../shared/models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
	private readonly apiUrl = `${environment.apiUrl}/productos`;

	constructor(private http: HttpClient) {}

	list(filters?: ProductoFilters): Observable<Producto[]> {
		let params = new HttpParams();
		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined && value !== null && value !== '') {
					params = params.set(key, String(value));
				}
			});
		}
		return this.http.get<Producto[]>(this.apiUrl, { params });
	}

	getById(id: string): Observable<Producto> {
		return this.http.get<Producto>(`${this.apiUrl}/${id}`);
	}

	listByUsuario(usuarioId: string): Observable<Producto[]> {
		return this.http.get<Producto[]>(`${this.apiUrl}/usuario/${usuarioId}`);
	}

	getByCategoria(categoriaId: string): Observable<Producto[]> {
		return this.http.get<Producto[]>(`${this.apiUrl}/categoria/${categoriaId}`);
	}

	searchByNombre(nombre: string): Observable<Producto[]> {
		const encoded = encodeURIComponent(nombre.trim());
		return this.http.get<Producto[]>(`${this.apiUrl}/buscar/${encoded}`);
	}

	create(payload: ProductoCreate): Observable<Producto> {
		return this.http.post<Producto>(this.apiUrl, payload);
	}

	update(id: string, payload: ProductoUpdate): Observable<Producto> {
		return this.http.put<Producto>(`${this.apiUrl}/${id}`, payload);
	}

	delete(id: string): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}
}
