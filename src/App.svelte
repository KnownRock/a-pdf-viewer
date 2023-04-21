<script lang="ts">
  import BookShelf from './lib/BookShelf.svelte'
  import Resume from './lib/Resume.svelte'
  import Loading from './lib/Loading.svelte'
  import PermissionCheck from './lib/PermissionCheck.svelte'
  import { isLoading } from 'svelte-i18n'

  import { simpleFs as simpleFsStore } from './store'
  import Viewer from './lib/Viewer.svelte'
  import { SimpleFsName, type SimpleFs } from './types'

  let simpleFs: SimpleFs | null = null
  simpleFsStore.subscribe((value) => {
    simpleFs = value.simpleFs
  })


  import { Router, Route } from 'svelte-routing'
  import { onMount } from 'svelte'
  import { getSimpleFs } from './utils/simple-fs'
  import Message from './lib/Message.svelte'
  // import { getSimpleFsName } from './utils/config'

  onMount(() => {
    async function main () {
      // const simpleFsName = await getSimpleFsName() ?? SimpleFsName.idb
      // TODO: finish fs api mode
      const simpleFsName = SimpleFsName.idb
      const simpleFs = await getSimpleFs(simpleFsName)
      simpleFsStore.set({ simpleFs })
    }

    main()
  })
  

  const url = ''
</script>

{#if $isLoading}
  <div>loading...</div>
{:else}
  <Resume />
  <PermissionCheck />
  <Message />
  <Loading />


  <Router url="{url}">
    <Route path="/book/:id" let:params >
      <Viewer simpleFs={simpleFs} bookId={params.id} />
    </Route>

    <Route path="/*" >
      <BookShelf simpleFs={simpleFs}  />
    </Route>
  </Router>



  
{/if}

<style>

</style>
