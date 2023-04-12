<script lang="ts">
  import type { Book } from '../types'
  import { onMount } from 'svelte'
  import Paper from '@smui/paper'
  import TextField from '@smui/textfield'
  import IconButton from '@smui/icon-button/src/IconButton.svelte'
  import { deleteBook, updateBook } from '../store/state'
  import { t } from 'svelte-i18n'

  export let resourceDir: FileSystemDirectoryHandle
  export let book: Book
  import Ripple from '@smui/ripple'
  
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

</script>


<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; ">
  <div use:Ripple={{ surface: true }}>
    <Paper>
      <div class="operation">
        <IconButton class="material-icons" on:click={() => {
          deleteBook(book.id)
         }}>delete</IconButton>
      </div>
      <div style="width:220px; height:300px; display:flex; justify-content:center;  ">
        <img 
          style="width:100%; height:100%; object-fit:contain; "
          src={cover} alt={book.title} />
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
            updateBook(book.id, 'title', bookTitle)
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
    z-index: 1;
  }
</style>