<script lang="ts">
  import type { Book } from '../types'
  import LayoutGrid, { Cell } from '@smui/layout-grid'
  import BookComponent from './Book.svelte'
  export let resourceDir: FileSystemDirectoryHandle
  export let books: Record<Book['id'], Book>
  // FIXME: use enum
  export let mode : string// BooksDiaplayMode
  let bookArray: Book[] = []

  $: {
    const bkArr = Object.values(books).sort(
      (a, b) => b.updateAt - a.updateAt
    ).filter((book) => {
      if (mode === 'all') return book.state !== 'trash'
      if (mode === 'trash') return book.state === 'trash'
      return book.state === mode
    })

    bookArray = bkArr
}

</script>

<LayoutGrid>
  {#each bookArray as book (book.id)}
    <Cell span="{4}">
      <BookComponent resourceDir={resourceDir} book={book} {mode} />
    </Cell>
  {/each} 
</LayoutGrid>