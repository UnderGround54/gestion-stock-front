import { Component, inject, input, output, signal, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../../core/services';
import { ToastService } from '../../../../shared/services';
import { Order } from '../../../../core/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css'
})
export class OrderDetailComponent implements OnChanges {
  private readonly orderService = inject(OrderService);
  private readonly toastService = inject(ToastService);

  orderId  = input.required<string>();
  closed   = output<void>();

  order     = signal<Order | null>(null);
  isLoading = signal<boolean>(false);

  ngOnChanges(): void {
    this.loadOrder();
  }

  loadOrder(): void {
    this.isLoading.set(true);

    this.orderService.getById(this.orderId()).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.order.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Erreur lors du chargement de la commande.';
        this.toastService.error(message);
        this.isLoading.set(false);
        this.closed.emit();
      }
    });
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

  onClose(): void {
    this.order.set(null);
    this.closed.emit();
  }
}
