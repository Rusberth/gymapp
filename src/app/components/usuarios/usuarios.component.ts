import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './usuarios.html'
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuarioForm: Usuario = this.initForm();
  editando = false;
  mostrarModal = false;
  mensaje = '';
  tipoMensaje = '';
  searchTerm = '';
  errors: Record<string, string> = {};

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.cargarUsuarios();
  }

  get filteredUsuarios(): Usuario[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.usuarios;
    }

    return this.usuarios.filter((usuario) =>
      `${usuario.nombre} ${usuario.apellido}`.toLowerCase().includes(term) ||
      usuario.email.toLowerCase().includes(term) ||
      usuario.telefono.toLowerCase().includes(term)
    );
  }

  get totalUsuarios(): number {
    return this.usuarios.length;
  }

  get nuevosEsteMes(): number {
    return this.usuarios.filter((usuario) => this.daysSince(usuario.fechaRegistro) <= 30).length;
  }

  get promedioEdad(): number {
    if (this.usuarios.length === 0) {
      return 0;
    }

    const total = this.usuarios.reduce((sum, usuario) => sum + usuario.edad, 0);
    return Math.round(total / this.usuarios.length);
  }

  initForm(): Usuario {
    return {
      nombre: '',
      apellido: '',
      edad: 18,
      email: '',
      telefono: '',
      fechaRegistro: new Date().toISOString().split('T')[0]
    };
  }

  async cargarUsuarios() {
    this.usuarios = await this.usuarioService.getAll();
    this.cdr.detectChanges();
  }

  abrirModal(usuario?: Usuario) {
    this.errors = {};

    if (usuario) {
      this.usuarioForm = { ...usuario };
      this.editando = true;
    } else {
      this.usuarioForm = this.initForm();
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
      this.mostrarMensaje('Revisa los campos obligatorios antes de guardar.', 'warning');
      return;
    }

    try {
      const usuarioNormalizado: Usuario = {
        ...this.usuarioForm,
        nombre: this.usuarioForm.nombre.trim(),
        apellido: this.usuarioForm.apellido.trim(),
        email: this.usuarioForm.email.trim().toLowerCase(),
        telefono: this.usuarioForm.telefono.trim()
      };

      if (this.editando) {
        await this.usuarioService.update(usuarioNormalizado);
        this.mostrarMensaje('Cliente actualizado correctamente.', 'success');
      } else {
        await this.usuarioService.add(usuarioNormalizado);
        this.mostrarMensaje('Cliente registrado correctamente.', 'success');
      }

      await this.cargarUsuarios();
      this.cerrarModal();
    } catch {
      this.mostrarMensaje('No se pudo guardar el cliente. Verifica que el correo no esté repetido.', 'danger');
    }
  }

  async eliminar(id: number) {
    if (confirm('¿Deseas eliminar este cliente del sistema?')) {
      await this.usuarioService.delete(id);
      await this.cargarUsuarios();
      this.mostrarMensaje('Cliente eliminado.', 'warning');
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
    const email = this.usuarioForm.email.trim().toLowerCase();
    const telefono = this.usuarioForm.telefono.trim();

    if (!this.usuarioForm.nombre.trim()) {
      errors['nombre'] = 'El nombre es obligatorio.';
    }

    if (!this.usuarioForm.apellido.trim()) {
      errors['apellido'] = 'El apellido es obligatorio.';
    }

    if (!email) {
      errors['email'] = 'El correo es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors['email'] = 'Ingresa un correo válido.';
    }

    if (!telefono) {
      errors['telefono'] = 'El teléfono es obligatorio.';
    } else if (!/^\d{7,12}$/.test(telefono)) {
      errors['telefono'] = 'Usa entre 7 y 12 dígitos.';
    }

    if (this.usuarioForm.edad < 10 || this.usuarioForm.edad > 90) {
      errors['edad'] = 'La edad debe estar entre 10 y 90 años.';
    }

    if (!this.usuarioForm.fechaRegistro) {
      errors['fechaRegistro'] = 'La fecha de registro es obligatoria.';
    }

    this.errors = errors;
    this.cdr.detectChanges();
    return Object.keys(errors).length === 0;
  }

  private daysSince(dateString: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.floor((today.getTime() - new Date(`${dateString}T00:00:00`).getTime()) / 86400000);
  }
}
