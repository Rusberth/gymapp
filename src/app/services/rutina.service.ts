import { Injectable } from '@angular/core';
import { IndexedDbService } from './indexed-db.service';
import { Rutina } from '../models/rutina.model';

@Injectable({ providedIn: 'root' })
export class RutinaService {
  private storeName = 'rutinas';

  constructor(private db: IndexedDbService) {}

  getAll(): Promise<Rutina[]> {
    return this.db.getAll<Rutina>(this.storeName);
  }

  getById(id: number): Promise<Rutina> {
    return this.db.getById<Rutina>(this.storeName, id);
  }

  getByUsuarioId(usuarioId: number): Promise<Rutina[]> {
    return this.db.getByIndex<Rutina>(this.storeName, 'usuarioId', usuarioId);
  }

  add(rutina: Rutina): Promise<number> {
    return this.db.add<Rutina>(this.storeName, rutina);
  }

  update(rutina: Rutina): Promise<void> {
    return this.db.update<Rutina>(this.storeName, rutina);
  }

  delete(id: number): Promise<void> {
    return this.db.delete(this.storeName, id);
  }
}