import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Product, CreateProductDto, UpdateStockDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = '/api/v1/products';

  getAll(page: number = 1, limit: number = 10): Observable<ApiResponse<Product[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    return this.http.get<ApiResponse<Product[]>>(this.endpoint, { params });
  }

  getById(id: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.endpoint}/${id}`);
  }

  create(dto: CreateProductDto): Observable<ApiResponse<Product>> {
    const payload = {
      name: dto.name,
      reference: dto.reference,
      description: dto.description,
      price: dto.price,
      quantity_stock: dto.stockQuantity,
      stock_minimum: dto.stockMinimum,
      currency: dto.currency
    };

    return this.http.post<ApiResponse<Product>>(this.endpoint, payload);
  }

  updateStock(id: string, dto: UpdateStockDto): Observable<ApiResponse<Product>> {
    const payload = { quantity: dto.quantity };

    return this.http.patch<ApiResponse<Product>>(`${this.endpoint}/${id}/stock`, payload);
  }
}
