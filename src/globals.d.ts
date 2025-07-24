declare const __DEV__: boolean;
declare module '*.module.css';
declare module '*.svg' {
  const content: string;
  export default content;
}

// Browser globals
declare var document: Document;
declare var window: Window;
declare var console: Console;
declare var ImageData: {
  new (width: number, height: number): ImageData;
  prototype: ImageData;
};
declare var HTMLVideoElement: {
  prototype: HTMLVideoElement;
  new (): HTMLVideoElement;
};
declare var HTMLImageElement: {
  prototype: HTMLImageElement;
  new (): HTMLImageElement;
};
declare var HTMLCanvasElement: {
  prototype: HTMLCanvasElement;
  new (): HTMLCanvasElement;
};
declare var OffscreenCanvas: {
  prototype: OffscreenCanvas;
  new (width: number, height: number): OffscreenCanvas;
};
