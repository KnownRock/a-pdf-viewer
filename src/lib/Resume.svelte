<script lang="ts">
  import Button from '@smui/button'
  import Dialog, { Actions, Content, Header, Title } from '@smui/dialog'
  // import { initResourceDir } from '../utils/files'

  import { t } from 'svelte-i18n'
  import { fsApiRequest } from '../store'
  import { navigate } from 'svelte-routing'
  
  let open = false
  let callback: (() => void) | null = null
  fsApiRequest.subscribe(async (value) => {
    open = value.isShow
    callback = value.callback
  })


  function closeHandler () {
    navigate('/setting')

    if (callback) {
      callback()
    }

    open = false
  }

</script>

<Dialog
  bind:open
  aria-labelledby="fullscreen-title"
  aria-describedby="fullscreen-content"
  on:SMUIDialog:closed={closeHandler}
>
  <Header>
    <Title id="fullscreen-title">
      {$t('loading.dialog.title')}
    </Title>
  </Header>
  <Content class="loading-dialog-content">
    
  </Content>
  <Actions>
    <Button on:click={async () => {
      // const simpleFs = await getSimpleFs(SimpleFsName.idb)
      // simpleFsStore.set({ simpleFs })

      if (callback) {
        callback()
      }
    }}>{$t('loading.dialog.button')}</Button>
    <!-- <Button action="close">{$t('loading.dialog.close')}</Button> -->
  </Actions>
</Dialog>

<style>

</style>