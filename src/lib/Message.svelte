<script lang="ts">
  import Snackbar, { Label, Actions } from '@smui/snackbar'
  import IconButton from '@smui/icon-button'

  import './Message/_Colors.scss'
  import { message } from '../store'

  let snackbar: Snackbar
  let type = null as string | null
  let messageText = null as string | null

  message.subscribe((value) => {
    if (!snackbar) {
      return
    }

    if (value.message !== null) {
      type = value.type
      messageText = value.message
      snackbar.open()
    } else {
      snackbar.close()
      messageText = null
    }
  })

</script>



<Snackbar bind:this={snackbar} class={`demo-${type}`}>
  <Label>
    {messageText}
  </Label>
  <Actions>
    <IconButton class="material-icons" title="Dismiss">close</IconButton>
  </Actions>
</Snackbar>
 