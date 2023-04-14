
<script lang="ts">
  import { get, set } from 'idb-keyval'
  import { state } from '../store'
  import type { Book, SimpleFs } from '../types'
  import Page from './Viewer/Page.svelte'
  import type { PDFDocumentProxy } from 'pdfjs-dist'
  import { updateBookProgress, updateBookState } from '../store/state'
  import Slider from '@smui/slider'
  export let bookId: string | null = null
  let book: Book | null = null
  import VirtualList from 'svelte-tiny-virtual-list'
  import * as pdfjsLib from 'pdfjs-dist'
  import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar'
  import IconButton from '@smui/icon-button'
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf/pdf.worker.js'
  import { navigate } from 'svelte-routing'
  export let simpleFs: SimpleFs
  
  
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
      return
    }

    const oldScale = scale

    scale -= event.deltaY / 1000
    scale = Math.max(0.1, scale)
    scale = Math.min(5, scale)

    scrollToBehaviour = 'instant'

    setTimeout(() => {
      scrollOffset += (event.clientY - scrollOffset) * (oldScale - scale) / oldScale

      set(`${bookId}-scale`, scale)
    }, 0)

    event.preventDefault()
}


  $:isLeftMouseDown
    ? (() => {
        scrollToBehaviour = 'instant'
      })()
    : (() => {
        scrollToBehaviour = 'smooth'
      })()

  function handleMouseDown (event: MouseEvent) {
    if (event.button === 0) {
      isLeftMouseDown = true
    }
  }

  function handleTouchStart () {
    isLeftMouseDown = true
  }

  function handleMouseUp (event: MouseEvent) {
    if (event.button === 0) {
      isLeftMouseDown = false

      setTimeout(() => {
        isNotClick = false
      }, 10)
    }
  }

  let oldTouchX : number|null = null
  let oldTouchY : number|null = null
  function handleTouchEnd () {
    isLeftMouseDown = false

    oldTouchX = null
    oldTouchY = null
  }

  let progress = 1
  let offsetX = 0
  function handleMouseMove (event: MouseEvent) {
    if (isLeftMouseDown) {
      offsetX += event.movementX
      scrollOffset -= event.movementY

      isNotClick = true

      throttledSaveOffsetX(offsetX)
      // throttledSaveOffset(event.clientX)
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


      offsetX += event.touches[0].clientX - oldTouchX
      scrollOffset -= event.touches[0].clientY - oldTouchY
  
      oldTouchX = event.touches[0].clientX
      oldTouchY = event.touches[0].clientY

      isNotClick = true

      throttledSaveOffsetX(offsetX)
    }
  }

  function throttle<T> (fn: Function, wait: number) {
    let time = Date.now()
    return function (...args: any[]) {
      if ((time + wait - Date.now()) < 0) {
        fn(...args)
        time = Date.now()
      }
    } as T
  }

  function saveOffsetX (offsetX: number) {
    set(`${bookId}-offset-x`, offsetX)
  }

  const throttledSaveOffsetX = throttle<typeof saveOffsetX>(saveOffsetX, 100)

  function handleMouseLeave () {
    isLeftMouseDown = false
  }

  let pdf: PDFDocumentProxy | null = null
  let pdfPageHeight: number = 500

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

    // const booksFolderHandle = await resourceDir.getDirectoryHandle('books', {
    //   create: true
    // })
    // const bookFileHandle = await booksFolderHandle.getFileHandle(`${bookId}.pdf`, {
    //   create: true
    // })
    // const file = await bookFileHandle.getFile()
    // const buffer = await file.arrayBuffer()
    const p = await pdfjsLib.getDocument(buffer).promise
    const page = await p.getPage(1)

    scale = await get(`${bookId}-scale`) ?? 1
    offsetX = await get(`${bookId}-offset-x`) ?? 0

    const viewport = page.getViewport({ scale })
    pdfPageHeight = viewport.height


    const bookProgress = book?.progress ?? 1
    progress = bookProgress

    scrollOffset = (bookProgress - 1) * pdfPageHeight + await get(`${bookId}-offset-y`) ?? 0

    pdf = p
  }

  $: bookId && load()


  let height: number = 0
  let scrollOffset: number = 0

  let isMenuShown = false
  function toggleMenu () {
    isMenuShown = !isMenuShown
  }

  async function saveScrollOffset () {
    if (bookId) {
      const pageIndex = Math.floor(scrollOffset / pdfPageHeight) + 1
      if (pageIndex !== progress) {
        progress = pageIndex
        console.log('update progress', pageIndex)
        updateBookProgress(bookId, pageIndex)
      }

      await set(`${bookId}-offset-y`, scrollOffset - (pageIndex - 1) * pdfPageHeight)
    }
  }

  // $: progress && (async () => {
  //   scrollOffset = (progress - 1) * pdfPageHeight +
  //     // prevent scale change issue
  //     (await get(`${bookId}-offset-y`) % pdfPageHeight) ??
  //     0
  //   await saveScrollOffset()
  // })()

  async function setScrollOffsetByProgress () {
    scrollToBehaviour = 'instant'
    setTimeout(async () => {
      scrollOffset = (progress - 1) * pdfPageHeight +
      // prevent scale change issue
      (await get(`${bookId}-offset-y`) % pdfPageHeight) ??
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
    // const booksFolderHandle = await resourceDir.getDirectoryHandle('books', {
    //   create: true
    // })
    // const fileHandle = await booksFolderHandle.getFileHandle(`${bookId}.pdf`, {
    //   create: true
    // })
    // const file = await fileHandle.getFile()
    // const buffer = await file.arrayBuffer()

    const result = await simpleFs.read(`books/${bookId}.pdf`, 'arrayBuffer')
    if (!result) {
      throw new Error('book not found')
    }
    return result as ArrayBuffer
  }

  async function downloadBook () {
    const buffer = await getBookBuffer(bookId)
    const blob = new Blob([buffer], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${book?.title}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function printBook () {
    const buffer = await getBookBuffer(bookId)
    const blob = new Blob([buffer], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = url
    document.body.appendChild(iframe)
    iframe!.contentWindow!.print()
    URL.revokeObjectURL(url)
  }

  // const scrollToBehaviour = 'auto' as 'smooth' | 'auto'
  let scrollToBehaviour = 'smooth' as 'smooth' | 'auto' | 'instant'

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

  bind:clientHeight={height}
>

  {#if !pdf}
    <div>loading...</div>
  {:else}
    <div >
      

      <VirtualList
        height={height}
        width="auto"
        itemCount={pdf.numPages}
        itemSize={pdfPageHeight}
        
        getKey={index => index}
        scrollToBehaviour={scrollToBehaviour}
        
        scrollToIndex={Math.floor(scrollOffset / pdfPageHeight)}

        scrollOffset={scrollOffset}

        on:afterScroll={async (event) => {
          console.log('afterScroll', event)

          scrollOffset = event.detail.offset
          // if (scrollToBehaviour === 'smooth') {
          //   return
          // }


          await saveScrollOffset()
        }}
      >
        <div slot="item" let:index let:style {style} class="page">
          <Page 
            on:prev={() => {
              console.log('prev', index)
              console.log('prev', scrollOffset)

              scrollOffset -= pdfPageHeight
              saveScrollOffset()
            }}
            on:next={() => {
              console.log('next', index)
              console.log('next', scrollOffset)

              scrollOffset += pdfPageHeight
              saveScrollOffset()
            }}
            {offsetX}
            {scale} {pdf} pageIndex={index + 1} bind:height={pdfPageHeight} />
        </div>
        
      </VirtualList>

      {#if isMenuShown}
        <div class="menu top" on:click={e => { e.stopPropagation() }}> 
          <TopAppBar
            variant="static"
            dense
          >
            <Row>
              <Section>
                
                <IconButton class="material-icons" aria-label="Back"
                  on:click={() => {
                    navigate('/')
                  }}
                  >arrow_back</IconButton
                >
                <!-- <IconButton class="material-icons">menu</IconButton> -->
                <Title>
                  {book.title}
                </Title>
              </Section>
              <Section align="end" toolbar>
                <!-- back -->
                

                <IconButton class="material-icons" aria-label="Download"
                  on:click={downloadBook}
                  >file_download</IconButton
                >
                <IconButton class="material-icons" aria-label="Print this page"
                  on:click={printBook}
                  >print</IconButton
                >
                <IconButton class="material-icons" aria-label="Bookmark this page"
                  on:click={() => {
                    if (book) {
                      updateBookState(book.id, book?.state === 'bookmark' ? 'reading' : 'bookmark')
                    }
                  }}
                  >{
                  book?.state === 'bookmark' ? 'bookmark' : 'bookmark_border'
                  }</IconButton
                >
              </Section>
            </Row>
          </TopAppBar>
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

            <span>{progress}/{pdf.numPages}</span>
          </div>
        </div>
      {/if}
    </div>

    <!-- <div class="page-controls">
      <div>
        1
      </div>
      <div>
        2
      </div>
    </div> -->
  {/if}
  

</div>
{:else}
  <div>no book</div>
{/if}

<style>
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
  .menu {
    position: absolute;
    
    left: 0;
    right: 0;
    background-color: #fff;
    
    
    
  }

  .bottom {
    bottom: 0;
    border-radius: 10px 10px 0 0 ;
    padding: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  }

  .top {
    top: 0;
    border-radius: 0 0 10px 10px ;
  }

  .menu-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

</style>