import { get, set, del, keys } from 'idb-keyval'
import { getResourceDir, verifyPermission } from './files'
import type { SimpleFs, SimpleFsName } from '../types'

interface ReadModeResult {
  'text': string | undefined
  'arrayBuffer': ArrayBuffer | undefined
}

enum ReadMode {
  'text' = 'text',
  'arrayBuffer' = 'arrayBuffer'
}

async function getIdb (): Promise<SimpleFs> {
  const idbFsPrefix = 'idbfs:'
  const idbFs: SimpleFs = {
    async write (path: string, data: string | ArrayBuffer) {
      const key = idbFsPrefix + path
      await set(key, data)
    },
    async read (path: string, mode: 'text' | 'arrayBuffer') {
      const key = idbFsPrefix + path
      const data = await get(key)

      if (mode === 'text') {
        if (typeof data === 'string') {
          return data
        }
        if (data instanceof ArrayBuffer) {
          return new TextDecoder().decode(data)
        }

        // throw new Error('Invalid data type')
        return undefined
      }
      if (mode === 'arrayBuffer') {
        if (data instanceof ArrayBuffer) {
          return data
        }
        if (typeof data === 'string') {
          return new TextEncoder().encode(data)
        }

        if (data instanceof Uint8Array) {
          return data.buffer
        }

        // throw new Error('Invalid data type')
        return undefined
      }

      throw new Error('Invalid mode')
    },
    async delete (path: string) {
      await del(idbFsPrefix + path)
    },
    async exists (path: string) {
      return await keys().then((keys) => keys.includes(idbFsPrefix + path))
    },
    async list (path: string) {
      return (await keys().then((keys) => keys.filter(
        (key) => key.toLocaleString().startsWith(idbFsPrefix + path)
      )) as string[])
      // FIXME: why need to cast to string[]?
    },
    async init () {
      // do nothing
    }

  }
  return idbFs
}

async function getFsApi (): Promise<SimpleFs> {
  const fsApi = new class FsApi implements SimpleFs {
    private resourceDir: FileSystemDirectoryHandle | null = null
    private async initInner (): Promise<void> {
      const handle = await get<FileSystemDirectoryHandle>('app:resourceDir')
      if (handle != null) {
        const result = await verifyPermission(handle)
        if (result) {
          this.resourceDir = handle
          return
        }
      }
      this.resourceDir = await getResourceDir()
      await set('app:resourceDir', this.resourceDir)
    }

    async init (): Promise<void> {
      console.log('init fsApi')
    }

    private async checkResourceDir (): Promise<FileSystemDirectoryHandle> {
      let count = 10
      while (this.resourceDir == null) {
        await this.initInner()
        if (count-- < 0) {
          throw new Error('Failed to get resource directory')
        }
      }

      return this.resourceDir
    }

    async write (path: string, data: string | ArrayBuffer): Promise<void> {
      const resourceDir = await this.checkResourceDir()

      const paths = path.split('/')
      async function createDir (dir: FileSystemDirectoryHandle, paths: string[]): Promise<FileSystemDirectoryHandle> {
        if (paths.length === 0) {
          return await Promise.resolve(dir)
        }
        const p = paths.shift() as string
        return await dir.getDirectoryHandle(p, { create: true }).then(async (dir) => await createDir(dir, paths))
      }

      const dir = await createDir(resourceDir, paths.slice(0, paths.length - 1))

      const file = await dir.getFileHandle(paths[paths.length - 1], { create: true })
      const writer = await file.createWritable()
      await writer.write(data)
      await writer.close()
    }

    async read (path: string, mode: ReadMode): Promise<ReadModeResult[ReadMode]> {
      const resourceDir = await this.checkResourceDir()

      const paths = path.split('/')
      async function getDir (dir: FileSystemDirectoryHandle, paths: string[]): Promise<FileSystemDirectoryHandle> {
        if (paths.length === 0) {
          return await Promise.resolve(dir)
        }
        const p = paths.shift() as string
        return await dir.getDirectoryHandle(p).then(async (dir) => await getDir(dir, paths))
      }

      const dir = await getDir(resourceDir, paths.slice(0, paths.length - 1))

      const file = await dir.getFileHandle(paths[paths.length - 1])
      const fileHandle = await file.getFile()

      if (mode === 'text') {
        return await fileHandle.text()
      } else if (mode === 'arrayBuffer') {
        return await fileHandle.arrayBuffer()
      }

      throw new Error('Invalid mode')
    }

    async delete (path: string): Promise<void> {
      const resourceDir = await this.checkResourceDir()

      const paths = path.split('/')
      async function getDir (dir: FileSystemDirectoryHandle, paths: string[]): Promise<FileSystemDirectoryHandle> {
        if (paths.length === 0) {
          return await Promise.resolve(dir)
        }
        const p = paths.shift() as string
        return await dir.getDirectoryHandle(p).then(async (dir) => await getDir(dir, paths))
      }

      const dir = await getDir(resourceDir, paths.slice(0, paths.length - 1))

      await dir.removeEntry(paths[paths.length - 1])
    }

    async exists (path: string): Promise<boolean> {
      const resourceDir = await this.checkResourceDir()

      const paths = path.split('/')
      async function getDir (dir: FileSystemDirectoryHandle, paths: string[]): Promise<FileSystemDirectoryHandle> {
        if (paths.length === 0) {
          return await Promise.resolve(dir)
        }
        const p = paths.shift() as string
        return await dir.getDirectoryHandle(p).then(async (dir) => await getDir(dir, paths))
      }

      const dir = await getDir(resourceDir, paths.slice(0, paths.length - 1))

      return await dir.getFileHandle(paths[paths.length - 1]).then(() => true).catch(() => false)
    }

    async list (path: string): Promise<string[]> {
      const resourceDir = await this.checkResourceDir()

      const paths = path.split('/')
      async function getDir (dir: FileSystemDirectoryHandle, paths: string[]): Promise<FileSystemDirectoryHandle> {
        if (paths.length === 0) {
          return await Promise.resolve(dir)
        }
        const p = paths.shift() as string
        return await dir.getDirectoryHandle(p).then(async (dir) => await getDir(dir, paths))
      }

      const dir = await getDir(resourceDir, paths.slice(0, paths.length - 1))

      const entries = dir.values()
      const result: string[] = []
      for await (const entry of entries) {
        result.push(entry.name)
      }
      return result
    }
  }()

  return fsApi
}

export async function getSimpleFs (
  name: SimpleFsName
): Promise<SimpleFs> {
  if (name === 'idb') {
    const idb = await getIdb()
    await idb.init()
    return idb
  }
  if (name === 'fsapi') {
    const fs = await getFsApi()
    await fs.init()
    return fs
  }
  throw new Error('Invalid name')
}
