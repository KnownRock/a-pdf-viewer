<script lang="ts">
  import Button from '@smui/button'
  import { t } from 'svelte-i18n'
  import { message } from '../utils/message'
  import { revokeGoogleDrive, clearData } from '../utils/google-drive'
  import { state } from '../store'
  import Select, { Option } from '@smui/select'
  import { onMount } from 'svelte'
  import { get, set } from 'idb-keyval'

  let defaultDirection = 'vertical'

  let inited = false
  onMount(async () => {
    defaultDirection = (await get('app:defaultDirection')) || 'vertical'
    inited = true
  })

  $: if (inited) {
    set('app:defaultDirection', defaultDirection)
  }

</script>


<div class="container">
  <h1>{$t('setting.title')}</h1>
  <!-- <p>{$t('setting.description')}</p> -->

  <h2>{$t('setting.default')}</h2>
  <!-- <p>{$t('setting.default.description')}</p> -->
  <div>
    <!-- direction -->
    <Select 
      label={$t('setting.default.direction.label')}
      bind:value={defaultDirection}
       >
      <Option value="vertical">{$t('setting.default.direction.vertical')}</Option>
      <Option value="horizontal">{$t('setting.default.direction.horizontal')}</Option>
    </Select>

  </div>

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

  <!-- privacy -->
  <h2>{$t('setting.privacy')}</h2>
  <a href="/privacy.html" target="_blank">{$t('setting.privacy.link')}</a>


  

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