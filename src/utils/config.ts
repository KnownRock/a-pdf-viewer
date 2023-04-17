import { set, get } from 'idb-keyval'
import type { SimpleFsName } from '../types'

export async function setSimpleFsName (name: SimpleFsName): Promise<void> {
  await set('app:simple-fs', name)
}

export async function getSimpleFsName (): Promise<SimpleFsName> {
  return await get('app:simple-fs') as SimpleFsName
}
