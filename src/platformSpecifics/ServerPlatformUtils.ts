import type GL from "gl";
import { Platform, BasePlatformUtils } from "./BasePlatformUtils.js";
import type Canvas from "canvas";
import { CanvasTexture } from "three";
import type Sharp from "sharp";

export class ServerPlatformUtils extends BasePlatformUtils {
    private createSharp: ((options?: Sharp.SharpOptions) => Sharp.Sharp) | ((
        input?: Sharp.SharpInput | Array<Sharp.SharpInput>,
        options?: Sharp.SharpOptions,
    ) => Sharp.Sharp) | null = null;

    constructor(
        private readonly gl: typeof GL,
        private readonly canvas: typeof Canvas
    ) {
        super();
    }

    getPlatform() {
        return Platform.SERVER;
    }

    create3dCanvas(width: number, height: number) {
        return {
            width,
            height,
            offsetWidth: width,
            offsetHeight: height,
            addEventListener: () => {},
            removeEventListener: () => {},
            getContext: (...params: any) => this.gl(width, height, {
                preserveDrawingBuffer: true
            })
        }
    }

    create2dCanvas(width: number, height: number) {
        return this.canvas.createCanvas(width, height);
    }

    getDevicePixelRatio() {
        return 1;
    }

    async createTexture(url: string | Canvas.Canvas) {
        if (typeof url == "string") {
            url = await this.urlToCanvas(url);
        }
        return new CanvasTexture(url as any);
    }

    urlToCanvas(url: string) {
        return new Promise<Canvas.Canvas>((resolve, reject) => {
            const image = new this.canvas.Image();
            
            image.onerror = reject;
            image.onload = () => {
                const canvas = this.canvas.createCanvas(image.width, image.height);
                canvas.getContext("2d").drawImage(image, 0, 0, image.width, image.height);
                
                resolve(canvas);
            }

            image.src = url;
        });
    }

    async screenshot(buffer: Uint8Array, width: number, height: number, type: "png" | "jpeg"): Promise<string> {
        if (!this.createSharp) {
            this.createSharp = (await import("sharp")).default;
        }
        const img = this.createSharp(buffer, { raw: { width, height, channels: 4 } }).flip();
        
        const output = type === "jpeg" ? img.jpeg() : img.png();
        const buf = await output.toBuffer();
        return `data:image/${type};base64,` + buf.toString("base64");
    }
}