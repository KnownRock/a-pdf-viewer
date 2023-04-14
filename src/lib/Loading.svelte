<script lang="ts">
  import Button from '@smui/button'
  import Dialog, { Actions, Content, Header, Title } from '@smui/dialog'
  // import { initResourceDir } from '../utils/files'
  import { getSimpleFs } from '../utils/simple-fs'

  import { t } from 'svelte-i18n'
  import { SimpleFsName } from '../types'
  import { simpleFs as simpleFsStore } from '../store'
  let open = true

  function closeHandler () {
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
      const simpleFs = await getSimpleFs(SimpleFsName.fsapi)
      simpleFsStore.set({ simpleFs })
    }}>{$t('loading.dialog.button')}</Button>
    <!-- <Button action="close">{$t('loading.dialog.close')}</Button> -->
  </Actions>
</Dialog>

<style>

</style>