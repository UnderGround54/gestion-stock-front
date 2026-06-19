import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../core/services';
import { ToastService } from '../../shared/services';
import { Invoice, Pagination } from '../../core/models';
import { InvoiceFormComponent } from './components/invoice-form/invoice-form.component';
import { InvoiceDetailComponent } from './components/invoice-detail/invoice-detail.component';
import { ConfirmModalComponent, ConfirmModalConfig } from '../../shared/components';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [
    CommonModule,
    InvoiceFormComponent,
    InvoiceDetailComponent,
    ConfirmModalComponent
  ],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.css'
})
export class InvoicesComponent implements OnInit {
  private readonly invoiceService = inject(InvoiceService);
  private readonly toastService   = inject(ToastService);

  invoices            = signal<Invoice[]>([]);
  pagination          = signal<Pagination | null>(null);
  isLoading           = signal<boolean>(false);
  showForm            = signal<boolean>(false);
  currentPage         = signal<number>(1);
  selectedInvoiceId   = signal<string | null>(null);
  invoiceToPay        = signal<Invoice | null>(null);
  showConfirmModal    = signal<boolean>(false);

  confirmConfig: ConfirmModalConfig = {
    title:        'Marquer comme payée',
    message:      '',
    confirmLabel: 'Confirmer le paiement',
    cancelLabel:  'Annuler',
    type:         'info'
  };

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.isLoading.set(true);

    this.invoiceService.getAll(this.currentPage(), 10).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.invoices.set(response.data);
          this.pagination.set(response.meta?.pagination ?? null);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Erreur lors du chargement des factures.';
        this.toastService.error(message);
        this.isLoading.set(false);
      }
    });
  }

  onInvoiceGenerated(message: string): void {
    this.showForm.set(false);
    this.toastService.success(message);
    this.loadInvoices();
  }

  onViewDetail(invoice: Invoice): void {
    this.selectedInvoiceId.set(invoice.id);
  }

  onDrawerClosed(): void {
    this.selectedInvoiceId.set(null);
  }

  onPayClick(invoice: Invoice): void {
    this.invoiceToPay.set(invoice);
    this.confirmConfig = {
      title:        'Marquer comme payée',
      message:      `Confirmer le paiement de la facture "${invoice.number}" ?`,
      confirmLabel: 'Confirmer le paiement',
      cancelLabel:  'Annuler',
      type:         'info'
    };
    this.showConfirmModal.set(true);
  }

  onPayConfirmed(): void {
    const invoice = this.invoiceToPay();
    if (!invoice) return;

    this.invoiceService.markAsPaid(invoice.id).subscribe({
      next: (response) => {
        this.showConfirmModal.set(false);
        this.invoiceToPay.set(null);
        this.toastService.success(response.message ?? 'Facture marquée comme payée.');
        this.loadInvoices();
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Erreur lors du paiement.';
        this.toastService.error(message);
        this.showConfirmModal.set(false);
      }
    });
  }

  onPayCancelled(): void {
    this.showConfirmModal.set(false);
    this.invoiceToPay.set(null);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadInvoices();
  }

  getStatusClass(code: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-warning-subtle text-warning',
      paid:    'bg-success-subtle text-success',
      overdue: 'bg-danger-subtle text-danger'
    };
    return classes[code] ?? 'bg-secondary-subtle text-secondary';
  }
}
