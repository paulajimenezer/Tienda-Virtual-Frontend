import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pedido, PedidoCreate, PedidoFilters, PedidoUpdate } from '../../shared/models/pedido.model';

@Injectable({ providedIn: 'root' })
export class PedidoService {
	private readonly apiUrl = `${environment.apiUrl}/pedidos`;

	constructor(private http: HttpClient) {}

	list(filters?: PedidoFilters): Observable<Pedido[]> {
		let params = new HttpParams();
		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined && value !== null && value !== '') {
					params = params.set(key, String(value));
				}
			});
		}
		return this.http.get<Pedido[]>(this.apiUrl, { params });
	}

	getById(id: string): Observable<Pedido> {
		return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
	}

	listByUsuario(usuarioId: string): Observable<Pedido[]> {
		return this.http.get<Pedido[]>(`${this.apiUrl}/usuario/${usuarioId}`);
	}

	searchByNombre(nombre: string): Observable<Pedido[]> {
		const encoded = encodeURIComponent(nombre.trim());
		return this.http.get<Pedido[]>(`${this.apiUrl}/buscar/${encoded}`);
	}

	create(payload: PedidoCreate): Observable<Pedido> {
		return this.http.post<Pedido>(this.apiUrl, payload);
	}

	update(id: string, payload: PedidoUpdate): Observable<Pedido> {
		return this.http.put<Pedido>(`${this.apiUrl}/${id}`, payload);
	}

	delete(id: string): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}
}
