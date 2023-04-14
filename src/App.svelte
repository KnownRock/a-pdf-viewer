<script lang="ts">
  import BookShelf from './lib/BookShelf.svelte'
  import Loading from './lib/Loading.svelte'
  import PermissionCheck from './lib/PermissionCheck.svelte'
  import { isLoading } from 'svelte-i18n'

  import { simpleFs as simpleFsStore } from './store'
  import Viewer from './lib/Viewer.svelte'
  import type { SimpleFs } from './types'

  // let resourceDir: FileSystemDirectoryHandle | null = null
  // resource.subscribe((value) => {
  //   resourceDir = value.resourceDir
  // })

  let simpleFs: SimpleFs | null = null
  simpleFsStore.subscribe((value) => {
    simpleFs = value.simpleFs
  })


  import { Router, Route } from 'svelte-routing'
  

  const url = ''
</script>

{#if $isLoading}
  <div>loading...</div>
{:else}
  <Loading />
  <PermissionCheck />

  {#if simpleFs}
    <Router url="{url}">
      <Route path="/book/:id" let:params >
        <Viewer simpleFs={simpleFs} bookId={params.id} />
      </Route>

      <Route path="/*" >
        <BookShelf simpleFs={simpleFs}  />
      </Route>
    </Router>

  {:else}
    <div>no resourceDir</div>
  {/if}

  
{/if}

<style>

</style>
