import { Component, inject, input, output, signal, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../../../core/services';
import { ToastService } from '../../../../shared/services';
import { Invoice } from '../../../../core/models';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-detail.component.html',
  styleUrl: './invoice-detail.component.css'
})
export class InvoiceDetailComponent implements OnChanges {
  private readonly invoiceService = inject(InvoiceService);
  private readonly toastService   = inject(ToastService);

  invoiceId= input.required<string>();
  closed= output<void>();

  invoice= signal<Invoice | null>(null);
  isLoading= signal<boolean>(false);

  ngOnChanges(): void {
    this.loadInvoice();
  }

  loadInvoice(): void {
    this.isLoading.set(true);

    this.invoiceService.getById(this.invoiceId()).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.invoice.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Erreur lors du chargement de la facture.';
        this.toastService.error(message);
        this.isLoading.set(false);
        this.closed.emit();
      }
    });
  }

  getStatusClass(code: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-warning-subtle text-warning',
      paid:    'bg-success-subtle text-success',
      overdue: 'bg-danger-subtle text-danger'
    };
    return classes[code] ?? 'bg-secondary-subtle text-secondary';
  }

  onClose(): void {
    this.invoice.set(null);
    this.closed.emit();
  }
}
