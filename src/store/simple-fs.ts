import { writable } from 'svelte/store'
import { getSimpleFs } from '../utils/simple-fs'
import type { SimpleFs, SimpleFsName } from '../types'
const store = writable<{
  simpleFs: SimpleFs | null
}>({
  simpleFs: null
})

export default store

export async function init (name: SimpleFsName): Promise<void> {
  const simpleFs = await getSimpleFs(name)
  store.set({ simpleFs })
}
