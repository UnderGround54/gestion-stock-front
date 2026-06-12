import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Order, CreateOrderDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = '/api/v1/orders';

  getAll(page: number = 1, limit: number = 10): Observable<ApiResponse<Order[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    return this.http.get<ApiResponse<Order[]>>(this.endpoint, { params });
  }

  getById(id: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.endpoint}/${id}`);
  }

  create(createOrderDto: CreateOrderDto): Observable<ApiResponse<Order>> {
    const payload = {
      client_id: createOrderDto.clientId,
      note: createOrderDto.note,
      lines: createOrderDto.lines.map(line => ({
        product_id: line.productId,
        quantity: line.quantity
      }))
    };

    return this.http.post<ApiResponse<Order>>(this.endpoint, payload);
  }

  confirm(id: string): Observable<ApiResponse<Order>> {
    return this.http.patch<ApiResponse<Order>>(`${this.endpoint}/${id}`, { });
  }
}
