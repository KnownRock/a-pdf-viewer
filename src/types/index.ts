
export interface Book {
  id: string
  title: string

  state: 'bookmark' | 'reading' | 'done' | 'trash' | 'new'
  progress: number
  pages: number
  updateAt: number
}

export type EventRaw = ({
  type: 'add' | 'del'
  payload: {
    id: Book['id']
  }
} | {
  type: 'update'
  payload: {
    id: Book['id']
    prop: 'title'
    title: Book['title']
  }
} | {
  type: 'update'
  payload: {
    id: Book['id']
    prop: 'progress'
    progress: Book['progress']
  }
} | {
  type: 'update'
  payload: {
    id: Book['id']
    prop: 'state'
    state: Book['state']
  }
})

export type Event = EventRaw & {
  timestamp: number
  eid: string
}

export type BooksDiaplayMode = 'all' | 'bookmark' | 'reading' | 'done' | 'trash' | 'new'

export interface SimpleFs {
  write: (path: string, data: string | ArrayBuffer) => Promise<void>
  read: (path: string, mode: 'text' | 'arrayBuffer') => Promise<ArrayBuffer | string | undefined>
  // read: {
  //   (path: string, mode: 'text'): Promise<string | undefined>
  //   (path: string, mode: 'arrayBuffer'): Promise<ArrayBuffer | undefined>
  // }
  delete: (path: string) => Promise<void>
  exists: (path: string) => Promise<boolean>
  // list: (path: string) => Promise<string[]>

  init: (
    ...args: any[]
  ) => Promise<void>
}

export enum SimpleFsName {
  idb = 'idb',
  fsapi = 'fsapi',
  // s3 = 's3'
}

export interface S3Config {
  accessKeyId: string
  secretAccessKey: string
  region: string
  bucket: string
  endpoint: string
  prefix: string
}

export type MessageType = 'error' | 'info' | 'success' | 'warning'

export interface ReadModeResult {
  'text': string | undefined
  'arrayBuffer': ArrayBuffer | undefined
}

export enum ReadMode {
  'text' = 'text',
  'arrayBuffer' = 'arrayBuffer'
}
