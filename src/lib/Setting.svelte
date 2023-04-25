<script lang="ts">
  import Button from '@smui/button'
  import { t } from 'svelte-i18n'
  import { message } from '../utils/message'
  import { revokeGoogleDrive } from '../utils/google-drive'

</script>


<div class="container">
  <h1>{$t('setting.title')}</h1>
  <!-- <p>{$t('setting.description')}</p> -->

  <div>{$t('setting.googleDrive')}</div>
  <!-- <p>{$t('setting.googleDrive.description')}</p> -->
  <div class="button-panel">
    <Button
      variant="raised"
      on:click={async () => {
        await revokeGoogleDrive()
        message($t('setting.googleDrive.message.revoked'), 'success')
      }}
    >
      {$t('setting.googleDrive.button.revoke')}
    </Button>
  </div>


  

</div>


<style>
  .container {
    padding: 1em;
  }

  .button-panel {
    display: flex;
    flex-direction: row;
    
    padding: 1em 0;
  }
</style>