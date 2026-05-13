import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { StorageAdapter, StorageUploadInput } from './storage.adapter';

@Injectable()
export class LocalStorageAdapter implements StorageAdapter {
  private readonly rootDir = join(process.cwd(), '.local-storage', 'project-documents');

  async upload(input: StorageUploadInput): Promise<string> {
    await mkdir(this.rootDir, { recursive: true });

    const storageKey = `${randomUUID()}-${this.normalizeFileName(input.fileName)}`;
    const filePath = join(this.rootDir, storageKey);
    await writeFile(filePath, input.content);

    return storageKey;
  }

  async download(storageKey: string): Promise<Buffer> {
    const filePath = join(this.rootDir, storageKey);
    return readFile(filePath);
  }

  async delete(storageKey: string): Promise<void> {
    const filePath = join(this.rootDir, storageKey);
    await rm(filePath, { force: true });
  }

  private normalizeFileName(fileName: string): string {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  }
}
