<script lang="ts">
  import { onMount } from 'svelte'

  async function sleep (ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
  export let delay: number = 1000
  let isShow = false

  onMount(async () => {
    await sleep(delay)
    isShow = true
  })

</script>


{#if isShow}
  <slot />
{/if}


