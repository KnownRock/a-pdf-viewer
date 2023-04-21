
import type { HttpRequest } from '@aws-sdk/types'
import type { S3Client } from '@aws-sdk/client-s3'
import type {
  S3Config, SimpleFs,
  ReadMode, ReadModeResult
} from '../types'

export async function getS3 (): Promise<SimpleFs> {
  console.log('s3 loaded')
  const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = await import('@aws-sdk/client-s3')
  const { SignatureV4 } = await import('@aws-sdk/signature-v4')
  const { Sha256 } = await import('@aws-crypto/sha256-browser')

  async function putObject (s3: S3Client, bucket: string, path: string, data: string | ArrayBuffer): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: path,
      Body: data
    })
    await s3.send(command)
  }

  async function getObject (s3: S3Client, bucket: string, path: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: path
    })
    const result = await s3.send(command)
    return result.Body.transformToString()
  }

  async function getObjectBuffer (s3: S3Client, bucket: string, path: string): Promise<ArrayBuffer> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: path
    })
    const result = await s3.send(command)
    return result.Body.transformToArrayBuffer()
  }

  async function deleteObject (s3: S3Client, bucket: string, path: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: path
    })

    await s3.send(command)
  }

  async function existsObject (s3: S3Client, bucket: string, path: string): Promise<boolean> {
    try {
      await getObject(s3, bucket, path)
      return true
    } catch (e) {
      return false
    }
  }

  function getS3Client ({
    region,
    accessKeyId,
    secretAccessKey,
    endpoint
  }): S3Client {
    const signatureV4 = new SignatureV4({
      credentials: {
        accessKeyId,
        secretAccessKey
      },
      region,
      service: 's3',
      sha256: Sha256
    })

    const s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      },
      endpoint,
      forcePathStyle: true,
      signer: async () => ({
        sign: async (request: HttpRequest) => {
          request.headers.host = `${request.hostname}:${(request.port as number)}`
          const authorizatedRequest = await signatureV4.sign(request)
          return authorizatedRequest
        }
      })
    })

    return s3
  }

  return new class S3 implements SimpleFs {
    private s3: S3Client | null = null
    private bucket: string | null = null
    private prefix: string | null = null

    async init ({
      accessKeyId,
      secretAccessKey,
      region,
      bucket,
      endpoint,
      prefix
    }: S3Config): Promise<void> {
      this.s3 = getS3Client({
        accessKeyId,
        secretAccessKey,
        region,
        endpoint
      })

      this.bucket = bucket
      this.prefix = prefix
    }

    private getPrefixedPath (path: string): string {
      return this.prefix === null ? path : `${this.prefix}${path}`
    }

    async write (path: string, data: string | ArrayBuffer): Promise<void> {
      if (this.s3 == null || this.bucket == null) {
        throw new Error('Not initialized')
      }

      const newPath = this.getPrefixedPath(path)

      await putObject(
        this.s3,
        this.bucket,
        newPath,
        data
      )
    }

    async read (path: string, mode: ReadMode): Promise<ReadModeResult[ReadMode]> {
      if (this.s3 == null || this.bucket == null) {
        throw new Error('Not initialized')
      }

      const newPath = this.getPrefixedPath(path)

      try {
        if (mode === 'text') {
          const result = await getObject(
            this.s3,
            this.bucket,
            newPath
          )
          return result
        } else if (mode === 'arrayBuffer') {
          const result = await getObjectBuffer(
            this.s3,
            this.bucket,
            newPath
          )
          return result
        }
      } catch (e) {
        if (e.name === 'NoSuchKey') {
          // throw new Error('File not found')
          return undefined
        } else {
          throw e
        }
      }
    }

    async delete (path: string): Promise<void> {
      if (this.s3 == null || this.bucket == null) {
        throw new Error('Not initialized')
      }

      const newPath = this.getPrefixedPath(path)

      await deleteObject(
        this.s3,
        this.bucket,
        newPath
      )
    }

    async exists (path: string): Promise<boolean> {
      if (this.s3 == null || this.bucket == null) {
        throw new Error('Not initialized')
      }

      const newPath = this.getPrefixedPath(path)

      return await existsObject(
        this.s3,
        this.bucket,
        newPath
      )
    }
  }()
}
