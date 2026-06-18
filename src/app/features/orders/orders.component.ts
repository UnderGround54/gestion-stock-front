import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../core/services';
import { ToastService } from '../../shared/services';
import { Order, Pagination } from '../../core/models';
import { OrderFormComponent } from './components/order-form/order-form.component';
import { OrderDetailComponent } from './components/order-detail/order-detail.component';
import { ConfirmModalComponent, ConfirmModalConfig } from '../../shared/components';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    OrderFormComponent,
    OrderDetailComponent,
    ConfirmModalComponent
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly toastService = inject(ToastService);

  orders           = signal<Order[]>([]);
  pagination       = signal<Pagination | null>(null);
  isLoading        = signal<boolean>(false);
  showForm         = signal<boolean>(false);
  currentPage      = signal<number>(1);
  selectedOrderId  = signal<string | null>(null);
  orderToConfirm   = signal<Order | null>(null);
  showConfirmModal = signal<boolean>(false);

  confirmConfig: ConfirmModalConfig = {
    title:        'Confirmer la commande',
    message:      '',
    confirmLabel: 'Confirmer',
    cancelLabel:  'Annuler',
    type:         'info'
  };

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);

    this.orderService.getAll(this.currentPage(), 10).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.orders.set(response.data);
          this.pagination.set(response.meta?.pagination ?? null);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Erreur lors du chargement des commandes.';
        this.toastService.error(message);
        this.isLoading.set(false);
      }
    });
  }

  onOrderCreated(message: string): void {
    this.showForm.set(false);
    this.toastService.success(message);
    this.loadOrders();
  }

  onViewDetail(order: Order): void {
    this.selectedOrderId.set(order.id);
  }

  onDrawerClosed(): void {
    this.selectedOrderId.set(null);
  }

  onConfirmClick(order: Order): void {
    this.orderToConfirm.set(order);
    this.confirmConfig = {
      title:        'Confirmer la commande',
      message:      `Voulez-vous confirmer la commande "${order.number}" ?`,
      confirmLabel: 'Confirmer',
      cancelLabel:  'Annuler',
      type:         'info'
    };
    this.showConfirmModal.set(true);
  }

  onConfirmOrder(): void {
    const order = this.orderToConfirm();
    if (!order) return;

    this.orderService.confirm(order.id).subscribe({
      next: (response) => {
        this.showConfirmModal.set(false);
        this.orderToConfirm.set(null);
        this.toastService.success(response.message ?? 'Commande confirmée avec succès.');
        this.loadOrders();
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Erreur lors de la confirmation.';
        this.toastService.error(message);
        this.showConfirmModal.set(false);
      }
    });
  }

  onConfirmCancelled(): void {
    this.showConfirmModal.set(false);
    this.orderToConfirm.set(null);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadOrders();
  }

  getStatusClass(code: string): string {
    const classes: Record<string, string> = {
      pending:   'bg-warning-subtle text-warning',
      confirmed: 'bg-info-subtle text-info',
      shipped:   'bg-primary-subtle text-primary',
      delivered: 'bg-success-subtle text-success'
    };
    return classes[code] ?? 'bg-secondary-subtle text-secondary';
  }
}
