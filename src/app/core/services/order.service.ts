import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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

    return this.http.get<any>(this.endpoint, { params }).pipe(
      map(response => ({
        ...response,
        data: response.data?.map(this.mapToOrder) ?? []
      }))
    );
  }

  getById(id: string): Observable<ApiResponse<Order>> {
    return this.http.get<any>(`${this.endpoint}/${id}`).pipe(
      map(response => ({
        ...response,
        data: response.data ? this.mapToOrder(response.data) : null
      }))
    );
  }

  create(dto: CreateOrderDto): Observable<ApiResponse<Order>> {
    const payload = {
      client_id:     dto.clientId,
      customer_note: dto.customerNote,
      order_lines:   dto.orderLines.map(line => ({
        product_id: line.productId,
        quantity:   line.quantity
      }))
    };

    return this.http.post<any>(this.endpoint, payload).pipe(
      map(response => ({
        ...response,
        data: response.data ? this.mapToOrder(response.data) : null
      }))
    );
  }

  confirm(id: string): Observable<ApiResponse<Order>> {
    return this.http.patch<any>(`${this.endpoint}/${id}/confirm`, {}).pipe(
      map(response => ({
        ...response,
        data: response.data ? this.mapToOrder(response.data) : null
      }))
    );
  }

  private mapToOrder(raw: any): Order {
    return {
      id:           raw.id,
      number:       raw.number,
      clientId:     raw.client_id,
      status:       {
        code:  raw.status.code,
        label: raw.status.label
      },
      orderLines:   raw.order_lines?.map((line: any) => ({
        id:          line.id,
        productId:   line.product_id,
        productName: line.product_name,
        reference:   line.reference,
        quantity:    line.quantity,
        unitPrice:   line.unit_price,
        subTotal:    line.sub_total
      })) ?? [],
      totalAmount:  raw.total_amount,
      customerNote: raw.customer_note,
      createdAt:    raw.created_at,
      updatedAt:    raw.updated_at
    };
  }
}
