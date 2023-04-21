<script lang="ts">
  import Dialog, { Content } from '@smui/dialog'
  import CircularProgress from '@smui/circular-progress'
  import { loading } from '../store'

  let isShow = false
  loading.subscribe((value) => {
    isShow = value.isShow
  })

</script>


<Dialog open={isShow}>
  <Content>
    <div style="
    display: flex; justify-content: center; align-items: center; height: 100px;
    ">
      <CircularProgress style="height: 64px; width: 64px;" indeterminate />
    </div>
    
  </Content>
</Dialog>
