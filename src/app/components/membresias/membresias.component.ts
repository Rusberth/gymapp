import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MembresiaService } from '../../services/membresia.service';
import { UsuarioService } from '../../services/usuario.service';
import { Membresia } from '../../models/membresia.model';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-membresias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './membresias.html'
})
export class MembresiasComponent implements OnInit {
  membresias: Membresia[] = [];
  usuarios: Usuario[] = [];
  membresiaForm: Membresia = this.initForm();
  editando = false;
  mostrarModal = false;
  mensaje = '';
  tipoMensaje = '';
  searchTerm = '';
  estadoFiltro = 'todas';
  errors: Record<string, string> = {};

  readonly precios: Record<string, number> = {
    Mensual: 150,
    Trimestral: 400,
    Semestral: 750,
    Anual: 1400
  };

  constructor(
    private membresiaService: MembresiaService,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.cargarDatos();
  }

  get filteredMembresias(): Membresia[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.membresias.filter((membresia) => {
      const matchesTerm =
        !term ||
        (membresia.usuarioNombre ?? '').toLowerCase().includes(term) ||
        membresia.tipo.toLowerCase().includes(term);

      const matchesEstado =
        this.estadoFiltro === 'todas' ||
        (this.estadoFiltro === 'activas' && membresia.activa) ||
        (this.estadoFiltro === 'inactivas' && !membresia.activa) ||
        (this.estadoFiltro === 'por-vencer' && membresia.activa && this.daysUntil(membresia.fechaFin) <= 7 && this.daysUntil(membresia.fechaFin) >= 0);

      return matchesTerm && matchesEstado;
    });
  }

  get totalActivas(): number {
    return this.membresias.filter((item) => item.activa).length;
  }

  get porVencer(): number {
    return this.membresias.filter((item) => item.activa && this.daysUntil(item.fechaFin) <= 7 && this.daysUntil(item.fechaFin) >= 0).length;
  }

  get ingresosPotenciales(): number {
    return this.membresias.filter((item) => item.activa).reduce((sum, item) => sum + item.precio, 0);
  }

  initForm(): Membresia {
    const hoy = new Date().toISOString().split('T')[0];
    return {
      usuarioId: 0,
      tipo: 'Mensual',
      precio: 150,
      fechaInicio: hoy,
      fechaFin: this.addMonths(hoy, 1),
      activa: true
    };
  }

  async cargarDatos() {
    const [membresias, usuarios] = await Promise.all([
      this.membresiaService.getAll(),
      this.usuarioService.getAll()
    ]);

    this.usuarios = usuarios;
    this.membresias = membresias
      .map((membresia) => ({
        ...membresia,
        usuarioNombre: this.getUsuarioNombre(membresia.usuarioId, usuarios),
        activa: membresia.activa && this.daysUntil(membresia.fechaFin) >= 0
      }))
      .sort((a, b) => a.fechaFin.localeCompare(b.fechaFin));

    this.cdr.detectChanges();
  }

  abrirModal(membresia?: Membresia) {
    this.errors = {};

    if (membresia) {
      this.membresiaForm = { ...membresia };
      this.editando = true;
    } else {
      this.membresiaForm = this.initForm();
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

  onTipoChange() {
    this.membresiaForm.precio = this.precios[this.membresiaForm.tipo];
    this.calcularFechaFin();
  }

  calcularFechaFin() {
    if (!this.membresiaForm.fechaInicio) {
      return;
    }

    const meses: Record<Membresia['tipo'], number> = {
      Mensual: 1,
      Trimestral: 3,
      Semestral: 6,
      Anual: 12
    };

    this.membresiaForm.fechaFin = this.addMonths(this.membresiaForm.fechaInicio, meses[this.membresiaForm.tipo]);
  }

  async guardar() {
    if (!this.validateForm()) {
      this.mostrarMensaje('Revisa los datos de la membresía antes de guardar.', 'warning');
      return;
    }

    try {
      const payload: Membresia = {
        ...this.membresiaForm,
        activa: this.membresiaForm.activa && this.daysUntil(this.membresiaForm.fechaFin) >= 0
      };

      if (this.editando) {
        await this.membresiaService.update(payload);
        this.mostrarMensaje('Membresía actualizada correctamente.', 'success');
      } else {
        await this.membresiaService.add(payload);
        this.mostrarMensaje('Membresía registrada correctamente.', 'success');
      }

      await this.cargarDatos();
      this.cerrarModal();
    } catch {
      this.mostrarMensaje('No se pudo guardar la membresía.', 'danger');
    }
  }

  async eliminar(id: number) {
    if (confirm('¿Deseas eliminar esta membresía?')) {
      await this.membresiaService.delete(id);
      await this.cargarDatos();
      this.mostrarMensaje('Membresía eliminada.', 'warning');
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

  getBadgeClass(tipo: string): string {
    const map: Record<string, string> = {
      Mensual: 'blue',
      Trimestral: 'green',
      Semestral: 'gold',
      Anual: 'red'
    };

    return map[tipo] || 'blue';
  }

  getEstadoLabel(membresia: Membresia): string {
    if (!membresia.activa || this.daysUntil(membresia.fechaFin) < 0) {
      return 'Inactiva';
    }

    if (this.daysUntil(membresia.fechaFin) <= 7) {
      return 'Por vencer';
    }

    return 'Activa';
  }

  getEstadoTone(membresia: Membresia): string {
    if (!membresia.activa || this.daysUntil(membresia.fechaFin) < 0) {
      return 'red';
    }

    if (this.daysUntil(membresia.fechaFin) <= 7) {
      return 'gold';
    }

    return 'green';
  }

  private validateForm(): boolean {
    const errors: Record<string, string> = {};

    if (!this.membresiaForm.usuarioId) {
      errors['usuarioId'] = 'Selecciona un cliente.';
    }

    if (!this.membresiaForm.fechaInicio) {
      errors['fechaInicio'] = 'La fecha de inicio es obligatoria.';
    }

    if (!this.membresiaForm.fechaFin) {
      errors['fechaFin'] = 'La fecha de vencimiento es obligatoria.';
    } else if (this.membresiaForm.fechaFin < this.membresiaForm.fechaInicio) {
      errors['fechaFin'] = 'La fecha de vencimiento no puede ser anterior al inicio.';
    }

    if (this.membresiaForm.precio <= 0) {
      errors['precio'] = 'El precio debe ser mayor a 0.';
    }

    this.errors = errors;
    this.cdr.detectChanges();
    return Object.keys(errors).length === 0;
  }

  private getUsuarioNombre(usuarioId: number, usuarios: Usuario[]): string {
    const usuario = usuarios.find((item) => item.id === usuarioId);
    return usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Cliente no disponible';
  }

  private addMonths(dateString: string, months: number): string {
    const date = new Date(`${dateString}T00:00:00`);
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  }

  private daysUntil(dateString: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((new Date(`${dateString}T00:00:00`).getTime() - today.getTime()) / 86400000);
  }
}
