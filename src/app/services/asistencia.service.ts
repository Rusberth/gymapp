import { Injectable } from '@angular/core';
import { IndexedDbService } from './indexed-db.service';
import { Asistencia } from '../models/asistencia.model';

@Injectable({ providedIn: 'root' })
export class AsistenciaService {
  private storeName = 'asistencias';

  constructor(private db: IndexedDbService) {}

  getAll(): Promise<Asistencia[]> {
    return this.db.getAll<Asistencia>(this.storeName);
  }

  getById(id: number): Promise<Asistencia> {
    return this.db.getById<Asistencia>(this.storeName, id);
  }

  getByUsuarioId(usuarioId: number): Promise<Asistencia[]> {
    return this.db.getByIndex<Asistencia>(this.storeName, 'usuarioId', usuarioId);
  }

  add(asistencia: Asistencia): Promise<number> {
    return this.db.add<Asistencia>(this.storeName, asistencia);
  }

  update(asistencia: Asistencia): Promise<void> {
    return this.db.update<Asistencia>(this.storeName, asistencia);
  }

  delete(id: number): Promise<void> {
    return this.db.delete(this.storeName, id);
  }
}
