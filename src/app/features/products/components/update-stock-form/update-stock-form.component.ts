import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule} from '@angular/forms';
import { ProductService } from '../../../../core/services';
import { ToastService } from '../../../../shared/services';
import { Product, UpdateStockDto } from '../../../../core/models';

@Component({
  selector: 'app-update-stock-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './update-stock-form.component.html',
  styleUrl: './update-stock-form.component.css'
})
export class UpdateStockFormComponent {
  private readonly productService = inject(ProductService);
  private readonly toastService   = inject(ToastService);
  private readonly fb             = inject(FormBuilder);

  product      = input.required<Product>();
  stockUpdated = output<string>();
  cancelled    = output<void>();

  isLoading = signal<boolean>(false);

  form: FormGroup = this.fb.group({
    quantity: [null, [Validators.required, Validators.min(0)]],
    operation: ['increase', [Validators.required]]
  });

  get quantity() { return this.form.get('quantity')!; }
  get operation() { return this.form.get('operation')!; }

  isInvalid(field: ReturnType<FormGroup['get']>): boolean {
    return !!(field?.invalid && field?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const updateStockDto: UpdateStockDto = this.form.value;

    this.productService.updateStock(this.product().id, updateStockDto).subscribe({
      next: (response) => {
        if (response.success) {
          this.form.reset();
          this.stockUpdated.emit(response.message ?? 'Stock mis à jour avec succès.');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Erreur lors de la mise à jour du stock.';
        this.toastService.error(message);
        this.isLoading.set(false);
      }
    });
  }

  onCancel(): void {
    this.form.reset();
    this.cancelled.emit();
  }
}
