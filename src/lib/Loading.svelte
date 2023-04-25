<script lang="ts">
  import Dialog, { Content } from '@smui/dialog'
  import CircularProgress from '@smui/circular-progress'
  import { loading } from '../store'
  import { onMount } from 'svelte'

  export let isStaticallyLoading = false

  let isShow = false
  onMount(() => {
    if (isStaticallyLoading) {
      isShow = true
    } else {
      isShow = false
      loading.subscribe((value) => {
        isShow = value.isShow
      })
    }
  })
  
</script>

<Dialog open={isShow}
  scrimClickAction=""
  escapeKeyAction=""
  aria-labelledby="mandatory-title"
  aria-describedby="mandatory-content"
>
  <Content>
    <div style="
    display: flex; justify-content: center; align-items: center; height: 100px;
    ">
      <CircularProgress style="height: 64px; width: 64px;" indeterminate />
    </div>
    
  </Content>
</Dialog>
