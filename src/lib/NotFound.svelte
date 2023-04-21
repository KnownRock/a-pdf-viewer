<script lang="ts">
  import { t } from 'svelte-i18n'
  import Button from '@smui/button'
  import { navigate } from 'svelte-routing'
</script>

<!-- not fount -->
<div class="not-found">
  <h1>404</h1>
  <h2>
    {$t('notFound.title')}
  </h2>
  <p>
    {$t('notFound.message')}
  </p>
  <!-- <a href="/">Go to home</a> -->
  <Button on:click={() => {
    navigate('/')
  }}>{$t('notFound.button')}</Button>
</div>

<style>
  .not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    text-align: center;
  }
  .not-found h1 {
    font-size: 10rem;
    font-weight: 900;
    margin: 0;
  }
  .not-found h2 {
    font-size: 2rem;
    font-weight: 900;
    margin: 0;
  }
  .not-found p {
    font-size: 1.5rem;
    font-weight: 400;
    margin: 0;
  }

  .not-found a {
    font-size: 1.5rem;
    font-weight: 400;
    margin: 0;
    text-decoration: underline;
  }
</style>