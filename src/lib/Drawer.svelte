<script lang="ts">
  import Drawer, {
    Content,
    Header,
    Title as DrawerTitle,
    Subtitle
  } from '@smui/drawer'
  import List, { Graphic, Item, Separator, Subheader, Text } from '@smui/list'
  import { t } from 'svelte-i18n'
  import { navigate } from 'svelte-routing'
  
  export let isDrawerOpen

</script>

<Drawer variant="dismissible" bind:open={isDrawerOpen}>
  <Header>
    <DrawerTitle>{
      $t('drawer.title')
    }</DrawerTitle>
    <Subtitle>
      {
        $t('drawer.subtitle')
      }
    </Subtitle>
  </Header>
  <Content>
    <List>
      <Item on:click={() => { navigate('/') }}>
        <!-- <Icon class="material-icons">home</Icon> -->
        <Graphic class="material-icons" aria-hidden="true">home</Graphic>
        <Text>{
          $t('drawer.home')
        }</Text>
      </Item>

      <Item on:click={() => { navigate('/bookmark') }}>
        <Graphic class="material-icons" aria-hidden="true">bookmark</Graphic>
        <Text>{
          $t('drawer.bookmark')
          }</Text>
      </Item>
      <Item on:click={() => { navigate('/new') }}>
        <Graphic class="material-icons" aria-hidden="true">
          new_label
        </Graphic>
        <Text>
          {
            $t('drawer.new')
          }
        </Text>
      </Item>
      <Item on:click={() => { navigate('/reading') }}>
        <Graphic class="material-icons" aria-hidden="true">
          book
        </Graphic>
        <Text>
          {
            $t('drawer.reading')
          }
        </Text>
      </Item>
      <Item on:click={() => { navigate('/done') }}>
        <Graphic class="material-icons" aria-hidden="true">
          done
        </Graphic>
        <Text>
          {
            $t('drawer.done')
          }
        </Text>
      </Item>
      <Item on:click={() => { navigate('/trash') }} >
        <Graphic class="material-icons" aria-hidden="true">
          delete
        </Graphic>
        <Text>
          {
            $t('drawer.trash')
          }
        </Text>
      </Item>
      <Separator />
      <Subheader tag="h6">
        {
          $t('drawer.subheader')
        }
      </Subheader>
      <Item on:click={() => { navigate('/setting') }}>
        <Graphic class="material-icons" aria-hidden="true">
          settings
        </Graphic>
        <Text>
          {
            $t('drawer.setting')
          }
        </Text>
      </Item>
    </List>
  </Content>
</Drawer>