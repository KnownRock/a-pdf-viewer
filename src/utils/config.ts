import { set, get } from 'idb-keyval'
import type { S3Config, SimpleFsName } from '../types'

export async function setSimpleFsName (name: SimpleFsName): Promise<void> {
  await set('app:simple-fs', name)
}

export async function getSimpleFsName (): Promise<SimpleFsName> {
  return await get('app:simple-fs') as SimpleFsName
}

export async function setS3Config (options: S3Config): Promise<void> {
  await set('app:s3', options)
}

export async function getS3Config (): Promise<S3Config> {
  const result = await get('app:s3')
  return {
    accessKeyId: result?.accessKeyId ?? '',
    secretAccessKey: result.secretAccessKey ?? '',
    region: result.region ?? '',
    endpoint: result.endpoint ?? '',
    bucket: result.bucket ?? '',
    prefix: result.prefix ?? ''
  }
}
