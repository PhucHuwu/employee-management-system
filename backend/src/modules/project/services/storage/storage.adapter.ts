export const STORAGE_ADAPTER = Symbol('STORAGE_ADAPTER');

export interface StorageUploadInput {
  content: Buffer;
  fileName: string;
}

export interface StorageAdapter {
  upload(input: StorageUploadInput): Promise<string>;
  download(storageKey: string): Promise<Buffer>;
  delete(storageKey: string): Promise<void>;
}
