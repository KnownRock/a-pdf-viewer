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
  let canvas: HTMLCanvasElement

  const transform =
    outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined

  let renderContext

  export let offsetX = 0


  let renderTask: pdfjsLib.RenderTask | null = null
  const render = async (pageIndex:number) => {
    if (!canvas) return
    const context = canvas.getContext('2d')
    const page = await pdf.getPage(pageIndex)
    const viewport = page.getViewport({ scale })
    canvas.width = Math.floor(viewport.width * outputScale)
    canvas.height = Math.floor(viewport.height * outputScale)
    canvas.style.width = Math.floor(viewport.width) + 'px'
    canvas.style.height = Math.floor(viewport.height) + 'px'

    height = viewport.height

    renderContext = {
      canvasContext: context as CanvasRenderingContext2D,
      transform,
      viewport
    }

    if (renderTask) {
      try {
        renderTask.cancel()
      } catch (error) {
  
      }
    }

    try {
      renderTask = page.render(renderContext)
      await renderTask.promise
    } catch (error) {
      console.log(error)
    }
  }


  $: pageIndex && scale && render(pageIndex)

  onMount(() => {
    render(pageIndex)
  })

  function stopPropagation (e: Event) {
    e.stopPropagation()
  }
</script>

<div class="page">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="contorl contorl-left" on:click={ (e) => {
    dispatch('prev')
    stopPropagation(e)
  }}>
    <!-- <Icon class="material-icons">arrow_back_ios</Icon> -->
  </div>
  <div style={`transform: translateX(${offsetX}px)`}>
    <canvas bind:this={canvas} id="the-canvas" width="600" height="400" />
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
    width: 100%;

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
  }

  .contorl-left {
    left: 0;
  }

  .contorl-right {
    right: 0;
  }


</style>