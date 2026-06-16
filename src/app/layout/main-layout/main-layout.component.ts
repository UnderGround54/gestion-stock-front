import { Component } from '@angular/core';
import {SidebarComponent} from '../sidebar/sidebar.component';
import {TopbarComponent} from '../topbar/topbar.component';
import {RouterOutlet} from '@angular/router';
import {ToastComponent} from '../../shared/components';

@Component({
  selector: 'app-main-layout',
  imports: [
    SidebarComponent,
    TopbarComponent,
    RouterOutlet,
    ToastComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {

}
