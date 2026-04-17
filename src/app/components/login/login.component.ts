import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card shadow-lg">
        <div class="text-center mb-4">
          <div class="login-icon">
            <i class="bi bi-shield-lock-fill"></i>
          </div>
          <h1 class="h3 fw-bold mt-3 mb-2">FitManager</h1>
          <p class="text-muted mb-0">Inicia sesión para administrar el gimnasio</p>
        </div>

        <div *ngIf="errorMessage" class="alert alert-danger py-2">
          {{ errorMessage }}
        </div>

        <form (ngSubmit)="submit()" #loginForm="ngForm">
          <div class="mb-3">
            <label class="form-label fw-semibold">Usuario</label>
            <input
              class="form-control form-control-lg"
              name="username"
              [(ngModel)]="username"
              placeholder="admin"
              required
            >
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Contraseña</label>
            <input
              class="form-control form-control-lg"
              type="password"
              name="password"
              [(ngModel)]="password"
              placeholder="Ingresa tu contraseña"
              required
            >
          </div>

          <button class="btn btn-primary btn-lg w-100 mt-2" [disabled]="loginForm.invalid">
            <i class="bi bi-box-arrow-in-right me-2"></i>Entrar
          </button>
        </form>

        <div class="login-help mt-4">
          <!--<p class="mb-2"><strong>Accesos iniciales</strong></p>
          <p class="mb-1">Admin: <code>admin</code> / <code>admin123</code></p>
          <p class="mb-0">Recepción: <code>recepcion</code> / <code>recepcion123</code></p>-->
          <p class="mb-0">Si no tienes una cuenta, contacta al administrador del sistema.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background:
        radial-gradient(circle at top left, rgba(13, 110, 253, 0.18), transparent 32%),
        radial-gradient(circle at bottom right, rgba(25, 135, 84, 0.18), transparent 28%),
        linear-gradient(135deg, #f4f7fb 0%, #eef3f8 100%);
    }

    .login-card {
      width: 100%;
      max-width: 430px;
      background: #fff;
      border-radius: 24px;
      padding: 2rem;
      border: 1px solid rgba(15, 23, 42, 0.06);
    }

    .login-icon {
      width: 72px;
      height: 72px;
      margin: 0 auto;
      border-radius: 20px;
      display: grid;
      place-items: center;
      font-size: 1.8rem;
      color: #fff;
      background: linear-gradient(135deg, #0d6efd, #198754);
    }

    .login-help {
      font-size: 0.95rem;
      color: #495057;
      background: #f8f9fa;
      border-radius: 14px;
      padding: 0.9rem 1rem;
    }
  `]
})
export class LoginComponent {
  username = 'admin';
  password = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    if (this.authService.isAuthenticated()) {
      void this.router.navigateByUrl('/');
    }
  }

  submit(): void {
    const isValid = this.authService.login(this.username, this.password);

    if (!isValid) {
      this.errorMessage = 'Usuario o contraseña incorrectos';
      return;
    }

    this.errorMessage = '';
    void this.router.navigateByUrl('/');
  }
}
