import { Component, inject, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule} from '@angular/forms';
import { InvoiceService, OrderService } from '../../../../core/services';
import { ToastService } from '../../../../shared/services';
import { GenerateInvoiceDto, Order } from '../../../../core/models';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './invoice-form.component.html',
  styleUrl: './invoice-form.component.css'
})
export class InvoiceFormComponent implements OnInit {
  private readonly invoiceService = inject(InvoiceService);
  private readonly orderService   = inject(OrderService);
  private readonly toastService   = inject(ToastService);
  private readonly fb             = inject(FormBuilder);

  invoiceGenerated = output<string>();
  cancelled        = output<void>();

  isLoading = signal<boolean>(false);
  orders    = signal<Order[]>([]);

  form: FormGroup = this.fb.group({
    orderId: ['', [Validators.required]],
    taxRate: [20, [Validators.required, Validators.min(0), Validators.max(100)]]
  });

  get orderId() { return this.form.get('orderId')!; }
  get taxRate() { return this.form.get('taxRate')!; }

  ngOnInit(): void {
    this.loadConfirmedOrders();
  }

  loadConfirmedOrders(): void {
    this.orderService.getAll(1, 100).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.orders.set(
            response.data.filter(order => order.status.code === 'confirmed')
          );
        }
      }
    });
  }

  getSelectedOrder(): Order | undefined {
    return this.orders().find(order => order.id === this.orderId.value);
  }

  getTaxAmount(): number {
    const order = this.getSelectedOrder();
    if (!order) return 0;
    return (order.totalAmount.amount * this.taxRate.value) / 100;
  }

  getTotalWithTax(): number {
    const order = this.getSelectedOrder();
    if (!order) return 0;
    return order.totalAmount.amount + this.getTaxAmount();
  }

  isInvalid(field: ReturnType<FormGroup['get']>): boolean {
    return !!(field?.invalid && field?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const generateInvoiceDto: GenerateInvoiceDto = { taxRate: this.taxRate.value };

    this.invoiceService.generate(this.orderId.value, generateInvoiceDto).subscribe({
      next: (response) => {
        if (response.success) {
          this.form.reset({ taxRate: 20 });
          this.invoiceGenerated.emit(response.message ?? 'Facture générée avec succès.');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Erreur lors de la génération de la facture.';
        this.toastService.error(message);
        this.isLoading.set(false);
      }
    });
  }

  onCancel(): void {
    this.form.reset({ taxRate: 20 });
    this.cancelled.emit();
  }
}
