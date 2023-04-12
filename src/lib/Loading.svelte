<script lang="ts">
  import Button from '@smui/button'
  import Dialog, { Actions, Content, Header, Title } from '@smui/dialog'
  import { initResourceDir } from '../utils/files'
  import { t } from 'svelte-i18n'
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
    <Button on:click={initResourceDir}>{$t('loading.dialog.button')}</Button>
    <!-- <Button action="close">{$t('loading.dialog.close')}</Button> -->
  </Actions>
</Dialog>

<style>

</style>