import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { MembresiasComponent } from './components/membresias/membresias.component';
import { RutinasComponent } from './components/rutinas/rutinas.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';
import { PagosCajaComponent } from './components/pagos-caja/pagos-caja.component';
import { AsistenciaComponent } from './components/asistencia/asistencia.component';
import { ReportesComponent } from './components/reportes/reportes.component';
import { ClienteDetalleComponent } from './components/cliente-detalle/cliente-detalle.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'sin-acceso', component: AccessDeniedComponent, canActivate: [authGuard] },
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  {
    path: 'usuarios',
    component: UsuariosComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'recepcion'] }
  },
  {
    path: 'usuarios/:id',
    component: ClienteDetalleComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'recepcion'] }
  },
  {
    path: 'membresias',
    component: MembresiasComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'recepcion'] }
  },
  {
    path: 'rutinas',
    component: RutinasComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'pagos',
    component: PagosCajaComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'recepcion'] }
  },
  {
    path: 'asistencia',
    component: AsistenciaComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'recepcion'] }
  },
  {
    path: 'reportes',
    component: ReportesComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] }
  },
  { path: '**', redirectTo: '' }
];
