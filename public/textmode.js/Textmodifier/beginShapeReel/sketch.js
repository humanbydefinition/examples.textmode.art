/**
 * @title Textmodifier.beginShapeReel
 */
import { textmode } from 'textmode.js';
import { getShapeVertex } from './geometry.js';
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
});

let customShader = null;
const chars = ['.', ':', '-', '=', '+', '*', '%', 'X', '@', '#']; // 16 characters for the ramp
const charRamp = [];

t.setup(async () => {
	// Populate character ramp color markers
	for (const c of chars) {
		const glyph = t.font.characterMap.get(c) ?? t.font.characters[1];
		const marker = glyph?.color ?? [0, 0, 0];
		charRamp.push(marker);
	}

	// Load custom fragment shader
	customShader = await t.createMaterialShader('./shader.frag');
});

// Cubic ease in/out
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// Grid size for the mesh (24 x 24 = 576 vertices)
const U = 24;
const V = 24;

t.draw(() => {
	t.background(18, 14, 32); // Deep rich indigo/violet, not black
	const time = t.frameCount * 0.015;

	// Shape cycle: 5 shapes, 4.5 seconds per shape
	const duration = 4500;
	const m = t.millis % duration;
	const progress = m / duration;
	const easeProgress = ease(progress);

	const currentShape = Math.floor(t.millis / duration) % 5;
	const nextShape = (currentShape + 1) % 5;

	// Orbiting Camera
	const camRadius = 30.0 + Math.sin(time * 0.4) * 4.0;
	const camX = Math.cos(time * 0.2) * camRadius;
	const camY = Math.sin(time * 0.15) * 8.0 - 4.0;
	const camZ = Math.sin(time * 0.2) * camRadius;

	// Orbiting Pointlight
	const lightAngle = time * 1.2;
	const lightRadius = 22.0 + Math.cos(time * 0.6) * 6.0;
	const lightX = Math.cos(lightAngle) * lightRadius;
	const lightY = Math.sin(time * 0.8) * 15.0;
	const lightZ = Math.sin(lightAngle) * lightRadius;

	// Use the built-in light falloff, ambient, and point light APIs
	t.lightFalloff(1.0, 0.015, 0.001);
	t.ambientLight(60, 50, 75); // Soft purple-indigo ambient light (ensures no black shadows)
	t.pointLight(255, 255, 0, lightX, lightY, lightZ); // Bright orbiting point light

	t.perspective(55, 0.1, 4096);
	t.camera(camX, camY, camZ, 0, 0, 0);

	t.push();
	t.rotateY(t.frameCount * 2); // slow global rotation
	t.rotateX(t.frameCount); // slow global rotation

	if (customShader) {
		t.shader(customShader);
		t.setUniforms({
			u_time: 0,
			u_cols: t.grid.cols,
			u_halfW: t.grid.cols * 0.5, // full-screen borderless
			u_charRamp: charRamp,
			u_camPos: [camX, camY, camZ],
		});
	} else {
		t.char('#');
		t.charColor(100, 255, 200);
	}

	// 1. Calculate morphed vertices positions grid
	const vertices = [];
	for (let uIdx = 0; uIdx <= U; uIdx++) {
		vertices[uIdx] = [];
		for (let vIdx = 0; vIdx <= V; vIdx++) {
			const p1 = getShapeVertex(uIdx, vIdx, U, V, currentShape);
			const p2 = getShapeVertex(uIdx, vIdx, U, V, nextShape);

			// Interpolate coordinates
			const x = p1[0] + (p2[0] - p1[0]) * easeProgress;
			const y = p1[1] + (p2[1] - p1[1]) * easeProgress;
			const z = p1[2] + (p2[2] - p1[2]) * easeProgress;

			vertices[uIdx][vIdx] = [x, y, z];
		}
	}

	// 2. Render wireframe mesh using t.TRIANGLES
	t.beginShape(t.TRIANGLES);
	for (let uIdx = 0; uIdx < U; uIdx++) {
		for (let vIdx = 0; vIdx < V; vIdx++) {
			const p00 = vertices[uIdx][vIdx];
			const p10 = vertices[uIdx + 1][vIdx];
			const p01 = vertices[uIdx][vIdx + 1];
			const p11 = vertices[uIdx + 1][vIdx + 1];

			// Triangle 1
			t.vertex(p00[0], p00[1], p00[2]);
			t.vertex(p10[0], p10[1], p10[2]);
			t.vertex(p11[0], p11[1], p11[2]);

			// Triangle 2
			t.vertex(p00[0], p00[1], p00[2]);
			t.vertex(p11[0], p11[1], p11[2]);
			t.vertex(p01[0], p01[1], p01[2]);
		}
	}
	t.endShape();

	if (customShader) t.resetShader();
	t.pop();
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
