import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Carrito, CarritoCreate, CarritoFilters, CarritoUpdate } from '../../shared/models/carrito.model';

@Injectable({ providedIn: 'root' })
export class CarritoService {
	private readonly apiUrl = `${environment.apiUrl}/carritos`;

	constructor(private http: HttpClient) {}

	list(filters?: CarritoFilters): Observable<Carrito[]> {
		let params = new HttpParams();
		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined && value !== null && value !== '') {
					params = params.set(key, String(value));
				}
			});
		}
		return this.http.get<Carrito[]>(this.apiUrl, { params });
	}

	listByUsuario(usuarioId: string): Observable<Carrito[]> {
		return this.http.get<Carrito[]>(`${this.apiUrl}/by-user/${usuarioId}`);
	}

	getById(id: string): Observable<Carrito> {
		return this.http.get<Carrito>(`${this.apiUrl}/${id}`);
	}

	create(payload: CarritoCreate): Observable<Carrito> {
		return this.http.post<Carrito>(this.apiUrl, payload);
	}

	update(id: string, payload: CarritoUpdate): Observable<Carrito> {
		return this.http.put<Carrito>(`${this.apiUrl}/${id}`, payload);
	}

	delete(id: string): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}
}
