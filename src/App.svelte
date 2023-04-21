<script lang="ts">
  import Loading from './lib/Loading.svelte'
  import { isLoading } from 'svelte-i18n'

  import { simpleFs as simpleFsStore } from './store'
  import { SimpleFsName, type SimpleFs } from './types'

  let simpleFs: SimpleFs | null = null
  simpleFsStore.subscribe((value) => {
    simpleFs = value.simpleFs
  })

  import { Router, Route } from 'svelte-routing'
  import { onMount } from 'svelte'
  import { getSimpleFs } from './utils/simple-fs'
  import Message from './lib/Message.svelte'
  import Delay from './lib/general/Delay.svelte'

  onMount(() => {
    async function main () {
      const simpleFsName = SimpleFsName.idb
      const simpleFs = await getSimpleFs(simpleFsName)
      simpleFsStore.set({ simpleFs })
    }

    main()
  })
  

  const url = ''
</script>

{#if $isLoading}
  <Delay>
    <Loading isStaticallyLoading={true} />
  </Delay>
{:else}
  <Message />
  <Loading />


  <Router url="{url}">
    <Route path="/book/:id" let:params >
      {#await import('./lib/Viewer.svelte').then((module) => module.default)}
        <Loading isStaticallyLoading={true} />
      {:then Viewer}
        <Viewer simpleFs={simpleFs} bookId={params.id} />
      {/await}
    </Route>

    <Route path="/*" >
      {#await import('./lib/BookShelf.svelte').then((module) => module.default)}
        <Loading isStaticallyLoading={true} />
      {:then BookShelf}
        <BookShelf simpleFs={simpleFs}  />
      {/await}
    </Route>
  </Router>



  
{/if}

<style>

</style>
