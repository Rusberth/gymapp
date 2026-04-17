import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PagoService } from '../../services/pago.service';
import { UsuarioService } from '../../services/usuario.service';
import { Pago } from '../../models/pago.model';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-pagos-caja',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagos-caja.html'
})
export class PagosCajaComponent implements OnInit {
  pagos: Pago[] = [];
  usuarios: Usuario[] = [];
  pagoForm: Pago = this.initForm();
  mostrarModal = false;
  editando = false;
  mensaje = '';
  tipoMensaje = '';
  searchTerm = '';
  estadoFiltro = 'todos';
  errors: Record<string, string> = {};

  constructor(
    private pagoService: PagoService,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.cargarDatos();
  }

  get pagosFiltrados(): Pago[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.pagos.filter((pago) => {
      const matchesTerm =
        !term ||
        (pago.usuarioNombre ?? '').toLowerCase().includes(term) ||
        pago.concepto.toLowerCase().includes(term) ||
        pago.metodoPago.toLowerCase().includes(term);
      const matchesEstado = this.estadoFiltro === 'todos' || pago.estado === this.estadoFiltro;
      return matchesTerm && matchesEstado;
    });
  }

  get totalRecaudado(): number {
    return this.pagos.filter((p) => p.estado === 'Pagado').reduce((sum, p) => sum + p.monto, 0);
  }

  get pagosPendientesMonto(): number {
    return this.pagos.filter((p) => p.estado === 'Pendiente').reduce((sum, p) => sum + p.monto, 0);
  }

  get cajaHoy(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.pagos
      .filter((p) => p.estado === 'Pagado' && p.fechaPago === today)
      .reduce((sum, p) => sum + p.monto, 0);
  }

  initForm(): Pago {
    return {
      usuarioId: 0,
      concepto: 'Pago de membresia',
      monto: 150,
      metodoPago: 'Efectivo',
      estado: 'Pagado',
      fechaPago: new Date().toISOString().split('T')[0],
      observacion: ''
    };
  }

  async cargarDatos() {
    const [pagos, usuarios] = await Promise.all([
      this.pagoService.getAll(),
      this.usuarioService.getAll()
    ]);
    this.usuarios = usuarios;
    this.pagos = pagos
      .map((pago) => ({
        ...pago,
        usuarioNombre: this.getUsuarioNombre(pago.usuarioId, usuarios)
      }))
      .sort((a, b) => b.fechaPago.localeCompare(a.fechaPago));
    this.cdr.detectChanges();
  }

  abrirModal(pago?: Pago) {
    this.errors = {};
    if (pago) {
      this.pagoForm = { ...pago };
      this.editando = true;
    } else {
      this.pagoForm = this.initForm();
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
      this.mostrarMensaje('Completa correctamente los datos del pago.', 'warning');
      return;
    }

    try {
      const payload: Pago = {
        ...this.pagoForm,
        concepto: this.pagoForm.concepto.trim(),
        observacion: this.pagoForm.observacion.trim()
      };

      if (this.editando) {
        await this.pagoService.update(payload);
        this.mostrarMensaje('Pago actualizado correctamente.', 'success');
      } else {
        await this.pagoService.add(payload);
        this.mostrarMensaje('Pago registrado correctamente.', 'success');
      }

      await this.cargarDatos();
      this.cerrarModal();
    } catch {
      this.mostrarMensaje('No se pudo guardar el pago.', 'danger');
    }
  }

  async eliminar(id: number) {
    if (confirm('¿Deseas eliminar este registro de pago?')) {
      await this.pagoService.delete(id);
      await this.cargarDatos();
      this.mostrarMensaje('Pago eliminado.', 'warning');
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
    if (!this.pagoForm.usuarioId) errors['usuarioId'] = 'Selecciona un cliente.';
    if (!this.pagoForm.concepto.trim()) errors['concepto'] = 'El concepto es obligatorio.';
    if (this.pagoForm.monto <= 0) errors['monto'] = 'El monto debe ser mayor a 0.';
    if (!this.pagoForm.fechaPago) errors['fechaPago'] = 'La fecha es obligatoria.';
    this.errors = errors;
    this.cdr.detectChanges();
    return Object.keys(errors).length === 0;
  }

  private getUsuarioNombre(usuarioId: number, usuarios: Usuario[]): string {
    const usuario = usuarios.find((item) => item.id === usuarioId);
    return usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Cliente no disponible';
  }
}
