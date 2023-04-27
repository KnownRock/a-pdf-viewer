<script lang="ts">
  import Snackbar, { Label, Actions } from '@smui/snackbar'
  import IconButton from '@smui/icon-button'

  import './Message/_Colors.scss'
  import { message } from '../store'
  import Button from '@smui/button/src/Button.svelte'
  import { t } from 'svelte-i18n'
  let snackbar: Snackbar
  let type = null as string | null
  let messageText = null as string | null
  const timeoutMs = -1
  let buttons = null as {
    text: string
    action: () => void | Promise<void>
  }[] | null | undefined
  

  message.subscribe((value) => {
    if (!snackbar) {
      return
    }

    if (value.message !== null) {
      type = value.type
      messageText = value.message
      buttons = value.buttons
      snackbar.open()
    } else {
      snackbar.close()
      messageText = null
      buttons = null
    }
  })

</script>



<Snackbar bind:this={snackbar} class={`demo-${type}`} {timeoutMs}>
  <Label>
    {$t(messageText || '')}
  </Label>
  <Actions>
    {#if buttons}
      {#each buttons as { text, action }}
        <Button on:click={action}>{$t(text)}</Button>
      {/each}
    {/if}

    <IconButton class="material-icons" title="Dismiss">close</IconButton>
  </Actions>
</Snackbar>
 