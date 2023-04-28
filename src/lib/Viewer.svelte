
<script lang="ts">
  import { get, set } from 'idb-keyval'
  import { state } from '../store'
  import type { Book, SimpleFs } from '../types'
  import Page from './Viewer/Page.svelte'
  import type { PDFDocumentProxy } from 'pdfjs-dist'
  import { updateBookProgress, updateBookState } from '../store/state'
  import Slider from '@smui/slider'
  import TopAppBar from './Viewer/TopAppBar.svelte'
  import { t } from 'svelte-i18n'
  import VirtualList from 'svelte-tiny-virtual-list'
  import * as pdfjsLib from 'pdfjs-dist'
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf/pdf.worker.js'
  import { pinch } from 'svelte-gestures'
  import { throttle } from '../utils/helper'
  import Button from '@smui/button/src/Button.svelte'
  import PrevNextButton from './Viewer/PrevNextButton.svelte'

  export let simpleFs: SimpleFs | null
  export let bookId: string | null = null
  let book: Book | null = null
  let scrollToBehaviour = 'instant' as 'smooth' | 'auto' | 'instant'
  let pdf: PDFDocumentProxy | null = null

  let mode:'vertical' | 'horizontal' = 'horizontal'
  // let pdfPageHeight: number = 0
  let pdfPageSize: { width: number, height: number } = { width: 0, height: 0 }
  // TODO: fix first page slow render issue
  let inited = false

  // set progress by scroll offset
  async function saveScrollOffset () {
    if (bookId) {
      const pageIndex = Math.floor(scrollOffset / getOnePageOffset()) + 1
      if (pageIndex !== progress) {
        progress = Math.max(1, pageIndex)
        console.log('update progress', pageIndex)
        updateBookProgress(bookId, pageIndex)
      }

      // await set(`${bookId}-offset-y`, scrollOffset - (pageIndex - 1) * getOnePageOffset())
    }
  }

  // handle scroll offset when scroll by user
  async function handleScrollByUser () {
    await saveScrollOffset()
  }

  
  state.subscribe((value) => {
    if (bookId) {
      book = value.books[bookId] ?? null
    } else {
      book = null
    }
  })

  // TODO: make scale more smooth
  let scale = 1
  let isLeftMouseDown = false
  let isNotClick = false
  function handleWheel (event: WheelEvent) {
    if (!(event.ctrlKey || event.metaKey || isLeftMouseDown)) {
      // FIXME: this is a hack
      setTimeout(() => {
        handleScrollByUser()
      }, 500)
      return
    }
  
    const newScale = scale - event.deltaY / 1000
    changeScale(scale, newScale, event.clientY)

    event.preventDefault()
  }

  function changeScale (oldScale, newScale, clientY) {
    scrollToBehaviour = 'instant'

    newScale = Math.max(0.1, newScale)
    newScale = Math.min(5, newScale)

    scale = newScale

    console.log(scrollOffset, oldScale, clientY, scale)
    const unScaleLocation = scrollOffset / oldScale + clientY / oldScale
    scrollOffset = Math.max(unScaleLocation * scale - clientY, 0)

    setTimeout(() => {
      scrollToBehaviour = 'smooth'
    }, 100)
  
  
    set(`${bookId}-scale`, scale)
  }


  function scaleUp () {
    const newScale = scale + 0.1
    changeScale(scale, newScale, 0)
  }

  // TODO: crop mode
  function scaleDown () {
    const newScale = scale - 0.1
    changeScale(scale, newScale, 0)
  }


  // TODO: implement this
  function handlePinch (e) {
    e.preventDefault()
  }

  function resetScaleAndOffset () {
    scale = 1
    offsetX = 0
    offsetY = 0
    // scrollOffset = 0
    set(`${bookId}-scale`, scale)
    set(`${bookId}-offset-x`, offsetX)
  }

  async function saveMode () {
    await set(`${bookId}-mode`, mode)
  }

  async function handleModeSwitch () {
    // mode = mode === 'horizontal' ? 'vertical' : 'horizontal'
    await saveMode()
  }
  
  $:isLeftMouseDown || !inited
    ? (() => {
        console.log('instant')
        scrollToBehaviour = 'instant'
      })()
    : (() => {
        console.log('smooth')
        scrollToBehaviour = 'smooth'
      })()

  function handleMouseDown (event: MouseEvent) {
    if (event.button === 0) {
      isLeftMouseDown = true
    }
  }

  let touchStartY: number | null = null
  let touchStartX: number | null = null
  function handleTouchStart (event: TouchEvent) {
    isLeftMouseDown = true

    oldTouchX = event.touches[0].clientX
    oldTouchY = event.touches[0].clientY

    touchStartY = event.touches[0].clientY
    touchStartX = event.touches[0].clientX
  }

  function handleMouseUp (event: MouseEvent) {
    if (event.button === 0) {
      isLeftMouseDown = false

      setTimeout(() => {
        isNotClick = false

        handleScrollByUser()
      }, 10)
    }
  }


  let oldTouchX : number|null = null
  let oldTouchY : number|null = null
  let canFreeMove = false
  function handleTouchEnd (e: TouchEvent) {
    isLeftMouseDown = false
    canFreeMove = false

    if (touchStartX !== null && touchStartY !== null) {
      if (Math.abs(e.touches[0].clientX - touchStartX) < 10 && Math.abs(e.touches[0].clientY - touchStartY) < 10) {
        isNotClick = false
      }
    }
  
    oldTouchX = null
    oldTouchY = null
  }

  let progress = 1
  let offsetX = 0
  let offsetY = 0
  function handleMouseMove (event: MouseEvent) {
    if (isLeftMouseDown) {
      if (mode === 'vertical') {
        offsetX += event.movementX
        scrollOffset -= event.movementY
        isNotClick = true
        throttledSaveOffsetX(offsetX)
      } else {
        offsetY += event.movementY
        scrollOffset -= event.movementX
        isNotClick = true
        throttledSaveOffsetY(offsetY)
      }
    }
  }

  
  function handleTouchMove (event: TouchEvent) {
    if (isLeftMouseDown) {
      if (oldTouchX === null) {
        oldTouchX = event.touches[0].clientX
      }
      if (oldTouchY === null) {
        oldTouchY = event.touches[0].clientY
      }

      if (mode === 'vertical') {
        if (
          !canFreeMove &&
          Math.abs(event.touches[0].clientX - oldTouchX) < 100) {
          console.log('not free move')
        } else {
          canFreeMove = true
          // oldTouchX = oldTouchX - event.touches[0].clientX
          offsetX += event.touches[0].clientX - oldTouchX
          throttledSaveOffsetX(offsetX)
          oldTouchX = event.touches[0].clientX
        }
      } else {
        if (
          !canFreeMove &&
          Math.abs(event.touches[0].clientY - oldTouchY) < 100) {
          console.log('not free move')
        } else {
          canFreeMove = true
          // oldTouchY = oldTouchY - event.touches[0].clientY
          offsetY += event.touches[0].clientY - oldTouchY
          throttledSaveOffsetY(offsetY)
          oldTouchY = event.touches[0].clientY
        }
      }


      isNotClick = true
    }
  }

  function saveOffsetX (offsetX: number) {
    set(`${bookId}-offset-x`, offsetX)
  }

  function saveOffsetY (offsetY: number) {
    set(`${bookId}-offset-y`, offsetY)
  }

  const throttledSaveOffsetX = throttle<typeof saveOffsetX>(saveOffsetX, 100)
  const throttledSaveOffsetY = throttle<typeof saveOffsetY>(saveOffsetY, 100)

  function handleMouseLeave () {
    isLeftMouseDown = false
  }


  let isLoaded = false
  async function load () {
    if (isLoaded) {
      return
    }
    isLoaded = true

    if (simpleFs === null) {
      return
    }
    if (bookId === null) {
      return
    }


    const result = await simpleFs.read(`books/${bookId}.pdf`, 'arrayBuffer')
    if (result === null) {
      return
    }

    const buffer = result as ArrayBuffer
    const p = await pdfjsLib.getDocument(buffer).promise
    const page = await p.getPage(1)

    scale = await get(`${bookId}-scale`) ?? 1
    offsetX = await get(`${bookId}-offset-x`) ?? 0
    offsetY = await get(`${bookId}-offset-y`) ?? 0

    const viewport = page.getViewport({ scale })
    // pdfPageHeight = viewport.height
    pdfPageSize = {
      width: viewport.width,
      height: viewport.height
    }

    const bookProgress = book?.progress ?? 1
    progress = Math.max(1, Math.min(bookProgress, p.numPages))

    // console.log(await get(`${bookId}-offset-y`))

    // let scrollOffsetY = (await get(`${bookId}-offset-y`)) ?? 0
    // if (isNaN(scrollOffsetY)) {
    //   scrollOffsetY = 0
    // }

    let extScrollOffset = 0
    if (mode === 'vertical') {
      extScrollOffset = (await get(`${bookId}-offset-y`)) ?? 0
    } else {
      extScrollOffset = (await get(`${bookId}-offset-x`)) ?? 0
    }

    // FIXME: fix this
    // const scrollOffsetY = 0
    mode = await get(`${bookId}-mode`) ?? await get('app:defaultDirection') ?? 'vertical'
    scrollOffset = (bookProgress - 1) * getOnePageOffset() + extScrollOffset
    pdf = p


    setTimeout(() => {
      inited = true
    }, 300)
  }

  $: bookId && load()


  let height: number = 0
  let width: number = 0
  let scrollOffset: number = 0

  let isMenuShown = false
  function toggleMenu () {
    isMenuShown = !isMenuShown
  }

  async function setScrollOffsetByProgress () {
    scrollToBehaviour = 'instant'
    setTimeout(async () => {
      scrollOffset = (progress - 1) * getOnePageOffset() +
      // prevent scale change issue
      // (await get(`${bookId}-offset-y`) % pdfPageHeight) ??
      0
      await saveScrollOffset()
      scrollToBehaviour = 'smooth'
    }, 100)
  }


  function handleClick () {
    if (!isNotClick) {
      toggleMenu()
    }
  }

  async function getBookBuffer (bookId) : Promise<ArrayBuffer> {
    if (simpleFs === null) {
      throw new Error('simpleFs is null')
    }

    const result = await simpleFs.read(`books/${bookId}.pdf`, 'arrayBuffer')
    if (!result) {
      throw new Error('book not found')
    }
    return result as ArrayBuffer
  }


  function getOnePageOffset () {
    return mode === 'vertical' ? (pdfPageSize.height) : (pdfPageSize.width)
  }

</script>

{#if book}
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="viewer" 
  on:wheel={handleWheel}
  on:mousedown={handleMouseDown}
  on:touchstart={handleTouchStart}
  on:mouseup={handleMouseUp}
  on:touchend={handleTouchEnd}
  on:mousemove={handleMouseMove}
  on:touchmove={handleTouchMove}
  on:mouseleave={handleMouseLeave}
  on:click={handleClick}
  
  use:pinch
  on:pinch="{handlePinch}"
  
  bind:clientWidth={width}
  bind:clientHeight={height}
>

  {#if !pdf}
    <div>loading...</div>
  {:else}
    <div id="pdf-viewer">
      <VirtualList
        
        height={(mode === 'vertical' ? height + 0 : height + 'px')}
        width={(mode === 'vertical' ? width + 'px' : width + 0)}
        itemCount={pdf.numPages}
        itemSize={mode === 'vertical' ? pdfPageSize.height : pdfPageSize.width}
        scrollDirection={mode}
        getKey={index => index}
        scrollToBehaviour={scrollToBehaviour}
        scrollOffset={scrollOffset}
        overscanCount={inited ? 1 : 0}

        on:afterScroll={async (event) => {
          scrollOffset = event.detail.offset
        }}
      >
        <div slot="item" let:index let:style {style} class="page">
          {#if inited}
          <Page 
            offsetX={mode === 'horizontal' ? 0 : offsetX}
            offsetY={mode === 'vertical' ? 0 : offsetY}
            {scale} {pdf} pageIndex={index + 1} 
              bind:size={pdfPageSize}
            />
          {/if}
        </div>
        
      </VirtualList>


      {#if isMenuShown}
        <div class="menu top" on:click={e => { e.stopPropagation() }}> 
          <TopAppBar 
            bind:mode={mode}
            on:modeSwitch={handleModeSwitch}
            book={book} 
            scaleUp={scaleUp} 
            scaleDown={scaleDown}
            resetScaleAndOffset={resetScaleAndOffset}
            getBookBuffer={getBookBuffer}
            updateBookState={updateBookState}
          />
        </div>

        <div class="menu bottom" on:click={e => { e.stopPropagation() }}>
          <div class="menu-item">
            <div style="width:90%" on:click={
              // bypass slider change event not fired issue
              setScrollOffsetByProgress
            }
              on:touchend={
                // bypass slider change event not fired issue
                setScrollOffsetByProgress
              }
            >
              <Slider
                style="width:90%"
                bind:value={progress}

                onclick={e => {
                  console.log('onclick', e)
                  e.stopPropagation()
                }}

                min={1}
                max={pdf.numPages}
              />
            </div>
            <div
              style="display: flex; align-items: center; justify-content: center; width: 10%;"
            >
              <span
                style="margin: auto;"
              >{progress}/{pdf.numPages}</span>
            </div>
            
          </div>
        </div>
      {/if}

      <PrevNextButton
        prev={() => {
          scrollOffset -= getOnePageOffset()
          saveScrollOffset()
        }}
        next={() => {
          scrollOffset += getOnePageOffset()
          saveScrollOffset()
        }}
      />

    </div>
  {/if}
</div>
{:else}
  <div class="not-found">
    <h1>{$t('viewer.bookNotFound')}</h1>
    <Button href="/">{$t('viewer.backToHome')}</Button>
  </div>
{/if}

<style>
  .not-found {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100vh;
  }


  .viewer {
    position: absolute;
    /* background-color: #0f0; */
    /* display: flex; */
    /* justify-content: center; */
    top: 0;
    left: 0;

    overflow: hidden;

    height: 100vh;
    width: 100vw;
  }

  .page {
    display: flex;
    justify-content: center;
  }


  #pdf-viewer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    overflow: hidden;
  }


  .menu {
    position: absolute;
    
    left: 0;
    right: 0;
    background-color: #fff;
    
    height: 50px;
    
    z-index: 2;
  }

  .bottom {
    bottom: 0;
    border-radius: 10px 10px 0 0 ;
    padding: 0 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  }

  .top {
    top: 0;
    border-radius: 0 0 10px 10px ;
  }

  .menu-item {
    display: flex;
    justify-content: space-between;
    /* align-items: center; */
    margin-bottom: 50px;
  }
  
  :global(::-webkit-scrollbar){
    display: none;
  }

</style>

