<script lang="ts">
  import Button from '@smui/button'

  import Textfield from '@smui/textfield'
  import { t } from 'svelte-i18n'
  import type { S3Config } from '../types'
  import { onMount } from 'svelte'
  import { getS3Config, setS3Config } from '../utils/config'
  import { message } from '../utils/message'


  let s3Config : S3Config = {
    accessKeyId: '',
    secretAccessKey: '',
    region: '',
    bucket: '',
    prefix: '',
    endpoint: ''
  }

  onMount(() => {
    async function main () {
      const savedS3Config = await getS3Config()
      s3Config = savedS3Config
    }

    main()
  })

</script>

<div class="container">
  <h1>{$t('setting.title')}</h1>
  <p>{$t('setting.description')}</p>

  <h2>{$t('setting.s3')}</h2>
  <p>{$t('setting.s3.description')}</p>
  <Textfield  bind:value={s3Config.accessKeyId} label={$t('setting.s3.accessKeyId')} /><br>
  <Textfield  bind:value={s3Config.secretAccessKey} label={$t('setting.s3.secretAccessKey')} /><br>
  <Textfield  bind:value={s3Config.region} label={$t('setting.s3.region')} /><br>
  <Textfield  bind:value={s3Config.bucket} label={$t('setting.s3.bucket')} /><br>
  <Textfield  bind:value={s3Config.prefix} label={$t('setting.s3.prefix')} /><br>
  <Textfield  bind:value={s3Config.endpoint} label={$t('setting.s3.endpoint')} /><br>

  <div class="button-panel">

    <Button
      variant="raised"
      on:click={() => {
        setS3Config(s3Config)
        message($t('setting.s3.message.saved'), 'success')
      }}
    >
      {$t('setting.s3.button.save')}
    </Button>

    <!-- export -->
    <Button
      on:click={() => {
        const config = JSON.stringify(s3Config)
        const blob = new Blob([config], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 's3-config.json'
        a.click()
      }}
    >
      {$t('setting.s3.button.export')}
    </Button>

    <!-- import -->
    <Button
      on:click={() => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'application/json'
        input.addEventListener('change', async () => {
          const file = input?.files?.[0]
          if (!file) return
          const reader = new FileReader()
          reader.readAsText(file)
          reader.addEventListener('load', async () => {
            if (typeof reader.result !== 'string') return

            const config = JSON.parse(reader.result)
            const s3Config = {
              accessKeyId: config.accessKeyId || '',
              secretAccessKey: config.secretAccessKey || '',
              region: config.region || '',
              bucket: config.bucket || '',
              prefix: config.prefix || '',
              endpoint: config.endpoint || ''
            }
            await setS3Config(s3Config)
            message($t('setting.s3.message.saved'), 'success')
          })
        })

        input.click()
      }}
    >
      {$t('setting.s3.button.import')}
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