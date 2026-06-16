import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule} from '@angular/forms';
import { ProductService } from '../../../../core/services';
import { ToastService } from '../../../../shared/services';
import { CreateProductDto } from '../../../../core/models';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent {
  private readonly productService = inject(ProductService);
  private readonly toastService   = inject(ToastService);
  private readonly fb             = inject(FormBuilder);

  productCreated = output<string>();
  cancelled      = output<void>();

  isLoading = signal<boolean>(false);

  form: FormGroup = this.fb.group({
    name:          ['', [Validators.required, Validators.minLength(2)]],
    reference:     ['', [Validators.required]],
    description:   ['', [Validators.required]],
    price:         [null, [Validators.required, Validators.min(0)]],
    stockQuantity: [null, [Validators.required, Validators.min(0)]],
    minimumStock:  [null, [Validators.required, Validators.min(0)]],
    currency:      ['MGA', [Validators.required]]
  });

  get name()          { return this.form.get('name')!;          }
  get reference()     { return this.form.get('reference')!;     }
  get description()   { return this.form.get('description')!;   }
  get price()         { return this.form.get('price')!;         }
  get stockQuantity() { return this.form.get('stockQuantity')!; }
  get minimumStock()  { return this.form.get('minimumStock')!;  }
  get currency()      { return this.form.get('currency')!;      }

  isInvalid(field: ReturnType<FormGroup['get']>): boolean {
    return !!(field?.invalid && field?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const dto: CreateProductDto = this.form.value;

    this.productService.create(dto).subscribe({
      next: (response) => {
        if (response.success) {
          this.form.reset({ currency: 'MGA' });
          this.productCreated.emit(response.message ?? 'Produit créé avec succès.');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Erreur lors de la création du produit.';
        this.toastService.error(message);
        this.isLoading.set(false);
      }
    });
  }

  onCancel(): void {
    this.form.reset({ currency: 'MGA' });
    this.cancelled.emit();
  }
}
