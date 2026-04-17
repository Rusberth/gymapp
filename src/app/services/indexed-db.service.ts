import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IndexedDbService {
  private dbName = 'GymAppDB';
  private dbVersion = 2;
  private db: IDBDatabase | null = null;

  async openDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('usuarios')) {
          const usuariosStore = db.createObjectStore('usuarios', { keyPath: 'id', autoIncrement: true });
          usuariosStore.createIndex('email', 'email', { unique: true });
        }
        if (!db.objectStoreNames.contains('membresias')) {
          const membresiasStore = db.createObjectStore('membresias', { keyPath: 'id', autoIncrement: true });
          membresiasStore.createIndex('usuarioId', 'usuarioId', { unique: false });
        }
        if (!db.objectStoreNames.contains('rutinas')) {
          const rutinasStore = db.createObjectStore('rutinas', { keyPath: 'id', autoIncrement: true });
          rutinasStore.createIndex('usuarioId', 'usuarioId', { unique: false });
        }
        if (!db.objectStoreNames.contains('pagos')) {
          const pagosStore = db.createObjectStore('pagos', { keyPath: 'id', autoIncrement: true });
          pagosStore.createIndex('usuarioId', 'usuarioId', { unique: false });
          pagosStore.createIndex('fechaPago', 'fechaPago', { unique: false });
        }
        if (!db.objectStoreNames.contains('asistencias')) {
          const asistenciasStore = db.createObjectStore('asistencias', { keyPath: 'id', autoIncrement: true });
          asistenciasStore.createIndex('usuarioId', 'usuarioId', { unique: false });
          asistenciasStore.createIndex('fecha', 'fecha', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };
      request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
    });
  }
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getById<T>(storeName: string, id: number): Promise<T> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async add<T>(storeName: string, item: T): Promise<number> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.add(item);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async update<T>(storeName: string, item: T): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, id: number): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
  
  
