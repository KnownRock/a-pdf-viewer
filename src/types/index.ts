
export interface Book {
  id: string
  title: string

  process: number
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
    prop: 'process'
    process: Book['process']
  }
}) & {
  timestamp: number
}
