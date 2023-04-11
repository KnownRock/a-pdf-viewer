<script lang="ts">
  import Dialog, { Actions, Header, Title, Content } from '@smui/dialog'
  import IconButton from '@smui/icon-button'
  import { onMount } from 'svelte';
  import { t } from 'svelte-i18n'
  let open = false
  function closeHandler(){}


</script>


<Dialog
  bind:open
  fullscreen
  aria-labelledby="fullscreen-title"
  aria-describedby="fullscreen-content"
  on:SMUIDialog:closed={closeHandler}
>
  <Header>
    <Title id="fullscreen-title">
      {$t('permission.dialog.title')}
    </Title>
    <IconButton action="close" class="material-icons">close</IconButton>
  </Header>
  <Content>123</Content>
</Dialog>
