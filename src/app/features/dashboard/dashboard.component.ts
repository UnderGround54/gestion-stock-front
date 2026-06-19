import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientService, ProductService, OrderService, InvoiceService } from '../../core/services';
import { ToastService } from '../../shared/services';
import { Client, Product, Order, Invoice } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly clientService  = inject(ClientService);
  private readonly productService = inject(ProductService);
  private readonly orderService   = inject(OrderService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly toastService   = inject(ToastService);

  isLoading = signal<boolean>(true);

  clients  = signal<Client[]>([]);
  products = signal<Product[]>([]);
  orders   = signal<Order[]>([]);
  invoices = signal<Invoice[]>([]);

  // Stats calculées
  totalActiveClients = computed(() =>
    this.clients().filter(c => c.isActive).length
  );

  totalProducts = computed(() => this.products().length);

  pendingOrdersCount = computed(() =>
    this.orders().filter(o => o.status.code === 'pending').length
  );

  totalRevenue = computed(() =>
    this.invoices()
      .filter(i => i.status.code === 'paid')
      .reduce((sum, i) => sum + i.amounts.inclTax.amount, 0)
  );

  revenueCurrency = computed(() => {
    const paid = this.invoices().find(i => i.status.code === 'paid');
    return paid?.amounts.inclTax.currency ?? 'MGA';
  });

  lowStockProducts = computed(() =>
    this.products().filter(p => p.stock.below_minimum || p.stock.out_of_stock)
  );

  recentOrders = computed(() =>
    [...this.orders()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  );

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);

    this.clientService.getAll(1, 100).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.clients.set(response.data);
        }
      },
      error: () => this.toastService.error('Erreur lors du chargement des clients.')
    });

    this.productService.getAll(1, 100).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.products.set(response.data);
        }
      },
      error: () => this.toastService.error('Erreur lors du chargement des produits.')
    });

    this.orderService.getAll(1, 100).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.orders.set(response.data);
        }
      },
      error: () => this.toastService.error('Erreur lors du chargement des commandes.')
    });

    this.invoiceService.getAll(1, 100).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.invoices.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Erreur lors du chargement des factures.');
        this.isLoading.set(false);
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
}
