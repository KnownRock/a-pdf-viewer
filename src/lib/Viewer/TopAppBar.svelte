<script lang="ts">
  import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar'
  import IconButton from '@smui/icon-button'
  import { navigate } from 'svelte-routing'
  import type { Book } from '../../types'
  import { createEventDispatcher } from 'svelte'

  export let book: Book
  export let scaleUp: () => void
  export let scaleDown: () => void
  export let resetScaleAndOffset: () => void
  export let updateBookState: (id: string, state: Book['state']) => void
  export let getBookBuffer: (id: string) => Promise<ArrayBuffer>
  export let mode: 'vertical' | 'horizontal'

  const dispatch = createEventDispatcher()

  async function printBook () {
    const buffer = await getBookBuffer(book.id)
    const blob = new Blob([buffer], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = url
    document.body.appendChild(iframe)
    iframe!.contentWindow!.print()
    URL.revokeObjectURL(url)
  }

  async function downloadBook () {
    const buffer = await getBookBuffer(book.id)
    const blob = new Blob([buffer], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${book?.title}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }
  
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

      {#if mode === 'vertical'}
        <IconButton class="material-icons" aria-label="vertical"
          on:click={() => {
            mode = 'horizontal'

            // modeswitch
            dispatch('modeSwitch', {
              mode: 'horizontal'
            })
          }}
        >vertical_distribute</IconButton>
      {:else}
        <IconButton class="material-icons" aria-label="horizontal"
          on:click={() => {
            mode = 'vertical'

            // modeswitch
            dispatch('modeSwitch', {
              mode: 'vertical'
            })
          }}
        >horizontal_distribute</IconButton>
      {/if}



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