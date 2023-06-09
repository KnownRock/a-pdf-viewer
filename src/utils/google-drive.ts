import { get, set } from 'idb-keyval'
import type { SimpleFs } from '../types'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY
const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET
const scope = 'https://www.googleapis.com/auth/drive.appdata'
const discoveryDoc = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
const tokenEndpoint = import.meta.env.VITE_GOOGLE_TOKEN_ENDPOINT ??
  'https://www.googleapis.com/oauth2/v4/token'
// https://qiita.com/kenken1981/items/b6cb3e536668a3cef520
// dev env need use localhost instead of 127.0.0.1

// write file
// https://stackoverflow.com/a/68595887/16206535
async function writeFile (
  accessToken: string,
  fileContent: string | ArrayBuffer,
  filename: string,
  mimeType: string
): Promise<void> {
  const file = new Blob([fileContent], { type: mimeType })
  const metadata = {
    name: filename,
    mimeType,
    parents: ['appDataFolder']
  }

  const form = new FormData()
  // metadata with type application/json
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
  form.append('file', file)

  await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true', {
    method: 'POST',
    headers: new Headers({ Authorization: 'Bearer ' + accessToken }),
    body: form
  })
}

async function updateFile (
  accessToken: string,
  fileContent: string | ArrayBuffer,
  fileId: string,
  mimeType: string
): Promise<void> {
  const file = new Blob([fileContent], { type: mimeType })
  await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media&supportsAllDrives=true`, {
    method: 'PATCH',
    headers: new Headers({
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': mimeType
    }),
    body: file
  })
}

async function listFiles (pageSize = 20, q: undefined | string): Promise<Array<{
  id: string
  name: string
}>> {
  const rawOutput = await gapi.client.drive.files.list({
    spaces: 'appDataFolder',
    // TODO: make it more efficient,
    q,
    pageSize,
    fields: 'files(id, name)'
  })

  const body = JSON.parse(rawOutput.body)
  return body.files
}

async function readFile (fileId: string): Promise<string> {
  const result = await gapi.client.drive.files.get({
    fileId,
    alt: 'media'
  })
  return result.body
}

// assume file name not change
const fileCache = new Map<string, string>()
async function findFileIdByFileName (filename: string): Promise<string | undefined> {
  if (fileCache.has(filename)) {
    return fileCache.get(filename)
  }

  const files = await listFiles(1, `name='${filename}'`)
  const file = files.find((file) => file.name === filename)
  if (file !== undefined) {
    fileCache.set(filename, file.id)
    return file.id
  } else {
    return undefined
  }
}

async function deleteFile (filename: string): Promise<void> {
  const fileId = await findFileIdByFileName(filename)
  if (fileId !== undefined) {
    await gapi.client.drive.files.delete({
      fileId
    })
    fileCache.delete(filename)
  }
}

async function getFileContent (filename: string): Promise<string | undefined> {
  const fileId = await findFileIdByFileName(filename)
  if (fileId !== undefined) {
    return await readFile(fileId)
  } else {
    return undefined
  }
}

async function createOrUpdateFile (
  accessToken: string,
  fileContent: string | ArrayBuffer,
  filename: string,
  mimeType: string
): Promise<void> {
  const fileId = await findFileIdByFileName(filename)
  if (fileId !== undefined) {
    await updateFile(
      accessToken,
      fileContent,
      fileId,
      mimeType)
  } else {
    await writeFile(accessToken, fileContent, filename, mimeType)
  }
}

const isLoadedDict: Record<string, Promise<void>> = {}
async function loadExternalScript (src: string): Promise<void> {
  if (isLoadedDict[src] !== undefined) {
    await isLoadedDict[src]
    return
  }

  isLoadedDict[src] = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => {
      resolve()
    }
    script.onerror = () => {
      reject(new Error(`Failed to load script ${src}`))
    }

    document.body.appendChild(script)
  })

  await isLoadedDict[src]
}

// https://stackoverflow.com/a/73986012/16206535
async function blobToDataUrl (blob: Blob): Promise<string> {
  return await new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      resolve(reader.result as string)
    }
    reader.readAsDataURL(blob)
  })
}

async function arrayBufferToBlob (arrayBuffer: ArrayBuffer, mimeType: string): Promise<Blob> {
  return new Blob([arrayBuffer], { type: mimeType })
}

async function dataUrlToBlob (dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl)
  return await response.blob()
}

async function tryCanWriteAndRead (
  accessToken: string
): Promise<boolean> {
  try {
    const filename = 'test.txt'
    const content = Math.random().toString()
    await createOrUpdateFile(accessToken, content, filename, 'text/plain')
    const readContent = await getFileContent(filename)
    return readContent === content
  } catch (error) {
    console.log(error)
    return false
  }
}

export async function clearData (): Promise<void> {
  await loadGapi()

  while (true) {
    const files = await listFiles(20, undefined)
    if (files.length === 0) {
      break
    }
    for (const file of files) {
      await gapi.client.drive.files.delete({
        fileId: file.id
      })
    }
  }
}

let loadingPromise: Promise<void> | undefined
async function loadGapi (): Promise<void> {
  if (loadingPromise !== undefined) {
    await loadingPromise
    return
  }
  loadingPromise = (async () => {
    await loadExternalScript('https://apis.google.com/js/api.js')
    await loadExternalScript('https://accounts.google.com/gsi/client')
    // eslint-disable-next-line no-async-promise-executor, @typescript-eslint/no-misused-promises
    await new Promise<void>(async (resolve, reject) => {
      if (gapi.client === undefined) {
        await new Promise<void>((resolve) => {
          gapi.load('client', () => {
            resolve()
          })
        })

        await gapi.client.init({
          apiKey,
          discoveryDocs: [discoveryDoc]
        })
      }

      async function refreshAccessToken (): Promise<boolean> {
        const refreshToken = await get('app:googleDriveAuthRefreshToken')
        if (refreshToken !== undefined) {
          const tokenResponse = await fetch(tokenEndpoint, {
            method: 'POST',
            body: JSON.stringify({
              refresh_token: refreshToken,
              client_id: clientId,
              client_secret: clientSecret,
              grant_type: 'refresh_token'
            })
          }).then(async (resp) => {
            return await resp.json()
          }).catch((error) => {
            console.log(error)
            return undefined
          })

          if (tokenResponse !== undefined) {
            const accessToken = tokenResponse.access_token
            if (accessToken !== undefined) {
              await set('app:googleDriveAuthAccessToken', accessToken)
              gapi.client.setToken({ access_token: accessToken })
              const canWriteAndRead = await tryCanWriteAndRead(accessToken)
              if (canWriteAndRead) {
                resolve()
                return true
              }
            }
          }

          await set('app:googleDriveAuthAccessToken', undefined)
          await set('app:googleDriveAuthRefreshToken', undefined)

          return false
        }

        return false
      }

      const accessToken = await get('app:googleDriveAuthAccessToken')
      if (accessToken !== undefined) {
        gapi.client.setToken({ access_token: accessToken })
        const canWriteAndRead = await tryCanWriteAndRead(accessToken)
        if (canWriteAndRead) {
          resolve()
          return
        }
      }

      const isFreshed = await refreshAccessToken()
      if (isFreshed) {
        return
      }

      async function handleCodeResponse (response: google.accounts.oauth2.CodeResponse): Promise<void> {
        const code = response.code
        if (code !== undefined) {
          await set('app:googleDriveAuthCode', code)

          let tokenResponse
          for (let retry = 0; retry < 3; retry++) {
            await new Promise<void>((resolve) => {
              setTimeout(() => {
                resolve()
              }, 500)
            })

            tokenResponse = await fetch(tokenEndpoint, {
              method: 'POST',
              body: JSON.stringify({
                code,
                // [redirect_uri, client_secret, client_id] no effect for cloudflare workers
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: 'postmessage',

                grant_type: 'authorization_code'
              })
            }).then(async (resp) => {
              return await resp.json()
            }).catch((error) => {
              console.log(error)
              return undefined
            })

            if (tokenResponse !== undefined) {
              break
            }
          }

          if (tokenResponse !== undefined) {
            const refreshToken = tokenResponse.refresh_token
            if (refreshToken !== undefined) {
              await set('app:googleDriveAuthRefreshToken', refreshToken)
            }
            const accessToken = tokenResponse.access_token
            if (accessToken !== undefined) {
              await set('app:googleDriveAuthAccessToken', accessToken)
              gapi.client.setToken(tokenResponse)
              resolve()
            }
          }
        }

        reject(new Error('Failed to get access token'))
      }

      const client = google.accounts.oauth2.initCodeClient({
        client_id: clientId,
        scope,
        ux_mode: 'popup',
        callback: (response) => {
          handleCodeResponse(response).catch((error) => {
            console.log(error)
            reject(error)
          })
        },
        error_callback: (error) => {
          console.log(error)
          reject(error)
        }
      })

      client.requestCode()
    })
  })()

  await loadingPromise
  loadingPromise = undefined
}

export async function revokeGoogleDrive (): Promise<void> {
  await loadGapi()
  const token = gapi.client.getToken()
  if (token !== null) {
    await new Promise<void>((resolve) => {
      google.accounts.oauth2.revoke(token.access_token, () => { resolve() })
    })
  }

  await set('app:googleDriveAuthAccessToken', undefined)
  await set('app:googleDriveAuthRefreshToken', undefined)
}

export async function getGoogleDriveSimpleFs (): Promise<SimpleFs> {
  await loadExternalScript('https://apis.google.com/js/api.js')
  await loadExternalScript('https://accounts.google.com/gsi/client')

  await loadGapi()

  return {
    async read (path: string, mode: 'text' | 'arrayBuffer'): Promise<string | ArrayBuffer | undefined> {
      console.log(`google-drive-read: ${path}`)
      const text = await getFileContent(path)
      if (text === undefined) {
        return undefined
      }
      if (mode === 'text') {
        return text
      }
      const blob = await dataUrlToBlob(text)
      const arrayBuffer = await blob.arrayBuffer()
      return arrayBuffer
    },
    async write (path: string, content: string | ArrayBuffer): Promise<void> {
      console.log(`google-drive-write: ${path}`)
      let mimeType = 'text/plain'
      if (path.endsWith('.json')) {
        mimeType = 'application/json'
      } else if (path.endsWith('.pdf')) {
        mimeType = 'application/pdf'
      } else if (path.endsWith('.png')) {
        mimeType = 'image/png'
      } else {
        mimeType = typeof content === 'string' ? 'text/plain' : 'application/octet-stream'
      }

      let newContent = content
      if (typeof content !== 'string') {
        newContent = await blobToDataUrl(await arrayBufferToBlob(content, mimeType))
      }

      await createOrUpdateFile(
        gapi.client.getToken().access_token,
        newContent,
        path,
        mimeType
      )
    },
    async delete (path: string): Promise<void> {
      console.log(`google-drive-delete: ${path}`)
      await deleteFile(path)
    },
    async exists (path: string): Promise<boolean> {
      console.log(`google-drive-exists: ${path}`)
      const fileId = await findFileIdByFileName(path)
      return fileId !== undefined
    },
    async init (): Promise<void> {
      // do nothing
    }
  }
}
