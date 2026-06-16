import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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

    return this.http.get<any>(this.endpoint, { params }).pipe(
      map(response => ({
        ...response,
        data: response.data?.map(this.mapToProduct) ?? []
      }))
    );
  }

  getById(id: string): Observable<ApiResponse<Product>> {
    return this.http.get<any>(`${this.endpoint}/${id}`).pipe(
      map(response => ({
        ...response,
        data: response.data ? this.mapToProduct(response.data) : null
      }))
    );
  }

  create(createProductDto: CreateProductDto): Observable<ApiResponse<Product>> {
    return this.http.post<any>(this.endpoint, createProductDto).pipe(
      map(response => ({
        ...response,
        data: response.data ? this.mapToProduct(response.data) : null
      }))
    );
  }

  updateStock(id: string, updateStockDto: UpdateStockDto): Observable<ApiResponse<Product>> {
    return this.http.patch<any>(`${this.endpoint}/${id}/stock`, updateStockDto).pipe(
      map(response => ({
        ...response,
        data: response.data ? this.mapToProduct(response.data) : null
      }))
    );
  }

  private mapToProduct(raw: any): Product {
    return {
      id:          raw.id,
      name:        raw.name,
      reference:   raw.reference,
      description: raw.description,
      price: {
        amount:   raw.price.amount,
        currency: raw.price.currency
      },
      stock: {
        quantity:      raw.stock.quantity,
        minimum:       raw.stock.minimum,
        available:     raw.stock.available,
        below_minimum: raw.stock.below_minimum,
        out_of_stock:  raw.stock.out_of_stock
      },
      isActive:  raw.is_active,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at
    };
  }
}
