import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../core/services';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent implements OnInit {
  private readonly router = inject(Router);
  readonly notificationService = inject(NotificationService);

  currentDate    = new Date();
  showDropdown   = signal<boolean>(false);

  ngOnInit(): void {
    this.notificationService.load();
  }

  toggleDropdown(): void {
    this.showDropdown.update(v => !v);
  }

  onNotificationClick(link: string): void {
    this.showDropdown.set(false);
    this.router.navigateByUrl(link);
  }

  closeDropdown(): void {
    this.showDropdown.set(false);
  }
}
