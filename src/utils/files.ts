import { permission, resource } from '../store'
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
  if ((await fileHandle.requestPermission({
    mode
  })) === 'granted') {
    return true
  }
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
