import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html'
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuarioForm: Usuario = this.initForm();
  editando = false;
  mostrarModal = false;
  mensaje = '';
  tipoMensaje = '';

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.cargarUsuarios();
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
    this.cdr.detectChanges();
  }

  async guardar() {
    try {
      if (this.editando) {
        await this.usuarioService.update(this.usuarioForm);
        this.mostrarMensaje('Usuario actualizado correctamente', 'success');
      } else {
        await this.usuarioService.add(this.usuarioForm);
        this.mostrarMensaje('Usuario registrado correctamente', 'success');
      }
      await this.cargarUsuarios();
      this.cerrarModal();
    } catch (e) {
      this.mostrarMensaje('Error al guardar el usuario', 'danger');
    }
  }

  async eliminar(id: number) {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      await this.usuarioService.delete(id);
      await this.cargarUsuarios();
      this.mostrarMensaje('Usuario eliminado', 'warning');
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
}