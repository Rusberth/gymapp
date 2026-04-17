import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenciaService } from '../../services/asistencia.service';
import { UsuarioService } from '../../services/usuario.service';
import { Asistencia } from '../../models/asistencia.model';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asistencia.html'
})
export class AsistenciaComponent implements OnInit {
  asistencias: Asistencia[] = [];
  usuarios: Usuario[] = [];
  asistenciaForm: Asistencia = this.initForm();
  mostrarModal = false;
  editando = false;
  mensaje = '';
  tipoMensaje = '';
  searchTerm = '';
  fechaFiltro = new Date().toISOString().split('T')[0];
  errors: Record<string, string> = {};

  constructor(
    private asistenciaService: AsistenciaService,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.cargarDatos();
  }

  get asistenciasFiltradas(): Asistencia[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.asistencias.filter((asistencia) => {
      const matchesTerm =
        !term ||
        (asistencia.usuarioNombre ?? '').toLowerCase().includes(term) ||
        asistencia.area.toLowerCase().includes(term);
      const matchesFecha = !this.fechaFiltro || asistencia.fecha === this.fechaFiltro;
      return matchesTerm && matchesFecha;
    });
  }

  get presentesHoy(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.asistencias.filter((a) => a.fecha === today && a.estado === 'Asistio').length;
  }

  get faltasHoy(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.asistencias.filter((a) => a.fecha === today && a.estado === 'Falta').length;
  }

  get frecuenciaSemana(): number {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    return this.asistencias.filter((a) => {
      const date = new Date(`${a.fecha}T00:00:00`);
      return date >= weekAgo && date <= today && a.estado === 'Asistio';
    }).length;
  }

  initForm(): Asistencia {
    return {
      usuarioId: 0,
      fecha: new Date().toISOString().split('T')[0],
      horaEntrada: new Date().toTimeString().slice(0, 5),
      area: 'Sala',
      estado: 'Asistio',
      observacion: ''
    };
  }

  async cargarDatos() {
    const [asistencias, usuarios] = await Promise.all([
      this.asistenciaService.getAll(),
      this.usuarioService.getAll()
    ]);
    this.usuarios = usuarios;
    this.asistencias = asistencias
      .map((asistencia) => ({
        ...asistencia,
        usuarioNombre: this.getUsuarioNombre(asistencia.usuarioId, usuarios)
      }))
      .sort((a, b) => `${b.fecha}${b.horaEntrada}`.localeCompare(`${a.fecha}${a.horaEntrada}`));
    this.cdr.detectChanges();
  }

  abrirModal(asistencia?: Asistencia) {
    this.errors = {};
    if (asistencia) {
      this.asistenciaForm = { ...asistencia };
      this.editando = true;
    } else {
      this.asistenciaForm = this.initForm();
      this.editando = false;
    }
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.errors = {};
    this.cdr.detectChanges();
  }

  async guardar() {
    if (!this.validateForm()) {
      this.mostrarMensaje('Completa correctamente la asistencia.', 'warning');
      return;
    }

    try {
      const payload: Asistencia = {
        ...this.asistenciaForm,
        observacion: this.asistenciaForm.observacion.trim()
      };
      if (this.editando) {
        await this.asistenciaService.update(payload);
        this.mostrarMensaje('Asistencia actualizada.', 'success');
      } else {
        await this.asistenciaService.add(payload);
        this.mostrarMensaje('Asistencia registrada.', 'success');
      }
      await this.cargarDatos();
      this.cerrarModal();
    } catch {
      this.mostrarMensaje('No se pudo guardar la asistencia.', 'danger');
    }
  }

  async eliminar(id: number) {
    if (confirm('¿Deseas eliminar este registro de asistencia?')) {
      await this.asistenciaService.delete(id);
      await this.cargarDatos();
      this.mostrarMensaje('Asistencia eliminada.', 'warning');
    }
  }

  mostrarMensaje(texto: string, tipo: string) {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.mensaje = '';
      this.cdr.detectChanges();
    }, 3200);
  }

  private validateForm(): boolean {
    const errors: Record<string, string> = {};
    if (!this.asistenciaForm.usuarioId) errors['usuarioId'] = 'Selecciona un cliente.';
    if (!this.asistenciaForm.fecha) errors['fecha'] = 'La fecha es obligatoria.';
    if (!this.asistenciaForm.horaEntrada) errors['horaEntrada'] = 'La hora es obligatoria.';
    this.errors = errors;
    this.cdr.detectChanges();
    return Object.keys(errors).length === 0;
  }

  private getUsuarioNombre(usuarioId: number, usuarios: Usuario[]): string {
    const usuario = usuarios.find((item) => item.id === usuarioId);
    return usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Cliente no disponible';
  }
}
