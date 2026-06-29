var pe = Object.defineProperty;
var me = (t, e, n) => e in t ? pe(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var d = (t, e, n) => me(t, typeof e != "symbol" ? e + "" : e, n);
const M = { charColor: "prevCharColorBuffer", char: "prevCharBuffer", cellColor: "prevCellColorBuffer" }, P = { charColor: "_charColor", char: "_char", cellColor: "_cellColor" }, he = "src", ge = "coord", ye = "color", _e = "combine", ve = "combineCoord", re = /* @__PURE__ */ new Set(["combine", "combineCoord"]), J = /* @__PURE__ */ new Set(["coord", "combineCoord"]), xe = { [he]: { returnType: "vec4", args: [{ type: "vec2", name: "_st" }] }, [ge]: { returnType: "vec2", args: [{ type: "vec2", name: "_st" }] }, [ye]: { returnType: "vec4", args: [{ type: "vec4", name: "_c0" }] }, [_e]: { returnType: "vec4", args: [{ type: "vec4", name: "_c0" }, { type: "vec4", name: "_c1" }] }, [ve]: { returnType: "vec2", args: [{ type: "vec2", name: "_st" }, { type: "vec4", name: "_c0" }] } }, Ce = /* @__PURE__ */ new Set(["abs", "acos", "asin", "atan", "ceil", "clamp", "cos", "cross", "degrees", "distance", "dot", "equal", "exp", "exp2", "faceforward", "floor", "fract", "inverse", "inversesqrt", "length", "lessThan", "lessThanEqual", "log", "log2", "max", "min", "mix", "mod", "normalize", "not", "notEqual", "pow", "radians", "reflect", "refract", "sign", "sin", "smoothstep", "sqrt", "step", "tan", "texture"]);
function be(t) {
  const e = xe[t.type], n = t.inputs.map((c) => ({ type: c.type, name: Z(c.name) })), r = [...e.args, ...n].map((c) => `${c.type} ${c.name}`).join(", "), o = `tm_${t.name}`, a = t.inputs.reduce((c, l) => {
    const f = Z(l.name);
    return f === l.name ? c : c.replace(new RegExp(`\\b${Se(l.name)}\\b`, "g"), f);
  }, t.glsl), s = `
${e.returnType} ${o}(${r}) {
${a}
}`;
  return { ...t, glslName: o, glslFunction: s };
}
function Z(t) {
  return Ce.has(t) ? `tm_${t}` : t;
}
function Se(t) {
  return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
class we {
  constructor() {
    d(this, "_transforms", /* @__PURE__ */ new Map());
    d(this, "_processedCache", /* @__PURE__ */ new Map());
  }
  register(e) {
    this._transforms.has(e.name) && console.warn(`[TransformRegistry] Overwriting existing transform: ${e.name}`), this._transforms.set(e.name, e), this._processedCache.delete(e.name);
  }
  registerMany(e) {
    for (const n of e) this.register(n);
  }
  get(e) {
    return this._transforms.get(e);
  }
  getProcessed(e) {
    let n = this._processedCache.get(e);
    if (!n) {
      const r = this._transforms.get(e);
      r && (n = be(r), this._processedCache.set(e, n));
    }
    return n;
  }
  has(e) {
    return this._transforms.has(e);
  }
  getByType(e) {
    return Array.from(this._transforms.values()).filter((n) => n.type === e);
  }
  getNames() {
    return Array.from(this._transforms.keys());
  }
  getAll() {
    return Array.from(this._transforms.values());
  }
  getSourceTransforms() {
    return this.getByType("src");
  }
  remove(e) {
    return this._processedCache.delete(e), this._transforms.delete(e);
  }
  clear() {
    this._transforms.clear(), this._processedCache.clear();
  }
  get size() {
    return this._transforms.size;
  }
}
const O = new we(), ee = /* @__PURE__ */ new Set(["src"]);
class $e {
  constructor() {
    d(this, "_generatedFunctions", {});
    d(this, "_synthSourceClass", null);
  }
  setSynthSourceClass(e) {
    this._synthSourceClass = e;
  }
  injectMethods(e) {
    const n = O.getAll();
    for (const r of n) this._injectMethod(e, r);
  }
  _injectMethod(e, n) {
    const r = this._synthSourceClass, { name: o, inputs: a, type: s } = n, c = e;
    if (re.has(s)) c[o] = function(l, ...f) {
      let i = l;
      if (r && !(l instanceof r)) {
        const p = new r(), u = typeof l == "number" ? [l, l, l, null] : [l, null, null, null];
        p.addTransform("solid", u), i = p;
      }
      return this.addCombineTransform(o, i, N(a, f));
    };
    else {
      const l = this._expandColorArgs.bind(this);
      c[o] = function(...f) {
        return f = l(o, f), this.addTransform(o, N(a, f));
      };
    }
  }
  _expandColorArgs(e, n) {
    if ((e === "solid" || e === "color") && n.length === 1 && typeof n[0] == "number") {
      const r = n[0];
      return [r, r, r];
    }
    return n;
  }
  generateStandaloneFunctions() {
    if (!this._synthSourceClass) throw new Error("[TransformFactory] SynthSource class not set. Call setSynthSourceClass first.");
    const e = {}, n = O.getAll(), r = this._synthSourceClass;
    for (const o of n) if (ee.has(o.type)) {
      const { name: a, inputs: s } = o;
      e[a] = (...c) => {
        const l = new r();
        return c = this._expandColorArgs(a, c), l.addTransform(a, N(s, c));
      };
    }
    return this._generatedFunctions = e, e;
  }
  getGeneratedFunctions() {
    return this._generatedFunctions;
  }
  addTransform(e, n) {
    if (O.register(e), n && this._injectMethod(n, e), ee.has(e.type) && this._synthSourceClass) {
      const r = this._synthSourceClass, { name: o, inputs: a } = e;
      this._generatedFunctions[o] = (...s) => {
        const c = new r();
        return s = this._expandColorArgs(o, s), c.addTransform(o, N(a, s));
      };
    }
  }
}
function N(t, e) {
  return t.map((n, r) => e[r] ?? n.default);
}
const j = new $e(), Me = { name: "osc", type: "src", inputs: [{ name: "frequency", type: "float", default: 60 }, { name: "sync", type: "float", default: 0.1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	float r = sin((st.x - offset/frequency + time*sync) * frequency) * 0.5 + 0.5;
	float g = sin((st.x + time*sync) * frequency) * 0.5 + 0.5;
	float b = sin((st.x + offset/frequency + time*sync) * frequency) * 0.5 + 0.5;
	return vec4(r, g, b, 1.0);
`, description: "Generate oscillating color pattern" }, Te = { name: "noise", type: "src", inputs: [{ name: "scale", type: "float", default: 10 }, { name: "offset", type: "float", default: 0.1 }], glsl: `
	return vec4(vec3(_noise(vec3(_st * scale, offset * time))), 1.0);
`, description: "Generate noise pattern" }, Fe = { name: "plasma", type: "src", inputs: [{ name: "scale", type: "float", default: 10 }, { name: "speed", type: "float", default: 0.5 }, { name: "phase", type: "float", default: 0 }, { name: "contrast", type: "float", default: 1 }], glsl: `
	float t = time * speed + phase;
	float v = 0.0;
	v += sin((_st.x * scale) + t);
	v += sin((_st.y * scale * 1.1) + t * 1.2);
	v += sin(((_st.x + _st.y) * scale * 0.7) + t * 0.8);
	v = v / 3.0;
	v = v * 0.5 + 0.5;
	v = clamp((v - 0.5) * contrast + 0.5, 0.0, 1.0);
	return vec4(vec3(v), 1.0);
`, description: "Generate plasma-like sine field" }, Ie = { name: "moire", type: "src", inputs: [{ name: "freqA", type: "float", default: 20 }, { name: "freqB", type: "float", default: 21 }, { name: "angleA", type: "float", default: 0 }, { name: "angleB", type: "float", default: 1.5708 }, { name: "speed", type: "float", default: 0.1 }, { name: "phase", type: "float", default: 0 }], glsl: `
	float t = time * speed + phase;
	vec2 p = _st - vec2(0.5);
	vec2 dirA = vec2(cos(angleA), sin(angleA));
	vec2 dirB = vec2(cos(angleB), sin(angleB));
	float a = sin(dot(p, dirA) * freqA + t);
	float b = sin(dot(p, dirB) * freqB - t * 0.7);
	float v = a * b;
	v = v * 0.5 + 0.5;
	return vec4(vec3(v), 1.0);
`, description: "Generate moire interference patterns" }, Re = { name: "voronoi", type: "src", inputs: [{ name: "scale", type: "float", default: 5 }, { name: "speed", type: "float", default: 0.3 }, { name: "blending", type: "float", default: 0.3 }], glsl: `
	vec3 color = vec3(0.0);
	vec2 st = _st * scale;
	vec2 i_st = floor(st);
	vec2 f_st = fract(st);
	float m_dist = 10.0;
	vec2 m_point;
	for (int j = -1; j <= 1; j++) {
		for (int i = -1; i <= 1; i++) {
			vec2 neighbor = vec2(float(i), float(j));
			vec2 p = i_st + neighbor;
		// Apply seed offset to hash function for deterministic randomness
			// Use fract() to avoid precision issues with large seeds
			vec2 seedOffset = vec2(fract(_seed * 0.1271) * 1000.0, fract(_seed * 0.3117) * 1000.0);
			vec2 point = fract(sin(vec2(dot(p + seedOffset, vec2(127.1, 311.7)), dot(p + seedOffset, vec2(269.5, 183.3)))) * 43758.5453);
			point = 0.5 + 0.5 * sin(time * speed + 6.2831 * point);
			vec2 diff = neighbor + point - f_st;
			float dist = length(diff);
			if (dist < m_dist) {
				m_dist = dist;
				m_point = point;
			}
		}
	}
	color += dot(m_point, vec2(0.3, 0.6));
	color *= 1.0 - blending * m_dist;
	return vec4(color, 1.0);
`, description: "Generate voronoi pattern" }, Pe = { name: "gradient", type: "src", inputs: [{ name: "speed", type: "float", default: 0 }], glsl: `
	return vec4(_st, sin(time * speed), 1.0);
`, description: "Generate gradient pattern" }, ke = { name: "shape", type: "src", inputs: [{ name: "sides", type: "float", default: 3 }, { name: "radius", type: "float", default: 0.3 }, { name: "smoothing", type: "float", default: 0.01 }], glsl: `
	vec2 st = _st * 2.0 - 1.0;
	float a = atan(st.x, st.y) + 3.1416;
	float r = (2.0 * 3.1416) / sides;
	float d = cos(floor(0.5 + a/r) * r - a) * length(st);
	return vec4(vec3(1.0 - smoothstep(radius, radius + smoothing + 0.0000001, d)), 1.0);
`, description: "Generate polygon shape" }, Ae = { name: "solid", type: "src", inputs: [{ name: "r", type: "float", default: 0 }, { name: "g", type: "float", default: 0 }, { name: "b", type: "float", default: 0 }, { name: "a", type: "float", default: 1 }], glsl: `
	return vec4(r, g, b, a);
`, description: "Generate solid color" }, Le = { name: "src", type: "src", inputs: [], glsl: `
	return texture(${M.charColor}, fract(_st));
`, description: "Sample the previous frame for feedback effects. Context-aware: automatically samples the appropriate texture based on where it is used (char, charColor, or cellColor context)." }, Ue = { name: "srcTexture", type: "src", inputs: [], glsl: `
	// Placeholder - actual texture sampling is handled dynamically per TextmodeSource
	return texture(u_textmodeSource0, fract(_st));
`, description: "Sample from a TextmodeSource (image/video). Context-aware: the actual sampler uniform is determined at compile time based on the source reference." }, Oe = [Me, Te, Fe, Ie, Re, Pe, ke, Ae, Le, Ue];
function oe(t) {
  const e = t === "x" ? "scrollX" : "scrollY";
  return { name: e, type: "coord", inputs: [{ name: e, type: "float", default: 0.5 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.${t} += ${e} + time * speed;
	return fract(st);
`, description: `Scroll ${t.toUpperCase()} coordinate` };
}
function ae(t) {
  return { name: t === "x" ? "repeatX" : "repeatY", type: "coord", inputs: [{ name: "reps", type: "float", default: 3 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 st = _st * vec2(${t === "x" ? "reps, 1.0" : "1.0, reps"});
	st.${t === "x" ? "y" : "x"} += step(1.0, mod(st.${t}, 2.0)) * offset;
	return fract(st);
`, description: "Repeat pattern " + (t === "x" ? "horizontally" : "vertically") };
}
const Ee = { name: "rotate", type: "coord", inputs: [{ name: "angle", type: "float", default: 10 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 xy = _st - vec2(0.5);
	float ang = angle + speed * time;
	xy = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * xy;
	xy += 0.5;
	return xy;
`, description: "Rotate coordinates" }, Ne = { name: "scale", type: "coord", inputs: [{ name: "amount", type: "float", default: 1.5 }, { name: "xMult", type: "float", default: 1 }, { name: "yMult", type: "float", default: 1 }, { name: "offsetX", type: "float", default: 0.5 }, { name: "offsetY", type: "float", default: 0.5 }], glsl: `
	vec2 xy = _st - vec2(offsetX, offsetY);
	xy *= (1.0 / vec2(amount * xMult, amount * yMult));
	xy += vec2(offsetX, offsetY);
	return xy;
`, description: "Scale coordinates" }, De = { name: "scroll", type: "coord", inputs: [{ name: "scrollX", type: "float", default: 0.5 }, { name: "scrollY", type: "float", default: 0.5 }, { name: "speedX", type: "float", default: 0 }, { name: "speedY", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.x += scrollX + time * speedX;
	st.y += scrollY + time * speedY;
	return fract(st);
`, description: "Scroll coordinates" }, ze = oe("x"), Ye = oe("y"), Be = { name: "pixelate", type: "coord", inputs: [{ name: "pixelX", type: "float", default: 20 }, { name: "pixelY", type: "float", default: 20 }], glsl: `
	vec2 xy = vec2(pixelX, pixelY);
	return (floor(_st * xy) + 0.5) / xy;
`, description: "Pixelate coordinates" }, Ve = { name: "repeat", type: "coord", inputs: [{ name: "repeatX", type: "float", default: 3 }, { name: "repeatY", type: "float", default: 3 }, { name: "offsetX", type: "float", default: 0 }, { name: "offsetY", type: "float", default: 0 }], glsl: `
	vec2 st = _st * vec2(repeatX, repeatY);
	st.x += step(1.0, mod(st.y, 2.0)) * offsetX;
	st.y += step(1.0, mod(st.x, 2.0)) * offsetY;
	return fract(st);
`, description: "Repeat pattern" }, Xe = ae("x"), je = ae("y"), qe = { name: "kaleid", type: "coord", inputs: [{ name: "nSides", type: "float", default: 4 }], glsl: `
	vec2 st = _st;
	st -= 0.5;
	float r = length(st);
	float a = atan(st.y, st.x);
	float pi = 2.0 * 3.1416;
	a = mod(a, pi / nSides);
	a = abs(a - pi / nSides / 2.0);
	return r * vec2(cos(a), sin(a));
`, description: "Kaleidoscope effect" }, Ge = { name: "polar", type: "coord", inputs: [{ name: "angle", type: "float", default: 0 }, { name: "radius", type: "float", default: 1 }], glsl: `
	vec2 st = _st - vec2(0.5);
	float r = length(st) * radius;
	float a = atan(st.y, st.x) + angle;
	a = a / (2.0 * 3.1416);
	return vec2(fract(a), r);
`, description: "Convert to polar coordinates" }, He = { name: "twirl", type: "coord", inputs: [{ name: "amount", type: "float", default: 2 }, { name: "radius", type: "float", default: 0.5 }, { name: "centerX", type: "float", default: 0.5 }, { name: "centerY", type: "float", default: 0.5 }], glsl: `
	vec2 center = vec2(centerX, centerY);
	vec2 p = _st - center;
	float r = length(p);
	float safeRadius = max(radius, 0.00001);
	float t = clamp((safeRadius - r) / safeRadius, 0.0, 1.0);
	float angle = amount * t * t;
	float s = sin(angle);
	float c = cos(angle);
	p = vec2(c * p.x - s * p.y, s * p.x + c * p.y);
	return p + center;
`, description: "Twirl distortion with radial falloff" }, Ke = { name: "swirl", type: "coord", inputs: [{ name: "amount", type: "float", default: 4 }, { name: "centerX", type: "float", default: 0.5 }, { name: "centerY", type: "float", default: 0.5 }], glsl: `
	vec2 center = vec2(centerX, centerY);
	vec2 p = _st - center;
	float r = length(p);
	float angle = amount * r;
	float s = sin(angle);
	float c = cos(angle);
	p = vec2(c * p.x - s * p.y, s * p.x + c * p.y);
	return p + center;
`, description: "Swirl distortion around a center" }, Qe = { name: "mirror", type: "coord", inputs: [{ name: "mirrorX", type: "float", default: 1 }, { name: "mirrorY", type: "float", default: 1 }], glsl: `
	vec2 m = abs(fract(_st * 2.0) - 1.0);
	vec2 mixAmt = clamp(vec2(mirrorX, mirrorY), 0.0, 1.0);
	return mix(_st, m, mixAmt);
`, description: "Mirror coordinates across X and/or Y axes" }, We = { name: "shear", type: "coord", inputs: [{ name: "x", type: "float", default: 0 }, { name: "y", type: "float", default: 0 }, { name: "centerX", type: "float", default: 0.5 }, { name: "centerY", type: "float", default: 0.5 }], glsl: `
	vec2 center = vec2(centerX, centerY);
	vec2 p = _st - center;
	p = vec2(p.x + y * p.y, p.y + x * p.x);
	return p + center;
`, description: "Shear coordinates along X and Y" }, Je = { name: "barrel", type: "coord", inputs: [{ name: "amount", type: "float", default: 0.5 }, { name: "centerX", type: "float", default: 0.5 }, { name: "centerY", type: "float", default: 0.5 }], glsl: `
	vec2 center = vec2(centerX, centerY);
	vec2 p = _st - center;
	float r2 = dot(p, p);
	p *= 1.0 + amount * r2;
	return p + center;
`, description: "Barrel distortion (bulge outward)" }, Ze = { name: "pinch", type: "coord", inputs: [{ name: "amount", type: "float", default: 0.5 }, { name: "centerX", type: "float", default: 0.5 }, { name: "centerY", type: "float", default: 0.5 }], glsl: `
	vec2 center = vec2(centerX, centerY);
	vec2 p = _st - center;
	float r2 = dot(p, p);
	p *= 1.0 / (1.0 + amount * r2);
	return p + center;
`, description: "Pinch distortion (pull inward)" }, et = { name: "fisheye", type: "coord", inputs: [{ name: "amount", type: "float", default: 1 }, { name: "centerX", type: "float", default: 0.5 }, { name: "centerY", type: "float", default: 0.5 }], glsl: `
	vec2 center = vec2(centerX, centerY);
	vec2 p = _st - center;
	float r = length(p);
	if (r > 0.0) {
		float k = max(amount, 0.00001);
		float r2 = atan(r * k) / atan(k);
		p = p / r * r2;
	}
	return p + center;
`, description: "Fisheye lens distortion" }, tt = [Ee, Ne, De, ze, Ye, Be, Ve, Xe, je, qe, Ge, He, Ke, Qe, We, Je, Ze, et], nt = [{ name: "scale", type: "float", default: 1 }, { name: "offset", type: "float", default: 0 }];
function K(t) {
  return { name: t, type: "color", inputs: nt, glsl: `
	return vec4(_c0.${t} * scale + offset);
`, description: `Extract ${t === "r" ? "red" : t === "g" ? "green" : "blue"} channel` };
}
const rt = { name: "brightness", type: "color", inputs: [{ name: "amount", type: "float", default: 0.4 }], glsl: `
	return vec4(_c0.rgb + vec3(amount), _c0.a);
`, description: "Adjust brightness" }, ot = { name: "contrast", type: "color", inputs: [{ name: "amount", type: "float", default: 1.6 }], glsl: `
	vec4 c = (_c0 - vec4(0.5)) * vec4(amount) + vec4(0.5);
	return vec4(c.rgb, _c0.a);
`, description: "Adjust contrast" }, at = { name: "invert", type: "color", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return vec4((1.0 - _c0.rgb) * amount + _c0.rgb * (1.0 - amount), _c0.a);
`, description: "Invert colors" }, st = { name: "saturate", type: "color", inputs: [{ name: "amount", type: "float", default: 2 }], glsl: `
	vec3 intensity = vec3(_luminance(_c0.rgb));
	return vec4(mix(intensity, _c0.rgb, amount), _c0.a);
`, description: "Adjust saturation" }, ct = { name: "hue", type: "color", inputs: [{ name: "hue", type: "float", default: 0.4 }], glsl: `
	vec3 c = _rgbToHsv(_c0.rgb);
	c.r += hue;
	return vec4(_hsvToRgb(c), _c0.a);
`, description: "Shift hue" }, it = { name: "colorama", type: "color", inputs: [{ name: "amount", type: "float", default: 5e-3 }], glsl: `
	vec3 c = _rgbToHsv(_c0.rgb);
	c += vec3(amount);
	c = _hsvToRgb(c);
	c = fract(c);
	return vec4(c, _c0.a);
`, description: "Color cycle effect" }, lt = { name: "posterize", type: "color", inputs: [{ name: "bins", type: "float", default: 3 }, { name: "gamma", type: "float", default: 0.6 }], glsl: `
	vec4 c2 = pow(_c0, vec4(gamma));
	c2 *= vec4(bins);
	c2 = floor(c2);
	c2 /= vec4(bins);
	c2 = pow(c2, vec4(1.0 / gamma));
	return vec4(c2.xyz, _c0.a);
`, description: "Posterize colors" }, ut = { name: "luma", type: "color", inputs: [{ name: "threshold", type: "float", default: 0.5 }, { name: "tolerance", type: "float", default: 0.1 }], glsl: `
	float a = _smoothThreshold(_luminance(_c0.rgb), threshold, tolerance);
	return vec4(_c0.rgb * a, a);
`, description: "Luma key" }, ft = { name: "thresh", type: "color", inputs: [{ name: "threshold", type: "float", default: 0.5 }, { name: "tolerance", type: "float", default: 0.04 }], glsl: `
	return vec4(vec3(_smoothThreshold(_luminance(_c0.rgb), threshold, tolerance)), _c0.a);
`, description: "Threshold" }, dt = { name: "color", type: "color", inputs: [{ name: "r", type: "float", default: 1 }, { name: "g", type: "float", default: 1 }, { name: "b", type: "float", default: 1 }, { name: "a", type: "float", default: 1 }], glsl: `
	vec4 c = vec4(r, g, b, a);
	vec4 pos = step(0.0, c);
	return vec4(mix((1.0 - _c0.rgb) * abs(c.rgb), c.rgb * _c0.rgb, pos.rgb), c.a * _c0.a);
`, description: "Multiply by color" }, pt = K("r"), mt = K("g"), ht = K("b"), gt = { name: "shift", type: "color", inputs: [{ name: "r", type: "float", default: 0.5 }, { name: "g", type: "float", default: 0 }, { name: "b", type: "float", default: 0 }, { name: "a", type: "float", default: 0 }], glsl: `
	vec4 c2 = vec4(_c0);
	c2.r += fract(r);
	c2.g += fract(g);
	c2.b += fract(b);
	c2.a += fract(a);
	return vec4(c2.rgba);
`, description: "Shift color channels by adding offset values" }, yt = { name: "gamma", type: "color", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return vec4(pow(max(vec3(0.0), _c0.rgb), vec3(1.0 / amount)), _c0.a);
`, description: "Apply gamma correction" }, _t = { name: "levels", type: "color", inputs: [{ name: "inMin", type: "float", default: 0 }, { name: "inMax", type: "float", default: 1 }, { name: "outMin", type: "float", default: 0 }, { name: "outMax", type: "float", default: 1 }, { name: "gamma", type: "float", default: 1 }], glsl: `
	vec3 v = clamp((_c0.rgb - vec3(inMin)) / (vec3(inMax - inMin) + 0.0000001), 0.0, 1.0);
	v = pow(v, vec3(1.0 / gamma));
	v = mix(vec3(outMin), vec3(outMax), v);
	return vec4(v, _c0.a);
`, description: "Adjust input/output levels and gamma" }, vt = { name: "clamp", type: "color", inputs: [{ name: "min", type: "float", default: 0 }, { name: "max", type: "float", default: 1 }], glsl: `
	return vec4(clamp(_c0.rgb, vec3(min), vec3(max)), _c0.a);
`, description: "Clamp color values to a range" }, xt = { name: "seed", type: "color", inputs: [{ name: "value", type: "float", default: 0 }], glsl: `
	// Set seed for subsequent noise/voronoi calls in this chain
	_seed = value;
	return _c0;
`, description: "Set seed for deterministic randomness in subsequent noise operations" }, Ct = [rt, ot, at, st, ct, it, lt, ut, ft, dt, pt, mt, ht, gt, yt, _t, vt, xt], T = `
	vec3 outRgb = mix(_c0.rgb, result, amount);
	float outA = mix(_c0.a, _c1.a, amount);
	return vec4(outRgb, outA);
`, bt = { name: "add", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return (_c0 + _c1) * amount + _c0 * (1.0 - amount);
`, description: "Add another source" }, St = { name: "sub", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return (_c0 - _c1) * amount + _c0 * (1.0 - amount);
`, description: "Subtract another source" }, wt = { name: "mult", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return _c0 * (1.0 - amount) + (_c0 * _c1) * amount;
`, description: "Multiply with another source" }, $t = { name: "blend", type: "combine", inputs: [{ name: "amount", type: "float", default: 0.5 }], glsl: `
	return _c0 * (1.0 - amount) + _c1 * amount;
`, description: "Blend with another source" }, Mt = { name: "diff", type: "combine", inputs: [], glsl: `
	return vec4(abs(_c0.rgb - _c1.rgb), max(_c0.a, _c1.a));
`, description: "Difference with another source" }, Tt = { name: "layer", type: "combine", inputs: [], glsl: `
	return vec4(mix(_c0.rgb, _c1.rgb, _c1.a), clamp(_c0.a + _c1.a, 0.0, 1.0));
`, description: "Layer another source on top" }, Ft = { name: "mask", type: "combine", inputs: [], glsl: `
	float a = _luminance(_c1.rgb);
	return vec4(_c0.rgb * a, a * _c0.a);
`, description: "Mask with another source" }, It = { name: "screen", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	vec3 result = 1.0 - (1.0 - _c0.rgb) * (1.0 - _c1.rgb);
${T}
`, description: "Screen blend with another source" }, Rt = { name: "overlay", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	vec3 mult = 2.0 * _c0.rgb * _c1.rgb;
	vec3 screen = 1.0 - 2.0 * (1.0 - _c0.rgb) * (1.0 - _c1.rgb);
	vec3 result = mix(mult, screen, step(0.5, _c0.rgb));
${T}
`, description: "Overlay blend with another source" }, Pt = { name: "softlight", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	vec3 result = (1.0 - 2.0 * _c1.rgb) * _c0.rgb * _c0.rgb + 2.0 * _c1.rgb * _c0.rgb;
${T}
`, description: "Soft light blend with another source" }, kt = { name: "hardlight", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	vec3 mult = 2.0 * _c0.rgb * _c1.rgb;
	vec3 screen = 1.0 - 2.0 * (1.0 - _c0.rgb) * (1.0 - _c1.rgb);
	vec3 result = mix(mult, screen, step(0.5, _c1.rgb));
${T}
`, description: "Hard light blend with another source" }, At = { name: "dodge", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	vec3 result = _c0.rgb / max(vec3(0.00001), 1.0 - _c1.rgb);
	result = clamp(result, 0.0, 1.0);
${T}
`, description: "Color dodge blend with another source" }, Lt = { name: "burn", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	vec3 result = 1.0 - (1.0 - _c0.rgb) / max(vec3(0.00001), _c1.rgb);
	result = clamp(result, 0.0, 1.0);
${T}
`, description: "Color burn blend with another source" }, Ut = { name: "lighten", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	vec3 result = max(_c0.rgb, _c1.rgb);
${T}
`, description: "Lighten blend with another source" }, Ot = { name: "darken", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	vec3 result = min(_c0.rgb, _c1.rgb);
${T}
`, description: "Darken blend with another source" }, Et = [bt, St, wt, $t, Mt, Tt, Ft, It, Rt, Pt, kt, At, Lt, Ut, Ot];
function se(t) {
  const e = t === "x" ? "scrollX" : "scrollY";
  return { name: t === "x" ? "modulateScrollX" : "modulateScrollY", type: "combineCoord", inputs: [{ name: e, type: "float", default: 0.5 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.${t} += _c0.r * ${e} + time * speed;
	return fract(st);
`, description: `Modulate ${t.toUpperCase()} scroll with another source` };
}
function ce(t) {
  return { name: t === "x" ? "modulateRepeatX" : "modulateRepeatY", type: "combineCoord", inputs: [{ name: "reps", type: "float", default: 3 }, { name: "offset", type: "float", default: 0.5 }], glsl: `
	vec2 st = _st * vec2(${t === "x" ? "reps, 1.0" : "1.0, reps"});
	st.${t === "x" ? "y" : "x"} += step(1.0, mod(st.${t}, 2.0)) + _c0.r * offset;
	return fract(st);
`, description: `Modulate ${t.toUpperCase()} repeat with another source` };
}
const Nt = { name: "modulate", type: "combineCoord", inputs: [{ name: "amount", type: "float", default: 0.1 }], glsl: `
	return _st + _c0.xy * amount;
`, description: "Modulate coordinates with another source" }, Dt = { name: "modulateScale", type: "combineCoord", inputs: [{ name: "multiple", type: "float", default: 1 }, { name: "offset", type: "float", default: 1 }], glsl: `
	vec2 xy = _st - vec2(0.5);
	xy *= (1.0 / vec2(offset + multiple * _c0.r, offset + multiple * _c0.g));
	xy += vec2(0.5);
	return xy;
`, description: "Modulate scale with another source" }, zt = { name: "modulateRotate", type: "combineCoord", inputs: [{ name: "multiple", type: "float", default: 1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 xy = _st - vec2(0.5);
	float angle = offset + _c0.x * multiple;
	xy = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * xy;
	xy += 0.5;
	return xy;
`, description: "Modulate rotation with another source" }, Yt = { name: "modulatePixelate", type: "combineCoord", inputs: [{ name: "multiple", type: "float", default: 10 }, { name: "offset", type: "float", default: 3 }], glsl: `
	vec2 xy = vec2(offset + _c0.x * multiple, offset + _c0.y * multiple);
	return (floor(_st * xy) + 0.5) / xy;
`, description: "Modulate pixelation with another source" }, Bt = { name: "modulateKaleid", type: "combineCoord", inputs: [{ name: "nSides", type: "float", default: 4 }], glsl: `
	vec2 st = _st - 0.5;
	float r = length(st);
	float a = atan(st.y, st.x);
	float pi = 2.0 * 3.1416;
	a = mod(a, pi / nSides);
	a = abs(a - pi / nSides / 2.0);
	return (_c0.r + r) * vec2(cos(a), sin(a));
`, description: "Modulate kaleidoscope with another source" }, Vt = se("x"), Xt = se("y"), jt = { name: "modulateRepeat", type: "combineCoord", inputs: [{ name: "repeatX", type: "float", default: 3 }, { name: "repeatY", type: "float", default: 3 }, { name: "offsetX", type: "float", default: 0.5 }, { name: "offsetY", type: "float", default: 0.5 }], glsl: `
	vec2 st = _st * vec2(repeatX, repeatY);
	st.x += step(1.0, mod(st.y, 2.0)) + _c0.r * offsetX;
	st.y += step(1.0, mod(st.x, 2.0)) + _c0.g * offsetY;
	return fract(st);
`, description: "Modulate repeat pattern with another source" }, qt = ce("x"), Gt = ce("y"), Ht = { name: "modulateHue", type: "combineCoord", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return _st + (vec2(_c0.g - _c0.r, _c0.b - _c0.g) * amount * 1.0 / u_resolution);
`, description: "Modulate coordinates based on hue differences" }, Kt = [Nt, Dt, zt, Yt, Bt, Vt, Xt, jt, qt, Gt, Ht], Qt = [...Oe, ...tt, ...Ct, ...Et, ...Kt];
class L {
  constructor(e) {
    d(this, "_transforms");
    this._transforms = e;
  }
  static empty() {
    return new L([]);
  }
  static from(e) {
    return new L([...e]);
  }
  get transforms() {
    return this._transforms;
  }
  push(e) {
    this._transforms.push(e);
  }
  get length() {
    return this._transforms.length;
  }
  get isEmpty() {
    return this._transforms.length === 0;
  }
  append(e) {
    return new L([...this._transforms, e]);
  }
  get(e) {
    return this._transforms[e];
  }
  [Symbol.iterator]() {
    return this._transforms[Symbol.iterator]();
  }
}
class x {
  constructor(e) {
    d(this, "_chain");
    d(this, "_charMapping");
    d(this, "_nestedSources");
    d(this, "_externalLayerRefs");
    d(this, "_charColorSource");
    d(this, "_cellColorSource");
    d(this, "_charSource");
    d(this, "_textmodeSourceRefs");
    this._chain = (e == null ? void 0 : e.chain) ?? L.empty(), this._charMapping = e == null ? void 0 : e.charMapping, this._charColorSource = e == null ? void 0 : e.charColorSource, this._cellColorSource = e == null ? void 0 : e.cellColorSource, this._charSource = e == null ? void 0 : e.charSource, this._nestedSources = (e == null ? void 0 : e.nestedSources) ?? /* @__PURE__ */ new Map(), this._externalLayerRefs = (e == null ? void 0 : e.externalLayerRefs) ?? /* @__PURE__ */ new Map(), this._textmodeSourceRefs = (e == null ? void 0 : e.textmodeSourceRefs) ?? /* @__PURE__ */ new Map();
  }
  addTransform(e, n) {
    const r = { name: e, userArgs: n };
    return this._chain.push(r), this;
  }
  addCombineTransform(e, n, r) {
    const o = this._chain.length;
    return this._nestedSources.set(o, n), this.addTransform(e, r);
  }
  addExternalLayerRef(e) {
    const n = this._chain.length;
    return this._externalLayerRefs.set(n, e), this.addTransform("src", []);
  }
  addTextmodeSourceRef(e) {
    const n = this._chain.length;
    return this._textmodeSourceRefs.set(n, e), this.addTransform("srcTexture", []);
  }
  charMap(e) {
    if (e.length === 0) return this._charMapping = void 0, this;
    const n = Array.from(e), r = [];
    for (const o of n) r.push(o.codePointAt(0) ?? 32);
    return this._charMapping = { chars: e, indices: r }, this;
  }
  _ensureSource(e, n, r, o) {
    if (e instanceof x) return e;
    const a = new x(), s = typeof e == "number" && n === void 0 && r === void 0 && o === void 0 ? [e, e, e, null] : [e, n, r, o].map((c) => c === void 0 ? null : c);
    return a.addTransform("solid", s), a;
  }
  charColor(e, n, r, o) {
    return this._charColorSource = this._ensureSource(e, n, r, o), this;
  }
  char(e) {
    return this._charSource = e, this;
  }
  cellColor(e, n, r, o) {
    return this._cellColorSource = this._ensureSource(e, n, r, o), this;
  }
  paint(e, n, r, o) {
    const a = this._ensureSource(e, n, r, o);
    return this._charColorSource = a, this._cellColorSource = a, this;
  }
  clone() {
    var o, a, s;
    const e = /* @__PURE__ */ new Map();
    for (const [c, l] of this._nestedSources) e.set(c, l.clone());
    const n = /* @__PURE__ */ new Map();
    for (const [c, l] of this._externalLayerRefs) n.set(c, { ...l });
    const r = /* @__PURE__ */ new Map();
    for (const [c, l] of this._textmodeSourceRefs) r.set(c, { ...l });
    return new x({ chain: L.from(this._chain.transforms), charMapping: this._charMapping, charColorSource: (o = this._charColorSource) == null ? void 0 : o.clone(), cellColorSource: (a = this._cellColorSource) == null ? void 0 : a.clone(), charSource: (s = this._charSource) == null ? void 0 : s.clone(), nestedSources: e, externalLayerRefs: n, textmodeSourceRefs: r });
  }
  get transforms() {
    return this._chain.transforms;
  }
  get charMapping() {
    return this._charMapping;
  }
  get charColorSource() {
    return this._charColorSource;
  }
  get cellColorSource() {
    return this._cellColorSource;
  }
  get charSource() {
    return this._charSource;
  }
  get nestedSources() {
    return this._nestedSources;
  }
  get externalLayerRefs() {
    return this._externalLayerRefs;
  }
  get textmodeSourceRefs() {
    return this._textmodeSourceRefs;
  }
}
const q = { linear: (t) => t, easeInQuad: (t) => t * t, easeOutQuad: (t) => t * (2 - t), easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : (4 - 2 * t) * t - 1, easeInCubic: (t) => t * t * t, easeOutCubic: (t) => --t * t * t + 1, easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1, easeInQuart: (t) => t * t * t * t, easeOutQuart: (t) => 1 - --t * t * t * t, easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t, easeInQuint: (t) => t * t * t * t * t, easeOutQuint: (t) => 1 + --t * t * t * t * t, easeInOutQuint: (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t, sin: (t) => (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2 };
function te(t, e) {
  return (t % e + e) % e;
}
function Wt(t, e, n, r, o) {
  return e === n ? (r + o) / 2 : (t - e) * (o - r) / (n - e) + r;
}
function Jt() {
  "fast" in Array.prototype || (Object.defineProperty(Array.prototype, "fast", { value: function(t = 1) {
    return this._speed = t, this;
  }, writable: !0, configurable: !0, enumerable: !1 }), Object.defineProperty(Array.prototype, "smooth", { value: function(t = 1) {
    return this._smooth = t, this;
  }, writable: !0, configurable: !0, enumerable: !1 }), Object.defineProperty(Array.prototype, "ease", { value: function(t = "linear") {
    return typeof t == "function" ? (this._smooth = 1, this._ease = t) : q[t] && (this._smooth = 1, this._ease = q[t]), this;
  }, writable: !0, configurable: !0, enumerable: !1 }), Object.defineProperty(Array.prototype, "offset", { value: function(t = 0.5) {
    return this._offset = t % 1, this;
  }, writable: !0, configurable: !0, enumerable: !1 }), Object.defineProperty(Array.prototype, "fit", { value: function(t = 0, e = 1) {
    const n = Math.min(...this), r = Math.max(...this), o = this.map((a) => Wt(a, n, r, t, e));
    return o._speed = this._speed, o._smooth = this._smooth, o._ease = this._ease, o._offset = this._offset, o;
  }, writable: !0, configurable: !0, enumerable: !1 }));
}
function Zt(t, e) {
  const n = t._speed ?? 1, r = t._smooth ?? 0, o = e.time * n * (e.bpm / 60) + (t._offset ?? 0);
  if (r !== 0) {
    const a = t._ease ?? q.linear, s = o - r / 2, c = Math.floor(s), l = te(c, t.length), f = (l + 1) % t.length, i = t[l], p = t[f];
    return a(Math.min((s - c) / r, 1)) * (p - i) + i;
  }
  return t[Math.floor(te(o, t.length))];
}
function en(t) {
  return Array.isArray(t) && t.length > 0 && typeof t[0] == "number";
}
Jt(), O.registerMany(Qt), j.setSynthSourceClass(x), j.injectMethods(x.prototype);
const $ = j.generateStandaloneFunctions(), w = "textmode.synth.js";
function G(t) {
  return t === "char" || t === "cellColor" ? t : "charColor";
}
function ie(t, e) {
  const n = G(e);
  n === "char" ? t.usesChar = !0 : n === "cellColor" ? t.usesCellColor = !0 : t.usesCharColor = !0;
}
class tn {
  constructor() {
    d(this, "_usage", { usesChar: !1, usesCharColor: !1, usesCellColor: !1 });
  }
  trackUsage(e) {
    ie(this._usage, e);
  }
  reset() {
    this._usage.usesChar = !1, this._usage.usesCharColor = !1, this._usage.usesCellColor = !1;
  }
  getUsage() {
    return { usesCharColorFeedback: this._usage.usesCharColor, usesCharFeedback: this._usage.usesChar, usesCellColorFeedback: this._usage.usesCellColor };
  }
  get usesAnyFeedback() {
    return this._usage.usesCharColor || this._usage.usesChar || this._usage.usesCellColor;
  }
  get usesCharColorFeedback() {
    return this._usage.usesCharColor;
  }
  get usesCharFeedback() {
    return this._usage.usesChar;
  }
  get usesCellColorFeedback() {
    return this._usage.usesCellColor;
  }
}
class nn {
  constructor() {
    d(this, "_externalLayers", /* @__PURE__ */ new Map());
    d(this, "_counter", 0);
    d(this, "_layerIdToPrefix", /* @__PURE__ */ new Map());
  }
  getPrefix(e) {
    let n = this._layerIdToPrefix.get(e);
    return n || (n = "extLayer" + this._counter++, this._layerIdToPrefix.set(e, n)), n;
  }
  trackUsage(e, n) {
    const r = this.getPrefix(e.layerId);
    let o = this._externalLayers.get(e.layerId);
    o || (o = { layerId: e.layerId, uniformPrefix: r, usesChar: !1, usesCharColor: !1, usesCellColor: !1 }, this._externalLayers.set(e.layerId, o)), ie(o, n);
  }
  hasLayer(e) {
    return this._externalLayers.has(e);
  }
  getLayerInfo(e) {
    return this._externalLayers.get(e);
  }
  getExternalLayers() {
    return new Map(this._externalLayers);
  }
  get hasExternalLayers() {
    return this._externalLayers.size > 0;
  }
  get count() {
    return this._externalLayers.size;
  }
  reset() {
    this._externalLayers.clear(), this._counter = 0, this._layerIdToPrefix.clear();
  }
}
class rn {
  constructor() {
    d(this, "_sources", /* @__PURE__ */ new Map());
    d(this, "_counter", 0);
  }
  reset() {
    this._sources.clear(), this._counter = 0;
  }
  trackUsage(e, n) {
    let r = this._sources.get(e.sourceId);
    switch (r || (r = { sourceId: e.sourceId, uniformName: "u_tms" + this._counter++, usesChar: !1, usesCharColor: !1, usesCellColor: !1, sourceRef: e }, this._sources.set(e.sourceId, r)), n) {
      case "char":
        r.usesChar = !0;
        break;
      case "charColor":
      case "main":
        r.usesCharColor = !0;
        break;
      case "cellColor":
        r.usesCellColor = !0;
    }
  }
  getSources() {
    return this._sources;
  }
  getUniformName(e) {
    var n;
    return ((n = this._sources.get(e)) == null ? void 0 : n.uniformName) ?? "u_tms0";
  }
  hasAnySources() {
    return this._sources.size > 0;
  }
}
class on {
  getContextAwareGlslFunction(e, n, r, o, a, s, c) {
    return n === "srcTexture" && a && c ? this._generateTextmodeSourceFunction(a, r, c) : n !== "src" ? e.glslFunction : o && s ? this._generateExternalSrcFunction(o, r, s) : this._generateSelfFeedbackSrcFunction(r);
  }
  getFunctionName(e, n, r, o, a, s) {
    return e.name === "srcTexture" && o && s ? `srcTexture_${s(o.sourceId)}_${n}` : e.name !== "src" ? e.glslName : r && a ? `src_ext_${a(r.layerId)}_${n}` : `src_${n}`;
  }
  generateTransformCode(e, n, r, o, a, s, c, l, f, i, p, u, h, g, C) {
    const m = this.getFunctionName(n, i, u, h, g, C), _ = (...y) => [...y, ...f].join(", ");
    let b = a;
    const F = s, S = c, U = l;
    switch (n.type) {
      case "src": {
        const y = `c${r}`;
        e.push(`	vec4 ${y} = ${m}(${_(o)});`), b = y;
        break;
      }
      case "coord": {
        const y = `st${r}`;
        e.push(`	vec2 ${y} = ${m}(${_(o)});`), e.push(`	${o} = ${y};`);
        break;
      }
      case "color": {
        const y = `c${r}`;
        e.push(`	vec4 ${y} = ${m}(${_(a)});`), b = y;
        break;
      }
      case "combine": {
        const y = `c${r}`;
        e.push(`	vec4 ${y} = ${m}(${_(a, p ?? "vec4(0.0)")});`), b = y;
        break;
      }
      case "combineCoord": {
        const y = `st${r}`;
        e.push(`	vec2 ${y} = ${m}(${_(o, p ?? "vec4(0.0)")});`), e.push(`	${o} = ${y};`);
        break;
      }
    }
    return { colorVar: b, charVar: F, flagsVar: S, rotationVar: U };
  }
  _generateExternalSrcFunction(e, n, r) {
    const o = r(e.layerId), a = G(n);
    return `
vec4 ${`src_ext_${o}_${n}`}(vec2 _st) {
	return texture(${`${o}${P[a]}`}, fract(_st));
}
`;
  }
  _generateSelfFeedbackSrcFunction(e) {
    const n = G(e);
    return `
vec4 ${`src_${e}`}(vec2 _st) {
	return texture(${M[n]}, fract(_st));
}
`;
  }
  _generateTextmodeSourceFunction(e, n, r) {
    const o = r(e.sourceId);
    return `
vec4 ${`srcTexture_${o}_${n}`}(vec2 _st) {
	// Flip Y axis to match image orientation (top-left origin)
	vec2 st = vec2(_st.x, 1.0 - _st.y);

	// Source dimensions
	vec2 dim = ${o}_dim;

	// Scale coordinates based on source dimensions vs grid resolution
	// Higher scale value = smaller texture relative to screen
	vec2 scale = u_resolution / dim;
	
	// Calculate offset to center the texture
	// offset = (scale - 1.0) * 0.5
	vec2 offset = (scale - 1.0) * 0.5;
	
	// Apply scaling and offset
	vec2 uv = st * scale - offset;

	// Bounds check - return black/transparent if outside texture area
	if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
		return vec4(0.0);
	}

	return texture(${o}, uv);
}
`;
  }
}
let le = null;
function an(t) {
  le = t;
}
function ne(t, e, n) {
  const r = n ?? le;
  if (r) try {
    r(t, e);
  } catch {
  }
}
function ue(t) {
  if (t === void 0) return "undefined";
  if (t === null) return "null";
  if (typeof t == "number") {
    if (Number.isNaN(t)) return "NaN";
    if (!Number.isFinite(t)) return t > 0 ? "Infinity" : "-Infinity";
  }
  if (Array.isArray(t)) {
    const e = t.findIndex((n) => typeof n != "number" || !Number.isFinite(n));
    if (e >= 0) return `array with invalid element at index ${e}: ${ue(t[e])}`;
  }
  return String(t);
}
function sn(t) {
  return t != null && (typeof t == "number" ? Number.isFinite(t) : !!Array.isArray(t) && t.length > 0 && t.every((e) => typeof e == "number" && Number.isFinite(e)));
}
function cn(t, e, n) {
  return (r) => {
    let o;
    try {
      o = t(r);
    } catch (a) {
      return ne(a, e, r.onError), n;
    }
    return sn(o) ? o : (ne(new Error(`[textmode.synth.js] Invalid dynamic parameter value for "${e}": ${ue(o)}`), e, r.onError), n);
  };
}
class ln {
  constructor() {
    d(this, "_uniforms", /* @__PURE__ */ new Map());
    d(this, "_dynamicUpdaters", /* @__PURE__ */ new Map());
  }
  processArgument(e, n, r) {
    return en(e) ? this._createDynamicUniform(n, r, (o) => Zt(e, o)) : typeof e == "function" ? this._createDynamicUniform(n, r, e) : typeof e == "number" ? { glslValue: B(e) } : this.processDefault(n);
  }
  _createDynamicUniform(e, n, r) {
    const o = `${n}_${e.name}`, a = { name: o, type: e.type, value: e.default ?? 0, isDynamic: !0 }, s = cn(r, o, a.value);
    return this._uniforms.set(o, a), this._dynamicUpdaters.set(o, s), { glslValue: o, uniform: a, updater: s };
  }
  processDefault(e) {
    const n = e.default;
    return typeof n == "number" ? { glslValue: B(n) } : Array.isArray(n) ? { glslValue: `vec${n.length}(${n.map(B).join(", ")})` } : { glslValue: "0.0" };
  }
  getUniforms() {
    return new Map(this._uniforms);
  }
  getDynamicUpdaters() {
    return new Map(this._dynamicUpdaters);
  }
  clear() {
    this._uniforms.clear(), this._dynamicUpdaters.clear();
  }
}
function B(t) {
  return Number.isInteger(t) ? t.toString() + ".0" : t.toString();
}
const un = `
// Global mutable seed variable - can be modified by seed() transform
// Initialized from u_seed uniform in main()
float _seed = 0.0;

// Utility functions
float _luminance(vec3 rgb) {
	const vec3 W = vec3(0.2125, 0.7154, 0.0721);
	return dot(rgb, W);
}

float _smoothThreshold(float value, float threshold, float tolerance) {
	return smoothstep(threshold - (tolerance + 0.0000001), threshold + (tolerance + 0.0000001), value);
}

vec3 _rgbToHsv(vec3 c) {
	vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
	vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
	vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
	float d = q.x - min(q.w, q.y);
	float e = 1.0e-10;
	return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 _hsvToRgb(vec3 c) {
	vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
	vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
	return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// Simplex 3D Noise by Ian McEwan, Ashima Arts
vec4 permute(vec4 x) {
	return mod(((x*34.0)+1.0)*x, 289.0);
}

vec4 taylorInvSqrt(vec4 r) {
	return 1.79284291400159 - 0.85373472095314 * r;
}

float _noise(vec3 v) {
	// Apply seed offset for deterministic randomness
	// Use fract() to keep values bounded and avoid float precision issues with large seeds
	vec3 seedOffset = vec3(
		fract(_seed * 0.1271) * 1000.0,
		fract(_seed * 0.3117) * 1000.0,
		fract(_seed * 0.0747) * 1000.0
	);
	v = v + seedOffset;
	
	const vec2 C = vec2(1.0/6.0, 1.0/3.0);
	const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

	// First corner
	vec3 i = floor(v + dot(v, C.yyy));
	vec3 x0 = v - i + dot(i, C.xxx);

	// Other corners
	vec3 g = step(x0.yzx, x0.xyz);
	vec3 l = 1.0 - g;
	vec3 i1 = min(g.xyz, l.zxy);
	vec3 i2 = max(g.xyz, l.zxy);

	vec3 x1 = x0 - i1 + 1.0 * C.xxx;
	vec3 x2 = x0 - i2 + 2.0 * C.xxx;
	vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

	// Permutations
	i = mod(i, 289.0);
	vec4 p = permute(permute(permute(
		i.z + vec4(0.0, i1.z, i2.z, 1.0))
		+ i.y + vec4(0.0, i1.y, i2.y, 1.0))
		+ i.x + vec4(0.0, i1.x, i2.x, 1.0));

	// Gradients: N*N points uniformly over a square, mapped onto an octahedron.
	float n_ = 1.0/7.0;
	vec3 ns = n_ * D.wyz - D.xzx;

	vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

	vec4 x_ = floor(j * ns.z);
	vec4 y_ = floor(j - 7.0 * x_);

	vec4 x = x_ * ns.x + ns.yyyy;
	vec4 y = y_ * ns.x + ns.yyyy;
	vec4 h = 1.0 - abs(x) - abs(y);

	vec4 b0 = vec4(x.xy, y.xy);
	vec4 b1 = vec4(x.zw, y.zw);

	vec4 s0 = floor(b0) * 2.0 + 1.0;
	vec4 s1 = floor(b1) * 2.0 + 1.0;
	vec4 sh = -step(h, vec4(0.0));

	vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
	vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

	vec3 p0 = vec3(a0.xy, h.x);
	vec3 p1 = vec3(a0.zw, h.y);
	vec3 p2 = vec3(a1.xy, h.z);
	vec3 p3 = vec3(a1.zw, h.w);

	// Normalize gradients
	vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
	p0 *= norm.x;
	p1 *= norm.y;
	p2 *= norm.z;
	p3 *= norm.w;

	// Mix final noise value
	vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
	m = m * m;
	return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

vec4 _packChar(int charIdx) {
	return vec4(float(charIdx % 256) / 255.0, float(charIdx / 256) / 255.0, 0.0, 0.0);
}

int _unpackChar(vec4 c) {
	return int(c.r * 255.0 + c.g * 255.0 * 256.0);
}
`;
function fn(t) {
  const { uniforms: e, glslFunctions: n, mainCode: r, charOutputCode: o, primaryColorVar: a, cellColorVar: s, charMapping: c, usesFeedback: l, usesCharFeedback: f, usesCellColorFeedback: i, usesCharSource: p, externalLayers: u, textmodeSources: h } = t, g = Array.from(e.values()).map((v) => `uniform ${v.type} ${v.name};`).join(`
`);
  let C = "", m = "";
  c && (C = `uniform int u_charMap[${c.indices.length}];
uniform int u_charMapSize;`, m = `
	// Apply character mapping
	int rawCharIdx = _unpackChar(charOutput);
	int mappedCharIdx = u_charMap[int(mod(float(rawCharIdx), float(u_charMapSize)))];
	charOutput = _packChar(mappedCharIdx);`);
  const _ = [];
  l && _.push(`uniform sampler2D ${M.charColor};`), f && _.push(`uniform sampler2D ${M.char};`), i && _.push(`uniform sampler2D ${M.cellColor};`);
  const b = _.join(`
`), F = p ? "uniform float u_charSourceCount;" : "", S = [];
  if (u) for (const [, v] of u) v.usesChar && S.push(`uniform sampler2D ${v.uniformPrefix}${P.char};`), v.usesCharColor && S.push(`uniform sampler2D ${v.uniformPrefix}${P.charColor};`), v.usesCellColor && S.push(`uniform sampler2D ${v.uniformPrefix}${P.cellColor};`);
  const U = S.length > 0 ? `// External layer samplers
${S.join(`
`)}` : "", y = [];
  if (h) for (const [, v] of h) y.push(`uniform sampler2D ${v.uniformName};`), y.push(`uniform vec2 ${v.uniformName}_dim;`);
  return `#version 300 es
precision highp float;

// Varyings
in vec2 v_uv;

// MRT outputs
layout(location = 0) out vec4 o_character;
layout(location = 1) out vec4 o_primaryColor;
layout(location = 2) out vec4 o_secondaryColor;

// Standard uniforms
uniform float time;
uniform float u_seed;
uniform vec2 u_resolution;
${b}
${U}
${y.length > 0 ? `// TextmodeSource samplers (images/videos)
${y.join(`
`)}` : ""}
${C}
${F}

// Dynamic uniforms
${g}

${un}

// Transform functions
${Array.from(n).join(`
`)}

void main() {
	// Initialize mutable seed from uniform (can be overridden by seed() transform)
	_seed = u_seed;
	
	// Transform chain
${r.join(`
`)}

${o}
${m}

	// Output to MRT
	o_character = charOutput;
	o_primaryColor = ${a};
	o_secondaryColor = ${s};
}
`;
}
function dn(t, e, n) {
  return t ? `
	// Character output from generator
	vec4 charOutput = ${e};` : `
	// Derive character from color luminance
	float lum = _luminance(${n}.rgb);
	int charIdx = int(lum * 255.0);
	vec4 charOutput = _packChar(charIdx);`;
}
function z(t) {
  return new pn().compile(t);
}
class pn {
  constructor() {
    d(this, "_uniformManager", new ln());
    d(this, "_feedbackTracker", new tn());
    d(this, "_externalLayerManager", new nn());
    d(this, "_textmodeSourceManager", new rn());
    d(this, "_codeGenerator", new on());
    d(this, "_glslFunctions", /* @__PURE__ */ new Set());
    d(this, "_mainCode", []);
    d(this, "_varCounter", 0);
    d(this, "_currentTarget", "main");
    d(this, "_usesCharSource", !1);
  }
  compile(e) {
    this._reset();
    const n = this._compileChain(e, "main", "vec4(1.0, 1.0, 1.0, 1.0)", "v_uv", "main");
    let r = n.charVar;
    e.charSource && (r = this._compileCharSource(e));
    let o = n.colorVar;
    e.charColorSource && (o = this._compileChain(e.charColorSource, "charColor", "vec4(1.0, 1.0, 1.0, 1.0)", "v_uv", "charColor").colorVar);
    let a = "vec4(0.0, 0.0, 0.0, 0.0)";
    e.cellColorSource && (a = this._compileChain(e.cellColorSource, "cellColor", "vec4(0.0, 0.0, 0.0, 0.0)", "v_uv", "cellColor").colorVar);
    const s = dn(!!r, r ?? "vec4(0.0)", n.colorVar), c = this._feedbackTracker.getUsage();
    return { fragmentSource: fn({ uniforms: this._uniformManager.getUniforms(), glslFunctions: this._glslFunctions, mainCode: this._mainCode, charOutputCode: s, primaryColorVar: o, cellColorVar: a, charMapping: e.charMapping, usesFeedback: c.usesCharColorFeedback, usesCharFeedback: c.usesCharFeedback, usesCellColorFeedback: c.usesCellColorFeedback, usesCharSource: this._usesCharSource, externalLayers: this._externalLayerManager.getExternalLayers(), textmodeSources: this._textmodeSourceManager.getSources() }), uniforms: this._uniformManager.getUniforms(), dynamicUpdaters: this._uniformManager.getDynamicUpdaters(), charMapping: e.charMapping, usesCharColorFeedback: c.usesCharColorFeedback, usesCharFeedback: c.usesCharFeedback, usesCellColorFeedback: c.usesCellColorFeedback, usesCharSource: this._usesCharSource, externalLayers: this._externalLayerManager.getExternalLayers(), textmodeSources: this._textmodeSourceManager.getSources() };
  }
  _reset() {
    this._varCounter = 0, this._uniformManager.clear(), this._feedbackTracker.reset(), this._externalLayerManager.reset(), this._textmodeSourceManager.reset(), this._glslFunctions.clear(), this._mainCode.length = 0, this._currentTarget = "main", this._usesCharSource = !1;
  }
  _compileCharSource(e) {
    this._usesCharSource = !0;
    const n = this._compileChain(e.charSource, "charSrc", "vec4(1.0, 1.0, 1.0, 1.0)", "v_uv", "char"), r = "charFromSource_" + this._varCounter++;
    return this._mainCode.push("	// Convert charSource color to character index"), this._mainCode.push(`	float charLum_${r} = clamp(_luminance(${n.colorVar}.rgb), 0.0, 1.0);`), this._mainCode.push(`	float charCount_${r} = max(u_charSourceCount, 1.0);`), this._mainCode.push(`	int charIdx_${r} = int(min(charLum_${r} * charCount_${r}, charCount_${r} - 1.0));`), this._mainCode.push(`	vec4 ${r} = _packChar(charIdx_${r});`), r;
  }
  _compileChain(e, n, r, o = "v_uv", a = "main") {
    const s = this._currentTarget;
    this._currentTarget = a;
    const c = `${n}_st`;
    let l, f, i, p = `${n}_c`;
    this._mainCode.push(`	vec2 ${c} = ${o};`), this._mainCode.push(`	vec4 ${p} = ${r};`);
    const u = e.transforms, h = u.map((m) => this._getProcessedTransform(m.name)), g = this._identifyCoordTransforms(h), C = (m) => {
      const _ = u[m], b = h[m];
      if (!b) return void console.warn(`[SynthCompiler] Unknown transform: ${_.name}`);
      const F = e.externalLayerRefs.get(m), S = e.textmodeSourceRefs.get(m);
      _.name === "src" ? this._trackSrcUsage(F) : _.name === "srcTexture" && S && this._textmodeSourceManager.trackUsage(S, this._currentTarget);
      const U = this._codeGenerator.getContextAwareGlslFunction(b, _.name, this._currentTarget, F, S, (R) => this._externalLayerManager.getPrefix(R), (R) => this._textmodeSourceManager.getUniformName(R));
      this._glslFunctions.add(U);
      const y = this._processArguments(_.userArgs, b.inputs, `${n}_${m}_${_.name}`), v = e.nestedSources.get(m);
      let W;
      v && re.has(b.type) && (W = this._compileChain(v, `${n}_nested_${m}`, r, c, a).colorVar);
      const I = this._codeGenerator.generateTransformCode(this._mainCode, b, this._varCounter++, c, p, l, f, i, y, this._currentTarget, W, F, S, (R) => this._externalLayerManager.getPrefix(R), (R) => this._textmodeSourceManager.getUniformName(R));
      p = I.colorVar, I.charVar && (l = I.charVar), I.flagsVar && (f = I.flagsVar), I.rotationVar && (i = I.rotationVar);
    };
    for (let m = 0; m < u.length; m++)
      h[m] && u[m].name === "seed" && C(m);
    for (let m = g.length - 1; m >= 0; m--) C(g[m]);
    for (let m = 0; m < u.length; m++) {
      const _ = h[m];
      _ && J.has(_.type) || u[m].name !== "seed" && C(m);
    }
    return this._currentTarget = s, { coordVar: c, colorVar: p, charVar: l, flagsVar: f, rotationVar: i };
  }
  _identifyCoordTransforms(e) {
    const n = [];
    for (let r = 0; r < e.length; r++) {
      const o = e[r];
      o && J.has(o.type) && n.push(r);
    }
    return n;
  }
  _trackSrcUsage(e) {
    e ? this._externalLayerManager.trackUsage(e, this._currentTarget) : this._feedbackTracker.trackUsage(this._currentTarget);
  }
  _getProcessedTransform(e) {
    return O.getProcessed(e);
  }
  _processArguments(e, n, r) {
    const o = [];
    for (let a = 0; a < n.length; a++) {
      const s = n[a], c = e[a] ?? s.default, l = this._uniformManager.processArgument(c, s, r);
      o.push(l.glslValue);
    }
    return o;
  }
}
const E = class E {
  constructor() {
    d(this, "_resolvedIndices");
    d(this, "_lastFont");
    d(this, "_lastChars", "");
  }
  resolve(e, n) {
    if (this._resolvedIndices && this._lastFont === n && this._lastChars === e) return this._resolvedIndices;
    let r = E._fontIndexCache.get(n);
    if (!r) {
      r = /* @__PURE__ */ new Map();
      const f = n.characters;
      for (let i = 0; i < f.length; i++) r.set(f[i], i);
      E._fontIndexCache.set(n, r);
    }
    const o = Array.from(e), a = new Int32Array(o.length), s = n.characterMap, c = s.get(" "), l = c && r.has(c) ? r.get(c) : 0;
    for (let f = 0; f < o.length; f++) {
      const i = o[f], p = s.get(i);
      if (p) {
        const u = r.get(p);
        a[f] = u !== void 0 ? u : l;
      } else a[f] = l;
    }
    return this._resolvedIndices = a, this._lastFont = n, this._lastChars = e, a;
  }
  invalidate() {
    this._resolvedIndices = void 0, this._lastFont = void 0, this._lastChars = "";
  }
};
d(E, "_fontIndexCache", /* @__PURE__ */ new WeakMap());
let H = E;
function fe(t = {}) {
  return { source: t.source ?? new x(), sourceFactory: t.sourceFactory, compiled: t.compiled, shader: t.shader, characterResolver: t.characterResolver ?? new H(), needsCompile: t.needsCompile ?? !1, isCompiling: t.isCompiling ?? !1, pingPongBuffers: t.pingPongBuffers, pingPongDimensions: t.pingPongDimensions, pingPongIndex: t.pingPongIndex ?? 0, externalLayerMap: t.externalLayerMap, bpm: t.bpm, dynamicValues: t.dynamicValues ?? /* @__PURE__ */ new Map(), synthContext: t.synthContext ?? { time: 0, frameCount: 0, width: 0, height: 0, cols: 0, rows: 0, bpm: 0 }, isDisposed: !1 };
}
function mn(t) {
  t.extendLayer("synth", function(e) {
    const n = this.grid !== void 0 && this.drawFramebuffer !== void 0;
    let r, o;
    typeof e == "function" ? (o = e, r = new x()) : r = e;
    let a = this.getPluginState(w);
    a ? (a.source = r, a.sourceFactory = o, a.needsCompile = !0, a.characterResolver.invalidate(), n && !o && (a.compiled = z(r))) : a = fe({ source: r, sourceFactory: o, compiled: n && !o ? z(r) : void 0, needsCompile: !0 }), this.setPluginState(w, a);
  });
}
function hn(t) {
  t.extendLayer("clearSynth", function() {
    var n, r, o, a, s;
    const e = this.getPluginState(w);
    e && ((n = e.shader) != null && n.dispose && e.shader.dispose(), e.pingPongBuffers && ((o = (r = e.pingPongBuffers[0]).dispose) == null || o.call(r), (s = (a = e.pingPongBuffers[1]).dispose) == null || s.call(a)), this.setPluginState(w, void 0));
  });
}
function gn(t) {
  t.extendLayer("bpm", function(e) {
    let n = this.getPluginState(w);
    n ? n.bpm = e : n = fe({ bpm: e }), this.setPluginState(w, n);
  });
}
const V = Symbol.for("textmode.synth.state");
function Y(t) {
  const e = t;
  return e[V] || (e[V] = { bpm: 60, seed: null }), e[V];
}
function yn(t) {
  return Y(t).bpm;
}
function _n(t) {
  return Y(t).seed;
}
function vn(t) {
  t.bpm = function(e) {
    return Y(t).bpm = e, e;
  };
}
function xn(t) {
  t.seed = function(e) {
    return Y(t).seed = e, e;
  };
}
function k(t) {
  const e = /* @__PURE__ */ new Map();
  for (const [, n] of t.externalLayerRefs) {
    const r = typeof n.layer == "function" ? n.layer() : n.layer;
    r && e.set(n.layerId, r);
  }
  for (const [, n] of t.nestedSources) {
    const r = k(n);
    for (const [o, a] of r) e.set(o, a);
  }
  if (t.charSource) {
    const n = k(t.charSource);
    for (const [r, o] of n) e.set(r, o);
  }
  if (t.charColorSource) {
    const n = k(t.charColorSource);
    for (const [r, o] of n) e.set(r, o);
  }
  if (t.cellColorSource) {
    const n = k(t.cellColorSource);
    for (const [r, o] of n) e.set(r, o);
  }
  return e;
}
function A(t) {
  const e = /* @__PURE__ */ new Map();
  for (const [, n] of t.textmodeSourceRefs) {
    const r = typeof n.source == "function" ? n.source() : n.source;
    r && e.set(n.sourceId, r);
  }
  for (const [, n] of t.nestedSources) {
    const r = A(n);
    for (const [o, a] of r) e.set(o, a);
  }
  if (t.charSource) {
    const n = A(t.charSource);
    for (const [r, o] of n) e.set(r, o);
  }
  if (t.charColorSource) {
    const n = A(t.charColorSource);
    for (const [r, o] of n) e.set(r, o);
  }
  if (t.cellColorSource) {
    const n = A(t.cellColorSource);
    for (const [r, o] of n) e.set(r, o);
  }
  return e;
}
const Cn = `#version 300 es
precision highp float;

in vec2 v_uv;

layout(location = 0) out vec4 o_character;
layout(location = 1) out vec4 o_primaryColor;
layout(location = 2) out vec4 o_secondaryColor;

uniform sampler2D u_charTex;
uniform sampler2D u_charColorTex;
uniform sampler2D u_cellColorTex;

void main() {
	o_character = texture(u_charTex, v_uv);
	o_primaryColor = texture(u_charColorTex, v_uv);
	o_secondaryColor = texture(u_cellColorTex, v_uv);
}
`;
class bn {
  constructor() {
    d(this, "_shader", null);
    d(this, "_isCompiling", !1);
    d(this, "_isDisposed", !1);
  }
  async initialize(e) {
    if (!(this._shader || this._isCompiling || this._isDisposed)) {
      this._isCompiling = !0;
      try {
        this._shader = await e.createFilterShader(Cn);
      } catch (n) {
        console.warn("[textmode.synth.js] Failed to compile copy shader:", n);
      } finally {
        this._isCompiling = !1;
      }
    }
  }
  getShader() {
    return this._shader;
  }
  isReady() {
    return this._shader !== null;
  }
  dispose() {
    var e;
    this._isDisposed = !0, (e = this._shader) != null && e.dispose && this._shader.dispose(), this._shader = null, this._isCompiling = !1;
  }
  reset() {
    this._isDisposed = !1;
  }
}
const D = new bn();
async function Sn(t, e) {
  var p;
  const n = t.getPluginState(w);
  if (!n) return;
  const r = t.grid, o = t.drawFramebuffer;
  if (!r || !o) return;
  let a = !1;
  if (n.sourceFactory && n.needsCompile || !n.compiled) {
    let u = n.source, h = !1;
    if (n.sourceFactory) try {
      const g = n.sourceFactory(), C = z(g);
      n.compiled && C.fragmentSource === n.compiled.fragmentSource || (n.source = g, u = g, n.compiled = C, a = !1, h = !0);
    } catch (g) {
      console.warn("[textmode.synth.js] Failed to evaluate synth factory:", g);
    }
    (h || !n.compiled || n.needsCompile) && (n.compiled || (n.compiled = z(u)), n.externalLayerMap = k(u), n.textmodeSourceMap = A(u), a = !0, n.needsCompile = !0);
  }
  if (n.needsCompile && n.compiled && !n.isCompiling) {
    n.isCompiling = !0;
    const u = n.compiled;
    a || (n.externalLayerMap = k(n.source), n.textmodeSourceMap = A(n.source));
    try {
      const h = await e.createFilterShader(u.fragmentSource);
      if (n.isDisposed) return void (h.dispose && h.dispose());
      (p = n.shader) != null && p.dispose && n.shader.dispose(), n.shader = h, n.compiled === u && (n.needsCompile = !1);
    } finally {
      n.isCompiling = !1;
    }
  }
  if (!n.shader || !n.compiled || n.isDisposed) return;
  const s = n.compiled.usesCharColorFeedback, c = n.compiled.usesCharFeedback, l = n.compiled.usesCellColorFeedback, f = s || c || l;
  if (n.pingPongBuffers) {
    const u = n.pingPongDimensions, h = !u || u.cols !== r.cols || u.rows !== r.rows;
    f && !h || (n.pingPongBuffers[0].dispose(), n.pingPongBuffers[1].dispose(), n.pingPongBuffers = void 0, n.pingPongDimensions = void 0);
  }
  f && !n.pingPongBuffers && (n.pingPongBuffers = [e.createFramebuffer({ width: r.cols, height: r.rows, attachments: 3 }), e.createFramebuffer({ width: r.cols, height: r.rows, attachments: 3 })], n.pingPongDimensions = { cols: r.cols, rows: r.rows }, n.pingPongIndex = 0), n.synthContext || (n.synthContext = { time: 0, frameCount: 0, width: 0, height: 0, cols: 0, rows: 0, bpm: 0 });
  const i = n.synthContext;
  i.time = e.secs, i.frameCount = e.frameCount, i.width = r.width, i.height = r.height, i.cols = r.cols, i.rows = r.rows, i.bpm = n.bpm ?? yn(e), i.onError = n.onDynamicError, n.dynamicValues.clear();
  for (const [u, h] of n.compiled.dynamicUpdaters) {
    const g = h(i);
    n.dynamicValues.set(u, g);
  }
  if (f && n.pingPongBuffers) {
    const u = n.pingPongBuffers[n.pingPongIndex], h = n.pingPongBuffers[1 - n.pingPongIndex];
    h.begin(), e.clear(), e.shader(n.shader), X(t, e, n, i, u), e.rect(r.cols, r.rows), h.end(), o.begin(), e.clear();
    const g = D.getShader();
    g ? (e.shader(g), e.setUniform("u_charTex", h.textures[0]), e.setUniform("u_charColorTex", h.textures[1]), e.setUniform("u_cellColorTex", h.textures[2])) : (e.shader(n.shader), X(t, e, n, i, u)), e.rect(r.cols, r.rows), o.end(), n.pingPongIndex = 1 - n.pingPongIndex;
  } else o.begin(), e.clear(), e.shader(n.shader), X(t, e, n, i, null), e.rect(r.cols, r.rows), o.end();
  e.resetShader();
}
function X(t, e, n, r, o) {
  e.setUniform("time", r.time), e.setUniform("u_resolution", [r.cols, r.rows]);
  const a = _n(e);
  e.setUniform("u_seed", a ?? 0);
  for (const [i, p] of n.dynamicValues) e.setUniform(i, p);
  const s = n.compiled, c = n.staticUniformsAppliedTo !== n.shader;
  if (c) {
    for (const [i, p] of s.uniforms) p.isDynamic || typeof p.value == "function" || e.setUniform(i, p.value);
    n.staticUniformsAppliedTo = n.shader;
  }
  if (s.charMapping) {
    const i = n.characterResolver.resolve(s.charMapping.chars, t.font);
    (c || i !== n.lastCharMapIndices) && (e.setUniform("u_charMap", i), e.setUniform("u_charMapSize", i.length), n.lastCharMapIndices = i);
  }
  if (s.usesCharSource) {
    const i = s.charMapping ? s.charMapping.chars.length : t.font.characters.length;
    e.setUniform("u_charSourceCount", i);
  }
  o && (s.usesCharColorFeedback && e.setUniform(M.charColor, o.textures[1]), s.usesCharFeedback && e.setUniform(M.char, o.textures[0]), s.usesCellColorFeedback && e.setUniform(M.cellColor, o.textures[2]));
  const l = s.externalLayers;
  if (l && l.size > 0 && n.externalLayerMap) for (const [i, p] of l) {
    const u = n.externalLayerMap.get(i);
    if (!u) {
      console.warn(`[textmode.synth.js] External layer not found: ${i}`);
      continue;
    }
    const h = u.getPluginState(w);
    let g;
    h != null && h.pingPongBuffers ? g = h.pingPongBuffers[h.pingPongIndex].textures : u.drawFramebuffer && (g = u.drawFramebuffer.textures), g && (p.usesChar && e.setUniform(`${p.uniformPrefix}${P.char}`, g[0]), p.usesCharColor && e.setUniform(`${p.uniformPrefix}${P.charColor}`, g[1]), p.usesCellColor && e.setUniform(`${p.uniformPrefix}${P.cellColor}`, g[2]));
  }
  const f = s.textmodeSources;
  if (f && f.size > 0 && n.textmodeSourceMap) for (const [i, p] of f) {
    const u = n.textmodeSourceMap.get(i);
    if (!u) {
      console.warn(`[textmode.synth.js] TextmodeSource not found: ${i}`);
      continue;
    }
    u.update && u.update();
    const h = u.width ?? 1, g = u.height ?? 1, C = h > 0 ? h : 1, m = g > 0 ? g : 1;
    e.setUniform(`${p.uniformName}_dim`, [C, m]), u.texture ? e.setUniform(p.uniformName, u.texture) : console.warn(`[textmode.synth.js] TextmodeSource texture not loaded: ${i}`);
  }
}
function wn(t) {
  var n, r, o, a, s;
  const e = t.getPluginState(w);
  e && (e.isDisposed = !0, (n = e.shader) != null && n.dispose && e.shader.dispose(), e.pingPongBuffers && ((o = (r = e.pingPongBuffers[0]).dispose) == null || o.call(r), (s = (a = e.pingPongBuffers[1]).dispose) == null || s.call(a)));
}
const $n = { name: w, version: "1.5.1", install(t, e) {
  D.reset(), vn(t), xn(t), mn(e), gn(e), hn(e), e.registerPreSetupHook(async () => {
    await D.initialize(t);
  }), e.registerLayerPreRenderHook((n) => Sn(n, t)), e.registerLayerDisposedHook(wn);
}, uninstall(t, e) {
  var r, o, a, s, c;
  const n = [e.layerManager.base, ...e.layerManager.all];
  for (const l of n) {
    const f = l.getPluginState(w);
    f && (f.isDisposed = !0, (r = f.shader) != null && r.dispose && f.shader.dispose(), f.pingPongBuffers && ((a = (o = f.pingPongBuffers[0]).dispose) == null || a.call(o), (c = (s = f.pingPongBuffers[1]).dispose) == null || c.call(s)), l.setPluginState(w, void 0));
  }
  delete t.bpm, delete t.seed, e.removeLayerExtension("synth"), e.removeLayerExtension("bpm"), e.removeLayerExtension("clearSynth"), D.dispose();
} };
function Mn(t, e, n, r) {
  return new x({ cellColorSource: Q(t, e, n, r) });
}
const Tn = (t) => new x({ charSource: t });
function Fn(t, e, n, r) {
  return new x({ charColorSource: Q(t, e, n, r) });
}
function In(t) {
  return $.gradient(t ?? null);
}
function Rn(t, e) {
  return $.noise(t ?? null, e ?? null);
}
function Pn(t, e, n, r) {
  return $.plasma(t ?? null, e ?? null, n ?? null, r ?? null);
}
function kn(t, e, n, r, o, a) {
  return $.moire(t ?? null, e ?? null, n ?? null, r ?? null, o ?? null, a ?? null);
}
function An(t, e, n) {
  return $.osc(t ?? null, e ?? null, n ?? null);
}
function Ln(t, e, n, r) {
  const o = Q(t, e, n, r);
  return new x({ charColorSource: o, cellColorSource: o });
}
function Un(t, e, n) {
  return $.shape(t ?? null, e ?? null, n ?? null);
}
function de(t, e, n, r) {
  return t !== void 0 && e === void 0 && n === void 0 && r === void 0 && typeof t == "number" ? $.solid(t) : $.solid(t ?? null, e ?? null, n ?? null, r ?? null);
}
const On = (t) => {
  const e = $.src;
  if (!t) return e();
  const n = new x();
  if (typeof t == "function") {
    const r = t();
    if (r && Nn(r)) {
      const o = r.id ?? `layer_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      n.addExternalLayerRef({ layerId: o, layer: t });
    } else {
      const o = `tms_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      n.addTextmodeSourceRef({ sourceId: o, source: t });
    }
  } else if (En(t)) {
    const r = `tms_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    n.addTextmodeSourceRef({ sourceId: r, source: t });
  } else {
    const r = t, o = r.id ?? `layer_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    n.addExternalLayerRef({ layerId: o, layer: r });
  }
  return n;
};
function En(t) {
  return t !== null && typeof t == "object" && "texture" in t && "originalWidth" in t && "originalHeight" in t;
}
function Nn(t) {
  return t !== null && typeof t == "object" && "grid" in t && "drawFramebuffer" in t;
}
function Dn(t, e, n) {
  return $.voronoi(t ?? null, e ?? null, n ?? null);
}
function Q(t, e, n, r) {
  return t instanceof x ? t : de(t, e, n, r);
}
typeof window < "u" && (window.SynthPlugin = $n, window.SynthSource = x, window.cellColor = Mn, window.char = Tn, window.charColor = Fn, window.gradient = In, window.moire = kn, window.noise = Rn, window.osc = An, window.paint = Ln, window.plasma = Pn, window.shape = Un, window.solid = de, window.src = On, window.voronoi = Dn, window.setGlobalErrorCallback = an);
export {
  q as EASING_FUNCTIONS,
  $n as SynthPlugin,
  x as SynthSource,
  Mn as cellColor,
  Tn as char,
  Fn as charColor,
  In as gradient,
  kn as moire,
  Rn as noise,
  An as osc,
  Ln as paint,
  Pn as plasma,
  an as setGlobalErrorCallback,
  Un as shape,
  de as solid,
  On as src,
  Dn as voronoi
};
