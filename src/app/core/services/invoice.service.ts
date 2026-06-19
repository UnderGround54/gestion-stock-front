import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse, Invoice, GenerateInvoiceDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = '/api/v1/invoices';

  getAll(page: number = 1, limit: number = 10): Observable<ApiResponse<Invoice[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    return this.http.get<any>(this.endpoint, { params }).pipe(
      map(response => ({
        ...response,
        data: response.data?.map(this.mapToInvoice) ?? []
      }))
    );
  }

  getById(id: string): Observable<ApiResponse<Invoice>> {
    return this.http.get<any>(`${this.endpoint}/${id}`).pipe(
      map(response => ({
        ...response,
        data: response.data ? this.mapToInvoice(response.data) : null
      }))
    );
  }

  generate(orderId: string, dto: GenerateInvoiceDto): Observable<ApiResponse<Invoice>> {
    return this.http.post<any>(`${this.endpoint}/orders/${orderId}/generate`, dto).pipe(
      map(response => ({
        ...response,
        data: response.data ? this.mapToInvoice(response.data) : null
      }))
    );
  }

  markAsPaid(id: string): Observable<ApiResponse<Invoice>> {
    return this.http.patch<any>(`${this.endpoint}/${id}/pay`, {}).pipe(
      map(response => ({
        ...response,
        data: response.data ? this.mapToInvoice(response.data) : null
      }))
    );
  }

  private mapToInvoice(raw: any): Invoice {
    return {
      id:        raw.id,
      number:    raw.number,
      orderId:   raw.order_id,
      clientId:  raw.client_id,
      status: {
        code:  raw.status.code,
        label: raw.status.label
      },
      amounts: {
        exclTax: raw.amounts.excl_tax,
        taxRate: raw.amounts.tax_rate,
        tax:     raw.amounts.tax,
        inclTax: raw.amounts.incl_tax
      },
      dates: {
        dueDate:   raw.dates.due_date,
        paidAt:    raw.dates.paid_at,
        isOverdue: raw.dates.is_overdue
      },
      createdAt: raw.created_at,
      updatedAt: raw.updated_at
    };
  }
}
