<script lang="ts">
  import BookShelf from './lib/BookShelf.svelte'
  import Loading from './lib/Loading.svelte'
  import PermissionCheck from './lib/PermissionCheck.svelte'
  import { isLoading } from 'svelte-i18n'

  import { resource } from './store'

  let resourceDir: FileSystemDirectoryHandle | null = null
  resource.subscribe((value) => {
    resourceDir = value.resourceDir
  })

</script>

{#if $isLoading}
  <div>loading...</div>
{:else}
  <Loading />
  <PermissionCheck />

  {#if resourceDir}
    <main>
      <BookShelf resourceDir={resourceDir} />
    </main>
  {:else}
    <div>no resourceDir</div>
  {/if}
{/if}

<style>
  main{
    height: 100vh;
    width: 100vw;

    overflow: hidden;

    /* display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center; */
  }
  
</style>
