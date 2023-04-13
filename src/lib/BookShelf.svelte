<script lang="ts">
  import { sha1 } from 'hash-wasm'
  import { getPdfMetaInfo } from '../utils/pdf'
  import Books from './Books.svelte'
  import type { Book, Event } from '../types/index'
  export let resourceDir: FileSystemDirectoryHandle
  import { navigate, Router, Route } from 'svelte-routing'
  import { t } from 'svelte-i18n'
  import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar'
  import IconButton from '@smui/icon-button'
  import { state } from '../store'
  import { addBook } from '../store/state'
  import Drawer, {
    AppContent,
    Content,
    Header,
    Title as DrawerTitle,
    Subtitle
  } from '@smui/drawer'
  import List, { Item, Text } from '@smui/list'
  
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
      progress: 1,
      state: 'new',
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
  
  let isDrawerOpen = false
  

  const url = ''
</script>
<div>
  {#if !isInitiated}
    <h1>loading...</h1>
  {:else}
    <!-- <h1>initiated</h1> -->
    

    <div  class="drawer-container">
      <Drawer variant="dismissible" bind:open={isDrawerOpen}>
        <Header>
          <DrawerTitle>{
            $t('drawer.title')
          }</DrawerTitle>
          <Subtitle>
            {
              $t('drawer.subtitle')
            }
          </Subtitle>
        </Header>
        <Content>
          <List>
            <Item on:click={() => { navigate('/') }}>
              <Text>{
                $t('drawer.home')
              }</Text>
            </Item>

            <Item on:click={() => { navigate('/bookmark') }}>
              <Text>{
                $t('drawer.bookmark')
                }</Text>
            </Item>
            <Item on:click={() => { navigate('/new') }}>
              <Text>
                {
                  $t('drawer.new')
                }
              </Text>
            </Item>
            <Item on:click={() => { navigate('/reading') }}>
              <Text>
                {
                  $t('drawer.reading')
                }
              </Text>
            </Item>
            <Item on:click={() => { navigate('/done') }}>
              <Text>
                {
                  $t('drawer.done')
                }
              </Text>
            </Item>
            <Item on:click={() => { navigate('/trash') }} >
              <Text>
                {
                  $t('drawer.trash')
                }
              </Text>
            </Item>
            <Item on:click={() => { navigate('/setting') }}>
              <Text>
                {
                  $t('drawer.setting')
                }
              </Text>
            </Item>
          </List>
        </Content>
      </Drawer>

      <AppContent class="app-content">
        <TopAppBar
          variant="static"
          dense
        >
          <Row>
            <Section>
              <IconButton class="material-icons"
                on:click={() => { isDrawerOpen = !isDrawerOpen }}
              >menu</IconButton>
              <Title>
                {
                  $t('app.title')
                }
              </Title>
            </Section>
            <Section align="end" toolbar>
              <!-- add book --> 
              <IconButton class="material-icons"
                on:click={() => { addBooks() }}
              >add</IconButton>
            </Section>
          </Row>
        </TopAppBar>
        
        <Router url="{url}">
          <Route path="/" >
            <Books resourceDir={resourceDir} books={books} mode="all"></Books>
          </Route>
          <Route path="/setting" >
            setting
          </Route>

          <Route path="/:mode" let:params>
            <Books resourceDir={resourceDir} books={books} mode={params.mode}></Books>
          </Route>

        </Router>

      </AppContent>
      
    </div>

    



    <!-- <h1>bs: {JSON.stringify(books)}</h1> -->
    <!-- <h1>events: {JSON.stringify(events)}</h1> -->

  {/if}
  <!-- <h1>resourceDir: {resourceDir}</h1> -->

</div>


<style>

</style>