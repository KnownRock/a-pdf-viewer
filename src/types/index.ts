
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
