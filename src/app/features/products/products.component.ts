import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services';
import { ToastService } from '../../shared/services';
import { Product, Pagination } from '../../core/models';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { UpdateStockFormComponent } from './components/update-stock-form/update-stock-form.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    ProductFormComponent,
    ProductDetailComponent,
    UpdateStockFormComponent
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly toastService   = inject(ToastService);

  products= signal<Product[]>([]);
  pagination= signal<Pagination | null>(null);
  isLoading= signal<boolean>(false);
  showForm= signal<boolean>(false);
  currentPage= signal<number>(1);
  selectedProductId= signal<string | null>(null);
  productToUpdate= signal<Product | null>(null);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);

    this.productService.getAll(this.currentPage(), 10).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.products.set(response.data);
          this.pagination.set(response.meta?.pagination ?? null);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Erreur lors du chargement des produits.';
        this.toastService.error(message);
        this.isLoading.set(false);
      }
    });
  }

  onProductCreated(message: string): void {
    this.showForm.set(false);
    this.toastService.success(message);
    this.loadProducts();
  }

  onStockUpdated(message: string): void {
    this.productToUpdate.set(null);
    this.toastService.success(message);
    this.loadProducts();
  }

  onViewDetail(product: Product): void {
    this.selectedProductId.set(product.id);
  }

  onUpdateStock(product: Product): void {
    this.productToUpdate.set(product);
  }

  onDrawerClosed(): void {
    this.selectedProductId.set(null);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
  }
}
