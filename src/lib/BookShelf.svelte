<script lang="ts">
  import { sha1 } from 'hash-wasm'
  import { getPdfMetaInfoFromFile } from '../utils/pdf'
  import Books from './Books.svelte'
  import type { Book, Event, SimpleFs } from '../types/index'
  import { navigate, Router, Route } from 'svelte-routing'
  import { t } from 'svelte-i18n'
  import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar'
  import IconButton from '@smui/icon-button'
  import { state } from '../store'
  import { addBook } from '../store/state'
  import { AppContent } from '@smui/drawer'
  import UnSetting from './UnSetting.svelte'
  import Setting from './Setting.svelte'
  import { message } from '../utils/message'
  // import { hide, show } from '../store/loading'
  import Drawer from './Drawer.svelte'
  import NoBooks from './NoBooks.svelte'
  import Loading from './Loading.svelte'
  export let simpleFs: SimpleFs | null
  let books = {} as Record<Book['id'], Book>
  let events = [] as Event[]
  
  let isInitiated = false
  
  state.subscribe((value) => {
    books = value.books
    events = value.events
    isInitiated = value.isInitiated
  })
  

  async function saveBook (
    file: File
  ) {
    if (!simpleFs) {
      console.log('simpleFs is null')
      return
    }
    // const file = files[0]
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
    const { capture, pages } = await getPdfMetaInfoFromFile(file)
    simpleFs.write(`books/${hash}.png`, capture)
  
    if (books[hash]) {
      return hash
    }
  
  
    addBook({
      id: hash,
      title: file.name.replace(/\.pdf$/, ''),
      progress: 1,
      state: 'new',
      pages,
      updateAt: Date.now()
    })
  
  
    return hash
  }

  async function handleAddBook () {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/pdf'
    input.multiple = false
    input.addEventListener('change', async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (!files) {
        return
      }
      saveBook(files[0])
    })

    input.click()
  }
  
  async function handleAddBooks () {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/pdf'
    input.multiple = true
    input.webkitdirectory = true
    input.addEventListener('change', async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (!files) {
        return
      }
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.name.endsWith('.pdf')) {
          await saveBook(file)
        }
      }
    })

    input.click()
  }
  
  let isDrawerOpen = false
  let loadingMessage: undefined | string
  let isLoading = false
  async function handleSync () {
    try {
      // show()
      isLoading = true

      const { getRemoteSimpleFs, syncTwoSimpleFs } = await import('../utils/sync')

      const remoteSimpleFs = await getRemoteSimpleFs()
      const localSimpleFs = simpleFs

      if (!localSimpleFs || !remoteSimpleFs) {
        return
      }

      await syncTwoSimpleFs(localSimpleFs, remoteSimpleFs, (hint) => {
        loadingMessage = hint
      })

      loadingMessage = undefined

      message($t('message.syncSuccess'), 'success')
    } catch (error) {
      message(error.message, 'error')
      navigate('/setting')
    } finally {
      // hide()
      isLoading = false
    }
  }

  const url = ''

</script>
{#if isLoading}
<Loading  isStaticallyLoading={true} message={loadingMessage}/>
{/if}
<div>
  <div class="drawer-container">
    <Drawer bind:isDrawerOpen={isDrawerOpen} />

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
              <Router url="{url}">
                <Route path="/" >
                  {
                    $t('drawer.home')
                  }
                </Route>
                <Route path="/:mode" let:params>
                  {
                    $t(`drawer.${params.mode}`)
                  }
                </Route>
              </Router>
            </Title>
          </Section>
          <Section align="end" toolbar>
            <!-- sync -->
            <IconButton class="material-icons"
              on:click={() => {
                handleSync()
              }}
            >
              sync
            </IconButton>

            <!-- add book --> 
            <IconButton class="material-icons"
              on:click={() => { handleAddBook() }}
            >
              note_add
            </IconButton>
            
            <IconButton class="material-icons"
              on:click={() => { handleAddBooks() }}
            >
              create_new_folder
            </IconButton>

          </Section>
        </Row>
      </TopAppBar>
      
      <Router url="{url}">
        <Route path="/" >
          {#if simpleFs}
            {#if Object.keys(books).length === 0}
              <NoBooks handleAddBooks={handleAddBooks} />
            {:else}
              <Books simpleFs={simpleFs} books={books} mode={'all'}></Books>
            {/if}
          {:else}
            <UnSetting />
          {/if}
        </Route>
        <Route path="/setting" >
          <Setting />
        </Route>

        <Route path="/:mode" let:params>
          {#if simpleFs}
            {#if Object.keys(books).length === 0}
              <NoBooks handleAddBooks={handleAddBooks} />
            {:else}
              <Books simpleFs={simpleFs} books={books} mode={params.mode}></Books>
            {/if}
          {:else}
            <UnSetting />
          {/if}
        </Route>

      </Router>

    </AppContent>
    
  </div>

</div>


<style>

</style>