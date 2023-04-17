import { fsApiRequest, permission, resource } from '../store'
import { get, set } from 'idb-keyval'
let isRequesting = false
const resquests: Array<[(handle: FileSystemDirectoryHandle) => void, (err: Error) => void]> = []

export async function getResourceDir (): Promise<FileSystemDirectoryHandle> {
  if (isRequesting) {
    return await new Promise((resolve, reject) => {
      resquests.push([resolve, reject])
    })
  }
  isRequesting = true

  const handle = await new Promise<FileSystemDirectoryHandle>((resolve, reject) => {
    permission.set({
      isShow: true,
      callback: (res) => {
        if (res !== null) {
          resolve(res)
        } else {
          reject(new Error('User denied permission'))
        }
      }
    })
  }).then((handle) => {
    isRequesting = false
    resquests.forEach(([resolve]) => { resolve(handle) })
    return handle
  }).catch((err) => {
    isRequesting = false
    resquests.forEach(([_, reject]) => { reject(err) })
    throw err
  })

  return handle
}

export async function verifyPermission (fileHandle: FileSystemDirectoryHandle, mode: FileSystemPermissionMode = 'readwrite'): Promise<boolean> {
  if ((await fileHandle.queryPermission({
    mode
  })) === 'granted') {
    return true
  }

  let resolver: () => void = () => {}
  let rejecter: (err: Error) => void = (err: Error) => { throw err }
  const promise = new Promise<void>((resolve, reject) => {
    resolver = resolve
    rejecter = reject
  })

  fsApiRequest.set({
    isShow: true,
    callback: async () => {
      if ((await fileHandle.requestPermission({
        mode
      })) === 'granted') {
        resolver()
      } else {
        rejecter(new Error('User denied permission'))
      }
    }
  })

  await promise

  return false
}

export async function initResourceDir (): Promise<void> {
  const handle = await get<FileSystemDirectoryHandle>('resourceDir')
  if (handle !== undefined) {
    if (await verifyPermission(handle)) {
      resource.set({ resourceDir: handle })
      return
    }
  }

  const newHandle = await getResourceDir()
  resource.set({ resourceDir: newHandle })
  await set('resourceDir', newHandle)
}
