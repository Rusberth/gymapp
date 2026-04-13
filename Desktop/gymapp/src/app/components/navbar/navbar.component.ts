import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div class="container-fluid">
        <a class="navbar-brand fw-bold" routerLink="/">
          <i class="bi bi-trophy-fill text-warning me-2"></i>GymApp Pro
        </a>
        <button class="navbar-toggler" type="button" (click)="toggleMenu()">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="navbar-collapse" [class.show]="menuOpen" [class.collapse]="!menuOpen">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
                <i class="bi bi-house-fill me-1"></i>Inicio
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/usuarios" routerLinkActive="active">
                <i class="bi bi-people-fill me-1"></i>Usuarios
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/membresias" routerLinkActive="active">
                <i class="bi bi-card-checklist me-1"></i>Membresías
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/rutinas" routerLinkActive="active">
                <i class="bi bi-lightning-charge-fill me-1"></i>Rutinas
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  menuOpen = false;
  toggleMenu() { this.menuOpen = !this.menuOpen; }
}