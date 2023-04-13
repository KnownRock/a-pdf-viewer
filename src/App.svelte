<script lang="ts">
  import BookShelf from './lib/BookShelf.svelte'
  import Loading from './lib/Loading.svelte'
  import PermissionCheck from './lib/PermissionCheck.svelte'
  import { isLoading } from 'svelte-i18n'

  import { resource } from './store'
  import Viewer from './lib/Viewer.svelte'

  let resourceDir: FileSystemDirectoryHandle | null = null
  resource.subscribe((value) => {
    resourceDir = value.resourceDir
  })

  import { Router, Route } from 'svelte-routing'


  const url = ''
</script>

{#if $isLoading}
  <div>loading...</div>
{:else}
  <Loading />
  <PermissionCheck />

  {#if resourceDir}
    <Router url="{url}">
      <Route path="/book/:id" let:params >
        <Viewer resourceDir={resourceDir} bookId={params.id} />
      </Route>

      <Route path="/*" >
        <BookShelf resourceDir={resourceDir}  />
      </Route>
    </Router>

  {:else}
    <div>no resourceDir</div>
  {/if}

  
{/if}

<style>

</style>
