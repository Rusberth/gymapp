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

  precios: Record<string, number> = {
    'Mensual': 150,
    'Trimestral': 400,
    'Semestral': 750,
    'Anual': 1400
  };

  constructor(
    private membresiaService: MembresiaService,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.cargarDatos();
  }

  initForm(): Membresia {
    const hoy = new Date().toISOString().split('T')[0];
    return {
      usuarioId: 0,
      tipo: 'Mensual',
      precio: 150,
      fechaInicio: hoy,
      fechaFin: '',
      activa: true
    };
  }

  async cargarDatos() {
    const [membresias, usuarios] = await Promise.all([
      this.membresiaService.getAll(),
      this.usuarioService.getAll()
    ]);
    this.usuarios = usuarios;
    this.membresias = membresias.map(m => ({
      ...m,
      usuarioNombre: usuarios.find(u => u.id === m.usuarioId)?.nombre
        + ' ' + (usuarios.find(u => u.id === m.usuarioId)?.apellido || '')
    }));
    this.cdr.detectChanges();
  }

  abrirModal(m?: Membresia) {
    if (m) {
      this.membresiaForm = { ...m };
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
    this.cdr.detectChanges();
  }

  onTipoChange() {
    this.membresiaForm.precio = this.precios[this.membresiaForm.tipo];
    this.calcularFechaFin();
  }

  calcularFechaFin() {
    if (!this.membresiaForm.fechaInicio) return;
    const inicio = new Date(this.membresiaForm.fechaInicio);
    const meses: Record<string, number> = {
      'Mensual': 1,
      'Trimestral': 3,
      'Semestral': 6,
      'Anual': 12
    };
    inicio.setMonth(inicio.getMonth() + meses[this.membresiaForm.tipo]);
    this.membresiaForm.fechaFin = inicio.toISOString().split('T')[0];
  }

  async guardar() {
    try {
      if (this.editando) {
        await this.membresiaService.update(this.membresiaForm);
        this.mostrarMensaje('Membresía actualizada', 'success');
      } else {
        await this.membresiaService.add(this.membresiaForm);
        this.mostrarMensaje('Membresía registrada', 'success');
      }
      await this.cargarDatos();
      this.cerrarModal();
    } catch (e) {
      this.mostrarMensaje('Error al guardar', 'danger');
    }
  }

  async eliminar(id: number) {
    if (confirm('¿Eliminar esta membresía?')) {
      await this.membresiaService.delete(id);
      await this.cargarDatos();
      this.mostrarMensaje('Membresía eliminada', 'warning');
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

  getBadgeClass(tipo: string): string {
    const map: Record<string, string> = {
      'Mensual': 'bg-info',
      'Trimestral': 'bg-primary',
      'Semestral': 'bg-warning text-dark',
      'Anual': 'bg-success'
    };
    return map[tipo] || 'bg-secondary';
  }
}