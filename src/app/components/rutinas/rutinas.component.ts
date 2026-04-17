import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RutinaService } from '../../services/rutina.service';
import { UsuarioService } from '../../services/usuario.service';
import { Rutina } from '../../models/rutina.model';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-rutinas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rutinas.html'
})
export class RutinasComponent implements OnInit {
  rutinas: Rutina[] = [];
  usuarios: Usuario[] = [];
  rutinaForm: Rutina = this.initForm();
  editando = false;
  mostrarModal = false;
  mensaje = '';
  tipoMensaje = '';

  constructor(
    private rutinaService: RutinaService,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.cargarDatos();
  }

  initForm(): Rutina {
    return {
      usuarioId: 0,
      nombre: '',
      descripcion: '',
      ejercicios: '',
      series: 3,
      repeticiones: 10,
      diasSemana: '',
      nivel: 'Principiante'
    };
  }

  async cargarDatos() {
    const [rutinas, usuarios] = await Promise.all([
      this.rutinaService.getAll(),
      this.usuarioService.getAll()
    ]);
    this.usuarios = usuarios;
    this.rutinas = rutinas.map(r => ({
      ...r,
      usuarioNombre: usuarios.find(u => u.id === r.usuarioId)?.nombre
        + ' ' + (usuarios.find(u => u.id === r.usuarioId)?.apellido || '')
    }));
    this.cdr.detectChanges();
  }

  abrirModal(r?: Rutina) {
    if (r) {
      this.rutinaForm = { ...r };
      this.editando = true;
    } else {
      this.rutinaForm = this.initForm();
      this.editando = false;
    }
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.cdr.detectChanges();
  }

  async guardar() {
    try {
      if (this.editando) {
        await this.rutinaService.update(this.rutinaForm);
        this.mostrarMensaje('Rutina actualizada', 'success');
      } else {
        await this.rutinaService.add(this.rutinaForm);
        this.mostrarMensaje('Rutina registrada', 'success');
      }
      await this.cargarDatos();
      this.cerrarModal();
    } catch (e) {
      this.mostrarMensaje('Error al guardar', 'danger');
    }
  }

  async eliminar(id: number) {
    if (confirm('¿Eliminar esta rutina?')) {
      await this.rutinaService.delete(id);
      await this.cargarDatos();
      this.mostrarMensaje('Rutina eliminada', 'warning');
    }
  }

  mostrarMensaje(texto: string, tipo: string) {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.mensaje = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  getNivelClass(nivel: string): string {
    const map: Record<string, string> = {
      'Principiante': 'bg-success',
      'Intermedio': 'bg-warning text-dark',
      'Avanzado': 'bg-danger'
    };
    return map[nivel] || 'bg-secondary';
  }
}