import { Injectable, inject, signal, computed } from '@angular/core';
import { ProductService, OrderService, InvoiceService } from './index';
import { AppNotification } from '../models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly productService = inject(ProductService);
  private readonly orderService   = inject(OrderService);
  private readonly invoiceService = inject(InvoiceService);

  notifications = signal<AppNotification[]>([]);
  isLoading     = signal<boolean>(false);

  count = computed(() => this.notifications().length);

  load(): void {
    this.isLoading.set(true);
    const result: AppNotification[] = [];

    this.productService.getAll(1, 100).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          response.data
            .filter(product => product.stock.below_minimum || product.stock.out_of_stock)
            .forEach(product => {
              result.push({
                id:         `stock-${product.id}`,
                type:       'stock',
                title:      product.stock.out_of_stock ? 'Rupture de stock' : 'Stock bas',
                message:    `${product.name} — ${product.stock.quantity} restant(s)`,
                link:       '/products',
                icon:       'bi-box-seam-fill',
                colorClass: product.stock.out_of_stock ? 'text-danger' : 'text-warning'
              });
            });
          this.notifications.set([...result]);
        }
      }
    });

    this.orderService.getAll(1, 100).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          response.data
            .filter(order => order.status.code === 'pending')
            .forEach(order => {
              result.push({
                id:         `order-${order.id}`,
                type:       'order',
                title:      'Commande en attente',
                message:    `${order.number} — ${order.totalAmount.amount} ${order.totalAmount.currency}`,
                link:       '/orders',
                icon:       'bi-hourglass-split',
                colorClass: 'text-info'
              });
            });
          this.notifications.set([...result]);
        }
      }
    });

    this.invoiceService.getAll(1, 100).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          response.data
            .filter(invoice => invoice.dates.isOverdue)
            .forEach(invoice => {
              result.push({
                id:         `invoice-${invoice.id}`,
                type:       'invoice',
                title:      'Facture en retard',
                message:    `${invoice.number} — ${invoice.amounts.inclTax.amount} ${invoice.amounts.inclTax.currency}`,
                link:       '/invoices',
                icon:       'bi-exclamation-triangle-fill',
                colorClass: 'text-danger'
              });
            });
          this.notifications.set([...result]);
        }
        this.isLoading.set(false);
      }
    });
  }
}
