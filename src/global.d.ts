// global.d.ts
declare const console: Console;
declare const document: Document;
declare const window: Window;
declare const process: NodeJS.Process;
declare const ImageData: typeof globalThis.ImageData;
declare const OffscreenCanvas: typeof globalThis.OffscreenCanvas;
declare const HTMLCanvasElement: typeof globalThis.HTMLCanvasElement;
declare const HTMLVideoElement: typeof globalThis.HTMLVideoElement;
declare const HTMLImageElement: typeof globalThis.HTMLImageElement;
declare class URL {
  constructor(url: string, base?: string);
  static createObjectURL(object: any): string;
  static revokeObjectURL(url: string): void;
}
