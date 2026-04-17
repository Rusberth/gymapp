import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-5">
      <div class="mx-auto text-center denied-card shadow-sm">
        <div class="denied-icon">
          <i class="bi bi-shield-x"></i>
        </div>
        <h1 class="h3 fw-bold mt-4">Sin acceso a esta sección</h1>
        <p class="text-muted mb-4">
          Tu perfil actual no tiene permisos para entrar aquí.
        </p>
        <a routerLink="/" class="btn btn-primary">
          <i class="bi bi-house-door-fill me-2"></i>Volver al inicio
        </a>
      </div>
    </div>
  `,
  styles: [`
    .denied-card {
      max-width: 520px;
      padding: 3rem 2rem;
      border-radius: 24px;
      background: #fff;
    }

    .denied-icon {
      width: 88px;
      height: 88px;
      margin: 0 auto;
      border-radius: 24px;
      display: grid;
      place-items: center;
      font-size: 2rem;
      color: #dc3545;
      background: rgba(220, 53, 69, 0.12);
    }
  `]
})
export class AccessDeniedComponent {}
