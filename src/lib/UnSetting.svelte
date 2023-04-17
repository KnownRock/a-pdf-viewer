<script lang="ts">
  import Button from '@smui/button/src/Button.svelte'
  import { t } from 'svelte-i18n'
  import { navigate } from 'svelte-routing'
</script>
<div class="unsetting">
  <!-- jump to setting -->
  <div>
    <h1>
      {$t('unsetting.title')}
    </h1>
    <p>
      {$t('unsetting.description')}
    </p>
    <Button on:click={() => {
      navigate('/setting')
    }}>
      {$t('unsetting.button')}
    </Button>
  </div>
  
</div>

<style>
  .unsetting {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
</style>