<script lang="ts">
  import Button from '@smui/button'
  import { t } from 'svelte-i18n'
  import { message } from '../utils/message'
  import { revokeGoogleDrive, clearData } from '../utils/google-drive'
  import { state } from '../store'

</script>


<div class="container">
  <h1>{$t('setting.title')}</h1>
  <!-- <p>{$t('setting.description')}</p> -->

  <h2>{$t('setting.googleDrive')}</h2>
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
  <div class="button-panel">
    <Button
      variant="raised"
      on:click={async () => {
        await clearData()
        message($t('setting.googleDrive.message.cleared'), 'success')
      }}
    >
      {$t('setting.googleDrive.button.clearData')}
    </Button>
  </div>

  <h2>{$t('setting.clearData')}</h2>
  <p>{$t('setting.clearData.description')}</p>
  <div class="button-panel">
    <Button
      variant="raised"
      on:click={async () => {
        // await clearData()

        state.set({
          books: {},
          events: [],
          isInitiated: true
        })

        const { clear } = await import('idb-keyval')
        await clear()


        message($t('setting.clearData.message.cleared'), 'success')
      }}
    >
      {$t('setting.clearData.button.clearData')}
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
    
    padding: 0.2em 0;
  }
</style>