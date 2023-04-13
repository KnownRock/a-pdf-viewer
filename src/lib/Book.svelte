<script lang="ts">
  import type { Book } from '../types'
  import { onMount } from 'svelte'
  import Paper from '@smui/paper'
  import TextField from '@smui/textfield'
  import IconButton from '@smui/icon-button/src/IconButton.svelte'
  import { deleteBook, updateBookState, updateBookTitle } from '../store/state'
  import { t } from 'svelte-i18n'
  import { navigate } from 'svelte-routing'
  export let resourceDir: FileSystemDirectoryHandle
  export let book: Book
  export let mode: string
  import Ripple from '@smui/ripple'
  // import { viewer } from '../store'
  import bookPng from '../assets/book.png'
  let cover = ''

  let bookTitle = book.title

  onMount(async () => {
    const booksFolderHandle = await resourceDir.getDirectoryHandle('books', {
      create: true
    })
    const coverFileHandle = await booksFolderHandle.getFileHandle(`${book.id}.png`, {
      create: true
    })
    const coverFile = await coverFileHandle.getFile()
    const coverBlob = await coverFile.slice(0, coverFile.size, 'image/png')
    const coverUrl = URL.createObjectURL(coverBlob)
    cover = coverUrl
  })

  function setCurrentBook (book: Book) {
    // viewer.update((value) => {
    //   value.bookId = book.id
    //   return value
    // })
    navigate(`/book/${book.id}`)
  }

</script>


<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; ">
  <div use:Ripple={{ surface: true }}>

    <Paper on:click={() => {
      setCurrentBook(book)
    }}>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div class="operation" on:click={e => { e.stopPropagation() }}>
        {#if mode === 'trash'}
          <!-- restore -->
          <IconButton class="material-icons"
            style="color: #4caf50;"
            on:click={() => {
              updateBookState(book.id, 'reading')
          }}>
            undo
          </IconButton>

        {:else}
          <IconButton class="material-icons"
            style="color: #2196f3;"
            on:click={() => {
              if (book.state === 'bookmark') {
                updateBookState(book.id, 'reading')
              } else {
                updateBookState(book.id, 'bookmark')
              }
          }}>
            {#if book.state === 'bookmark'}
              bookmark
            {:else}
              bookmark_border
            {/if}
          </IconButton>
        {/if}

        <IconButton class="material-icons"
          style="color: #f44336;"
          on:click={() => {
            if (mode === 'trash') {
              deleteBook(book.id)
            } else {
              updateBookState(book.id, 'trash')
            }
        }}>
          {#if mode === 'trash'}
            delete_forever
          {:else}
            delete
          {/if}
        </IconButton>
      </div>
      <div style="width:220px; height:300px; display:flex; justify-content:center;  ">
        <img 
          style="width:100%; height:100%; object-fit:contain; "
          src={cover || bookPng} alt={book.title} />
      </div>
    </Paper>

  </div>
  <div style="display:flex; justify-content:center; ">
    <!-- <h5>{book.title}</h5> -->
    <TextField
      label={$t('book.title')}
      bind:value={bookTitle}
    >
      <div slot="trailingIcon">
        {#if bookTitle !== book.title}
          <IconButton class="material-icons" on:click={() => {
            updateBookTitle(book.id, bookTitle)
           }}>save</IconButton>
        {/if}
      </div>
        
      
    </TextField>

  </div>
</div>

<style>
  .operation {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 1;

    display: flex;
    justify-content: space-between;
  }

</style>