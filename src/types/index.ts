
export interface Book {
  id: string
  title: string

  state: 'bookmark' | 'reading' | 'done' | 'trash' | 'new'
  progress: number
  pages: number
  updateAt: number
}

export type Event = ({
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
}) & {
  timestamp: number
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
  fsapi = 'fsapi'
}
