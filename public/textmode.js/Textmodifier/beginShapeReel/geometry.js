export function getShapeVertex(uIndex, vIndex, U, V, shapeIndex) {
	const u = (uIndex / U) * Math.PI * 2.0;

	if (shapeIndex === 0) {
		// Sphere
		const v = (vIndex / V) * Math.PI;
		const r = 11.5;
		return [r * Math.cos(u) * Math.sin(v), r * Math.cos(v), r * Math.sin(u) * Math.sin(v)];
	} else if (shapeIndex === 1) {
		// Torus
		const v = (vIndex / V) * Math.PI * 2.0;
		const R = 11.0,
			r = 4.5;
		return [(R + r * Math.cos(v)) * Math.cos(u), r * Math.sin(v), (R + r * Math.cos(v)) * Math.sin(u)];
	} else if (shapeIndex === 2) {
		// Cylinder
		const v = vIndex / V - 0.5; // [-0.5, 0.5]
		const r = 8.5,
			h = 18.0;
		return [r * Math.cos(u), v * h, r * Math.sin(u)];
	} else if (shapeIndex === 3) {
		// Rounded Cube
		const v = (vIndex / V) * Math.PI;
		const r = 9.5;
		const cx = Math.cos(u) * Math.sin(v);
		const cy = Math.cos(v);
		const cz = Math.sin(u) * Math.sin(v);

		// Smooth clamp function to project sphere into a rounded box
		const scale = (val) => Math.max(-0.68, Math.min(0.68, val)) * (1.0 / 0.68);
		return [r * scale(cx), r * scale(cy), r * scale(cz)];
	} else {
		// Mobius Strip
		const v = (vIndex / V) * 2.0 - 1.0; // [-1.0, 1.0]
		const R = 9.5,
			w = 4.5;
		const cosHalfU = Math.cos(u * 0.5);
		const sinHalfU = Math.sin(u * 0.5);
		return [(R + v * w * cosHalfU) * Math.cos(u), v * w * sinHalfU, (R + v * w * cosHalfU) * Math.sin(u)];
	}
}
