<script lang="ts">
  import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar'
  import IconButton from '@smui/icon-button'
  import { navigate } from 'svelte-routing'
  import type { Book } from '../../types'

  export let book: Book
  export let scaleUp: () => void
  export let scaleDown: () => void
  export let resetScaleAndOffset: () => void
  export let downloadBook: () => void
  export let printBook: () => void
  export let updateBookState: (id: string, state: Book['state']) => void
  
</script>
<TopAppBar
  prominent
  variant="static"
  dense
>
  <Row>
    <Section>
      <IconButton class="material-icons" aria-label="Back"
        on:click={() => {
          navigate('/')
        }}
        >arrow_back</IconButton
      >
      <!-- <IconButton class="material-icons">menu</IconButton> -->
      <Title>
        {book.title}
      </Title>
    </Section>
    <Section align="end" toolbar>
      <!-- back -->

      <!-- scaleUp -->
      <IconButton class="material-icons" aria-label="Scale up"
        on:click={() => {
          scaleUp()
        }}
      >
        zoom_in
      </IconButton>

      <!-- scaleDown -->
      <IconButton class="material-icons" aria-label="Scale down"
        on:click={() => {
          scaleDown()
        }}
      >
        zoom_out
      </IconButton>

      <!-- reset -->
      <IconButton class="material-icons" aria-label="Reset"
        on:click={() => {
          resetScaleAndOffset()
        }}
      >
        settings_backup_restore
      </IconButton>
      

      <IconButton class="material-icons" aria-label="Download"
        on:click={downloadBook}
        >file_download</IconButton
      >
      <IconButton class="material-icons" aria-label="Print this page"
        on:click={printBook}
        >print</IconButton
      >
      <IconButton class="material-icons" aria-label="Bookmark this page"
        on:click={() => {
          if (book) {
            updateBookState(book.id, book?.state === 'bookmark' ? 'reading' : 'bookmark')
          }
        }}
        >{
        book?.state === 'bookmark' ? 'bookmark' : 'bookmark_border'
        }</IconButton
      >
    </Section>
  </Row>
</TopAppBar>