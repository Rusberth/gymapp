import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { MembresiaService } from '../../services/membresia.service';
import { RutinaService } from '../../services/rutina.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid py-4">
      <div class="text-center mb-5">
        <h1 class="display-5 fw-bold text-primary">
          <i class="bi bi-trophy-fill me-2"></i>GymApp Pro
        </h1>
        <p class="lead text-muted">Sistema de Gestión de Gimnasio</p>
      </div>

      <div class="row g-4 justify-content-center">
        <div class="col-md-4">
          <div class="card text-white bg-primary shadow h-100">
            <div class="card-body text-center py-4">
              <i class="bi bi-people-fill display-4 mb-3"></i>
              <h3 class="display-6 fw-bold">{{ totalUsuarios }}</h3>
              <p class="fs-5 mb-0">Usuarios Registrados</p>
            </div>
            <div class="card-footer text-center bg-transparent border-0 pb-3">
              <a routerLink="/usuarios" class="btn btn-light btn-sm">Ver usuarios</a>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card text-white bg-success shadow h-100">
            <div class="card-body text-center py-4">
              <i class="bi bi-card-checklist display-4 mb-3"></i>
              <h3 class="display-6 fw-bold">{{ totalMembresias }}</h3>
              <p class="fs-5 mb-0">Membresías Activas</p>
            </div>
            <div class="card-footer text-center bg-transparent border-0 pb-3">
              <a routerLink="/membresias" class="btn btn-light btn-sm">Ver membresías</a>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card text-white bg-danger shadow h-100">
            <div class="card-body text-center py-4">
              <i class="bi bi-lightning-charge-fill display-4 mb-3"></i>
              <h3 class="display-6 fw-bold">{{ totalRutinas }}</h3>
              <p class="fs-5 mb-0">Rutinas Creadas</p>
            </div>
            <div class="card-footer text-center bg-transparent border-0 pb-3">
              <a routerLink="/rutinas" class="btn btn-light btn-sm">Ver rutinas</a>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-5 p-4 bg-light rounded-3 text-center">
        <p class="text-muted mb-0">
          <i class="bi bi-database-fill-check me-1 text-success"></i>
          Datos guardados localmente con <strong>IndexedDB</strong>
        </p>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  totalUsuarios = 0;
  totalMembresias = 0;
  totalRutinas = 0;

  constructor(
    private usuarioService: UsuarioService,
    private membresiaService: MembresiaService,
    private rutinaService: RutinaService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const [u, m, r] = await Promise.all([
      this.usuarioService.getAll(),
      this.membresiaService.getAll(),
      this.rutinaService.getAll()
    ]);
    this.totalUsuarios = u.length;
    this.totalMembresias = m.filter(x => x.activa).length;
    this.totalRutinas = r.length;
    this.cdr.detectChanges();
  }

  ngOnDestroy() {}
}