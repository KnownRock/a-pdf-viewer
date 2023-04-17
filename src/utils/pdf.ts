import * as pdfjsLib from 'pdfjs-dist'
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf/pdf.worker.js'

export async function getPdfMetaInfo (fileHandle: FileSystemFileHandle): Promise<{
  capture: Uint8Array
  pages: number
}> {
  const file = await fileHandle.getFile()
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
  pdf.getMetadata().then(console.log).catch(console.error)
  const page = await pdf.getPage(1)
  const viewport = page.getViewport({ scale: 1 })
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d') as CanvasRenderingContext2D
  canvas.height = viewport.height
  canvas.width = viewport.width
  await page.render({ canvasContext: context, viewport }).promise

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob !== null) {
        resolve(blob)
      } else {
        reject(new Error('blob is null'))
      }
    }, 'image/png', 1)
  })

  return {
    capture: new Uint8Array(await blob.arrayBuffer()),
    pages: pdf.numPages
  }
}

export async function getPdfMetaInfoFromFile (file: File): Promise<{
  capture: Uint8Array
  pages: number
}> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
  pdf.getMetadata().then(console.log).catch(console.error)
  const page = await pdf.getPage(1)
  const viewport = page.getViewport({ scale: 1 })
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d') as CanvasRenderingContext2D
  canvas.height = viewport.height
  canvas.width = viewport.width
  await page.render({ canvasContext: context, viewport }).promise

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob !== null) {
        resolve(blob)
      } else {
        reject(new Error('blob is null'))
      }
    }, 'image/png', 1)
  })

  return {
    capture: new Uint8Array(await blob.arrayBuffer()),
    pages: pdf.numPages
  }
}
