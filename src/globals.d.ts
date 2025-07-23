declare const __DEV__: boolean;
declare module '*.module.css';
declare module '*.svg' {
  const content: string;
  export default content;
}

// Browser globals
declare let document: Document;
declare let window: Window;
declare let console: Console;
declare let ImageData: {
  new (width: number, height: number): ImageData;
  prototype: ImageData;
};
declare let HTMLVideoElement: {
  prototype: HTMLVideoElement;
  new (): HTMLVideoElement;
};
declare let HTMLImageElement: {
  prototype: HTMLImageElement;
  new (): HTMLImageElement;
};
declare let HTMLCanvasElement: {
  prototype: HTMLCanvasElement;
  new (): HTMLCanvasElement;
};
declare let OffscreenCanvas: {
  prototype: OffscreenCanvas;
  new (width: number, height: number): OffscreenCanvas;
};
