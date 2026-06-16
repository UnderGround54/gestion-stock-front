import { Component, inject, input, output, signal, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../../core/services';
import { ToastService } from '../../../../shared/services';
import { Product } from '../../../../core/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnChanges {
  private readonly productService = inject(ProductService);
  private readonly toastService   = inject(ToastService);

  productId = input.required<string>();
  closed    = output<void>();

  product   = signal<Product | null>(null);
  isLoading = signal<boolean>(false);

  ngOnChanges(): void {
    this.loadProduct();
  }

  loadProduct(): void {
    this.isLoading.set(true);

    this.productService.getById(this.productId()).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.product.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Erreur lors du chargement du produit.';
        this.toastService.error(message);
        this.isLoading.set(false);
        this.closed.emit();
      }
    });
  }

  onClose(): void {
    this.product.set(null);
    this.closed.emit();
  }
}
