import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { MembresiaService } from '../../services/membresia.service';
import { RutinaService } from '../../services/rutina.service';
import { PagoService } from '../../services/pago.service';
import { AsistenciaService } from '../../services/asistencia.service';
import { AuthService } from '../../services/auth.service';
import { Pago } from '../../models/pago.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-shell">
      <section class="pro-panel p-4 p-lg-5 mb-4 hero-panel">
        <div class="row g-4 align-items-center">
          <div class="col-lg-7">
            <span class="soft-badge blue mb-3"><i class="bi bi-stars"></i> Panel operativo</span>
            <h1 class="page-title">Gestiona más. Entrena mejor.</h1>
            <p class="page-subtitle">Todo lo que necesitas para operar tu gimnasio al máximo.</p>
            <div class="d-flex flex-wrap gap-2 mt-4">
              <a routerLink="/usuarios" class="btn btn-primary"><i class="bi bi-people-fill me-2"></i>Gestionar clientes</a>
              <a routerLink="/pagos" class="btn btn-outline-secondary"><i class="bi bi-cash-stack me-2"></i>Revisar caja</a>
            </div>
          </div>
          <div class="col-lg-5">
            <div class="overview-card">
              <div class="overview-row"><span>Perfil en uso</span><strong>{{ authService.currentUser()?.role }}</strong></div>
              <div class="overview-row"><span>Usuario activo</span><strong>{{ authService.currentUser()?.username }}</strong></div>
              <div class="overview-row"><span>Alertas activas</span><strong>{{ alertas.length }}</strong></div>
              <div class="overview-row"><span>Caja del dia</span><strong>Bs {{ cajaHoy }}</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section class="metrics-grid mb-4">
        <article class="metric-item"><div class="metric-card tone-blue"><p class="metric-label">Clientes registrados</p><h3 class="metric-value">{{ totalUsuarios }}</h3><p class="mt-2">Base activa del gimnasio</p></div></article>
        <article class="metric-item"><div class="metric-card tone-green"><p class="metric-label">Membresias activas</p><h3 class="metric-value">{{ totalMembresias }}</h3><p class="mt-2">Clientes con acceso vigente</p></div></article>
        <article class="metric-item"><div class="metric-card tone-gold"><p class="metric-label">Presentes hoy</p><h3 class="metric-value">{{ asistenciasHoy }}</h3><p class="mt-2">Check-ins del dia</p></div></article>
        <article class="metric-item"><div class="metric-card tone-red"><p class="metric-label">Pagos pendientes</p><h3 class="metric-value">{{ pagosPendientes }}</h3><p class="mt-2">Cobros por regularizar</p></div></article>
      </section>

      <section class="section-grid">
        <div style="grid-column: span 8;">
          <div class="content-card p-4 h-100">
            <div class="page-header mb-3">
              <div>
                <h2 class="h4 mb-1">Alertas y seguimiento</h2>
                <p class="page-subtitle">Avisos inmediatos para recepcion y administracion.</p>
              </div>
            </div>
            <div *ngIf="alertas.length === 0" class="empty-state"><i class="bi bi-bell"></i>No hay alertas urgentes por ahora.</div>
            <div *ngFor="let alerta of alertas" class="toolbar-card mb-3">
              <div class="d-flex justify-content-between align-items-start gap-3">
                <div>
                  <strong class="d-block">{{ alerta.titulo }}</strong>
                  <span class="helper-text">{{ alerta.detalle }}</span>
                </div>
                <span class="soft-badge" [class.red]="alerta.tono === 'red'" [class.gold]="alerta.tono === 'gold'" [class.green]="alerta.tono === 'green'">{{ alerta.tipo }}</span>
              </div>
            </div>

            <div class="row g-3 mt-1">
              <div class="col-md-6"><div class="toolbar-card h-100"><span class="soft-badge green mb-2">Alta reciente</span><h3 class="h5">Nuevos registros este mes</h3><p class="display-6 fw-bold mb-1">{{ altasDelMes }}</p><p class="helper-text mb-0">Clientes registrados durante los ultimos 30 dias.</p></div></div>
              <div class="col-md-6"><div class="toolbar-card h-100"><span class="soft-badge gold mb-2">Renovacion</span><h3 class="h5">Membresias por vencer</h3><p class="display-6 fw-bold mb-1">{{ membresiasPorVencer }}</p><p class="helper-text mb-0">Clientes que deben ser contactados esta semana.</p></div></div>
              <div class="col-12" *ngIf="authService.hasRole('admin')"><div class="toolbar-card h-100"><span class="soft-badge red mb-2">Entrenamiento</span><h3 class="h5">Carga de rutinas</h3><p class="helper-text mb-3">Distribucion actual por nivel de exigencia.</p><div class="d-flex flex-wrap gap-2"><span class="soft-badge green">Principiante: {{ rutinasPrincipiante }}</span><span class="soft-badge gold">Intermedio: {{ rutinasIntermedias }}</span><span class="soft-badge red">Avanzado: {{ rutinasAvanzadas }}</span></div></div></div>
            </div>
          </div>
        </div>

        <div style="grid-column: span 4;">
          <div class="content-card p-4 h-100">
            <h2 class="h4 mb-3">Acciones rapidas</h2>
            <div class="d-grid gap-3">
              <a routerLink="/usuarios" class="toolbar-card text-decoration-none text-reset card-hover"><strong class="d-block mb-1">Registrar cliente</strong><span class="helper-text">Alta rapida y seguimiento integral.</span></a>
              <a routerLink="/membresias" class="toolbar-card text-decoration-none text-reset card-hover"><strong class="d-block mb-1">Crear membresia</strong><span class="helper-text">Activa o renueva planes en pocos pasos.</span></a>
              <a routerLink="/pagos" class="toolbar-card text-decoration-none text-reset card-hover"><strong class="d-block mb-1">Cobrar pago</strong><span class="helper-text">Controla caja e identifica pendientes.</span></a>
              <a routerLink="/asistencia" class="toolbar-card text-decoration-none text-reset card-hover"><strong class="d-block mb-1">Registrar asistencia</strong><span class="helper-text">Marca presencia diaria y frecuencia.</span></a>
              <a *ngIf="authService.hasRole('admin')" routerLink="/reportes" class="toolbar-card text-decoration-none text-reset card-hover"><strong class="d-block mb-1">Ver reportes</strong><span class="helper-text">Resumen comercial y operativo.</span></a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .hero-panel { background: radial-gradient(circle at top right, rgba(26, 105, 175, 0.12), transparent 28%), linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(248, 251, 255, 0.88)); }
    .overview-card { padding: 1.2rem; border-radius: 22px; color: #fff; background: linear-gradient(135deg, #0c2038, #143f69); box-shadow: var(--shadow-soft); }
    .overview-row { display: flex; justify-content: space-between; gap: 1rem; padding: 0.8rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
    .overview-row:last-child { border-bottom: 0; padding-bottom: 0; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; align-items: stretch; }
    .metric-item { min-width: 0; }
    .metric-card { width: 100%; min-height: 190px; display: flex; flex-direction: column; justify-content: space-between; }
    @media (max-width: 1199px) { [style*="grid-column: span 8"], [style*="grid-column: span 4"] { grid-column: span 12 !important; } }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  totalUsuarios = 0;
  totalMembresias = 0;
  totalRutinas = 0;
  membresiasPorVencer = 0;
  altasDelMes = 0;
  rutinasPrincipiante = 0;
  rutinasIntermedias = 0;
  rutinasAvanzadas = 0;
  cajaHoy = 0;
  pagosPendientes = 0;
  asistenciasHoy = 0;
  alertas: { titulo: string; detalle: string; tipo: string; tono: 'red' | 'gold' | 'green' }[] = [];

  constructor(
    private usuarioService: UsuarioService,
    private membresiaService: MembresiaService,
    private rutinaService: RutinaService,
    private pagoService: PagoService,
    private asistenciaService: AsistenciaService,
    private cdr: ChangeDetectorRef,
    public authService: AuthService
  ) {}

  async ngOnInit() {
    const [usuarios, membresias, rutinas, pagos, asistencias] = await Promise.all([
      this.usuarioService.getAll(),
      this.membresiaService.getAll(),
      this.rutinaService.getAll(),
      this.pagoService.getAll(),
      this.asistenciaService.getAll()
    ]);

    const today = new Date().toISOString().split('T')[0];
    this.totalUsuarios = usuarios.length;
    this.totalMembresias = membresias.filter((item) => item.activa).length;
    this.totalRutinas = rutinas.length;
    this.membresiasPorVencer = membresias.filter((item) => item.activa && this.daysUntil(item.fechaFin) <= 7 && this.daysUntil(item.fechaFin) >= 0).length;
    this.altasDelMes = usuarios.filter((item) => this.daysSince(item.fechaRegistro) <= 30).length;
    this.rutinasPrincipiante = rutinas.filter((item) => item.nivel === 'Principiante').length;
    this.rutinasIntermedias = rutinas.filter((item) => item.nivel === 'Intermedio').length;
    this.rutinasAvanzadas = rutinas.filter((item) => item.nivel === 'Avanzado').length;
    this.cajaHoy = pagos.filter((item) => item.estado === 'Pagado' && item.fechaPago === today).reduce((sum, item) => sum + item.monto, 0);
    this.pagosPendientes = pagos.filter((item) => item.estado === 'Pendiente').length;
    this.asistenciasHoy = asistencias.filter((item) => item.fecha === today && item.estado === 'Asistio').length;
    this.alertas = this.buildAlertas(membresias, pagos);
    this.cdr.detectChanges();
  }

  ngOnDestroy() {}

  private buildAlertas(membresias: { usuarioId: number; fechaFin: string; activa: boolean }[], pagos: Pago[]) {
    const alertas: { titulo: string; detalle: string; tipo: string; tono: 'red' | 'gold' | 'green' }[] = [];
    const pendientes = pagos.filter((item) => item.estado === 'Pendiente');
    const porVencer = membresias.filter((item) => item.activa && this.daysUntil(item.fechaFin) >= 0 && this.daysUntil(item.fechaFin) <= 7);

    for (const pago of pendientes.slice(0, 3)) {
      alertas.push({
        titulo: 'Pago pendiente detectado',
        detalle: `Cliente ID ${pago.usuarioId} tiene un cobro pendiente por Bs ${pago.monto}.`,
        tipo: 'Cobro',
        tono: 'red'
      });
    }

    for (const membresia of porVencer.slice(0, 3)) {
      alertas.push({
        titulo: 'Membresia proxima a vencer',
        detalle: `Cliente ID ${membresia.usuarioId} vence el ${membresia.fechaFin}.`,
        tipo: 'Renovacion',
        tono: 'gold'
      });
    }

    if (alertas.length === 0) {
      alertas.push({
        titulo: 'Operacion estable',
        detalle: 'No hay cobros pendientes ni renovaciones urgentes para hoy.',
        tipo: 'Estado',
        tono: 'green'
      });
    }

    return alertas;
  }

  private daysUntil(dateString: string): number {
    return Math.ceil((this.normalizeDate(dateString).getTime() - this.startOfToday().getTime()) / 86400000);
  }

  private daysSince(dateString: string): number {
    return Math.floor((this.startOfToday().getTime() - this.normalizeDate(dateString).getTime()) / 86400000);
  }

  private normalizeDate(value: string): Date {
    return new Date(`${value}T00:00:00`);
  }

  private startOfToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }
}
