import { Injectable } from '@angular/core';
import { IndexedDbService } from './indexed-db.service';
import { Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private storeName = 'usuarios';

  constructor(private db: IndexedDbService) {}

  getAll(): Promise<Usuario[]> {
    return this.db.getAll<Usuario>(this.storeName);
  }

  getById(id: number): Promise<Usuario> {
    return this.db.getById<Usuario>(this.storeName, id);
  }

  add(usuario: Usuario): Promise<number> {
    return this.db.add<Usuario>(this.storeName, usuario);
  }

  update(usuario: Usuario): Promise<void> {
    return this.db.update<Usuario>(this.storeName, usuario);
  }

  delete(id: number): Promise<void> {
    return this.db.delete(this.storeName, id);
  }
}