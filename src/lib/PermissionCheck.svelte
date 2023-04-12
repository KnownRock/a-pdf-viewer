<script lang="ts">
  import Dialog, { Header, Title, Content, Actions } from '@smui/dialog'
  import Button from '@smui/button'
  import { t } from 'svelte-i18n'
  let open = false
  function closeHandler () {
    open = false

    callback(null)

    callback = (resourceDir: FileSystemDirectoryHandle | null) => {
      if (resourceDir) {
        console.log(resourceDir)
      }
    }
  }

  import { permission } from '../store'

  let callback = (resourceDir: FileSystemDirectoryHandle | null) => {
    if (resourceDir) {
      console.log(resourceDir)
    }
  }

  permission.subscribe((value) => {
    open = value.isShow
    callback =
      value.callback ??
      ((resourceDir: FileSystemDirectoryHandle | null) => {
        if (resourceDir) {
          console.log(resourceDir)
        }
      })
  })

  async function getPermission () {
    const handle = await window.showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'documents'
    })
    callback(handle)
  }

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
  </Header>
  <Content>
  </Content>
  <Actions>
    <Button on:click={getPermission}>{$t('permission.dialog.button')}</Button>
  </Actions>
</Dialog>
