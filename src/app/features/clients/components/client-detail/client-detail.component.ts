import {Component, inject, input, output, OnChanges, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../../../core/services';
import { Client } from '../../../../core/models';
import {ToastService} from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-detail.component.html',
  styleUrl: './client-detail.component.css'
})
export class ClientDetailComponent implements OnChanges {
  private readonly clientService = inject(ClientService);
  private readonly toastService  = inject(ToastService);

  clientId = input.required<string>();
  closed= output<void>();

  client= signal<Client | null>(null);
  isLoading= signal<boolean>(false);

  ngOnChanges(): void {
    this.loadClient();
  }

  loadClient(): void {
    this.isLoading.set(true);

    this.clientService.getById(this.clientId()).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.client.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Erreur lors du chargement du client.';
        this.toastService.error(message);
        this.isLoading.set(false);
        this.closed.emit();
      }
    });
  }

  onClose(): void {
    this.client.set(null);
    this.closed.emit();
  }
}
