import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Descuento, DescuentoCreate, DescuentoFilters, DescuentoUpdate } from '../../shared/models/descuento.model';

@Injectable({ providedIn: 'root' })
export class DescuentoService {
	private readonly apiUrl = `${environment.apiUrl}/descuentos`;

	constructor(private http: HttpClient) {}

	list(filters?: DescuentoFilters): Observable<Descuento[]> {
		let params = new HttpParams();
		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined && value !== null && value !== '') {
					params = params.set(key, String(value));
				}
			});
		}
		return this.http.get<Descuento[]>(this.apiUrl, { params });
	}

	getById(id: string): Observable<Descuento> {
		return this.http.get<Descuento>(`${this.apiUrl}/${id}`);
	}

	getByCodigo(codigo: string): Observable<Descuento> {
		const encoded = encodeURIComponent(codigo.trim());
		return this.http.get<Descuento>(`${this.apiUrl}/codigo/${encoded}`);
	}

	create(payload: DescuentoCreate): Observable<Descuento> {
		return this.http.post<Descuento>(this.apiUrl, payload);
	}

	update(id: string, payload: DescuentoUpdate): Observable<Descuento> {
		return this.http.put<Descuento>(`${this.apiUrl}/${id}`, payload);
	}

	delete(id: string): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}
}
