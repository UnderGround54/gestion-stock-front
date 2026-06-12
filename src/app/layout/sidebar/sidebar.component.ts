import { Component } from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLinkActive,
    RouterLink
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  menuItems = [
    { label: 'Dashboard',  icon: 'bi-speedometer2', route: '/dashboard' },
    { label: 'Produits',   icon: 'bi-box-seam',     route: '/products'  },
    { label: 'Clients',    icon: 'bi-people',        route: '/clients'   },
    { label: 'Commandes',  icon: 'bi-cart3',         route: '/orders'    },
    { label: 'Factures',   icon: 'bi-receipt',       route: '/invoices'  },
  ]
}
