<script lang="ts">
  import Delay from './general/Delay.svelte'
  import { t } from 'svelte-i18n'
  
  import Button from '@smui/button'

  export let handleAddBooks: () => void
</script>


<Delay delay={1000}>
  <div style="text-align:center; padding: 1rem;">
    <h3>
      {$t('books.noBooks')}
    </h3>
    <!-- add some book -->
    <Button  on:click={handleAddBooks}>
      {$t('books.addBooks')}
    </Button>
  </div>
</Delay>