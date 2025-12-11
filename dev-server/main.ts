import * as FS from "fs";
import * as Path from "path";
import MantleRenderer, { ServerPlatformUtils } from "../src/Index.js";
import GL from "gl";
import Canvas from "canvas";

const imagePath = Path.join("dev-server", "test.png");
try {
    FS.unlinkSync(imagePath);
} catch {}

const renderer = new MantleRenderer({
    live: false,
    platformUtils: new ServerPlatformUtils(GL, Canvas),
    ambientLight: {
        intensity: 0.5,
        color: 0xffffff
    },
    player: {
        onSkinLoad: async () => {
            console.log("skin loaded!");
            renderer.render(0);

            const imageB64 = await renderer.screenshot(renderer.getCamera(), 1024, 1024, "png", 4);
            
            const image = imageB64.split(",", 2)[1];
            FS.writeFileSync(imagePath, Buffer.from(image, "base64"));
            console.log("Saved screenshot to 'test.png'");

            const COUNT = 100;
            const start = Date.now();
            for (let i = 0; i < COUNT; i++) {
                await renderer.screenshot(renderer.getCamera(), 1024, 1024, "png", 4);
            }
            const totalDuration = Date.now() - start;
            const averageDuration = totalDuration / COUNT;
            console.log(`Average render duration: ${averageDuration}ms`);
        }
    },
    alpha: true,
    antialias: true,
    fxaa: true,
    bloom: {
        threshold: 0,
        strength: 3,
        radius: 1
    }
});