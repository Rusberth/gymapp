import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { MembresiasComponent } from './components/membresias/membresias.component';
import { RutinasComponent } from './components/rutinas/rutinas.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'membresias', component: MembresiasComponent },
  { path: 'rutinas', component: RutinasComponent },
  { path: '**', redirectTo: '' }
];