import './style.css'

import Renderer, { parseJavaBlockModel, ClientPlatformUtils, ModelPartId, avoidZFighting, PlayerAccessory } from "../../src/Index";
import { BoxGeometry, DirectionalLight, Mesh, ShadowMaterial } from 'three';

const canvas = document.createElement("canvas");
document.querySelector("#app")!.appendChild(canvas);




function loadModel(renderer: Renderer, id: string, bodyPart: ModelPartId) {
    return new Promise<PlayerAccessory>((resolve, reject) => {
        try {
            fetch(`/${id}.json`).then(r => r.json()).then(async r => {
                const player = renderer.getPlayer(true);
                if (!player) {
                    return reject("Player isn't in scene");
                }
                const model = parseJavaBlockModel(r, {
                    textureUrl: `/${id}.png`,
                    offset: [-8, 8, -8],
                    attachTo: bodyPart
                });
                avoidZFighting(model, 0.0001);
                const outModel = await player.addAccessory(model, new ClientPlatformUtils(), id, {
                    srgb: true,
                });
    
                resolve(outModel);
            });
        } catch (e) {
            reject(e);
            if (!renderer.getPlayer()) return reject("Player isn't in scene");
        }
    });
}


const renderer = new Renderer({
    live: true,
    platformUtils: new ClientPlatformUtils(),
    canvas,
    ambientLight: {
        intensity: 0.5
    },
    player: {
        onSkinLoad: () => console.log("SKIN LOADED!"),
        castShadow: true,
        receiveShadow: false,
        elytra: {
            url: "https://api.cosmetica.cc/get/cloak?user=lythogeor&optifine=show",
            spread: 0
        },
        cloak: {
            url: "https://api.cosmetica.cc/get/cloak?user=lythogeor&optifine=show"
        }
    },
    antialias: true,
    fxaa: true,
    ssaa: false,
    alpha: true,
    controls: true,
    shadows: true
});

loadModel(renderer, "bucket-hat", "head");


function resize() {
    renderer.setSize(window.innerWidth - 40, window.innerHeight - 40);
}

window.addEventListener("resize", resize);
resize();


document.querySelector("#steve")?.addEventListener("click", () => renderer.getPlayer(true)?.setSlim(false));
document.querySelector("#alex")?.addEventListener("click", () => renderer.getPlayer(true)?.setSlim(true));
document.querySelector("#destroy")?.addEventListener("click", () => renderer.destroy(true));
document.querySelector("#remove-models")?.addEventListener("click", () => {
    if (renderer.getPlayer(true)) {
        for (let key in renderer.getPlayer().getAccessories()) {
            renderer.getPlayer().removeAccessory(key);
        }
    }
});
document.querySelector("#midnight-cape")?.addEventListener("click", () => renderer.getPlayer().getCloak().setTexture("https://mantle-assets.com/cape/ld4i5.png?" + Date.now()));
document.querySelector("#screenshot")?.addEventListener("click", async () => {
    const start = Date.now();
    const screenshot = await renderer.screenshot(renderer.getCamera(), 1000, 1000, "png", 5);
    const duration = Date.now() - start;
    console.log(`Rendered screenshot in ${duration}ms`);
    console.log(screenshot);
});

document.querySelector("#shadows-cast")?.addEventListener("click", () => renderer.getPlayer(true)?.setShadowOptions(!renderer.getPlayer().getShadowOptions().cast, renderer.getPlayer().getShadowOptions().receive));
document.querySelector("#shadows-receive")?.addEventListener("click", () => renderer.getPlayer(true)?.setShadowOptions(renderer.getPlayer().getShadowOptions().cast, !renderer.getPlayer().getShadowOptions().receive));



const backgroundMaterial = new ShadowMaterial();
backgroundMaterial.opacity = 0.3;

const backgroundGeometry = new BoxGeometry(1000, 1000, 0.1);
const backgroundMesh = new Mesh(backgroundGeometry, backgroundMaterial);
backgroundMesh.castShadow = true;
backgroundMesh.receiveShadow = true;
backgroundMesh.rotation.x = 1.2;
backgroundMesh.position.y = -25;
renderer.getScene().add(backgroundMesh);


const pointLight = new DirectionalLight(0xffffff, 1.5);

pointLight.shadow.camera.left = -300;
pointLight.shadow.camera.right = 300;
pointLight.shadow.camera.top = 500;
pointLight.shadow.camera.bottom = -100;
pointLight.shadow.bias = -0.005;
pointLight.shadow.mapSize.width = 512;
pointLight.shadow.mapSize.height = 512;
pointLight.shadow.radius = 100;
pointLight.shadow.blurSamples = 25;

pointLight.position.set(0, 200, -200);
pointLight.castShadow = true;
pointLight.target.position.set(0, 0, -400);
renderer.getScene().add(pointLight);

// const playerMesh = renderer.getPlayer().getMesh();
// playerMesh.castShadow = true;
// playerMesh.receiveShadow = true;

// renderer.getScene().traverse(child => {
//     if (child.type == "Mesh") {
//         child.castShadow = true;
//     }
// });


renderer.addEventListener("prerender", () => {
    const time = renderer.getRenderTime();
    const player = renderer.getPlayer();
    const elytra = player.getElytra();
    const cloak = player.getCloak();

    player.getBodyPart("armLeft").pivot.rotation.x = Math.sin(time / 150);
    player.getBodyPart("armRight").pivot.rotation.x = -Math.sin(time / 150);
    
    player.getBodyPart("legLeft").pivot.rotation.x = Math.sin(time / 150);
    player.getBodyPart("legRight").pivot.rotation.x = -Math.sin(time / 150);

    elytra.setSpread(Math.sin(time / 300) / 2 + 0.5);
    // cloak.setAngle((Math.sin(time / 300) / 2 + 0.5) * Math.PI);

    // cloak.setFrame(Math.floor(time / 100));
});