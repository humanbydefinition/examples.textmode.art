var Pi = Object.defineProperty;
var Mi = (r, t, e) => t in r ? Pi(r, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : r[t] = e;
var g = (r, t, e) => Mi(r, typeof t != "symbol" ? t + "" : t, e);
class Fe {
  $extractFramebufferData(t) {
    return { characterPixels: t.readPixels(0), primaryColorPixels: t.readPixels(1), secondaryColorPixels: t.readPixels(2) };
  }
  $getEncodedCharacterValue(t, e) {
    return t[e] + (t[e + 1] << 8);
  }
  $getCharacterIndex(t, e) {
    return this.$getEncodedCharacterValue(t, e);
  }
  $extractCellTransform(t, e) {
    const i = t[e + 2], a = t[e + 3] / 255;
    return { isInverted: !!(1 & i), flipHorizontal: !!(2 & i), flipVertical: !!(4 & i), rotation: Math.round(360 * a * 100) / 100 };
  }
}
class At {
  $downloadFile(t, e) {
    try {
      const i = this._sanitizeFilename(e), a = URL.createObjectURL(t), o = document.createElement("a");
      o.href = a, o.download = i, o.style.display = "none", o.rel = "noopener", document.body.appendChild(o), o.click(), document.body.removeChild(o), URL.revokeObjectURL(a);
    } catch (i) {
      console.error("[textmode-export] Failed to download file:", i);
    }
  }
  _sanitizeFilename(t) {
    if (!t) return this._generateDefaultFilename();
    const e = t.trim();
    return e ? e.replace(/[<>:"/\\|?*]/g, "_").replace(/\s+/g, "_").replace(/_{2,}/g, "_").replace(/^_+|_+$/g, "").substring(0, 255) || this._generateDefaultFilename() : this._generateDefaultFilename();
  }
  _generateDefaultFilename() {
    return `textmode-export-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace(/:/g, "-")}`;
  }
}
const Qe = /* @__PURE__ */ new WeakMap();
function Fi(r) {
  return Math.round(255 * r[0]) + (Math.round(255 * r[1]) << 8);
}
function De(r, t) {
  let e = Qe.get(r);
  if (!e) {
    e = /* @__PURE__ */ new Map();
    for (const i of r.characters) e.set(Fi(i.color), i);
    Qe.set(r, e);
  }
  return e.get(t);
}
function Wr(r, t) {
  const e = r === "base" ? "Base layer" : `Layer ${Number.parseInt(r.replace("layer-", ""), 10)}`;
  return t._visible === !1 ? `${e} (hidden)` : e;
}
function Ye(r) {
  return [{ id: "base", layer: r.layers.base }, ...r.layers.all.map((t, e) => ({ id: `layer-${e + 1}`, layer: t }))].map(({ id: t, layer: e }) => ({ id: t, label: Wr(t, e), layer: e }));
}
function Di(r) {
  return { getOptions: () => Ye(r), getLayerById: (t) => {
    var e;
    return (e = Ye(r).find((i) => i.id === t)) == null ? void 0 : e.layer;
  }, getDefaultId: () => "base" };
}
function Ri(r, t) {
  if (t === r.layers.base) return "base";
  const e = r.layers.all.indexOf(t);
  if (e >= 0) return `layer-${e + 1}`;
  throw new Error("[textmode-export] Cannot export a layer that is not managed by this Textmodifier instance.");
}
function oe(r, t) {
  const e = t ?? r.layers.base, i = Ri(r, e), a = e.grid, o = e.font, s = e.drawFramebuffer;
  if (!a || !s) throw new Error("[textmode-export] Cannot export an uninitialized layer.");
  return { id: i, label: Wr(i, e), layer: e, grid: a, font: o, drawFramebuffer: s };
}
function Li(r) {
  return [r.layers.base, ...r.layers.all].map((t) => {
    const e = t;
    return { ...oe(r, t), visible: e._visible ?? !0, opacity: e._opacity ?? 1, blendMode: e._blendMode ?? "normal", offsetX: e._offsetX ?? 0, offsetY: e._offsetY ?? 0, rotationZ: e._rotation ?? 0 };
  });
}
function Zt(r, t) {
  return { r: r[t], g: r[t + 1], b: r[t + 2], a: r[t + 3] };
}
class Vi extends Fe {
  _calculateCellPosition(t, e, i) {
    return { x: t, y: e, cellX: t * i.cellWidth, cellY: e * i.cellHeight };
  }
  $extractSVGCellData(t, e) {
    const i = [];
    let a = 0;
    for (let o = 0; o < e.rows; o++) for (let s = 0; s < e.cols; s++) {
      const n = 4 * a, d = this.$getEncodedCharacterValue(t.characterPixels, n);
      let l = Zt(t.primaryColorPixels, n), c = Zt(t.secondaryColorPixels, n);
      const h = this.$extractCellTransform(t.characterPixels, n);
      if (h.isInverted) {
        const m = l;
        l = c, c = m;
      }
      const u = this._calculateCellPosition(s, o, e);
      i.push({ encodedGlyphSlot: d, primaryColor: l, secondaryColor: c, transform: h, position: u }), a++;
    }
    return i;
  }
}
class Oi {
  _createGlyphPath(t, e, i, a, o) {
    const s = o / t.head.unitsPerEm;
    return { getBoundingBox: () => ({ x1: i + e.xMin * s, y1: a + -e.yMax * s, x2: i + e.xMax * s, y2: a + -e.yMin * s }), toSVG: () => this._glyphToSVGPath(e, i, a, s) };
  }
  _glyphToSVGPath(t, e, i, a) {
    if (!t || !t.xs) return "";
    const { xs: o, ys: s, endPts: n, flags: d } = t;
    if (!(o && s && n && d)) return "";
    let l = "", c = 0;
    for (let h = 0; h < n.length; h++) {
      const u = n[h];
      if (!(u < c)) {
        if (u >= c) {
          const m = e + o[c] * a, w = i - s[c] * a;
          l += `M${m.toFixed(2)},${w.toFixed(2)}`;
          let p = c + 1;
          for (; p <= u; )
            if (1 & d[p]) {
              const v = e + o[p] * a, _ = i - s[p] * a;
              l += `L${v.toFixed(2)},${_.toFixed(2)}`, p++;
            } else {
              const v = e + o[p] * a, _ = i - s[p] * a, T = p + 1 > u ? c : p + 1;
              if (1 & d[T]) {
                const k = e + o[T] * a, A = i - s[T] * a;
                l += `Q${v.toFixed(2)},${_.toFixed(2)} ${k.toFixed(2)},${A.toFixed(2)}`, p = T + 1;
              } else {
                const k = (v + (e + o[T] * a)) / 2, A = (_ + (i - s[T] * a)) / 2;
                l += `Q${v.toFixed(2)},${_.toFixed(2)} ${k.toFixed(2)},${A.toFixed(2)}`, p = T;
              }
            }
          l += "Z";
        }
        c = u + 1;
      }
    }
    return l;
  }
  $generatePositionedCharacterPath(t, e, i, a, o, s, n, d) {
    if (!d) return null;
    const l = e.font, c = n / l.head.unitsPerEm, h = i + (o - d.advanceWidth * c) / 2, u = a + l.hhea.ascender * c;
    return this._createGlyphPath(l, d, h, u, n).toSVG() || null;
  }
}
class Ni {
  constructor() {
    g(this, "_pathGenerator");
    this._pathGenerator = new Oi();
  }
  $generateSVGHeader(t) {
    const { width: e, height: i } = t;
    return `<?xml version="1.0" encoding="UTF-8"?><svg width="${e}" height="${i}" viewBox="0 0 ${e} ${i}" xmlns="http://www.w3.org/2000/svg"><title>textmode.js sketch</title>`;
  }
  $generateSVGFooter() {
    return "</g></svg>";
  }
  _generateTransformAttribute(t, e) {
    const { transform: i, position: a } = t;
    if (!i.flipHorizontal && !i.flipVertical && !i.rotation) return "";
    const o = a.cellX + e.cellWidth / 2, s = a.cellY + e.cellHeight / 2, n = [];
    if (i.flipHorizontal || i.flipVertical) {
      const d = i.flipHorizontal ? -1 : 1, l = i.flipVertical ? -1 : 1;
      n.push(`translate(${o} ${s})scale(${d} ${l})translate(${-o} ${-s})`);
    }
    return i.rotation && n.push(`rotate(${i.rotation} ${o} ${s})`), ` transform="${n.join(" ")}"`;
  }
  _generateCellBackground(t, e, i) {
    if (!i.includeBackgroundRectangles || t.secondaryColor.a === 0) return "";
    const { position: a } = t, { r: o, g: s, b: n, a: d } = t.secondaryColor, l = `rgba(${o},${s},${n},${d / 255})`;
    return i.drawMode === "stroke" ? `<rect x="${a.cellX}" y="${a.cellY}" width="${e.cellWidth}" height="${e.cellHeight}" stroke="${l}" fill="none" stroke-width="${i.strokeWidth}"/>` : `<rect x="${a.cellX}" y="${a.cellY}" width="${e.cellWidth}" height="${e.cellHeight}" fill="${l}"/>`;
  }
  _generateCharacterPath(t, e, i, a) {
    const o = De(i, t.encodedGlyphSlot);
    if (!o) return "";
    const s = this._pathGenerator.$generatePositionedCharacterPath(o.character, i, t.position.cellX, t.position.cellY, e.cellWidth, e.cellHeight, i.fontSize, o.glyphData);
    if (!s) return "";
    const { r: n, g: d, b: l, a: c } = t.primaryColor, h = `rgba(${n},${d},${l},${c / 255})`;
    return a.drawMode === "stroke" ? `<path d="${s}" stroke="${h}" stroke-width="${a.strokeWidth}" fill="none"/>` : `<path d="${s}" fill="${h}"/>`;
  }
  $generateCellContent(t, e, i, a) {
    const o = [], s = this._generateCellBackground(t, e, a);
    s && o.push(s);
    const n = this._generateCharacterPath(t, e, i, a);
    if (n) {
      const d = this._generateTransformAttribute(t, e);
      o.push(d ? `<g${d}>${n}</g>` : n);
    }
    return o.join("");
  }
  $generateSVGContent(t, e, i, a) {
    const o = [this.$generateSVGHeader(e), '<g id="ascii-cells">'];
    for (const s of t) o.push(this.$generateCellContent(s, e, i, a));
    return o.push(this.$generateSVGFooter()), o.join("");
  }
  $optimizeSVGContent(t) {
    return t.replace(/\s+/g, " ").replace(/> </g, "><");
  }
}
class Ke {
  _applyDefaultOptions(t) {
    return { includeBackgroundRectangles: t.includeBackgroundRectangles ?? !0, drawMode: t.drawMode ?? "fill", strokeWidth: t.strokeWidth ?? 1, filename: t.filename, layer: t.layer };
  }
  $generateSVG(t, e = {}) {
    const i = new Vi(), a = new Ni(), o = this._applyDefaultOptions(e), s = oe(t, o.layer), n = i.$extractSVGCellData(i.$extractFramebufferData(s.drawFramebuffer), s.grid), d = a.$generateSVGContent(n, s.grid, s.font, o);
    return a.$optimizeSVGContent(d);
  }
  $saveSVG(t, e = {}) {
    new At().$downloadFile(new Blob([this.$generateSVG(t, e)], { type: "image/svg+xml;charset=utf-8" }), e.filename);
  }
}
const he = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" }, ue = { png: ".png", jpg: ".jpg", webp: ".webp" };
class Je {
  _applyDefaultOptions(t) {
    return { format: t.format ?? "png", scale: Math.abs(t.scale ?? 1), filename: t.filename };
  }
  _validateOptions(t) {
    if (!(t.format in he)) throw new Error(`Saving '${t.format}' files is not supported`);
  }
  async $generateImageBlob(t, e) {
    const i = t, a = document.createElement("canvas"), o = a.getContext("2d"), s = Math.round(i.width * e.scale), n = Math.round(i.height * e.scale);
    return a.width = s, a.height = n, o.imageSmoothingEnabled = !1, o.clearRect(0, 0, s, n), o.drawImage(i, 0, 0, i.width, i.height, 0, 0, s, n), await new Promise((d, l) => {
      a.toBlob((c) => {
        c ? d(c) : l(new Error(`Failed to generate ${e.format.toUpperCase()} blob`));
      }, he[e.format]);
    });
  }
  async $saveImage(t, e = {}) {
    const i = this._applyDefaultOptions(e);
    this._validateOptions(i);
    const a = await this.$generateImageBlob(t, i);
    new At().$downloadFile(a, i.filename);
  }
  async $copyImageToClipboard(t, e = {}) {
    if (typeof navigator > "u" || !navigator.clipboard || typeof navigator.clipboard.write != "function") throw new Error("Clipboard API is not available in this environment");
    const i = this._applyDefaultOptions(e);
    this._validateOptions(i);
    const a = await this.$generateImageBlob(t, i), o = new ClipboardItem({ [he[i.format]]: a });
    await navigator.clipboard.write([o]);
  }
}
class Ze {
  _applyDefaultOptions(t) {
    return { preserveTrailingSpaces: t.preserveTrailingSpaces ?? !1, emptyCharacter: t.emptyCharacter ?? " ", filename: t.filename, layer: t.layer };
  }
  _createTXTContent(t, e) {
    var d;
    const i = new Fe(), a = oe(t, e.layer), o = i.$extractFramebufferData(a.drawFramebuffer), s = [];
    let n = 0;
    for (let l = 0; l < a.grid.rows; l++) {
      let c = "";
      for (let h = 0; h < a.grid.cols; h++) {
        const u = 4 * n, m = i.$getEncodedCharacterValue(o.characterPixels, u);
        c += ((d = De(a.font, m)) == null ? void 0 : d.character) || e.emptyCharacter, n++;
      }
      e.preserveTrailingSpaces || (c = c.trimEnd()), s.push(c);
    }
    return s.join(`
`);
  }
  $generateTXT(t, e = {}) {
    return this._createTXTContent(t, this._applyDefaultOptions(e));
  }
  $saveTXT(t, e = {}) {
    const i = this._applyDefaultOptions(e), a = this._createTXTContent(t, i), o = new Blob([a], { type: "text/plain;charset=utf-8" });
    new At().$downloadFile(o, i.filename);
  }
}
class Wi {
  constructor() {
    g(this, "_canvas");
    g(this, "_ctx");
  }
  async $record(t, e, i, a) {
    const o = Math.max(1, Math.round(e.frameRate)), s = Math.round(1e3 / o), n = Math.max(1, Math.round(e.frameCount));
    return await new Promise((d, l) => {
      const c = [];
      let h, u = 0, m = !1;
      const w = () => {
        h && (h(), h = void 0);
      }, p = (_) => {
        m || (m = !0, w(), d(_));
      }, v = () => {
        if (u >= n) p(c);
        else try {
          const _ = e.scale, T = Math.max(1, Math.round(t.width * _)), k = Math.max(1, Math.round(t.height * _));
          this._canvas || (this._canvas = document.createElement("canvas")), this._canvas.width === T && this._canvas.height === k || (this._canvas.width = T, this._canvas.height = k), this._ctx || (this._ctx = this._canvas.getContext("2d"));
          const A = this._ctx;
          A.imageSmoothingEnabled = !1, A.clearRect(0, 0, T, k), A.drawImage(t, 0, 0, t.width, t.height, 0, 0, T, k);
          const M = { imageData: A.getImageData(0, 0, T, k), width: T, height: k, delayMs: s };
          c.push(M), u += 1, a == null || a({ state: "recording", frameIndex: u, totalFrames: n }), u >= n && p(c);
        } catch (_) {
          ((T) => {
            if (m) return;
            m = !0, w();
            const k = T instanceof Error ? T.message : "GIF recording failed";
            a == null || a({ state: "error", message: k }), l(T instanceof Error ? T : new Error(String(T)));
          })(_);
        }
      };
      h = i(() => {
        v();
      }), a == null || a({ state: "recording", frameIndex: 0, totalFrames: n });
    });
  }
}
var Ur = Object.defineProperty, Ui = (r) => Ur(r, "__esModule", { value: !0 }), $i = (r, t) => () => (t || r((t = { exports: {} }).exports, t), t.exports), zi = (r, t) => {
  for (var e in t) Ur(r, e, { get: t[e], enumerable: !0 });
}, Hi = $i((r) => {
  function t(h, u, m) {
    return 0.29889531 * h + 0.58662247 * u + 0.11448223 * m;
  }
  function e(h, u, m) {
    return 0.59597799 * h - 0.2741761 * u - 0.32180189 * m;
  }
  function i(h, u, m) {
    return 0.21147017 * h - 0.52261711 * u + 0.31114694 * m;
  }
  function a(h, u) {
    let m = h[0] - u[0], w = h[1] - u[1], p = h[2] - u[2], v = o(h) - o(u);
    return m * m * 0.5053 + w * w * 0.299 + p * p * 0.1957 + v * v;
  }
  function o(h) {
    return h[3] != null ? h[3] : 255;
  }
  function s(h, u) {
    return Math.sqrt(a(h, u));
  }
  function n(h, u) {
    let [m, w, p] = h, [v, _, T] = u, k = t(m, w, p) - t(v, _, T), A = e(m, w, p) - e(v, _, T), M = i(m, w, p) - i(v, _, T), B = o(h) - o(u);
    return k * k * 0.5053 + A * A * 0.299 + M * M * 0.1957 + B * B;
  }
  function d(h, u) {
    return Math.sqrt(n(h, u));
  }
  function l(h, u) {
    var m, w = 0;
    for (m = 0; m < h.length; m++) {
      let p = h[m] - u[m];
      w += p * p;
    }
    return w;
  }
  function c(h, u) {
    return Math.sqrt(l(h, u));
  }
  Ui(r), zi(r, { colorDifferenceRGBToYIQ: () => d, colorDifferenceRGBToYIQSquared: () => n, colorDifferenceYIQ: () => s, colorDifferenceYIQSquared: () => a, euclideanDistance: () => c, euclideanDistanceSquared: () => l });
}), ji = { trailer: 59 };
function $r(r = 256) {
  let t = 0, e = new Uint8Array(r);
  return { get buffer() {
    return e.buffer;
  }, reset() {
    t = 0;
  }, bytesView: () => e.subarray(0, t), bytes: () => e.slice(0, t), writeByte(a) {
    i(t + 1), e[t] = a, t++;
  }, writeBytes(a, o = 0, s = a.length) {
    i(t + s);
    for (let n = 0; n < s; n++) e[t++] = a[n + o];
  }, writeBytesView(a, o = 0, s = a.byteLength) {
    i(t + s), e.set(a.subarray(o, o + s), t), t += s;
  } };
  function i(a) {
    var o = e.length;
    if (o >= a) return;
    a = Math.max(a, o * (o < 1048576 ? 2 : 1.125) >>> 0), o != 0 && (a = Math.max(a, 256));
    let s = e;
    e = new Uint8Array(a), t > 0 && e.set(s.subarray(0, t), 0);
  }
}
var Gt = 12, tr = 5003, Gi = [0, 1, 3, 7, 15, 31, 63, 127, 255, 511, 1023, 2047, 4095, 8191, 16383, 32767, 65535];
function qi(r, t, e, i, a, o, s, n) {
  a = a || $r(512), o = o || new Uint8Array(256), s = s || new Int32Array(tr), n = n || new Int32Array(tr);
  let d = s.length, l = Math.max(2, i);
  o.fill(0), n.fill(0), F();
  let c = 0, h = 0, u = l + 1, m = u, w = !1, p = m, v = R(p), _ = 1 << u - 1, T = _ + 1, k = _ + 2, A = 0, M = e[0], B = 0;
  for (let D = d; D < 65536; D *= 2) ++B;
  B = 8 - B, a.writeByte(l), $(_);
  for (let D = 1; D < e.length; D++) V(e[D]);
  return $(M), $(T), a.writeByte(0), a.bytesView();
  function P(D) {
    o[A++] = D, A >= 254 && N();
  }
  function F() {
    s.fill(-1);
  }
  function V(D) {
    let nt = (D << Gt) + M, z = D << B ^ M;
    if (s[z] === nt) M = n[z];
    else {
      if (s[z] >= 0) {
        let X = z === 0 ? 1 : d - z;
        do
          if (z -= X, z < 0 && (z += d), s[z] === nt) return void (M = n[z]);
        while (s[z] >= 0);
      }
      $(M), M = D, k < 1 << Gt ? (n[z] = k++, s[z] = nt) : (F(), k = _ + 2, w = !0, $(_));
    }
  }
  function N() {
    A > 0 && (a.writeByte(A), a.writeBytesView(o, 0, A), A = 0);
  }
  function R(D) {
    return (1 << D) - 1;
  }
  function $(D) {
    for (c &= Gi[h], h > 0 ? c |= D << h : c = D, h += p; h >= 8; ) P(255 & c), c >>= 8, h -= 8;
    if ((k > v || w) && (w ? (p = m, v = R(p), w = !1) : (++p, v = p == Gt ? 1 << Gt : R(p))), D == T) {
      for (; h > 0; ) P(255 & c), c >>= 8, h -= 8;
      N();
    }
  }
}
var Xi = qi;
function zr(r, t, e) {
  return r << 8 & 63488 | t << 2 & 992 | e >> 3 & 31;
}
function Hr(r, t, e, i) {
  return r >> 4 | 240 & t | (240 & e) << 4 | (240 & i) << 8;
}
function jr(r, t, e) {
  return r >> 4 << 8 | t >> 4 << 4 | e >> 4;
}
function qt(r, t, e) {
  return r < t ? t : r > e ? e : r;
}
function Kt(r) {
  return r * r;
}
function er(r, t, e) {
  for (var i = 0, a = 1e100, o = r[t], s = o.cnt, n = (o.ac, o.rc), d = o.gc, l = o.bc, c = o.fw; c != 0; c = r[c].fw) {
    var h = r[c].cnt, u = s * h / (s + h);
    if (!(u >= a)) {
      var m = 0;
      !((m += u * Kt(r[c].rc - n)) >= a) && !((m += u * Kt(r[c].gc - d)) >= a) && !((m += u * Kt(r[c].bc - l)) >= a) && (a = m, i = c);
    }
  }
  o.err = a, o.nn = i;
}
function me() {
  return { ac: 0, rc: 0, gc: 0, bc: 0, cnt: 0, nn: 0, fw: 0, bk: 0, tm: 0, mtm: 0, err: 0 };
}
function Qi(r, t) {
  let e = new Array(t === "rgb444" ? 4096 : 65536), i = r.length;
  if (t === "rgba4444") for (let a = 0; a < i; ++a) {
    let o = r[a], s = o >> 24 & 255, n = o >> 16 & 255, d = o >> 8 & 255, l = 255 & o, c = Hr(l, d, n, s), h = c in e ? e[c] : e[c] = me();
    h.rc += l, h.gc += d, h.bc += n, h.ac += s, h.cnt++;
  }
  else if (t === "rgb444") for (let a = 0; a < i; ++a) {
    let o = r[a], s = o >> 16 & 255, n = o >> 8 & 255, d = 255 & o, l = jr(d, n, s), c = l in e ? e[l] : e[l] = me();
    c.rc += d, c.gc += n, c.bc += s, c.cnt++;
  }
  else for (let a = 0; a < i; ++a) {
    let o = r[a], s = o >> 16 & 255, n = o >> 8 & 255, d = 255 & o, l = zr(d, n, s), c = l in e ? e[l] : e[l] = me();
    c.rc += d, c.gc += n, c.bc += s, c.cnt++;
  }
  return e;
}
function Yi(r, t, e) {
  let { format: i = "rgb565", clearAlpha: a = !0, clearAlphaColor: o = 0, clearAlphaThreshold: s = 0, oneBitAlpha: n = !1 } = e || {}, d = e.useSqrt !== !1, l = i === "rgba4444", c = Qi(r, i), h = c.length, u = h - 1, m = new Uint32Array(h + 1);
  for (var w = 0, p = 0; p < c.length; ++p) {
    let D = c[p];
    if (D != null) {
      var v = 1 / D.cnt;
      l && (D.ac *= v), D.rc *= v, D.gc *= v, D.bc *= v, c[w++] = D;
    }
  }
  for (Kt(t) / w < 0.022 && (d = !1), p = 0; p < w - 1; ++p) c[p].fw = p + 1, c[p + 1].bk = p, d && (c[p].cnt = Math.sqrt(c[p].cnt));
  var _, T, k;
  for (d && (c[p].cnt = Math.sqrt(c[p].cnt)), p = 0; p < w; ++p) {
    er(c, p);
    var A = c[p].err;
    for (T = ++m[0]; T > 1 && !(c[_ = m[k = T >> 1]].err <= A); T = k) m[T] = _;
    m[T] = p;
  }
  var M = w - t;
  for (p = 0; p < M; ) {
    for (var B; ; ) {
      var P = m[1];
      if ((B = c[P]).tm >= B.mtm && c[B.nn].mtm <= B.tm) break;
      for (B.mtm == u ? P = m[1] = m[m[0]--] : (er(c, P), B.tm = p), A = c[P].err, T = 1; (k = T + T) <= m[0] && (k < m[0] && c[m[k]].err > c[m[k + 1]].err && k++, !(A <= c[_ = m[k]].err)); T = k) m[T] = _;
      m[T] = P;
    }
    var F = c[B.nn], V = B.cnt, N = F.cnt;
    v = 1 / (V + N), l && (B.ac = v * (V * B.ac + N * F.ac)), B.rc = v * (V * B.rc + N * F.rc), B.gc = v * (V * B.gc + N * F.gc), B.bc = v * (V * B.bc + N * F.bc), B.cnt += F.cnt, B.mtm = ++p, c[F.bk].fw = F.fw, c[F.fw].bk = F.bk, F.mtm = u;
  }
  let R = [];
  var $ = 0;
  for (p = 0; ; ++$) {
    let D = qt(Math.round(c[p].rc), 0, 255), nt = qt(Math.round(c[p].gc), 0, 255), z = qt(Math.round(c[p].bc), 0, 255), X = 255;
    l && (X = qt(Math.round(c[p].ac), 0, 255), n && (X = X <= (typeof n == "number" ? n : 127) ? 0 : 255), a && X <= s && (D = nt = z = o, X = 0));
    let Mt = l ? [D, nt, z, X] : [D, nt, z];
    if (Ki(R, Mt) || R.push(Mt), (p = c[p].fw) == 0) break;
  }
  return R;
}
function Ki(r, t) {
  for (let e = 0; e < r.length; e++) {
    let i = r[e], a = i[0] === t[0] && i[1] === t[1] && i[2] === t[2], o = !(i.length >= 4 && t.length >= 4) || i[3] === t[3];
    if (a && o) return !0;
  }
  return !1;
}
function Ji(r, t, e) {
  let i = (e = e || "rgb565") === "rgb444" ? 4096 : 65536, a = new Uint8Array(r.length), o = new Array(i);
  if (e === "rgba4444") for (let s = 0; s < r.length; s++) {
    let n, d = r[s], l = d >> 24 & 255, c = d >> 16 & 255, h = d >> 8 & 255, u = 255 & d, m = Hr(u, h, c, l);
    o[m] != null ? n = o[m] : (n = Zi(u, h, c, l, t), o[m] = n), a[s] = n;
  }
  else for (let s = 0; s < r.length; s++) {
    let n, d = r[s], l = d >> 16 & 255, c = d >> 8 & 255, h = 255 & d, u = e === "rgb444" ? jr(h, c, l) : zr(h, c, l);
    o[u] != null ? n = o[u] : (n = ta(h, c, l, t), o[u] = n), a[s] = n;
  }
  return a;
}
function Zi(r, t, e, i, a) {
  let o = 0, s = 1e100;
  for (let n = 0; n < a.length; n++) {
    let d = a[n], l = d[0], c = d[1], h = d[2], u = xt(d[3] - i);
    u > s || (u += xt(l - r), !(u > s) && (u += xt(c - t), !(u > s) && (u += xt(h - e), !(u > s) && (s = u, o = n))));
  }
  return o;
}
function ta(r, t, e, i) {
  let a = 0, o = 1e100;
  for (let s = 0; s < i.length; s++) {
    let n = i[s], d = n[0], l = n[1], c = n[2], h = xt(d - r);
    h > o || (h += xt(l - t), !(h > o) && (h += xt(c - e), !(h > o) && (o = h, a = s)));
  }
  return a;
}
function xt(r) {
  return r * r;
}
function ea(r = {}) {
  let { initialCapacity: t = 4096, auto: e = !0 } = r, i = $r(t), a = new Uint8Array(256), o = new Int32Array(5003), s = new Int32Array(5003), n = !1;
  return { reset() {
    i.reset(), n = !1;
  }, finish() {
    i.writeByte(ji.trailer);
  }, bytes: () => i.bytes(), bytesView: () => i.bytesView(), get buffer() {
    return i.buffer;
  }, get stream() {
    return i;
  }, writeHeader: d, writeFrame(l, c, h, u = {}) {
    let { transparent: m = !1, transparentIndex: w = 0, delay: p = 0, palette: v = null, repeat: _ = 0, colorDepth: T = 8, dispose: k = -1 } = u, A = !1;
    if (e ? n || (A = !0, d(), n = !0) : A = !!u.first, c = Math.max(0, Math.floor(c)), h = Math.max(0, Math.floor(h)), A) {
      if (!v) throw new Error("First frame must include a { palette } option");
      ia(i, c, h, v, T), rr(i, v), _ >= 0 && aa(i, _);
    }
    let M = Math.round(p / 10);
    ra(i, k, M, m, w);
    let B = !!v && !A;
    oa(i, c, h, B ? v : null), B && rr(i, v), sa(i, l, c, h, T, a, o, s);
  } };
  function d() {
    Gr(i, "GIF89a");
  }
}
function ra(r, t, e, i, a) {
  var o, s;
  r.writeByte(33), r.writeByte(249), r.writeByte(4), a < 0 && (a = 0, i = !1), i ? (o = 1, s = 2) : (o = 0, s = 0), t >= 0 && (s = 7 & t), s <<= 2, r.writeByte(0 | s | o), gt(r, e), r.writeByte(a || 0), r.writeByte(0);
}
function ia(r, t, e, i, a = 8) {
  let o = 128 | a - 1 << 4 | Re(i.length) - 1;
  gt(r, t), gt(r, e), r.writeBytes([o, 0, 0]);
}
function aa(r, t) {
  r.writeByte(33), r.writeByte(255), r.writeByte(11), Gr(r, "NETSCAPE2.0"), r.writeByte(3), r.writeByte(1), gt(r, t), r.writeByte(0);
}
function rr(r, t) {
  let e = 1 << Re(t.length);
  for (let i = 0; i < e; i++) {
    let a = [0, 0, 0];
    i < t.length && (a = t[i]), r.writeByte(a[0]), r.writeByte(a[1]), r.writeByte(a[2]);
  }
}
function oa(r, t, e, i) {
  if (r.writeByte(44), gt(r, 0), gt(r, 0), gt(r, t), gt(r, e), i) {
    let a = 0, o = 0, s = Re(i.length) - 1;
    r.writeByte(128 | a | o | s);
  } else r.writeByte(0);
}
function sa(r, t, e, i, a = 8, o, s, n) {
  Xi(e, i, t, a, r, o, s, n);
}
function gt(r, t) {
  r.writeByte(255 & t), r.writeByte(t >> 8 & 255);
}
function Gr(r, t) {
  for (var e = 0; e < t.length; e++) r.writeByte(t.charCodeAt(e));
}
function Re(r) {
  return Math.max(Math.ceil(Math.log2(r)), 1);
}
Hi();
class na {
  constructor(t, e) {
    g(this, "_recorder");
    g(this, "_textmodifier");
    g(this, "_registerPostDrawHook");
    this._recorder = new Wi(), this._textmodifier = t, this._registerPostDrawHook = e;
  }
  async $saveGIF(t = {}) {
    const e = this._textmodifier.canvas, i = this._applyDefaultOptions(t), a = t.onProgress;
    try {
      const o = await this._recorder.$record(e, i, this._registerPostDrawHook, a), s = ea(), { repeat: n } = t;
      for (let c = 0; c < o.length; c++) {
        const h = o[c], { width: u, height: m, imageData: w, delayMs: p } = h, v = new Uint32Array(w.data.buffer), _ = Yi(v, 256, {}), T = Ji(v, _);
        s.writeFrame(T, u, m, { palette: _, delay: p, repeat: c === 0 ? n : -1 }), c % 2 != 0 && c !== o.length - 1 || (a == null || a({ state: "encoding", frameIndex: c + 1, totalFrames: o.length }), await new Promise((k) => setTimeout(k, 0)));
      }
      s.finish();
      const d = s.bytes(), l = d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength);
      new At().$downloadFile(new Blob([l], { type: "image/gif" }), i.filename), a == null || a({ state: "completed", totalFrames: i.frameCount });
    } catch (o) {
      throw a == null || a({ state: "error", message: o instanceof Error ? o.message : "GIF export failed" }), o;
    }
  }
  _applyDefaultOptions(t) {
    const e = Math.abs(Math.round(t.frameCount ?? 300)), i = Math.abs(t.frameRate ?? 60), a = Math.abs(t.scale ?? 1), o = Math.max(-1, Math.round(t.repeat ?? 0));
    return { filename: t.filename, frameCount: e, frameRate: i, scale: a, repeat: o };
  }
}
class ft extends Error {
  constructor(e, i, a) {
    super(i);
    g(this, "code");
    g(this, "cause");
    this.name = "VideoExportError", this.code = e, this.cause = a;
  }
}
function Bt() {
  return new ft("VIDEO_EXPORT_ABORTED", "Video export was cancelled.");
}
function ca(r, t) {
  return new ft("VIDEO_EXPORT_TIMEOUT", r, t);
}
function te(r, t, e, i) {
  return new Promise((a, o) => {
    if (e != null && e.aborted) return void o(Bt());
    let s = !1;
    const n = setTimeout(() => d(() => o(ca(t))), i), d = (c) => {
      s || (s = !0, clearTimeout(n), e == null || e.removeEventListener("abort", l), c());
    }, l = () => d(() => o(Bt()));
    e == null || e.addEventListener("abort", l, { once: !0 }), r.then((c) => d(() => a(c)), (c) => d(() => o(c)));
  });
}
class da {
  constructor(t, e, i, a) {
    g(this, "canvas");
    g(this, "_textmodifier");
    g(this, "_registerPostDrawHook");
    g(this, "_context");
    g(this, "_sourceCanvas");
    g(this, "_pendingFrame", null);
    g(this, "_syntheticFrameCount", 0);
    g(this, "_syntheticMillis", 0);
    this._textmodifier = t, this._registerPostDrawHook = e, this._sourceCanvas = t.canvas, this.canvas = this._createStagingCanvas(i, a);
    const o = this.canvas.getContext("2d");
    if (!o) throw new Error("Video export requires a 2D canvas context for staging frames.");
    o.imageSmoothingEnabled = !1, this._context = o;
  }
  async $render(t) {
    var w;
    const e = this._textmodifier, i = Math.max(1, Math.round(t.frameCount)), a = Math.max(1, Math.round(t.frameRate)), o = 1e3 / a, s = e.isLooping(), n = e.frameCount, d = e.millis, l = "secs" in e, c = e.secs, h = this._captureMethodSnapshots(), u = this._capturePropertySnapshots(), m = this._registerPostDrawHook(() => {
      this._capturePendingFrame();
    });
    try {
      e.noLoop(), this._syntheticFrameCount = n, this._syntheticMillis = d, this._shadowTimingProperties(l), this._shadowTimingMethods(a, o), this._shadowResizeCanvas();
      for (let p = 0; p < i; p++) this._throwIfAborted(t.signal), this._syntheticFrameCount = n + p + 1, this._syntheticMillis = 1e3 * p / a, await this._renderOneFrame(p, t.signal), this._throwIfAborted(t.signal), await t.onFrame({ frameIndex: p, canvas: this.canvas });
    } finally {
      m(), (w = this._pendingFrame) == null || w.reject(new Error("Video export frame rendering was interrupted.")), this._pendingFrame = null, this._restoreProperties(u), this._restoreMethods(h), e.frameCount = n, e.millis = d, l && c !== void 0 && (e.secs = c), s ? e.loop() : e.noLoop();
    }
  }
  _renderOneFrame(t, e) {
    if (this._pendingFrame) throw new Error("A video export frame is already pending.");
    const i = this._textmodifier;
    return te(new Promise((a, o) => {
      this._pendingFrame = { frameIndex: t, resolve: a, reject: o };
      try {
        i.redraw(1);
      } catch (s) {
        this._pendingFrame = null, o(s);
      }
    }), `Video export frame ${t + 1} did not render within 30000ms.`, e, 3e4).catch((a) => {
      var o;
      throw ((o = this._pendingFrame) == null ? void 0 : o.frameIndex) === t && (this._pendingFrame = null), a;
    });
  }
  _capturePendingFrame() {
    const t = this._pendingFrame;
    if (t) try {
      this._context.clearRect(0, 0, this.canvas.width, this.canvas.height), this._context.drawImage(this._sourceCanvas, 0, 0, this._sourceCanvas.width, this._sourceCanvas.height, 0, 0, this.canvas.width, this.canvas.height), this._pendingFrame = null, t.resolve();
    } catch (e) {
      this._pendingFrame = null, t.reject(e);
    }
  }
  _createStagingCanvas(t, e) {
    const i = document.createElement("canvas");
    return i.width = Math.max(1, Math.round(t)), i.height = Math.max(1, Math.round(e)), i;
  }
  _captureMethodSnapshots() {
    return ["deltaTime", "frameRate", "resizeCanvas"].map((t) => ({ key: t, hadOwnProperty: Object.prototype.hasOwnProperty.call(this._textmodifier, t), value: this._textmodifier[t] }));
  }
  _capturePropertySnapshots() {
    return ["frameCount", "millis", "secs"].map((t) => ({ key: t, hadOwnProperty: Object.prototype.hasOwnProperty.call(this._textmodifier, t), descriptor: Object.getOwnPropertyDescriptor(this._textmodifier, t) }));
  }
  _shadowTimingProperties(t) {
    Object.defineProperty(this._textmodifier, "frameCount", { configurable: !0, enumerable: !0, get: () => this._syntheticFrameCount, set: (e) => {
      this._syntheticFrameCount = e;
    } }), Object.defineProperty(this._textmodifier, "millis", { configurable: !0, enumerable: !0, get: () => this._syntheticMillis, set: (e) => {
      this._syntheticMillis = e;
    } }), t && Object.defineProperty(this._textmodifier, "secs", { configurable: !0, enumerable: !0, get: () => this._syntheticMillis / 1e3, set: (e) => {
      this._syntheticMillis = 1e3 * e;
    } });
  }
  _shadowTimingMethods(t, e) {
    const i = this._textmodifier, a = i.frameRate;
    i.deltaTime = () => e, i.frameRate = function(o) {
      return o === void 0 ? t : a.call(this, o);
    };
  }
  _shadowResizeCanvas() {
    this._textmodifier.resizeCanvas = () => {
    };
  }
  _restoreMethods(t) {
    const e = this._textmodifier;
    for (const i of t) i.hadOwnProperty ? e[i.key] = i.value : delete e[i.key];
  }
  _restoreProperties(t) {
    for (const e of t) e.hadOwnProperty && e.descriptor ? Object.defineProperty(this._textmodifier, e.key, e.descriptor) : delete this._textmodifier[e.key];
  }
  _throwIfAborted(t) {
    if (t != null && t.aborted) throw Bt();
  }
}
function f(r) {
  if (!r) throw new Error("Assertion failed.");
}
const qr = (r) => {
  const t = (r % 360 + 360) % 360;
  if (t === 0 || t === 90 || t === 180 || t === 270) return t;
  throw new Error(`Invalid rotation ${r}.`);
}, ot = (r) => r && r[r.length - 1], yt = (r) => r >= 0 && r < 2 ** 32, x = (r) => {
  let t = 0;
  for (; r.readBits(1) === 0 && t < 32; ) t++;
  if (t >= 32) throw new Error("Invalid exponential-Golomb code.");
  return (1 << t) - 1 + r.readBits(t);
}, lt = (r) => {
  const t = x(r);
  return 1 & t ? t + 1 >> 1 : -(t >> 1);
}, la = (r, t, e, i) => {
  for (let a = t; a < e; a++) {
    const o = Math.floor(a / 8);
    let s = r[o];
    const n = 7 - (7 & a);
    s &= ~(1 << n), s |= (i & 1 << e - a - 1) >> e - a - 1 << n, r[o] = s;
  }
}, q = (r) => r.constructor === Uint8Array ? r : ArrayBuffer.isView(r) ? new Uint8Array(r.buffer, r.byteOffset, r.byteLength) : new Uint8Array(r), Xr = (r) => r.constructor === DataView ? r : ArrayBuffer.isView(r) ? new DataView(r.buffer, r.byteOffset, r.byteLength) : new DataView(r), G = new TextEncoder(), Wt = { bt709: 1, bt470bg: 5, smpte170m: 6, bt2020: 9, smpte432: 12 }, Ut = { bt709: 1, smpte170m: 6, linear: 8, "iec61966-2-1": 13, pq: 16, hlg: 18 }, $t = { rgb: 0, bt709: 1, bt470bg: 5, smpte170m: 6, "bt2020-ncl": 9 }, Qr = (r) => !!(r && r.primaries && r.transfer && r.matrix && r.fullRange !== void 0), Le = (r) => r instanceof ArrayBuffer || typeof SharedArrayBuffer < "u" && r instanceof SharedArrayBuffer || ArrayBuffer.isView(r);
class Yr {
  constructor() {
    this.currentPromise = Promise.resolve(), this.pending = 0;
  }
  async acquire() {
    let t;
    const e = new Promise((a) => {
      let o = !1;
      t = () => {
        o || (a(), this.pending--, o = !0);
      };
    }), i = this.currentPromise;
    return this.currentPromise = e, this.pending++, await i, t;
  }
}
const ir = (r, t, e) => {
  let i = 0, a = r.length - 1, o = -1;
  for (; i <= a; ) {
    const s = i + (a - i + 1) / 2 | 0;
    e(r[s]) <= t ? (o = s, i = s + 1) : a = s - 1;
  }
  return o;
}, Ve = () => {
  let r, t;
  return { promise: new Promise((e, i) => {
    r = e, t = i;
  }), resolve: r, reject: t };
}, It = (r) => {
  throw new Error(`Unexpected value: ${r}`);
}, ha = (r, t, e) => r.getUint8(t) << 16 | r.getUint8(t + 1) << 8 | r.getUint8(t + 2), ua = (r, t, e, i) => {
  e >>>= 0, e &= 16777215, r.setUint8(t, e >>> 16 & 255), r.setUint8(t + 1, e >>> 8 & 255), r.setUint8(t + 2, 255 & e);
};
const ar = (r, t) => Math.round(r / t) * t, or = (r, t) => Math.round(r * t) / t, sr = (r, t) => Math.floor(r * t) / t, ma = /^[a-z]{3}$/, pa = (r) => ma.test(r), Et = 1e6 * (1 + Number.EPSILON), fa = (r, t) => {
  const e = r < 0 ? -1 : 1;
  let i = 0, a = 1, o = 1, s = 0, n = r = Math.abs(r);
  for (; ; ) {
    const d = Math.floor(n), l = d * o + i, c = d * s + a;
    if (c > t) return { num: e * o, den: s };
    if (i = o, a = s, o = l, s = c, n = 1 / (n - d), !isFinite(n)) break;
  }
  return { num: e * o, den: s };
};
class ga {
  constructor() {
    this.currentPromise = Promise.resolve();
  }
  call(t) {
    return this.currentPromise = this.currentPromise.then(t);
  }
}
let pe = null;
const Kr = () => {
  var r;
  return pe !== null ? pe : pe = typeof navigator < "u" && ((r = navigator.userAgent) == null ? void 0 : r.includes("Firefox"));
};
let fe = null;
const wa = () => {
  var r;
  return fe !== null ? fe : fe = !(typeof navigator > "u" || !((r = navigator.vendor) != null && r.includes("Google Inc")) && !/Chrome/.test(navigator.userAgent));
};
let ge = null;
const ya = () => {
  if (ge !== null) return ge;
  if (typeof navigator > "u") return null;
  const r = /\bChrome\/(\d+)/.exec(navigator.userAgent);
  return r ? ge = Number(r[1]) : null;
}, Oe = function* (r) {
  for (const t in r) {
    const e = r[t];
    e !== void 0 && (yield { key: t, value: e });
  }
}, ba = (r) => {
  switch (r.toLowerCase()) {
    case "image/jpeg":
    case "image/jpg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/gif":
      return ".gif";
    case "image/webp":
      return ".webp";
    case "image/bmp":
      return ".bmp";
    case "image/svg+xml":
      return ".svg";
    case "image/tiff":
      return ".tiff";
    case "image/avif":
      return ".avif";
    case "image/x-icon":
    case "image/vnd.microsoft.icon":
      return ".ico";
    default:
      return null;
  }
}, va = (r, t) => {
  if (r.length !== t.length) return !1;
  for (let e = 0; e < r.length; e++) if (r[e] !== t[e]) return !1;
  return !0;
}, _a = () => {
  Symbol.dispose ?? (Symbol.dispose = Symbol("Symbol.dispose"));
}, xa = (r, t) => {
  let e = -1, i = 1 / 0;
  for (let a = 0; a < r.length; a++) {
    const o = t(r[a]);
    o < i && (i = o, e = a);
  }
  return e;
}, Ne = (r) => {
  f(Number.isInteger(r.num)), f(Number.isInteger(r.den)), f(r.den !== 0);
  let t = Math.abs(r.num), e = Math.abs(r.den);
  for (; e !== 0; ) {
    const a = t % e;
    t = e, e = a;
  }
  const i = t || 1;
  return { num: r.num / i, den: r.den / i };
}, nr = (r, t) => {
  if (typeof r != "object" || !r) throw new TypeError(`${t} must be an object.`);
  if (!Number.isInteger(r.left) || r.left < 0) throw new TypeError(`${t}.left must be a non-negative integer.`);
  if (!Number.isInteger(r.top) || r.top < 0) throw new TypeError(`${t}.top must be a non-negative integer.`);
  if (!Number.isInteger(r.width) || r.width < 0) throw new TypeError(`${t}.width must be a non-negative integer.`);
  if (!Number.isInteger(r.height) || r.height < 0) throw new TypeError(`${t}.height must be a non-negative integer.`);
}, cr = (r) => Array.isArray(r) ? r : [r];
class Jr {
  constructor() {
    this._listeners = /* @__PURE__ */ new Map();
  }
  on(t, e, i) {
    this._listeners.has(t) || this._listeners.set(t, /* @__PURE__ */ new Set());
    const a = { fn: e, once: (i == null ? void 0 : i.once) ?? !1 };
    return this._listeners.get(t).add(a), () => {
      var o;
      (o = this._listeners.get(t)) == null || o.delete(a);
    };
  }
  _emit(...t) {
    const [e, i] = t, a = this._listeners.get(e);
    if (a) for (const o of a) {
      try {
        o.fn(i);
      } catch (s) {
        console.error(s);
      }
      o.once && a.delete(o);
    }
  }
}
const Ta = (r) => r !== null && typeof r == "object" && Object.getPrototypeOf(r) === Object.prototype && Object.values(r).every((t) => typeof t == "string");
class Zr {
  constructor(t, e) {
    if (this.data = t, this.mimeType = e, !(t instanceof Uint8Array)) throw new TypeError("data must be a Uint8Array.");
    if (typeof e != "string") throw new TypeError("mimeType must be a string.");
  }
}
class ti {
  constructor(t, e, i, a) {
    if (this.data = t, this.mimeType = e, this.name = i, this.description = a, !(t instanceof Uint8Array)) throw new TypeError("data must be a Uint8Array.");
    if (e !== void 0 && typeof e != "string") throw new TypeError("mimeType, when provided, must be a string.");
    if (i !== void 0 && typeof i != "string") throw new TypeError("name, when provided, must be a string.");
    if (a !== void 0 && typeof a != "string") throw new TypeError("description, when provided, must be a string.");
  }
}
const ka = (r) => {
  if (!r || typeof r != "object") throw new TypeError("tags must be an object.");
  if (r.title !== void 0 && typeof r.title != "string") throw new TypeError("tags.title, when provided, must be a string.");
  if (r.description !== void 0 && typeof r.description != "string") throw new TypeError("tags.description, when provided, must be a string.");
  if (r.artist !== void 0 && typeof r.artist != "string") throw new TypeError("tags.artist, when provided, must be a string.");
  if (r.album !== void 0 && typeof r.album != "string") throw new TypeError("tags.album, when provided, must be a string.");
  if (r.albumArtist !== void 0 && typeof r.albumArtist != "string") throw new TypeError("tags.albumArtist, when provided, must be a string.");
  if (r.trackNumber !== void 0 && (!Number.isInteger(r.trackNumber) || r.trackNumber <= 0)) throw new TypeError("tags.trackNumber, when provided, must be a positive integer.");
  if (r.tracksTotal !== void 0 && (!Number.isInteger(r.tracksTotal) || r.tracksTotal <= 0)) throw new TypeError("tags.tracksTotal, when provided, must be a positive integer.");
  if (r.discNumber !== void 0 && (!Number.isInteger(r.discNumber) || r.discNumber <= 0)) throw new TypeError("tags.discNumber, when provided, must be a positive integer.");
  if (r.discsTotal !== void 0 && (!Number.isInteger(r.discsTotal) || r.discsTotal <= 0)) throw new TypeError("tags.discsTotal, when provided, must be a positive integer.");
  if (r.genre !== void 0 && typeof r.genre != "string") throw new TypeError("tags.genre, when provided, must be a string.");
  if (r.date !== void 0 && (!(r.date instanceof Date) || Number.isNaN(r.date.getTime()))) throw new TypeError("tags.date, when provided, must be a valid Date.");
  if (r.lyrics !== void 0 && typeof r.lyrics != "string") throw new TypeError("tags.lyrics, when provided, must be a string.");
  if (r.images !== void 0) {
    if (!Array.isArray(r.images)) throw new TypeError("tags.images, when provided, must be an array.");
    for (const t of r.images) {
      if (!t || typeof t != "object") throw new TypeError("Each image in tags.images must be an object.");
      if (!(t.data instanceof Uint8Array)) throw new TypeError("Each image.data must be a Uint8Array.");
      if (typeof t.mimeType != "string") throw new TypeError("Each image.mimeType must be a string.");
      if (!["coverFront", "coverBack", "unknown"].includes(t.kind)) throw new TypeError("Each image.kind must be 'coverFront', 'coverBack', or 'unknown'.");
    }
  }
  if (r.comment !== void 0 && typeof r.comment != "string") throw new TypeError("tags.comment, when provided, must be a string.");
  if (r.raw !== void 0) {
    if (!r.raw || typeof r.raw != "object") throw new TypeError("tags.raw, when provided, must be an object.");
    for (const t of Object.values(r.raw)) if (!(t === null || typeof t == "string" || t instanceof Uint8Array || t instanceof Zr || t instanceof ti || Ta(t))) throw new TypeError("Each value in tags.raw must be a string, Uint8Array, RichImageData, AttachedFile, Record<string, string>, or null.");
  }
}, Ca = (r) => {
  if (!r || typeof r != "object") throw new TypeError("disposition must be an object.");
  if (r.default !== void 0 && typeof r.default != "boolean") throw new TypeError("disposition.default must be a boolean.");
  if (r.primary !== void 0 && typeof r.primary != "boolean") throw new TypeError("disposition.primary must be a boolean.");
  if (r.forced !== void 0 && typeof r.forced != "boolean") throw new TypeError("disposition.forced must be a boolean.");
  if (r.original !== void 0 && typeof r.original != "boolean") throw new TypeError("disposition.original must be a boolean.");
  if (r.commentary !== void 0 && typeof r.commentary != "boolean") throw new TypeError("disposition.commentary must be a boolean.");
  if (r.hearingImpaired !== void 0 && typeof r.hearingImpaired != "boolean") throw new TypeError("disposition.hearingImpaired must be a boolean.");
  if (r.visuallyImpaired !== void 0 && typeof r.visuallyImpaired != "boolean") throw new TypeError("disposition.visuallyImpaired must be a boolean.");
};
class j {
  constructor(t) {
    this.bytes = t, this.pos = 0;
  }
  seekToByte(t) {
    this.pos = 8 * t;
  }
  readBit() {
    const t = Math.floor(this.pos / 8), e = this.bytes[t] ?? 0, i = 7 - (7 & this.pos), a = (e & 1 << i) >> i;
    return this.pos++, a;
  }
  readBits(t) {
    if (t === 1) return this.readBit();
    let e = 0;
    for (let i = 0; i < t; i++) e <<= 1, e |= this.readBit();
    return e;
  }
  writeBits(t, e) {
    const i = this.pos + t;
    for (let a = this.pos; a < i; a++) {
      const o = Math.floor(a / 8);
      let s = this.bytes[o];
      const n = 7 - (7 & a);
      s &= ~(1 << n), s |= (e & 1 << i - a - 1) >> i - a - 1 << n, this.bytes[o] = s;
    }
    this.pos = i;
  }
  readAlignedByte() {
    if (this.pos % 8 != 0) throw new Error("Bitstream is not byte-aligned.");
    const t = this.pos / 8, e = this.bytes[t] ?? 0;
    return this.pos += 8, e;
  }
  skipBits(t) {
    this.pos += t;
  }
  getBitsLeft() {
    return 8 * this.bytes.length - this.pos;
  }
  clone() {
    const t = new j(this.bytes);
    return t.pos = this.pos, t;
  }
}
const We = [96e3, 88200, 64e3, 48e3, 44100, 32e3, 24e3, 22050, 16e3, 12e3, 11025, 8e3, 7350], Ue = [-1, 1, 2, 3, 4, 5, 6, 8], ei = (r) => {
  let t = We.indexOf(r.sampleRate), e = null;
  t === -1 && (t = 15, e = r.sampleRate);
  const i = Ue.indexOf(r.numberOfChannels);
  if (i === -1) throw new TypeError(`Unsupported number of channels: ${r.numberOfChannels}`);
  let a = 13;
  r.objectType >= 32 && (a += 6), t === 15 && (a += 24);
  const o = Math.ceil(a / 8), s = new Uint8Array(o), n = new j(s);
  return r.objectType < 32 ? n.writeBits(5, r.objectType) : (n.writeBits(5, 31), n.writeBits(6, r.objectType - 32)), n.writeBits(4, t), t === 15 && n.writeBits(24, e), n.writeBits(4, i), s;
}, rt = ["avc", "hevc", "vp9", "av1", "vp8"], mt = ["pcm-s16", "pcm-s16be", "pcm-s24", "pcm-s24be", "pcm-s32", "pcm-s32be", "pcm-f32", "pcm-f32be", "pcm-f64", "pcm-f64be", "pcm-u8", "pcm-s8", "ulaw", "alaw"], se = ["aac", "opus", "mp3", "vorbis", "flac", "ac3", "eac3"], Lt = [...se, ...mt], Tt = ["webvtt"], ee = [{ maxMacroblocks: 99, maxBitrate: 64e3, maxDpbMbs: 396, level: 10 }, { maxMacroblocks: 396, maxBitrate: 192e3, maxDpbMbs: 900, level: 11 }, { maxMacroblocks: 396, maxBitrate: 384e3, maxDpbMbs: 2376, level: 12 }, { maxMacroblocks: 396, maxBitrate: 768e3, maxDpbMbs: 2376, level: 13 }, { maxMacroblocks: 396, maxBitrate: 2e6, maxDpbMbs: 2376, level: 20 }, { maxMacroblocks: 792, maxBitrate: 4e6, maxDpbMbs: 4752, level: 21 }, { maxMacroblocks: 1620, maxBitrate: 4e6, maxDpbMbs: 8100, level: 22 }, { maxMacroblocks: 1620, maxBitrate: 1e7, maxDpbMbs: 8100, level: 30 }, { maxMacroblocks: 3600, maxBitrate: 14e6, maxDpbMbs: 18e3, level: 31 }, { maxMacroblocks: 5120, maxBitrate: 2e7, maxDpbMbs: 20480, level: 32 }, { maxMacroblocks: 8192, maxBitrate: 2e7, maxDpbMbs: 32768, level: 40 }, { maxMacroblocks: 8192, maxBitrate: 5e7, maxDpbMbs: 32768, level: 41 }, { maxMacroblocks: 8704, maxBitrate: 5e7, maxDpbMbs: 34816, level: 42 }, { maxMacroblocks: 22080, maxBitrate: 135e6, maxDpbMbs: 110400, level: 50 }, { maxMacroblocks: 36864, maxBitrate: 24e7, maxDpbMbs: 184320, level: 51 }, { maxMacroblocks: 36864, maxBitrate: 24e7, maxDpbMbs: 184320, level: 52 }, { maxMacroblocks: 139264, maxBitrate: 24e7, maxDpbMbs: 696320, level: 60 }, { maxMacroblocks: 139264, maxBitrate: 48e7, maxDpbMbs: 696320, level: 61 }, { maxMacroblocks: 139264, maxBitrate: 8e8, maxDpbMbs: 696320, level: 62 }], dr = [{ maxPictureSize: 36864, maxBitrate: 128e3, tier: "L", level: 30 }, { maxPictureSize: 122880, maxBitrate: 15e5, tier: "L", level: 60 }, { maxPictureSize: 245760, maxBitrate: 3e6, tier: "L", level: 63 }, { maxPictureSize: 552960, maxBitrate: 6e6, tier: "L", level: 90 }, { maxPictureSize: 983040, maxBitrate: 1e7, tier: "L", level: 93 }, { maxPictureSize: 2228224, maxBitrate: 12e6, tier: "L", level: 120 }, { maxPictureSize: 2228224, maxBitrate: 3e7, tier: "H", level: 120 }, { maxPictureSize: 2228224, maxBitrate: 2e7, tier: "L", level: 123 }, { maxPictureSize: 2228224, maxBitrate: 5e7, tier: "H", level: 123 }, { maxPictureSize: 8912896, maxBitrate: 25e6, tier: "L", level: 150 }, { maxPictureSize: 8912896, maxBitrate: 1e8, tier: "H", level: 150 }, { maxPictureSize: 8912896, maxBitrate: 4e7, tier: "L", level: 153 }, { maxPictureSize: 8912896, maxBitrate: 16e7, tier: "H", level: 153 }, { maxPictureSize: 8912896, maxBitrate: 6e7, tier: "L", level: 156 }, { maxPictureSize: 8912896, maxBitrate: 24e7, tier: "H", level: 156 }, { maxPictureSize: 35651584, maxBitrate: 6e7, tier: "L", level: 180 }, { maxPictureSize: 35651584, maxBitrate: 24e7, tier: "H", level: 180 }, { maxPictureSize: 35651584, maxBitrate: 12e7, tier: "L", level: 183 }, { maxPictureSize: 35651584, maxBitrate: 48e7, tier: "H", level: 183 }, { maxPictureSize: 35651584, maxBitrate: 24e7, tier: "L", level: 186 }, { maxPictureSize: 35651584, maxBitrate: 8e8, tier: "H", level: 186 }], lr = [{ maxPictureSize: 36864, maxBitrate: 2e5, level: 10 }, { maxPictureSize: 73728, maxBitrate: 8e5, level: 11 }, { maxPictureSize: 122880, maxBitrate: 18e5, level: 20 }, { maxPictureSize: 245760, maxBitrate: 36e5, level: 21 }, { maxPictureSize: 552960, maxBitrate: 72e5, level: 30 }, { maxPictureSize: 983040, maxBitrate: 12e6, level: 31 }, { maxPictureSize: 2228224, maxBitrate: 18e6, level: 40 }, { maxPictureSize: 2228224, maxBitrate: 3e7, level: 41 }, { maxPictureSize: 8912896, maxBitrate: 6e7, level: 50 }, { maxPictureSize: 8912896, maxBitrate: 12e7, level: 51 }, { maxPictureSize: 8912896, maxBitrate: 18e7, level: 52 }, { maxPictureSize: 35651584, maxBitrate: 18e7, level: 60 }, { maxPictureSize: 35651584, maxBitrate: 24e7, level: 61 }, { maxPictureSize: 35651584, maxBitrate: 48e7, level: 62 }], hr = [{ maxPictureSize: 147456, maxBitrate: 15e5, tier: "M", level: 0 }, { maxPictureSize: 278784, maxBitrate: 3e6, tier: "M", level: 1 }, { maxPictureSize: 665856, maxBitrate: 6e6, tier: "M", level: 4 }, { maxPictureSize: 1065024, maxBitrate: 1e7, tier: "M", level: 5 }, { maxPictureSize: 2359296, maxBitrate: 12e6, tier: "M", level: 8 }, { maxPictureSize: 2359296, maxBitrate: 3e7, tier: "H", level: 8 }, { maxPictureSize: 2359296, maxBitrate: 2e7, tier: "M", level: 9 }, { maxPictureSize: 2359296, maxBitrate: 5e7, tier: "H", level: 9 }, { maxPictureSize: 8912896, maxBitrate: 3e7, tier: "M", level: 12 }, { maxPictureSize: 8912896, maxBitrate: 1e8, tier: "H", level: 12 }, { maxPictureSize: 8912896, maxBitrate: 4e7, tier: "M", level: 13 }, { maxPictureSize: 8912896, maxBitrate: 16e7, tier: "H", level: 13 }, { maxPictureSize: 8912896, maxBitrate: 6e7, tier: "M", level: 14 }, { maxPictureSize: 8912896, maxBitrate: 24e7, tier: "H", level: 14 }, { maxPictureSize: 35651584, maxBitrate: 6e7, tier: "M", level: 15 }, { maxPictureSize: 35651584, maxBitrate: 24e7, tier: "H", level: 15 }, { maxPictureSize: 35651584, maxBitrate: 6e7, tier: "M", level: 16 }, { maxPictureSize: 35651584, maxBitrate: 24e7, tier: "H", level: 16 }, { maxPictureSize: 35651584, maxBitrate: 1e8, tier: "M", level: 17 }, { maxPictureSize: 35651584, maxBitrate: 48e7, tier: "H", level: 17 }, { maxPictureSize: 35651584, maxBitrate: 16e7, tier: "M", level: 18 }, { maxPictureSize: 35651584, maxBitrate: 8e8, tier: "H", level: 18 }, { maxPictureSize: 35651584, maxBitrate: 16e7, tier: "M", level: 19 }, { maxPictureSize: 35651584, maxBitrate: 8e8, tier: "H", level: 19 }], Ea = (r, t, e, i) => {
  if (r === "avc") {
    const o = Math.ceil(t / 16) * Math.ceil(e / 16), s = ee.find((d) => o <= d.maxMacroblocks && i <= d.maxBitrate) ?? ot(ee), n = s ? s.level : 0;
    return `avc1.${"64".padStart(2, "0")}00${n.toString(16).padStart(2, "0")}`;
  }
  if (r === "hevc") {
    const n = t * e, d = dr.find((c) => n <= c.maxPictureSize && i <= c.maxBitrate) ?? ot(dr);
    return `hev1.1.6.${d.tier}${d.level}.B0`;
  }
  if (r === "vp8") return "vp8";
  if (r === "vp9") {
    const a = t * e;
    return `vp09.00.${(lr.find((s) => a <= s.maxPictureSize && i <= s.maxBitrate) ?? ot(lr)).level.toString().padStart(2, "0")}.08`;
  }
  if (r === "av1") {
    const o = t * e, s = hr.find((d) => o <= d.maxPictureSize && i <= d.maxBitrate) ?? ot(hr);
    return `av01.0.${s.level.toString().padStart(2, "0")}${s.tier}.08`;
  }
  throw new TypeError(`Unhandled codec '${r}'.`);
}, Sa = (r) => {
  const t = r.split(".");
  return [1, 1, Number(t[1]), 2, 1, Number(t[2]), 3, 1, Number(t[3]), 4, 1, t[4] ? Number(t[4]) : 1];
}, ri = (r) => {
  const t = r.split("."), e = Number(t[1]), i = t[2];
  return [129, (e << 5) + Number(i.slice(0, -1)), ((i.slice(-1) === "H" ? 1 : 0) << 7) + ((Number(t[3]) === 8 ? 0 : 1) << 6) + 0 + ((t[4] ? Number(t[4]) : 0) << 4) + ((t[5] ? Number(t[5][0]) : 1) << 3) + ((t[5] ? Number(t[5][1]) : 1) << 2) + (t[5] ? Number(t[5][2]) : 0), 0];
};
const ii = /^pcm-([usf])(\d+)(be)?$/, kt = (r) => {
  if (f(mt.includes(r)), r === "ulaw") return { dataType: "ulaw", sampleSize: 1, littleEndian: !0, silentValue: 255 };
  if (r === "alaw") return { dataType: "alaw", sampleSize: 1, littleEndian: !0, silentValue: 213 };
  const t = ii.exec(r);
  let e;
  return f(t), e = t[1] === "u" ? "unsigned" : t[1] === "s" ? "signed" : "float", { dataType: e, sampleSize: Number(t[2]) / 8, littleEndian: t[3] !== "be", silentValue: r === "pcm-u8" ? 128 : 0 };
}, Ba = (r) => r.startsWith("avc1") || r.startsWith("avc3") ? "avc" : r.startsWith("hev1") || r.startsWith("hvc1") ? "hevc" : r === "vp8" ? "vp8" : r.startsWith("vp09") ? "vp9" : r.startsWith("av01") ? "av1" : r === "mp3" || r === "mp4a.69" || r === "mp4a.6B" || r === "mp4a.6b" || r === "mp4a.40.34" ? "mp3" : r.startsWith("mp4a.40.") || r === "mp4a.67" ? "aac" : r === "opus" ? "opus" : r === "vorbis" ? "vorbis" : r === "flac" ? "flac" : r === "ac-3" || r === "ac3" ? "ac3" : r === "ec-3" || r === "eac3" ? "eac3" : r === "ulaw" ? "ulaw" : r === "alaw" ? "alaw" : ii.test(r) ? r : r === "webvtt" ? "webvtt" : null, Aa = (r) => r === "avc" ? { avc: { format: "avc" } } : r === "hevc" ? { hevc: { format: "hevc" } } : {}, Ia = ["avc1", "avc3", "hev1", "hvc1", "vp8", "vp09", "av01"], Pa = /^(avc1|avc3)\.[0-9a-fA-F]{6}$/, Ma = /^(hev1|hvc1)\.(?:[ABC]?\d+)\.[0-9a-fA-F]{1,8}\.[LH]\d+(?:\.[0-9a-fA-F]{1,2}){0,6}$/, Fa = /^vp09(?:\.\d{2}){3}(?:(?:\.\d{2}){5})?$/, Da = /^av01\.\d\.\d{2}[MH]\.\d{2}(?:\.\d\.\d{3}\.\d{2}\.\d{2}\.\d{2}\.\d)?$/, ai = (r) => {
  if (!r) throw new TypeError("Video chunk metadata must be provided.");
  if (typeof r != "object") throw new TypeError("Video chunk metadata must be an object.");
  if (!r.decoderConfig) throw new TypeError("Video chunk metadata must include a decoder configuration.");
  if (typeof r.decoderConfig != "object") throw new TypeError("Video chunk metadata decoder configuration must be an object.");
  if (typeof r.decoderConfig.codec != "string") throw new TypeError("Video chunk metadata decoder configuration must specify a codec string.");
  if (!Ia.some((t) => r.decoderConfig.codec.startsWith(t))) throw new TypeError("Video chunk metadata decoder configuration codec string must be a valid video codec string as specified in the Mediabunny Codec Registry.");
  if (!Number.isInteger(r.decoderConfig.codedWidth) || r.decoderConfig.codedWidth <= 0) throw new TypeError("Video chunk metadata decoder configuration must specify a valid codedWidth (positive integer).");
  if (!Number.isInteger(r.decoderConfig.codedHeight) || r.decoderConfig.codedHeight <= 0) throw new TypeError("Video chunk metadata decoder configuration must specify a valid codedHeight (positive integer).");
  if (r.decoderConfig.displayAspectWidth !== void 0 && (!Number.isInteger(r.decoderConfig.displayAspectWidth) || r.decoderConfig.displayAspectWidth <= 0)) throw new TypeError("Video chunk metadata decoder configuration displayAspectWidth, when defined, must be a positive integer.");
  if (r.decoderConfig.displayAspectHeight !== void 0 && (!Number.isInteger(r.decoderConfig.displayAspectHeight) || r.decoderConfig.displayAspectHeight <= 0)) throw new TypeError("Video chunk metadata decoder configuration displayAspectHeight, when defined, must be a positive integer.");
  if (r.decoderConfig.displayAspectWidth !== void 0 != (r.decoderConfig.displayAspectHeight !== void 0)) throw new TypeError("Video chunk metadata decoder configuration must specify both displayAspectWidth and displayAspectHeight, or neither.");
  if (r.decoderConfig.description !== void 0 && !Le(r.decoderConfig.description)) throw new TypeError("Video chunk metadata decoder configuration description, when defined, must be an ArrayBuffer or an ArrayBuffer view.");
  if (r.decoderConfig.colorSpace !== void 0) {
    const { colorSpace: t } = r.decoderConfig;
    if (typeof t != "object") throw new TypeError("Video chunk metadata decoder configuration colorSpace, when provided, must be an object.");
    const e = Object.keys(Wt);
    if (t.primaries != null && !e.includes(t.primaries)) throw new TypeError(`Video chunk metadata decoder configuration colorSpace primaries, when defined, must be one of ${e.join(", ")}.`);
    const i = Object.keys(Ut);
    if (t.transfer != null && !i.includes(t.transfer)) throw new TypeError(`Video chunk metadata decoder configuration colorSpace transfer, when defined, must be one of ${i.join(", ")}.`);
    const a = Object.keys($t);
    if (t.matrix != null && !a.includes(t.matrix)) throw new TypeError(`Video chunk metadata decoder configuration colorSpace matrix, when defined, must be one of ${a.join(", ")}.`);
    if (t.fullRange != null && typeof t.fullRange != "boolean") throw new TypeError("Video chunk metadata decoder configuration colorSpace fullRange, when defined, must be a boolean.");
  }
  if (r.decoderConfig.codec.startsWith("avc1") || r.decoderConfig.codec.startsWith("avc3")) {
    if (!Pa.test(r.decoderConfig.codec)) throw new TypeError("Video chunk metadata decoder configuration codec string for AVC must be a valid AVC codec string as specified in Section 3.4 of RFC 6381.");
  } else if (r.decoderConfig.codec.startsWith("hev1") || r.decoderConfig.codec.startsWith("hvc1")) {
    if (!Ma.test(r.decoderConfig.codec)) throw new TypeError("Video chunk metadata decoder configuration codec string for HEVC must be a valid HEVC codec string as specified in Section E.3 of ISO 14496-15.");
  } else if (r.decoderConfig.codec.startsWith("vp8")) {
    if (r.decoderConfig.codec !== "vp8") throw new TypeError('Video chunk metadata decoder configuration codec string for VP8 must be "vp8".');
  } else if (r.decoderConfig.codec.startsWith("vp09")) {
    if (!Fa.test(r.decoderConfig.codec)) throw new TypeError('Video chunk metadata decoder configuration codec string for VP9 must be a valid VP9 codec string as specified in Section "Codecs Parameter String" of https://www.webmproject.org/vp9/mp4/.');
  } else if (r.decoderConfig.codec.startsWith("av01") && !Da.test(r.decoderConfig.codec)) throw new TypeError('Video chunk metadata decoder configuration codec string for AV1 must be a valid AV1 codec string as specified in Section "Codecs Parameter String" of https://aomediacodec.github.io/av1-isobmff/.');
}, Ra = ["mp4a", "mp3", "opus", "vorbis", "flac", "ulaw", "alaw", "pcm", "ac-3", "ec-3"], oi = (r) => {
  if (!r) throw new TypeError("Audio chunk metadata must be provided.");
  if (typeof r != "object") throw new TypeError("Audio chunk metadata must be an object.");
  if (!r.decoderConfig) throw new TypeError("Audio chunk metadata must include a decoder configuration.");
  if (typeof r.decoderConfig != "object") throw new TypeError("Audio chunk metadata decoder configuration must be an object.");
  if (typeof r.decoderConfig.codec != "string") throw new TypeError("Audio chunk metadata decoder configuration must specify a codec string.");
  if (!Ra.some((t) => r.decoderConfig.codec.startsWith(t))) throw new TypeError("Audio chunk metadata decoder configuration codec string must be a valid audio codec string as specified in the Mediabunny Codec Registry.");
  if (!Number.isInteger(r.decoderConfig.sampleRate) || r.decoderConfig.sampleRate <= 0) throw new TypeError("Audio chunk metadata decoder configuration must specify a valid sampleRate (positive integer).");
  if (!Number.isInteger(r.decoderConfig.numberOfChannels) || r.decoderConfig.numberOfChannels <= 0) throw new TypeError("Audio chunk metadata decoder configuration must specify a valid numberOfChannels (positive integer).");
  if (r.decoderConfig.description !== void 0 && !Le(r.decoderConfig.description)) throw new TypeError("Audio chunk metadata decoder configuration description, when defined, must be an ArrayBuffer or an ArrayBuffer view.");
  if (r.decoderConfig.codec.startsWith("mp4a") && r.decoderConfig.codec !== "mp4a.69" && r.decoderConfig.codec !== "mp4a.6B" && r.decoderConfig.codec !== "mp4a.6b") {
    if (!["mp4a.40.2", "mp4a.40.02", "mp4a.40.5", "mp4a.40.05", "mp4a.40.29", "mp4a.67"].includes(r.decoderConfig.codec)) throw new TypeError("Audio chunk metadata decoder configuration codec string for AAC must be a valid AAC codec string as specified in https://www.w3.org/TR/webcodecs-aac-codec-registration/.");
  } else if (r.decoderConfig.codec.startsWith("mp3") || r.decoderConfig.codec.startsWith("mp4a")) {
    if (r.decoderConfig.codec !== "mp3" && r.decoderConfig.codec !== "mp4a.69" && r.decoderConfig.codec !== "mp4a.6B" && r.decoderConfig.codec !== "mp4a.6b") throw new TypeError('Audio chunk metadata decoder configuration codec string for MP3 must be "mp3", "mp4a.69" or "mp4a.6B".');
  } else if (r.decoderConfig.codec.startsWith("opus")) {
    if (r.decoderConfig.codec !== "opus") throw new TypeError('Audio chunk metadata decoder configuration codec string for Opus must be "opus".');
    if (r.decoderConfig.description && r.decoderConfig.description.byteLength < 18) throw new TypeError("Audio chunk metadata decoder configuration description, when specified, is expected to be an Identification Header as specified in Section 5.1 of RFC 7845.");
  } else if (r.decoderConfig.codec.startsWith("vorbis")) {
    if (r.decoderConfig.codec !== "vorbis") throw new TypeError('Audio chunk metadata decoder configuration codec string for Vorbis must be "vorbis".');
    if (!r.decoderConfig.description) throw new TypeError("Audio chunk metadata decoder configuration for Vorbis must include a description, which is expected to adhere to the format described in https://www.w3.org/TR/webcodecs-vorbis-codec-registration/.");
  } else if (r.decoderConfig.codec.startsWith("flac")) {
    if (r.decoderConfig.codec !== "flac") throw new TypeError('Audio chunk metadata decoder configuration codec string for FLAC must be "flac".');
    if (!r.decoderConfig.description || r.decoderConfig.description.byteLength < 42) throw new TypeError("Audio chunk metadata decoder configuration for FLAC must include a description, which is expected to adhere to the format described in https://www.w3.org/TR/webcodecs-flac-codec-registration/.");
  } else if (r.decoderConfig.codec.startsWith("ac-3") || r.decoderConfig.codec.startsWith("ac3")) {
    if (r.decoderConfig.codec !== "ac-3") throw new TypeError('Audio chunk metadata decoder configuration codec string for AC-3 must be "ac-3".');
  } else if (r.decoderConfig.codec.startsWith("ec-3") || r.decoderConfig.codec.startsWith("eac3")) {
    if (r.decoderConfig.codec !== "ec-3") throw new TypeError('Audio chunk metadata decoder configuration codec string for EC-3 must be "ec-3".');
  } else if ((r.decoderConfig.codec.startsWith("pcm") || r.decoderConfig.codec.startsWith("ulaw") || r.decoderConfig.codec.startsWith("alaw")) && !mt.includes(r.decoderConfig.codec)) throw new TypeError(`Audio chunk metadata decoder configuration codec string for PCM must be one of the supported PCM codecs (${mt.join(", ")}).`);
}, si = (r) => {
  if (!r) throw new TypeError("Subtitle metadata must be provided.");
  if (typeof r != "object") throw new TypeError("Subtitle metadata must be an object.");
  if (!r.config) throw new TypeError("Subtitle metadata must include a config object.");
  if (typeof r.config != "object") throw new TypeError("Subtitle metadata config must be an object.");
  if (typeof r.config.description != "string") throw new TypeError("Subtitle metadata config description must be a string.");
}, La = [48e3, 44100, 32e3], Va = [24e3, 22050, 16e3];
var ht, Q;
(function(r) {
  r[r.NON_IDR_SLICE = 1] = "NON_IDR_SLICE", r[r.SLICE_DPA = 2] = "SLICE_DPA", r[r.SLICE_DPB = 3] = "SLICE_DPB", r[r.SLICE_DPC = 4] = "SLICE_DPC", r[r.IDR = 5] = "IDR", r[r.SEI = 6] = "SEI", r[r.SPS = 7] = "SPS", r[r.PPS = 8] = "PPS", r[r.AUD = 9] = "AUD", r[r.SPS_EXT = 13] = "SPS_EXT";
})(ht || (ht = {})), (function(r) {
  r[r.RASL_N = 8] = "RASL_N", r[r.RASL_R = 9] = "RASL_R", r[r.BLA_W_LP = 16] = "BLA_W_LP", r[r.RSV_IRAP_VCL23 = 23] = "RSV_IRAP_VCL23", r[r.VPS_NUT = 32] = "VPS_NUT", r[r.SPS_NUT = 33] = "SPS_NUT", r[r.PPS_NUT = 34] = "PPS_NUT", r[r.AUD_NUT = 35] = "AUD_NUT", r[r.PREFIX_SEI_NUT = 39] = "PREFIX_SEI_NUT", r[r.SUFFIX_SEI_NUT = 40] = "SUFFIX_SEI_NUT";
})(Q || (Q = {}));
const zt = function* (r) {
  let t = 0, e = -1;
  for (; t < r.length - 2; ) {
    const i = r.indexOf(0, t);
    if (i === -1 || i >= r.length - 2) break;
    t = i;
    let a = 0;
    t + 3 < r.length && r[t + 1] === 0 && r[t + 2] === 0 && r[t + 3] === 1 ? a = 4 : r[t + 1] === 0 && r[t + 2] === 1 && (a = 3), a !== 0 ? (e !== -1 && t > e && (yield { offset: e, length: t - e }), e = t + a, t = e) : t++;
  }
  e !== -1 && e < r.length && (yield { offset: e, length: r.length - e });
}, ni = function* (r, t) {
  let e = 0;
  const i = new DataView(r.buffer, r.byteOffset, r.byteLength);
  for (; e + t <= r.length; ) {
    let a;
    t === 1 ? a = i.getUint8(e) : t === 2 ? a = i.getUint16(e, !1) : t === 3 ? a = ha(i, e) : (f(t === 4), a = i.getUint32(e, !1)), e += t, yield { offset: e, length: a }, e += a;
  }
}, Oa = (r, t) => {
  if (t.description) {
    const e = 3 & q(t.description)[4];
    return ni(r, e + 1);
  }
  return zt(r);
}, ci = (r) => 31 & r, ne = (r) => {
  const t = [], e = r.length;
  for (let i = 0; i < e; i++) i + 2 < e && r[i] === 0 && r[i + 1] === 0 && r[i + 2] === 3 ? (t.push(0, 0), i += 2) : t.push(r[i]);
  return new Uint8Array(t);
}, Na = (r, t) => {
  const e = r.reduce((o, s) => o + t + s.byteLength, 0), i = new Uint8Array(e);
  let a = 0;
  for (const o of r) {
    const s = new DataView(i.buffer, i.byteOffset, i.byteLength);
    switch (t) {
      case 1:
        s.setUint8(a, o.byteLength);
        break;
      case 2:
        s.setUint16(a, o.byteLength, !1);
        break;
      case 3:
        ua(s, a, o.byteLength);
        break;
      case 4:
        s.setUint32(a, o.byteLength, !1);
    }
    a += t, i.set(o, a), a += o.byteLength;
  }
  return i;
}, Wa = (r) => {
  try {
    const t = [], e = [], i = [];
    for (const n of zt(r)) {
      const d = r.subarray(n.offset, n.offset + n.length), l = ci(d[0]);
      l === ht.SPS ? t.push(d) : l === ht.PPS ? e.push(d) : l === ht.SPS_EXT && i.push(d);
    }
    if (t.length === 0 || e.length === 0) return null;
    const a = t[0], o = $a(a);
    f(o !== null);
    const s = o.profileIdc === 100 || o.profileIdc === 110 || o.profileIdc === 122 || o.profileIdc === 144;
    return { configurationVersion: 1, avcProfileIndication: o.profileIdc, profileCompatibility: o.constraintFlags, avcLevelIndication: o.levelIdc, lengthSizeMinusOne: 3, sequenceParameterSets: t, pictureParameterSets: e, chromaFormat: s ? o.chromaFormatIdc : null, bitDepthLumaMinus8: s ? o.bitDepthLumaMinus8 : null, bitDepthChromaMinus8: s ? o.bitDepthChromaMinus8 : null, sequenceParameterSetExt: s ? i : null };
  } catch (t) {
    return console.error("Error building AVC Decoder Configuration Record:", t), null;
  }
}, Ua = (r) => {
  const t = [];
  t.push(r.configurationVersion), t.push(r.avcProfileIndication), t.push(r.profileCompatibility), t.push(r.avcLevelIndication), t.push(252 | 3 & r.lengthSizeMinusOne), t.push(224 | 31 & r.sequenceParameterSets.length);
  for (const e of r.sequenceParameterSets) {
    const i = e.byteLength;
    t.push(i >> 8), t.push(255 & i);
    for (let a = 0; a < i; a++) t.push(e[a]);
  }
  t.push(r.pictureParameterSets.length);
  for (const e of r.pictureParameterSets) {
    const i = e.byteLength;
    t.push(i >> 8), t.push(255 & i);
    for (let a = 0; a < i; a++) t.push(e[a]);
  }
  if (r.avcProfileIndication === 100 || r.avcProfileIndication === 110 || r.avcProfileIndication === 122 || r.avcProfileIndication === 144) {
    f(r.chromaFormat !== null), f(r.bitDepthLumaMinus8 !== null), f(r.bitDepthChromaMinus8 !== null), f(r.sequenceParameterSetExt !== null), t.push(252 | 3 & r.chromaFormat), t.push(248 | 7 & r.bitDepthLumaMinus8), t.push(248 | 7 & r.bitDepthChromaMinus8), t.push(r.sequenceParameterSetExt.length);
    for (const e of r.sequenceParameterSetExt) {
      const i = e.byteLength;
      t.push(i >> 8), t.push(255 & i);
      for (let a = 0; a < i; a++) t.push(e[a]);
    }
  }
  return new Uint8Array(t);
}, di = { 1: { num: 1, den: 1 }, 2: { num: 12, den: 11 }, 3: { num: 10, den: 11 }, 4: { num: 16, den: 11 }, 5: { num: 40, den: 33 }, 6: { num: 24, den: 11 }, 7: { num: 20, den: 11 }, 8: { num: 32, den: 11 }, 9: { num: 80, den: 33 }, 10: { num: 18, den: 11 }, 11: { num: 15, den: 11 }, 12: { num: 64, den: 33 }, 13: { num: 160, den: 99 }, 14: { num: 4, den: 3 }, 15: { num: 3, den: 2 }, 16: { num: 2, den: 1 } }, $a = (r) => {
  try {
    const t = new j(ne(r));
    if (t.skipBits(1), t.skipBits(2), t.readBits(5) !== 7) return null;
    const e = t.readAlignedByte(), i = t.readAlignedByte(), a = t.readAlignedByte();
    x(t);
    let o = 1, s = 0, n = 0, d = 0;
    if ((e === 100 || e === 110 || e === 122 || e === 244 || e === 44 || e === 83 || e === 86 || e === 118 || e === 128) && (o = x(t), o === 3 && (d = t.readBits(1)), s = x(t), n = x(t), t.skipBits(1), t.readBits(1))) {
      for (let F = 0; F < (o !== 3 ? 8 : 12); F++)
        if (t.readBits(1)) {
          const V = F < 6 ? 16 : 64;
          let N = 8, R = 8;
          for (let $ = 0; $ < V; $++)
            R !== 0 && (R = (N + lt(t) + 256) % 256), N = R === 0 ? N : R;
        }
    }
    x(t);
    const l = x(t);
    if (l === 0) x(t);
    else if (l === 1) {
      t.skipBits(1), lt(t), lt(t);
      const F = x(t);
      for (let V = 0; V < F; V++) lt(t);
    }
    x(t), t.skipBits(1);
    const c = x(t), h = x(t), u = 16 * (c + 1), m = 16 * (h + 1);
    let w = u, p = m;
    const v = t.readBits(1);
    if (v || t.skipBits(1), t.skipBits(1), t.readBits(1)) {
      const F = x(t), V = x(t), N = x(t), R = x(t);
      let $, D;
      (d === 0 ? o : 0) === 0 ? ($ = 1, D = 2 - v) : ($ = o === 3 ? 1 : 2, D = (o === 1 ? 2 : 1) * (2 - v)), w -= $ * (F + V), p -= D * (N + R);
    }
    let _ = 2, T = 2, k = 2, A = 0, M = { num: 1, den: 1 }, B = null, P = null;
    if (t.readBits(1)) {
      if (t.readBits(1)) {
        const N = t.readBits(8);
        if (N === 255) M = { num: t.readBits(16), den: t.readBits(16) };
        else {
          const R = di[N];
          R && (M = R);
        }
      }
      t.readBits(1) && t.skipBits(1), t.readBits(1) && (t.skipBits(3), A = t.readBits(1), t.readBits(1) && (_ = t.readBits(8), T = t.readBits(8), k = t.readBits(8))), t.readBits(1) && (x(t), x(t)), t.readBits(1) && (t.skipBits(32), t.skipBits(32), t.skipBits(1));
      const F = t.readBits(1);
      F && ur(t);
      const V = t.readBits(1);
      V && ur(t), (F || V) && t.skipBits(1), t.skipBits(1), t.readBits(1) && (t.skipBits(1), x(t), x(t), x(t), x(t), B = x(t), P = x(t));
    }
    if (B === null)
      if (f(P === null), e !== 44 && e !== 86 && e !== 100 && e !== 110 && e !== 122 && e !== 244 || !(16 & i)) {
        const F = c + 1, V = (2 - v) * (h + 1), N = ee.find(($) => $.level >= a) ?? ot(ee), R = Math.min(Math.floor(N.maxDpbMbs / (F * V)), 16);
        B = R, P = R;
      } else B = 0, P = 0;
    return f(P !== null), { profileIdc: e, constraintFlags: i, levelIdc: a, frameMbsOnlyFlag: v, chromaFormatIdc: o, bitDepthLumaMinus8: s, bitDepthChromaMinus8: n, codedWidth: u, codedHeight: m, displayWidth: w, displayHeight: p, pixelAspectRatio: M, colourPrimaries: _, matrixCoefficients: k, transferCharacteristics: T, fullRangeFlag: A, numReorderFrames: B, maxDecFrameBuffering: P };
  } catch (t) {
    return console.error("Error parsing AVC SPS:", t), null;
  }
}, ur = (r) => {
  const t = x(r);
  r.skipBits(4), r.skipBits(4);
  for (let e = 0; e <= t; e++) x(r), x(r), r.skipBits(1);
  r.skipBits(5), r.skipBits(5), r.skipBits(5), r.skipBits(5);
}, za = (r, t) => {
  if (t.description) {
    const e = 3 & q(t.description)[21];
    return ni(r, e + 1);
  }
  return zt(r);
}, Te = (r) => r >> 1 & 63, Ha = (r) => {
  try {
    const t = new j(ne(r));
    t.skipBits(16), t.readBits(4);
    const e = t.readBits(3), i = t.readBits(1), { general_profile_space: a, general_tier_flag: o, general_profile_idc: s, general_profile_compatibility_flags: n, general_constraint_indicator_flags: d, general_level_idc: l } = Ga(t, e);
    x(t);
    const c = x(t);
    let h = 0;
    c === 3 && (h = t.readBits(1));
    const u = x(t), m = x(t);
    let w = u, p = m;
    if (t.readBits(1)) {
      const R = x(t), $ = x(t), D = x(t), nt = x(t);
      let z = 1, X = 1;
      const Mt = h === 0 ? c : 0;
      Mt === 1 ? (z = 2, X = 2) : Mt === 2 && (z = 2, X = 1), w -= (R + $) * z, p -= (D + nt) * X;
    }
    const v = x(t), _ = x(t);
    x(t);
    const T = t.readBits(1);
    let k = 0;
    for (let R = T ? 0 : e; R <= e; R++) x(t), k = x(t), x(t);
    x(t), x(t), x(t), x(t), x(t), x(t), t.readBits(1) && t.readBits(1) && qa(t), t.skipBits(1), t.skipBits(1), t.readBits(1) && (t.skipBits(4), t.skipBits(4), x(t), x(t), t.skipBits(1));
    const A = x(t);
    if (Xa(t, A), t.readBits(1)) {
      const R = x(t);
      for (let $ = 0; $ < R; $++) x(t), t.skipBits(1);
    }
    t.skipBits(1), t.skipBits(1);
    let M = 2, B = 2, P = 2, F = 0, V = 0, N = { num: 1, den: 1 };
    if (t.readBits(1)) {
      const R = Ya(t, e);
      N = R.pixelAspectRatio, M = R.colourPrimaries, B = R.transferCharacteristics, P = R.matrixCoefficients, F = R.fullRangeFlag, V = R.minSpatialSegmentationIdc;
    }
    return { displayWidth: w, displayHeight: p, pixelAspectRatio: N, colourPrimaries: M, transferCharacteristics: B, matrixCoefficients: P, fullRangeFlag: F, maxDecFrameBuffering: k + 1, spsMaxSubLayersMinus1: e, spsTemporalIdNestingFlag: i, generalProfileSpace: a, generalTierFlag: o, generalProfileIdc: s, generalProfileCompatibilityFlags: n, generalConstraintIndicatorFlags: d, generalLevelIdc: l, chromaFormatIdc: c, bitDepthLumaMinus8: v, bitDepthChromaMinus8: _, minSpatialSegmentationIdc: V };
  } catch (t) {
    return console.error("Error parsing HEVC SPS:", t), null;
  }
}, ja = (r) => {
  try {
    const t = [], e = [], i = [], a = [];
    for (const d of zt(r)) {
      const l = r.subarray(d.offset, d.offset + d.length), c = Te(l[0]);
      c === Q.VPS_NUT ? t.push(l) : c === Q.SPS_NUT ? e.push(l) : c === Q.PPS_NUT ? i.push(l) : c !== Q.PREFIX_SEI_NUT && c !== Q.SUFFIX_SEI_NUT || a.push(l);
    }
    if (e.length === 0 || i.length === 0) return null;
    const o = Ha(e[0]);
    if (!o) return null;
    let s = 0;
    if (i.length > 0) {
      const d = i[0], l = new j(ne(d));
      l.skipBits(16), x(l), x(l), l.skipBits(1), l.skipBits(1), l.skipBits(3), l.skipBits(1), l.skipBits(1), x(l), x(l), lt(l), l.skipBits(1), l.skipBits(1), l.readBits(1) && x(l), lt(l), lt(l), l.skipBits(1), l.skipBits(1), l.skipBits(1), l.skipBits(1);
      const c = l.readBits(1), h = l.readBits(1);
      s = c || h ? c && !h ? 2 : !c && h ? 3 : 0 : 0;
    }
    const n = [...t.length ? [{ arrayCompleteness: 1, nalUnitType: Q.VPS_NUT, nalUnits: t }] : [], ...e.length ? [{ arrayCompleteness: 1, nalUnitType: Q.SPS_NUT, nalUnits: e }] : [], ...i.length ? [{ arrayCompleteness: 1, nalUnitType: Q.PPS_NUT, nalUnits: i }] : [], ...a.length ? [{ arrayCompleteness: 1, nalUnitType: Te(a[0][0]), nalUnits: a }] : []];
    return { configurationVersion: 1, generalProfileSpace: o.generalProfileSpace, generalTierFlag: o.generalTierFlag, generalProfileIdc: o.generalProfileIdc, generalProfileCompatibilityFlags: o.generalProfileCompatibilityFlags, generalConstraintIndicatorFlags: o.generalConstraintIndicatorFlags, generalLevelIdc: o.generalLevelIdc, minSpatialSegmentationIdc: o.minSpatialSegmentationIdc, parallelismType: s, chromaFormatIdc: o.chromaFormatIdc, bitDepthLumaMinus8: o.bitDepthLumaMinus8, bitDepthChromaMinus8: o.bitDepthChromaMinus8, avgFrameRate: 0, constantFrameRate: 0, numTemporalLayers: o.spsMaxSubLayersMinus1 + 1, temporalIdNested: o.spsTemporalIdNestingFlag, lengthSizeMinusOne: 3, arrays: n };
  } catch (t) {
    return console.error("Error building HEVC Decoder Configuration Record:", t), null;
  }
}, Ga = (r, t) => {
  const e = r.readBits(2), i = r.readBits(1), a = r.readBits(5);
  let o = 0;
  for (let c = 0; c < 32; c++) o = o << 1 | r.readBits(1);
  const s = new Uint8Array(6);
  for (let c = 0; c < 6; c++) s[c] = r.readBits(8);
  const n = r.readBits(8), d = [], l = [];
  for (let c = 0; c < t; c++) d.push(r.readBits(1)), l.push(r.readBits(1));
  if (t > 0) for (let c = t; c < 8; c++) r.skipBits(2);
  for (let c = 0; c < t; c++) d[c] && r.skipBits(88), l[c] && r.skipBits(8);
  return { general_profile_space: e, general_tier_flag: i, general_profile_idc: a, general_profile_compatibility_flags: o, general_constraint_indicator_flags: s, general_level_idc: n };
}, qa = (r) => {
  for (let t = 0; t < 4; t++) for (let e = 0; e < (t === 3 ? 2 : 6); e++)
    if (r.readBits(1)) {
      const i = Math.min(64, 1 << 4 + (t << 1));
      t > 1 && lt(r);
      for (let a = 0; a < i; a++) lt(r);
    } else x(r);
}, Xa = (r, t) => {
  const e = [];
  for (let i = 0; i < t; i++) e[i] = Qa(r, i, t, e);
}, Qa = (r, t, e, i) => {
  let a = 0, o = 0, s = 0;
  if (t !== 0 && (o = r.readBits(1)), o) {
    t === e ? s = t - (x(r) + 1) : s = t - 1, r.readBits(1), x(r);
    const n = i[s] ?? 0;
    for (let d = 0; d <= n; d++)
      r.readBits(1) || r.readBits(1);
    a = i[s];
  } else {
    const n = x(r), d = x(r);
    for (let l = 0; l < n; l++) x(r), r.readBits(1);
    for (let l = 0; l < d; l++) x(r), r.readBits(1);
    a = n + d;
  }
  return a;
}, Ya = (r, t) => {
  let e = 2, i = 2, a = 2, o = 0, s = 0, n = { num: 1, den: 1 };
  if (r.readBits(1)) {
    const d = r.readBits(8);
    if (d === 255) n = { num: r.readBits(16), den: r.readBits(16) };
    else {
      const l = di[d];
      l && (n = l);
    }
  }
  return r.readBits(1) && r.readBits(1), r.readBits(1) && (r.readBits(3), o = r.readBits(1), r.readBits(1) && (e = r.readBits(8), i = r.readBits(8), a = r.readBits(8))), r.readBits(1) && (x(r), x(r)), r.readBits(1), r.readBits(1), r.readBits(1), r.readBits(1) && (x(r), x(r), x(r), x(r)), r.readBits(1) && (r.readBits(32), r.readBits(32), r.readBits(1) && x(r), r.readBits(1) && Ka(r, !0, t)), r.readBits(1) && (r.readBits(1), r.readBits(1), r.readBits(1), s = x(r), x(r), x(r), x(r), x(r)), { pixelAspectRatio: n, colourPrimaries: e, transferCharacteristics: i, matrixCoefficients: a, fullRangeFlag: o, minSpatialSegmentationIdc: s };
}, Ka = (r, t, e) => {
  let i = !1, a = !1, o = !1;
  i = r.readBits(1) === 1, a = r.readBits(1) === 1, (i || a) && (o = r.readBits(1) === 1, o && (r.readBits(8), r.readBits(5), r.readBits(1), r.readBits(5)), r.readBits(4), r.readBits(4), o && r.readBits(4), r.readBits(5), r.readBits(5), r.readBits(5));
  for (let s = 0; s <= e; s++) {
    let n = !0;
    r.readBits(1) === 1 || (n = r.readBits(1) === 1);
    let d = !1;
    n ? x(r) : d = r.readBits(1) === 1;
    let l = 1;
    d || (l = x(r) + 1), i && mr(r, l, o), a && mr(r, l, o);
  }
}, mr = (r, t, e) => {
  for (let i = 0; i < t; i++) x(r), x(r), e && (x(r), x(r)), r.readBits(1);
}, Ja = (r) => {
  const t = [];
  t.push(r.configurationVersion), t.push((3 & r.generalProfileSpace) << 6 | (1 & r.generalTierFlag) << 5 | 31 & r.generalProfileIdc), t.push(r.generalProfileCompatibilityFlags >>> 24 & 255), t.push(r.generalProfileCompatibilityFlags >>> 16 & 255), t.push(r.generalProfileCompatibilityFlags >>> 8 & 255), t.push(255 & r.generalProfileCompatibilityFlags), t.push(...r.generalConstraintIndicatorFlags), t.push(255 & r.generalLevelIdc), t.push(240 | r.minSpatialSegmentationIdc >> 8 & 15), t.push(255 & r.minSpatialSegmentationIdc), t.push(252 | 3 & r.parallelismType), t.push(252 | 3 & r.chromaFormatIdc), t.push(248 | 7 & r.bitDepthLumaMinus8), t.push(248 | 7 & r.bitDepthChromaMinus8), t.push(r.avgFrameRate >> 8 & 255), t.push(255 & r.avgFrameRate), t.push((3 & r.constantFrameRate) << 6 | (7 & r.numTemporalLayers) << 3 | (1 & r.temporalIdNested) << 2 | 3 & r.lengthSizeMinusOne), t.push(255 & r.arrays.length);
  for (const e of r.arrays) {
    t.push((1 & e.arrayCompleteness) << 7 | 63 & e.nalUnitType), t.push(e.nalUnits.length >> 8 & 255), t.push(255 & e.nalUnits.length);
    for (const i of e.nalUnits) {
      t.push(i.length >> 8 & 255), t.push(255 & i.length);
      for (let a = 0; a < i.length; a++) t.push(i[a]);
    }
  }
  return new Uint8Array(t);
};
var pr;
(function(r) {
  r[r.audAllowed = 0] = "audAllowed", r[r.beforeFirstVcl = 1] = "beforeFirstVcl", r[r.afterFirstVcl = 2] = "afterFirstVcl", r[r.eoBitstreamAllowed = 3] = "eoBitstreamAllowed", r[r.noMoreDataAllowed = 4] = "noMoreDataAllowed";
})(pr || (pr = {}));
const Za = function* (r) {
  const t = new j(r), e = () => {
    let i = 0;
    for (let a = 0; a < 8; a++) {
      const o = t.readAlignedByte();
      if (i |= (127 & o) << 7 * a, !(128 & o)) break;
      if (a === 7 && 128 & o) return null;
    }
    return i >= 2 ** 32 - 1 ? null : i;
  };
  for (; t.getBitsLeft() >= 8; ) {
    t.skipBits(1);
    const i = t.readBits(4), a = t.readBits(1), o = t.readBits(1);
    let s;
    if (t.skipBits(1), a && t.skipBits(8), o) {
      const n = e();
      if (n === null) return;
      s = n;
    } else s = Math.floor(t.getBitsLeft() / 8);
    f(t.pos % 8 == 0), yield { type: i, data: r.subarray(t.pos / 8, t.pos / 8 + s) }, t.skipBits(8 * s);
  }
}, li = (r) => {
  const t = Xr(r), e = t.getUint8(9), i = t.getUint16(10, !0), a = t.getUint32(12, !0), o = t.getInt16(16, !0), s = t.getUint8(18);
  let n = null;
  return s && (n = r.subarray(19, 21 + e)), { outputChannelCount: e, preSkip: i, inputSampleRate: a, outputGain: o, channelMappingFamily: s, channelMappingTable: n };
}, to = (r, t, e) => {
  switch (r) {
    case "avc":
      for (const i of Oa(e, t)) {
        const a = e[i.offset], o = ci(a);
        if (o >= ht.NON_IDR_SLICE && o <= ht.SLICE_DPC) return "delta";
        if (o === ht.IDR) return "key";
        if (o === ht.SEI && (!wa() || ya() >= 144)) {
          const s = e.subarray(i.offset, i.offset + i.length), n = ne(s);
          let d = 1;
          do {
            let l = 0;
            for (; ; ) {
              const h = n[d++];
              if (h === void 0 || (l += h, h < 255)) break;
            }
            let c = 0;
            for (; ; ) {
              const h = n[d++];
              if (h === void 0 || (c += h, h < 255)) break;
            }
            if (l === 6) {
              const h = new j(n);
              h.pos = 8 * d;
              const u = x(h), m = h.readBits(1);
              if (u === 0 && m === 1) return "key";
            }
            d += c;
          } while (d < n.length - 1);
        }
      }
      return "delta";
    case "hevc":
      for (const i of za(e, t)) {
        const a = Te(e[i.offset]);
        if (a < Q.BLA_W_LP) return "delta";
        if (a <= Q.RSV_IRAP_VCL23) return "key";
      }
      return "delta";
    case "vp8":
      return (1 & e[0]) === 0 ? "key" : "delta";
    case "vp9": {
      const i = new j(e);
      if (i.readBits(2) !== 2) return null;
      const a = i.readBits(1);
      return (i.readBits(1) << 1) + a === 3 && i.skipBits(1), i.readBits(1) ? null : i.readBits(1) === 0 ? "key" : "delta";
    }
    case "av1": {
      let i = !1;
      for (const { type: a, data: o } of Za(e)) if (a === 1) {
        const s = new j(o);
        s.skipBits(4), i = !!s.readBits(1);
      } else if (a === 3 || a === 6 || a === 7) {
        if (i) return "key";
        const s = new j(o);
        return s.readBits(1) ? null : s.readBits(2) === 0 ? "key" : "delta";
      }
      return null;
    }
    default:
      It(r), f(!1);
  }
};
var fr;
(function(r) {
  r[r.STREAMINFO = 0] = "STREAMINFO", r[r.VORBIS_COMMENT = 4] = "VORBIS_COMMENT", r[r.PICTURE = 6] = "PICTURE";
})(fr || (fr = {}));
const eo = (r) => {
  if (r.length < 7 || r[0] !== 11 || r[1] !== 119) return null;
  const t = new j(r);
  t.skipBits(16), t.skipBits(16);
  const e = t.readBits(2);
  if (e === 3) return null;
  const i = t.readBits(6), a = t.readBits(5);
  if (a > 8) return null;
  const o = t.readBits(3), s = t.readBits(3);
  return 1 & s && s !== 1 && t.skipBits(2), 4 & s && t.skipBits(2), s === 2 && t.skipBits(2), { fscod: e, bsid: a, bsmod: o, acmod: s, lfeon: t.readBits(1), bitRateCode: Math.floor(i / 2) };
}, ro = [1, 2, 3, 6], io = (r) => {
  if (r.length < 6 || r[0] !== 11 || r[1] !== 119) return null;
  const t = new j(r);
  t.skipBits(16);
  const e = t.readBits(2);
  if (t.skipBits(3), e !== 0 && e !== 2) return null;
  const i = t.readBits(11), a = t.readBits(2);
  let o, s = 0;
  a === 3 ? (s = t.readBits(2), o = 3) : o = t.readBits(2);
  const n = t.readBits(3), d = t.readBits(1), l = t.readBits(5);
  if (l < 11 || l > 16) return null;
  const c = ro[o];
  let h;
  return h = a < 3 ? La[a] / 1e3 : Va[s] / 1e3, { dataRate: Math.round((i + 1) * h / (16 * c)), substreams: [{ fscod: a, fscod2: s, bsid: l, bsmod: 0, acmod: n, lfeon: d, numDepSub: 0, chanLoc: 0 }] };
}, gr = new Uint8Array(0);
class Vt {
  constructor(t, e, i, a, o = -1, s, n) {
    if (this.data = t, this.type = e, this.timestamp = i, this.duration = a, this.sequenceNumber = o, t === gr && s === void 0) throw new Error("Internal error: byteLength must be explicitly provided when constructing metadata-only packets.");
    if (s === void 0 && (s = t.byteLength), !(t instanceof Uint8Array)) throw new TypeError("data must be a Uint8Array.");
    if (e !== "key" && e !== "delta") throw new TypeError('type must be either "key" or "delta".');
    if (!Number.isFinite(i)) throw new TypeError("timestamp must be a number.");
    if (!Number.isFinite(a) || a < 0) throw new TypeError("duration must be a non-negative number.");
    if (!Number.isFinite(o)) throw new TypeError("sequenceNumber must be a number.");
    if (!Number.isInteger(s) || s < 0) throw new TypeError("byteLength must be a non-negative integer.");
    if (n !== void 0 && (typeof n != "object" || !n)) throw new TypeError("sideData, when provided, must be an object.");
    if ((n == null ? void 0 : n.alpha) !== void 0 && !(n.alpha instanceof Uint8Array)) throw new TypeError("sideData.alpha, when provided, must be a Uint8Array.");
    if ((n == null ? void 0 : n.alphaByteLength) !== void 0 && (!Number.isInteger(n.alphaByteLength) || n.alphaByteLength < 0)) throw new TypeError("sideData.alphaByteLength, when provided, must be a non-negative integer.");
    this.byteLength = s, this.sideData = n ?? {}, this.sideData.alpha && this.sideData.alphaByteLength === void 0 && (this.sideData.alphaByteLength = this.sideData.alpha.byteLength);
  }
  get isMetadataOnly() {
    return this.data === gr;
  }
  get microsecondTimestamp() {
    return Math.trunc(Et * this.timestamp);
  }
  get microsecondDuration() {
    return Math.trunc(Et * this.duration);
  }
  toEncodedVideoChunk() {
    if (this.isMetadataOnly) throw new TypeError("Metadata-only packets cannot be converted to a video chunk.");
    if (typeof EncodedVideoChunk > "u") throw new Error("Your browser does not support EncodedVideoChunk.");
    return new EncodedVideoChunk({ data: this.data, type: this.type, timestamp: this.microsecondTimestamp, duration: this.microsecondDuration });
  }
  alphaToEncodedVideoChunk(t = this.type) {
    if (!this.sideData.alpha) throw new TypeError("This packet does not contain alpha side data.");
    if (this.isMetadataOnly) throw new TypeError("Metadata-only packets cannot be converted to a video chunk.");
    if (typeof EncodedVideoChunk > "u") throw new Error("Your browser does not support EncodedVideoChunk.");
    return new EncodedVideoChunk({ data: this.sideData.alpha, type: t, timestamp: this.microsecondTimestamp, duration: this.microsecondDuration });
  }
  toEncodedAudioChunk() {
    if (this.isMetadataOnly) throw new TypeError("Metadata-only packets cannot be converted to an audio chunk.");
    if (typeof EncodedAudioChunk > "u") throw new Error("Your browser does not support EncodedAudioChunk.");
    return new EncodedAudioChunk({ data: this.data, type: this.type, timestamp: this.microsecondTimestamp, duration: this.microsecondDuration });
  }
  static fromEncodedChunk(t, e) {
    if (!(t instanceof EncodedVideoChunk || t instanceof EncodedAudioChunk)) throw new TypeError("chunk must be an EncodedVideoChunk or EncodedAudioChunk.");
    const i = new Uint8Array(t.byteLength);
    return t.copyTo(i), new Vt(i, t.type, t.timestamp / 1e6, (t.duration ?? 0) / 1e6, void 0, void 0, e);
  }
  clone(t) {
    if (t !== void 0 && (typeof t != "object" || t === null)) throw new TypeError("options, when provided, must be an object.");
    if ((t == null ? void 0 : t.data) !== void 0 && !(t.data instanceof Uint8Array)) throw new TypeError("options.data, when provided, must be a Uint8Array.");
    if ((t == null ? void 0 : t.type) !== void 0 && t.type !== "key" && t.type !== "delta") throw new TypeError('options.type, when provided, must be either "key" or "delta".');
    if ((t == null ? void 0 : t.timestamp) !== void 0 && !Number.isFinite(t.timestamp)) throw new TypeError("options.timestamp, when provided, must be a number.");
    if ((t == null ? void 0 : t.duration) !== void 0 && !Number.isFinite(t.duration)) throw new TypeError("options.duration, when provided, must be a number.");
    if ((t == null ? void 0 : t.sequenceNumber) !== void 0 && !Number.isFinite(t.sequenceNumber)) throw new TypeError("options.sequenceNumber, when provided, must be a number.");
    if ((t == null ? void 0 : t.sideData) !== void 0 && (typeof t.sideData != "object" || t.sideData === null)) throw new TypeError("options.sideData, when provided, must be an object.");
    return new Vt((t == null ? void 0 : t.data) ?? this.data, (t == null ? void 0 : t.type) ?? this.type, (t == null ? void 0 : t.timestamp) ?? this.timestamp, (t == null ? void 0 : t.duration) ?? this.duration, (t == null ? void 0 : t.sequenceNumber) ?? this.sequenceNumber, this.byteLength, (t == null ? void 0 : t.sideData) ?? this.sideData);
  }
}
const ao = (r) => {
  let t = (r.hasVideo ? "video/" : r.hasAudio ? "audio/" : "application/") + (r.isQuickTime ? "quicktime" : "mp4");
  return r.codecStrings.length > 0 && (t += `; codecs="${[...new Set(r.codecStrings)].join(", ")}"`), t;
};
class ke {
  constructor(t) {
    this.value = t;
  }
}
class Ce {
  constructor(t) {
    this.value = t;
  }
}
class hi {
  constructor(t) {
    this.value = t;
  }
}
class pt {
  constructor(t) {
    this.value = t;
  }
}
var y;
(function(r) {
  r[r.EBML = 440786851] = "EBML", r[r.EBMLVersion = 17030] = "EBMLVersion", r[r.EBMLReadVersion = 17143] = "EBMLReadVersion", r[r.EBMLMaxIDLength = 17138] = "EBMLMaxIDLength", r[r.EBMLMaxSizeLength = 17139] = "EBMLMaxSizeLength", r[r.DocType = 17026] = "DocType", r[r.DocTypeVersion = 17031] = "DocTypeVersion", r[r.DocTypeReadVersion = 17029] = "DocTypeReadVersion", r[r.Void = 236] = "Void", r[r.Segment = 408125543] = "Segment", r[r.SeekHead = 290298740] = "SeekHead", r[r.Seek = 19899] = "Seek", r[r.SeekID = 21419] = "SeekID", r[r.SeekPosition = 21420] = "SeekPosition", r[r.Duration = 17545] = "Duration", r[r.Info = 357149030] = "Info", r[r.TimestampScale = 2807729] = "TimestampScale", r[r.MuxingApp = 19840] = "MuxingApp", r[r.WritingApp = 22337] = "WritingApp", r[r.Tracks = 374648427] = "Tracks", r[r.TrackEntry = 174] = "TrackEntry", r[r.TrackNumber = 215] = "TrackNumber", r[r.TrackUID = 29637] = "TrackUID", r[r.TrackType = 131] = "TrackType", r[r.FlagEnabled = 185] = "FlagEnabled", r[r.FlagDefault = 136] = "FlagDefault", r[r.FlagForced = 21930] = "FlagForced", r[r.FlagOriginal = 21934] = "FlagOriginal", r[r.FlagHearingImpaired = 21931] = "FlagHearingImpaired", r[r.FlagVisualImpaired = 21932] = "FlagVisualImpaired", r[r.FlagCommentary = 21935] = "FlagCommentary", r[r.FlagLacing = 156] = "FlagLacing", r[r.Name = 21358] = "Name", r[r.Language = 2274716] = "Language", r[r.LanguageBCP47 = 2274717] = "LanguageBCP47", r[r.CodecID = 134] = "CodecID", r[r.CodecPrivate = 25506] = "CodecPrivate", r[r.CodecDelay = 22186] = "CodecDelay", r[r.SeekPreRoll = 22203] = "SeekPreRoll", r[r.DefaultDuration = 2352003] = "DefaultDuration", r[r.Video = 224] = "Video", r[r.PixelWidth = 176] = "PixelWidth", r[r.PixelHeight = 186] = "PixelHeight", r[r.DisplayWidth = 21680] = "DisplayWidth", r[r.DisplayHeight = 21690] = "DisplayHeight", r[r.DisplayUnit = 21682] = "DisplayUnit", r[r.AlphaMode = 21440] = "AlphaMode", r[r.Audio = 225] = "Audio", r[r.SamplingFrequency = 181] = "SamplingFrequency", r[r.Channels = 159] = "Channels", r[r.BitDepth = 25188] = "BitDepth", r[r.SimpleBlock = 163] = "SimpleBlock", r[r.BlockGroup = 160] = "BlockGroup", r[r.Block = 161] = "Block", r[r.BlockAdditions = 30113] = "BlockAdditions", r[r.BlockMore = 166] = "BlockMore", r[r.BlockAdditional = 165] = "BlockAdditional", r[r.BlockAddID = 238] = "BlockAddID", r[r.BlockDuration = 155] = "BlockDuration", r[r.ReferenceBlock = 251] = "ReferenceBlock", r[r.Cluster = 524531317] = "Cluster", r[r.Timestamp = 231] = "Timestamp", r[r.Cues = 475249515] = "Cues", r[r.CuePoint = 187] = "CuePoint", r[r.CueTime = 179] = "CueTime", r[r.CueTrackPositions = 183] = "CueTrackPositions", r[r.CueTrack = 247] = "CueTrack", r[r.CueClusterPosition = 241] = "CueClusterPosition", r[r.Colour = 21936] = "Colour", r[r.MatrixCoefficients = 21937] = "MatrixCoefficients", r[r.TransferCharacteristics = 21946] = "TransferCharacteristics", r[r.Primaries = 21947] = "Primaries", r[r.Range = 21945] = "Range", r[r.Projection = 30320] = "Projection", r[r.ProjectionType = 30321] = "ProjectionType", r[r.ProjectionPoseRoll = 30325] = "ProjectionPoseRoll", r[r.Attachments = 423732329] = "Attachments", r[r.AttachedFile = 24999] = "AttachedFile", r[r.FileDescription = 18046] = "FileDescription", r[r.FileName = 18030] = "FileName", r[r.FileMediaType = 18016] = "FileMediaType", r[r.FileData = 18012] = "FileData", r[r.FileUID = 18094] = "FileUID", r[r.Chapters = 272869232] = "Chapters", r[r.Tags = 307544935] = "Tags", r[r.Tag = 29555] = "Tag", r[r.Targets = 25536] = "Targets", r[r.TargetTypeValue = 26826] = "TargetTypeValue", r[r.TargetType = 25546] = "TargetType", r[r.TagTrackUID = 25541] = "TagTrackUID", r[r.TagEditionUID = 25545] = "TagEditionUID", r[r.TagChapterUID = 25540] = "TagChapterUID", r[r.TagAttachmentUID = 25542] = "TagAttachmentUID", r[r.SimpleTag = 26568] = "SimpleTag", r[r.TagName = 17827] = "TagName", r[r.TagLanguage = 17530] = "TagLanguage", r[r.TagString = 17543] = "TagString", r[r.TagBinary = 17541] = "TagBinary", r[r.ContentEncodings = 28032] = "ContentEncodings", r[r.ContentEncoding = 25152] = "ContentEncoding", r[r.ContentEncodingOrder = 20529] = "ContentEncodingOrder", r[r.ContentEncodingScope = 20530] = "ContentEncodingScope", r[r.ContentCompression = 20532] = "ContentCompression", r[r.ContentCompAlgo = 16980] = "ContentCompAlgo", r[r.ContentCompSettings = 16981] = "ContentCompSettings", r[r.ContentEncryption = 20533] = "ContentEncryption";
})(y || (y = {}));
const wr = (r) => r < 256 ? 1 : r < 65536 ? 2 : r < 1 << 24 ? 3 : r < 2 ** 32 ? 4 : r < 2 ** 40 ? 5 : 6, yr = (r) => r < 256n ? 1 : r < 65536n ? 2 : r < 1n << 24n ? 3 : r < 1n << 32n ? 4 : r < 1n << 40n ? 5 : r < 1n << 48n ? 6 : r < 1n << 56n ? 7 : 8, br = (r) => r >= -64 && r < 64 ? 1 : r >= -8192 && r < 8192 ? 2 : r >= -1048576 && r < 1 << 20 ? 3 : r >= -134217728 && r < 1 << 27 ? 4 : r >= -17179869184 && r < 2 ** 34 ? 5 : 6, oo = (r) => {
  if (r < 127) return 1;
  if (r < 16383) return 2;
  if (r < 2097151) return 3;
  if (r < 268435455) return 4;
  if (r < 2 ** 35 - 1) return 5;
  if (r < 2 ** 42 - 1) return 6;
  throw new Error("EBML varint size not supported " + r);
};
class so {
  constructor(t) {
    this.writer = t, this.helper = new Uint8Array(8), this.helperView = new DataView(this.helper.buffer), this.offsets = /* @__PURE__ */ new WeakMap(), this.dataOffsets = /* @__PURE__ */ new WeakMap();
  }
  writeByte(t) {
    this.helperView.setUint8(0, t), this.writer.write(this.helper.subarray(0, 1));
  }
  writeFloat32(t) {
    this.helperView.setFloat32(0, t, !1), this.writer.write(this.helper.subarray(0, 4));
  }
  writeFloat64(t) {
    this.helperView.setFloat64(0, t, !1), this.writer.write(this.helper);
  }
  writeUnsignedInt(t, e = wr(t)) {
    let i = 0;
    switch (e) {
      case 6:
        this.helperView.setUint8(i++, t / 2 ** 40 | 0);
      case 5:
        this.helperView.setUint8(i++, t / 2 ** 32 | 0);
      case 4:
        this.helperView.setUint8(i++, t >> 24);
      case 3:
        this.helperView.setUint8(i++, t >> 16);
      case 2:
        this.helperView.setUint8(i++, t >> 8);
      case 1:
        this.helperView.setUint8(i++, t);
        break;
      default:
        throw new Error("Bad unsigned int size " + e);
    }
    this.writer.write(this.helper.subarray(0, i));
  }
  writeUnsignedBigInt(t, e = yr(t)) {
    let i = 0;
    for (let a = e - 1; a >= 0; a--) this.helperView.setUint8(i++, Number(t >> BigInt(8 * a) & 0xffn));
    this.writer.write(this.helper.subarray(0, i));
  }
  writeSignedInt(t, e = br(t)) {
    t < 0 && (t += 2 ** (8 * e)), this.writeUnsignedInt(t, e);
  }
  writeVarInt(t, e = oo(t)) {
    let i = 0;
    switch (e) {
      case 1:
        this.helperView.setUint8(i++, 128 | t);
        break;
      case 2:
        this.helperView.setUint8(i++, 64 | t >> 8), this.helperView.setUint8(i++, t);
        break;
      case 3:
        this.helperView.setUint8(i++, 32 | t >> 16), this.helperView.setUint8(i++, t >> 8), this.helperView.setUint8(i++, t);
        break;
      case 4:
        this.helperView.setUint8(i++, 16 | t >> 24), this.helperView.setUint8(i++, t >> 16), this.helperView.setUint8(i++, t >> 8), this.helperView.setUint8(i++, t);
        break;
      case 5:
        this.helperView.setUint8(i++, 8 | t / 2 ** 32 & 7), this.helperView.setUint8(i++, t >> 24), this.helperView.setUint8(i++, t >> 16), this.helperView.setUint8(i++, t >> 8), this.helperView.setUint8(i++, t);
        break;
      case 6:
        this.helperView.setUint8(i++, 4 | t / 2 ** 40 & 3), this.helperView.setUint8(i++, t / 2 ** 32 | 0), this.helperView.setUint8(i++, t >> 24), this.helperView.setUint8(i++, t >> 16), this.helperView.setUint8(i++, t >> 8), this.helperView.setUint8(i++, t);
        break;
      default:
        throw new Error("Bad EBML varint size " + e);
    }
    this.writer.write(this.helper.subarray(0, i));
  }
  writeAsciiString(t) {
    this.writer.write(new Uint8Array(t.split("").map((e) => e.charCodeAt(0))));
  }
  writeEBML(t) {
    if (t !== null) if (t instanceof Uint8Array) this.writer.write(t);
    else if (Array.isArray(t)) for (const e of t) this.writeEBML(e);
    else if (this.offsets.set(t, this.writer.getPos()), this.writeUnsignedInt(t.id), Array.isArray(t.data)) {
      const e = this.writer.getPos(), i = t.size === -1 ? 1 : t.size ?? 4;
      t.size === -1 ? this.writeByte(255) : this.writer.seek(this.writer.getPos() + i);
      const a = this.writer.getPos();
      if (this.dataOffsets.set(t, a), this.writeEBML(t.data), t.size !== -1) {
        const o = this.writer.getPos() - a, s = this.writer.getPos();
        this.writer.seek(e), this.writeVarInt(o, i), this.writer.seek(s);
      }
    } else if (typeof t.data == "number") {
      const e = t.size ?? wr(t.data);
      this.writeVarInt(e), this.writeUnsignedInt(t.data, e);
    } else if (typeof t.data == "bigint") {
      const e = t.size ?? yr(t.data);
      this.writeVarInt(e), this.writeUnsignedBigInt(t.data, e);
    } else if (typeof t.data == "string") this.writeVarInt(t.data.length), this.writeAsciiString(t.data);
    else if (t.data instanceof Uint8Array) this.writeVarInt(t.data.byteLength, t.size), this.writer.write(t.data);
    else if (t.data instanceof ke) this.writeVarInt(4), this.writeFloat32(t.data.value);
    else if (t.data instanceof Ce) this.writeVarInt(8), this.writeFloat64(t.data.value);
    else if (t.data instanceof hi) {
      const e = t.size ?? br(t.data.value);
      this.writeVarInt(e), this.writeSignedInt(t.data.value, e);
    } else if (t.data instanceof pt) {
      const e = G.encode(t.data.value);
      this.writeVarInt(e.length), this.writer.write(e);
    } else It(t.data);
  }
}
const no = { avc: "V_MPEG4/ISO/AVC", hevc: "V_MPEGH/ISO/HEVC", vp8: "V_VP8", vp9: "V_VP9", av1: "V_AV1", aac: "A_AAC", mp3: "A_MPEG/L3", opus: "A_OPUS", vorbis: "A_VORBIS", flac: "A_FLAC", ac3: "A_AC3", eac3: "A_EAC3", "pcm-u8": "A_PCM/INT/LIT", "pcm-s16": "A_PCM/INT/LIT", "pcm-s16be": "A_PCM/INT/BIG", "pcm-s24": "A_PCM/INT/LIT", "pcm-s24be": "A_PCM/INT/BIG", "pcm-s32": "A_PCM/INT/LIT", "pcm-s32be": "A_PCM/INT/BIG", "pcm-f32": "A_PCM/FLOAT/IEEE", "pcm-f64": "A_PCM/FLOAT/IEEE", webvtt: "S_TEXT/WEBVTT" }, co = (r) => {
  let t = (r.hasVideo ? "video/" : r.hasAudio ? "audio/" : "application/") + (r.isWebM ? "webm" : "x-matroska");
  return r.codecStrings.length > 0 && (t += `; codecs="${[...new Set(r.codecStrings.filter(Boolean))].join(", ")}"`), t;
};
const re = (r) => {
  const t = r.filePos, e = To(r, 9), i = new j(e);
  if (i.readBits(12) !== 4095 || (i.skipBits(1), i.readBits(2) !== 0)) return null;
  const a = i.readBits(1), o = i.readBits(2) + 1, s = i.readBits(4);
  if (s === 15) return null;
  i.skipBits(1);
  const n = i.readBits(3);
  if (n === 0) throw new Error("ADTS frames with channel configuration 0 are not supported.");
  i.skipBits(1), i.skipBits(1), i.skipBits(1), i.skipBits(1);
  const d = i.readBits(13);
  i.skipBits(11);
  const l = i.readBits(2) + 1;
  if (l !== 1) throw new Error("ADTS frames with more than one AAC frame are not supported.");
  let c = null;
  return a === 1 ? r.filePos -= 2 : c = i.readBits(16), { objectType: o, samplingFrequencyIndex: s, channelConfiguration: n, frameLength: d, numberOfAacFrames: l, crcCheck: c, startPos: t };
};
var lo = function(r, t, e) {
  if (t != null) {
    if (typeof t != "object" && typeof t != "function") throw new TypeError("Object expected.");
    var i, a;
    if (e) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      i = t[Symbol.asyncDispose];
    }
    if (i === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      i = t[Symbol.dispose], e && (a = i);
    }
    if (typeof i != "function") throw new TypeError("Object not disposable.");
    a && (i = function() {
      try {
        a.call(this);
      } catch (o) {
        return Promise.reject(o);
      }
    }), r.stack.push({ value: t, dispose: i, async: e });
  } else e && r.stack.push({ async: !0 });
  return t;
}, ho = /* @__PURE__ */ (function(r) {
  return function(t) {
    function e(o) {
      t.error = t.hasError ? new r(o, t.error, "An error was suppressed during disposal.") : o, t.hasError = !0;
    }
    var i, a = 0;
    return (function o() {
      for (; i = t.stack.pop(); ) try {
        if (!i.async && a === 1) return a = 0, t.stack.push(i), Promise.resolve().then(o);
        if (i.dispose) {
          var s = i.dispose.call(i.value);
          if (i.async) return a |= 2, Promise.resolve(s).then(o, function(n) {
            return e(n), o();
          });
        } else a |= 1;
      } catch (n) {
        e(n);
      }
      if (a === 1) return t.hasError ? Promise.reject(t.error) : Promise.resolve();
      if (t.hasError) throw t.error;
    })();
  };
})(typeof SuppressedError == "function" ? SuppressedError : function(r, t, e) {
  var i = new Error(e);
  return i.name = "SuppressedError", i.error = r, i.suppressed = t, i;
});
_a();
let vr = -1 / 0, _r = -1 / 0, _t = null;
typeof FinalizationRegistry < "u" && (_t = new FinalizationRegistry((r) => {
  const t = performance.now();
  r.type === "video" ? (t - vr >= 1e3 && (console.error("A VideoSample was garbage collected without first being closed. For proper resource management, make sure to call close() on all your VideoSamples as soon as you're done using them."), vr = t), typeof VideoFrame < "u" && r.data instanceof VideoFrame && r.data.close()) : (t - _r >= 1e3 && (console.error("An AudioSample was garbage collected without first being closed. For proper resource management, make sure to call close() on all your AudioSamples as soon as you're done using them."), _r = t), typeof AudioData < "u" && r.data instanceof AudioData && r.data.close());
}));
class bt {
  constructor() {
    this._referenceCount = 0, this._lastAllocationBuffer = null;
  }
}
const Ee = ["I420", "I420P10", "I420P12", "I420A", "I420AP10", "I420AP12", "I422", "I422P10", "I422P12", "I422A", "I422AP10", "I422AP12", "I444", "I444P10", "I444P12", "I444A", "I444AP10", "I444AP12", "NV12", "RGBA", "RGBX", "BGRA", "BGRX"], uo = new Set(Ee);
class Y {
  get codedWidth() {
    return this.visibleRect.width;
  }
  get codedHeight() {
    return this.visibleRect.height;
  }
  get displayWidth() {
    return this.rotation % 180 == 0 ? this.squarePixelWidth : this.squarePixelHeight;
  }
  get displayHeight() {
    return this.rotation % 180 == 0 ? this.squarePixelHeight : this.squarePixelWidth;
  }
  get microsecondTimestamp() {
    return Math.trunc(Et * this.timestamp);
  }
  get microsecondDuration() {
    return Math.trunc(Et * this.duration);
  }
  get hasAlpha() {
    return this.format && this.format.includes("A");
  }
  constructor(t, e) {
    var i, a, o, s, n, d, l, c;
    if (this._closed = !1, t instanceof ArrayBuffer || typeof SharedArrayBuffer < "u" && t instanceof SharedArrayBuffer || ArrayBuffer.isView(t)) {
      if (!e || typeof e != "object") throw new TypeError("init must be an object.");
      if (e.format === void 0 || !uo.has(e.format)) throw new TypeError("init.format must be one of: " + Ee.join(", "));
      if (!Number.isInteger(e.codedWidth) || e.codedWidth <= 0) throw new TypeError("init.codedWidth must be a positive integer.");
      if (!Number.isInteger(e.codedHeight) || e.codedHeight <= 0) throw new TypeError("init.codedHeight must be a positive integer.");
      if (e.rotation !== void 0 && ![0, 90, 180, 270].includes(e.rotation)) throw new TypeError("init.rotation, when provided, must be 0, 90, 180, or 270.");
      if (!Number.isFinite(e.timestamp)) throw new TypeError("init.timestamp must be a number.");
      if (e.duration !== void 0 && (!Number.isFinite(e.duration) || e.duration < 0)) throw new TypeError("init.duration, when provided, must be a non-negative number.");
      if (e.layout !== void 0) {
        if (!Array.isArray(e.layout)) throw new TypeError("init.layout, when provided, must be an array.");
        for (const u of e.layout) {
          if (!u || typeof u != "object" || Array.isArray(u)) throw new TypeError("Each entry in init.layout must be an object.");
          if (!Number.isInteger(u.offset) || u.offset < 0) throw new TypeError("plane.offset must be a non-negative integer.");
          if (!Number.isInteger(u.stride) || u.stride < 0) throw new TypeError("plane.stride must be a non-negative integer.");
        }
      }
      if (e.visibleRect !== void 0 && nr(e.visibleRect, "init.visibleRect"), e.displayWidth !== void 0 && (!Number.isInteger(e.displayWidth) || e.displayWidth <= 0)) throw new TypeError("init.displayWidth, when provided, must be a positive integer.");
      if (e.displayHeight !== void 0 && (!Number.isInteger(e.displayHeight) || e.displayHeight <= 0)) throw new TypeError("init.displayHeight, when provided, must be a positive integer.");
      if (e.displayWidth !== void 0 != (e.displayHeight !== void 0)) throw new TypeError("init.displayWidth and init.displayHeight must be either both provided or both omitted.");
      this._data = q(t).slice(), this._layout = e.layout ?? fo(e.format, e.codedWidth, e.codedHeight), this.format = e.format, this.rotation = e.rotation ?? 0, this.timestamp = e.timestamp, this.duration = e.duration ?? 0;
      let h = e.colorSpace ?? null;
      h === null && (h = this.format === "RGBA" || this.format === "RGBX" || this.format === "BGRA" || this.format === "BGRX" ? { primaries: "bt709", transfer: "iec61966-2-1", matrix: "rgb", fullRange: !0 } : { primaries: "bt709", transfer: "bt709", matrix: "bt709", fullRange: !1 }), this.colorSpace = new we(h), this.visibleRect = { left: ((i = e.visibleRect) == null ? void 0 : i.left) ?? 0, top: ((a = e.visibleRect) == null ? void 0 : a.top) ?? 0, width: ((o = e.visibleRect) == null ? void 0 : o.width) ?? e.codedWidth, height: ((s = e.visibleRect) == null ? void 0 : s.height) ?? e.codedHeight }, e.displayWidth !== void 0 ? (this.squarePixelWidth = this.rotation % 180 == 0 ? e.displayWidth : e.displayHeight, this.squarePixelHeight = this.rotation % 180 == 0 ? e.displayHeight : e.displayWidth) : (this.squarePixelWidth = this.visibleRect.width, this.squarePixelHeight = this.visibleRect.height);
    } else if (typeof VideoFrame < "u" && t instanceof VideoFrame) {
      if ((e == null ? void 0 : e.rotation) !== void 0 && ![0, 90, 180, 270].includes(e.rotation)) throw new TypeError("init.rotation, when provided, must be 0, 90, 180, or 270.");
      if ((e == null ? void 0 : e.timestamp) !== void 0 && !Number.isFinite(e == null ? void 0 : e.timestamp)) throw new TypeError("init.timestamp, when provided, must be a number.");
      if ((e == null ? void 0 : e.duration) !== void 0 && (!Number.isFinite(e.duration) || e.duration < 0)) throw new TypeError("init.duration, when provided, must be a non-negative number.");
      (e == null ? void 0 : e.visibleRect) !== void 0 && nr(e.visibleRect, "init.visibleRect"), this._data = t, this._layout = null, this.format = t.format, this.visibleRect = { left: ((n = t.visibleRect) == null ? void 0 : n.x) ?? 0, top: ((d = t.visibleRect) == null ? void 0 : d.y) ?? 0, width: ((l = t.visibleRect) == null ? void 0 : l.width) ?? t.codedWidth, height: ((c = t.visibleRect) == null ? void 0 : c.height) ?? t.codedHeight }, this.rotation = (e == null ? void 0 : e.rotation) ?? 0, this.squarePixelWidth = t.displayWidth, this.squarePixelHeight = t.displayHeight, this.timestamp = (e == null ? void 0 : e.timestamp) ?? t.timestamp / 1e6, this.duration = (e == null ? void 0 : e.duration) ?? (t.duration ?? 0) / 1e6, this.colorSpace = new we(t.colorSpace);
    } else if (typeof HTMLImageElement < "u" && t instanceof HTMLImageElement || typeof SVGImageElement < "u" && t instanceof SVGImageElement || typeof ImageBitmap < "u" && t instanceof ImageBitmap || typeof HTMLVideoElement < "u" && t instanceof HTMLVideoElement || typeof HTMLCanvasElement < "u" && t instanceof HTMLCanvasElement || typeof OffscreenCanvas < "u" && t instanceof OffscreenCanvas) {
      if (!e || typeof e != "object") throw new TypeError("init must be an object.");
      if (e.rotation !== void 0 && ![0, 90, 180, 270].includes(e.rotation)) throw new TypeError("init.rotation, when provided, must be 0, 90, 180, or 270.");
      if (!Number.isFinite(e.timestamp)) throw new TypeError("init.timestamp must be a number.");
      if (e.duration !== void 0 && (!Number.isFinite(e.duration) || e.duration < 0)) throw new TypeError("init.duration, when provided, must be a non-negative number.");
      if (typeof VideoFrame < "u") return new Y(new VideoFrame(t, { timestamp: Math.trunc(e.timestamp * Et), duration: Math.trunc((e.duration ?? 0) * Et) || void 0 }), e);
      let h = 0, u = 0;
      if ("naturalWidth" in t ? (h = t.naturalWidth, u = t.naturalHeight) : "videoWidth" in t ? (h = t.videoWidth, u = t.videoHeight) : "width" in t && (h = Number(t.width), u = Number(t.height)), !h || !u) throw new TypeError("Could not determine dimensions.");
      const m = new OffscreenCanvas(h, u), w = m.getContext("2d", { alpha: Kr(), willReadFrequently: !0 });
      f(w), w.drawImage(t, 0, 0), this._data = m, this._layout = null, this.format = "RGBX", this.visibleRect = { left: 0, top: 0, width: h, height: u }, this.squarePixelWidth = h, this.squarePixelHeight = u, this.rotation = e.rotation ?? 0, this.timestamp = e.timestamp, this.duration = e.duration ?? 0, this.colorSpace = new we({ matrix: "rgb", primaries: "bt709", transfer: "iec61966-2-1", fullRange: !0 });
    } else {
      if (!(t instanceof bt)) throw new TypeError("Invalid data type: Must be a BufferSource, CanvasImageSource, or VideoSampleResource.");
      if (!e || typeof e != "object") throw new TypeError("init must be an object.");
      if (e.rotation !== void 0 && ![0, 90, 180, 270].includes(e.rotation)) throw new TypeError("init.rotation, when provided, must be 0, 90, 180, or 270.");
      if (!Number.isFinite(e.timestamp)) throw new TypeError("init.timestamp must be a number.");
      if (e.duration !== void 0 && (!Number.isFinite(e.duration) || e.duration < 0)) throw new TypeError("init.duration, when provided, must be a non-negative number.");
      if (this._data = t, t._referenceCount++, this.format = t.getFormat(), this.format !== null && !Ee.includes(this.format)) throw new TypeError("getFormat() must return a VideoSamplePixelFormat or null.");
      if (this.visibleRect = { left: 0, top: 0, width: t.getCodedWidth(), height: t.getCodedHeight() }, !Number.isInteger(this.visibleRect.width) || this.visibleRect.width <= 0) throw new TypeError("getCodedWidth() must return a positive integer.");
      if (!Number.isInteger(this.visibleRect.height) || this.visibleRect.height <= 0) throw new TypeError("getCodedHeight() must return a positive integer.");
      if (this.squarePixelWidth = t.getSquarePixelWidth(), !Number.isInteger(this.squarePixelWidth) || this.squarePixelWidth <= 0) throw new TypeError("getSquarePixelWidth() must return a positive integer.");
      if (this.squarePixelHeight = t.getSquarePixelHeight(), !Number.isInteger(this.squarePixelHeight) || this.squarePixelHeight <= 0) throw new TypeError("getSquarePixelHeight() must return a positive integer.");
      this.rotation = e.rotation ?? 0, this.timestamp = e.timestamp, this.duration = e.duration ?? 0, this.colorSpace = t.getColorSpace();
    }
    this.pixelAspectRatio = Ne({ num: this.squarePixelWidth * this.codedHeight, den: this.squarePixelHeight * this.codedWidth }), _t == null || _t.register(this, { type: "video", data: this._data }, this);
  }
  clone() {
    if (this._closed) throw new Error("VideoSample is closed.");
    return f(this._data !== null), this._data instanceof bt ? new Y(this._data, { timestamp: this.timestamp, duration: this.duration, rotation: this.rotation }) : Dt(this._data) ? new Y(this._data.clone(), { timestamp: this.timestamp, duration: this.duration, rotation: this.rotation }) : this._data instanceof Uint8Array ? (f(this._layout), new Y(this._data, { format: this.format, layout: this._layout, codedWidth: this.codedWidth, codedHeight: this.codedHeight, timestamp: this.timestamp, duration: this.duration, colorSpace: this.colorSpace, rotation: this.rotation, visibleRect: this.visibleRect, displayWidth: this.displayWidth, displayHeight: this.displayHeight })) : new Y(this._data, { format: this.format, codedWidth: this.codedWidth, codedHeight: this.codedHeight, timestamp: this.timestamp, duration: this.duration, colorSpace: this.colorSpace, rotation: this.rotation, visibleRect: this.visibleRect, displayWidth: this.displayWidth, displayHeight: this.displayHeight });
  }
  close() {
    this._closed || (_t == null || _t.unregister(this), this._data instanceof bt ? (this._data._referenceCount--, this._data._referenceCount === 0 && this._data.close()) : Dt(this._data) ? this._data.close() : this._data = null, this._closed = !0);
  }
  allocationSize(t = {}) {
    if (kr(t), this._closed) throw new Error("VideoSample is closed.");
    if ((t.format ?? this.format) == null) throw new Error("Cannot get allocation size when format is null.");
    return Dt(this._data) ? this._data.allocationSize(t) : Cr(this, t).allocationSize;
  }
  async copyTo(t, e = {}) {
    if (!Le(t)) throw new TypeError("destination must be an ArrayBuffer or an ArrayBuffer view.");
    if (kr(e), this._closed) throw new Error("VideoSample is closed.");
    if ((e.format ?? this.format) == null) throw new Error("Cannot copy video sample data when format is null.");
    if (f(this._data !== null), Dt(this._data)) return this._data.copyTo(t, e);
    if (e.format && !["RGBA", "RGBX", "BGRA", "BGRX"].includes(this.format) && ["RGBA", "RGBX", "BGRA", "BGRX"].includes(e.format)) {
      if (!(this._data instanceof bt)) {
        if (typeof VideoFrame > "u") throw new Error("For this sample, converting from a non-RGB to an RGB format requires VideoFrame to be defined.");
        const l = this.toVideoFrame(), c = await l.copyTo(t, e);
        return l.close(), c;
      }
      {
        const l = { stack: [], error: void 0, hasError: !1 };
        try {
          const c = lo(l, await this._data.toRgbSample({ timestamp: this.timestamp, duration: this.duration, rotation: this.rotation }, e.colorSpace ?? "srgb"), !1);
          if (!(c instanceof Y)) throw new TypeError("toRgbSample() must return a VideoSample.");
          if (!["RGBA", "RGBX", "BGRA", "BGRX"].includes(c.format)) throw new Error(`Sample returned by toRgbSample was expected to have an RGB format, got '${c.format}' instead.`);
          return await c.copyTo(t, e);
        } catch (c) {
          l.error = c, l.hasError = !0;
        } finally {
          ho(l);
        }
      }
    }
    const i = Cr(this, e);
    f(this.format);
    const a = q(t);
    if (a.byteLength < i.allocationSize) throw new TypeError(`Destination buffer too small. Required: ${i.allocationSize}, Available: ${a.byteLength}`);
    const o = ce(this.format);
    let s;
    if (this._data instanceof bt) {
      let l = this._data.getDataPlanes();
      if (l instanceof Promise && (l = await l), !Array.isArray(l) || l.some((c) => !(c.data instanceof Uint8Array) || !Number.isInteger(c.stride) || c.stride < 0)) throw new TypeError('getDataPlanes() must return an array of objects with a Uint8Array "data" property and a non-negative integer "stride" property.');
      s = l;
    } else if (this._data instanceof Uint8Array) f(this._layout), f(this._layout.length === o.length), s = this._layout.map((l, c) => {
      const h = Math.ceil(this.codedHeight / o[c].heightDivisor);
      return { data: this._data.subarray(l.offset, l.offset + l.stride * h), stride: l.stride };
    });
    else {
      const l = this._data.getContext("2d");
      f(l);
      const c = l.getImageData(0, 0, this.codedWidth, this.codedHeight);
      s = [{ data: q(c.data), stride: 4 * this.codedWidth }];
    }
    const n = [], d = o.length;
    for (let l = 0; l < d; l++) {
      const c = i.computedLayouts[l], h = s[l].stride, u = s[l].data;
      let m = c.sourceTop * h;
      m += c.sourceLeftBytes;
      let w = c.destinationOffset;
      const p = c.sourceWidthBytes, v = { offset: w, stride: c.destinationStride };
      for (let _ = 0; _ < c.sourceHeight; _++) {
        if (m + p > u.byteLength) throw new Error("Source buffer OOB read.");
        if (w + p > a.byteLength) throw new Error("Destination buffer OOB write.");
        const T = u.subarray(m, m + p);
        a.set(T, w), m += h, w += c.destinationStride;
      }
      n.push(v);
    }
    if (e.format !== void 0) {
      const l = this.format.startsWith("RGB") !== e.format.startsWith("RGB"), c = this.format.includes("X") && e.format.includes("A");
      if (l || c) for (let h = 0; h < i.allocationSize; h += 4) {
        if (l) {
          const u = a[h], m = a[h + 2];
          a[h] = m, a[h + 2] = u;
        }
        c && (a[h + 3] = 255);
      }
    }
    return n;
  }
  toVideoFrame() {
    if (this._closed) throw new Error("VideoSample is closed.");
    if (f(this._data !== null), this._data instanceof bt) {
      if (this.format === null) throw new Error("Cannot convert a VideoSampleResource-backed VideoSample to VideoFrame if format is null.");
      const t = this._data.getDataPlanes();
      if (t instanceof Promise) throw new Error("Cannot convert a VideoSampleResource-backed VideoSample to VideoFrame if getDataPlanes() returns a promise.");
      const e = t.reduce((s, n) => s + n.data.byteLength, 0), i = new Uint8Array(e);
      let a = 0;
      const o = [];
      for (const s of t) i.set(s.data, a), o.push(a), a += s.data.byteLength;
      return new VideoFrame(i, { format: this.format, layout: t.map((s, n) => ({ offset: o[n], stride: s.stride })), codedWidth: this.codedWidth, codedHeight: this.codedHeight, timestamp: this.microsecondTimestamp, duration: this.microsecondDuration, colorSpace: this.colorSpace, displayWidth: this.squarePixelWidth, displayHeight: this.squarePixelHeight });
    }
    return Dt(this._data) ? new VideoFrame(this._data, { timestamp: this.microsecondTimestamp, duration: this.microsecondDuration || void 0 }) : this._data instanceof Uint8Array ? new VideoFrame(this._data, { format: this.format, codedWidth: this.codedWidth, codedHeight: this.codedHeight, timestamp: this.microsecondTimestamp, duration: this.microsecondDuration || void 0, colorSpace: this.colorSpace, displayWidth: this.squarePixelWidth, displayHeight: this.squarePixelHeight }) : new VideoFrame(this._data, { timestamp: this.microsecondTimestamp, duration: this.microsecondDuration || void 0 });
  }
  draw(t, e, i, a, o, s, n, d, l) {
    let c = 0, h = 0, u = this.displayWidth, m = this.displayHeight, w = 0, p = 0, v = this.displayWidth, _ = this.displayHeight;
    if (s !== void 0 ? (c = e, h = i, u = a, m = o, w = s, p = n, d !== void 0 ? (v = d, _ = l) : (v = u, _ = m)) : (w = e, p = i, a !== void 0 && (v = a, _ = o)), !(typeof CanvasRenderingContext2D < "u" && t instanceof CanvasRenderingContext2D || typeof OffscreenCanvasRenderingContext2D < "u" && t instanceof OffscreenCanvasRenderingContext2D)) throw new TypeError("context must be a CanvasRenderingContext2D or OffscreenCanvasRenderingContext2D.");
    if (!Number.isFinite(c)) throw new TypeError("sx must be a number.");
    if (!Number.isFinite(h)) throw new TypeError("sy must be a number.");
    if (!Number.isFinite(u) || u < 0) throw new TypeError("sWidth must be a non-negative number.");
    if (!Number.isFinite(m) || m < 0) throw new TypeError("sHeight must be a non-negative number.");
    if (!Number.isFinite(w)) throw new TypeError("dx must be a number.");
    if (!Number.isFinite(p)) throw new TypeError("dy must be a number.");
    if (!Number.isFinite(v) || v < 0) throw new TypeError("dWidth must be a non-negative number.");
    if (!Number.isFinite(_) || _ < 0) throw new TypeError("dHeight must be a non-negative number.");
    if (this._closed) throw new Error("VideoSample is closed.");
    ({ sx: c, sy: h, sWidth: u, sHeight: m } = this._rotateSourceRegion(c, h, u, m, this.rotation));
    const T = this.toCanvasImageSource();
    t.save();
    const k = w + v / 2, A = p + _ / 2;
    t.translate(k, A), t.rotate(this.rotation * Math.PI / 180);
    const M = this.rotation % 180 == 0 ? 1 : v / _;
    t.scale(1 / M, M), t.drawImage(T, c, h, u, m, -v / 2, -_ / 2, v, _), t.restore();
  }
  drawWithFit(t, e) {
    var T, k, A, M;
    if (!(typeof CanvasRenderingContext2D < "u" && t instanceof CanvasRenderingContext2D || typeof OffscreenCanvasRenderingContext2D < "u" && t instanceof OffscreenCanvasRenderingContext2D)) throw new TypeError("context must be a CanvasRenderingContext2D or OffscreenCanvasRenderingContext2D.");
    if (!e || typeof e != "object") throw new TypeError("options must be an object.");
    if (!["fill", "contain", "cover"].includes(e.fit)) throw new TypeError("options.fit must be 'fill', 'contain', or 'cover'.");
    if (e.rotation !== void 0 && ![0, 90, 180, 270].includes(e.rotation)) throw new TypeError("options.rotation, when provided, must be 0, 90, 180, or 270.");
    e.crop !== void 0 && Se(e.crop, "options.");
    const i = t.canvas.width, a = t.canvas.height, o = e.rotation ?? this.rotation, [s, n] = o % 180 == 0 ? [this.squarePixelWidth, this.squarePixelHeight] : [this.squarePixelHeight, this.squarePixelWidth];
    let d, l, c, h, u = e.crop;
    u && (u = Tr(u, s, n));
    const { sx: m, sy: w, sWidth: p, sHeight: v } = this._rotateSourceRegion(((T = e.crop) == null ? void 0 : T.left) ?? 0, ((k = e.crop) == null ? void 0 : k.top) ?? 0, ((A = e.crop) == null ? void 0 : A.width) ?? s, ((M = e.crop) == null ? void 0 : M.height) ?? n, o);
    if (e.fit === "fill") d = 0, l = 0, c = i, h = a;
    else {
      const [B, P] = e.crop ? [e.crop.width, e.crop.height] : [s, n], F = e.fit === "contain" ? Math.min(i / B, a / P) : Math.max(i / B, a / P);
      c = B * F, h = P * F, d = (i - c) / 2, l = (a - h) / 2;
    }
    t.save();
    const _ = o % 180 == 0 ? 1 : c / h;
    t.translate(i / 2, a / 2), t.rotate(o * Math.PI / 180), t.scale(1 / _, _), t.translate(-i / 2, -a / 2), t.drawImage(this.toCanvasImageSource(), m, w, p, v, d, l, c, h), t.restore();
  }
  _rotateSourceRegion(t, e, i, a, o) {
    return o === 90 ? [t, e, i, a] = [e, this.squarePixelHeight - t - i, a, i] : o === 180 ? [t, e] = [this.squarePixelWidth - t - i, this.squarePixelHeight - e - a] : o === 270 && ([t, e, i, a] = [this.squarePixelWidth - e - a, t, a, i]), { sx: t, sy: e, sWidth: i, sHeight: a };
  }
  toCanvasImageSource() {
    if (this._closed) throw new Error("VideoSample is closed.");
    if (f(this._data !== null), this._data instanceof bt || this._data instanceof Uint8Array) {
      const t = this.toVideoFrame();
      return queueMicrotask(() => t.close()), t;
    }
    return this._data;
  }
  async transform(t) {
    if (!t || typeof t != "object") throw new TypeError("options must be an object.");
    if (t.width !== void 0 && (!Number.isInteger(t.width) || t.width <= 0)) throw new TypeError("options.width, when provided, must be a positive integer.");
    if (t.height !== void 0 && (!Number.isInteger(t.height) || t.height <= 0)) throw new TypeError("options.height, when provided, must be a positive integer.");
    if (t.roundDimensionsTo !== void 0 && (!Number.isInteger(t.roundDimensionsTo) || t.roundDimensionsTo <= 0)) throw new TypeError("options.roundDimensionsTo, when provided, must be a positive integer.");
    if (t.fit !== void 0 && !["fill", "contain", "cover"].includes(t.fit)) throw new TypeError('options.fit, when provided, must be one of "fill", "contain", or "cover".');
    if (t.width !== void 0 && t.height !== void 0 && t.fit === void 0) throw new TypeError("When both options.width and options.height are provided, options.fit must also be provided.");
    if (t.rotate !== void 0 && ![0, 90, 180, 270].includes(t.rotate)) throw new TypeError("options.rotate, when provided, must be 0, 90, 180 or 270.");
    if (t.crop !== void 0 && Se(t.crop, "options."), t.alpha !== void 0 && !["keep", "discard"].includes(t.alpha)) throw new TypeError("options.alpha, when provided, must be 'keep' or 'discard'.");
    const e = qr(this.rotation + (t.rotate ?? 0)), [i, a] = e % 180 == 0 ? [this.squarePixelWidth, this.squarePixelHeight] : [this.squarePixelHeight, this.squarePixelWidth];
    let o = t.crop;
    o && (o = Tr(o, i, a));
    const s = o ? o.width : i, n = o ? o.height : a, d = s / n;
    let l, c;
    t.width !== void 0 && t.height === void 0 ? (l = t.width, c = l / d) : t.width === void 0 && t.height !== void 0 ? (c = t.height, l = c * d) : t.width !== void 0 && t.height !== void 0 ? (l = t.width, c = t.height) : (l = s, c = n), l = ar(l, t.roundDimensionsTo ?? 1), c = ar(c, t.roundDimensionsTo ?? 1);
    const h = { width: l, height: c, fit: t.fit ?? "fill", rotation: e, crop: o ?? { left: 0, top: 0, width: i, height: a }, alpha: t.alpha ?? "keep" };
    for (const p of mo) {
      let v = p(this, h);
      if (v instanceof Promise && (v = await v), v !== null) return v;
    }
    let u = null, m = !1;
    for (const p of Ft) if (p.canvas.width === h.width && p.canvas.height === h.height) {
      u = p.canvas, p.age = xr++;
      break;
    }
    if (u === null) {
      if (typeof OffscreenCanvas < "u") u = new OffscreenCanvas(h.width, h.height);
      else {
        if (typeof window > "u" || typeof document > "u") throw new Error("Cannot transform VideoSamples in this environment. Either run in an environment with OffscreenCanvas or HTMLCanvasElement, or supply a custom VideoSample transformer using registerVideoSampleTransformer().");
        u = document.createElement("canvas"), u.width = h.width, u.height = h.height;
      }
      m = !0, Ft.length >= po && Ft.splice(xa(Ft, (p) => p.age), 1), Ft.push({ canvas: u, age: xr++ });
    }
    const w = u.getContext("2d", { alpha: !0 });
    return f(w), h.alpha === "discard" ? (w.fillStyle = "black", w.fillRect(0, 0, h.width, h.height)) : m || w.clearRect(0, 0, h.width, h.height), this.drawWithFit(w, { fit: h.fit, rotation: h.rotation, crop: h.crop }), new Y(u, { timestamp: this.timestamp, duration: this.duration, rotation: 0 });
  }
  setRotation(t) {
    if (![0, 90, 180, 270].includes(t)) throw new TypeError("newRotation must be 0, 90, 180, or 270.");
    this.rotation = t;
  }
  setTimestamp(t) {
    if (!Number.isFinite(t)) throw new TypeError("newTimestamp must be a number.");
    this.timestamp = t;
  }
  setDuration(t) {
    if (!Number.isFinite(t) || t < 0) throw new TypeError("newDuration must be a non-negative number.");
    this.duration = t;
  }
  [Symbol.dispose]() {
    this.close();
  }
}
const mo = [], po = 3, Ft = [];
let xr = 0;
class we {
  constructor(t) {
    if (t !== void 0) {
      if (!t || typeof t != "object") throw new TypeError("init.colorSpace, when provided, must be an object.");
      const e = Object.keys(Wt);
      if (t.primaries != null && !e.includes(t.primaries)) throw new TypeError(`init.colorSpace.primaries, when provided, must be one of ${e.join(", ")}.`);
      const i = Object.keys(Ut);
      if (t.transfer != null && !i.includes(t.transfer)) throw new TypeError(`init.colorSpace.transfer, when provided, must be one of ${i.join(", ")}.`);
      const a = Object.keys($t);
      if (t.matrix != null && !a.includes(t.matrix)) throw new TypeError(`init.colorSpace.matrix, when provided, must be one of ${a.join(", ")}.`);
      if (t.fullRange != null && typeof t.fullRange != "boolean") throw new TypeError("init.colorSpace.fullRange, when provided, must be a boolean.");
    }
    this.primaries = (t == null ? void 0 : t.primaries) ?? null, this.transfer = (t == null ? void 0 : t.transfer) ?? null, this.matrix = (t == null ? void 0 : t.matrix) ?? null, this.fullRange = (t == null ? void 0 : t.fullRange) ?? null;
  }
  toJSON() {
    return { primaries: this.primaries, transfer: this.transfer, matrix: this.matrix, fullRange: this.fullRange };
  }
}
const Dt = (r) => typeof VideoFrame < "u" && r instanceof VideoFrame, Tr = (r, t, e) => {
  const i = Math.min(r.left, t), a = Math.min(r.top, e), o = Math.min(r.width, t - i), s = Math.min(r.height, e - a);
  return f(o >= 0), f(s >= 0), { left: i, top: a, width: o, height: s };
}, Se = (r, t) => {
  if (!r || typeof r != "object") throw new TypeError(t + "crop, when provided, must be an object.");
  if (!Number.isInteger(r.left) || r.left < 0) throw new TypeError(t + "crop.left must be a non-negative integer.");
  if (!Number.isInteger(r.top) || r.top < 0) throw new TypeError(t + "crop.top must be a non-negative integer.");
  if (!Number.isInteger(r.width) || r.width < 0) throw new TypeError(t + "crop.width must be a non-negative integer.");
  if (!Number.isInteger(r.height) || r.height < 0) throw new TypeError(t + "crop.height must be a non-negative integer.");
}, kr = (r) => {
  if (!r || typeof r != "object") throw new TypeError("options must be an object.");
  if (r.colorSpace !== void 0 && !["display-p3", "srgb"].includes(r.colorSpace)) throw new TypeError("options.colorSpace, when provided, must be 'display-p3' or 'srgb'.");
  if (r.format !== void 0 && typeof r.format != "string") throw new TypeError("options.format, when provided, must be a string.");
  if (r.layout !== void 0) {
    if (!Array.isArray(r.layout)) throw new TypeError("options.layout, when provided, must be an array.");
    for (const t of r.layout) {
      if (!t || typeof t != "object") throw new TypeError("Each entry in options.layout must be an object.");
      if (!Number.isInteger(t.offset) || t.offset < 0) throw new TypeError("plane.offset must be a non-negative integer.");
      if (!Number.isInteger(t.stride) || t.stride < 0) throw new TypeError("plane.stride must be a non-negative integer.");
    }
  }
  if (r.rect !== void 0) {
    if (!r.rect || typeof r.rect != "object") throw new TypeError("options.rect, when provided, must be an object.");
    if (r.rect.x !== void 0 && (!Number.isInteger(r.rect.x) || r.rect.x < 0)) throw new TypeError("options.rect.x, when provided, must be a non-negative integer.");
    if (r.rect.y !== void 0 && (!Number.isInteger(r.rect.y) || r.rect.y < 0)) throw new TypeError("options.rect.y, when provided, must be a non-negative integer.");
    if (r.rect.width !== void 0 && (!Number.isInteger(r.rect.width) || r.rect.width < 0)) throw new TypeError("options.rect.width, when provided, must be a non-negative integer.");
    if (r.rect.height !== void 0 && (!Number.isInteger(r.rect.height) || r.rect.height < 0)) throw new TypeError("options.rect.height, when provided, must be a non-negative integer.");
  }
}, fo = (r, t, e) => {
  const i = ce(r), a = [];
  let o = 0;
  for (const s of i) {
    const n = Math.ceil(t / s.widthDivisor), d = Math.ceil(e / s.heightDivisor), l = n * s.sampleBytes, c = l * d;
    a.push({ offset: o, stride: l }), o += c;
  }
  return a;
}, ce = (r) => {
  const t = (e, i, a, o, s) => {
    const n = [{ sampleBytes: e, widthDivisor: 1, heightDivisor: 1 }, { sampleBytes: i, widthDivisor: a, heightDivisor: o }, { sampleBytes: i, widthDivisor: a, heightDivisor: o }];
    return s && n.push({ sampleBytes: e, widthDivisor: 1, heightDivisor: 1 }), n;
  };
  switch (r) {
    case "I420":
      return t(1, 1, 2, 2, !1);
    case "I420P10":
    case "I420P12":
      return t(2, 2, 2, 2, !1);
    case "I420A":
      return t(1, 1, 2, 2, !0);
    case "I420AP10":
    case "I420AP12":
      return t(2, 2, 2, 2, !0);
    case "I422":
      return t(1, 1, 2, 1, !1);
    case "I422P10":
    case "I422P12":
      return t(2, 2, 2, 1, !1);
    case "I422A":
      return t(1, 1, 2, 1, !0);
    case "I422AP10":
    case "I422AP12":
      return t(2, 2, 2, 1, !0);
    case "I444":
      return t(1, 1, 1, 1, !1);
    case "I444P10":
    case "I444P12":
      return t(2, 2, 1, 1, !1);
    case "I444A":
      return t(1, 1, 1, 1, !0);
    case "I444AP10":
    case "I444AP12":
      return t(2, 2, 1, 1, !0);
    case "NV12":
      return [{ sampleBytes: 1, widthDivisor: 1, heightDivisor: 1 }, { sampleBytes: 2, widthDivisor: 2, heightDivisor: 2 }];
    case "RGBA":
    case "RGBX":
    case "BGRA":
    case "BGRX":
      return [{ sampleBytes: 4, widthDivisor: 1, heightDivisor: 1 }];
    default:
      It(r), f(!1);
  }
}, Cr = (r, t) => {
  const e = { left: 0, top: 0, width: r.codedWidth, height: r.codedHeight }, i = t.rect, a = go(e, i, r.codedWidth, r.codedHeight, r.format), o = t.layout;
  let s;
  if (t.format && t.format !== r.format) {
    if (!["RGBA", "RGBX", "BGRA", "BGRX"].includes(t.format)) throw new Error("NotSupportedError: Invalid destination format.");
    s = t.format;
  } else s = r.format;
  return yo(a, s, o);
}, go = (r, t, e, i, a) => {
  const o = { ...r };
  if (t !== void 0) {
    if (t.width === 0 || t.height === 0) throw new TypeError("visibleRect dimensions cannot be zero.");
    if ((t.x || 0) + (t.width || 0) > e) throw new TypeError("visibleRect exceeds codedWidth.");
    if ((t.y || 0) + (t.height || 0) > i) throw new TypeError("visibleRect exceeds codedHeight.");
    o.x = t.x || 0, o.y = t.y || 0, o.width = t.width || 0, o.height = t.height || 0;
  }
  if (!wo(a, o)) throw new TypeError("visibleRect alignment is invalid for the format.");
  return o;
}, wo = (r, t) => {
  if (r === null) return !0;
  const e = ce(r);
  for (let i = 0; i < e.length; i++) {
    const a = e[i], o = a.widthDivisor, s = a.heightDivisor;
    if ((t.x || 0) % o !== 0 || (t.y || 0) % s !== 0) return !1;
  }
  return !0;
}, yo = (r, t, e) => {
  const i = ce(t), a = i.length;
  if (e !== void 0 && e.length !== a) throw new TypeError(`Layout must have ${a} planes.`);
  let o = 0;
  const s = [], n = [];
  for (let d = 0; d < a; d++) {
    const l = i[d], c = l.sampleBytes, h = l.widthDivisor, u = l.heightDivisor, m = { destinationOffset: 0, destinationStride: 0, sourceTop: 0, sourceHeight: 0, sourceLeftBytes: 0, sourceWidthBytes: 0 };
    if (m.sourceTop = Math.ceil(Math.trunc(r.y || 0) / u), m.sourceHeight = Math.ceil(Math.trunc(r.height || 0) / u), m.sourceLeftBytes = Math.floor(Math.trunc(r.x || 0) / h) * c, m.sourceWidthBytes = Math.floor(Math.trunc(r.width || 0) / h) * c, e !== void 0) {
      const p = e[d];
      if (p.stride < m.sourceWidthBytes) throw new TypeError(`Stride for plane ${d} is too small.`);
      m.destinationOffset = p.offset, m.destinationStride = p.stride;
    } else m.destinationOffset = o, m.destinationStride = m.sourceWidthBytes;
    const w = m.destinationStride * m.sourceHeight + m.destinationOffset;
    if (w > 4294967295) throw new TypeError("Allocation size exceeds limit.");
    n.push(w), o = Math.max(o, w);
    for (let p = 0; p < d; p++) {
      const v = s[p];
      if (!(n[d] <= v.destinationOffset || n[p] <= m.destinationOffset)) throw new TypeError("Planes overlap.");
    }
    s.push(m);
  }
  return { allocationSize: o, computedLayouts: s };
}, Er = /* @__PURE__ */ new Map(), bo = (r) => {
  if (!r || typeof r != "object") throw new TypeError("Encoding config must be an object.");
  if (!rt.includes(r.codec)) throw new TypeError(`Invalid video codec '${r.codec}'. Must be one of: ${rt.join(", ")}.`);
  if (!(r.bitrate instanceof $e) && (!Number.isInteger(r.bitrate) || r.bitrate <= 0)) throw new TypeError("config.bitrate must be a positive integer or a quality.");
  if (r.keyFrameInterval !== void 0 && (!Number.isFinite(r.keyFrameInterval) || r.keyFrameInterval < 0)) throw new TypeError("config.keyFrameInterval, when provided, must be a non-negative number.");
  if (r.sizeChangeBehavior !== void 0 && !["deny", "passThrough", "fill", "contain", "cover"].includes(r.sizeChangeBehavior)) throw new TypeError("config.sizeChangeBehavior, when provided, must be 'deny', 'passThrough', 'fill', 'contain' or 'cover'.");
  if (r.transform !== void 0) {
    if (typeof r.transform != "object" || !r.transform) throw new TypeError("config.transform, when provided, must be an object.");
    if (r.transform.width !== void 0 && (!Number.isInteger(r.transform.width) || r.transform.width <= 0)) throw new TypeError("config.transform.width, when provided, must be a positive integer.");
    if (r.transform.height !== void 0 && (!Number.isInteger(r.transform.height) || r.transform.height <= 0)) throw new TypeError("config.transform.height, when provided, must be a positive integer.");
    if (r.transform.fit !== void 0 && !["fill", "contain", "cover"].includes(r.transform.fit)) throw new TypeError('config.transform.fit, when provided, must be one of "fill", "contain", or "cover".');
    if (r.transform.width !== void 0 && r.transform.height !== void 0 && r.transform.fit === void 0 && !["fill", "contain", "cover"].includes(r.sizeChangeBehavior)) throw new TypeError("When both config.transform.width and config.transform.height are provided, config.transform.fit must also be provided.");
    if (r.transform.fit !== void 0 && ["fill", "contain", "cover"].includes(r.sizeChangeBehavior) && r.transform.fit !== r.sizeChangeBehavior) throw new TypeError("config.transform.fit, when provided, cannot differ from config.sizeChangeBehavior when config.sizeChangeBehavior is 'fill', 'contain' or 'cover', as sizeChangeBehavior already determines the fitting algorithm.");
    if (r.transform.rotate !== void 0 && ![0, 90, 180, 270].includes(r.transform.rotate)) throw new TypeError("config.transform.rotate, when provided, must be 0, 90, 180 or 270.");
    if (r.transform.crop !== void 0 && Se(r.transform.crop, "config.transform."), r.transform.process !== void 0 && typeof r.transform.process != "function") throw new TypeError("config.transform.process, when provided, must be a function.");
    if (r.transform.frameRate !== void 0 && (!Number.isFinite(r.transform.frameRate) || r.transform.frameRate <= 0)) throw new TypeError("config.transform.frameRate, when provided, must be a finite positive number.");
    if (r.transform.force !== void 0 && typeof r.transform.force != "boolean") throw new TypeError("config.transform.force, when provided, must be a boolean.");
  }
  if (r.onEncodedPacket !== void 0 && typeof r.onEncodedPacket != "function") throw new TypeError("config.onEncodedPacket, when provided, must be a function.");
  if (r.onEncoderConfig !== void 0 && typeof r.onEncoderConfig != "function") throw new TypeError("config.onEncoderConfig, when provided, must be a function.");
  ui(r.codec, r);
}, ui = (r, t) => {
  if (!t || typeof t != "object") throw new TypeError("Encoding options must be an object.");
  if (t.alpha !== void 0 && !["discard", "keep"].includes(t.alpha)) throw new TypeError("options.alpha, when provided, must be 'discard' or 'keep'.");
  if (t.bitrateMode !== void 0 && !["constant", "variable"].includes(t.bitrateMode)) throw new TypeError("bitrateMode, when provided, must be 'constant' or 'variable'.");
  if (t.latencyMode !== void 0 && !["quality", "realtime"].includes(t.latencyMode)) throw new TypeError("latencyMode, when provided, must be 'quality' or 'realtime'.");
  if (t.fullCodecString !== void 0 && typeof t.fullCodecString != "string") throw new TypeError("fullCodecString, when provided, must be a string.");
  if (t.fullCodecString !== void 0 && Ba(t.fullCodecString) !== r) throw new TypeError(`fullCodecString, when provided, must be a string that matches the specified codec (${r}).`);
  if (t.hardwareAcceleration !== void 0 && !["no-preference", "prefer-hardware", "prefer-software"].includes(t.hardwareAcceleration)) throw new TypeError("hardwareAcceleration, when provided, must be 'no-preference', 'prefer-hardware' or 'prefer-software'.");
  if (t.scalabilityMode !== void 0 && typeof t.scalabilityMode != "string") throw new TypeError("scalabilityMode, when provided, must be a string.");
  if (t.contentHint !== void 0 && typeof t.contentHint != "string") throw new TypeError("contentHint, when provided, must be a string.");
}, mi = (r) => {
  const t = r.bitrate instanceof $e ? r.bitrate._toVideoBitrate(r.codec, r.width, r.height) : r.bitrate;
  return { codec: r.fullCodecString ?? Ea(r.codec, r.width, r.height, t), width: r.width, height: r.height, displayWidth: r.squarePixelWidth, displayHeight: r.squarePixelHeight, bitrate: t, bitrateMode: r.bitrateMode, alpha: r.alpha ?? "discard", framerate: r.framerate, latencyMode: r.latencyMode, hardwareAcceleration: r.hardwareAcceleration, scalabilityMode: r.scalabilityMode, contentHint: r.contentHint, ...Aa(r.codec) };
};
class $e {
  constructor(t) {
    this._factor = t;
  }
  _toVideoBitrate(t, e, i) {
    const a = e * i, o = 3e6 * Math.pow(a / 2073600, 0.95) * { avc: 1, hevc: 0.6, vp9: 0.6, av1: 0.4, vp8: 1.2 }[t] * this._factor;
    return 1e3 * Math.ceil(o / 1e3);
  }
  _toAudioBitrate(t) {
    if (mt.includes(t) || t === "flac") return;
    const e = { aac: 128e3, opus: 64e3, mp3: 16e4, vorbis: 64e3, ac3: 384e3, eac3: 192e3 }[t];
    if (!e) throw new Error(`Unhandled codec: ${t}`);
    let i = e * this._factor;
    return t === "aac" ? i = [96e3, 128e3, 16e4, 192e3].reduce((a, o) => Math.abs(o - i) < Math.abs(a - i) ? o : a) : t === "opus" || t === "vorbis" ? i = Math.max(6e3, i) : t === "mp3" && (i = [8e3, 16e3, 24e3, 32e3, 4e4, 48e3, 64e3, 8e4, 96e3, 112e3, 128e3, 16e4, 192e3, 224e3, 256e3, 32e4].reduce((a, o) => Math.abs(o - i) < Math.abs(a - i) ? o : a)), 1e3 * Math.round(i / 1e3);
  }
}
const vo = async (r, t = {}) => {
  const { width: e = 1280, height: i = 720, bitrate: a = 1e6, ...o } = t;
  if (!rt.includes(r)) return !1;
  if (!Number.isInteger(e) || e <= 0) throw new TypeError("width must be a positive integer.");
  if (!Number.isInteger(i) || i <= 0) throw new TypeError("height must be a positive integer.");
  if (!(a instanceof $e) && (!Number.isInteger(a) || a <= 0)) throw new TypeError("bitrate must be a positive integer or a quality.");
  ui(r, o);
  const s = mi({ codec: r, width: e, height: i, bitrate: a, framerate: void 0, ...o, alpha: "discard" }), n = JSON.stringify(s), d = Er.get(n);
  if (d) return d;
  const l = (async () => pi.some((c) => c.supports(r, s)) ? !0 : typeof VideoEncoder > "u" || (e % 2 == 1 || i % 2 == 1) && (r === "avc" || r === "hevc") ? !1 : !!(await VideoEncoder.isConfigSupported(s)).supported && (!Kr() || new Promise(async (c) => {
    try {
      const h = new VideoEncoder({ output: () => {
      }, error: () => c(!1) });
      h.configure(s);
      const u = new Uint8Array(e * i * 4), m = new VideoFrame(u, { format: "RGBA", codedWidth: e, codedHeight: i, timestamp: 0 });
      h.encode(m), m.close(), await h.flush(), c(!0);
    } catch {
      c(!1);
    }
  })))();
  return Er.set(n, l), l;
}, _o = async (r, t) => {
  for (const e of r) if (await vo(e, t)) return e;
  return null;
}, pi = [];
class Ct {
  constructor(t, e, i, a, o) {
    this.bytes = t, this.view = e, this.offset = i, this.start = a, this.end = o, this.bufferPos = a - i;
  }
  static tempFromBytes(t) {
    return new Ct(t, Xr(t), 0, 0, t.length);
  }
  get length() {
    return this.end - this.start;
  }
  get filePos() {
    return this.offset + this.bufferPos;
  }
  set filePos(t) {
    this.bufferPos = t - this.offset;
  }
  get remainingLength() {
    return Math.max(this.end - this.filePos, 0);
  }
  skip(t) {
    this.bufferPos += t;
  }
  slice(t, e = this.end - t) {
    if (t < this.start || t + e > this.end) throw new RangeError("Slicing outside of original slice.");
    return new Ct(this.bytes, this.view, this.offset, t, t + e);
  }
}
const xo = (r, t) => {
  if (r.filePos < r.start || r.filePos + t > r.end) throw new RangeError(`Tried reading [${r.filePos}, ${r.filePos + t}), but slice is [${r.start}, ${r.end}). This is likely an internal error, please report it alongside the file that caused it.`);
}, To = (r, t) => {
  xo(r, t);
  const e = r.bytes.subarray(r.bufferPos, r.bufferPos + t);
  return r.bufferPos += t, e;
};
class fi {
  constructor(t) {
    this.mutex = new Yr(), this.trackTimestampInfo = /* @__PURE__ */ new WeakMap(), this.output = t;
  }
  onTrackClose(t) {
  }
  validateTimestamp(t, e, i) {
    if (e < 0) throw new Error(`Timestamps must be non-negative (got ${e}s).`);
    let a = this.trackTimestampInfo.get(t);
    if (a) {
      if (i && (a.maxTimestampBeforeLastKeyPacket = a.maxTimestamp), a.maxTimestampBeforeLastKeyPacket !== null && e < a.maxTimestampBeforeLastKeyPacket) throw new Error(`Timestamps cannot be smaller than the largest timestamp of the previous GOP (a GOP begins with a key packet and ends right before the next key packet). Got ${e}s, but largest timestamp is ${a.maxTimestampBeforeLastKeyPacket}s.`);
      a.maxTimestamp = Math.max(a.maxTimestamp, e);
    } else {
      if (!i) throw new Error("First packet must be a key packet.");
      a = { maxTimestamp: e, maxTimestampBeforeLastKeyPacket: null }, this.trackTimestampInfo.set(t, a);
    }
  }
}
const ie = /<(?:(\d{2}):)?(\d{2}):(\d{2}).(\d{3})>/g, ko = /(?:(\d{2}):)?(\d{2}):(\d{2}).(\d{3})/, Co = (r) => {
  const t = ko.exec(r);
  if (!t) throw new Error("Expected match.");
  return 36e5 * Number(t[1] || "0") + 6e4 * Number(t[2]) + 1e3 * Number(t[3]) + Number(t[4]);
}, gi = (r) => {
  const t = Math.floor(r / 36e5), e = Math.floor(r % 36e5 / 6e4), i = Math.floor(r % 6e4 / 1e3), a = r % 1e3;
  return t.toString().padStart(2, "0") + ":" + e.toString().padStart(2, "0") + ":" + i.toString().padStart(2, "0") + "." + a.toString().padStart(3, "0");
};
class Xt {
  constructor(t) {
    this.writer = t, this.helper = new Uint8Array(8), this.helperView = new DataView(this.helper.buffer), this.offsets = /* @__PURE__ */ new WeakMap();
  }
  writeU32(t) {
    this.helperView.setUint32(0, t, !1), this.writer.write(this.helper.subarray(0, 4));
  }
  writeU64(t) {
    this.helperView.setUint32(0, Math.floor(t / 2 ** 32), !1), this.helperView.setUint32(4, t, !1), this.writer.write(this.helper.subarray(0, 8));
  }
  writeAscii(t) {
    for (let e = 0; e < t.length; e++) this.helperView.setUint8(e % 8, t.charCodeAt(e)), e % 8 == 7 && this.writer.write(this.helper);
    t.length % 8 != 0 && this.writer.write(this.helper.subarray(0, t.length % 8));
  }
  writeBox(t) {
    if (this.offsets.set(t, this.writer.getPos()), t.contents && !t.children) this.writeBoxHeader(t, t.size ?? t.contents.byteLength + 8), this.writer.write(t.contents);
    else {
      const e = this.writer.getPos();
      if (this.writeBoxHeader(t, 0), t.contents && this.writer.write(t.contents), t.children) for (const o of t.children) o && this.writeBox(o);
      const i = this.writer.getPos(), a = t.size ?? i - e;
      this.writer.seek(e), this.writeBoxHeader(t, a), this.writer.seek(i);
    }
  }
  writeBoxHeader(t, e) {
    this.writeU32(t.largeSize ? 1 : e), this.writeAscii(t.type), t.largeSize && this.writeU64(e);
  }
  measureBoxHeader(t) {
    return 8 + (t.largeSize ? 8 : 0);
  }
  patchBox(t) {
    const e = this.offsets.get(t);
    f(e !== void 0);
    const i = this.writer.getPos();
    this.writer.seek(e), this.writeBox(t), this.writer.seek(i);
  }
  measureBox(t) {
    if (t.contents && !t.children)
      return this.measureBoxHeader(t) + t.contents.byteLength;
    {
      let e = this.measureBoxHeader(t);
      if (t.contents && (e += t.contents.byteLength), t.children) for (const i of t.children) i && (e += this.measureBox(i));
      return e;
    }
  }
}
const I = new Uint8Array(8), K = new DataView(I.buffer), U = (r) => [(r % 256 + 256) % 256], S = (r) => (K.setUint16(0, r, !1), [I[0], I[1]]), ze = (r) => (K.setInt16(0, r, !1), [I[0], I[1]]), wi = (r) => (K.setUint32(0, r, !1), [I[1], I[2], I[3]]), b = (r) => (K.setUint32(0, r, !1), [I[0], I[1], I[2], I[3]]), dt = (r) => (K.setInt32(0, r, !1), [I[0], I[1], I[2], I[3]]), st = (r) => (K.setUint32(0, Math.floor(r / 2 ** 32), !1), K.setUint32(4, r, !1), [I[0], I[1], I[2], I[3], I[4], I[5], I[6], I[7]]), Eo = (r) => (K.setInt32(0, Math.floor(r / 2 ** 32), !1), K.setUint32(4, r, !1), [I[0], I[1], I[2], I[3], I[4], I[5], I[6], I[7]]), yi = (r) => (K.setInt16(0, 256 * r, !1), [I[0], I[1]]), Z = (r) => (K.setInt32(0, 65536 * r, !1), [I[0], I[1], I[2], I[3]]), ye = (r) => (K.setInt32(0, 2 ** 30 * r, !1), [I[0], I[1], I[2], I[3]]), be = (r, t) => {
  const e = [];
  let i = r;
  do {
    let a = 127 & i;
    i >>= 7, e.length > 0 && (a |= 128), e.push(a);
  } while (i > 0 || t);
  return e.reverse();
}, O = (r, t = !1) => {
  const e = Array(r.length).fill(null).map((i, a) => r.charCodeAt(a));
  return t && e.push(0), e;
}, bi = (r) => {
  const t = r * (Math.PI / 180), e = Math.round(Math.cos(t)), i = Math.round(Math.sin(t));
  return [e, i, 0, -i, e, 0, 0, 0, 1];
}, vi = bi(0), _i = (r) => [Z(r[0]), Z(r[1]), ye(r[2]), Z(r[3]), Z(r[4]), ye(r[5]), Z(r[6]), Z(r[7]), ye(r[8])], E = (r, t, e) => ({ type: r, contents: t && new Uint8Array(t.flat(10)), children: e }), L = (r, t, e, i, a) => E(r, [U(t), wi(e), i ?? []], a), So = (r) => r.isQuickTime ? E("ftyp", [O("qt  "), b(512), O("qt  ")]) : r.fragmented ? r.cmaf ? E("ftyp", [O("iso5"), b(512), O("iso5"), O("iso6"), O("mp41"), O("cmfc"), O("dash")]) : E("ftyp", [O("iso5"), b(512), O("iso5"), O("iso6"), O("mp41")]) : E("ftyp", [O("isom"), b(512), O("isom"), r.holdsAvc ? O("avc1") : [], O("mp41")]), Sr = () => E("styp", [O("iso5"), b(0), O("iso5"), O("iso6"), O("mp41"), O("cmfc"), O("dash")]), Br = (r, t) => {
  let e = r.maxWrittenEndTimestamp - r.minWrittenTimestamp;
  return Number.isFinite(e) || (e = 0), L("sidx", 1, 0, [b(1), b(et), st(W(r.minWrittenTimestamp, et)), st(0), S(0), S(1), b(2147483647 & t), b(W(e, et)), b(0)]);
}, Qt = (r) => ({ type: "mdat", largeSize: r }), Bo = (r) => ({ type: "free", size: r }), Rt = (r) => E("moov", void 0, [Ao(r.creationTime, r.trackDatas), ...r.trackDatas.map((t) => Io(t, r.creationTime)), r.isFragmented ? ys(r.trackDatas) : null, Ps(r)]), Ao = (r, t) => {
  const e = Math.max(0, ...t.map((s) => W(de(s), et) + W(s.startTimestampOffset ?? 0, et))), i = Math.max(0, ...t.map((s) => s.track.id)) + 1, a = !yt(r) || !yt(e), o = a ? st : b;
  return L("mvhd", +a, 0, [o(r), o(r), b(et), o(e), Z(1), yi(1), Array(10).fill(0), _i(vi), Array(24).fill(0), b(i)]);
}, de = (r) => {
  if (r.samples.length === 0) return 0;
  let t = 1 / 0, e = -1 / 0;
  for (let i = 0; i < r.samples.length; i++) {
    const a = r.samples[i];
    a.timestamp < t && (t = a.timestamp), a.timestamp + a.duration > e && (e = a.timestamp + a.duration);
  }
  return t === 1 / 0 ? 0 : e - t;
}, Io = (r, t) => {
  const e = Us(r), i = r.startTimestampOffset !== null && r.startTimestampOffset > 0;
  return E("trak", void 0, [Po(r, t), i ? Mo(r, r.startTimestampOffset) : null, Fo(r, t), e.name !== void 0 ? E("udta", void 0, [E("name", [...G.encode(e.name)])]) : null]);
}, Po = (r, t) => {
  var n;
  const e = W(de(r), et) + W(r.startTimestampOffset ?? 0, et), i = !yt(t) || !yt(e), a = i ? st : b;
  let o;
  if (r.type === "video") {
    const d = r.track.metadata.rotation;
    o = bi(d ?? 0);
  } else o = vi;
  let s = 2;
  return ((n = r.track.metadata.disposition) == null ? void 0 : n.default) !== !1 && (s |= 1), L("tkhd", +i, s, [a(t), a(t), b(r.track.id), b(0), a(e), Array(8).fill(0), S(0), S(r.track.id), yi(r.type === "audio" ? 1 : 0), S(0), _i(o), Z(r.type === "video" ? r.info.width : 0), Z(r.type === "video" ? r.info.height : 0)]);
}, Mo = (r, t) => {
  const e = W(t, et), i = W(de(r), et), a = !yt(e) || !yt(i), o = a ? st : b, s = a ? Eo : dt;
  return E("edts", void 0, [L("elst", a ? 1 : 0, 0, [b(2), o(e), s(-1), Z(1), o(i), s(0), Z(1)])]);
}, Fo = (r, t) => E("mdia", void 0, [Do(r, t), He(!0, Ro[r.type], Lo[r.type]), Vo(r)]), Do = (r, t) => {
  const e = W(de(r), r.timescale), i = !yt(t) || !yt(e), a = i ? st : b;
  return L("mdhd", +i, 0, [a(t), a(t), b(r.timescale), a(e), S(Ci(r.track.metadata.languageCode ?? "und")), S(0)]);
}, Ro = { video: "vide", audio: "soun", subtitle: "text" }, Lo = { video: "MediabunnyVideoHandler", audio: "MediabunnySoundHandler", subtitle: "MediabunnyTextHandler" }, He = (r, t, e, i = "\0\0\0\0") => L("hdlr", 0, 0, [r ? O("mhlr") : b(0), O(t), O(i), b(0), b(0), O(e, !0)]), Vo = (r) => E("minf", void 0, [Uo[r.type](), $o(), jo(r)]), Oo = () => L("vmhd", 0, 1, [S(0), S(0), S(0), S(0)]), No = () => L("smhd", 0, 0, [S(0), S(0)]), Wo = () => L("nmhd", 0, 0), Uo = { video: Oo, audio: No, subtitle: Wo }, $o = () => E("dinf", void 0, [zo()]), zo = () => L("dref", 0, 0, [b(1)], [Ho()]), Ho = () => L("url ", 0, 1), jo = (r) => {
  const t = r.compositionTimeOffsetTable.length > 1 || r.compositionTimeOffsetTable.some((e) => e.sampleCompositionTimeOffset !== 0);
  return E("stbl", void 0, [Go(r), hs(r), t ? gs(r) : null, t ? ws(r) : null, ms(r), ps(r), fs(r), us(r)]);
}, Go = (r) => {
  let t;
  if (r.type === "video") t = qo(Rs(r.track.source._codec, r.info.decoderConfig.codec), r);
  else if (r.type === "audio") {
    const e = ki(r.track.source._codec, r.muxer.isQuickTime);
    f(e), t = Zo(e, r);
  } else r.type === "subtitle" && (t = ds(Os[r.track.source._codec], r));
  return f(t), L("stsd", 0, 0, [b(1)], [t]);
}, qo = (r, t) => E(r, [Array(6).fill(0), S(1), S(0), S(0), Array(12).fill(0), S(t.info.width), S(t.info.height), b(4718592), b(4718592), b(0), S(1), Array(32).fill(0), S(24), ze(65535)], [Ls[t.track.source._codec](t), Xo(t), Qr(t.info.decoderConfig.colorSpace) ? Qo(t) : null]), Xo = (r) => r.info.pixelAspectRatio.num === r.info.pixelAspectRatio.den ? null : E("pasp", [b(r.info.pixelAspectRatio.num), b(r.info.pixelAspectRatio.den)]), Qo = (r) => E("colr", [O("nclx"), S(Wt[r.info.decoderConfig.colorSpace.primaries]), S(Ut[r.info.decoderConfig.colorSpace.transfer]), S($t[r.info.decoderConfig.colorSpace.matrix]), U((r.info.decoderConfig.colorSpace.fullRange ? 1 : 0) << 7)]), Yo = (r) => r.info.decoderConfig && E("avcC", [...q(r.info.decoderConfig.description)]), Ko = (r) => r.info.decoderConfig && E("hvcC", [...q(r.info.decoderConfig.description)]), Ar = (r) => {
  var l, c, h, u;
  if (!r.info.decoderConfig) return null;
  const t = r.info.decoderConfig, e = t.codec.split("."), i = Number(e[1]), a = Number(e[2]), o = (Number(e[3]) << 4) + ((e[4] ? Number(e[4]) : 1) << 1) + (e[8] ? Number(e[8]) : Number(((l = t.colorSpace) == null ? void 0 : l.fullRange) ?? 0)), s = e[5] ? Number(e[5]) : (c = t.colorSpace) != null && c.primaries ? Wt[t.colorSpace.primaries] : 2, n = e[6] ? Number(e[6]) : (h = t.colorSpace) != null && h.transfer ? Ut[t.colorSpace.transfer] : 2, d = e[7] ? Number(e[7]) : (u = t.colorSpace) != null && u.matrix ? $t[t.colorSpace.matrix] : 2;
  return L("vpcC", 1, 0, [U(i), U(a), U(o), U(s), U(n), U(d), S(0)]);
}, Jo = (r) => E("av1C", ri(r.info.decoderConfig.codec)), Zo = (r, t) => {
  var s;
  let e, i = 0, a = 16;
  const o = mt.includes(t.track.source._codec);
  if (o) {
    const n = t.track.source._codec, { sampleSize: d } = kt(n);
    a = 8 * d, a > 16 && (i = 1);
  }
  if (t.muxer.isQuickTime && (i = 1), i === 0) e = [Array(6).fill(0), S(1), S(i), S(0), b(0), S(t.info.numberOfChannels), S(a), S(0), S(0), S(t.info.sampleRate < 65536 ? t.info.sampleRate : 0), S(0)];
  else {
    const n = o ? 0 : -2;
    e = [Array(6).fill(0), S(1), S(i), S(0), b(0), S(t.info.numberOfChannels), S(Math.min(a, 16)), ze(n), S(0), S(t.info.sampleRate < 65536 ? t.info.sampleRate : 0), S(0), o ? [b(1), b(a / 8), b(t.info.numberOfChannels * a / 8)] : [b(0), b(0), b(0)], b(2)];
  }
  return E(r, e, [((s = Vs(t.track.source._codec, t.muxer.isQuickTime)) == null ? void 0 : s(t)) ?? null]);
}, ts = (r) => {
  let t;
  switch (r.track.source._codec) {
    case "aac":
      t = 64;
      break;
    case "mp3":
      t = 107;
      break;
    case "vorbis":
      t = 221;
      break;
    default:
      throw new Error(`Unhandled audio codec: ${r.track.source._codec}`);
  }
  let e = [...U(t), ...U(21), ...wi(0), ...b(0), ...b(0)];
  if (r.info.decoderConfig.description) {
    const i = q(r.info.decoderConfig.description);
    e = [...e, ...U(5), ...be(i.byteLength), ...i];
  }
  return e = [...S(1), ...U(0), ...U(4), ...be(e.length), ...e, ...U(6), ...U(1), ...U(2)], e = [...U(3), ...be(e.length), ...e], L("esds", 0, 0, e);
}, es = (r) => E("wave", void 0, [rs(r), is(r), E("\0\0\0\0")]), rs = (r) => E("frma", [O(ki(r.track.source._codec, r.muxer.isQuickTime))]), is = (r) => {
  const { littleEndian: t } = kt(r.track.source._codec);
  return E("enda", [S(+t)]);
}, as = (r) => {
  var d;
  let t = r.info.numberOfChannels, e = 3840, i = r.info.sampleRate, a = 0, o = 0, s = new Uint8Array(0);
  const n = (d = r.info.decoderConfig) == null ? void 0 : d.description;
  if (n) {
    f(n.byteLength >= 18);
    const l = q(n), c = li(l);
    t = c.outputChannelCount, e = c.preSkip, i = c.inputSampleRate, a = c.outputGain, o = c.channelMappingFamily, c.channelMappingTable && (s = c.channelMappingTable);
  }
  return E("dOps", [U(0), U(t), S(e), b(i), ze(a), U(o), ...s]);
}, os = (r) => {
  var i;
  const t = (i = r.info.decoderConfig) == null ? void 0 : i.description;
  f(t);
  const e = q(t);
  return L("dfLa", 0, 0, [...e.subarray(4)]);
}, ss = (r) => {
  const { littleEndian: t, sampleSize: e } = kt(r.track.source._codec);
  return L("pcmC", 0, 0, [U(+t), U(8 * e)]);
}, ns = (r) => {
  const t = eo(r.info.firstPacket.data);
  if (!t) throw new Error("Couldn't extract AC-3 frame info from the audio packet. Ensure the packets contain valid AC-3 sync frames (as specified in ETSI TS 102 366).");
  const e = new Uint8Array(3), i = new j(e);
  return i.writeBits(2, t.fscod), i.writeBits(5, t.bsid), i.writeBits(3, t.bsmod), i.writeBits(3, t.acmod), i.writeBits(1, t.lfeon), i.writeBits(5, t.bitRateCode), i.writeBits(5, 0), E("dac3", [...e]);
}, cs = (r) => {
  const t = io(r.info.firstPacket.data);
  if (!t) throw new Error("Couldn't extract E-AC-3 frame info from the audio packet. Ensure the packets contain valid E-AC-3 sync frames (as specified in ETSI TS 102 366).");
  let e = 16;
  for (const s of t.substreams) e += 23, s.numDepSub > 0 ? e += 9 : e += 1;
  const i = Math.ceil(e / 8), a = new Uint8Array(i), o = new j(a);
  o.writeBits(13, t.dataRate), o.writeBits(3, t.substreams.length - 1);
  for (const s of t.substreams) o.writeBits(2, s.fscod), o.writeBits(5, s.bsid), o.writeBits(1, 0), o.writeBits(1, 0), o.writeBits(3, s.bsmod), o.writeBits(3, s.acmod), o.writeBits(1, s.lfeon), o.writeBits(3, 0), o.writeBits(4, s.numDepSub), s.numDepSub > 0 ? o.writeBits(9, s.chanLoc) : o.writeBits(1, 0);
  return E("dec3", [...a]);
}, ds = (r, t) => E(r, [Array(6).fill(0), S(1)], [Ns[t.track.source._codec](t)]), ls = (r) => E("vttC", [...G.encode(r.info.config.description)]), hs = (r) => L("stts", 0, 0, [b(r.timeToSampleTable.length), r.timeToSampleTable.map((t) => [b(t.sampleCount), b(t.sampleDelta)])]), us = (r) => {
  if (r.samples.every((e) => e.type === "key")) return null;
  const t = [...r.samples.entries()].filter(([, e]) => e.type === "key");
  return L("stss", 0, 0, [b(t.length), t.map(([e]) => b(e + 1))]);
}, ms = (r) => L("stsc", 0, 0, [b(r.compactlyCodedChunkTable.length), r.compactlyCodedChunkTable.map((t) => [b(t.firstChunk), b(t.samplesPerChunk), b(1)])]), ps = (r) => {
  if (r.type === "audio" && r.info.requiresPcmTransformation) {
    const { sampleSize: t } = kt(r.track.source._codec);
    return L("stsz", 0, 0, [b(t * r.info.numberOfChannels), b(r.samples.reduce((e, i) => e + W(i.duration, r.timescale), 0))]);
  }
  return L("stsz", 0, 0, [b(0), b(r.samples.length), r.samples.map((t) => b(t.size))]);
}, fs = (r) => r.finalizedChunks.length > 0 && ot(r.finalizedChunks).offset >= 2 ** 32 ? L("co64", 0, 0, [b(r.finalizedChunks.length), r.finalizedChunks.map((t) => st(t.offset))]) : L("stco", 0, 0, [b(r.finalizedChunks.length), r.finalizedChunks.map((t) => b(t.offset))]), gs = (r) => L("ctts", 1, 0, [b(r.compositionTimeOffsetTable.length), r.compositionTimeOffsetTable.map((t) => [b(t.sampleCount), dt(t.sampleCompositionTimeOffset)])]), ws = (r) => {
  let t = 1 / 0, e = -1 / 0, i = 1 / 0, a = -1 / 0;
  f(r.compositionTimeOffsetTable.length > 0), f(r.samples.length > 0);
  for (let s = 0; s < r.compositionTimeOffsetTable.length; s++) {
    const n = r.compositionTimeOffsetTable[s];
    t = Math.min(t, n.sampleCompositionTimeOffset), e = Math.max(e, n.sampleCompositionTimeOffset);
  }
  for (let s = 0; s < r.samples.length; s++) {
    const n = r.samples[s];
    i = Math.min(i, W(n.timestamp, r.timescale)), a = Math.max(a, W(n.timestamp + n.duration, r.timescale));
  }
  const o = Math.max(-t, 0);
  return a >= 2 ** 31 ? null : L("cslg", 0, 0, [dt(o), dt(t), dt(e), dt(i), dt(a)]);
}, ys = (r) => E("mvex", void 0, r.map(bs)), bs = (r) => L("trex", 0, 0, [b(r.track.id), b(1), b(0), b(0), b(0)]), Ir = (r, t) => E("moof", void 0, [vs(r), ...t.map(_s)]), vs = (r) => L("mfhd", 0, 0, [b(r)]), xi = (r) => {
  let t = 0, e = 0;
  const i = r.type === "delta";
  return e |= +i, t |= i ? 1 : 2, t << 24 | e << 16;
}, _s = (r) => E("traf", void 0, [xs(r), Ts(r), ks(r)]), xs = (r) => {
  f(r.currentChunk);
  let t = 0;
  t |= 8, t |= 16, t |= 32, t |= 131072;
  const e = r.currentChunk.samples[1] ?? r.currentChunk.samples[0], i = { duration: e.timescaleUnitsToNextSample, size: e.size, flags: xi(e) };
  return L("tfhd", 0, 131128, [b(r.track.id), b(i.duration), b(i.size), b(i.flags)]);
}, Ts = (r) => (f(r.currentChunk), L("tfdt", 1, 0, [st(W(r.currentChunk.startTimestamp, r.timescale))])), ks = (r) => {
  f(r.currentChunk);
  const t = r.currentChunk.samples.map((p) => p.timescaleUnitsToNextSample), e = r.currentChunk.samples.map((p) => p.size), i = r.currentChunk.samples.map(xi), a = r.currentChunk.samples.map((p) => W(p.timestamp - p.decodeTimestamp, r.timescale)), o = new Set(t), s = new Set(e), n = new Set(i), d = new Set(a), l = n.size === 2 && i[0] !== i[1], c = o.size > 1, h = s.size > 1, u = !l && n.size > 1, m = d.size > 1 || [...d].some((p) => p !== 0);
  let w = 0;
  return w |= 1, w |= 4 * +l, w |= 256 * +c, w |= 512 * +h, w |= 1024 * +u, w |= 2048 * +m, L("trun", 1, w, [b(r.currentChunk.samples.length), b(r.currentChunk.offset - r.currentChunk.moofOffset || 0), l ? b(i[0]) : [], r.currentChunk.samples.map((p, v) => [c ? b(t[v]) : [], h ? b(e[v]) : [], u ? b(i[v]) : [], m ? dt(a[v]) : []])]);
}, Cs = (r) => E("mfra", void 0, [...r.map(Es), Ss()]), Es = (r, t) => L("tfra", 1, 0, [b(r.track.id), b(63), b(r.finalizedChunks.length), r.finalizedChunks.map((e) => [st(W(e.samples[0].timestamp, r.timescale)), st(e.moofOffset), b(t + 1), b(1), b(1)])]), Ss = () => L("mfro", 0, 0, [b(0)]), Bs = () => E("vtte"), As = (r, t, e, i, a) => E("vttc", void 0, [a !== null ? E("vsid", [dt(a)]) : null, e !== null ? E("iden", [...G.encode(e)]) : null, t !== null ? E("ctim", [...G.encode(gi(t))]) : null, i !== null ? E("sttg", [...G.encode(i)]) : null, E("payl", [...G.encode(r)])]), Is = (r) => E("vtta", [...G.encode(r)]), Ps = (r) => {
  const t = [], e = r.format._options.metadataFormat ?? "auto", i = r.output._metadataTags;
  if (e === "mdir" || e === "auto" && !r.isQuickTime) {
    const a = Fs(i);
    a && t.push(a);
  } else if (e === "mdta") {
    const a = Ds(i);
    a && t.push(a);
  } else (e === "udta" || e === "auto" && r.isQuickTime) && Ms(t, r.output._metadataTags);
  return t.length === 0 ? null : E("udta", void 0, t);
}, Ms = (r, t) => {
  for (const { key: e, value: i } of Oe(t)) switch (e) {
    case "title":
      r.push(at("©nam", i));
      break;
    case "description":
      r.push(at("©des", i));
      break;
    case "artist":
      r.push(at("©ART", i));
      break;
    case "album":
      r.push(at("©alb", i));
      break;
    case "albumArtist":
      r.push(at("albr", i));
      break;
    case "genre":
      r.push(at("©gen", i));
      break;
    case "date":
      r.push(at("©day", i.toISOString().slice(0, 10)));
      break;
    case "comment":
      r.push(at("©cmt", i));
      break;
    case "lyrics":
      r.push(at("©lyr", i));
      break;
    case "raw":
    case "discNumber":
    case "discsTotal":
    case "trackNumber":
    case "tracksTotal":
    case "images":
      break;
    default:
      It(e);
  }
  if (t.raw) for (const e in t.raw) {
    const i = t.raw[e];
    i == null || e.length !== 4 || r.some((a) => a.type === e) || (typeof i == "string" ? r.push(at(e, i)) : i instanceof Uint8Array && r.push(E(e, Array.from(i))));
  }
}, at = (r, t) => {
  const e = G.encode(t);
  return E(r, [S(e.length), S(Ci("und")), Array.from(e)]);
}, Pr = { "image/jpeg": 13, "image/png": 14, "image/bmp": 27 }, Ti = (r, t) => {
  const e = [];
  for (const { key: i, value: a } of Oe(r)) switch (i) {
    case "title":
      e.push({ key: t ? "title" : "©nam", value: J(a) });
      break;
    case "description":
      e.push({ key: t ? "description" : "©des", value: J(a) });
      break;
    case "artist":
      e.push({ key: t ? "artist" : "©ART", value: J(a) });
      break;
    case "album":
      e.push({ key: t ? "album" : "©alb", value: J(a) });
      break;
    case "albumArtist":
      e.push({ key: t ? "album_artist" : "aART", value: J(a) });
      break;
    case "comment":
      e.push({ key: t ? "comment" : "©cmt", value: J(a) });
      break;
    case "genre":
      e.push({ key: t ? "genre" : "©gen", value: J(a) });
      break;
    case "lyrics":
      e.push({ key: t ? "lyrics" : "©lyr", value: J(a) });
      break;
    case "date":
      e.push({ key: t ? "date" : "©day", value: J(a.toISOString().slice(0, 10)) });
      break;
    case "images":
      for (const o of a) o.kind === "coverFront" && e.push({ key: "covr", value: E("data", [b(Pr[o.mimeType] ?? 0), b(0), Array.from(o.data)]) });
      break;
    case "trackNumber":
      if (t) {
        const o = r.tracksTotal !== void 0 ? `${a}/${r.tracksTotal}` : a.toString();
        e.push({ key: "track", value: J(o) });
      } else e.push({ key: "trkn", value: E("data", [b(0), b(0), S(0), S(a), S(r.tracksTotal ?? 0), S(0)]) });
      break;
    case "discNumber":
      t || e.push({ key: "disc", value: E("data", [b(0), b(0), S(0), S(a), S(r.discsTotal ?? 0), S(0)]) });
      break;
    case "tracksTotal":
    case "discsTotal":
    case "raw":
      break;
    default:
      It(i);
  }
  if (r.raw) for (const i in r.raw) {
    const a = r.raw[i];
    a == null || !t && i.length !== 4 || e.some((o) => o.key === i) || (typeof a == "string" ? e.push({ key: i, value: J(a) }) : a instanceof Uint8Array ? e.push({ key: i, value: E("data", [b(0), b(0), Array.from(a)]) }) : a instanceof Zr && e.push({ key: i, value: E("data", [b(Pr[a.mimeType] ?? 0), b(0), Array.from(a.data)]) }));
  }
  return e;
}, Fs = (r) => {
  const t = Ti(r, !1);
  return t.length === 0 ? null : L("meta", 0, 0, void 0, [He(!1, "mdir", "", "appl"), E("ilst", void 0, t.map((e) => E(e.key, void 0, [e.value])))]);
}, Ds = (r) => {
  const t = Ti(r, !0);
  return t.length === 0 ? null : E("meta", void 0, [He(!1, "mdta", ""), L("keys", 0, 0, [b(t.length)], t.map((e) => E("mdta", [...G.encode(e.key)]))), E("ilst", void 0, t.map((e, i) => {
    const a = String.fromCharCode(...b(i + 1));
    return E(a, void 0, [e.value]);
  }))]);
}, J = (r) => E("data", [b(1), b(0), ...G.encode(r)]), Rs = (r, t) => {
  switch (r) {
    case "avc":
      return t.startsWith("avc3") ? "avc3" : "avc1";
    case "hevc":
      return "hvc1";
    case "vp8":
      return "vp08";
    case "vp9":
      return "vp09";
    case "av1":
      return "av01";
  }
}, Ls = { avc: Yo, hevc: Ko, vp8: Ar, vp9: Ar, av1: Jo }, ki = (r, t) => {
  switch (r) {
    case "aac":
    case "mp3":
    case "vorbis":
      return "mp4a";
    case "opus":
      return "Opus";
    case "flac":
      return "fLaC";
    case "ulaw":
      return "ulaw";
    case "alaw":
      return "alaw";
    case "pcm-u8":
      return "raw ";
    case "pcm-s8":
      return "sowt";
    case "ac3":
      return "ac-3";
    case "eac3":
      return "ec-3";
  }
  if (t) switch (r) {
    case "pcm-s16":
      return "sowt";
    case "pcm-s16be":
      return "twos";
    case "pcm-s24":
    case "pcm-s24be":
      return "in24";
    case "pcm-s32":
    case "pcm-s32be":
      return "in32";
    case "pcm-f32":
    case "pcm-f32be":
      return "fl32";
    case "pcm-f64":
    case "pcm-f64be":
      return "fl64";
  }
  else switch (r) {
    case "pcm-s16":
    case "pcm-s16be":
    case "pcm-s24":
    case "pcm-s24be":
    case "pcm-s32":
    case "pcm-s32be":
      return "ipcm";
    case "pcm-f32":
    case "pcm-f32be":
    case "pcm-f64":
    case "pcm-f64be":
      return "fpcm";
  }
}, Vs = (r, t) => {
  switch (r) {
    case "aac":
    case "mp3":
    case "vorbis":
      return ts;
    case "opus":
      return as;
    case "flac":
      return os;
    case "ac3":
      return ns;
    case "eac3":
      return cs;
  }
  if (t) switch (r) {
    case "pcm-s24":
    case "pcm-s24be":
    case "pcm-s32":
    case "pcm-s32be":
    case "pcm-f32":
    case "pcm-f32be":
    case "pcm-f64":
    case "pcm-f64be":
      return es;
  }
  else switch (r) {
    case "pcm-s16":
    case "pcm-s16be":
    case "pcm-s24":
    case "pcm-s24be":
    case "pcm-s32":
    case "pcm-s32be":
    case "pcm-f32":
    case "pcm-f32be":
    case "pcm-f64":
    case "pcm-f64be":
      return ss;
  }
  return null;
}, Os = { webvtt: "wvtt" }, Ns = { webvtt: ls }, Ci = (r) => {
  f(r.length === 3);
  let t = 0;
  for (let e = 0; e < 3; e++) t <<= 5, t += r.charCodeAt(e) - 96;
  return t;
};
class Be {
  constructor(t, e) {
    if (this.finalized = !1, this.started = !1, this.pos = 0, this.trackedWrites = null, this.trackedStart = -1, this.trackedEnd = -1, t._writerAcquired) throw new Error("Can't have multiple Writers for the same Target.");
    this.target = t, t._setMonotonicity(e), t._writerAcquired = !0;
  }
  start() {
    f(!this.started), this.target._start(), this.started = !0;
  }
  write(t) {
    f(this.started && !this.finalized), this.maybeTrackWrites(t), this.target._write(t, this.pos), this.pos += t.byteLength;
  }
  seek(t) {
    this.pos = t;
  }
  getPos() {
    return this.pos;
  }
  async flush() {
    return f(this.started && !this.finalized), this.target._flush();
  }
  async finalize() {
    f(this.started && !this.finalized), await this.target._finalize(), this.finalized = !0;
  }
  maybeTrackWrites(t) {
    if (!this.trackedWrites) return;
    let e = this.getPos();
    if (e < this.trackedStart) {
      if (e + t.byteLength <= this.trackedStart) return;
      t = t.subarray(this.trackedStart - e), e = 0;
    }
    const i = e + t.byteLength - this.trackedStart;
    let a = this.trackedWrites.byteLength;
    for (; a < i; ) a *= 2;
    if (a !== this.trackedWrites.byteLength) {
      const o = new Uint8Array(a);
      o.set(this.trackedWrites, 0), this.trackedWrites = o;
    }
    this.trackedWrites.set(t, e - this.trackedStart), this.trackedEnd = Math.max(this.trackedEnd, e + t.byteLength);
  }
  startTrackingWrites() {
    this.trackedWrites = new Uint8Array(1024), this.trackedStart = this.getPos(), this.trackedEnd = this.trackedStart;
  }
  stopTrackingWrites() {
    if (!this.trackedWrites) throw new Error("Internal error: Can't get tracked writes since nothing was tracked.");
    const t = { data: this.trackedWrites.subarray(0, this.trackedEnd - this.trackedStart), start: this.trackedStart, end: this.trackedEnd };
    return this.trackedWrites = null, t;
  }
}
class ct extends Jr {
  constructor() {
    super(...arguments), this._writerAcquired = !1, this._monotonicity = null, this.onwrite = null;
  }
  _setMonotonicity(t) {
    this._monotonicity !== !1 && (this._monotonicity = t);
  }
  _dispatchWrite(t, e) {
    var i;
    (i = this.onwrite) == null || i.call(this, t, e), this._emit("write", { start: t, end: e });
  }
  slice(t) {
    if (!Number.isInteger(t) || t < 0) throw new TypeError("offset must be a non-negative integer.");
    return new Ws(this, t);
  }
}
const In = 2 ** 32;
class Jt extends ct {
  constructor(t = {}) {
    if (super(), this.buffer = null, this._maxPos = 0, !t || typeof t != "object") throw new TypeError("BufferTarget options, when provided, must be an object.");
    if (t.onFinalize !== void 0 && typeof t.onFinalize != "function") throw new TypeError("options.onFinalize, when provided, must be a function.");
    if (this._options = t, this._supportsResize = "resize" in new ArrayBuffer(0), this._supportsResize) try {
      this._buffer = new ArrayBuffer(65536, { maxByteLength: 4294967296 });
    } catch {
      this._buffer = new ArrayBuffer(65536), this._supportsResize = !1;
    }
    else this._buffer = new ArrayBuffer(65536);
    this._bytes = new Uint8Array(this._buffer);
  }
  _ensureSize(t) {
    let e = this._buffer.byteLength;
    for (; e < t; ) e *= 2;
    if (e !== this._buffer.byteLength) {
      if (e > 4294967296) throw new Error("ArrayBuffer exceeded maximum size of 4294967296 bytes. Please consider using another target.");
      if (this._supportsResize) this._buffer.resize(e);
      else {
        const i = new ArrayBuffer(e), a = new Uint8Array(i);
        a.set(this._bytes, 0), this._buffer = i, this._bytes = a;
      }
    }
  }
  _start() {
  }
  _write(t, e) {
    this._ensureSize(e + t.byteLength), this._bytes.set(t, e), this._maxPos = Math.max(this._maxPos, e + t.byteLength), this._dispatchWrite(e, e + t.byteLength);
  }
  async _flush() {
  }
  async _finalize() {
    this.buffer = this._buffer.slice(0, this._maxPos), this._options.onFinalize && await this._options.onFinalize(this.buffer), this._emit("finalized");
  }
  async _close() {
  }
  _getSlice(t, e) {
    return this._bytes.slice(t, e);
  }
}
class Ws extends ct {
  constructor(t, e) {
    super(), this._baseTarget = t, this._offset = e;
  }
  _start() {
  }
  _write(t, e) {
    this._baseTarget._write(t, this._offset + e), this._dispatchWrite(e, e + t.byteLength);
  }
  _flush() {
    return this._baseTarget._flush();
  }
  async _finalize() {
    this._emit("finalized");
  }
  async _close() {
  }
  _setMonotonicity(t) {
    super._setMonotonicity(t), this._baseTarget._setMonotonicity(t);
  }
}
class ve {
  constructor(t, e) {
    if (this.rootPath = t, this.getTarget = e, typeof t != "string") throw new TypeError("rootPath must be a string.");
    if (typeof e != "function") throw new TypeError("getTarget must be a function.");
  }
}
const et = 57600;
const Us = (r) => {
  const t = {}, e = r.track;
  return e.metadata.name !== void 0 && (t.name = e.metadata.name), t;
}, W = (r, t, e = !0) => {
  const i = r * t;
  return e ? Math.round(i) : i;
};
class $s extends fi {
  constructor(t, e) {
    super(t), this.writer = null, this.boxWriter = null, this.initWriter = null, this.initBoxWriter = null, this.auxTarget = new Jt(), this.auxWriter = new Be(this.auxTarget, !1), this.auxBoxWriter = new Xt(this.auxWriter), this.mdat = null, this.ftypSize = null, this.trackDatas = [], this.allTracksKnown = Ve(), this.creationTime = Math.floor(Date.now() / 1e3) + 2082844800, this.finalizedChunks = [], this.nextFragmentNumber = 1, this.maxWrittenTimestamp = -1 / 0, this.minWrittenTimestamp = 1 / 0, this.maxWrittenEndTimestamp = -1 / 0, this.segmentHeaderSize = null, this.format = e, this.isQuickTime = e instanceof Si, this.isCmaf = e instanceof Rr, this.minimumFragmentDuration = e._options.minimumFragmentDuration ?? (e instanceof Rr ? 1 / 0 : 1);
  }
  async start() {
    var i;
    const t = await this.mutex.acquire();
    if (this.isCmaf ? (this.fastStart = "fragmented", this.isFragmented = !0) : (this.writer = await this.output._getRootWriter((a) => this.format._options.fastStart !== void 0 ? this.format._options.fastStart === "fragmented" : a instanceof Jt), this.boxWriter = new Xt(this.writer), this.fastStart = this.format._options.fastStart ?? (this.writer.target instanceof Jt && "in-memory"), this.isFragmented = this.fastStart === "fragmented"), this.isCmaf) {
      if (!this.output._hasInitTarget()) throw new Error("CMAF outputs require the initTarget field in OutputOptions to be set; the init segment will be written to it.");
      const a = await this.output._getInitTarget(), o = new Be(a, !0);
      o.start(), this.initWriter = o, this.initBoxWriter = new Xt(o);
    }
    const e = this.output._tracks.some((a) => a.isVideoTrack() && a.source._codec === "avc");
    {
      const a = this.initBoxWriter ?? this.boxWriter;
      if (f(a), this.format._options.onFtyp && a.writer.startTrackingWrites(), a.writeBox(So({ isQuickTime: this.isQuickTime, holdsAvc: e, fragmented: this.isFragmented, cmaf: this.isCmaf })), this.format._options.onFtyp) {
        const { data: o, start: s } = a.writer.stopTrackingWrites();
        this.format._options.onFtyp(o, s);
      }
      this.ftypSize = a.writer.getPos(), this.isCmaf && await this.initWriter.flush();
    }
    if (this.fastStart !== "in-memory") if (this.fastStart === "reserve") {
      for (const a of this.output._tracks) if (a.metadata.maximumPacketCount === void 0) throw new Error("All tracks must specify maximumPacketCount in their metadata when using fastStart: 'reserve'.");
    } else this.isFragmented || (f(this.writer), f(this.boxWriter), this.format._options.onMdat && this.writer.startTrackingWrites(), this.mdat = Qt(!0), this.boxWriter.writeBox(this.mdat));
    await ((i = this.writer) == null ? void 0 : i.flush()), t();
  }
  allTracksAreKnown() {
    for (const t of this.output._tracks) if (!t.source._closed && !this.trackDatas.some((e) => e.track === t)) return !1;
    return !0;
  }
  async getMimeType() {
    await this.allTracksKnown.promise;
    const t = this.trackDatas.map((e) => e.type === "video" || e.type === "audio" ? e.info.decoderConfig.codec : { webvtt: "wvtt" }[e.track.source._codec]);
    return ao({ isQuickTime: this.isQuickTime, hasVideo: this.trackDatas.some((e) => e.type === "video"), hasAudio: this.trackDatas.some((e) => e.type === "audio"), codecStrings: t });
  }
  getVideoTrackData(t, e, i) {
    const a = this.trackDatas.find((u) => u.track === t);
    if (a) return a;
    ai(i), f(i), f(i.decoderConfig);
    const o = { ...i.decoderConfig };
    f(o.codedWidth !== void 0), f(o.codedHeight !== void 0);
    let s = !1;
    if (t.source._codec !== "avc" || o.description) {
      if (t.source._codec === "hevc" && !o.description) {
        const u = ja(e.data);
        if (!u) throw new Error("Couldn't extract an HEVCDecoderConfigurationRecord from the HEVC packet. Make sure the packets are in Annex B format (as specified in ITU-T-REC-H.265) when not providing a description, or provide a description (must be an HEVCDecoderConfigurationRecord as specified in ISO 14496-15) and ensure the packets are in HEVC format.");
        o.description = Ja(u), s = !0;
      }
    } else {
      const u = Wa(e.data);
      if (!u) throw new Error("Couldn't extract an AVCDecoderConfigurationRecord from the AVC packet. Make sure the packets are in Annex B format (as specified in ITU-T-REC-H.264) when not providing a description, or provide a description (must be an AVCDecoderConfigurationRecord as specified in ISO 14496-15) and ensure the packets are in AVCC format.");
      o.description = Ua(u), s = !0;
    }
    const n = fa(1 / (t.metadata.frameRate ?? et), 1e6).den, d = o.displayAspectWidth, l = o.displayAspectHeight, c = d === void 0 || l === void 0 ? { num: 1, den: 1 } : Ne({ num: d * o.codedHeight, den: l * o.codedWidth }), h = { muxer: this, track: t, type: "video", info: { width: o.codedWidth, height: o.codedHeight, pixelAspectRatio: c, decoderConfig: o, requiresAnnexBTransformation: s }, timescale: n, samples: [], sampleQueue: [], timestampProcessingQueue: [], timeToSampleTable: [], compositionTimeOffsetTable: [], lastTimescaleUnits: null, lastSample: null, startTimestampOffset: null, finalizedChunks: [], currentChunk: null, compactlyCodedChunkTable: [], closed: !1 };
    return this.trackDatas.push(h), this.trackDatas.sort((u, m) => u.track.id - m.track.id), this.allTracksAreKnown() && this.allTracksKnown.resolve(), h;
  }
  getAudioTrackData(t, e, i) {
    const a = this.trackDatas.find((d) => d.track === t);
    if (a) return a;
    oi(i), f(i), f(i.decoderConfig);
    const o = { ...i.decoderConfig };
    let s = !1;
    if (t.source._codec === "aac" && !o.description) {
      const d = re(Ct.tempFromBytes(e.data));
      if (!d) throw new Error("Couldn't parse ADTS header from the AAC packet. Make sure the packets are in ADTS format (as specified in ISO 13818-7) when not providing a description, or provide a description (must be an AudioSpecificConfig as specified in ISO 14496-3) and ensure the packets are raw AAC data.");
      const l = We[d.samplingFrequencyIndex], c = Ue[d.channelConfiguration];
      if (l === void 0 || c === void 0) throw new Error("Invalid ADTS frame header.");
      o.description = ei({ objectType: d.objectType, sampleRate: l, numberOfChannels: c }), s = !0;
    }
    const n = { muxer: this, track: t, type: "audio", info: { numberOfChannels: i.decoderConfig.numberOfChannels, sampleRate: i.decoderConfig.sampleRate, decoderConfig: o, requiresPcmTransformation: !this.isFragmented && mt.includes(t.source._codec), expectedNextPcmPacketTimestamp: null, requiresAdtsStripping: s, firstPacket: e }, timescale: o.sampleRate, samples: [], sampleQueue: [], timestampProcessingQueue: [], timeToSampleTable: [], compositionTimeOffsetTable: [], lastTimescaleUnits: null, lastSample: null, startTimestampOffset: null, finalizedChunks: [], currentChunk: null, compactlyCodedChunkTable: [], closed: !1 };
    return this.trackDatas.push(n), this.trackDatas.sort((d, l) => d.track.id - l.track.id), this.allTracksAreKnown() && this.allTracksKnown.resolve(), n;
  }
  getSubtitleTrackData(t, e) {
    const i = this.trackDatas.find((o) => o.track === t);
    if (i) return i;
    si(e), f(e), f(e.config);
    const a = { muxer: this, track: t, type: "subtitle", info: { config: e.config }, timescale: 1e3, samples: [], sampleQueue: [], timestampProcessingQueue: [], timeToSampleTable: [], compositionTimeOffsetTable: [], lastTimescaleUnits: null, lastSample: null, startTimestampOffset: null, finalizedChunks: [], currentChunk: null, compactlyCodedChunkTable: [], closed: !1, lastCueEndTimestamp: 0, cueQueue: [], nextSourceId: 0, cueToSourceId: /* @__PURE__ */ new WeakMap() };
    return this.trackDatas.push(a), this.trackDatas.sort((o, s) => o.track.id - s.track.id), this.allTracksAreKnown() && this.allTracksKnown.resolve(), a;
  }
  async addEncodedVideoPacket(t, e, i) {
    const a = await this.mutex.acquire();
    try {
      const o = this.getVideoTrackData(t, e, i);
      let s = e.data;
      if (o.info.requiresAnnexBTransformation) {
        const d = [...zt(s)].map((l) => s.subarray(l.offset, l.offset + l.length));
        if (d.length === 0) throw new Error("Failed to transform packet data. Make sure all packets are provided in Annex B format, as specified in ITU-T-REC-H.264 and ITU-T-REC-H.265.");
        s = Na(d, 4);
      }
      this.validateTimestamp(o.track, e.timestamp, e.type === "key");
      const n = this.createSampleForTrack(o, s, e.timestamp, e.duration, e.type);
      await this.registerSample(o, n);
    } finally {
      a();
    }
  }
  async addEncodedAudioPacket(t, e, i) {
    const a = await this.mutex.acquire();
    try {
      const o = this.getAudioTrackData(t, e, i);
      let s = e.data;
      if (o.info.requiresAdtsStripping) {
        const c = re(Ct.tempFromBytes(s));
        if (!c) throw new Error("Expected ADTS frame, didn't get one.");
        const h = c.crcCheck === null ? 7 : 9;
        s = s.subarray(h);
      }
      this.validateTimestamp(o.track, e.timestamp, e.type === "key");
      let n = e.timestamp, d = e.duration;
      if (o.info.requiresPcmTransformation) {
        const c = kt(o.info.decoderConfig.codec).sampleSize * o.info.numberOfChannels;
        if (d = s.byteLength / c / o.info.sampleRate, o.info.expectedNextPcmPacketTimestamp !== null) {
          const h = n - o.info.expectedNextPcmPacketTimestamp;
          if (h < 0.01) n = o.info.expectedNextPcmPacketTimestamp;
          else {
            const u = await this.padWithSilence(o, o.info.expectedNextPcmPacketTimestamp, h);
            n = o.info.expectedNextPcmPacketTimestamp + u;
          }
        }
        o.info.expectedNextPcmPacketTimestamp = n + d;
      }
      const l = this.createSampleForTrack(o, s, n, d, e.type);
      await this.registerSample(o, l);
    } finally {
      a();
    }
  }
  async padWithSilence(t, e, i) {
    const a = W(i, t.timescale);
    if (i = a / t.timescale, a > 0) {
      const { sampleSize: o, silentValue: s } = kt(t.info.decoderConfig.codec), n = a * t.info.numberOfChannels, d = new Uint8Array(o * n).fill(s), l = this.createSampleForTrack(t, new Uint8Array(d.buffer), e, i, "key");
      await this.registerSample(t, l);
    }
    return i;
  }
  async addSubtitleCue(t, e, i) {
    const a = await this.mutex.acquire();
    try {
      const o = this.getSubtitleTrackData(t, i);
      this.validateTimestamp(o.track, e.timestamp, !0), t.source._codec === "webvtt" && (o.cueQueue.push(e), await this.processWebVTTCues(o, e.timestamp));
    } finally {
      a();
    }
  }
  async processWebVTTCues(t, e) {
    for (; t.cueQueue.length > 0; ) {
      const i = /* @__PURE__ */ new Set([]);
      for (const l of t.cueQueue) f(l.timestamp <= e), f(t.lastCueEndTimestamp <= l.timestamp + l.duration), i.add(Math.max(l.timestamp, t.lastCueEndTimestamp)), i.add(l.timestamp + l.duration);
      const a = [...i].sort((l, c) => l - c), o = a[0], s = a[1] ?? o;
      if (e < s) break;
      if (t.lastCueEndTimestamp < o) {
        this.auxWriter.seek(0);
        const l = Bs();
        this.auxBoxWriter.writeBox(l);
        const c = this.auxTarget._getSlice(0, this.auxWriter.getPos()), h = this.createSampleForTrack(t, c, t.lastCueEndTimestamp, o - t.lastCueEndTimestamp, "key");
        await this.registerSample(t, h), t.lastCueEndTimestamp = o;
      }
      this.auxWriter.seek(0);
      for (let l = 0; l < t.cueQueue.length; l++) {
        const c = t.cueQueue[l];
        if (c.timestamp >= s) break;
        ie.lastIndex = 0;
        const h = ie.test(c.text), u = c.timestamp + c.duration;
        let m = t.cueToSourceId.get(c);
        if (m === void 0 && s < u && (m = t.nextSourceId++, t.cueToSourceId.set(c, m)), c.notes) {
          const p = Is(c.notes);
          this.auxBoxWriter.writeBox(p);
        }
        const w = As(c.text, h ? o : null, c.identifier ?? null, c.settings ?? null, m ?? null);
        this.auxBoxWriter.writeBox(w), u === s && t.cueQueue.splice(l--, 1);
      }
      const n = this.auxTarget._getSlice(0, this.auxWriter.getPos()), d = this.createSampleForTrack(t, n, o, s - o, "key");
      await this.registerSample(t, d), t.lastCueEndTimestamp = s;
    }
  }
  createSampleForTrack(t, e, i, a, o) {
    return { timestamp: i, decodeTimestamp: i, duration: a, data: e, size: e.byteLength, type: o, timescaleUnitsToNextSample: W(a, t.timescale) };
  }
  processTimestamps(t, e) {
    if (t.timestampProcessingQueue.length === 0) return;
    if (t.type === "audio" && t.info.requiresPcmTransformation) {
      this.isFragmented || (t.startTimestampOffset ?? (t.startTimestampOffset = t.timestampProcessingQueue[0].timestamp));
      let a = 0;
      for (let o = 0; o < t.timestampProcessingQueue.length; o++) {
        const s = t.timestampProcessingQueue[o];
        a += W(s.duration, t.timescale);
      }
      return t.timeToSampleTable.length === 0 ? t.timeToSampleTable.push({ sampleCount: a, sampleDelta: 1 }) : ot(t.timeToSampleTable).sampleCount += a, void (t.timestampProcessingQueue.length = 0);
    }
    const i = t.timestampProcessingQueue.map((a) => a.timestamp).sort((a, o) => a - o);
    this.isFragmented || (t.startTimestampOffset ?? (t.startTimestampOffset = i[0]));
    for (let a = 0; a < t.timestampProcessingQueue.length; a++) {
      const o = t.timestampProcessingQueue[a];
      o.decodeTimestamp = i[a];
      const s = W(o.timestamp - o.decodeTimestamp, t.timescale), n = W(o.duration, t.timescale);
      if (t.lastTimescaleUnits !== null) {
        f(t.lastSample);
        const d = W(o.decodeTimestamp, t.timescale, !1), l = Math.round(d - t.lastTimescaleUnits);
        if (f(l >= 0), t.lastTimescaleUnits += l, t.lastSample.timescaleUnitsToNextSample = l, !this.isFragmented) {
          let c = ot(t.timeToSampleTable);
          if (f(c), c.sampleCount === 1) {
            c.sampleDelta = l;
            const u = t.timeToSampleTable[t.timeToSampleTable.length - 2];
            u && u.sampleDelta === l && (u.sampleCount++, t.timeToSampleTable.pop(), c = u);
          } else c.sampleDelta !== l && (c.sampleCount--, t.timeToSampleTable.push(c = { sampleCount: 1, sampleDelta: l }));
          c.sampleDelta === n ? c.sampleCount++ : t.timeToSampleTable.push({ sampleCount: 1, sampleDelta: n });
          const h = ot(t.compositionTimeOffsetTable);
          f(h), h.sampleCompositionTimeOffset === s ? h.sampleCount++ : t.compositionTimeOffsetTable.push({ sampleCount: 1, sampleCompositionTimeOffset: s });
        }
      } else t.lastTimescaleUnits = W(o.decodeTimestamp, t.timescale, !1), this.isFragmented || (t.timeToSampleTable.push({ sampleCount: 1, sampleDelta: n }), t.compositionTimeOffsetTable.push({ sampleCount: 1, sampleCompositionTimeOffset: s }));
      t.lastSample = o;
    }
    if (t.timestampProcessingQueue.length = 0, f(t.lastSample), f(t.lastTimescaleUnits !== null), e !== void 0 && t.lastSample.timescaleUnitsToNextSample === 0) {
      f(e.type === "key");
      const a = W(e.timestamp, t.timescale, !1), o = Math.round(a - t.lastTimescaleUnits);
      t.lastSample.timescaleUnitsToNextSample = o;
    }
  }
  async registerSample(t, e) {
    e.type === "key" && this.processTimestamps(t, e), t.timestampProcessingQueue.push(e), this.isFragmented ? (t.sampleQueue.push(e), await this.interleaveSamples()) : this.fastStart === "reserve" ? await this.registerSampleFastStartReserve(t, e) : await this.addSampleToTrack(t, e);
  }
  async addSampleToTrack(t, e) {
    if (!this.isFragmented && (t.samples.push(e), this.fastStart === "reserve")) {
      const a = t.track.metadata.maximumPacketCount;
      if (f(a !== void 0), t.samples.length > a) throw new Error(`Track #${t.track.id} has already reached the maximum packet count (${a}). Either add less packets or increase the maximum packet count.`);
    }
    let i = !1;
    if (t.currentChunk) {
      t.currentChunk.startTimestamp = Math.min(t.currentChunk.startTimestamp, e.timestamp);
      const a = e.timestamp - t.currentChunk.startTimestamp;
      if (this.isFragmented) {
        const o = this.trackDatas.every((s) => {
          if (t === s) return e.type === "key";
          const n = s.sampleQueue[0];
          return n ? n.type === "key" : s.closed;
        });
        a >= this.minimumFragmentDuration && o && e.timestamp > this.maxWrittenTimestamp && (i = !0, await this.finalizeFragment());
      } else i = a >= 0.5;
    } else i = !0;
    i && (t.currentChunk && await this.finalizeCurrentChunk(t), t.currentChunk = { startTimestamp: e.timestamp, samples: [], offset: null, moofOffset: null }), f(t.currentChunk), t.currentChunk.samples.push(e), this.isFragmented && (this.maxWrittenTimestamp = Math.max(this.maxWrittenTimestamp, e.timestamp), this.maxWrittenEndTimestamp = Math.max(this.maxWrittenEndTimestamp, e.timestamp + e.duration), this.minWrittenTimestamp = Math.min(this.minWrittenTimestamp, e.timestamp));
  }
  async finalizeCurrentChunk(t) {
    if (f(!this.isFragmented), f(this.writer), !t.currentChunk) return;
    t.finalizedChunks.push(t.currentChunk), this.finalizedChunks.push(t.currentChunk);
    let e = t.currentChunk.samples.length;
    if (t.type === "audio" && t.info.requiresPcmTransformation && (e = t.currentChunk.samples.reduce((i, a) => i + W(a.duration, t.timescale), 0)), t.compactlyCodedChunkTable.length !== 0 && ot(t.compactlyCodedChunkTable).samplesPerChunk === e || t.compactlyCodedChunkTable.push({ firstChunk: t.finalizedChunks.length, samplesPerChunk: e }), this.fastStart !== "in-memory") {
      t.currentChunk.offset = this.writer.getPos();
      for (const i of t.currentChunk.samples) f(i.data), this.writer.write(i.data), i.data = null;
      await this.writer.flush();
    } else t.currentChunk.offset = 0;
  }
  async interleaveSamples(t = !1) {
    if (f(this.isFragmented), t || this.allTracksAreKnown()) t: for (; ; ) {
      let e = null, i = 1 / 0;
      for (const o of this.trackDatas) {
        if (!t && o.sampleQueue.length === 0 && !o.closed) break t;
        o.sampleQueue.length > 0 && o.sampleQueue[0].timestamp < i && (e = o, i = o.sampleQueue[0].timestamp);
      }
      if (!e) break;
      const a = e.sampleQueue.shift();
      await this.addSampleToTrack(e, a);
    }
  }
  async finalizeFragment(t = !this.isCmaf) {
    f(this.isFragmented);
    const e = this.nextFragmentNumber++;
    if (e === 1) {
      const m = this.initBoxWriter ?? this.boxWriter;
      f(m), this.format._options.onMoov && m.writer.startTrackingWrites();
      const w = Rt(this);
      if (m.writeBox(w), this.format._options.onMoov) {
        const { data: p, start: v } = m.writer.stopTrackingWrites();
        this.format._options.onMoov(p, v);
      }
      if (this.isCmaf) {
        f(this.initWriter), await this.initWriter.flush(), await this.initWriter.finalize(), this.writer = await this.output._getRootWriter(!0), this.boxWriter = new Xt(this.writer);
        const p = this.boxWriter.measureBox(Sr()), v = this.boxWriter.measureBox(Br(this, 0));
        this.segmentHeaderSize = p + v, this.writer.seek(this.segmentHeaderSize);
      }
    }
    f(this.writer), f(this.boxWriter);
    const i = this.trackDatas.filter((m) => m.currentChunk), a = Ir(e, i), o = this.writer.getPos(), s = o + this.boxWriter.measureBox(a);
    let n = s + 8, d = 1 / 0;
    for (const m of i) {
      m.currentChunk.offset = n, m.currentChunk.moofOffset = o;
      for (const w of m.currentChunk.samples) n += w.size;
      d = Math.min(d, m.currentChunk.startTimestamp);
    }
    const l = n - s, c = l >= 2 ** 32;
    if (c) for (const m of i) m.currentChunk.offset += 8;
    this.format._options.onMoof && this.writer.startTrackingWrites();
    const h = Ir(e, i);
    if (this.boxWriter.writeBox(h), this.format._options.onMoof) {
      const { data: m, start: w } = this.writer.stopTrackingWrites();
      this.format._options.onMoof(m, w, d);
    }
    f(this.writer.getPos() === s), this.format._options.onMdat && this.writer.startTrackingWrites();
    const u = Qt(c);
    u.size = l, this.boxWriter.writeBox(u), this.writer.seek(s + (c ? 16 : 8));
    for (const m of i) for (const w of m.currentChunk.samples) this.writer.write(w.data), w.data = null;
    if (this.format._options.onMdat) {
      const { data: m, start: w } = this.writer.stopTrackingWrites();
      this.format._options.onMdat(m, w);
    }
    for (const m of i) m.finalizedChunks.push(m.currentChunk), this.finalizedChunks.push(m.currentChunk), m.currentChunk = null;
    t && await this.writer.flush();
  }
  async registerSampleFastStartReserve(t, e) {
    if (f(this.writer), f(this.boxWriter), this.allTracksAreKnown()) {
      if (!this.mdat) {
        const i = Rt(this), a = this.boxWriter.measureBox(i) + this.computeSampleTableSizeUpperBound() + 4096;
        f(this.ftypSize !== null), this.writer.seek(this.ftypSize + a), this.format._options.onMdat && this.writer.startTrackingWrites(), this.mdat = Qt(!0), this.boxWriter.writeBox(this.mdat);
        for (const o of this.trackDatas) {
          for (const s of o.sampleQueue) await this.addSampleToTrack(o, s);
          o.sampleQueue.length = 0;
        }
      }
      await this.addSampleToTrack(t, e);
    } else t.sampleQueue.push(e);
  }
  computeSampleTableSizeUpperBound() {
    f(this.fastStart === "reserve");
    let t = 0;
    for (const e of this.trackDatas) {
      const i = e.track.metadata.maximumPacketCount;
      f(i !== void 0), t += 8 * Math.ceil(2 / 3 * i), t += 4 * i, t += 8 * Math.ceil(2 / 3 * i), t += 12 * Math.ceil(2 / 3 * i), t += 4 * i, t += 8 * i;
    }
    return t;
  }
  async onTrackClose(t) {
    const e = await this.mutex.acquire(), i = this.trackDatas.find((a) => a.track === t);
    i && (i.closed = !0, i.type === "subtitle" && t.source._codec === "webvtt" && await this.processWebVTTCues(i, 1 / 0), this.processTimestamps(i)), this.allTracksAreKnown() && this.allTracksKnown.resolve(), this.isFragmented && await this.interleaveSamples(), e();
  }
  async finalize() {
    const t = await this.mutex.acquire();
    this.allTracksKnown.resolve();
    for (const e of this.trackDatas) e.closed = !0, e.type === "subtitle" && e.track.source._codec === "webvtt" && await this.processWebVTTCues(e, 1 / 0), this.processTimestamps(e);
    if (this.isFragmented) await this.interleaveSamples(!0), await this.finalizeFragment(!1);
    else for (const e of this.trackDatas) {
      await this.finalizeCurrentChunk(e), f(e.startTimestampOffset !== null);
      for (let i = 0; i < e.samples.length; i++) {
        const a = e.samples[i];
        a.timestamp -= e.startTimestampOffset, a.decodeTimestamp -= e.startTimestampOffset;
      }
    }
    if (f(this.writer), f(this.boxWriter), this.fastStart === "in-memory") {
      let e;
      this.mdat = Qt(!1);
      for (let a = 0; a < 2; a++) {
        const o = Rt(this), s = this.boxWriter.measureBox(o);
        e = this.boxWriter.measureBox(this.mdat);
        let n = this.writer.getPos() + s + e;
        for (const d of this.finalizedChunks) {
          d.offset = n;
          for (const { data: l } of d.samples) f(l), n += l.byteLength, e += l.byteLength;
        }
        if (n < 2 ** 32) break;
        e >= 2 ** 32 && (this.mdat.largeSize = !0);
      }
      this.format._options.onMoov && this.writer.startTrackingWrites();
      const i = Rt(this);
      if (this.boxWriter.writeBox(i), this.format._options.onMoov) {
        const { data: a, start: o } = this.writer.stopTrackingWrites();
        this.format._options.onMoov(a, o);
      }
      this.format._options.onMdat && this.writer.startTrackingWrites(), this.mdat.size = e, this.boxWriter.writeBox(this.mdat);
      for (const a of this.finalizedChunks) for (const o of a.samples) f(o.data), this.writer.write(o.data), o.data = null;
      if (this.format._options.onMdat) {
        const { data: a, start: o } = this.writer.stopTrackingWrites();
        this.format._options.onMdat(a, o);
      }
    } else if (this.isFragmented) if (this.isCmaf) {
      const e = this.segmentHeaderSize !== null ? this.writer.getPos() - this.segmentHeaderSize : 0;
      this.writer.seek(0), this.boxWriter.writeBox(Sr()), this.boxWriter.writeBox(Br(this, e));
    } else {
      const e = this.writer.getPos(), i = Cs(this.trackDatas);
      this.boxWriter.writeBox(i);
      const a = this.writer.getPos() - e;
      this.writer.seek(this.writer.getPos() - 4), this.boxWriter.writeU32(a);
    }
    else {
      f(this.mdat);
      const e = this.boxWriter.offsets.get(this.mdat);
      f(e !== void 0);
      const i = this.writer.getPos() - e;
      if (this.mdat.size = i, this.mdat.largeSize = i >= 2 ** 32, this.boxWriter.patchBox(this.mdat), this.format._options.onMdat) {
        const { data: o, start: s } = this.writer.stopTrackingWrites();
        this.format._options.onMdat(o, s);
      }
      const a = Rt(this);
      if (this.fastStart === "reserve") {
        f(this.ftypSize !== null), this.writer.seek(this.ftypSize), this.format._options.onMoov && this.writer.startTrackingWrites(), this.boxWriter.writeBox(a);
        const o = this.boxWriter.offsets.get(this.mdat) - this.writer.getPos();
        this.boxWriter.writeBox(Bo(o));
      } else this.format._options.onMoov && this.writer.startTrackingWrites(), this.boxWriter.writeBox(a);
      if (this.format._options.onMoov) {
        const { data: o, start: s } = this.writer.stopTrackingWrites();
        this.format._options.onMoov(o, s);
      }
    }
    t();
  }
}
const Mr = "Mediabunny";
const zs = { video: 1, audio: 2, subtitle: 17 };
class Hs extends fi {
  constructor(t, e) {
    super(t), this.trackDatas = [], this.allTracksKnown = Ve(), this.segment = null, this.segmentInfo = null, this.seekHead = null, this.tracksElement = null, this.tagsElement = null, this.attachmentsElement = null, this.segmentDuration = null, this.cues = null, this.currentCluster = null, this.currentClusterStartMsTimestamp = null, this.currentClusterMaxMsTimestamp = null, this.trackDatasInCurrentCluster = /* @__PURE__ */ new Map(), this.startTimestamp = 1 / 0, this.endTimestamp = -1 / 0, this.format = e;
  }
  async start() {
    const t = await this.mutex.acquire();
    this.writer = await this.output._getRootWriter(!!this.format._options.appendOnly), this.ebmlWriter = new so(this.writer), this.writeEBMLHeader(), this.createSegmentInfo(), this.createCues(), await this.writer.flush(), t();
  }
  writeEBMLHeader() {
    this.format._options.onEbmlHeader && this.writer.startTrackingWrites();
    const t = { id: y.EBML, data: [{ id: y.EBMLVersion, data: 1 }, { id: y.EBMLReadVersion, data: 1 }, { id: y.EBMLMaxIDLength, data: 4 }, { id: y.EBMLMaxSizeLength, data: 8 }, { id: y.DocType, data: this.format instanceof ae ? "webm" : "matroska" }, { id: y.DocTypeVersion, data: 2 }, { id: y.DocTypeReadVersion, data: 2 }] };
    if (this.ebmlWriter.writeEBML(t), this.format._options.onEbmlHeader) {
      const { data: e, start: i } = this.writer.stopTrackingWrites();
      this.format._options.onEbmlHeader(e, i);
    }
  }
  maybeCreateSeekHead(t) {
    if (this.format._options.appendOnly) return;
    const e = new Uint8Array([28, 83, 187, 107]), i = new Uint8Array([21, 73, 169, 102]), a = new Uint8Array([22, 84, 174, 107]), o = new Uint8Array([25, 65, 164, 105]), s = new Uint8Array([18, 84, 195, 103]), n = { id: y.SeekHead, data: [{ id: y.Seek, data: [{ id: y.SeekID, data: e }, { id: y.SeekPosition, size: 5, data: t ? this.ebmlWriter.offsets.get(this.cues) - this.segmentDataOffset : 0 }] }, { id: y.Seek, data: [{ id: y.SeekID, data: i }, { id: y.SeekPosition, size: 5, data: t ? this.ebmlWriter.offsets.get(this.segmentInfo) - this.segmentDataOffset : 0 }] }, { id: y.Seek, data: [{ id: y.SeekID, data: a }, { id: y.SeekPosition, size: 5, data: t ? this.ebmlWriter.offsets.get(this.tracksElement) - this.segmentDataOffset : 0 }] }, this.attachmentsElement ? { id: y.Seek, data: [{ id: y.SeekID, data: o }, { id: y.SeekPosition, size: 5, data: t ? this.ebmlWriter.offsets.get(this.attachmentsElement) - this.segmentDataOffset : 0 }] } : null, this.tagsElement ? { id: y.Seek, data: [{ id: y.SeekID, data: s }, { id: y.SeekPosition, size: 5, data: t ? this.ebmlWriter.offsets.get(this.tagsElement) - this.segmentDataOffset : 0 }] } : null] };
    this.seekHead = n;
  }
  createSegmentInfo() {
    const t = { id: y.Duration, data: new Ce(0) };
    this.segmentDuration = t;
    const e = { id: y.Info, data: [{ id: y.TimestampScale, data: 1e6 }, { id: y.MuxingApp, data: Mr }, { id: y.WritingApp, data: Mr }, this.format._options.appendOnly ? null : t] };
    this.segmentInfo = e;
  }
  createTracks() {
    var e, i, a, o, s, n;
    const t = { id: y.Tracks, data: [] };
    this.tracksElement = t;
    for (const d of this.trackDatas) {
      const l = no[d.track.source._codec];
      f(l);
      let c = 0;
      if (d.type === "audio" && d.track.source._codec === "opus") {
        c = 8e7;
        const h = d.info.decoderConfig.description;
        if (h) {
          const u = q(h), m = li(u);
          c = Math.round(m.preSkip / 48e3 * 1e9);
        }
      }
      t.data.push({ id: y.TrackEntry, data: [{ id: y.TrackNumber, data: d.track.id }, { id: y.TrackUID, data: d.track.id }, { id: y.TrackType, data: zs[d.type] }, ((e = d.track.metadata.disposition) == null ? void 0 : e.default) === !1 ? { id: y.FlagDefault, data: 0 } : null, (i = d.track.metadata.disposition) != null && i.forced ? { id: y.FlagForced, data: 1 } : null, (a = d.track.metadata.disposition) != null && a.hearingImpaired ? { id: y.FlagHearingImpaired, data: 1 } : null, (o = d.track.metadata.disposition) != null && o.visuallyImpaired ? { id: y.FlagVisualImpaired, data: 1 } : null, (s = d.track.metadata.disposition) != null && s.original ? { id: y.FlagOriginal, data: 1 } : null, (n = d.track.metadata.disposition) != null && n.commentary ? { id: y.FlagCommentary, data: 1 } : null, { id: y.FlagLacing, data: 0 }, { id: y.Language, data: d.track.metadata.languageCode ?? "und" }, { id: y.CodecID, data: l }, { id: y.CodecDelay, data: 0 }, { id: y.SeekPreRoll, data: c }, d.track.metadata.name !== void 0 ? { id: y.Name, data: new pt(d.track.metadata.name) } : null, d.type === "video" ? this.videoSpecificTrackInfo(d) : null, d.type === "audio" ? this.audioSpecificTrackInfo(d) : null, d.type === "subtitle" ? this.subtitleSpecificTrackInfo(d) : null] });
    }
  }
  videoSpecificTrackInfo(t) {
    const { frameRate: e, rotation: i } = t.track.metadata, a = [t.info.decoderConfig.description ? { id: y.CodecPrivate, data: q(t.info.decoderConfig.description) } : null, e ? { id: y.DefaultDuration, data: 1e9 / e } : null], o = i ? qr(-i) : 0, s = !!t.info.aspectRatio && t.info.aspectRatio.num * t.info.height !== t.info.aspectRatio.den * t.info.width, n = t.info.decoderConfig.colorSpace, d = { id: y.Video, data: [{ id: y.PixelWidth, data: t.info.width }, { id: y.PixelHeight, data: t.info.height }, s ? { id: y.DisplayWidth, data: t.info.aspectRatio.num } : null, s ? { id: y.DisplayHeight, data: t.info.aspectRatio.den } : null, s ? { id: y.DisplayUnit, data: 3 } : null, t.info.alphaMode ? { id: y.AlphaMode, data: 1 } : null, Qr(n) ? { id: y.Colour, data: [{ id: y.MatrixCoefficients, data: $t[n.matrix] }, { id: y.TransferCharacteristics, data: Ut[n.transfer] }, { id: y.Primaries, data: Wt[n.primaries] }, { id: y.Range, data: n.fullRange ? 2 : 1 }] } : null, o ? { id: y.Projection, data: [{ id: y.ProjectionType, data: 0 }, { id: y.ProjectionPoseRoll, data: new ke((o + 180) % 360 - 180) }] } : null] };
    return a.push(d), a;
  }
  audioSpecificTrackInfo(t) {
    const e = mt.includes(t.track.source._codec) ? kt(t.track.source._codec) : null;
    return [t.info.decoderConfig.description ? { id: y.CodecPrivate, data: q(t.info.decoderConfig.description) } : null, { id: y.Audio, data: [{ id: y.SamplingFrequency, data: new ke(t.info.sampleRate) }, { id: y.Channels, data: t.info.numberOfChannels }, e ? { id: y.BitDepth, data: 8 * e.sampleSize } : null] }];
  }
  subtitleSpecificTrackInfo(t) {
    return [{ id: y.CodecPrivate, data: G.encode(t.info.config.description) }];
  }
  maybeCreateTags() {
    const t = [], e = (o, s) => {
      t.push({ id: y.SimpleTag, data: [{ id: y.TagName, data: new pt(o) }, typeof s == "string" ? { id: y.TagString, data: new pt(s) } : { id: y.TagBinary, data: s }] });
    }, i = this.output._metadataTags, a = /* @__PURE__ */ new Set();
    for (const { key: o, value: s } of Oe(i)) switch (o) {
      case "title":
        e("TITLE", s), a.add("TITLE");
        break;
      case "description":
        e("DESCRIPTION", s), a.add("DESCRIPTION");
        break;
      case "artist":
        e("ARTIST", s), a.add("ARTIST");
        break;
      case "album":
        e("ALBUM", s), a.add("ALBUM");
        break;
      case "albumArtist":
        e("ALBUM_ARTIST", s), a.add("ALBUM_ARTIST");
        break;
      case "genre":
        e("GENRE", s), a.add("GENRE");
        break;
      case "comment":
        e("COMMENT", s), a.add("COMMENT");
        break;
      case "lyrics":
        e("LYRICS", s), a.add("LYRICS");
        break;
      case "date":
        e("DATE", s.toISOString().slice(0, 10)), a.add("DATE");
        break;
      case "trackNumber":
        e("PART_NUMBER", i.tracksTotal !== void 0 ? `${s}/${i.tracksTotal}` : s.toString()), a.add("PART_NUMBER");
        break;
      case "discNumber":
        e("DISC", i.discsTotal !== void 0 ? `${s}/${i.discsTotal}` : s.toString()), a.add("DISC");
        break;
      case "tracksTotal":
      case "discsTotal":
      case "images":
      case "raw":
        break;
      default:
        It(o);
    }
    if (i.raw) for (const o in i.raw) {
      const s = i.raw[o];
      s == null || a.has(o) || (typeof s == "string" || s instanceof Uint8Array) && e(o, s);
    }
    t.length !== 0 && (this.tagsElement = { id: y.Tags, data: [{ id: y.Tag, data: [{ id: y.Targets, data: [{ id: y.TargetTypeValue, data: 50 }, { id: y.TargetType, data: "MOVIE" }] }, ...t] }] });
  }
  maybeCreateAttachments() {
    const t = this.output._metadataTags, e = [], i = /* @__PURE__ */ new Set(), a = t.images ?? [];
    for (const o of a) {
      let s, n = o.name;
      for (n === void 0 && (n = (o.kind === "coverFront" ? "cover" : o.kind === "coverBack" ? "back" : "image") + (ba(o.mimeType) ?? "")); ; ) {
        s = 0n;
        for (let d = 0; d < 8; d++) s <<= 8n, s |= BigInt(Math.floor(256 * Math.random()));
        if (s !== 0n && !i.has(s)) break;
      }
      i.add(s), e.push({ id: y.AttachedFile, data: [o.description !== void 0 ? { id: y.FileDescription, data: new pt(o.description) } : null, { id: y.FileName, data: new pt(n) }, { id: y.FileMediaType, data: o.mimeType }, { id: y.FileData, data: o.data }, { id: y.FileUID, data: s }] });
    }
    for (const [o, s] of Object.entries(t.raw ?? {}))
      s instanceof ti && /^\d+$/.test(o) && (a.find((n) => n.mimeType === s.mimeType && va(n.data, s.data)) || e.push({ id: y.AttachedFile, data: [s.description !== void 0 ? { id: y.FileDescription, data: new pt(s.description) } : null, { id: y.FileName, data: new pt(s.name ?? "") }, { id: y.FileMediaType, data: s.mimeType ?? "" }, { id: y.FileData, data: s.data }, { id: y.FileUID, data: BigInt(o) }] }));
    e.length !== 0 && (this.attachmentsElement = { id: y.Attachments, data: e });
  }
  createSegment() {
    this.createTracks(), this.maybeCreateTags(), this.maybeCreateAttachments(), this.maybeCreateSeekHead(!1);
    const t = { id: y.Segment, size: this.format._options.appendOnly ? -1 : 6, data: [this.seekHead, this.segmentInfo, this.tracksElement, this.attachmentsElement, this.tagsElement] };
    if (this.segment = t, this.format._options.onSegmentHeader && this.writer.startTrackingWrites(), this.ebmlWriter.writeEBML(t), this.format._options.onSegmentHeader) {
      const { data: e, start: i } = this.writer.stopTrackingWrites();
      this.format._options.onSegmentHeader(e, i);
    }
  }
  createCues() {
    this.cues = { id: y.Cues, data: [] };
  }
  get segmentDataOffset() {
    return f(this.segment), this.ebmlWriter.dataOffsets.get(this.segment);
  }
  allTracksAreKnown() {
    for (const t of this.output._tracks) if (!t.source._closed && !this.trackDatas.some((e) => e.track === t)) return !1;
    return !0;
  }
  async getMimeType() {
    await this.allTracksKnown.promise;
    const t = this.trackDatas.map((e) => e.type === "video" || e.type === "audio" ? e.info.decoderConfig.codec : { webvtt: "wvtt" }[e.track.source._codec]);
    return co({ isWebM: this.format instanceof ae, hasVideo: this.trackDatas.some((e) => e.type === "video"), hasAudio: this.trackDatas.some((e) => e.type === "audio"), codecStrings: t });
  }
  getVideoTrackData(t, e, i) {
    const a = this.trackDatas.find((l) => l.track === t);
    if (a) return a;
    ai(i), f(i), f(i.decoderConfig), f(i.decoderConfig.codedWidth !== void 0), f(i.decoderConfig.codedHeight !== void 0);
    const o = i.decoderConfig.displayAspectWidth, s = i.decoderConfig.displayAspectHeight, n = o === void 0 || s === void 0 ? null : Ne({ num: o, den: s }), d = { track: t, type: "video", info: { width: i.decoderConfig.codedWidth, height: i.decoderConfig.codedHeight, aspectRatio: n, decoderConfig: i.decoderConfig, alphaMode: !!e.sideData.alpha }, chunkQueue: [], lastWrittenMsTimestamp: null, closed: !1 };
    return t.source._codec === "vp9" ? d.info.decoderConfig = { ...d.info.decoderConfig, description: new Uint8Array(Sa(d.info.decoderConfig.codec)) } : t.source._codec === "av1" && (d.info.decoderConfig = { ...d.info.decoderConfig, description: new Uint8Array(ri(d.info.decoderConfig.codec)) }), this.trackDatas.push(d), this.trackDatas.sort((l, c) => l.track.id - c.track.id), this.allTracksAreKnown() && this.allTracksKnown.resolve(), d;
  }
  getAudioTrackData(t, e, i) {
    const a = this.trackDatas.find((d) => d.track === t);
    if (a) return a;
    oi(i), f(i), f(i.decoderConfig);
    const o = { ...i.decoderConfig };
    let s = !1;
    if (t.source._codec === "aac" && !o.description) {
      const d = re(Ct.tempFromBytes(e.data));
      if (!d) throw new Error("Couldn't parse ADTS header from the AAC packet. Make sure the packets are in ADTS format (as specified in ISO 13818-7) when not providing a description, or provide a description (must be an AudioSpecificConfig as specified in ISO 14496-3) and ensure the packets are raw AAC data.");
      const l = We[d.samplingFrequencyIndex], c = Ue[d.channelConfiguration];
      if (l === void 0 || c === void 0) throw new Error("Invalid ADTS frame header.");
      o.description = ei({ objectType: d.objectType, sampleRate: l, numberOfChannels: c }), s = !0;
    }
    const n = { track: t, type: "audio", info: { numberOfChannels: i.decoderConfig.numberOfChannels, sampleRate: i.decoderConfig.sampleRate, decoderConfig: o, requiresAdtsStripping: s }, chunkQueue: [], lastWrittenMsTimestamp: null, closed: !1 };
    return this.trackDatas.push(n), this.trackDatas.sort((d, l) => d.track.id - l.track.id), this.allTracksAreKnown() && this.allTracksKnown.resolve(), n;
  }
  getSubtitleTrackData(t, e) {
    const i = this.trackDatas.find((o) => o.track === t);
    if (i) return i;
    si(e), f(e), f(e.config);
    const a = { track: t, type: "subtitle", info: { config: e.config }, chunkQueue: [], lastWrittenMsTimestamp: null, closed: !1 };
    return this.trackDatas.push(a), this.trackDatas.sort((o, s) => o.track.id - s.track.id), this.allTracksAreKnown() && this.allTracksKnown.resolve(), a;
  }
  async addEncodedVideoPacket(t, e, i) {
    const a = await this.mutex.acquire();
    try {
      const o = this.getVideoTrackData(t, e, i), s = e.type === "key";
      this.validateTimestamp(o.track, e.timestamp, s);
      let n = e.timestamp, d = e.duration;
      t.metadata.frameRate !== void 0 && (n = or(n, t.metadata.frameRate), d = or(d, t.metadata.frameRate));
      const l = o.info.alphaMode ? e.sideData.alpha ?? null : null, c = this.createInternalChunk(e.data, n, d, e.type, l);
      t.source._codec === "vp9" && this.fixVP9ColorSpace(o, c), o.chunkQueue.push(c), await this.interleaveChunks();
    } finally {
      a();
    }
  }
  async addEncodedAudioPacket(t, e, i) {
    const a = await this.mutex.acquire();
    try {
      const o = this.getAudioTrackData(t, e, i);
      let s = e.data;
      if (o.info.requiresAdtsStripping) {
        const l = re(Ct.tempFromBytes(s));
        if (!l) throw new Error("Expected ADTS frame, didn't get one.");
        const c = l.crcCheck === null ? 7 : 9;
        s = s.subarray(c);
      }
      const n = e.type === "key";
      this.validateTimestamp(o.track, e.timestamp, n);
      const d = this.createInternalChunk(s, e.timestamp, e.duration, e.type);
      o.chunkQueue.push(d), await this.interleaveChunks();
    } finally {
      a();
    }
  }
  async addSubtitleCue(t, e, i) {
    const a = await this.mutex.acquire();
    try {
      const o = this.getSubtitleTrackData(t, i);
      this.validateTimestamp(o.track, e.timestamp, !0);
      let s = e.text;
      const n = Math.round(1e3 * e.timestamp);
      ie.lastIndex = 0, s = s.replace(ie, (h) => {
        const u = Co(h.slice(1, -1));
        return `<${gi(u - n)}>`;
      });
      const d = G.encode(s), l = `${e.settings ?? ""}
${e.identifier ?? ""}
${e.notes ?? ""}`, c = this.createInternalChunk(d, e.timestamp, e.duration, "key", l.trim() ? G.encode(l) : null);
      o.chunkQueue.push(c), await this.interleaveChunks();
    } finally {
      a();
    }
  }
  async interleaveChunks(t = !1) {
    if (t || this.allTracksAreKnown()) {
      t: for (; ; ) {
        let e = null, i = 1 / 0;
        for (const o of this.trackDatas) {
          if (!t && o.chunkQueue.length === 0 && !o.closed) break t;
          o.chunkQueue.length > 0 && o.chunkQueue[0].timestamp < i && (e = o, i = o.chunkQueue[0].timestamp);
        }
        if (!e) break;
        const a = e.chunkQueue.shift();
        this.writeBlock(e, a);
      }
      t || await this.writer.flush();
    }
  }
  fixVP9ColorSpace(t, e) {
    if (e.type !== "key" || !t.info.decoderConfig.colorSpace || !t.info.decoderConfig.colorSpace.matrix) return;
    const i = new j(e.data);
    i.skipBits(2);
    const a = i.readBits(1), o = (i.readBits(1) << 1) + a;
    if (o === 3 && i.skipBits(1), i.readBits(1) || i.readBits(1) !== 0 || (i.skipBits(2), i.readBits(24) !== 4817730)) return;
    o >= 2 && i.skipBits(1);
    const s = { rgb: 7, bt709: 2, bt470bg: 1, smpte170m: 3 }[t.info.decoderConfig.colorSpace.matrix];
    la(e.data, i.pos, i.pos + 3, s);
  }
  createInternalChunk(t, e, i, a, o = null) {
    return { data: t, type: a, timestamp: e, duration: i, additions: o };
  }
  writeBlock(t, e) {
    this.segment || this.createSegment();
    const i = Math.round(1e3 * e.timestamp), a = this.trackDatas.every((c) => {
      if (t === c) return e.type === "key";
      const h = c.chunkQueue[0];
      return h ? h.type === "key" : c.closed;
    });
    let o = !1;
    if (this.currentCluster) {
      f(this.currentClusterStartMsTimestamp !== null), f(this.currentClusterMaxMsTimestamp !== null);
      const c = i - this.currentClusterStartMsTimestamp;
      o = a && i > this.currentClusterMaxMsTimestamp && c >= 1e3 * (this.format._options.minimumClusterDuration ?? 1) || c > 32767;
    } else o = !0;
    o && this.createNewCluster(i);
    const s = i - this.currentClusterStartMsTimestamp;
    if (s < -32768) return;
    const n = new Uint8Array(4), d = new DataView(n.buffer);
    d.setUint8(0, 128 | t.track.id), d.setInt16(1, s, !1);
    const l = Math.round(1e3 * e.duration);
    if (e.additions) {
      const c = { id: y.BlockGroup, data: [{ id: y.Block, data: [n, e.data] }, e.type === "delta" ? { id: y.ReferenceBlock, data: new hi(t.lastWrittenMsTimestamp - i) } : null, e.additions ? { id: y.BlockAdditions, data: [{ id: y.BlockMore, data: [{ id: y.BlockAddID, data: 1 }, { id: y.BlockAdditional, data: e.additions }] }] } : null, l > 0 ? { id: y.BlockDuration, data: l } : null] };
      this.ebmlWriter.writeEBML(c);
    } else {
      d.setUint8(3, +(e.type === "key") << 7);
      const c = { id: y.SimpleBlock, data: [n, e.data] };
      this.ebmlWriter.writeEBML(c);
    }
    this.startTimestamp = Math.min(this.startTimestamp, i), this.endTimestamp = Math.max(this.endTimestamp, i + l), t.lastWrittenMsTimestamp = i, this.trackDatasInCurrentCluster.has(t) || this.trackDatasInCurrentCluster.set(t, { firstMsTimestamp: i }), this.currentClusterMaxMsTimestamp = Math.max(this.currentClusterMaxMsTimestamp, i);
  }
  createNewCluster(t) {
    this.currentCluster && this.finalizeCurrentCluster(), this.format._options.onCluster && this.writer.startTrackingWrites(), this.currentCluster = { id: y.Cluster, size: this.format._options.appendOnly ? -1 : 5, data: [{ id: y.Timestamp, data: t }] }, this.ebmlWriter.writeEBML(this.currentCluster), this.currentClusterStartMsTimestamp = t, this.currentClusterMaxMsTimestamp = t, this.trackDatasInCurrentCluster.clear();
  }
  finalizeCurrentCluster() {
    if (f(this.currentCluster), !this.format._options.appendOnly) {
      const a = this.writer.getPos() - this.ebmlWriter.dataOffsets.get(this.currentCluster), o = this.writer.getPos();
      this.writer.seek(this.ebmlWriter.offsets.get(this.currentCluster) + 4), this.ebmlWriter.writeVarInt(a, 5), this.writer.seek(o);
    }
    if (this.format._options.onCluster) {
      f(this.currentClusterStartMsTimestamp !== null);
      const { data: a, start: o } = this.writer.stopTrackingWrites();
      this.format._options.onCluster(a, o, this.currentClusterStartMsTimestamp / 1e3);
    }
    const t = this.ebmlWriter.offsets.get(this.currentCluster) - this.segmentDataOffset, e = /* @__PURE__ */ new Map();
    for (const [a, { firstMsTimestamp: o }] of this.trackDatasInCurrentCluster) e.has(o) || e.set(o, []), e.get(o).push(a);
    const i = [...e.entries()].sort((a, o) => a[0] - o[0]);
    for (const [a, o] of i) f(this.cues), this.cues.data.push({ id: y.CuePoint, data: [{ id: y.CueTime, data: a }, ...o.map((s) => ({ id: y.CueTrackPositions, data: [{ id: y.CueTrack, data: s.track.id }, { id: y.CueClusterPosition, data: t }] }))] });
  }
  async onTrackClose(t) {
    const e = await this.mutex.acquire(), i = this.trackDatas.find((a) => a.track === t);
    i && (i.closed = !0), this.allTracksAreKnown() && this.allTracksKnown.resolve(), await this.interleaveChunks(), e();
  }
  async finalize() {
    const t = await this.mutex.acquire();
    this.allTracksKnown.resolve();
    for (const e of this.trackDatas) e.closed = !0;
    if (this.segment || this.createSegment(), await this.interleaveChunks(!0), this.currentCluster && this.finalizeCurrentCluster(), f(this.cues), this.ebmlWriter.writeEBML(this.cues), !this.format._options.appendOnly) {
      const e = this.writer.getPos() - this.segmentDataOffset;
      this.writer.seek(this.ebmlWriter.offsets.get(this.segment) + 4), this.ebmlWriter.writeVarInt(e, 6);
      const i = this.startTimestamp === 1 / 0 ? 0 : this.endTimestamp - this.startTimestamp;
      this.segmentDuration.data = new Ce(i), this.writer.seek(this.ebmlWriter.offsets.get(this.segmentDuration)), this.ebmlWriter.writeEBML(this.segmentDuration), f(this.seekHead), this.writer.seek(this.ebmlWriter.offsets.get(this.seekHead)), this.maybeCreateSeekHead(!0), this.ebmlWriter.writeEBML(this.seekHead);
    }
    t();
  }
}
class je {
  constructor() {
    this._connectedTrack = null, this._closingPromise = null, this._closed = !1;
  }
  _ensureValidAdd() {
    if (!this._connectedTrack) throw new Error("Source is not connected to an output track.");
    if (this._connectedTrack.output.state === "canceled") throw new Error("Output has been canceled.");
    if (this._connectedTrack.output.state === "finalizing" || this._connectedTrack.output.state === "finalized") throw new Error("Output has been finalized.");
    if (this._connectedTrack.output.state === "pending") throw new Error("Output has not started.");
    if (this._closed) throw new Error("Source is closed.");
  }
  async _start() {
  }
  async _flushAndClose(t) {
  }
  close() {
    if (this._closingPromise) return;
    const t = this._connectedTrack;
    if (!t) throw new Error("Cannot call close without connecting the source to an output track.");
    if (t.output.state === "pending") throw new Error("Cannot call close before output has been started.");
    this._closingPromise = (async () => {
      await this._flushAndClose(!1), this._closed = !0, t.output.state !== "finalizing" && t.output.state !== "finalized" && t.output._muxer.onTrackClose(t);
    })();
  }
  async _flushOrWaitForOngoingClose(t) {
    return this._closingPromise ?? (this._closingPromise = (async () => {
      await this._flushAndClose(t), this._closed = !0;
    })());
  }
}
class Ei extends je {
  constructor(t) {
    if (super(), this._connectedTrack = null, !rt.includes(t)) throw new TypeError(`Invalid video codec '${t}'. Must be one of: ${rt.join(", ")}.`);
    this._codec = t;
  }
}
const Fr = (r, t) => {
  if (r.metadata.hasOnlyKeyPackets && t.type !== "key") throw new Error("Cannot add non-key packets to a hasOnlyKeyPackets video track.");
};
class js {
  constructor(t, e) {
    this.source = t, this.encodingConfig = e, this.ensureEncoderPromise = null, this.encoderInitialized = !1, this.encoder = null, this.muxer = null, this.lastMultipleOfKeyFrameInterval = -1, this.emittedEncoderPackets = 0, this.codedWidth = null, this.codedHeight = null, this.outputWidth = null, this.outputHeight = null, this.frameRateLastSample = null, this.frameRateLastTimestamp = null, this.frameRateLastEndTimestamp = null, this.preciseTimings = [], this.customEncoder = null, this.customEncoderCallSerializer = new ga(), this.customEncoderQueueSize = 0, this.alphaEncoder = null, this.splitter = null, this.splitterCreationFailed = !1, this.alphaFrameQueue = [], this.error = null, this.lastMuxerPromise = Promise.resolve();
  }
  async add(t, e, i) {
    var o, s, n, d, l, c, h, u, m, w, p, v;
    const a = t;
    try {
      this.checkForEncoderError(), this.source._ensureValidAdd();
      const _ = this.encodingConfig, T = _.sizeChangeBehavior ?? "deny";
      let k = !1;
      if (this.codedWidth !== null && this.codedHeight !== null) {
        if ((t.codedWidth !== this.codedWidth || t.codedHeight !== this.codedHeight) && (k = !0, T === "deny")) throw new Error(`Video sample size must remain constant. Expected ${this.codedWidth}x${this.codedHeight}, got ${t.codedWidth}x${t.codedHeight}. To allow the sample size to change over time, set \`sizeChangeBehavior\` to a value other than 'deny' in the encoding options.`);
      } else this.codedWidth = t.codedWidth, this.codedHeight = t.codedHeight;
      if (((o = _.transform) == null ? void 0 : o.width) !== void 0 || ((s = _.transform) == null ? void 0 : s.height) !== void 0 || ((n = _.transform) == null ? void 0 : n.rotate) !== void 0 || ((d = _.transform) == null ? void 0 : d.crop) !== void 0 || ((l = _.transform) == null ? void 0 : l.force) === !0 || k && T !== "passThrough") {
        let B = (c = _.transform) == null ? void 0 : c.width, P = (h = _.transform) == null ? void 0 : h.height, F = ((u = _.transform) == null ? void 0 : u.fit) ?? "fill";
        k && T !== "passThrough" && (f(this.outputWidth), f(this.outputHeight), f(T !== "deny"), B = this.outputWidth, P = this.outputHeight, F = T);
        const V = await t.transform({ width: B, height: P, roundDimensionsTo: 2, crop: (m = _.transform) == null ? void 0 : m.crop, rotate: (w = _.transform) == null ? void 0 : w.rotate, fit: F, alpha: _.alpha });
        this.outputWidth !== null && this.outputHeight !== null || (this.outputWidth = V.displayWidth, this.outputHeight = V.displayHeight), e && t.close(), t = V, e = !0;
      } else this.outputWidth !== null && this.outputHeight !== null || (this.outputWidth = t.codedWidth, this.outputHeight = t.codedHeight);
      const M = (p = _.transform) == null ? void 0 : p.frameRate;
      if (M !== void 0) {
        const B = t.timestamp + t.duration, P = sr(t.timestamp, M);
        if (this.frameRateLastSample !== null) {
          if (P <= this.frameRateLastTimestamp) return this.frameRateLastSample.close(), this.frameRateLastSample = t.clone(), void (this.frameRateLastEndTimestamp = B);
          await this.padFrameRate(P, i);
        }
        t === a && (t = t.clone(), e = !0), t.setTimestamp(P), t.setDuration(1 / M), (v = this.frameRateLastSample) == null || v.close(), this.frameRateLastSample = t.clone(), this.frameRateLastTimestamp = P, this.frameRateLastEndTimestamp = B;
      }
      await this.processAndEncode(t, i);
    } finally {
      e && t.close();
    }
  }
  async processAndEncode(t, e) {
    var o;
    const i = this.encodingConfig;
    let a;
    if ((o = i.transform) != null && o.process) {
      let s = i.transform.process(t);
      if (s instanceof Promise && (s = await s), s === null) return;
      Array.isArray(s) || (s = [s]), a = s.map((n) => n instanceof Y ? n : typeof VideoFrame < "u" && n instanceof VideoFrame ? new Y(n) : new Y(n, { timestamp: t.timestamp, duration: t.duration }));
    } else a = [t];
    try {
      for (const s of a) {
        this.encoderInitialized || (this.ensureEncoderPromise || this.ensureEncoder(s), this.encoderInitialized || await this.ensureEncoderPromise), f(this.encoderInitialized);
        const n = this.encodingConfig.keyFrameInterval ?? 2, d = Math.floor(s.timestamp / n), l = { ...e, keyFrame: (e == null ? void 0 : e.keyFrame) || n === 0 || d !== this.lastMultipleOfKeyFrameInterval };
        if (this.lastMultipleOfKeyFrameInterval = d, this.customEncoder) {
          this.customEncoderQueueSize++;
          const c = s.clone(), h = this.customEncoderCallSerializer.call(() => this.customEncoder.encode(c, l)).then(() => this.customEncoderQueueSize--).catch((u) => this.error ?? (this.error = u)).finally(() => {
            c.close();
          });
          this.customEncoderQueueSize >= 4 && await h;
        } else {
          f(this.encoder);
          const c = s.toVideoFrame(), h = ir(this.preciseTimings, c.timestamp, (m) => m.microsecondTimestamp), u = h !== -1 ? this.preciseTimings[h] : null;
          if (u && u.microsecondTimestamp === c.timestamp ? (u.timestamp !== s.timestamp && (u.timestampIsValid = !1), u.duration !== s.duration && (u.durationIsValid = !1)) : (this.preciseTimings.splice(h + 1, 0, { microsecondTimestamp: c.timestamp, timestamp: s.timestamp, duration: s.duration, timestampIsValid: !0, durationIsValid: !0 }), this.preciseTimings.length > 128 && this.preciseTimings.shift()), this.alphaEncoder)
            if (c.format && !c.format.includes("A") || this.splitterCreationFailed) this.alphaFrameQueue.push(null), this.encoder.encode(c, l), c.close();
            else {
              const m = c.displayWidth, w = c.displayHeight;
              this.splitter || (this.splitter = new le(m, w));
              const { colorFrame: p, alphaFrame: v } = await this.splitter.update(c);
              this.alphaFrameQueue.push(v), this.encoder.encode(p, l), p.close();
            }
          else this.encoder.encode(c, l), c.close();
          this.encoder.encodeQueueSize >= 4 && await new Promise((m) => this.encoder.addEventListener("dequeue", m, { once: !0 }));
        }
        await this.lastMuxerPromise;
      }
    } finally {
      for (const s of a) s !== t && s.close();
    }
  }
  async padFrameRate(t, e) {
    const i = this.encodingConfig.transform.frameRate;
    f(this.frameRateLastSample);
    const a = Math.round((t - this.frameRateLastTimestamp) * i);
    for (let o = 1; o < a; o++) {
      const s = this.frameRateLastSample.clone();
      s.setTimestamp(this.frameRateLastTimestamp + o / i), s.setDuration(1 / i), await this.processAndEncode(s, e), s.close();
    }
  }
  ensureEncoder(t) {
    this.ensureEncoderPromise = (async () => {
      var a, o, s;
      const e = mi({ ...this.encodingConfig, width: t.codedWidth, height: t.codedHeight, squarePixelWidth: t.squarePixelWidth, squarePixelHeight: t.squarePixelHeight, framerate: (a = this.source._connectedTrack) == null ? void 0 : a.metadata.frameRate });
      (s = (o = this.encodingConfig).onEncoderConfig) == null || s.call(o, e);
      const i = pi.find((n) => n.supports(this.encodingConfig.codec, e));
      if (i) this.customEncoder = new i(), this.customEncoder.codec = this.encodingConfig.codec, this.customEncoder.config = e, this.customEncoder.onPacket = (n, d) => {
        var l, c;
        if (!(n instanceof Vt)) throw new TypeError("The first argument passed to onPacket must be an EncodedPacket.");
        if (d !== void 0 && (!d || typeof d != "object")) throw new TypeError("The second argument passed to onPacket must be an object or undefined.");
        Fr(this.source._connectedTrack, n), (c = (l = this.encodingConfig).onEncodedPacket) == null || c.call(l, n, d), this.lastMuxerPromise = this.muxer.addEncodedVideoPacket(this.source._connectedTrack, n, d).catch((h) => {
          this.error ?? (this.error = h);
        });
      }, await this.customEncoder.init();
      else {
        if (typeof VideoEncoder > "u") throw new Error("VideoEncoder is not supported by this browser.");
        if (e.alpha = "discard", this.encodingConfig.alpha === "keep" && (e.latencyMode = "quality"), (e.width % 2 == 1 || e.height % 2 == 1) && (this.encodingConfig.codec === "avc" || this.encodingConfig.codec === "hevc")) throw new Error(`The dimensions ${e.width}x${e.height} are not supported for codec '${this.encodingConfig.codec}'; both width and height must be even numbers. Make sure to round your dimensions to the nearest even number.`);
        if (!(await VideoEncoder.isConfigSupported(e)).supported) throw new Error(`This specific encoder configuration (${e.codec}, ${e.bitrate} bps, ${e.width}x${e.height}, hardware acceleration: ${e.hardwareAcceleration ?? "no-preference"}) is not supported by this browser. Consider using another codec or changing your video parameters.`);
        const n = [], d = [];
        let l = 0, c = 0;
        const h = (m, w, p) => {
          var M, B;
          const v = {};
          if (w) {
            const P = new Uint8Array(w.byteLength);
            w.copyTo(P), v.alpha = P;
          }
          let _ = Vt.fromEncodedChunk(m, v);
          const T = ir(this.preciseTimings, m.timestamp, (P) => P.microsecondTimestamp), k = T !== -1 ? this.preciseTimings[T] : null;
          let A = null;
          this.emittedEncoderPackets === 0 && _.type === "delta" && (p != null && p.decoderConfig) && (A = to(this.encodingConfig.codec, p.decoderConfig, _.data)), (k && k.microsecondTimestamp === m.timestamp || A !== null) && (_ = _.clone({ timestamp: k != null && k.timestampIsValid ? k.timestamp : void 0, duration: k != null && k.durationIsValid ? k.duration : void 0, type: A ?? void 0 })), Fr(this.source._connectedTrack, _), (B = (M = this.encodingConfig).onEncodedPacket) == null || B.call(M, _, p), this.lastMuxerPromise = this.muxer.addEncodedVideoPacket(this.source._connectedTrack, _, p).catch((P) => {
            this.error ?? (this.error = P);
          }), this.emittedEncoderPackets++;
        }, u = new Error("Encoding error").stack;
        if (this.encoder = new VideoEncoder({ output: (m, w) => {
          if (!this.alphaEncoder) return void h(m, null, w);
          const p = this.alphaFrameQueue.shift();
          f(p !== void 0), p ? (this.alphaEncoder.encode(p, { keyFrame: m.type === "key" }), c++, p.close(), n.push({ chunk: m, meta: w })) : c === 0 ? h(m, null, w) : (d.push(l + c), n.push({ chunk: m, meta: w }));
        }, error: (m) => {
          m.stack = u, this.error ?? (this.error = m);
        } }), this.encoder.configure(e), this.encodingConfig.alpha === "keep") {
          const m = new Error("Encoding error").stack;
          this.alphaEncoder = new VideoEncoder({ output: (w, p) => {
            c--;
            const v = n.shift();
            for (f(v !== void 0), h(v.chunk, w, v.meta), l++; d.length > 0 && d[0] === l; ) {
              d.shift();
              const _ = n.shift();
              f(_ !== void 0), h(_.chunk, null, _.meta);
            }
          }, error: (w) => {
            w.stack = m, this.error ?? (this.error = w);
          } }), this.alphaEncoder.configure(e);
        }
      }
      f(this.source._connectedTrack), this.muxer = this.source._connectedTrack.output._muxer, this.encoderInitialized = !0;
    })();
  }
  async flushAndClose(t) {
    var e, i, a;
    if (t || this.checkForEncoderError(), !t && this.frameRateLastSample) {
      const o = this.encodingConfig.transform.frameRate, s = sr(this.frameRateLastEndTimestamp, o);
      await this.padFrameRate(s);
    }
    (e = this.frameRateLastSample) == null || e.close(), this.frameRateLastSample = null, this.customEncoder ? (t || this.customEncoderCallSerializer.call(() => this.customEncoder.flush()), await this.customEncoderCallSerializer.call(() => this.customEncoder.close())) : this.encoder && (t || (await this.encoder.flush(), await ((i = this.alphaEncoder) == null ? void 0 : i.flush())), this.encoder.state !== "closed" && this.encoder.close(), this.alphaEncoder && this.alphaEncoder.state !== "closed" && this.alphaEncoder.close(), this.alphaFrameQueue.forEach((o) => o == null ? void 0 : o.close()), (a = this.splitter) == null || a.close()), t || this.checkForEncoderError();
  }
  getQueueSize() {
    var t;
    return this.customEncoder ? this.customEncoderQueueSize : ((t = this.encoder) == null ? void 0 : t.encodeQueueSize) ?? 0;
  }
  checkForEncoderError() {
    if (this.error) throw this.error;
  }
}
let Dr = !1;
class le {
  constructor(t, e) {
    this.canvas = null, this.gl = null, this.colorProgram = null, this.alphaProgram = null, this.vao = null, this.sourceTexture = null, this.alphaResolutionLocation = null, this.worker = null, this.pendingRequests = /* @__PURE__ */ new Map(), this.nextRequestId = 0;
    const i = typeof OffscreenCanvas < "u" || typeof document < "u" && typeof document.createElement == "function";
    if (!le.forceCpu && i && !Dr) try {
      typeof OffscreenCanvas < "u" ? this.canvas = new OffscreenCanvas(t, e) : (this.canvas = document.createElement("canvas"), this.canvas.width = t, this.canvas.height = e);
      const a = this.canvas.getContext("webgl2", { alpha: !0 });
      if (!a) throw new Error("Couldn't acquire WebGL 2 context.");
      this.gl = a, this.colorProgram = this.createColorProgram(), this.alphaProgram = this.createAlphaProgram(), this.vao = this.createVAO(), this.sourceTexture = this.createTexture(), this.alphaResolutionLocation = this.gl.getUniformLocation(this.alphaProgram, "u_resolution"), this.gl.useProgram(this.colorProgram), this.gl.uniform1i(this.gl.getUniformLocation(this.colorProgram, "u_sourceTexture"), 0), this.gl.useProgram(this.alphaProgram), this.gl.uniform1i(this.gl.getUniformLocation(this.alphaProgram, "u_sourceTexture"), 0);
    } catch (a) {
      this.gl = null, this.canvas = null, Dr = !0, console.warn("Falling back to CPU for color/alpha splitting.", a);
    }
  }
  async update(t) {
    return this.gl ? this.updateGpu(t) : this.updateCpu(t);
  }
  updateGpu(t) {
    f(this.gl), f(this.canvas), t.displayWidth === this.canvas.width && t.displayHeight === this.canvas.height || (this.canvas.width = t.displayWidth, this.canvas.height = t.displayHeight), this.gl.activeTexture(this.gl.TEXTURE0), this.gl.bindTexture(this.gl.TEXTURE_2D, this.sourceTexture), this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, t);
    const e = this.runColorProgram(t), i = this.runAlphaProgram(t);
    return t.close(), { colorFrame: e, alphaFrame: i };
  }
  createVertexShader() {
    return f(this.gl), this.createShader(this.gl.VERTEX_SHADER, `#version 300 es
			in vec2 a_position;
			in vec2 a_texCoord;
			out vec2 v_texCoord;
			
			void main() {
				gl_Position = vec4(a_position, 0.0, 1.0);
				v_texCoord = a_texCoord;
			}
		`);
  }
  createColorProgram() {
    f(this.gl);
    const t = this.createVertexShader(), e = this.createShader(this.gl.FRAGMENT_SHADER, `#version 300 es
			precision highp float;
			
			uniform sampler2D u_sourceTexture;
			in vec2 v_texCoord;
			out vec4 fragColor;
			
			void main() {
				vec4 source = texture(u_sourceTexture, v_texCoord);
				fragColor = vec4(source.rgb, 1.0);
			}
		`), i = this.gl.createProgram();
    return this.gl.attachShader(i, t), this.gl.attachShader(i, e), this.gl.linkProgram(i), i;
  }
  createAlphaProgram() {
    f(this.gl);
    const t = this.createVertexShader(), e = this.createShader(this.gl.FRAGMENT_SHADER, `#version 300 es
			precision highp float;
			
			uniform sampler2D u_sourceTexture;
			uniform vec2 u_resolution; // The width and height of the canvas
			in vec2 v_texCoord;
			out vec4 fragColor;

			// This function determines the value for a single byte in the YUV stream
			float getByteValue(float byteOffset) {
				float width = u_resolution.x;
				float height = u_resolution.y;

				float yPlaneSize = width * height;

				if (byteOffset < yPlaneSize) {
					// This byte is in the luma plane. Find the corresponding pixel coordinates to sample from
					float y = floor(byteOffset / width);
					float x = mod(byteOffset, width);
					
					// Add 0.5 to sample the center of the texel
					vec2 sampleCoord = (vec2(x, y) + 0.5) / u_resolution;
					
					// The luma value is the alpha from the source texture
					return texture(u_sourceTexture, sampleCoord).a;
				} else {
					// Write a fixed value for chroma and beyond
					return 128.0 / 255.0;
				}
			}
			
			void main() {
				// Each fragment writes 4 bytes (R, G, B, A)
				float pixelIndex = floor(gl_FragCoord.y) * u_resolution.x + floor(gl_FragCoord.x);
				float baseByteOffset = pixelIndex * 4.0;

				vec4 result;
				for (int i = 0; i < 4; i++) {
					float currentByteOffset = baseByteOffset + float(i);
					result[i] = getByteValue(currentByteOffset);
				}
				
				fragColor = result;
			}
		`), i = this.gl.createProgram();
    return this.gl.attachShader(i, t), this.gl.attachShader(i, e), this.gl.linkProgram(i), i;
  }
  createShader(t, e) {
    f(this.gl);
    const i = this.gl.createShader(t);
    return this.gl.shaderSource(i, e), this.gl.compileShader(i), this.gl.getShaderParameter(i, this.gl.COMPILE_STATUS) || console.error("Shader compile error:", this.gl.getShaderInfoLog(i)), i;
  }
  createVAO() {
    f(this.gl), f(this.colorProgram);
    const t = this.gl.createVertexArray();
    this.gl.bindVertexArray(t);
    const e = new Float32Array([-1, -1, 0, 1, 1, -1, 1, 1, -1, 1, 0, 0, 1, 1, 1, 0]), i = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, i), this.gl.bufferData(this.gl.ARRAY_BUFFER, e, this.gl.STATIC_DRAW);
    const a = this.gl.getAttribLocation(this.colorProgram, "a_position"), o = this.gl.getAttribLocation(this.colorProgram, "a_texCoord");
    return this.gl.enableVertexAttribArray(a), this.gl.vertexAttribPointer(a, 2, this.gl.FLOAT, !1, 16, 0), this.gl.enableVertexAttribArray(o), this.gl.vertexAttribPointer(o, 2, this.gl.FLOAT, !1, 16, 8), t;
  }
  createTexture() {
    f(this.gl);
    const t = this.gl.createTexture();
    return this.gl.bindTexture(this.gl.TEXTURE_2D, t), this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE), this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE), this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR), this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR), t;
  }
  runColorProgram(t) {
    return f(this.gl), f(this.canvas), this.gl.useProgram(this.colorProgram), this.gl.viewport(0, 0, this.canvas.width, this.canvas.height), this.gl.clear(this.gl.COLOR_BUFFER_BIT), this.gl.bindVertexArray(this.vao), this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4), new VideoFrame(this.canvas, { timestamp: t.timestamp, duration: t.duration ?? void 0, alpha: "discard" });
  }
  runAlphaProgram(t) {
    f(this.gl), f(this.canvas), this.gl.useProgram(this.alphaProgram), this.gl.uniform2f(this.alphaResolutionLocation, this.canvas.width, this.canvas.height), this.gl.viewport(0, 0, this.canvas.width, this.canvas.height), this.gl.clear(this.gl.COLOR_BUFFER_BIT), this.gl.bindVertexArray(this.vao), this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    const { width: e, height: i } = this.canvas, a = e * i + 2 * (Math.ceil(e / 2) * Math.ceil(i / 2)), o = Math.ceil(a / (4 * e));
    let s = new Uint8Array(4 * e * o);
    this.gl.readPixels(0, 0, e, o, this.gl.RGBA, this.gl.UNSIGNED_BYTE, s), s = s.subarray(0, a), f(s[e * i] === 128), f(s[s.length - 1] === 128);
    const n = { format: "I420", codedWidth: e, codedHeight: i, timestamp: t.timestamp, duration: t.duration ?? void 0, transfer: [s.buffer] };
    return new VideoFrame(s, n);
  }
  updateCpu(t) {
    if (!this.worker) {
      const a = new Blob([`(${Gs.toString()})()`], { type: "application/javascript" }), o = URL.createObjectURL(a);
      this.worker = new Worker(o), URL.revokeObjectURL(o), this.worker.addEventListener("message", (s) => {
        const n = s.data, d = this.pendingRequests.get(n.id);
        d && (this.pendingRequests.delete(n.id), "error" in n ? d.reject(new Error(n.error)) : d.resolve({ colorFrame: n.colorFrame, alphaFrame: n.alphaFrame }));
      }), this.worker.addEventListener("error", (s) => {
        const n = new Error(s.message || "Color/alpha splitter worker error.");
        for (const d of this.pendingRequests.values()) d.reject(n);
        this.pendingRequests.clear();
      });
    }
    const e = this.nextRequestId++, i = Ve();
    return this.pendingRequests.set(e, i), this.worker.postMessage({ id: e, sourceFrame: t }, { transfer: [t] }), i.promise;
  }
  close() {
    var e, i, a;
    (i = (e = this.gl) == null ? void 0 : e.getExtension("WEBGL_lose_context")) == null || i.loseContext(), this.gl = null, this.canvas = null, (a = this.worker) == null || a.terminate(), this.worker = null;
    const t = new Error("Color/alpha splitter closed.");
    for (const o of this.pendingRequests.values()) o.reject(t);
    this.pendingRequests.clear();
  }
}
le.forceCpu = !0;
const Gs = () => {
  let r = null, t = Promise.resolve();
  self.addEventListener("message", (o) => {
    const { id: s, sourceFrame: n } = o.data;
    t = t.then(async () => {
      try {
        const { colorFrame: d, alphaFrame: l } = await e(n);
        self.postMessage({ id: s, colorFrame: d, alphaFrame: l }, { transfer: [d, l] });
      } catch (d) {
        self.postMessage({ id: s, error: d.message });
      } finally {
        n.close();
      }
    });
  });
  const e = async (o) => {
    const s = o.format;
    if (!s) throw new Error("CPU color/alpha splitting requires a known VideoFrame format.");
    const n = o.codedWidth, d = o.codedHeight, l = o.allocationSize();
    if (r && r.byteLength === l || (r = new Uint8Array(l)), await o.copyTo(r), s === "RGBA" || s === "BGRA") return i(r, n, d, s, o);
    if (s === "I420A" || s === "I420AP10" || s === "I420AP12" || s === "I422A" || s === "I422AP10" || s === "I422AP12" || s === "I444A" || s === "I444AP10" || s === "I444AP12") return a(r, n, d, s, o);
    throw new Error(`CPU color/alpha splitting does not support format '${s}'.`);
  }, i = (o, s, n, d, l) => {
    const c = s * n, h = Math.ceil(s / 2), u = Math.ceil(n / 2), m = new Uint8Array(c + h * u * 2);
    for (let v = 0, _ = 3; v < c; v++, _ += 4) m[v] = o[_];
    m.fill(128, c);
    const w = new VideoFrame(o, { format: d === "RGBA" ? "RGBX" : "BGRX", codedWidth: s, codedHeight: n, timestamp: l.timestamp, duration: l.duration ?? void 0 }), p = { format: "I420", codedWidth: s, codedHeight: n, timestamp: l.timestamp, duration: l.duration ?? void 0, transfer: [m.buffer] };
    return { colorFrame: w, alphaFrame: new VideoFrame(m, p) };
  }, a = (o, s, n, d, l) => {
    const c = d.includes("P10"), h = d.includes("P12"), u = c || h ? 2 : 1;
    let m, w;
    d.startsWith("I420") ? (m = Math.ceil(s / 2), w = Math.ceil(n / 2)) : d.startsWith("I422") ? (m = Math.ceil(s / 2), w = n) : (m = s, w = n);
    const p = s * n, v = p * u, _ = p * u + 2 * (m * w * u), T = d.replace("A", ""), k = Math.ceil(s / 2) * Math.ceil(n / 2), A = new Uint8Array(v + 2 * (k * u)), M = _;
    A.set(o.subarray(M, M + v), 0);
    const B = v, P = c ? 512 : h ? 2048 : 128;
    u === 1 ? A.fill(P, B) : new Uint16Array(A.buffer, B, 2 * k).fill(P);
    const F = c ? "I420P10" : h ? "I420P12" : "I420", V = new VideoFrame(o.subarray(0, _), { format: T, codedWidth: s, codedHeight: n, timestamp: l.timestamp, duration: l.duration ?? void 0 }), N = { format: F, codedWidth: s, codedHeight: n, timestamp: l.timestamp, duration: l.duration ?? void 0, transfer: [A.buffer] };
    return { colorFrame: V, alphaFrame: new VideoFrame(A, N) };
  };
};
class qs extends Ei {
  constructor(t, e) {
    if (!(typeof HTMLCanvasElement < "u" && t instanceof HTMLCanvasElement || typeof OffscreenCanvas < "u" && t instanceof OffscreenCanvas)) throw new TypeError("canvas must be an HTMLCanvasElement or OffscreenCanvas.");
    bo(e), super(e.codec), this._encoder = new js(this, e), this._canvas = t;
  }
  add(t, e = 0, i) {
    if (!Number.isFinite(t) || t < 0) throw new TypeError("timestamp must be a non-negative number.");
    if (!Number.isFinite(e) || e < 0) throw new TypeError("duration must be a non-negative number.");
    const a = new Y(this._canvas, { timestamp: t, duration: e });
    return this._encoder.add(a, !0, i);
  }
  _flushAndClose(t) {
    return this._encoder.flushAndClose(t);
  }
}
class Xs extends je {
  constructor(t) {
    if (super(), this._connectedTrack = null, !Lt.includes(t)) throw new TypeError(`Invalid audio codec '${t}'. Must be one of: ${Lt.join(", ")}.`);
    this._codec = t;
  }
}
class Qs extends je {
  constructor(t) {
    if (super(), this._connectedTrack = null, !Tt.includes(t)) throw new TypeError(`Invalid subtitle codec '${t}'. Must be one of: ${Tt.join(", ")}.`);
    this._codec = t;
  }
}
class Ge {
  getSupportedVideoCodecs() {
    return this.getSupportedCodecs().filter((t) => rt.includes(t));
  }
  getSupportedAudioCodecs() {
    return this.getSupportedCodecs().filter((t) => Lt.includes(t));
  }
  getSupportedSubtitleCodecs() {
    return this.getSupportedCodecs().filter((t) => Tt.includes(t));
  }
  _codecUnsupportedHint(t) {
    return "";
  }
}
class qe extends Ge {
  constructor(t = {}) {
    if (!t || typeof t != "object") throw new TypeError("options must be an object.");
    if (t.fastStart !== void 0 && ![!1, "in-memory", "reserve", "fragmented"].includes(t.fastStart)) throw new TypeError("options.fastStart, when provided, must be false, 'in-memory', 'reserve', or 'fragmented'.");
    if (t.minimumFragmentDuration !== void 0 && (!Number.isFinite(t.minimumFragmentDuration) || t.minimumFragmentDuration < 0)) throw new TypeError("options.minimumFragmentDuration, when provided, must be a non-negative number.");
    if (t.onFtyp !== void 0 && typeof t.onFtyp != "function") throw new TypeError("options.onFtyp, when provided, must be a function.");
    if (t.onMoov !== void 0 && typeof t.onMoov != "function") throw new TypeError("options.onMoov, when provided, must be a function.");
    if (t.onMdat !== void 0 && typeof t.onMdat != "function") throw new TypeError("options.onMdat, when provided, must be a function.");
    if (t.onMoof !== void 0 && typeof t.onMoof != "function") throw new TypeError("options.onMoof, when provided, must be a function.");
    if (t.metadataFormat !== void 0 && !["mdir", "mdta", "udta", "auto"].includes(t.metadataFormat)) throw new TypeError("options.metadataFormat, when provided, must be either 'auto', 'mdir', 'mdta', or 'udta'.");
    super(), this._options = t;
  }
  getSupportedTrackCounts() {
    return { video: { min: 0, max: 4294967295 }, audio: { min: 0, max: 4294967295 }, subtitle: { min: 0, max: 4294967295 }, total: { min: 1, max: 4294967295 } };
  }
  get supportsVideoRotationMetadata() {
    return !0;
  }
  get supportsTimestampedMediaData() {
    return !0;
  }
  _createMuxer(t) {
    return new $s(t, this);
  }
}
class Ae extends qe {
  constructor(t) {
    super(t);
  }
  get _name() {
    return "MP4";
  }
  get fileExtension() {
    return ".mp4";
  }
  get mimeType() {
    return "video/mp4";
  }
  getSupportedCodecs() {
    return [...rt, ...se, "pcm-s16", "pcm-s16be", "pcm-s24", "pcm-s24be", "pcm-s32", "pcm-s32be", "pcm-f32", "pcm-f32be", "pcm-f64", "pcm-f64be", ...Tt];
  }
  _codecUnsupportedHint(t) {
    return new Si().getSupportedCodecs().includes(t) ? " Switching to MOV will grant support for this codec." : "";
  }
}
class Rr extends qe {
  constructor(t) {
    super(t);
  }
  get _name() {
    return "CMAF";
  }
  get fileExtension() {
    return ".m4s";
  }
  get mimeType() {
    return "video/mp4";
  }
  getSupportedCodecs() {
    return [...rt, ...se, "pcm-s16", "pcm-s16be", "pcm-s24", "pcm-s24be", "pcm-s32", "pcm-s32be", "pcm-f32", "pcm-f32be", "pcm-f64", "pcm-f64be", ...Tt];
  }
}
class Si extends qe {
  constructor(t) {
    super(t);
  }
  get _name() {
    return "MOV";
  }
  get fileExtension() {
    return ".mov";
  }
  get mimeType() {
    return "video/quicktime";
  }
  getSupportedCodecs() {
    return [...rt, ...Lt];
  }
  _codecUnsupportedHint(t) {
    return new Ae().getSupportedCodecs().includes(t) ? " Switching to MP4 will grant support for this codec." : "";
  }
}
class Lr extends Ge {
  constructor(t = {}) {
    if (!t || typeof t != "object") throw new TypeError("options must be an object.");
    if (t.appendOnly !== void 0 && typeof t.appendOnly != "boolean") throw new TypeError("options.appendOnly, when provided, must be a boolean.");
    if (t.minimumClusterDuration !== void 0 && (!Number.isFinite(t.minimumClusterDuration) || t.minimumClusterDuration < 0)) throw new TypeError("options.minimumClusterDuration, when provided, must be a non-negative number.");
    if (t.onEbmlHeader !== void 0 && typeof t.onEbmlHeader != "function") throw new TypeError("options.onEbmlHeader, when provided, must be a function.");
    if (t.onSegmentHeader !== void 0 && typeof t.onSegmentHeader != "function") throw new TypeError("options.onHeader, when provided, must be a function.");
    if (t.onCluster !== void 0 && typeof t.onCluster != "function") throw new TypeError("options.onCluster, when provided, must be a function.");
    super(), this._options = t;
  }
  _createMuxer(t) {
    return new Hs(t, this);
  }
  get _name() {
    return "Matroska";
  }
  getSupportedTrackCounts() {
    return { video: { min: 0, max: 127 }, audio: { min: 0, max: 127 }, subtitle: { min: 0, max: 127 }, total: { min: 1, max: 127 } };
  }
  get fileExtension() {
    return ".mkv";
  }
  get mimeType() {
    return "video/x-matroska";
  }
  getSupportedCodecs() {
    return [...rt, ...se, ...mt.filter((t) => !["pcm-s8", "pcm-f32be", "pcm-f64be", "ulaw", "alaw"].includes(t)), ...Tt];
  }
  get supportsVideoRotationMetadata() {
    return !1;
  }
  get supportsTimestampedMediaData() {
    return !0;
  }
}
class ae extends Lr {
  constructor(t) {
    super(t);
  }
  getSupportedCodecs() {
    return [...rt.filter((t) => ["vp8", "vp9", "av1"].includes(t)), ...Lt.filter((t) => ["opus", "vorbis"].includes(t)), ...Tt];
  }
  get _name() {
    return "WebM";
  }
  get fileExtension() {
    return ".webm";
  }
  get mimeType() {
    return "video/webm";
  }
  _codecUnsupportedHint(t) {
    return new Lr().getSupportedCodecs().includes(t) ? " Switching to MKV will grant support for this codec." : "";
  }
}
const Ys = ["video", "audio", "subtitle"];
class Ht {
  constructor(t, e, i, a, o) {
    this.id = t, this.output = e, this.type = i, this.source = a, this.metadata = o;
  }
  isVideoTrack() {
    return this.type === "video";
  }
  isAudioTrack() {
    return this.type === "audio";
  }
  isSubtitleTrack() {
    return this.type === "subtitle";
  }
  canBePairedWith(t) {
    if (!(t instanceof Ht)) throw new TypeError("other must be an OutputTrack.");
    if (this === t) return !1;
    const e = cr(this.metadata.group), i = cr(t.metadata.group);
    for (const a of e)
      if (this.type !== t.type && i.some((o) => a === o) || i.some((o) => a._pairedGroups.has(o))) return !0;
    return !1;
  }
}
class Ks extends Ht {
  constructor(t, e, i, a) {
    super(t, e, "video", i, a);
  }
}
class Js extends Ht {
  constructor(t, e, i, a) {
    super(t, e, "audio", i, a);
  }
}
class Zs extends Ht {
  constructor(t, e, i, a) {
    super(t, e, "subtitle", i, a);
  }
}
class Ot {
  constructor() {
    this._pairedGroups = /* @__PURE__ */ new Set();
  }
  pairWith(t) {
    if (!(t instanceof Ot)) throw new TypeError("other must be an OutputTrackGroup.");
    if (this === t) throw new TypeError("Cannot pair a group with itself.");
    this._pairedGroups.add(t), t._pairedGroups.add(this);
  }
}
const _e = (r) => {
  if (!r || typeof r != "object") throw new TypeError("metadata must be an object.");
  if (r.languageCode !== void 0 && !pa(r.languageCode)) throw new TypeError("metadata.languageCode, when provided, must be a three-letter, ISO 639-2/T language code.");
  if (r.name !== void 0 && typeof r.name != "string") throw new TypeError("metadata.name, when provided, must be a string.");
  if (r.disposition !== void 0 && Ca(r.disposition), r.maximumPacketCount !== void 0 && (!Number.isInteger(r.maximumPacketCount) || r.maximumPacketCount < 0)) throw new TypeError("metadata.maximumPacketCount, when provided, must be a non-negative integer.");
  if (r.group !== void 0 && !(r.group instanceof Ot) && (!Array.isArray(r.group) || r.group.some((t) => !(t instanceof Ot)))) throw new TypeError("metadata.group, when provided, must be an OutputTrackGroup instance or an array of OutputTrackGroup instances.");
};
class tn extends Jr {
  get target() {
    const t = "Output.target cannot be used when using PathedTarget with an async callback. Use the 'target' event instead.";
    if (this._rootTargetPromise) throw new TypeError(t);
    const e = this._getRootTarget();
    if (e instanceof Promise) throw new TypeError(t);
    return e;
  }
  constructor(t) {
    if (super(), this.state = "pending", this.defaultTrackGroup = new Ot(), this._onFinalize = null, this._unfinalizedTargets = /* @__PURE__ */ new Set(), this._rootWriterPromise = null, this._tracks = [], this._startPromise = null, this._cancelPromise = null, this._finalizePromise = null, this._mutex = new Yr(), this._metadataTags = {}, this._rootTarget = null, this._rootTargetPromise = null, this._firstMediaStreamTimestamp = null, !t || typeof t != "object") throw new TypeError("options must be an object.");
    if (!(t.format instanceof Ge)) throw new TypeError("options.format must be an OutputFormat.");
    if (!(t.target instanceof ct || t.target instanceof ve)) throw new TypeError("options.target must be a Target or a PathedTarget.");
    if (t.target instanceof ct && this._rememberTarget(t.target), t.initTarget !== void 0 && !(t.initTarget instanceof ct) && typeof t.initTarget != "function") throw new Error("options.initTarget, when provided, must be a Target or a function that returns or resolves to a Target.");
    if (t.onFinalize !== void 0 && typeof t.onFinalize != "function") throw new TypeError("options.onFinalize, when provided, must be a function.");
    this.format = t.format, this._target = t.target, this._onFinalize = t.onFinalize ?? null, this._initTarget = t.initTarget ?? null, this._initTarget instanceof ct && this._rememberTarget(this._initTarget), this._muxer = t.format._createMuxer(this);
  }
  _getTargetValidated(t) {
    f(this._target instanceof ve);
    const e = this._target.getTarget(t), i = (a) => {
      if (!(a instanceof ct)) throw new TypeError("getTarget must return a Target.");
      return a;
    };
    return e instanceof Promise ? e.then(i) : i(e);
  }
  async _getTarget(t) {
    f(this._target instanceof ve);
    const e = await this._getTargetValidated(t);
    return this._emit("target", { target: e, request: t, isRoot: t.isRoot }), this.state === "canceled" ? await e._close() : this._rememberTarget(e), e;
  }
  _rememberTarget(t) {
    this._unfinalizedTargets.add(t), t.on("finalized", () => this._unfinalizedTargets.delete(t), { once: !0 });
  }
  async _getInitTarget() {
    if (f(this._initTarget !== null), this._initTarget instanceof ct) return this._initTarget;
    const t = await this._initTarget();
    return this.state === "canceled" ? await t._close() : this._rememberTarget(t), t;
  }
  _hasInitTarget() {
    return this._initTarget !== null;
  }
  _getRootTarget() {
    if (this._rootTarget) return this._rootTarget;
    if (this._rootTargetPromise) return this._rootTargetPromise;
    if (this._target instanceof ct) return this._emit("target", { target: this._target, request: null, isRoot: !0 }), this._rootTarget = this._target, this._target;
    const t = { path: this._target.rootPath, isRoot: !0, mimeType: this.format.mimeType }, e = this._getTargetValidated(t), i = (a) => (this.state === "canceled" ? a._close() : this._rememberTarget(a), this._emit("target", { target: a, request: t, isRoot: !0 }), this._rootTarget = a, a);
    return e instanceof Promise ? this._rootTargetPromise = e.then(i) : i(e);
  }
  _getRootWriter(t) {
    return this._rootWriterPromise ?? (this._rootWriterPromise = (async () => {
      const e = await this._getRootTarget(), i = new Be(e, typeof t == "boolean" ? t : t(e));
      return i.start(), i;
    })());
  }
  addVideoTrack(t, e = {}) {
    if (!(t instanceof Ei)) throw new TypeError("source must be a VideoSource.");
    if (_e(e), e.rotation !== void 0 && ![0, 90, 180, 270].includes(e.rotation)) throw new TypeError(`Invalid video rotation: ${e.rotation}. Has to be 0, 90, 180 or 270.`);
    if (!this.format.supportsVideoRotationMetadata && e.rotation) throw new Error(`${this.format._name} does not support video rotation metadata.`);
    if (e.frameRate !== void 0 && (!Number.isFinite(e.frameRate) || e.frameRate <= 0)) throw new TypeError(`Invalid video frame rate: ${e.frameRate}. Must be a positive number.`);
    const i = { ...e };
    return i.group ?? (i.group = this.defaultTrackGroup), this._addTrack(new Ks(this._tracks.length + 1, this, t, i));
  }
  addAudioTrack(t, e = {}) {
    if (!(t instanceof Xs)) throw new TypeError("source must be an AudioSource.");
    _e(e);
    const i = { ...e };
    return i.group ?? (i.group = this.defaultTrackGroup), this._addTrack(new Js(this._tracks.length + 1, this, t, i));
  }
  addSubtitleTrack(t, e = {}) {
    if (!(t instanceof Qs)) throw new TypeError("source must be a SubtitleSource.");
    _e(e);
    const i = { ...e };
    return i.group ?? (i.group = this.defaultTrackGroup), this._addTrack(new Zs(this._tracks.length + 1, this, t, i));
  }
  setMetadataTags(t) {
    if (ka(t), this.state !== "pending") throw new Error("Cannot set metadata tags after output has been started or canceled.");
    this._metadataTags = t;
  }
  _addTrack(t) {
    if (this.state !== "pending") throw new Error("Cannot add track after output has been started or canceled.");
    if (t.source._connectedTrack) throw new Error("Source is already used for a track.");
    const e = this.format.getSupportedTrackCounts(), i = this._tracks.reduce((s, n) => s + (n.type === t.type ? 1 : 0), 0), a = e[t.type].max;
    if (i === a) throw new Error(a === 0 ? `${this.format._name} does not support ${t.type} tracks.` : `${this.format._name} does not support more than ${a} ${t.type} track` + (a === 1 ? "" : "s") + ".");
    const o = e.total.max;
    if (this._tracks.length === o) throw new Error(`${this.format._name} does not support more than ${o} tracks` + (o === 1 ? "" : "s") + " in total.");
    if (t.isVideoTrack()) {
      const s = this.format.getSupportedVideoCodecs();
      if (s.length === 0) throw new Error(`${this.format._name} does not support video tracks.` + this.format._codecUnsupportedHint(t.source._codec));
      if (!s.includes(t.source._codec)) throw new Error(`Codec '${t.source._codec}' cannot be contained within ${this.format._name}. Supported video codecs are: ${s.map((n) => `'${n}'`).join(", ")}.` + this.format._codecUnsupportedHint(t.source._codec));
    } else if (t.isAudioTrack()) {
      const s = this.format.getSupportedAudioCodecs();
      if (s.length === 0) throw new Error(`${this.format._name} does not support audio tracks.` + this.format._codecUnsupportedHint(t.source._codec));
      if (!s.includes(t.source._codec)) throw new Error(`Codec '${t.source._codec}' cannot be contained within ${this.format._name}. Supported audio codecs are: ${s.map((n) => `'${n}'`).join(", ")}.` + this.format._codecUnsupportedHint(t.source._codec));
    } else if (t.isSubtitleTrack()) {
      const s = this.format.getSupportedSubtitleCodecs();
      if (s.length === 0) throw new Error(`${this.format._name} does not support subtitle tracks.` + this.format._codecUnsupportedHint(t.source._codec));
      if (!s.includes(t.source._codec)) throw new Error(`Codec '${t.source._codec}' cannot be contained within ${this.format._name}. Supported subtitle codecs are: ${s.map((n) => `'${n}'`).join(", ")}.` + this.format._codecUnsupportedHint(t.source._codec));
    }
    return this._tracks.push(t), t.source._connectedTrack = t, t;
  }
  async start() {
    const t = this.format.getSupportedTrackCounts();
    for (const i of Ys) {
      const a = this._tracks.reduce((s, n) => s + (n.type === i ? 1 : 0), 0), o = t[i].min;
      if (a < o) throw new Error(o === t[i].max ? `${this.format._name} requires exactly ${o} ${i} track${o === 1 ? "" : "s"}.` : `${this.format._name} requires at least ${o} ${i} track${o === 1 ? "" : "s"}.`);
    }
    const e = t.total.min;
    if (this._tracks.length < e) throw new Error(e === t.total.max ? `${this.format._name} requires exactly ${e} track` + (e === 1 ? "" : "s") + "." : `${this.format._name} requires at least ${e} track` + (e === 1 ? "" : "s") + ".");
    if (this.state === "canceled") throw new Error("Output has been canceled.");
    return this._startPromise ? (console.warn("Output has already been started."), this._startPromise) : this._startPromise = (async () => {
      this.state = "started";
      const i = await this._mutex.acquire();
      try {
        await this._muxer.start();
        const a = this._tracks.map((o) => o.source._start());
        await Promise.all(a);
      } finally {
        i();
      }
    })();
  }
  getMimeType() {
    return this._muxer.getMimeType();
  }
  async cancel() {
    return this._cancelPromise ? (console.warn("Output has already been canceled."), this._cancelPromise) : this.state !== "finalizing" && this.state !== "finalized" ? this._cancelPromise = (async () => {
      this.state = "canceled";
      const t = await this._mutex.acquire();
      try {
        const e = this._tracks.map((i) => i.source._flushOrWaitForOngoingClose(!0));
        await Promise.all(e), await Promise.all([...this._unfinalizedTargets].map((i) => i._close())), this._unfinalizedTargets.clear();
      } finally {
        t();
      }
    })() : void (this.state === "finalized" && console.warn("Output has already been finalized."));
  }
  async finalize() {
    if (this.state === "pending") throw new Error("Cannot finalize before starting.");
    if (this.state === "canceled") throw new Error("Cannot finalize after canceling.");
    return this._finalizePromise ? (console.warn("Output has already been finalized."), this._finalizePromise) : this._finalizePromise = (async () => {
      this.state = "finalizing";
      const t = await this._mutex.acquire();
      try {
        const e = this._tracks.map((i) => i.source._flushOrWaitForOngoingClose(!1));
        if (await Promise.all(e), await this._muxer.finalize(), this._rootWriterPromise) {
          const i = await this._rootWriterPromise;
          i.finalized || (await i.flush(), await i.finalize());
        }
        this._onFinalize && await this._onFinalize(), this.state = "finalized";
      } finally {
        t();
      }
    })();
  }
}
const en = ["vp9", "vp8"], rn = ["avc"];
class an {
  constructor(t, e, i) {
    g(this, "_pending", []);
    this._source = t, this._plan = e, this._timeoutMs = i;
  }
  get pendingCount() {
    return this._pending.length;
  }
  enqueue(t) {
    let e;
    try {
      e = Promise.resolve(this._source.add(t / this._plan.frameRate, 1 / this._plan.frameRate));
    } catch (i) {
      e = Promise.reject(i);
    }
    e.catch(() => {
    }), this._pending.push(e);
  }
  async drainOne(t) {
    if (this._pending.length === 0) return;
    const e = await te(Promise.race(this._pending.map((i, a) => i.then(() => ({ index: a, error: null }), (o) => ({ index: a, error: o })))), `Video encoder did not drain within ${this._timeoutMs}ms.`, t, this._timeoutMs);
    if (this._pending.splice(e.index, 1), e.error) throw e.error;
  }
  async drainAll(t, e) {
    for (; this._pending.length > 0; ) await this.drainOne(t), e();
  }
}
class on {
  async $record(t, e, i) {
    this._throwIfAborted(t.signal), this._assertWebCodecsAvailable();
    const a = await this._createEncodingPlan(t);
    this._log(t, "video export plan", a), this._emitProgress(i, "recording", "probing", 0, a.frameCount);
    const o = a.format === "mp4" ? new Ae() : new ae(), s = new Jt(), n = new tn({ format: o, target: s }), d = n, l = new qs(e.canvas, { codec: a.codec, bitrate: a.bitrate, alpha: a.transparent ? "keep" : "discard", bitrateMode: a.bitrateMode, latencyMode: a.latencyMode, hardwareAcceleration: a.hardwareAcceleration, keyFrameInterval: a.keyFrameInterval, sizeChangeBehavior: "deny" }), c = new an(l, a, 3e4);
    n.addVideoTrack(l);
    try {
      if (await te(n.start(), "Video output did not start within 30000ms.", t.signal, 3e4), await e.$render({ frameCount: a.frameCount, frameRate: a.frameRate, signal: t.signal, onFrame: async ({ frameIndex: h }) => {
        this._throwIfAborted(t.signal), c.enqueue(h), this._emitProgress(i, "recording", "capturing", h + 1, a.frameCount), await this._drainIfNeeded(c, i, a, h + 1, t.signal), this._shouldYieldAfterCaptureFrame(h, a.frameCount) && await this._yieldToBrowser(t.signal);
      } }), this._throwIfAborted(t.signal), await this._drainEncodes(c, i, a, t.signal), this._emitProgress(i, "encoding", "finalizing", a.frameCount, a.frameCount), await te(n.finalize(), "Video output did not finalize within 30000ms.", t.signal, 3e4), this._emitProgress(i, "completed", "finalizing", a.frameCount, a.frameCount), !s.buffer) throw new ft("VIDEO_EXPORT_FAILED", "Video encoder finalized without producing data.");
      return new Blob([s.buffer], { type: a.mimeType });
    } catch (h) {
      try {
        await d.cancel();
      } catch {
      }
      const u = this._normalizeError(h);
      throw i == null || i({ state: "error", message: u.message }), u;
    }
  }
  async _drainIfNeeded(t, e, i, a, o) {
    t.pendingCount < 4 || (await t.drainOne(o), this._emitProgress(e, "recording", "draining", a, i.frameCount));
  }
  async _drainEncodes(t, e, i, a) {
    await t.drainAll(a, () => {
      this._throwIfAborted(a), this._emitProgress(e, "encoding", "draining", i.frameCount, i.frameCount);
    });
  }
  _shouldYieldAfterCaptureFrame(t, e) {
    const i = t + 1;
    return i < e && i % 4 == 0;
  }
  _yieldToBrowser(t) {
    return new Promise((e, i) => {
      if (t != null && t.aborted) return void i(Bt());
      let a = null, o = null, s = !1;
      const n = (c) => {
        s || (s = !0, a !== null && typeof globalThis.cancelAnimationFrame == "function" && globalThis.cancelAnimationFrame(a), o !== null && clearTimeout(o), t == null || t.removeEventListener("abort", d), c());
      }, d = () => n(() => i(Bt())), l = () => n(e);
      t == null || t.addEventListener("abort", d, { once: !0 }), typeof globalThis.requestAnimationFrame != "function" ? o = setTimeout(l, 0) : a = globalThis.requestAnimationFrame(() => {
        a = null, o = setTimeout(l, 0);
      });
    });
  }
  async _createEncodingPlan(t) {
    if (t.format === "mp4" && t.transparent) throw new ft("VIDEO_TRANSPARENCY_UNSUPPORTED", "MP4/H.264 export does not support portable alpha. Use saveVideo({ format: 'webm', transparent: true }) instead.");
    const e = Math.max(1, Math.round(t.width)), i = Math.max(1, Math.round(t.height)), a = this._resolveBitrate(t.bitrate, e, i, t.frameRate), o = t.format === "mp4" ? new Ae() : new ae(), s = t.format === "mp4" ? rn : en, n = o.getSupportedVideoCodecs().filter((l) => s.includes(l)), d = await _o(n, { width: e, height: i, bitrate: a });
    if (!d) {
      const l = s.join(" or ");
      throw new ft("VIDEO_CODEC_UNSUPPORTED", `This browser cannot encode ${l} at ${e}x${i}. Try a browser/device with native WebCodecs encoding support or reduce the export dimensions.`);
    }
    return { format: t.format, extension: t.format === "mp4" ? ".mp4" : ".webm", mimeType: o.mimeType, codec: d, bitrate: a, bitrateMode: t.bitrateMode, latencyMode: t.latencyMode, hardwareAcceleration: t.hardwareAcceleration, keyFrameInterval: t.keyFrameInterval, frameRate: t.frameRate, frameCount: t.frameCount, width: e, height: i, transparent: t.transparent };
  }
  _assertWebCodecsAvailable() {
    const t = globalThis;
    if (typeof t.VideoEncoder != "function" || typeof t.VideoFrame != "function") throw new ft("VIDEO_EXPORT_UNSUPPORTED", "Video export requires native WebCodecs VideoEncoder and VideoFrame support. This browser cannot produce deterministic video exports without a native encoder.");
  }
  _resolveBitrate(t, e, i, a) {
    if (typeof t == "number" && Number.isFinite(t) && t > 0) return Math.round(t);
    const o = typeof t == "string" ? t : "medium", s = e * i, n = Math.max(0.5, a / 60), d = o === "high" ? 6 : o === "low" ? 1.5 : 3;
    return Math.max(25e4, Math.round(s * n * d));
  }
  _throwIfAborted(t) {
    if (t != null && t.aborted) throw Bt();
  }
  _emitProgress(t, e, i, a, o) {
    t == null || t({ state: e, phase: i, frameIndex: a, frame: a, totalFrames: o, progress: o > 0 ? a / o : 0 });
  }
  _normalizeError(t) {
    return t instanceof ft ? t : new ft("VIDEO_EXPORT_FAILED", t instanceof Error ? t.message : "Video export failed.", t);
  }
  _log(t, ...e) {
    t.debugLogging && console.debug("[textmode-export]", ...e);
  }
}
class sn {
  constructor(t, e) {
    g(this, "_recorder");
    g(this, "_textmodifier");
    g(this, "_registerPostDrawHook");
    this._recorder = new on(), this._textmodifier = t, this._registerPostDrawHook = e;
  }
  async $saveVideo(t = {}) {
    await this._saveVideo(t.format ?? "mp4", t);
  }
  async _saveVideo(t, e) {
    var o;
    const i = this._applyDefaultOptions(t, e), a = new da(this._textmodifier, this._registerPostDrawHook, i.width, i.height);
    try {
      const s = await this._recorder.$record(i, a, e.onProgress);
      new At().$downloadFile(s, this._withExtension(i.filename, `.${t}`));
    } catch (s) {
      throw (o = e.onProgress) == null || o.call(e, { state: "error", message: s instanceof Error ? s.message : `${t.toUpperCase()} export failed` }), s;
    }
  }
  _applyDefaultOptions(t, e) {
    const i = this._positiveInteger(e.frameRate, 60), a = this._positiveInteger(e.frameCount, 300), o = this._positiveNumber(e.pixelDensity, 1), s = this._currentPixelDensity(), n = Math.max(1, Math.round(this._textmodifier.canvas.width / s * o)), d = Math.max(1, Math.round(this._textmodifier.canvas.height / s * o));
    return { filename: e.filename, format: t, frameRate: i, frameCount: a, bitrate: this._bitrate(e.bitrate), bitrateMode: this._bitrateMode(e.bitrateMode), latencyMode: this._latencyMode(e.latencyMode), hardwareAcceleration: this._hardwareAcceleration(e.hardwareAcceleration), keyFrameInterval: this._keyFrameInterval(e.keyFrameInterval), pixelDensity: o, width: n, height: d, transparent: !!e.transparent, debugLogging: !!e.debugLogging, signal: e.signal };
  }
  _positiveInteger(t, e) {
    return Number.isFinite(t) ? Math.max(1, Math.round(Math.abs(t))) : e;
  }
  _positiveNumber(t, e) {
    return Number.isFinite(t) ? Math.max(Number.EPSILON, Math.abs(t)) : e;
  }
  _bitrate(t) {
    return typeof t == "number" && Number.isFinite(t) && t > 0 || t === "low" || t === "medium" || t === "high" ? t : "medium";
  }
  _bitrateMode(t) {
    return t === "constant" || t === "variable" ? t : "variable";
  }
  _latencyMode(t) {
    return t === "quality" || t === "realtime" ? t : "quality";
  }
  _hardwareAcceleration(t) {
    return t === "prefer-hardware" || t === "prefer-software" || t === "no-preference" ? t : "no-preference";
  }
  _keyFrameInterval(t) {
    return Number.isFinite(t) ? Math.max(0, Math.abs(t)) : 2;
  }
  _currentPixelDensity() {
    var i;
    const t = this._textmodifier, e = (i = t.pixelDensity) == null ? void 0 : i.call(t);
    return typeof e == "number" && Number.isFinite(e) && e > 0 ? e : 1;
  }
  _withExtension(t, e) {
    if (!t) return;
    const i = t.trim();
    return i ? i.toLowerCase().endsWith(e) ? i : `${i}${e}` : void 0;
  }
}
class nn extends Fe {
  $extractCellData(t) {
    var n;
    const e = this.$extractFramebufferData(t.drawFramebuffer), i = [], a = t.grid, o = t.font;
    let s = 0;
    for (let d = 0; d < a.rows; d++) for (let l = 0; l < a.cols; l++) {
      const c = 4 * s, h = this.$getEncodedCharacterValue(e.characterPixels, c), u = this.$extractCellTransform(e.characterPixels, c), m = ((n = De(o, h)) == null ? void 0 : n.character) ?? " ";
      i.push({ x: l, y: d, character: m, foreground: Zt(e.primaryColorPixels, c), background: Zt(e.secondaryColorPixels, c), transform: { invert: u.isInverted, flipX: u.flipHorizontal, flipY: u.flipVertical, rotation: u.rotation } }), s++;
    }
    return i;
  }
}
class xe {
  _applyDefaultOptions(t) {
    return { target: t.target ?? "selected", pretty: t.pretty ?? !0, colorMode: t.colorMode ?? "hex", includeMetadata: t.includeMetadata ?? !0, filename: t.filename, layer: t.layer };
  }
  _createMetadata(t) {
    return t.includeMetadata ? { createdAt: (/* @__PURE__ */ new Date()).toISOString(), generator: { name: "textmode.export.js", version: "1.2.1" } } : void 0;
  }
  _formatColor(t, e) {
    return e === "rgba" ? { ...t } : `#${[t.r, t.g, t.b, t.a].map((i) => i.toString(16).padStart(2, "0")).join("")}`;
  }
  _createObjectRowsCells(t, e, i, a) {
    const o = [];
    for (let s = 0; s < i; s++) {
      const n = s * e, d = t.slice(n, n + e).map((l) => ({ x: l.x, y: l.y, character: l.character, foreground: this._formatColor(l.foreground, a), background: this._formatColor(l.background, a), transform: { ...l.transform } }));
      o.push(d);
    }
    return { encoding: "object-rows-v1", rows: o };
  }
  _createLayerGrid(t) {
    return { cols: t.grid.cols, rows: t.grid.rows, cellWidth: t.grid.cellWidth, cellHeight: t.grid.cellHeight };
  }
  _createLayerCells(t, e) {
    const i = new nn().$extractCellData(t);
    return this._createObjectRowsCells(i, t.grid.cols, t.grid.rows, e.colorMode);
  }
  _createStackLayer(t, e) {
    return { id: t.id, visible: t.visible, opacity: t.opacity, blendMode: t.blendMode, offsetX: t.offsetX, offsetY: t.offsetY, rotationZ: t.rotationZ, grid: this._createLayerGrid(t), cells: this._createLayerCells(t, e) };
  }
  $generateJSONData(t, e = {}) {
    const i = this._applyDefaultOptions(e), a = this._createMetadata(i);
    if (i.target === "all") {
      const s = Li(t), n = s[0].grid;
      return { format: "textmode.document", formatVersion: "2.0.0", target: "all", ...a ? { metadata: a } : {}, canvas: { width: n.width, height: n.height }, layers: s.map((d) => this._createStackLayer(d, i)) };
    }
    const o = oe(t, i.layer);
    return { format: "textmode.document", formatVersion: "2.0.0", target: "selected", ...a ? { metadata: a } : {}, canvas: { width: o.grid.width, height: o.grid.height }, grid: this._createLayerGrid(o), layer: { id: o.id, cells: this._createLayerCells(o, i) } };
  }
  $generateJSONString(t, e = {}) {
    const i = this._applyDefaultOptions(e), a = this.$generateJSONData(t, i), o = typeof i.pretty == "number" ? i.pretty : i.pretty ? 2 : 0;
    return JSON.stringify(a, null, o);
  }
  $saveJSON(t, e = {}) {
    const i = this._applyDefaultOptions(e);
    new At().$downloadFile(new Blob([this.$generateJSONString(t, i)], { type: "application/json;charset=utf-8" }), i.filename);
  }
}
const C = { root: "textmode-export-overlay", stack: "textmode-export-overlay__stack", stackDense: "textmode-export-overlay__stack--dense", stackCompact: "textmode-export-overlay__stack--compact", section: "textmode-export-overlay__section", header: "textmode-export-overlay__header", headerTitleRow: "textmode-export-overlay__header-title-row", headerLinks: "textmode-export-overlay__header-links", row: "textmode-export-overlay__row", label: "textmode-export-overlay__label", field: "textmode-export-overlay__field", fieldCompact: "textmode-export-overlay__field--compact", fieldDense: "textmode-export-overlay__field--dense", fieldFull: "textmode-export-overlay__field--full", fieldChannel: "textmode-export-overlay__field--channel", input: "textmode-export-overlay__input", checkbox: "textmode-export-overlay__checkbox", muted: "textmode-export-overlay__muted", status: "textmode-export-overlay__status", statusGif: "textmode-export-overlay__status--gif", statusVideo: "textmode-export-overlay__status--video", statusTitle: "textmode-export-overlay__status-title", statusValue: "textmode-export-overlay__status-value", divider: "textmode-export-overlay__divider", title: "textmode-export-overlay__title", button: "textmode-export-overlay__button", buttonPrimary: "textmode-export-overlay__button--primary", buttonSecondary: "textmode-export-overlay__button--secondary", buttonFull: "textmode-export-overlay__button--full", supportLink: "textmode-export-overlay__support-link", supportIcon: "textmode-export-overlay__support-icon", linkIcon: "textmode-export-overlay__link-icon" };
class it {
  constructor() {
    g(this, "element");
    g(this, "mounted", !1);
    g(this, "destroyed", !1);
  }
  mount(t) {
    if (this.destroyed) throw new Error("Cannot mount a destroyed component");
    if (this.mounted) return;
    const e = this.render();
    t.appendChild(e), this.element = e, this.onMount(), this.mounted = !0;
  }
  unmount() {
    this.mounted && this.element && (this._onUnmount(), this.element.remove(), this.element = void 0, this.mounted = !1);
  }
  destroy() {
    this.destroyed || (this.unmount(), this._onDestroy(), this.destroyed = !0);
  }
  update(t) {
    this.mounted && this.onUpdate(t);
  }
  onMount() {
  }
  _onUnmount() {
  }
  _onDestroy() {
  }
  onUpdate(t) {
  }
  get root() {
    if (!this.element) throw new Error("Component is not mounted yet");
    return this.element;
  }
  isMounted() {
    return this.mounted;
  }
}
const St = class St extends it {
  render() {
    const t = document.createElement("div");
    t.classList.add(C.stack, C.stackDense, C.header);
    const e = document.createElement("div");
    e.classList.add(C.headerTitleRow);
    const i = document.createElement("strong");
    i.textContent = "textmode.export.js", i.classList.add(C.title);
    const a = document.createElement("div");
    a.classList.add(C.headerLinks);
    const o = this._createLink("https://github.com/humanbydefinition/textmode.export.js", "View repository on GitHub", C.linkIcon, [{ d: "M0 0h24v24H0z", fill: "none", stroke: "none" }, { d: "M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" }]), s = this._createLink("https://code.textmode.art/docs/support", "Support textmode.export.js", C.supportIcon, [{ d: "M0 0h24v24H0z", fill: "none", stroke: "none" }, { d: "M3 14c.83 .642 2.077 1.017 3.5 1c1.423 .017 2.67 -.358 3.5 -1c.83 -.642 2.077 -1.017 3.5 -1c1.423 -.017 2.67 .358 3.5 1" }, { d: "M8 3a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2" }, { d: "M12 3a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2" }, { d: "M3 10h14v5a6 6 0 0 1 -6 6h-2a6 6 0 0 1 -6 -6v-5z" }, { d: "M16.746 16.726a3 3 0 1 0 .252 -5.555" }]);
    a.appendChild(o), a.appendChild(s), e.appendChild(i), e.appendChild(a);
    const n = document.createElement("div");
    return n.classList.add(C.divider), t.appendChild(e), t.appendChild(n), t;
  }
  _createLink(t, e, i, a) {
    const o = document.createElement("a");
    return o.href = t, o.target = "_blank", o.rel = "noopener noreferrer", o.classList.add(C.supportLink), o.setAttribute("aria-label", e), o.appendChild(this._createIcon(i, a)), o;
  }
  _createIcon(t, e) {
    const i = document.createElementNS(St._iconNamespace, "svg");
    i.setAttribute("xmlns", St._iconNamespace), i.setAttribute("width", "18"), i.setAttribute("height", "18"), i.setAttribute("viewBox", "0 0 24 24"), i.setAttribute("fill", "none"), i.setAttribute("stroke", "currentColor"), i.setAttribute("stroke-width", "2"), i.setAttribute("stroke-linecap", "round"), i.setAttribute("stroke-linejoin", "round"), i.classList.add(t);
    for (const a of e) {
      const o = document.createElementNS(St._iconNamespace, "path");
      for (const [s, n] of Object.entries(a)) o.setAttribute(s, n);
      i.appendChild(o);
    }
    return i;
  }
};
g(St, "_iconNamespace", "http://www.w3.org/2000/svg");
let Ie = St;
class H extends it {
  constructor(e) {
    super();
    g(this, "props");
    this.props = e;
  }
  render() {
    const e = document.createElement("div");
    e.classList.add(C.field), this.applyVariant(e, this.props.variant);
    const i = document.createElement("label");
    if (i.classList.add(C.label), i.textContent = this.props.label, this.props.labelFor && (i.htmlFor = this.props.labelFor), e.appendChild(i), this.props.description) {
      const a = document.createElement("span");
      a.classList.add(C.muted), a.textContent = this.props.description, e.appendChild(a);
    }
    return e;
  }
  attachControl(e) {
    this.root.appendChild(e);
  }
  update(e) {
    this.props = e, super.update(e);
  }
  onUpdate(e) {
    const i = this.root;
    for (; i.firstChild; ) i.removeChild(i.firstChild);
    this.props = e, i.classList.add(C.field), this.applyVariant(i, e.variant);
    const a = document.createElement("label");
    if (a.classList.add(C.label), a.textContent = e.label, e.labelFor && (a.htmlFor = e.labelFor), i.appendChild(a), e.description) {
      const o = document.createElement("span");
      o.classList.add(C.muted), o.textContent = e.description, i.appendChild(o);
    }
  }
  applyVariant(e, i) {
    switch (e.classList.remove(C.fieldCompact, C.fieldDense, C.fieldFull, C.fieldChannel), i) {
      case "compact":
        e.classList.add(C.fieldCompact);
        break;
      case "dense":
        e.classList.add(C.fieldDense);
        break;
      case "full":
        e.classList.add(C.fieldFull);
        break;
      case "channel":
        e.classList.add(C.fieldChannel);
    }
  }
}
class tt extends it {
  constructor(e) {
    super();
    g(this, "props");
    g(this, "select");
    g(this, "handleChange", () => {
      this.props.defaultValue = this.select.value;
    });
    this.props = e;
  }
  render() {
    return this.select = document.createElement("select"), this.select.classList.add(C.input), this.props.id && (this.select.id = this.props.id), this.populateOptions(), this.select.addEventListener("change", this.handleChange), this.select;
  }
  get selectElement() {
    return this.select;
  }
  get value() {
    return this.select.value;
  }
  set value(e) {
    this.select && (this.select.value = e), this.props.defaultValue = e;
  }
  _onUnmount() {
    this.select.removeEventListener("change", this.handleChange);
  }
  onUpdate(e) {
    this.props = e, this.populateOptions(), e.defaultValue && (this.select.value = e.defaultValue);
  }
  update(e) {
    this.props = { ...this.props, ...e }, this.select && (e.id && (this.select.id = e.id), e.options && this.populateOptions(), e.defaultValue !== void 0 && (this.select.value = e.defaultValue));
  }
  populateOptions() {
    if (this.select) {
      this.select.innerHTML = "";
      for (const e of this.props.options) {
        const i = document.createElement("option");
        i.value = e.value, i.textContent = e.label, this.select.appendChild(i);
      }
      this.props.defaultValue && (this.select.value = this.props.defaultValue);
    }
  }
}
class Vr extends it {
  constructor(e) {
    super();
    g(this, "props");
    g(this, "button");
    this.props = e;
  }
  render() {
    return this.button = document.createElement("button"), this.button.type = "button", this.button.textContent = this.props.label, this.button.classList.add(C.button), this.props.variant === "secondary" ? this.button.classList.add(C.buttonSecondary) : this.button.classList.add(C.buttonPrimary), this.props.fullWidth && this.button.classList.add(C.buttonFull), this.button.disabled = !!this.props.disabled, this.button;
  }
  get buttonElement() {
    return this.button;
  }
  setLabel(e) {
    this.props.label = e, this.button.textContent = e;
  }
  setDisabled(e) {
    this.props.disabled = e, this.button.disabled = e;
  }
  onUpdate(e) {
    this.props = e, this.button.textContent = e.label, this.button.disabled = !!e.disabled, e.variant === "secondary" ? (this.button.classList.add(C.buttonSecondary), this.button.classList.remove(C.buttonPrimary)) : (this.button.classList.add(C.buttonPrimary), this.button.classList.remove(C.buttonSecondary)), this.button.classList.toggle(C.buttonFull, !!e.fullWidth);
  }
}
class cn {
  constructor(t) {
    g(this, "api");
    this.api = t;
  }
  async $copy(t, e) {
    switch (t) {
      case "txt": {
        const i = this.api.toString(e);
        await navigator.clipboard.writeText(i);
        break;
      }
      case "json": {
        const i = this.api.toJSONString(e);
        await navigator.clipboard.writeText(i);
        break;
      }
      case "svg": {
        const i = this.api.toSVG(e);
        await navigator.clipboard.writeText(i);
        break;
      }
      case "image":
        await this.api.copyCanvas(e);
        break;
      default:
        throw new Error(`Clipboard not supported for ${t}`);
    }
  }
}
class dn {
  constructor(t, e) {
    g(this, "api");
    g(this, "events");
    this.api = t, this.events = e;
  }
  async $requestExport(t, e, i = {}) {
    this.events.$emit("export:request", { format: t });
    try {
      const a = { onGIFProgress: i.onGIFProgress ? (o) => {
        var s;
        (s = i.onGIFProgress) == null || s.call(i, o), this.events.$emit("export:progress", { format: t, progress: o });
      } : t === "gif" ? (o) => this.events.$emit("export:progress", { format: t, progress: o }) : void 0, onVideoProgress: i.onVideoProgress ? (o) => {
        var s;
        (s = i.onVideoProgress) == null || s.call(i, o), this.events.$emit("export:progress", { format: t, progress: o });
      } : t === "video" ? (o) => this.events.$emit("export:progress", { format: t, progress: o }) : void 0 };
      await this._execute(t, e, a), this.events.$emit("export:success", { format: t });
    } catch (a) {
      throw this.events.$emit("export:error", { format: t, error: a }), a;
    }
  }
  _execute(t, e, i) {
    switch (t) {
      case "txt":
        return Promise.resolve(this.api.saveStrings(e));
      case "json":
        return Promise.resolve(this.api.saveJSON(e));
      case "image":
        return this.api.saveCanvas(e);
      case "svg":
        return Promise.resolve(this.api.saveSVG(e));
      case "gif": {
        const a = { ...e, onProgress: i.onGIFProgress };
        return this.api.saveGIF(a);
      }
      case "video": {
        const a = { ...e, onProgress: i.onVideoProgress };
        return this.api.saveVideo(a);
      }
    }
  }
}
class ln {
  constructor(t, e) {
    g(this, "modifier");
    g(this, "overlay");
    g(this, "animationFrameId", null);
    g(this, "handleUpdate");
    g(this, "bound", !1);
    this.modifier = t, this.overlay = e, this.handleUpdate = () => this.scheduleUpdate();
  }
  scheduleUpdate() {
    this.animationFrameId !== null && cancelAnimationFrame(this.animationFrameId), this.animationFrameId = requestAnimationFrame(() => this.update());
  }
  bind() {
    this.bound || (window.addEventListener("resize", this.handleUpdate), window.addEventListener("scroll", this.handleUpdate, !0), this.bound = !0, this.handleUpdate());
  }
  update() {
    this.animationFrameId = null;
    const t = this.modifier.canvas.getBoundingClientRect();
    this.overlay.style.top = `${t.top + window.scrollY + 8}px`, this.overlay.style.left = `${t.left + window.scrollX + 8}px`;
  }
  dispose() {
    this.animationFrameId !== null && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null), this.bound && (window.removeEventListener("resize", this.handleUpdate), window.removeEventListener("scroll", this.handleUpdate, !0), this.bound = !1);
  }
}
const jt = "textmode-export-number-input", hn = `${jt}__field`, un = `${jt}__controls`, mn = `${jt}__control`, Bi = `${jt}__display`, Yt = `${Bi}--visible`, pn = (r) => {
  r.dispatchEvent(new Event("input", { bubbles: !0 })), r.dispatchEvent(new Event("change", { bubbles: !0 }));
}, Or = (r) => {
  const t = document.createElement("button");
  return t.type = "button", t.className = mn, t.textContent = r > 0 ? "▲" : "▼", t;
};
class ut extends it {
  constructor(e) {
    super();
    g(this, "props");
    g(this, "input");
    g(this, "display");
    g(this, "incrementButton");
    g(this, "decrementButton");
    g(this, "suppressClickAfterPointer", /* @__PURE__ */ new WeakMap());
    g(this, "holdTimeoutId");
    g(this, "holdIntervalId");
    g(this, "activePointerId");
    g(this, "disabledObserver");
    this.props = e;
  }
  render() {
    const e = document.createElement("div");
    e.className = jt, this.input = document.createElement("input"), this.input.type = "number", this.input.value = this.props.defaultValue, Object.assign(this.input, this.props.attributes), this.input.className = hn, this.display = document.createElement("div"), this.display.className = Bi;
    const i = document.createElement("div");
    return i.className = un, this.incrementButton = Or(1), this.decrementButton = Or(-1), i.appendChild(this.incrementButton), i.appendChild(this.decrementButton), e.appendChild(this.input), e.appendChild(this.display), e.appendChild(i), this.bindStepControls(), this.bindHoldBehavior(), this.bindInputListeners(), this.observeDisabledState(e), this.updateDisplay(), e;
  }
  get inputElement() {
    return this.input;
  }
  get value() {
    return this.input.value;
  }
  set value(e) {
    this.input.value = e, this.updateDisplay();
  }
  refresh() {
    this.updateDisplay();
  }
  _onDestroy() {
    var e;
    this.clearHoldTimers(), (e = this.disabledObserver) == null || e.disconnect();
  }
  bindStepControls() {
    const e = (s) => () => {
      if (this.input.disabled) return;
      const n = this.input.value, d = this.input.getAttribute("step");
      if (d && d !== "any") s > 0 ? this.input.stepUp() : this.input.stepDown();
      else {
        const l = s > 0 ? 1 : -1, c = Number.parseFloat(this.input.value || "0"), h = Number.isFinite(c) ? c + l : l;
        this.input.value = String(h);
      }
      this.input.value !== n && pn(this.input), this.updateDisplay(), this.input.focus({ preventScroll: !0 });
    }, i = e(1), a = e(-1), o = (s, n) => (d) => {
      if (this.suppressClickAfterPointer.get(s)) return this.suppressClickAfterPointer.set(s, !1), void d.preventDefault();
      n();
    };
    this.incrementButton.addEventListener("click", o(this.incrementButton, i)), this.decrementButton.addEventListener("click", o(this.decrementButton, a));
  }
  bindHoldBehavior() {
    const e = (i, a) => {
      const o = a > 0 ? () => this.incrementButton.click() : () => this.decrementButton.click();
      i.addEventListener("pointerdown", (d) => {
        if (d.button === 0) {
          d.preventDefault(), this.suppressClickAfterPointer.set(i, !0), this.activePointerId = d.pointerId;
          try {
            i.setPointerCapture(d.pointerId);
          } catch {
          }
          o(), this.holdTimeoutId = window.setTimeout(() => {
            this.holdIntervalId = window.setInterval(o, 80);
          }, 380);
        }
      });
      const s = () => {
        if (this.activePointerId !== void 0) {
          try {
            i.releasePointerCapture(this.activePointerId);
          } catch {
          }
          this.activePointerId = void 0;
        }
      }, n = () => {
        this.clearHoldTimers(), s();
      };
      i.addEventListener("pointerup", n), i.addEventListener("pointerleave", n), i.addEventListener("pointercancel", n);
    };
    e(this.incrementButton, 1), e(this.decrementButton, -1);
  }
  bindInputListeners() {
    const e = () => {
      this.props.defaultValue = this.input.value, this.updateDisplay();
    };
    this.input.addEventListener("input", e), this.input.addEventListener("change", e);
  }
  observeDisabledState(e) {
    const i = () => {
      const a = this.input.disabled;
      this.incrementButton.disabled = a, this.decrementButton.disabled = a, e.classList.toggle("is-disabled", a), a ? (this.display.classList.remove(Yt), this.input.style.removeProperty("color"), this.input.style.removeProperty("caretColor")) : this.updateDisplay();
    };
    typeof MutationObserver < "u" && (this.disabledObserver = new MutationObserver(i), this.disabledObserver.observe(this.input, { attributes: !0, attributeFilter: ["disabled"] })), i();
  }
  updateDisplay() {
    const e = this.props.formatDisplay;
    if (!e) return this.display.textContent = "", this.display.classList.remove(Yt), this.input.style.removeProperty("color"), void this.input.style.removeProperty("caretColor");
    const i = this.input.value, a = Number.parseFloat(i), o = e(Number.isFinite(a) ? a : Number.NaN, i, this.input);
    o ? (this.display.textContent = o, this.display.classList.add(Yt), this.input.style.color = "transparent", this.input.style.caretColor = "#f8fafc") : (this.display.textContent = "", this.display.classList.remove(Yt), this.input.style.removeProperty("color"), this.input.style.removeProperty("caretColor"));
  }
  clearHoldTimers() {
    this.holdTimeoutId !== void 0 && (window.clearTimeout(this.holdTimeoutId), this.holdTimeoutId = void 0), this.holdIntervalId !== void 0 && (window.clearInterval(this.holdIntervalId), this.holdIntervalId = void 0);
  }
}
class wt extends it {
  constructor(e = "stack", i = []) {
    super();
    g(this, "variant");
    g(this, "additionalClasses");
    this.variant = e, this.additionalClasses = i;
  }
  render() {
    const e = document.createElement("div"), i = [this.variant === "stack" ? C.stack : void 0, this.variant === "stackDense" ? C.stackDense : void 0, this.variant === "stackCompact" ? C.stackCompact : void 0, this.variant === "row" ? C.row : void 0, this.variant === "section" ? C.section : void 0, ...this.additionalClasses].filter(Boolean);
    return e.classList.add(...i), e;
  }
}
const Nr = { neutral: "textmode-export-overlay__status-value--neutral", active: "textmode-export-overlay__status-value--active", alert: "textmode-export-overlay__status-value--alert" };
class Ai extends it {
  constructor(e) {
    super();
    g(this, "props");
    g(this, "container");
    g(this, "messageElement");
    this.props = e;
  }
  render() {
    this.container = document.createElement("div"), this.container.classList.add(C.status), this.props.context === "gif" ? this.container.classList.add(C.statusGif) : this.props.context === "video" && this.container.classList.add(C.statusVideo);
    const e = document.createElement("span");
    return e.classList.add(C.statusTitle), e.textContent = this.props.title, this.messageElement = document.createElement("span"), this.messageElement.classList.add(C.statusValue), this.messageElement.textContent = this.props.message, this.applyVariant(this.props.variant ?? "neutral"), this.container.appendChild(e), this.container.appendChild(this.messageElement), this.container;
  }
  setMessage(e, i = "neutral") {
    this.messageElement.textContent = e, this.applyVariant(i);
  }
  onUpdate(e) {
    this.props = e, this.setMessage(e.message, e.variant ?? "neutral");
  }
  applyVariant(e) {
    this.messageElement.classList.remove(...Object.values(Nr)), this.messageElement.classList.add(Nr[e]);
  }
}
class Pt extends it {
  constructor(e) {
    super();
    g(this, "_config");
    g(this, "_managedComponents", /* @__PURE__ */ new Set());
    this._config = e;
  }
  _manageComponent(e) {
    return this._managedComponents.add(e), e;
  }
  _onUnmount() {
    for (const e of this._managedComponents) e.unmount();
  }
  _onDestroy() {
    for (const e of this._managedComponents) e.destroy();
    this._managedComponents.clear();
  }
}
const vt = { frameCount: 300, frameRate: 60, scale: 1, repeat: 0 };
class Pe extends Pt {
  constructor(e) {
    super(e);
    g(this, "frameCountInput", this._manageComponent(new ut({ defaultValue: String(vt.frameCount), attributes: { min: "1", max: "600", step: "1" } })));
    g(this, "frameRateInput", this._manageComponent(new ut({ defaultValue: String(vt.frameRate), attributes: { min: "1", max: "60", step: "1" } })));
    g(this, "scaleInput", this._manageComponent(new ut({ defaultValue: String(vt.scale), attributes: { min: "0.1", max: "8", step: "0.1" } })));
    g(this, "repeatInput", this._manageComponent(new ut({ defaultValue: "0", attributes: { min: "0", max: "50", step: "1" }, formatDisplay: (e, i) => Number.isFinite(e) ? e === 0 ? "∞" : null : i.trim() === "" ? null : i })));
    g(this, "status", this._manageComponent(new Ai({ title: "status", message: "ready to record", variant: "neutral", context: "gif" })));
    g(this, "recordingState", "idle");
  }
  render() {
    const e = document.createElement("div");
    e.classList.add(C.stack);
    const i = new wt("row");
    i.mount(e);
    const a = new H({ label: "number of frames", labelFor: "textmode-export-gif-frame-count", variant: "dense" });
    a.mount(i.root), this.frameCountInput.mount(a.root), this.frameCountInput.inputElement.id = "textmode-export-gif-frame-count";
    const o = new H({ label: "frame rate (fps)", labelFor: "textmode-export-gif-frame-rate", variant: "dense" });
    o.mount(i.root), this.frameRateInput.mount(o.root), this.frameRateInput.inputElement.id = "textmode-export-gif-frame-rate";
    const s = new wt("row");
    s.mount(e);
    const n = new H({ label: "scale", labelFor: "textmode-export-gif-scale", variant: "dense" });
    n.mount(s.root), this.scaleInput.mount(n.root), this.scaleInput.inputElement.id = "textmode-export-gif-scale";
    const d = new H({ label: "loop count", labelFor: "textmode-export-gif-repeat", variant: "dense" });
    return d.mount(s.root), this.repeatInput.mount(d.root), this.repeatInput.inputElement.id = "textmode-export-gif-repeat", this.status.mount(e), e;
  }
  getOptions() {
    const e = this._config.defaultOptions ?? {};
    return { frameCount: this.safeParseInt(this.frameCountInput.value, e.frameCount ?? 300), frameRate: this.safeParseInt(this.frameRateInput.value, e.frameRate ?? 60), scale: this.safeParseFloat(this.scaleInput.value, e.scale ?? 1), repeat: this.safeParseInt(this.repeatInput.value, e.repeat ?? 0) };
  }
  reset() {
    this.recordingState = "idle", this.applyDefaults(), this.setRecordingState("idle");
  }
  validate() {
    const e = Number.parseInt(this.frameCountInput.value, 10), i = Number.parseInt(this.frameRateInput.value, 10), a = Number.parseFloat(this.scaleInput.value);
    return Number.isFinite(e) && e > 0 && Number.isFinite(i) && i > 0 && Number.isFinite(a) && a > 0;
  }
  isRecording() {
    return this.recordingState === "recording" || this.recordingState === "encoding";
  }
  setRecordingState(e, i) {
    this.recordingState = e;
    const a = e === "recording" || e === "encoding";
    switch (this.frameCountInput.inputElement.disabled = a, this.frameRateInput.inputElement.disabled = a, this.scaleInput.inputElement.disabled = a, this.repeatInput.inputElement.disabled = a, e) {
      case "recording":
        if (i != null && i.totalFrames) {
          const o = i.frameIndex ?? 0;
          this.status.setMessage(`recording ${o}/${i.totalFrames}`, "active");
        } else this.status.setMessage("recording…", "active");
        break;
      case "encoding":
        if (i != null && i.totalFrames) {
          const o = i.frameIndex ?? 0;
          this.status.setMessage(`encoding ${o}/${i.totalFrames}`, "active");
        } else this.status.setMessage("encoding…", "active");
        break;
      case "completed":
        this.status.setMessage("GIF saved successfully", "active");
        break;
      case "error":
        this.status.setMessage((i == null ? void 0 : i.message) ?? "failed to export GIF", "alert");
        break;
      default:
        this.status.setMessage("ready to record", "neutral");
    }
  }
  handleProgress(e) {
    if (e.state !== "recording" && e.state !== "encoding" || !e.totalFrames) e.state === "completed" ? this.status.setMessage("GIF saved successfully", "active") : e.state === "error" && this.status.setMessage(e.message ?? "failed to export GIF", "alert");
    else {
      const i = e.state === "recording" ? "recording" : "encoding";
      this.status.setMessage(`${i} ${e.frameIndex ?? 0}/${e.totalFrames}`, "active");
    }
  }
  applyDefaults() {
    const e = this._config.defaultOptions ?? {}, i = e.frameCount ?? vt.frameCount, a = e.frameRate ?? vt.frameRate, o = e.scale ?? vt.scale, s = e.repeat ?? vt.repeat;
    this.frameCountInput.value = String(i), this.frameRateInput.value = String(a), this.scaleInput.value = String(o), this.repeatInput.value = String(s), this.frameCountInput.refresh(), this.frameRateInput.refresh(), this.scaleInput.refresh(), this.repeatInput.refresh();
  }
  safeParseInt(e, i) {
    const a = Number.parseInt(e, 10);
    return Number.isFinite(a) ? a : i;
  }
  safeParseFloat(e, i) {
    const a = Number.parseFloat(e);
    return Number.isFinite(a) ? a : i;
  }
}
class Nt extends it {
  constructor(e) {
    super();
    g(this, "props");
    g(this, "checkbox");
    g(this, "labelElement");
    g(this, "handleChange", () => {
      this.props.defaultChecked = this.checkbox.checked;
    });
    this.props = e;
  }
  render() {
    this.labelElement = document.createElement("label"), this.labelElement.classList.add(C.checkbox), this.checkbox = document.createElement("input"), this.checkbox.type = "checkbox", this.props.id && (this.checkbox.id = this.props.id), this.checkbox.checked = !!this.props.defaultChecked, this.checkbox.addEventListener("change", this.handleChange);
    const e = document.createElement("span");
    return e.textContent = this.props.label, this.labelElement.htmlFor = this.props.id ?? "", this.labelElement.appendChild(this.checkbox), this.labelElement.appendChild(e), this.labelElement;
  }
  get inputElement() {
    return this.checkbox;
  }
  get checked() {
    return this.checkbox.checked;
  }
  set checked(e) {
    this.checkbox.checked = e;
  }
  _onUnmount() {
    this.checkbox.removeEventListener("change", this.handleChange);
  }
  onUpdate(e) {
    this.props = e, e.id && (this.checkbox.id = e.id, this.labelElement.htmlFor = e.id), this.checkbox.checked = !!e.defaultChecked, this.labelElement.lastElementChild && (this.labelElement.lastElementChild.textContent = e.label);
  }
}
class Me extends Pt {
  constructor(e) {
    super(e);
    g(this, "formatSelect", this._manageComponent(new tt({ id: "textmode-export-video-format", options: [{ value: "mp4", label: "MP4/H.264 (.mp4)" }, { value: "webm", label: "WebM (.webm)" }], defaultValue: "mp4" })));
    g(this, "bitrateSelect", this._manageComponent(new tt({ id: "textmode-export-video-bitrate", options: [{ value: "low", label: "low" }, { value: "medium", label: "medium" }, { value: "high", label: "high" }], defaultValue: "medium" })));
    g(this, "frameRateInput", this._manageComponent(new ut({ defaultValue: String(60), attributes: { min: String(1), max: String(60), step: "1" }, formatDisplay: (e) => Number.isFinite(e) ? `${e} fps` : null })));
    g(this, "frameCountInput", this._manageComponent(new ut({ defaultValue: String(480), attributes: { min: String(1), max: String(3600), step: "1" } })));
    g(this, "bitrateModeSelect", this._manageComponent(new tt({ id: "textmode-export-video-bitrate-mode", options: [{ value: "variable", label: "variable" }, { value: "constant", label: "constant" }], defaultValue: "variable" })));
    g(this, "latencyModeSelect", this._manageComponent(new tt({ id: "textmode-export-video-latency-mode", options: [{ value: "quality", label: "quality" }, { value: "realtime", label: "realtime" }], defaultValue: "quality" })));
    g(this, "hardwareAccelerationSelect", this._manageComponent(new tt({ id: "textmode-export-video-hardware-acceleration", options: [{ value: "no-preference", label: "no preference" }, { value: "prefer-hardware", label: "prefer hardware" }, { value: "prefer-software", label: "prefer software" }], defaultValue: "no-preference" })));
    g(this, "keyFrameIntervalInput", this._manageComponent(new ut({ defaultValue: String(2), attributes: { min: "0", step: "0.25" }, formatDisplay: (e) => Number.isFinite(e) ? `${e}s` : null })));
    g(this, "transparencyInput", this._manageComponent(new Nt({ id: "textmode-export-video-transparent", label: "preserve transparency", defaultChecked: !1 })));
    g(this, "status", this._manageComponent(new Ai({ title: "status", message: "ready to record", variant: "neutral", context: "video" })));
    g(this, "recordingState", "idle");
    g(this, "handleFormatChange", () => {
      this.syncTransparencyAvailability();
    });
  }
  render() {
    const e = document.createElement("div");
    e.classList.add(C.stack);
    const i = new wt("row");
    i.mount(e);
    const a = new H({ label: "video format", labelFor: "textmode-export-video-format", variant: "compact" });
    a.mount(i.root), this.formatSelect.mount(a.root);
    const o = new H({ label: "bitrate preset", labelFor: "textmode-export-video-bitrate", variant: "compact" });
    o.mount(i.root), this.bitrateSelect.mount(o.root);
    const s = new wt("row");
    s.mount(e);
    const n = new H({ label: "number of frames", labelFor: "textmode-export-video-frame-count", variant: "compact" });
    n.mount(s.root), this.frameCountInput.mount(n.root), this.frameCountInput.inputElement.id = "textmode-export-video-frame-count";
    const d = new H({ label: "frame rate (fps)", labelFor: "textmode-export-video-frame-rate", variant: "compact" });
    d.mount(s.root), this.frameRateInput.mount(d.root), this.frameRateInput.inputElement.id = "textmode-export-video-frame-rate";
    const l = new wt("row");
    l.mount(e);
    const c = new H({ label: "bitrate mode", labelFor: "textmode-export-video-bitrate-mode", variant: "compact" });
    c.mount(l.root), this.bitrateModeSelect.mount(c.root);
    const h = new H({ label: "encoder mode", labelFor: "textmode-export-video-latency-mode", variant: "compact" });
    h.mount(l.root), this.latencyModeSelect.mount(h.root);
    const u = new wt("row");
    u.mount(e);
    const m = new H({ label: "hardware", labelFor: "textmode-export-video-hardware-acceleration", variant: "compact" });
    m.mount(u.root), this.hardwareAccelerationSelect.mount(m.root);
    const w = new H({ label: "keyframe interval", labelFor: "textmode-export-video-keyframe-interval", variant: "compact" });
    return w.mount(u.root), this.keyFrameIntervalInput.mount(w.root), this.keyFrameIntervalInput.inputElement.id = "textmode-export-video-keyframe-interval", this.transparencyInput.mount(e), this.formatSelect.selectElement.addEventListener("change", this.handleFormatChange), this.syncTransparencyAvailability(), this.status.mount(e), e;
  }
  getOptions() {
    const e = this._config.defaultOptions ?? {}, i = Number.parseInt(this.frameCountInput.value, 10), a = Number.parseFloat(this.frameRateInput.value), o = Number.parseFloat(this.keyFrameIntervalInput.value), s = this.formatSelect.value, n = { format: s, bitrate: this.bitrateSelect.value, bitrateMode: this.bitrateModeSelect.value, latencyMode: this.latencyModeSelect.value, hardwareAcceleration: this.hardwareAccelerationSelect.value, keyFrameInterval: Number.isFinite(o) ? o : e.keyFrameInterval ?? 2, frameCount: Number.isFinite(i) ? i : e.frameCount ?? 480, frameRate: Number.isFinite(a) ? a : e.frameRate ?? 60 };
    return s === "webm" && (n.transparent = this.transparencyInput.checked), n;
  }
  reset() {
    this.recordingState = "idle", this.applyDefaults(), this.status.setMessage("ready to record", "neutral");
  }
  validate() {
    const e = Number.parseInt(this.frameCountInput.value, 10), i = Number.parseFloat(this.frameRateInput.value), a = Number.parseFloat(this.keyFrameIntervalInput.value);
    return Number.isFinite(e) && e >= 1 && Number.isFinite(i) && i >= 1 && Number.isFinite(a) && a >= 0;
  }
  isRecording() {
    return this.recordingState === "recording" || this.recordingState === "encoding";
  }
  setRecordingState(e, i) {
    this.recordingState = e;
    const a = e === "recording" || e === "encoding";
    this.formatSelect.selectElement.disabled = a, this.bitrateSelect.selectElement.disabled = a, this.frameCountInput.inputElement.disabled = a, this.frameRateInput.inputElement.disabled = a, this.bitrateModeSelect.selectElement.disabled = a, this.latencyModeSelect.selectElement.disabled = a, this.hardwareAccelerationSelect.selectElement.disabled = a, this.keyFrameIntervalInput.inputElement.disabled = a, this.transparencyInput.inputElement.disabled = a || this.formatSelect.value !== "webm", this.syncStatus(e, i);
  }
  handleProgress(e) {
    this.syncStatus(e.state, e);
  }
  syncStatus(e, i) {
    switch (e) {
      case "recording": {
        const a = (i == null ? void 0 : i.frameIndex) ?? 0, o = (i == null ? void 0 : i.totalFrames) ?? this.resolvePlannedFrameCount();
        if (o) {
          const s = Math.min(Math.max(0, Math.round(a)), o);
          this.status.setMessage(`recording ${s}/${o} frames`, "active");
        } else this.status.setMessage(`recording ${Math.max(0, Math.round(a))} frames`, "active");
        break;
      }
      case "encoding":
        this.status.setMessage("finalizing video", "active");
        break;
      case "completed":
        this.status.setMessage("saved to disk", "active");
        break;
      case "error":
        this.status.setMessage(i != null && i.message ? `error: ${i.message}` : "recording failed", "alert");
        break;
      default:
        this.status.setMessage("ready to record", "neutral");
    }
  }
  resolvePlannedFrameCount() {
    const e = Number.parseInt(this.frameCountInput.value, 10);
    return Number.isFinite(e) && e > 0 ? Math.round(e) : void 0;
  }
  applyDefaults() {
    const e = this._config.defaultOptions ?? {}, i = e.format ?? "mp4", a = e.frameCount ?? 480, o = e.frameRate ?? 60, s = e.keyFrameInterval ?? 2;
    this.formatSelect.value = i, this.bitrateSelect.value = this.resolveBitratePreset(e.bitrate), this.frameCountInput.value = String(a), this.frameRateInput.value = String(o), this.bitrateModeSelect.value = e.bitrateMode ?? "variable", this.latencyModeSelect.value = e.latencyMode ?? "quality", this.hardwareAccelerationSelect.value = e.hardwareAcceleration ?? "no-preference", this.keyFrameIntervalInput.value = String(s), this.transparencyInput.checked = !!e.transparent, this.frameCountInput.refresh(), this.frameRateInput.refresh(), this.keyFrameIntervalInput.refresh(), this.syncTransparencyAvailability();
  }
  resolveBitratePreset(e) {
    return e === "low" || e === "medium" || e === "high" ? e : "medium";
  }
  syncTransparencyAvailability() {
    if (!this.transparencyInput.isMounted()) return;
    const e = this.formatSelect.value === "webm";
    this.transparencyInput.root.style.display = e ? "" : "none", this.transparencyInput.inputElement.disabled = !e || this.isRecording(), e || (this.transparencyInput.checked = !1);
  }
}
const fn = `@layer textmode-export-overlay{.textmode-export-overlay{--overlay-bg: rgba(20, 20, 20, .8);--overlay-surface: rgba(40, 40, 40, .9);--overlay-border: rgba(255, 255, 255, .14);--overlay-border-strong: rgba(255, 255, 255, .2);--overlay-border-focus: rgba(160, 160, 160, .6);--overlay-focus-shadow: 0 0 0 1px rgba(140, 140, 140, .28);--overlay-text: #ffffff;--overlay-muted: rgba(200, 200, 200, .74);--overlay-radius: .75rem;--overlay-stack-gap: .55rem;position:absolute;top:0;left:0;display:flex;flex-direction:column;gap:var(--overlay-stack-gap);min-width:236px;max-width:236px;padding:.65rem .8rem;background:var(--overlay-bg);color:var(--overlay-text);border-radius:var(--overlay-radius);border:1px solid var(--overlay-border);box-shadow:0 12px 28px #0000004d;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;font-size:.82rem;line-height:1.35;pointer-events:auto;z-index:2147483647}.textmode-export-overlay *{box-sizing:border-box}.textmode-export-overlay__header{display:flex;flex-direction:column;gap:.4rem}.textmode-export-overlay__header-title-row{display:flex;align-items:center;justify-content:space-between;gap:.4rem}.textmode-export-overlay__header-links{display:inline-flex;align-items:center;gap:.3rem}.textmode-export-overlay__support-link{display:inline-flex;align-items:center;justify-content:center;padding:.2rem;border-radius:.45rem;border:1px solid transparent;color:#d7d7d7d1;background:transparent;text-decoration:none;line-height:0;transition:background .18s ease,color .18s ease,transform .18s ease,border-color .18s ease}.textmode-export-overlay__support-link:hover{color:#fff;background:#5a5a5a4d;border-color:#c8c8c824}.textmode-export-overlay__support-link:focus-visible{outline:none;border-color:var(--overlay-border-focus);box-shadow:var(--overlay-focus-shadow)}.textmode-export-overlay__support-icon,.textmode-export-overlay__link-icon{display:block;width:1rem;height:1rem}.textmode-export-overlay__stack{display:flex;flex-direction:column;gap:var(--overlay-stack-gap)}.textmode-export-overlay__stack--dense{gap:.3rem}.textmode-export-overlay__stack--compact{gap:.45rem}.textmode-export-overlay__section{display:flex;flex-direction:column;gap:.4rem}.textmode-export-overlay__title{font-size:.92rem;font-weight:600}.textmode-export-overlay__divider{width:100%;height:1px;background:#ffffff29;margin-top:.25rem}.textmode-export-overlay__label{font-weight:500;opacity:.9}.textmode-export-overlay__checkbox{display:flex;align-items:center;gap:.5rem}.textmode-export-overlay__checkbox input[type=checkbox]{width:1rem;height:1rem;accent-color:rgba(100,100,100,.9)}.textmode-export-overlay__row{display:flex;gap:.6rem;flex-wrap:wrap;align-items:flex-start;width:100%}.textmode-export-overlay__field{display:flex;flex-direction:column;gap:.3rem;flex:1 1 120px;min-width:120px}.textmode-export-overlay__field--compact{flex:1 1 100px;min-width:100px}.textmode-export-overlay__field--dense{flex:1 1 90px;min-width:90px}.textmode-export-overlay__field--channel{flex:1 1 0;min-width:0}.textmode-export-overlay__field--full{width:100%;flex:1 1 100%}.textmode-export-overlay__input,.textmode-export-overlay select.textmode-export-overlay__input,.textmode-export-overlay input.textmode-export-overlay__input{width:100%;padding:.35rem .5rem;border-radius:.4rem;border:1px solid var(--overlay-border-strong);background:var(--overlay-surface);color:var(--overlay-text);font:inherit;line-height:1.35;transition:border-color .18s ease,box-shadow .18s ease,background .18s ease}.textmode-export-overlay select.textmode-export-overlay__input{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-image:url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(200, 200, 200, 0.74)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");background-repeat:no-repeat;background-position:right .5rem center;background-size:1rem;padding-right:2rem}.textmode-export-overlay__input:focus{outline:none;border-color:var(--overlay-border-focus);box-shadow:var(--overlay-focus-shadow);background:#2d2f42eb}.textmode-export-overlay__input::placeholder{color:var(--overlay-muted);opacity:.7}.textmode-export-overlay__muted{font-size:.75rem;opacity:.7;display:block}.textmode-export-overlay__button{display:inline-flex;align-items:center;justify-content:center;gap:.35rem;border-radius:.45rem;border:none;font-weight:600;padding:.45rem .7rem;cursor:pointer;transition:background .2s ease,transform .2s ease,box-shadow .2s ease}.textmode-export-overlay__button--primary{background:#505050;color:#fff}.textmode-export-overlay__button--secondary{background:#606060;color:#fff}.textmode-export-overlay__button--full{width:100%}.textmode-export-overlay__button:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 7px 18px #00000073}.textmode-export-overlay__button--primary:hover:not(:disabled){background:#404040}.textmode-export-overlay__button--secondary:hover:not(:disabled){background:#4a4a4a}.textmode-export-overlay__button:disabled{cursor:default;opacity:.55;transform:none;box-shadow:none}.textmode-export-overlay__status{display:flex;flex-direction:column;gap:.25rem;padding:.45rem .55rem;border-radius:.45rem;border:1px solid rgba(110,110,110,.22);background:#4646462e}.textmode-export-overlay__status--gif{background:#5050501f;border-color:#78787840}.textmode-export-overlay__status--video{background:#4646461f;border-color:#6e6e6e40}.textmode-export-overlay__status-title{font-weight:600;font-size:.75rem;opacity:.85;text-transform:uppercase;letter-spacing:.04em}.textmode-export-overlay__status-value{font-size:.82rem;color:#dedede;transition:color .18s ease}.textmode-export-overlay__status-value--neutral{color:#cfcfcf}.textmode-export-overlay__status-value--active{color:#f5f5f5}.textmode-export-overlay__status-value--alert{color:#b8b8b8}.textmode-export-number-input,.textmode-export-overlay .textmode-export-number-input{display:flex;align-items:stretch;width:100%;background:var(--overlay-surface);border:1px solid var(--overlay-border-strong);border-radius:.4rem;overflow:hidden;transition:border-color .18s ease,box-shadow .18s ease,background .18s ease;position:relative}.textmode-export-number-input:focus-within{border-color:var(--overlay-border-focus);box-shadow:var(--overlay-focus-shadow)}.textmode-export-number-input.is-disabled{opacity:.55}.textmode-export-number-input__field{flex:1 1 auto;min-width:0;border:none;background:transparent;color:var(--overlay-text);font:inherit;padding:.35rem .5rem;-webkit-appearance:textfield;-moz-appearance:textfield;appearance:textfield}.textmode-export-number-input__field::-webkit-outer-spin-button,.textmode-export-number-input__field::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}.textmode-export-number-input__field:focus{outline:none}.textmode-export-number-input__controls{display:flex;flex-direction:column;border-left:1px solid rgba(255,255,255,.12);min-width:1.6rem}.textmode-export-number-input__control{display:flex;align-items:center;justify-content:center;width:100%;flex:1;border:none;background:#32323299;color:#d0d0d0;font-size:.68rem;line-height:1;cursor:pointer;transition:background .15s ease,color .15s ease;padding:0}.textmode-export-number-input__control:hover:not(:disabled){background:#5a5a5ad9;color:#fff}.textmode-export-number-input__control:disabled{cursor:default;opacity:.4;background:#28282880;color:#c8c8c866}.textmode-export-number-input:focus-within .textmode-export-number-input__control{background:#3c3c3cbf;color:#e8e8e8}.textmode-export-number-input__display{position:absolute;top:0;right:0;bottom:0;left:0;display:flex;align-items:center;padding:.4rem .55rem;pointer-events:none;color:#f8fafc;opacity:0;transition:opacity .14s ease}.textmode-export-number-input__display--visible{opacity:1}.textmode-export-range-input{position:relative;width:100%}.textmode-export-range-input.is-disabled{opacity:.55}.textmode-export-range-input__field{width:100%;height:1.4rem;padding:0;margin:0;background:transparent;cursor:pointer;-moz-appearance:none;appearance:none;-webkit-appearance:none}.textmode-export-range-input__field::-webkit-slider-thumb{width:12px;height:12px;margin-top:-3.5px;-webkit-appearance:none;border-radius:50%;background:#a0a0a0;border:2px solid #303030;box-shadow:0 0 0 2px #00000059}.textmode-export-range-input__field::-webkit-slider-runnable-track{height:5px;border-radius:999px;background:linear-gradient(90deg,#8c8c8cd9,#646464a6)}.textmode-export-range-input__field::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:#a0a0a0;border:2px solid #303030;margin-top:-3.5px}.textmode-export-range-input__field::-moz-range-track{height:5px;border-radius:999px;background:linear-gradient(90deg,#8c8c8cd9,#646464a6)}.textmode-export-range-input__tooltip{position:absolute;top:-1.5rem;left:0;transform:translate(-50%);padding:.2rem .35rem;border-radius:.35rem;background:#1e1e1ee0;color:#f8fafc;font-size:.68rem;line-height:1;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .15s ease}.textmode-export-range-input__tooltip--visible{opacity:1}}`;
function gn(r) {
  return typeof r.refreshLayerTargets == "function";
}
class wn {
  constructor(t, e, i, a, o) {
    g(this, "_textmodifier");
    g(this, "_state");
    g(this, "_events");
    g(this, "_exportService");
    g(this, "_clipboardService");
    g(this, "_definitions");
    g(this, "_formats", /* @__PURE__ */ new Map());
    g(this, "_eventUnsubscribers", []);
    g(this, "_shadowHost");
    g(this, "_shadowRoot");
    g(this, "_overlayElement");
    g(this, "_optionsContainer");
    g(this, "_copyButtonContainer");
    g(this, "_positionService");
    g(this, "_header", new Ie());
    g(this, "_formatField", new H({ label: "export format", labelFor: "textmode-export-format", variant: "full" }));
    g(this, "_formatSelect", new tt({ id: "textmode-export-format", options: [] }));
    g(this, "_exportButton", new Vr({ label: "download file", fullWidth: !0, variant: "primary" }));
    g(this, "_copyButton", new Vr({ label: "copy to clipboard", fullWidth: !0, variant: "primary" }));
    g(this, "_currentFormat");
    g(this, "_currentBlade");
    g(this, "_handleFormatSelectChange", () => {
      this._handleFormatChange(this._formatSelect.value);
    });
    g(this, "_handleExportClickSafe", () => {
      this._handleExportClick().catch((t) => {
        console.error("[textmode-export] Export failed", t);
      });
    });
    g(this, "_handleCopyClickSafe", () => {
      this._handleCopyClick().catch((t) => {
        console.error("[textmode-export] Copy failed", t);
      });
    });
    this._textmodifier = t, this._state = i, this._events = a, this._exportService = new dn(e, a), this._clipboardService = new cn(e), this._definitions = o, this._currentFormat = i.snapshot.format, this._initializeFormatMap(), this._registerEventHandlers();
  }
  $mount() {
    this._createOverlay(), this._renderStaticContent(), this._positionService = new ln(this._textmodifier, this._shadowHost), this._positionService.bind(), this._switchFormat(this._currentFormat);
  }
  show() {
    this._shadowHost && (this.refreshLayerTargets(), this._shadowHost.style.display = "");
  }
  hide() {
    this._shadowHost && (this._shadowHost.style.display = "none");
  }
  toggle() {
    this.isVisible() ? this.hide() : this.show();
  }
  isVisible() {
    return !!this._shadowHost && this._shadowHost.style.display !== "none";
  }
  refreshLayerTargets() {
    this._currentBlade && gn(this._currentBlade.blade) && this._currentBlade.blade.refreshLayerTargets();
  }
  $dispose() {
    var t, e;
    this._formatSelect.isMounted() && this._formatSelect.selectElement.removeEventListener("change", this._handleFormatSelectChange), this._exportButton.isMounted() && this._exportButton.buttonElement.removeEventListener("click", this._handleExportClickSafe), this._copyButton.isMounted() && this._copyButton.buttonElement.removeEventListener("click", this._handleCopyClickSafe);
    for (const i of this._eventUnsubscribers) i();
    this._eventUnsubscribers.length = 0, this._events.$clear();
    for (const i of this._formats.values()) i.blade.destroy();
    this._formats.clear(), this._currentBlade = void 0, (t = this._shadowHost) != null && t.isConnected && this._shadowHost.remove(), (e = this._positionService) == null || e.dispose();
  }
  _initializeFormatMap() {
    for (const t of this._definitions) {
      const e = t.createBlade();
      this._formats.set(t.format, { definition: t, blade: e, initialized: !1 });
    }
  }
  _createOverlay() {
    this._shadowHost = document.createElement("div"), this._shadowHost.dataset.plugin = "textmode-export-overlay-host", this._shadowHost.style.cssText = "position: absolute; top: 0; left: 0; pointer-events: none; z-index: 2147483647;", this._shadowRoot = this._shadowHost.attachShadow({ mode: "open" });
    const t = document.createElement("style");
    t.textContent = fn, this._shadowRoot.appendChild(t), this._overlayElement = document.createElement("div"), this._overlayElement.dataset.plugin = "textmode-export-overlay", this._overlayElement.classList.add(C.root, C.stack), this._shadowRoot.appendChild(this._overlayElement), document.body.appendChild(this._shadowHost);
  }
  _renderStaticContent() {
    this._header.mount(this._overlayElement);
    const t = document.createElement("div");
    t.classList.add(C.section), this._overlayElement.appendChild(t), this._formatField.mount(t), this._prepareFormatOptions(), this._formatSelect.mount(this._formatField.root), this._formatSelect.selectElement.addEventListener("change", this._handleFormatSelectChange), this._optionsContainer = document.createElement("div"), this._optionsContainer.classList.add(C.stack, C.stackCompact), this._overlayElement.appendChild(this._optionsContainer), this._exportButton.mount(this._overlayElement), this._exportButton.buttonElement.addEventListener("click", this._handleExportClickSafe), this._copyButtonContainer = document.createElement("div"), this._copyButtonContainer.classList.add(C.stack, C.stackDense), this._overlayElement.appendChild(this._copyButtonContainer), this._copyButton.mount(this._copyButtonContainer), this._copyButton.buttonElement.dataset.defaultLabel = "copy to clipboard", this._copyButton.buttonElement.addEventListener("click", this._handleCopyClickSafe);
  }
  _prepareFormatOptions() {
    const t = this._definitions.map((e) => ({ value: e.format, label: e.label }));
    this._formatSelect.update({ options: t, defaultValue: this._currentFormat });
  }
  _registerEventHandlers() {
    this._eventUnsubscribers.push(this._events.$on("export:request", ({ format: t }) => {
      t === this._currentFormat && (this._state.$set({ isBusy: !0, error: void 0 }), this._updateExportButton());
    }), this._events.$on("export:success", ({ format: t }) => {
      if (t === this._currentFormat) {
        const e = { isBusy: !1 };
        t === "gif" && (e.gifProgress = void 0), t === "video" && (e.videoProgress = void 0), this._state.$set(e), this._updateExportButton();
      }
    }), this._events.$on("export:error", ({ format: t, error: e }) => {
      t === this._currentFormat && (this._state.$set({ isBusy: !1, error: e }), this._updateExportButton());
    }), this._events.$on("export:progress", ({ format: t, progress: e }) => {
      var i, a;
      if (e) {
        if (t === "gif" && ((i = this._currentBlade) == null ? void 0 : i.blade) instanceof Pe) {
          const o = e;
          this._state.$set({ gifProgress: o }), this._currentBlade.blade.handleProgress(o);
        } else if (t === "video" && ((a = this._currentBlade) == null ? void 0 : a.blade) instanceof Me) {
          const o = e;
          this._state.$set({ videoProgress: o }), this._currentBlade.blade.handleProgress(o);
        }
        this._updateExportButton();
      }
    }));
  }
  _handleFormatChange(t) {
    this._currentFormat = t, this._state.$set({ format: t }), this._switchFormat(t), this._events.$emit("format:change", { format: t });
  }
  _switchFormat(t) {
    var i;
    const e = this._formats.get(t);
    if (!e) throw new Error(`Unknown export format: ${t}`);
    this._currentBlade && this._currentBlade.blade.unmount(), this._optionsContainer.innerHTML = "", e.blade.mount(this._optionsContainer), e.initialized || (e.blade.reset(), e.initialized = !0), this._currentBlade = e, this._formatSelect.value = t, this.refreshLayerTargets(), this._updateCopyButtonState(), this._updateExportButton(), (i = this._positionService) == null || i.scheduleUpdate();
  }
  _updateCopyButtonState() {
    var e;
    const t = ((e = this._currentBlade) == null ? void 0 : e.definition.supportsClipboard) ?? !1;
    this._copyButtonContainer.style.display = t ? "flex" : "none", this._copyButton.setDisabled(!t);
  }
  async _handleExportClick() {
    if (!this._currentBlade) return;
    const t = this._currentBlade.definition.format, e = this._currentBlade.blade.getOptions();
    if (this._currentBlade.blade.validate()) {
      if (t === "gif") {
        const i = this._currentBlade.blade;
        if (i.isRecording()) return;
        i.setRecordingState("recording");
        try {
          await this._exportService.$requestExport("gif", e, { onGIFProgress: (a) => {
            i.setRecordingState(a.state, a);
          } });
        } catch (a) {
          throw i.setRecordingState("error"), a;
        }
        return void window.setTimeout(() => {
          i.setRecordingState("idle"), this._updateExportButton();
        }, 1600);
      }
      if (t === "video") {
        const i = this._currentBlade.blade;
        if (i.isRecording()) return;
        i.setRecordingState("recording");
        try {
          await this._exportService.$requestExport("video", e, { onVideoProgress: (a) => {
            i.setRecordingState(a.state, a);
          } });
        } catch (a) {
          throw i.setRecordingState("error"), a;
        }
        return void window.setTimeout(() => {
          i.setRecordingState("idle"), this._updateExportButton();
        }, 1600);
      }
      this._exportButton.setDisabled(!0), this._exportButton.setLabel("exporting…");
      try {
        await this._exportService.$requestExport(t, e);
      } finally {
        this._exportButton.setDisabled(!1), this._exportButton.setLabel("download file");
      }
    } else console.warn("[textmode-export] Export options failed validation");
  }
  async _handleCopyClick() {
    if (!this._currentBlade || !this._currentBlade.definition.supportsClipboard) return;
    const t = this._currentBlade.definition.format, e = this._currentBlade.blade.getOptions(), i = this._copyButton.buttonElement.dataset.defaultLabel ?? "copy to clipboard";
    this._copyButton.setDisabled(!0), this._copyButton.setLabel("copying…");
    try {
      switch (t) {
        case "txt":
          await this._clipboardService.$copy("txt", e);
          break;
        case "json":
          await this._clipboardService.$copy("json", e);
          break;
        case "svg":
          await this._clipboardService.$copy("svg", e);
          break;
        case "image":
          await this._clipboardService.$copy("image", e);
          break;
        default:
          return;
      }
      this._copyButton.setLabel("copied!");
    } catch (a) {
      console.error("[textmode-export] Failed to copy to clipboard", a), this._copyButton.setLabel("copy failed!");
    } finally {
      window.setTimeout(() => {
        this._copyButton.setLabel(i), this._copyButton.setDisabled(!1);
      }, 1200);
    }
  }
  _updateExportButton() {
    if (!this._currentBlade) return;
    const t = this._currentBlade.definition.format;
    if (t === "gif" && this._currentBlade.blade instanceof Pe) {
      const i = this._currentBlade.blade, a = this._state.snapshot.gifProgress;
      if (i.isRecording()) if (this._exportButton.setDisabled(!0), a == null ? void 0 : a.totalFrames) {
        const o = a.frameIndex ?? 0, s = a.state === "encoding" ? "encoding" : "recording";
        this._exportButton.setLabel(`${s} ${o}/${a.totalFrames}`);
      } else {
        const o = (a == null ? void 0 : a.state) === "encoding" ? "encoding" : "recording";
        this._exportButton.setLabel(`${o}…`);
      }
      else this._exportButton.setDisabled(!1), this._exportButton.setLabel("start recording");
      return;
    }
    if (t === "video" && this._currentBlade.blade instanceof Me) {
      const i = this._currentBlade.blade, a = this._state.snapshot.videoProgress;
      if (i.isRecording()) if (this._exportButton.setDisabled(!0), a == null ? void 0 : a.totalFrames) {
        const o = a.frameIndex ?? 0;
        this._exportButton.setLabel(`recording ${o}/${a.totalFrames} frames`);
      } else this._exportButton.setLabel("recording…");
      else this._exportButton.setDisabled(!1), this._exportButton.setLabel("start recording");
      return;
    }
    const e = this._state.snapshot.isBusy;
    this._exportButton.setDisabled(e), this._exportButton.setLabel(e ? "exporting…" : "download file");
  }
}
class yn {
  constructor() {
    g(this, "_listeners", {});
  }
  _getPool(t) {
    const e = this._listeners[t];
    if (e) return e;
    const i = /* @__PURE__ */ new Set();
    return this._listeners[t] = i, i;
  }
  $on(t, e) {
    const i = this._getPool(t);
    return i.add(e), () => {
      i.delete(e), i.size === 0 && delete this._listeners[t];
    };
  }
  $emit(t, e) {
    const i = this._listeners[t];
    if (i) for (const a of [...i]) try {
      a(e);
    } catch (o) {
      console.error("[textmode-export] Event handler failed", o);
    }
  }
  $clear() {
    for (const t of Object.keys(this._listeners)) delete this._listeners[t];
  }
}
class bn {
  constructor(t) {
    g(this, "_state");
    g(this, "_listeners", /* @__PURE__ */ new Set());
    this._state = t;
  }
  get snapshot() {
    return Object.freeze({ ...this._state });
  }
  $set(t) {
    this._state = Object.assign({}, this._state, t);
    const e = this.snapshot;
    for (const i of [...this._listeners]) try {
      i(e);
    } catch (a) {
      console.error("[textmode-export] State listener failed", a);
    }
  }
  $subscribe(t) {
    return this._listeners.add(t), t(this.snapshot), () => {
      this._listeners.delete(t);
    };
  }
  $reset(t) {
    this._state = t;
    const e = this.snapshot;
    for (const i of [...this._listeners]) i(e);
  }
}
const vn = (r) => ({ format: r, isBusy: !1 });
class _n extends it {
  constructor(e) {
    super();
    g(this, "props");
    g(this, "input");
    g(this, "handleInput", () => {
      this.props.defaultValue = this.input.value;
    });
    this.props = e;
  }
  render() {
    return this.input = document.createElement("input"), this.input.type = "text", this.input.classList.add(C.input), this.props.id && (this.input.id = this.props.id), this.props.maxLength !== void 0 && (this.input.maxLength = this.props.maxLength), this.props.defaultValue !== void 0 && (this.input.value = this.props.defaultValue), this.input.addEventListener("input", this.handleInput), this.input;
  }
  get inputElement() {
    return this.input;
  }
  get value() {
    return this.input.value;
  }
  set value(e) {
    this.input.value = e;
  }
  _onUnmount() {
    this.input.removeEventListener("input", this.handleInput);
  }
  onUpdate(e) {
    this.props = e, e.id && (this.input.id = e.id), e.maxLength !== void 0 && (this.input.maxLength = e.maxLength), e.defaultValue !== void 0 && (this.input.value = e.defaultValue);
  }
}
class Xe extends it {
  constructor(e) {
    super();
    g(this, "provider");
    g(this, "field");
    g(this, "select");
    this.provider = e.provider, this.field = new H({ label: "layer", labelFor: e.id, variant: "full" }), this.select = new tt({ id: e.id, options: [], defaultValue: e.provider.getDefaultId() });
  }
  render() {
    const e = document.createElement("div");
    return this.field.mount(e), this.refresh(), this.select.mount(this.field.root), e;
  }
  get layer() {
    const e = this.provider.getLayerById(this.select.value);
    if (e) return e;
    const i = this.provider.getDefaultId();
    return this.select.value = i, this.provider.getLayerById(i);
  }
  setDisabled(e) {
    this.select.selectElement.disabled = e;
  }
  refresh() {
    const e = this.provider.getOptions(), i = this.select.isMounted() ? this.select.value : this.provider.getDefaultId(), a = e.some((o) => o.id === i) ? i : this.provider.getDefaultId();
    this.select.update({ options: e.map((o) => ({ value: o.id, label: o.label })), defaultValue: a }), this.select.value = a;
  }
  _onUnmount() {
    this.select.unmount(), this.field.unmount();
  }
  _onDestroy() {
    this.select.destroy(), this.field.destroy();
  }
}
class xn extends Pt {
  constructor(e) {
    super(e);
    g(this, "layerTarget");
    g(this, "trailingSpaces", this._manageComponent(new Nt({ label: "preserve trailing spaces", defaultChecked: !1 })));
    g(this, "emptyCharacter", this._manageComponent(new _n({ id: "textmode-export-empty-character", defaultValue: " ", maxLength: 1 })));
    e.layerTargetProvider && (this.layerTarget = this._manageComponent(new Xe({ id: "textmode-export-txt-layer", provider: e.layerTargetProvider })));
  }
  render() {
    var a;
    const e = document.createElement("div");
    e.classList.add(C.stack), (a = this.layerTarget) == null || a.mount(e), this.trailingSpaces.mount(e);
    const i = new H({ label: "empty character", labelFor: "textmode-export-empty-character", variant: "full" });
    return i.mount(e), this.emptyCharacter.mount(i.root), e;
  }
  getOptions() {
    var a;
    const e = this._config.defaultOptions ?? {}, i = this.emptyCharacter.value || e.emptyCharacter || " ";
    return { layer: (a = this.layerTarget) == null ? void 0 : a.layer, preserveTrailingSpaces: this.trailingSpaces.checked, emptyCharacter: i };
  }
  reset() {
    this.applyDefaults();
  }
  validate() {
    return this.emptyCharacter.value.length <= 1;
  }
  refreshLayerTargets() {
    var e;
    (e = this.layerTarget) == null || e.refresh();
  }
  applyDefaults() {
    const e = this._config.defaultOptions ?? {};
    this.trailingSpaces.checked = e.preserveTrailingSpaces ?? !1, this.emptyCharacter.value = e.emptyCharacter ?? " ";
  }
}
class Tn extends Pt {
  constructor(e) {
    super(e);
    g(this, "layerTarget");
    g(this, "layerTargetContainer");
    g(this, "target", this._manageComponent(new tt({ id: "textmode-export-json-target", options: [{ value: "selected", label: "selected layer" }, { value: "all", label: "all layers" }], defaultValue: "selected" })));
    g(this, "prettyPrint", this._manageComponent(new Nt({ id: "textmode-export-json-pretty", label: "pretty print", defaultChecked: !0 })));
    g(this, "includeMetadata", this._manageComponent(new Nt({ id: "textmode-export-json-metadata", label: "include metadata", defaultChecked: !0 })));
    g(this, "colorMode", this._manageComponent(new tt({ id: "textmode-export-json-color-mode", options: [{ value: "hex", label: "hex" }, { value: "rgba", label: "rgba" }], defaultValue: "hex" })));
    e.layerTargetProvider && (this.layerTarget = this._manageComponent(new Xe({ id: "textmode-export-json-layer", provider: e.layerTargetProvider })));
  }
  render() {
    const e = document.createElement("div");
    e.classList.add(C.stack);
    const i = new H({ label: "target", labelFor: "textmode-export-json-target", variant: "full" });
    i.mount(e), this.target.mount(i.root), this.target.selectElement.addEventListener("change", () => this.updateLayerTargetVisibility()), this.layerTarget && (this.layerTargetContainer = document.createElement("div"), this.layerTarget.mount(this.layerTargetContainer), e.appendChild(this.layerTargetContainer)), this.prettyPrint.mount(e), this.includeMetadata.mount(e);
    const a = new H({ label: "color mode", labelFor: "textmode-export-json-color-mode", variant: "full" });
    return a.mount(e), this.colorMode.mount(a.root), this.updateLayerTargetVisibility(), e;
  }
  getOptions() {
    var i;
    const e = this.target.value;
    return { target: e, layer: e === "selected" ? (i = this.layerTarget) == null ? void 0 : i.layer : void 0, pretty: this.prettyPrint.checked, includeMetadata: this.includeMetadata.checked, colorMode: this.colorMode.value };
  }
  reset() {
    this.applyDefaults();
  }
  validate() {
    return !0;
  }
  refreshLayerTargets() {
    var e;
    (e = this.layerTarget) == null || e.refresh();
  }
  applyDefaults() {
    const e = this._config.defaultOptions ?? {};
    this.target.value = e.target ?? "selected", this.prettyPrint.checked = typeof e.pretty == "number" ? e.pretty > 0 : e.pretty ?? !0, this.includeMetadata.checked = e.includeMetadata ?? !0, this.colorMode.value = e.colorMode ?? "hex", this.updateLayerTargetVisibility();
  }
  updateLayerTargetVisibility() {
    var i;
    const e = this.target.value === "selected";
    this.layerTargetContainer && (this.layerTargetContainer.style.display = e ? "" : "none"), (i = this.layerTarget) == null || i.setDisabled(!e);
  }
}
class kn extends Pt {
  constructor(e) {
    super(e);
    g(this, "formatSelect", this._manageComponent(new tt({ id: "textmode-export-image-format", options: [{ value: "png", label: `PNG (${ue.png})` }, { value: "jpg", label: `JPG (${ue.jpg})` }, { value: "webp", label: `WEBP (${ue.webp})` }], defaultValue: "png" })));
    g(this, "scaleInput", this._manageComponent(new ut({ defaultValue: "1", attributes: { min: "0.1", step: "0.1" } })));
  }
  render() {
    const e = document.createElement("div");
    e.classList.add(C.stack);
    const i = new wt("row");
    i.mount(e);
    const a = new H({ label: "image format", labelFor: "textmode-export-image-format", variant: "compact" });
    a.mount(i.root), this.formatSelect.mount(a.root);
    const o = new H({ label: "scale", labelFor: "textmode-export-image-scale", variant: "dense" });
    return o.mount(i.root), this.scaleInput.mount(o.root), this.scaleInput.inputElement.id = "textmode-export-image-scale", e;
  }
  getOptions() {
    var i;
    const e = Number.parseFloat(this.scaleInput.value);
    return { format: this.formatSelect.value, scale: Number.isFinite(e) ? e : ((i = this._config.defaultOptions) == null ? void 0 : i.scale) ?? 1 };
  }
  reset() {
    this.applyDefaults(), this.scaleInput.refresh();
  }
  validate() {
    const e = Number.parseFloat(this.scaleInput.value);
    return Number.isFinite(e) && e > 0;
  }
  applyDefaults() {
    const e = this._config.defaultOptions ?? {};
    this.formatSelect.value = e.format ?? "png";
    const i = e.scale ?? 1;
    this.scaleInput.value = String(i);
  }
}
class Cn extends Pt {
  constructor(e) {
    super(e);
    g(this, "layerTarget");
    g(this, "includeBackground", this._manageComponent(new Nt({ id: "textmode-export-svg-include-backgrounds", label: "include cell backgrounds", defaultChecked: !0 })));
    g(this, "drawMode", this._manageComponent(new tt({ id: "textmode-export-svg-draw-mode", options: [{ value: "fill", label: "fill" }, { value: "stroke", label: "stroke" }], defaultValue: "fill" })));
    g(this, "strokeWidth", this._manageComponent(new ut({ defaultValue: "1", attributes: { min: "0", step: "0.1" } })));
    e.layerTargetProvider && (this.layerTarget = this._manageComponent(new Xe({ id: "textmode-export-svg-layer", provider: e.layerTargetProvider })));
  }
  render() {
    var s;
    const e = document.createElement("div");
    e.classList.add(C.stack), (s = this.layerTarget) == null || s.mount(e), this.includeBackground.mount(e);
    const i = new wt("row");
    i.mount(e);
    const a = new H({ label: "draw mode", labelFor: "textmode-export-svg-draw-mode", variant: "compact" });
    a.mount(i.root), this.drawMode.mount(a.root);
    const o = new H({ label: "stroke width", labelFor: "textmode-export-svg-stroke-width", variant: "compact" });
    return o.mount(i.root), this.strokeWidth.mount(o.root), this.strokeWidth.inputElement.id = "textmode-export-svg-stroke-width", this.drawMode.selectElement.addEventListener("change", () => this.updateStrokeControls()), this.updateStrokeControls(), e;
  }
  getOptions() {
    var e;
    return { layer: (e = this.layerTarget) == null ? void 0 : e.layer, includeBackgroundRectangles: this.includeBackground.checked, drawMode: this.drawMode.value, strokeWidth: Number.parseFloat(this.strokeWidth.value) };
  }
  reset() {
    this.applyDefaults(), this.updateStrokeControls();
  }
  validate() {
    const e = Number.parseFloat(this.strokeWidth.value);
    return this.drawMode.value !== "stroke" || Number.isFinite(e) && e >= 0;
  }
  refreshLayerTargets() {
    var e;
    (e = this.layerTarget) == null || e.refresh();
  }
  updateStrokeControls() {
    const e = this.drawMode.value === "stroke";
    this.strokeWidth.inputElement.disabled = !e, this.strokeWidth.refresh();
  }
  applyDefaults() {
    const e = this._config.defaultOptions ?? {};
    this.includeBackground.checked = e.includeBackgroundRectangles ?? !0, this.drawMode.value = e.drawMode ?? "fill";
    const i = e.strokeWidth ?? 1;
    this.strokeWidth.value = String(i), this.strokeWidth.refresh();
  }
}
function En(r) {
  return [{ format: "txt", label: "plain text (.txt)", supportsClipboard: !0, createBlade: () => new xn({ format: "txt", label: "plain text (.txt)", supportsClipboard: !0, defaultOptions: { preserveTrailingSpaces: !1, emptyCharacter: " " }, layerTargetProvider: r }) }, { format: "json", label: "document data (.json)", supportsClipboard: !0, createBlade: () => new Tn({ format: "json", label: "document data (.json)", supportsClipboard: !0, defaultOptions: { target: "selected", pretty: !0, includeMetadata: !0, colorMode: "hex" }, layerTargetProvider: r }) }, { format: "image", label: "image (.png / .jpg / .webp)", supportsClipboard: !0, createBlade: () => new kn({ format: "image", label: "image (.png / .jpg / .webp)", supportsClipboard: !0, defaultOptions: { format: "png", scale: 1 } }) }, { format: "svg", label: "vector (.svg)", supportsClipboard: !0, createBlade: () => new Cn({ format: "svg", label: "vector (.svg)", supportsClipboard: !0, defaultOptions: { includeBackgroundRectangles: !0, drawMode: "fill", strokeWidth: 1 }, layerTargetProvider: r }) }, { format: "gif", label: "animated GIF (.gif)", supportsClipboard: !1, createBlade: () => new Pe({ format: "gif", label: "animated GIF (.gif)", supportsClipboard: !1, defaultOptions: { frameCount: 300, frameRate: 60, scale: 1, repeat: 0 } }) }, { format: "video", label: "video (.webm / .mp4)", supportsClipboard: !1, createBlade: () => new Me({ format: "video", label: "video (.webm / .mp4)", supportsClipboard: !1, defaultOptions: { format: "mp4", frameCount: 480, frameRate: 60, bitrate: "medium", bitrateMode: "variable", latencyMode: "quality", hardwareAcceleration: "no-preference", keyFrameInterval: 2, transparent: !1 } }) }];
}
function Sn(r, t, e) {
  var d;
  const i = En(e), a = (d = i[0]) == null ? void 0 : d.format, o = new bn(vn(a)), s = new yn(), n = new wn(r, t, o, s, i);
  return n.$mount(), n;
}
const Ii = { name: "textmode.export", version: "1.2.1", async install(r, t) {
  const e = { saveCanvas: async (n = {}) => new Je().$saveImage(r.canvas, n), copyCanvas: async (n = {}) => new Je().$copyImageToClipboard(r.canvas, n), saveSVG: (n = {}) => {
    new Ke().$saveSVG(r, n);
  }, saveStrings: (n = {}) => {
    new Ze().$saveTXT(r, n);
  }, toSVG: (n = {}) => new Ke().$generateSVG(r, n), toString: (n = {}) => new Ze().$generateTXT(r, n), toJSON: (n = {}) => new xe().$generateJSONData(r, n), toJSONString: (n = {}) => new xe().$generateJSONString(r, n), saveJSON: (n = {}) => {
    new xe().$saveJSON(r, n);
  }, saveGIF: async (n = {}) => new na(r, t.registerPostDrawHook).$saveGIF(n), saveVideo: async (n = {}) => new sn(r, t.registerPostDrawHook).$saveVideo(n) }, i = Sn(r, e, Di(r));
  t.registerPostDrawHook(() => {
    i.isVisible() && i.refreshLayerTargets();
  });
  const a = { show: () => i.show(), hide: () => i.hide(), toggle: () => i.toggle(), isVisible: () => i.isVisible() }, o = { ...e, exportOverlay: a }, s = r;
  Object.assign(s, o), s._exportOverlayController = i;
}, async uninstall(r) {
  const t = r, e = t._exportOverlayController;
  e == null || e.$dispose(), delete t._exportOverlayController;
  const i = ["exportOverlay", "saveCanvas", "copyCanvas", "saveSVG", "saveStrings", "toSVG", "toString", "toJSON", "toJSONString", "saveJSON", "saveGIF", "saveVideo"];
  for (const a of i) delete t[a];
} }, Bn = (r = {}) => {
  const t = r.overlay ?? !0, e = { ...Ii }, i = e.install;
  return e.install = async (a, o) => {
    var n;
    const s = a;
    await i.call(e, s, o), t || ((n = s.exportOverlay) == null || n.hide());
  }, e;
};
typeof window < "u" && (window.ExportPlugin = Ii, window.createTextmodeExportPlugin = Bn);
export {
  Ii as ExportPlugin,
  Bn as createTextmodeExportPlugin
};
