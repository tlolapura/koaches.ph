import { toPng } from "html-to-image";

export async function exportStoryAsPng(element: HTMLElement, filename: string) {
  const dataUrl = await toPng(element, {
    pixelRatio: 3,
    cacheBust: true,
    skipAutoScale: true,
  });

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export async function storyPngBlob(element: HTMLElement): Promise<Blob | null> {
  const dataUrl = await toPng(element, {
    pixelRatio: 3,
    cacheBust: true,
    skipAutoScale: true,
  });

  const res = await fetch(dataUrl);
  return res.blob();
}
