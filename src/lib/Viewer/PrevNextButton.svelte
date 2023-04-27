<script lang="ts">
  import { Icon } from '@smui/icon-button'

  export let next : () => void
  export let prev : () => void

  function handleMouseEnter (e) {
    e.target.style.opacity = 1

    setTimeout(() => {
      e.target.style.opacity = 0
    }, 1000)
  }

  function runOnce (fn) {
    let ran = false
    return (...args) => {
      if (!ran) {
        ran = true
        fn(...args)
      }
    }
  }

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="prev page-button" on:click={(e) => {
  prev()
  e.stopPropagation()
  e.preventDefault()
}}
on:mouseenter={runOnce(handleMouseEnter)}
>
  <Icon class="material-icons">arrow_back</Icon>
</div>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="next page-button" on:click={(e) => {
  next()
  e.stopPropagation()
  e.preventDefault()
}}
on:mouseenter={runOnce(handleMouseEnter)}
>
  <Icon class="material-icons">arrow_forward</Icon>
</div>


<style>
  .page-button {
    position: absolute;
    width: 10%;
    z-index: 1;

    opacity: 0;
    transition: opacity 0.5s ease-in-out;
    cursor: pointer;

    display: flex;
    justify-content: center;
    align-items: center;

    background-color: rgba(0, 0, 0, 0.5);
  }
 
  .prev {
    left: 0;
    top: 0;
    bottom: 0;
  }

  .next {
    right: 0;
    top: 0;
    bottom: 0;
  }
</style>