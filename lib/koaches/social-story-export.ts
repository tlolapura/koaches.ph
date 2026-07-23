export async function exportStoryAsPng(element: HTMLElement, filename: string) {
  const { toPng } = await import("html-to-image");
  const dataUrl = await toPng(element, {
    pixelRatio: 1,
    cacheBust: true,
    width: element.offsetWidth,
    height: element.offsetHeight,
  });

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export async function storyPngBlob(element: HTMLElement): Promise<Blob | null> {
  const { toPng } = await import("html-to-image");
  const dataUrl = await toPng(element, {
    pixelRatio: 1,
    cacheBust: true,
    width: element.offsetWidth,
    height: element.offsetHeight,
  });

  const res = await fetch(dataUrl);
  return res.blob();
}
