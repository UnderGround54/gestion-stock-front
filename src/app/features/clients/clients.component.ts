import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../core/services';
import { Client, Pagination } from '../../core/models';
import { ClientFormComponent } from './components/client-form/client-form.component';
import { ConfirmModalComponent, ConfirmModalConfig } from '../../shared/components';
import {ToastService} from '../../shared/services';
import {ClientDetailComponent} from './components/client-detail/client-detail.component';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, ClientFormComponent, ConfirmModalComponent, ClientDetailComponent],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css'
})
export class ClientsComponent implements OnInit {
  private readonly clientService = inject(ClientService);
  private readonly toastService  = inject(ToastService);

  clients = signal<Client[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal<boolean>(false);
  showForm = signal<boolean>(false);
  currentPage = signal<number>(1);
  showConfirmModal = signal<boolean>(false);
  clientToDisable = signal<Client | null>(null);
  selectedClientId = signal<string | null>(null);

  confirmConfig: ConfirmModalConfig = {
    title: 'Désactiver le client',
    message: '',
    confirmLabel: 'Désactiver',
    cancelLabel: 'Annuler',
    type: 'danger'
  };

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading.set(true);

    this.clientService.getAll(this.currentPage(), 10).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.clients.set(response.data);
          this.pagination.set(response.meta?.pagination ?? null);
        }
        this.isLoading.set(false);
      },
      error: (response) => {
        const message = response?.error?.message ?? 'Erreur lors du chargement des clients.';
        this.toastService.error(message);
        this.isLoading.set(false);
      }
    });
  }

  onClientCreated(message: string): void {
    this.showForm.set(false);
    this.toastService.success(message);
    this.loadClients();
  }

  onDisableClick(client: Client): void {
    this.clientToDisable.set(client);
    this.confirmConfig = {
      title: 'Désactiver le client',
      message: `Voulez-vous vraiment désactiver "${client.firstName} ${client.lastName}" ?`,
      confirmLabel: 'Désactiver',
      cancelLabel: 'Annuler',
      type: 'danger'
    };
    this.showConfirmModal.set(true);
  }

  onDisableConfirmed(): void {
    const client = this.clientToDisable();
    if (!client) {
      this.toastService.error('Client invalide.');
      return;
    }

    this.clientService.disable(client.id).subscribe({
      next: (response) => {
        this.showConfirmModal.set(false);
        this.clientToDisable.set(null);
        this.toastService.success(response.message ?? 'Client désactivé avec succès.');
        this.loadClients();
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Erreur lors de la désactivation.';
        this.toastService.error(message);
        this.showConfirmModal.set(false);
      }
    });
  }

  onDisableCancelled(): void {
    this.showConfirmModal.set(false);
    this.clientToDisable.set(null);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadClients();
  }

  onViewDetail(client: Client): void {
    this.selectedClientId.set(client.id);
  }

  onDrawerClosed(): void {
    this.selectedClientId.set(null);
  }
}
