import { writable } from 'svelte/store'

const store = writable<{
  isShow: boolean
  callback?: (resourceDir: FileSystemDirectoryHandle | null) => void
}>({
      isShow: false
    })

export default store
