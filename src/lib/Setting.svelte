<script lang="ts">
  // import { onMount } from 'svelte'
  // import { SimpleFsName } from '../types'
  // import { getSimpleFsName, setSimpleFsName } from '../utils/config'
  // import FormField from '@smui/form-field'
  // import Radio from '@smui/radio'
  // import Button from '@smui/button'
  import { t } from 'svelte-i18n'
  // const currentSimpleFsName: SimpleFsName = SimpleFsName.idb

  // const options = [
  //   {
  //     // label: 'IndexedDB',
  //     label: $t('setting.idb'),
  //     value: SimpleFsName.idb
  //   },
  //   {
  //     // label: 'FileSystem API',
  //     label: $t('setting.fsapi'),
  //     value: SimpleFsName.fsapi
  //   }
  // ]

  // onMount(() => {
  //   async function main () {
  //     const simpleFsName = await getSimpleFsName()
  //     console.log(simpleFsName)

  //     currentSimpleFsName = simpleFsName
  //   }

  //   main()
  // })

  // async function saveConfig () {
  //   await setSimpleFsName(currentSimpleFsName)
  // }

// const simpleFsName : SimpleFsName = SimpleFsName.idb

</script>

<div class="container">
  <h1>{$t('setting.title')}</h1>
  <p>{$t('setting.description')}</p>

  <!-- <h2>{$t('setting.simpleFsName')}</h2>
  <div>
    {#each options as option}
      <FormField style="margin-right: 1em;">
        <Radio bind:group={currentSimpleFsName} value={option.value} />
        <span slot="label">{`${option.label}`}</span>
      </FormField>
    {/each}
  </div> -->

  <!-- <Button on:click={saveConfig}>Save</Button> -->
  

</div>

<style>
  .container {
    padding: 1em;
  }
</style>