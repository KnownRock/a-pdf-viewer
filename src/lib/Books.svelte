<script lang="ts">
  import type { Book } from '../types'
  import LayoutGrid, { Cell } from '@smui/layout-grid'
  import BookComponent from './Book.svelte'
  export let resourceDir: FileSystemDirectoryHandle
  export let books: Record<Book['id'], Book>

</script>

<LayoutGrid>
  {#each Object.values(books).sort(
    (a, b) => b.updateAt - a.updateAt
  ) as book (book.id)}
    <Cell span="{4}">
      <BookComponent resourceDir={resourceDir} book={book} />
    </Cell>
  {/each} 
</LayoutGrid>