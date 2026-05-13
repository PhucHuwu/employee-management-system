import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import {
  BucketAlreadyOwnedByYou,
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  NoSuchKey,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';
import { StorageAdapter, StorageUploadInput } from './storage.adapter';

export class MinioStorageAdapter implements StorageAdapter {
  private readonly s3Client: S3Client;

  private readonly bucket: string;

  private bucketReady = false;

  constructor(options: {
    endpoint: string;
    region?: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    forcePathStyle?: boolean;
  }) {
    const endpoint = options.endpoint;
    const region = options.region ?? 'us-east-1';
    const accessKeyId = options.accessKeyId;
    const secretAccessKey = options.secretAccessKey;
    this.bucket = options.bucket;

    if (!endpoint || !accessKeyId || !secretAccessKey || !this.bucket) {
      throw new BadRequestException('missing MinIO configuration for storage adapter');
    }

    const forcePathStyle = options.forcePathStyle ?? true;

    this.s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle,
    });
  }

  async upload(input: StorageUploadInput): Promise<string> {
    await this.ensureBucketExists();

    const storageKey = `${randomUUID()}-${this.normalizeFileName(input.fileName)}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
        Body: input.content,
      }),
    );

    return storageKey;
  }

  async download(storageKey: string): Promise<Buffer> {
    await this.ensureBucketExists();

    try {
      const output = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: storageKey,
        }),
      );

      if (!output.Body) {
        throw new InternalServerErrorException('object content is empty');
      }

      return this.streamToBuffer(output.Body as Readable);
    } catch (error) {
      if (error instanceof NoSuchKey) {
        throw new BadRequestException('document object not found in storage');
      }

      throw error;
    }
  }

  async delete(storageKey: string): Promise<void> {
    await this.ensureBucketExists();

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
      }),
    );
  }

  private normalizeFileName(fileName: string): string {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  private async ensureBucketExists(): Promise<void> {
    if (this.bucketReady) {
      return;
    }

    try {
      await this.s3Client.send(
        new HeadBucketCommand({
          Bucket: this.bucket,
        }),
      );
    } catch {
      try {
        await this.s3Client.send(
          new CreateBucketCommand({
            Bucket: this.bucket,
          }),
        );
      } catch (error) {
        if (!(error instanceof BucketAlreadyOwnedByYou)) {
          throw error;
        }
      }
    }

    this.bucketReady = true;
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      if (typeof chunk === 'string') {
        chunks.push(Buffer.from(chunk));
      } else {
        chunks.push(chunk as Buffer);
      }
    }

    return Buffer.concat(chunks);
  }
}
