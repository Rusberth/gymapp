import { Injectable } from '@angular/core';
import { IndexedDbService } from './indexed-db.service';
import { Pago } from '../models/pago.model';

@Injectable({ providedIn: 'root' })
export class PagoService {
  private storeName = 'pagos';

  constructor(private db: IndexedDbService) {}

  getAll(): Promise<Pago[]> {
    return this.db.getAll<Pago>(this.storeName);
  }

  getById(id: number): Promise<Pago> {
    return this.db.getById<Pago>(this.storeName, id);
  }

  getByUsuarioId(usuarioId: number): Promise<Pago[]> {
    return this.db.getByIndex<Pago>(this.storeName, 'usuarioId', usuarioId);
  }

  add(pago: Pago): Promise<number> {
    return this.db.add<Pago>(this.storeName, pago);
  }

  update(pago: Pago): Promise<void> {
    return this.db.update<Pago>(this.storeName, pago);
  }

  delete(id: number): Promise<void> {
    return this.db.delete(this.storeName, id);
  }
}
