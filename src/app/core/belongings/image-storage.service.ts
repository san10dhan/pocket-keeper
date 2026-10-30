import { Injectable } from '@angular/core';

const DATABASE_NAME = 'pocket-keeper-files';
const STORE_NAME = 'images';
const DATABASE_VERSION = 1;

@Injectable({ providedIn: 'root' })
export class ImageStorageService {
  private databasePromise?: Promise<IDBDatabase>;

  async save(file: File): Promise<string> {
    const id = crypto.randomUUID();
    const database = await this.openDatabase();

    await this.request<void>(database, 'readwrite', (store) => store.put(file, id));

    return id;
  }

  async get(id: string): Promise<Blob | undefined> {
    const database = await this.openDatabase();

    return this.request<Blob | undefined>(database, 'readonly', (store) => store.get(id));
  }

  async delete(id: string): Promise<void> {
    const database = await this.openDatabase();

    await this.request<void>(database, 'readwrite', (store) => store.delete(id));
  }

  private openDatabase(): Promise<IDBDatabase> {
    if (typeof indexedDB === 'undefined') {
      return Promise.reject(new Error('Image storage is not available in this browser.'));
    }

    if (!this.databasePromise) {
      this.databasePromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

        request.onupgradeneeded = () => {
          const database = request.result;

          if (!database.objectStoreNames.contains(STORE_NAME)) {
            database.createObjectStore(STORE_NAME);
          }
        };

        request.onsuccess = () => resolve(request.result);

        request.onerror = () => {
          this.databasePromise = undefined;
          reject(request.error ?? new Error('Unable to open image storage.'));
        };

        request.onblocked = () => {
          reject(new Error('Image storage upgrade is blocked.'));
        };
      });
    }

    return this.databasePromise;
  }

  private request<T>(
    database: IDBDatabase,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, mode);
      const request = operation(transaction.objectStore(STORE_NAME));

      request.onsuccess = () => resolve(request.result as T);

      request.onerror = () => {
        reject(request.error ?? new Error('Image storage operation failed.'));
      };

      transaction.onabort = () => {
        reject(transaction.error ?? new Error('Image storage transaction aborted.'));
      };
    });
  }
}
