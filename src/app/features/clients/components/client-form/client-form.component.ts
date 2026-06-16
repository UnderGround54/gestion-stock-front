import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule} from '@angular/forms';
import { ClientService } from '../../../../core/services';
import { CreateClientDto } from '../../../../core/models';
import {extractErrorMessage} from '../../../../core/utils/http-error.util';
import {ToastService} from '../../../../shared/services/toast.service';
import {log} from '@angular-devkit/build-angular/src/builders/ssr-dev-server';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.css'
})
export class ClientFormComponent {
  private readonly clientService = inject(ClientService);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  clientCreated = output<string>();
  cancelled = output<void>();
  isLoading = signal<boolean>(false);

  form: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName:  ['', [Validators.required, Validators.minLength(2)]],
    email:     ['', [Validators.required, Validators.email]],
    phone:     ['', [Validators.required]],
    address:   ['', [Validators.required]]
  });

  // Getters pour accéder facilement aux champs dans le template
  get firstName() { return this.form.get('firstName')!; }
  get lastName()  { return this.form.get('lastName')!;  }
  get email()     { return this.form.get('email')!;     }
  get phone()     { return this.form.get('phone')!;     }
  get address()   { return this.form.get('address')!;   }

  isInvalid(field: ReturnType<FormGroup['get']>): boolean {
    return !!(field?.invalid && field?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const createClientDto: CreateClientDto = this.form.value;

    this.clientService.create(createClientDto).subscribe({
      next: (response) => {
        if (response.success) {
          this.form.reset();
          this.clientCreated.emit(response.message ?? 'Client créé avec succès.');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Erreur lors de la création du client.';
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
