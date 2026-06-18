import { Component, inject, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormsModule} from '@angular/forms';
import { OrderService, ProductService, ClientService } from '../../../../core/services';
import { ToastService } from '../../../../shared/services';
import { CreateOrderDto, Product, Client } from '../../../../core/models';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.css'
})
export class OrderFormComponent implements OnInit {
  private readonly orderService= inject(OrderService);
  private readonly productService= inject(ProductService);
  private readonly clientService= inject(ClientService);
  private readonly toastService= inject(ToastService);
  private readonly fb= inject(FormBuilder);

  orderCreated= output<string>();
  cancelled= output<void>();

  isLoading= signal<boolean>(false);
  products= signal<Product[]>([]);
  clients= signal<Client[]>([]);

  form: FormGroup = this.fb.group({
    clientId:     ['', [Validators.required]],
    customerNote: [''],
    orderLines:   this.fb.array([])
  });

  get clientId(){ return this.form.get('clientId')!;     }
  get customerNote(){ return this.form.get('customerNote')!; }
  get orderLines(){ return this.form.get('orderLines') as FormArray; }

  ngOnInit(): void {
    this.loadProducts();
    this.loadClients();
    this.addLine();
  }

  loadProducts(): void {
    this.productService.getAll(1, 100).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.products.set(response.data.filter(p => p.stock.available));
        }
      }
    });
  }

  loadClients(): void {
    this.clientService.getAll(1, 100).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.clients.set(response.data.filter(c => c.isActive));
        }
      }
    });
  }

  addLine(): void {
    const line = this.fb.group({
      productId: ['', [Validators.required]],
      quantity:  [1,  [Validators.required, Validators.min(1)]]
    });
    this.orderLines.push(line);
  }

  removeLine(index: number): void {
    if (this.orderLines.length > 1) {
      this.orderLines.removeAt(index);
    }
  }

  getLineGroup(index: number): FormGroup {
    return this.orderLines.at(index) as FormGroup;
  }

  isInvalid(field: ReturnType<FormGroup['get']>): boolean {
    return !!(field?.invalid && field?.touched);
  }

  getSelectedProduct(index: number): Product | undefined {
    const productId = this.getLineGroup(index).get('productId')?.value;
    return this.products().find(p => p.id === productId);
  }

  getLineTotal(index: number): number {
    const product  = this.getSelectedProduct(index);
    const quantity = this.getLineGroup(index).get('quantity')?.value ?? 0;
    return product ? product.price.amount * quantity : 0;
  }

  getTotalAmount(): number {
    return this.orderLines.controls.reduce((total, _, index) => {
      return total + this.getLineTotal(index);
    }, 0);
  }

  getCurrency(): string {
    const product = this.getSelectedProduct(0);
    return product?.price.currency ?? 'MGA';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const dto: CreateOrderDto = {
      clientId:     this.form.value.clientId,
      customerNote: this.form.value.customerNote ?? '',
      orderLines:   this.form.value.orderLines
    };

    this.orderService.create(dto).subscribe({
      next: (response) => {
        if (response.success) {
          this.form.reset();
          this.orderCreated.emit(response.message ?? 'Commande créée avec succès.');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Erreur lors de la création de la commande.';
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
