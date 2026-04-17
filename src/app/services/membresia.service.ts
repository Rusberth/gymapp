import { Injectable } from '@angular/core';
import { IndexedDbService } from './indexed-db.service';
import { Membresia } from '../models/membresia.model';

@Injectable({ providedIn: 'root' })
export class MembresiaService {
  private storeName = 'membresias';

  constructor(private db: IndexedDbService) {}

  getAll(): Promise<Membresia[]> {
    return this.db.getAll<Membresia>(this.storeName);
  }

  getById(id: number): Promise<Membresia> {
    return this.db.getById<Membresia>(this.storeName, id);
  }

  getByUsuarioId(usuarioId: number): Promise<Membresia[]> {
    return this.db.getByIndex<Membresia>(this.storeName, 'usuarioId', usuarioId);
  }

  add(membresia: Membresia): Promise<number> {
    return this.db.add<Membresia>(this.storeName, membresia);
  }

  update(membresia: Membresia): Promise<void> {
    return this.db.update<Membresia>(this.storeName, membresia);
  }

  delete(id: number): Promise<void> {
    return this.db.delete(this.storeName, id);
  }
}