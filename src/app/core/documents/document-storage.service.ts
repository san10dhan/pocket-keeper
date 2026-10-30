import { Injectable } from '@angular/core';

const DATABASE_NAME = 'pocket-keeper-documents';
const STORE_NAME = 'files';

@Injectable({ providedIn: 'root' })
export class DocumentStorageService {
  private databasePromise?: Promise<IDBDatabase>;

  async save(file: File): Promise<string> {
    const id = crypto.randomUUID();
    const db = await this.openDatabase();

    await this.execute<void>(db, 'readwrite', (store) => store.put(file, id));

    return id;
  }

  async get(id: string): Promise<Blob | undefined> {
    const db = await this.openDatabase();

    return this.execute<Blob | undefined>(db, 'readonly', (store) => store.get(id));
  }

  async delete(id: string): Promise<void> {
    const db = await this.openDatabase();

    await this.execute<void>(db, 'readwrite', (store) => store.delete(id));
  }

  private openDatabase(): Promise<IDBDatabase> {
    if (typeof indexedDB === 'undefined') {
      return Promise.reject(new Error('Document storage is unavailable in this browser.'));
    }

    if (!this.databasePromise) {
      this.databasePromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DATABASE_NAME, 1);

        request.onupgradeneeded = () => {
          const db = request.result;

          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };

        request.onsuccess = () => resolve(request.result);

        request.onerror = () => {
          this.databasePromise = undefined;
          reject(request.error ?? new Error('Unable to open document storage.'));
        };

        request.onblocked = () => {
          reject(new Error('Document storage upgrade is blocked.'));
        };
      });
    }

    return this.databasePromise;
  }

  private execute<T>(
    db: IDBDatabase,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, mode);
      const request = operation(transaction.objectStore(STORE_NAME));

      request.onsuccess = () => resolve(request.result as T);

      request.onerror = () => {
        reject(request.error ?? new Error('Document operation failed.'));
      };

      transaction.onabort = () => {
        reject(transaction.error ?? new Error('Document transaction aborted.'));
      };
    });
  }
}
