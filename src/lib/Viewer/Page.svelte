<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'


  import * as pdfjsLib from 'pdfjs-dist'
  // import { Icon } from '@smui/button'
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf/pdf.worker.js'
  export let scale = 1.0
  export let outputScale = window.devicePixelRatio || 1
  
  const dispatch = createEventDispatcher()
  
  export let pdf: pdfjsLib.PDFDocumentProxy
  export let pageIndex: number
  export let height: number
  let width: number = 0
  let canvas1: HTMLCanvasElement
  let canvas2: HTMLCanvasElement

  const transform =
    outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined

  let renderContext

  export let offsetX = 0

  let renderId = 0
  let renderTask: pdfjsLib.RenderTask | null = null

  let needNextRender = false
  const render = async (pageIndex:number) => {
    if (!canvas1) return
    if (!canvas2) return

    let canvas
    let preRenderCanvas
    if (renderId % 2 === 0) {
      canvas = canvas1
      preRenderCanvas = canvas2
    } else {
      canvas = canvas2
      preRenderCanvas = canvas1
    }

    preRenderCanvas.style.zIndex = '0'
    canvas.style.zIndex = '1'
    preRenderCanvas.style.opacity = '0'
    canvas.style.opacity = '1'
  
    const page = await pdf.getPage(pageIndex)
    const viewport = page.getViewport({ scale })
  
    canvas.style.width = Math.floor(viewport.width) + 'px'
    canvas.style.height = Math.floor(viewport.height) + 'px'
    preRenderCanvas.style.width = Math.floor(viewport.width) + 'px'
    preRenderCanvas.style.height = Math.floor(viewport.height) + 'px'
    width = viewport.width
    height = viewport.height

    if (renderTask !== null) {
      needNextRender = true
      return
    }

    // if (withReRender) {
    preRenderCanvas.width = Math.floor(viewport.width * outputScale)
    preRenderCanvas.height = Math.floor(viewport.height * outputScale)
    const context = preRenderCanvas.getContext('2d')
    renderContext = {
      canvasContext: context as CanvasRenderingContext2D,
      transform,
      viewport
    }

    // if (renderTask) {
    //   try {
    //     renderTask.cancel()
    //     console.log('cancel')
    //   } catch (error) {

    //   }
    // }

    try {
      renderTask = page.render(renderContext)
      await renderTask.promise
      renderTask = null

      console.log('render page', pageIndex)

      preRenderCanvas.style.zIndex = '1'
      canvas.style.zIndex = '0'
  
      preRenderCanvas.style.opacity = '1'
      canvas.style.opacity = '0'

      renderId++

      if (needNextRender) {
        needNextRender = false
  

        render(pageIndex)
      }
    } catch (error) {
      // console.log(error)
    }
    // }
  }


  $: pageIndex && scale && render(pageIndex)

  onMount(() => {
    render(pageIndex)
  })

  function stopPropagation (e: Event) {
    e.stopPropagation()
  }

  // TODO: two page mode
  // TODO: cache unzoomed page to scale and replace canvas when render ready
</script>

<div class="page">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="contorl contorl-left" on:click={ (e) => {
    dispatch('prev')
    stopPropagation(e)
  }}>
    <!-- <Icon class="material-icons">arrow_back_ios</Icon> -->
  </div>
  <div 
    class="page-canvas-container"
    style={
    `transform: translateX(${offsetX}px);width:${width}px;height:${height}px;`
    }>
    <canvas 
      class={renderId % 2 === 0 ? 'page-canvas' : 'page-canvas page-canvas-pre-render'}
      bind:this={canvas1}  width="600" height="400" />
    <canvas 
      class={renderId % 2 === 0 ? 'page-canvas page-canvas-pre-render' : 'page-canvas'}
      bind:this={canvas2} width="600" height="400" />
  </div>
  
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="contorl contorl-right" on:click={ (e) => {
    dispatch('next')
    stopPropagation(e)
  }}>
    <!-- <Icon class="material-icons">arrow_forward_ios</Icon> -->
  </div>
</div>

<style>
  .page {
    height: 100%;
    /* width: 100%; */
    width: 100vw;
    overflow: hidden;

    display: flex;
    align-items: center;
    justify-content: center;

    user-select: none;
  }

  
  .contorl {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    z-index: 1;
  }

  .contorl-left {
    left: 0;
  }

  .contorl-right {
    right: 0;
  }

  .page-canvas{
    grid-row-start: 1;
    grid-row-end: 1;
    grid-column-start: 1;
    grid-column-end: 1;

    transition: opacity none;
  }

  .page-canvas-pre-render {
    transition: opacity 0.3s;
  }

  .page-canvas-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }


</style>