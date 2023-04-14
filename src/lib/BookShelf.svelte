<script lang="ts">
  import { sha1 } from 'hash-wasm'
  import { getPdfMetaInfo } from '../utils/pdf'
  import Books from './Books.svelte'
  import type { Book, Event, SimpleFs } from '../types/index'
  
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
  import List, { Graphic, Item, Separator, Subheader, Text } from '@smui/list'

  export let simpleFs: SimpleFs

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
  
    simpleFs.write(`books/${hash}.pdf`, await file.arrayBuffer())
    const { capture, pages } = await getPdfMetaInfo(fileHandle)
    simpleFs.write(`books/${hash}.png`, capture)
  
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
              <!-- <Icon class="material-icons">home</Icon> -->
              <Graphic class="material-icons" aria-hidden="true">home</Graphic>
              <Text>{
                $t('drawer.home')
              }</Text>
            </Item>

            <Item on:click={() => { navigate('/bookmark') }}>
              <Graphic class="material-icons" aria-hidden="true">bookmark</Graphic>
              <Text>{
                $t('drawer.bookmark')
                }</Text>
            </Item>
            <Item on:click={() => { navigate('/new') }}>
              <Graphic class="material-icons" aria-hidden="true">
                new_label
              </Graphic>
              <Text>
                {
                  $t('drawer.new')
                }
              </Text>
            </Item>
            <Item on:click={() => { navigate('/reading') }}>
              <Graphic class="material-icons" aria-hidden="true">
                book
              </Graphic>
              <Text>
                {
                  $t('drawer.reading')
                }
              </Text>
            </Item>
            <Item on:click={() => { navigate('/done') }}>
              <Graphic class="material-icons" aria-hidden="true">
                done
              </Graphic>
              <Text>
                {
                  $t('drawer.done')
                }
              </Text>
            </Item>
            <Item on:click={() => { navigate('/trash') }} >
              <Graphic class="material-icons" aria-hidden="true">
                delete
              </Graphic>
              <Text>
                {
                  $t('drawer.trash')
                }
              </Text>
            </Item>
            <Separator />
            <Subheader tag="h6">
              {
                $t('drawer.subheader')
              }
            </Subheader>
            <Item on:click={() => { navigate('/setting') }}>
              <Graphic class="material-icons" aria-hidden="true">
                settings
              </Graphic>
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
            <Books simpleFs={simpleFs} books={books} mode="all"></Books>
          </Route>
          <Route path="/setting" >
            setting
          </Route>

          <Route path="/:mode" let:params>
            <Books simpleFs={simpleFs} books={books} mode={params.mode}></Books>
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