import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new GUI({
    width: 350,
    title: "Bảng điều khiển thuộc tính Thiên Hà 🌟",
});

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Galaxy
 */
const parameters = {};
parameters.count = 200000; // số lượng sao nhiều hơn cho dày đặc
parameters.size = 0.005; // sao nhỏ hơn để tự nhiên
parameters.radius = 5; // bán kính lớn hơn
parameters.branches = 5; // số nhánh xoắn chính (Milky Way thường 4–6 nhánh)
parameters.spin = 1.2; // độ xoắn vừa phải, dương để xoắn thuận
parameters.randomness = 0.4; // độ ngẫu nhiên nhẹ để tạo mây sao
parameters.randomnessPower = 3; // giữ nguyên, tạo cluster ở tâm
parameters.insideColor = "#ffccaa"; // màu vàng trắng sáng (trung tâm dày đặc)
parameters.outsideColor = "#1b3984"; // xanh tím đậm (vùng ngoài)

let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () => {
    // Nếu đã tồn tại rồi thì phải xóa đi, đây là dùng cho trường hợp thay đổi các thuộc tính
    if (points !== null) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
    }

    // Geometry
    geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;

        // Positions
        const radius = Math.random() * parameters.radius; // Bán kính

        const { branches, spin, randomness } = parameters;

        const spinAngle = radius * spin;
        const branchAngle = ((i % branches) / branches) * Math.PI * 2; // Góc của nhánh

        const randomX =
            Math.pow(Math.random(), parameters.randomnessPower) *
            (Math.random() < 0.5 ? 1 : -1) *
            parameters.randomness *
            radius;
        const randomY =
            Math.pow(Math.random(), parameters.randomnessPower) *
            (Math.random() < 0.5 ? 1 : -1) *
            parameters.randomness *
            radius;
        const randomZ =
            Math.pow(Math.random(), parameters.randomnessPower) *
            (Math.random() < 0.5 ? 1 : -1) *
            parameters.randomness *
            radius;

        positions[i3 + 0] =
            Math.cos(branchAngle + spinAngle) * radius + randomX; // X
        positions[i3 + 1] = 0 + randomY; // Y
        positions[i3 + 2] =
            Math.sin(branchAngle + spinAngle) * radius + randomZ; // Z

        // Color

        const colorInside = new THREE.Color(parameters.insideColor);
        const colorOutside = new THREE.Color(parameters.outsideColor);
        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, radius / parameters.radius);

        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Material
    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
    });

    // Points
    points = new THREE.Points(geometry, material);
    scene.add(points);
    console.log("galaxy generated");
};
generateGalaxy();

gui.add(parameters, "count")
    .min(100)
    .max(1000000)
    .step(100)
    .name("Số lượng ngôi sao")
    .onFinishChange(generateGalaxy);
gui.add(parameters, "size")
    .min(0.001)
    .max(0.1)
    .step(0.001)
    .name("Kích cỡ ngôi sao")
    .onFinishChange(generateGalaxy);
gui.add(parameters, "radius")
    .min(0.1)
    .max(20)
    .step(0.1)
    .name("Bán kính thiên hà")
    .onFinishChange(generateGalaxy);
gui.add(parameters, "branches")
    .min(2)
    .max(15)
    .step(1)
    .name("Nhánh của thiên hà")
    .onFinishChange(generateGalaxy);
gui.add(parameters, "spin")
    .min(-3)
    .max(3)
    .step(0.001)
    .name("Độ xoắn của thiên hà")
    .onFinishChange(generateGalaxy);
gui.add(parameters, "randomness")
    .min(0)
    .max(2)
    .step(0.01)
    .name("Độ ngẫu nhiên của các ngôi sao")
    .onFinishChange(generateGalaxy);
gui.add(parameters, "randomnessPower")
    .min(1)
    .max(10)
    .step(0.001)
    .onFinishChange(generateGalaxy)
    .name("Cường độ ngẫu nhiên của các ngôi sao");
gui.addColor(parameters, "insideColor")
    .onFinishChange(generateGalaxy)
    .name("Màu ở trong");
gui.addColor(parameters, "outsideColor")
    .onFinishChange(generateGalaxy)
    .name("Màu ở rìa");

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

window.addEventListener("resize", () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
