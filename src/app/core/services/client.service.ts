import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Client, CreateClientDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = '/api/v1/clients';

  getAll(page: number = 1, limit: number = 10): Observable<ApiResponse<Client[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    return this.http.get<ApiResponse<Client[]>>(this.endpoint, { params });
  }

  getById(id: string): Observable<ApiResponse<Client>> {
    return this.http.get<ApiResponse<Client>>(`${this.endpoint}/${id}`);
  }

  create(createClientDto: CreateClientDto): Observable<ApiResponse<Client>> {
    const payload = {
      first_name: createClientDto.firstName,
      last_name: createClientDto.lastName,
      email: createClientDto.email,
      address: createClientDto.address,
      phone: createClientDto.phone
    };

    return this.http.post<ApiResponse<Client>>(this.endpoint, payload);
  }

  disable(id: string): Observable<ApiResponse<Client>> {
    return this.http.delete<ApiResponse<Client>>(`${this.endpoint}/${id}`);
  }
}
