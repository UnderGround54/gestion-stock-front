import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConfirmModalConfig {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  type: 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.css'
})
export class ConfirmModalComponent {
  config = input.required<ConfirmModalConfig>();
  isVisible = input.required<boolean>();
  confirmed = output<void>();
  cancelled = output<void>();

  get iconClass(): string {
    const icons: Record<string, string> = {
      danger: 'bi-exclamation-triangle-fill text-danger',
      warning: 'bi-exclamation-circle-fill text-warning',
      info: 'bi-info-circle-fill text-info'
    };
    return icons[this.config().type];
  }

  get confirmButtonClass(): string {
    const classes: Record<string, string> = {
      danger: 'btn-danger',
      warning: 'btn-warning',
      info: 'btn-primary'
    };
    return classes[this.config().type];
  }

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
