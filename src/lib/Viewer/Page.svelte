<script lang="ts">
  import { onMount } from 'svelte'

  import * as pdfjsLib from 'pdfjs-dist'
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf/pdf.worker.js'
  export let scale = 1.0
  export let outputScale = window.devicePixelRatio || 1
  
  export let pdf: pdfjsLib.PDFDocumentProxy
  export let pageIndex: number
  export let size : {
    width: number
    height: number
  }
  let width: number = 0
  let height: number = 0
  let canvas1: HTMLCanvasElement
  let canvas2: HTMLCanvasElement

  const transform =
    outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined

  let renderContext

  export let offsetX = 0
  export let offsetY = 0

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
    size = {
      width: viewport.width,
      height: viewport.height
    }

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
    }
  }


  $: pageIndex && scale && render(pageIndex)

  onMount(() => {
    render(pageIndex)
  })


  // TODO: two page mode
  // TODO: cache unzoomed page to scale and replace canvas when render ready
</script>


<div 
  class="page-canvas-container"
  style={
  `transform: translate(${offsetX}px, ${offsetY}px);width:${width}px;height:${height}px;`
  }>
  <canvas 
    class={renderId % 2 === 0 ? 'page-canvas' : 'page-canvas page-canvas-pre-render'}
    bind:this={canvas1}  width="600" height="400" />
  <canvas 
    class={renderId % 2 === 0 ? 'page-canvas page-canvas-pre-render' : 'page-canvas'}
    bind:this={canvas2} width="600" height="400" />
</div>




<style>
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