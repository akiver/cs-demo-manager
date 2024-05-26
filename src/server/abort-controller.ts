let rendererAbortController: AbortController | null = null;

export function createRendererAbortController() {
  if (rendererAbortController) {
    rendererAbortController.abort();
  }

  rendererAbortController = new AbortController();

  return rendererAbortController;
}

export function abortRendererController() {
  if (!rendererAbortController) {
    return;
  }

  rendererAbortController.abort();
  rendererAbortController = null;
}
