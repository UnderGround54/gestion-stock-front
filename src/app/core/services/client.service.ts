import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
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

    return this.http.get<any>(this.endpoint, { params }).pipe(
      map(response => ({
        ...response,
        data: response.data?.map(this.mapToClient) ?? []
      }))
    );
  }

  getById(id: string): Observable<ApiResponse<Client>> {
    return this.http.get<any>(`${this.endpoint}/${id}`).pipe(
      map(response => ({
        ...response,
        data: response.data ? this.mapToClient(response.data) : null
      }))
    );
  }

  create(createClientDto: CreateClientDto): Observable<ApiResponse<Client>> {
    const payload = {
      firstName: createClientDto.firstName,
      lastName: createClientDto.lastName,
      email: createClientDto.email,
      address: createClientDto.address,
      phone: createClientDto.phone
    };

    return this.http.post<any>(this.endpoint, payload).pipe(
      map(response => ({
        ...response,
        data: response.data ? this.mapToClient(response.data) : null
      }))
    );
  }

  disable(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.endpoint}/${id}`);
  }

  private mapToClient(raw: any): Client {
    return {
      id:        raw.id,
      firstName: raw.first_name,
      lastName:  raw.last_name,
      fullName:  raw.full_name,
      email:     raw.email,
      phone:     raw.phone,
      address:   raw.address,
      isActive:  raw.is_active,
      createdAt:  raw.created_at,
      updatedAt:  raw.updated_at,
    };
  }
}
