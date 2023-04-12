<script lang="ts">
  import Button from '@smui/button'
  import { sha1 } from 'hash-wasm'
  import { getPdfMetaInfo } from '../utils/pdf'
  import Books from './Books.svelte'
  import type { Book, Event } from '../types/index'
  export let resourceDir: FileSystemDirectoryHandle

  import { state } from '../store'
  import { addBook } from '../store/state'

  let books = {} as Record<Book['id'], Book>
  let events = [] as Event[]

  let isInitiated = false

  state.subscribe((value) => {
    books = value.books
    events = value.events
    isInitiated = value.isInitiated
  })


  async function saveBookToResourceDir (fileHandle: FileSystemFileHandle) : Promise<Book['id']> {
    const file = await fileHandle.getFile()
    const start = performance.now()
    const hash = await sha1(new Uint8Array(await file.arrayBuffer()))
    const end = performance.now()
    console.log(`file size:${
      (file.size / 1024 / 1024).toFixed(2)
    }M hash: ${
      (end - start).toFixed(2)
    }ms, ${
      hash
    }`)

    // get or create books folder
    const booksFolderHandle = await resourceDir.getDirectoryHandle('books', {
      create: true
    })

    // get or create book file
    const bookFileHandle = await booksFolderHandle.getFileHandle(`${hash}.pdf`, {
      create: true
    })

    // save book file
    const writer = await bookFileHandle.createWritable()
    await writer.write(await file.arrayBuffer())
    await writer.close()


    const bookCapture = await booksFolderHandle.getFileHandle(`${hash}.png`, {
      create: true
    })
  
    const writer2 = await bookCapture.createWritable()
    const { capture, pages } = await getPdfMetaInfo(fileHandle)
    await writer2.write(capture)
    await writer2.close()

    if (books[hash]) {
      return hash
    }


    addBook({
      id: hash,
      title: fileHandle.name,
      process: 1,
      pages,
      updateAt: Date.now()
    })


    return hash
  }

  async function addBooks () {
    // open a folder picker
    const handle = await window.showDirectoryPicker({
      mode: 'read',
      startIn: 'documents'
    })


    // get files recursively
    async function getFiles (handle: FileSystemDirectoryHandle) {
      const entries = handle.values()
      for await (const entry of entries) {
        if (entry.kind === 'file') {
          if (entry.name.endsWith('.pdf')) {
            const id = await saveBookToResourceDir(entry)
            console.log(id)
          }
        } else {
          await getFiles(entry)
        }
      }
    }

    await getFiles(handle)
    // save books
    const booksFileHandle = await resourceDir.getFileHandle('books.json', {
      create: true
    })
    const booksFile = await booksFileHandle.createWritable()
    await booksFile.write(JSON.stringify(books))
    await booksFile.close()


    // save events
    const eventFileHandle = await resourceDir.getFileHandle('events.json', {
      create: true
    })
    const eventFile = await eventFileHandle.createWritable()
    await eventFile.write(JSON.stringify(events))
    await eventFile.close()

    events = events
  }
  
</script>
<div>
  {#if !isInitiated}
    <h1>loading...</h1>
  {:else}
    <h1>initiated</h1>

    <Button on:click={() => { addBooks() }}>
      add
    </Button>

    <Books resourceDir={resourceDir} books={books}></Books>

    <!-- <h1>bs: {JSON.stringify(books)}</h1> -->
    <!-- <h1>events: {JSON.stringify(events)}</h1> -->

  {/if}
  <!-- <h1>resourceDir: {resourceDir}</h1> -->

</div>