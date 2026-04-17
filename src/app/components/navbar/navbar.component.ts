import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav *ngIf="authService.isAuthenticated()" class="navbar navbar-expand-lg navbar-dark shadow-sm">
      <div class="container-fluid nav-shell">
        <a class="navbar-brand fw-bold d-flex align-items-center gap-2" routerLink="/">
          <span class="brand-mark"><i class="bi bi-trophy-fill"></i></span>
          <span>
            <span class="d-block brand-title">FitManager</span>
            <small class="brand-subtitle">Operacion diaria del gimnasio</small>
          </span>
        </a>
        <button class="navbar-toggler" type="button" (click)="toggleMenu()">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="navbar-collapse" [class.show]="menuOpen" [class.collapse]="!menuOpen">
          <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <li class="nav-item"><a class="nav-link" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"><i class="bi bi-grid-1x2-fill me-1"></i>Panel</a></li>
            <li class="nav-item" *ngIf="authService.hasRole(['admin', 'recepcion'])"><a class="nav-link" routerLink="/usuarios" routerLinkActive="active"><i class="bi bi-people-fill me-1"></i>Clientes</a></li>
            <li class="nav-item" *ngIf="authService.hasRole(['admin', 'recepcion'])"><a class="nav-link" routerLink="/membresias" routerLinkActive="active"><i class="bi bi-card-checklist me-1"></i>Membresias</a></li>
            <li class="nav-item" *ngIf="authService.hasRole(['admin', 'recepcion'])"><a class="nav-link" routerLink="/pagos" routerLinkActive="active"><i class="bi bi-cash-stack me-1"></i>Pagos</a></li>
            <li class="nav-item" *ngIf="authService.hasRole(['admin', 'recepcion'])"><a class="nav-link" routerLink="/asistencia" routerLinkActive="active"><i class="bi bi-person-check-fill me-1"></i>Asistencia</a></li>
            <li class="nav-item" *ngIf="authService.hasRole('admin')"><a class="nav-link" routerLink="/rutinas" routerLinkActive="active"><i class="bi bi-lightning-charge-fill me-1"></i>Rutinas</a></li>
            <li class="nav-item" *ngIf="authService.hasRole('admin')"><a class="nav-link" routerLink="/reportes" routerLinkActive="active"><i class="bi bi-bar-chart-fill me-1"></i>Reportes</a></li>
            <li class="nav-item user-chip mt-3 mt-lg-0">
              <span class="small text-uppercase d-block">{{ authService.currentUser()?.role }}</span>
              <strong>{{ authService.currentUser()?.username }}</strong>
            </li>
            <li class="nav-item mt-3 mt-lg-0">
              <button class="btn btn-sm btn-outline-light" type="button" (click)="logout()">
                <i class="bi bi-box-arrow-right me-1"></i>Salir
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar { margin: 1rem; border-radius: 24px; background: radial-gradient(circle at top left, rgba(70, 145, 209, 0.18), transparent 22%), linear-gradient(135deg, #081a2f, #0f365c 58%, #13517c 100%); border: 1px solid rgba(255, 255, 255, 0.08); }
    .nav-shell { padding: 0.8rem 1rem; }
    .brand-mark { width: 42px; height: 42px; border-radius: 14px; display: grid; place-items: center; color: #081a2f; background: linear-gradient(135deg, #f3d37a, #f5b86b); }
    .brand-title { line-height: 1.1; }
    .brand-subtitle { color: rgba(255, 255, 255, 0.68); font-size: 0.73rem; letter-spacing: 0.04em; }
    .nav-link { border-radius: 999px; padding: 0.65rem 0.95rem !important; color: rgba(255, 255, 255, 0.82); }
    .nav-link.active, .nav-link:hover { color: #fff; background: rgba(255, 255, 255, 0.1); }
    .user-chip { min-width: 130px; padding: 0.55rem 0.9rem; color: #fff; border-radius: 16px; background: rgba(255, 255, 255, 0.08); }
    .user-chip .small { color: rgba(255, 255, 255, 0.65); letter-spacing: 0.06em; }
    @media (max-width: 768px) { .navbar { margin: 0.75rem 0.75rem 0; } .nav-shell { padding: 0.75rem; } }
  `]
})
export class NavbarComponent {
  menuOpen = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.menuOpen = false;
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
