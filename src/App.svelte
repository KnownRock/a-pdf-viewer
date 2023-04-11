<script lang="ts">
  import PermissionCheck from "./lib/PermissionCheck.svelte";
  import { isLoading } from 'svelte-i18n'
  
</script>

{#if $isLoading}
<div>loading...</div>
{:else}
<PermissionCheck />
<main>
  123
</main>
{/if}

<style>
  main{
    height: 100vh;
    width: 100vw;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
</style>
