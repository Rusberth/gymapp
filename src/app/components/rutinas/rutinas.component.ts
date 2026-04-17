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
  searchTerm = '';
  nivelFiltro = 'todos';
  errors: Record<string, string> = {};

  constructor(
    private rutinaService: RutinaService,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.cargarDatos();
  }

  get filteredRutinas(): Rutina[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.rutinas.filter((rutina) => {
      const matchesTerm =
        !term ||
        rutina.nombre.toLowerCase().includes(term) ||
        rutina.descripcion.toLowerCase().includes(term) ||
        rutina.ejercicios.toLowerCase().includes(term) ||
        (rutina.usuarioNombre ?? '').toLowerCase().includes(term);

      const matchesNivel = this.nivelFiltro === 'todos' || rutina.nivel === this.nivelFiltro;
      return matchesTerm && matchesNivel;
    });
  }

  get totalRutinas(): number {
    return this.rutinas.length;
  }

  get rutinasAvanzadas(): number {
    return this.rutinas.filter((item) => item.nivel === 'Avanzado').length;
  }

  get promedioSeries(): number {
    if (this.rutinas.length === 0) {
      return 0;
    }

    const total = this.rutinas.reduce((sum, item) => sum + item.series, 0);
    return Number((total / this.rutinas.length).toFixed(1));
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
    this.rutinas = rutinas.map((rutina) => ({
      ...rutina,
      usuarioNombre: this.getUsuarioNombre(rutina.usuarioId, usuarios)
    }));
    this.cdr.detectChanges();
  }

  abrirModal(rutina?: Rutina) {
    this.errors = {};

    if (rutina) {
      this.rutinaForm = { ...rutina };
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
    this.errors = {};
    this.cdr.detectChanges();
  }

  async guardar() {
    if (!this.validateForm()) {
      this.mostrarMensaje('Completa todos los campos clave de la rutina.', 'warning');
      return;
    }

    try {
      const payload: Rutina = {
        ...this.rutinaForm,
        nombre: this.rutinaForm.nombre.trim(),
        descripcion: this.rutinaForm.descripcion.trim(),
        ejercicios: this.rutinaForm.ejercicios.trim(),
        diasSemana: this.rutinaForm.diasSemana.trim()
      };

      if (this.editando) {
        await this.rutinaService.update(payload);
        this.mostrarMensaje('Rutina actualizada correctamente.', 'success');
      } else {
        await this.rutinaService.add(payload);
        this.mostrarMensaje('Rutina registrada correctamente.', 'success');
      }

      await this.cargarDatos();
      this.cerrarModal();
    } catch {
      this.mostrarMensaje('No se pudo guardar la rutina.', 'danger');
    }
  }

  async eliminar(id: number) {
    if (confirm('¿Deseas eliminar esta rutina?')) {
      await this.rutinaService.delete(id);
      await this.cargarDatos();
      this.mostrarMensaje('Rutina eliminada.', 'warning');
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

  getNivelClass(nivel: string): string {
    const map: Record<string, string> = {
      Principiante: 'green',
      Intermedio: 'gold',
      Avanzado: 'red'
    };
    return map[nivel] || 'blue';
  }

  private validateForm(): boolean {
    const errors: Record<string, string> = {};

    if (!this.rutinaForm.usuarioId) {
      errors['usuarioId'] = 'Selecciona un cliente.';
    }

    if (!this.rutinaForm.nombre.trim()) {
      errors['nombre'] = 'El nombre de la rutina es obligatorio.';
    }

    if (!this.rutinaForm.descripcion.trim()) {
      errors['descripcion'] = 'Agrega una descripción breve.';
    }

    if (!this.rutinaForm.ejercicios.trim()) {
      errors['ejercicios'] = 'Incluye al menos una lista de ejercicios.';
    }

    if (this.rutinaForm.series < 1 || this.rutinaForm.series > 20) {
      errors['series'] = 'Usa entre 1 y 20 series.';
    }

    if (this.rutinaForm.repeticiones < 1 || this.rutinaForm.repeticiones > 100) {
      errors['repeticiones'] = 'Usa entre 1 y 100 repeticiones.';
    }

    if (!this.rutinaForm.diasSemana.trim()) {
      errors['diasSemana'] = 'Indica los días de entrenamiento.';
    }

    this.errors = errors;
    this.cdr.detectChanges();
    return Object.keys(errors).length === 0;
  }

  private getUsuarioNombre(usuarioId: number, usuarios: Usuario[]): string {
    const usuario = usuarios.find((item) => item.id === usuarioId);
    return usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Cliente no disponible';
  }
}
