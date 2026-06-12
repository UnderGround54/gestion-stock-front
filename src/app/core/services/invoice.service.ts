import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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

    return this.http.get<ApiResponse<Invoice[]>>(this.endpoint, { params });
  }

  getById(id: string): Observable<ApiResponse<Invoice>> {
    return this.http.get<ApiResponse<Invoice>>(`${this.endpoint}/${id}`);
  }

  generate(orderId: string, generateInvoiceDto: GenerateInvoiceDto): Observable<ApiResponse<Invoice>> {
    const payload = {vat_rate: generateInvoiceDto.vatRate};

    return this.http.post<ApiResponse<Invoice>>(
      `${this.endpoint}/orders/${orderId}/generate`,
      payload
    );
  }

  markAsPaid(id: string): Observable<ApiResponse<Invoice>> {
    return this.http.patch<ApiResponse<Invoice>>(`${this.endpoint}/${id}/pay`, {});
  }
}
