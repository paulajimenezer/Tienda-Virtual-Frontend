import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Factura, FacturaCreate, FacturaFilters, FacturaUpdate } from '../../shared/models/factura.model';

@Injectable({ providedIn: 'root' })
export class FacturaService {
	private readonly apiUrl = `${environment.apiUrl}/facturas`;

	constructor(private http: HttpClient) {}

	list(filters?: FacturaFilters): Observable<Factura[]> {
		let params = new HttpParams();
		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined && value !== null && value !== '') {
					params = params.set(key, String(value));
				}
			});
		}
		return this.http.get<Factura[]>(this.apiUrl, { params });
	}

	listByUsuario(usuarioId: string): Observable<Factura[]> {
		return this.http.get<Factura[]>(`${this.apiUrl}/usuario/${usuarioId}`);
	}

	getById(id: string): Observable<Factura> {
		return this.http.get<Factura>(`${this.apiUrl}/${id}`);
	}

	create(payload: FacturaCreate): Observable<Factura> {
		return this.http.post<Factura>(this.apiUrl, payload);
	}

	update(id: string, payload: FacturaUpdate): Observable<Factura> {
		return this.http.put<Factura>(`${this.apiUrl}/${id}`, payload);
	}

	delete(id: string): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}
}
