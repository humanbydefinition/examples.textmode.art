var Ls = Object.defineProperty;
var Us = (i, t, e) => t in i ? Ls(i, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : i[t] = e;
var o = (i, t, e) => Us(i, typeof t != "symbol" ? t + "" : t, e);
class Ds {
  constructor(t, e, s) {
    o(this, "i");
    o(this, "h");
    o(this, "o");
    o(this, "u");
    o(this, "l");
    o(this, "_");
    o(this, "p");
    o(this, "m");
    o(this, "v");
    o(this, "M", !1);
    o(this, "A", /* @__PURE__ */ new Set());
    this.p = t, this.m = e, this.v = s, this.reset();
  }
  C() {
    if (this.o = this.i * this.m, this.u = this.h * this.v, this.l = Math.floor((this.p.width - this.o) / 2), this._ = Math.floor((this.p.height - this.u) / 2), this.A.size > 0) for (const t of this.A) t();
  }
  S(t) {
    this.A.add(t);
  }
  F(t) {
    this.A.delete(t);
  }
  reset() {
    this.M || (this.i = Math.max(1, Math.floor(this.p.width / this.m)), this.h = Math.max(1, Math.floor(this.p.height / this.v))), this.C();
  }
  U(t, e) {
    this.m = t, this.v = e, this.reset();
  }
  get cellWidth() {
    return this.m;
  }
  get cellHeight() {
    return this.v;
  }
  get cols() {
    return this.i;
  }
  set cols(t) {
    this.M = !0, this.i = Math.max(1, Math.floor(t)), typeof this.h != "number" && (this.h = Math.max(1, Math.floor(this.p.height / this.v))), this.C();
  }
  get rows() {
    return this.h;
  }
  set rows(t) {
    this.M = !0, this.h = Math.max(1, Math.floor(t)), typeof this.i != "number" && (this.i = Math.max(1, Math.floor(this.p.width / this.m))), this.C();
  }
  get width() {
    return this.o;
  }
  get height() {
    return this.u;
  }
  get offsetX() {
    return this.l;
  }
  get offsetY() {
    return this._;
  }
  responsive() {
    this.M = !1;
  }
  P(t, e) {
    const s = this.p.getBoundingClientRect(), r = t - s.left, n = e - s.top, h = this.p.width / s.width, a = n * (this.p.height / s.height), c = r * h - this.l, u = a - this._, l = Math.floor(c / this.m), f = Math.floor(u / this.v);
    return l >= 0 && l < this.i && f >= 0 && f < this.h ? { x: l - Math.floor((this.i - 1) / 2), y: f - Math.floor(this.h / 2) } : { x: -1 / 0, y: -1 / 0 };
  }
  L() {
    this.A.clear();
  }
}
class Ft {
  constructor() {
    o(this, "D", /* @__PURE__ */ new Set());
  }
  k(t) {
    this.D.add(t);
  }
  dispose() {
    for (const t of this.D) t();
    this.D.clear();
  }
}
class E extends Error {
  constructor(t, e, s) {
    super(E.R(t, e, s)), this.name = "TextmodeError";
  }
  static R(t, e, s = {}) {
    const { includeContext: r = !0, includeFooterArrows: n = !0 } = s;
    return `${t}${r && e && Object.keys(e).length > 0 ? `

📋 Context:` + Object.entries(e).map(([h, a]) => `
  - ${h}: ${E.O(a)}`).join("") : ""}${n ? `

${"↓".repeat(24)}
` : `

`}`;
  }
  static O(t) {
    if (t === null) return "null";
    if (t === void 0) return "undefined";
    if (typeof t == "string") return `"${t}"`;
    if (typeof t == "number" || typeof t == "boolean") return t + "";
    if (Array.isArray(t)) return t.length === 0 ? "[]" : t.length <= 5 ? `[${t.map((e) => E.O(e)).join(", ")}]` : `[${t.slice(0, 3).map((e) => E.O(e)).join(", ")}, ... +${t.length - 3} more]`;
    if (typeof t == "object") {
      const e = Object.keys(t);
      return e.length === 0 ? "{}" : e.length <= 3 ? `{ ${e.map((s) => `${s}: ${E.O(t[s])}`).join(", ")} }` : `{ ${e.slice(0, 2).map((s) => `${s}: ${E.O(t[s])}`).join(", ")}, ... +${e.length - 2} more }`;
    }
    return t + "";
  }
}
function ye(i, t, e) {
  if (i.idRangeOffset[e] === 0) return t + i.idDelta[e] & 65535;
  {
    const s = i.startCount.length, r = i.idRangeOffset[e] / 2 + (t - i.startCount[e]) - (s - e);
    if (r >= 0 && i.glyphIdArray && r < i.glyphIdArray.length) {
      const n = i.glyphIdArray[r];
      if (n !== 0) return n + i.idDelta[e] & 65535;
    }
  }
  return 0;
}
const Se = /* @__PURE__ */ new WeakMap();
function Is(i) {
  return i.platformID === 0 || i.platformID === 3 && (i.encodingID === 1 || i.encodingID === 10);
}
function es(i) {
  const t = Se.get(i);
  if (t) return t;
  const e = (function(s) {
    const r = s.cmap;
    if (!(r != null && r.tables)) return { characterTables: [], lookupTables: [] };
    const n = r.tables.map((c, u) => (function(l, f, d) {
      if (!(function(y) {
        return y.format === 4 || y.format === 12;
      })(f)) return null;
      const p = (function(y, w, v) {
        const g = /* @__PURE__ */ new Map();
        for (const b of y.encodings ?? []) b.tableIndex === v && g.set(Jt(b), b);
        for (const b of w.encodings ?? []) b.tableIndex === v && g.set(Jt(b), b);
        for (const [b, A] of Object.entries(y.ids ?? {})) {
          if (A !== v) continue;
          const x = Hs(b, w.format, v);
          x && g.set(Jt(x), x);
        }
        return [...g.values()];
      })(l, f, d);
      return { table: f, tableIndex: d, encodings: p, isUnicode: p.some(Is) };
    })(r, c, u)).filter((c) => c !== null).filter((c) => (function(u) {
      return u.format === 4 ? (function(l) {
        if (!(l.startCount && l.endCount && l.idRangeOffset && l.idDelta)) return !1;
        for (let f = 0; f < l.startCount.length; f++) {
          const d = l.startCount[f], p = l.endCount[f];
          if (d !== 65535 || p !== 65535) {
            for (let y = d; y <= p; y++) if (ye(l, y, f) > 0) return !0;
          }
        }
        return !1;
      })(u) : (function(l) {
        if (!l.groups) return !1;
        for (let f = 0; f < l.groups.length; f += 3) {
          const d = l.groups[f], p = l.groups[f + 1], y = l.groups[f + 2];
          if (d <= p && y + (p - d) > 0) return !0;
        }
        return !1;
      })(u);
    })(c.table)), h = n.filter((c) => c.isUnicode), a = h.length > 0 ? h : n;
    return { characterTables: a, lookupTables: [...a].sort(Os) };
  })(i);
  return Se.set(i, e), e;
}
function Hs(i, t, e) {
  const s = /^p(\d+)e(\d+)$/.exec(i);
  return s ? { platformID: Number(s[1]), encodingID: Number(s[2]), format: t, tableIndex: e } : null;
}
function Jt(i) {
  return `${i.platformID}:${i.encodingID}:${i.format}:${i.tableIndex}`;
}
function Os(i, t) {
  const e = Fe(i) - Fe(t);
  return e !== 0 ? e : i.tableIndex - t.tableIndex;
}
function Fe(i) {
  const t = i.isUnicode ? 0 : 3;
  return i.table.format === 12 ? t : i.table.format === 4 ? t + 1 : t + 2;
}
class ks {
  I(t) {
    const e = [];
    return (function(s) {
      return es(s).characterTables;
    })(t).forEach(({ table: s }) => {
      if (s.format === 4) {
        const r = this.N(s);
        e.push(...r);
      } else if (s.format === 12) {
        const r = this.j(s);
        e.push(...r);
      }
    }), [...new Set(e)];
  }
  N(t) {
    const e = [];
    if (!(t.startCount && t.endCount && t.idRangeOffset && t.idDelta)) return e;
    for (let s = 0; s < t.startCount.length; s++) {
      const r = t.startCount[s], n = t.endCount[s];
      if (r !== 65535 || n !== 65535) for (let h = r; h <= n; h++)
        ye(t, h, s) > 0 && this.G(e, h);
    }
    return e;
  }
  j(t) {
    const e = [];
    if (!t.groups) return e;
    for (let s = 0; s < t.groups.length; s += 3) {
      const r = t.groups[s], n = t.groups[s + 1], h = t.groups[s + 2];
      for (let a = r; a <= n; a++)
        h + (a - r) > 0 && this.G(e, a);
    }
    return e;
  }
  G(t, e) {
    try {
      const s = String.fromCodePoint(e);
      t.push(s);
    } catch {
    }
  }
}
class ss {
  constructor(t) {
    this.H = t, this.V = null, this.X = 0, this.h = 0, this.o = 0, this.u = 0, this.p = document.createElement("canvas"), this.Y = this.p.getContext("2d", { alpha: !0 });
  }
  K(t, e, s) {
    this.X = Math.ceil(Math.sqrt(t)), this.h = Math.ceil(t / this.X), this.o = e * this.X, this.u = s * this.h, this.p.width = this.o, this.p.height = this.u, this.p.style.width = this.o + "px", this.p.style.height = this.u + "px", this.Y.imageSmoothingEnabled = !1, this.p.style.imageRendering = "pixelated", this.Y.clearRect(0, 0, this.o, this.u);
  }
  W() {
    this.V ? this.V.width === this.o && this.V.height === this.u || this.V.resize(this.o, this.u) : this.V = this.H.Z(this.o, this.u, 1, { filter: "nearest", depth: !1 }), this.V.$(this.p);
  }
  L() {
    var t;
    (t = this.V) == null || t.dispose(), this.V = null;
  }
}
class Ns {
  constructor(t) {
    this.q = new ss(t);
  }
  J(t, e, s, r) {
    this.q.K(t.length, e.width, e.height);
    const n = this.q.Y;
    n.textBaseline = "top", n.textAlign = "left", n.fillStyle = "white", this.tt(t, e, this.q.X, s, r), this.q.W();
  }
  tt(t, e, s, r, n) {
    const h = r / n.head.unitsPerEm, a = this.q.Y;
    for (let c = 0; c < t.length; c++) {
      const u = t[c], l = c % s, f = Math.floor(c / s), d = u.glyphData;
      if (!d) continue;
      const p = d.advanceWidth * h, y = l * e.width, w = f * e.height, v = y + 0.5 * e.width, g = w + 0.5 * e.height, b = Math.round(v - 0.5 * e.width), A = Math.round(g - 0.5 * r), x = b + 0.5 * (e.width - p), C = A + n.hhea.ascender * h;
      this.it(a, d, x, C, h);
    }
  }
  it(t, e, s, r, n) {
    if (!e || !e.xs || e.noc === 0) return;
    const { xs: h, ys: a, endPts: c, flags: u } = e;
    if (!(h && a && c && u)) return;
    t.beginPath();
    let l = 0;
    for (let f = 0; f < c.length; f++) {
      const d = c[f];
      if (!(d < l)) {
        if (d >= l) {
          const p = s + h[l] * n, y = r - a[l] * n;
          t.moveTo(p, y);
          let w = l + 1;
          for (; w <= d; )
            if (1 & u[w]) {
              const v = s + h[w] * n, g = r - a[w] * n;
              t.lineTo(v, g), w++;
            } else {
              const v = s + h[w] * n, g = r - a[w] * n;
              if (w + 1 > d) {
                const A = s + h[l] * n, x = r - a[l] * n;
                if (1 & u[l]) t.quadraticCurveTo(v, g, A, x);
                else {
                  const C = (v + A) / 2, R = (g + x) / 2;
                  t.quadraticCurveTo(v, g, C, R);
                }
                break;
              }
              const b = w + 1;
              if (1 & u[b]) {
                const A = s + h[b] * n, x = r - a[b] * n;
                t.quadraticCurveTo(v, g, A, x), w = b + 1;
              } else {
                const A = (v + (s + h[b] * n)) / 2, x = (g + (r - a[b] * n)) / 2;
                t.quadraticCurveTo(v, g, A, x), w = b;
              }
            }
          t.closePath();
        }
        l = d + 1;
      }
    }
    t.fill();
  }
  L() {
    this.q.L();
  }
  get framebuffer() {
    return this.q.V;
  }
  get columns() {
    return this.q.X;
  }
  get rows() {
    return this.q.h;
  }
}
class is {
  st(t, e) {
    let s = 0;
    for (const { table: r } of (function(n) {
      return es(n).lookupTables;
    })(t)) if (r.format === 4 ? s = this.et(e, r) : r.format === 12 && (s = this.rt(e, r)), s > 0) break;
    return s;
  }
  nt(t, e) {
    const s = e.codePointAt(0);
    return s === void 0 ? 0 : this.st(t, s);
  }
  ht(t, e) {
    const s = t.hmtx;
    return s && s.aWidth && s.aWidth.length !== 0 ? e < s.aWidth.length ? s.aWidth[e] : s.aWidth[s.aWidth.length - 1] : 0;
  }
  ot(t, e) {
    const s = e / t.head.unitsPerEm;
    return { lineHeight: t.hhea.ascender * s - t.hhea.descender * s + t.hhea.lineGap * s, scale: s };
  }
  et(t, e) {
    const s = e.endCount.length;
    let r = -1;
    for (let n = 0; n < s; n++) if (t <= e.endCount[n]) {
      r = n;
      break;
    }
    return r === -1 || t < e.startCount[r] ? 0 : ye(e, t, r);
  }
  rt(t, e) {
    const s = e.groups.length / 3;
    for (let r = 0; r < s; r++) {
      const n = e.groups[3 * r], h = e.groups[3 * r + 1], a = e.groups[3 * r + 2];
      if (t >= n && t <= h) return a + (t - n);
    }
    return 0;
  }
}
class Bs {
  constructor() {
    o(this, "ct");
    this.ct = new is();
  }
  ut(t, e, s) {
    let r = 0;
    const n = this.ct.ot(s, e);
    let h = 0, a = !1;
    for (const c of t) {
      const u = c.glyphData;
      let l = 0;
      if (!u && (l = this.ct.nt(s, c.character), l === 0)) continue;
      const f = ((u == null ? void 0 : u.advanceWidth) ?? this.ct.ht(s, l)) * n.scale;
      if (r = Math.max(r, f), u) {
        const d = Math.max(0, u.yMax - u.yMin) * n.scale;
        h = Math.max(h, d), a = !0;
      }
    }
    return a || (h = n.lineHeight), { width: Math.ceil(r), height: Math.ceil(h) };
  }
}
const D = { readShort: (i, t) => (D.t.uint16[0] = i[t] << 8 | i[t + 1], D.t.int16[0]), readUshort: (i, t) => i[t] << 8 | i[t + 1], readUshorts(i, t, e) {
  const s = [];
  for (let r = 0; r < e; r++) s.push(D.readUshort(i, t + 2 * r));
  return s;
}, readUint(i, t) {
  const e = D.t.uint8;
  return e[3] = i[t], e[2] = i[t + 1], e[1] = i[t + 2], e[0] = i[t + 3], D.t.uint32[0];
}, readASCII(i, t, e) {
  let s = "";
  for (let r = 0; r < e; r++) s += String.fromCharCode(i[t + r]);
  return s;
}, t: (() => {
  const i = new ArrayBuffer(8);
  return { uint8: new Uint8Array(i), int16: new Int16Array(i), uint16: new Uint16Array(i), uint32: new Uint32Array(i) };
})() };
function Yt(i) {
  return i + 3 & -4;
}
function Ut(i, t, e) {
  i[t] = e >>> 8 & 255, i[t + 1] = 255 & e;
}
function et(i, t, e) {
  i[t] = e >>> 24 & 255, i[t + 1] = e >>> 16 & 255, i[t + 2] = e >>> 8 & 255, i[t + 3] = 255 & e;
}
function Xs(i, t, e) {
  for (let s = 0; s < e.length; s++) i[t + s] = 255 & e.charCodeAt(s);
}
function ne(i, t, e) {
  const s = t + e;
  let r = 0;
  const n = D.t;
  for (let h = t; h < s; h += 4) n.uint8[3] = i[h] || 0, n.uint8[2] = i[h + 1] || 0, n.uint8[1] = i[h + 2] || 0, n.uint8[0] = i[h + 3] || 0, r = r + (n.uint32[0] >>> 0) >>> 0;
  return r >>> 0;
}
const Ys = { parseTab(i, t, e) {
  const s = { tables: [], ids: {}, encodings: [], off: t };
  i = new Uint8Array(i.buffer, t, e), t = 0;
  const r = D, n = r.readUshort;
  n(i, t);
  const h = n(i, t += 2);
  t += 2;
  const a = [];
  for (let c = 0; c < h; c++) {
    const u = n(i, t), l = n(i, t += 2);
    t += 2;
    const f = r.readUint(i, t);
    t += 4;
    const d = `p${u}e${l}`;
    let p = a.indexOf(f);
    if (p === -1) {
      let v;
      p = s.tables.length, a.push(f);
      const g = n(i, f);
      v = g === 4 ? this.parse4(i, f) : g === 12 ? this.parse12(i, f) : { format: g }, s.tables.push(v);
    }
    s.ids[d] = p;
    const y = s.tables[p], w = { platformID: u, encodingID: l, format: y.format, tableIndex: p };
    s.encodings.push(w), (y.encodings ?? (y.encodings = [])).push(w);
  }
  return s;
}, parse4(i, t) {
  const e = D, s = e.readUshort, r = e.readUshorts, n = t, h = s(i, t += 2);
  s(i, t += 2);
  const a = s(i, t += 2) >>> 1, c = { format: 4, encodings: [], searchRange: s(i, t += 2), entrySelector: 0, rangeShift: 0, endCount: [], startCount: [], idDelta: [], idRangeOffset: [], glyphIdArray: [] };
  t += 2, c.entrySelector = s(i, t), t += 2, c.rangeShift = s(i, t), t += 2, c.endCount = r(i, t, a), t += 2 * a, t += 2, c.startCount = r(i, t, a), t += 2 * a;
  for (let u = 0; u < a; u++) c.idDelta.push(e.readShort(i, t)), t += 2;
  return c.idRangeOffset = r(i, t, a), t += 2 * a, c.glyphIdArray = r(i, t, n + h - t >> 1), c;
}, parse12(i, t) {
  const e = D.readUint;
  e(i, t += 4), e(i, t += 4);
  const s = e(i, t += 4);
  t += 4;
  const r = new Uint32Array(3 * s);
  for (let n = 0; n < 3 * s; n += 3) r[n] = e(i, t + (n << 2)), r[n + 1] = e(i, t + (n << 2) + 4), r[n + 2] = e(i, t + (n << 2) + 8);
  return { format: 12, encodings: [], groups: r };
} }, zs = { parseTab(i, t, e) {
  const s = D;
  t += 18;
  const r = s.readUshort(i, t);
  t += 2, t += 16;
  const n = s.readShort(i, t);
  t += 2;
  const h = s.readShort(i, t);
  t += 2;
  const a = s.readShort(i, t);
  t += 2;
  const c = s.readShort(i, t);
  return t += 2, t += 6, { unitsPerEm: r, xMin: n, yMin: h, xMax: a, yMax: c, indexToLocFormat: s.readShort(i, t) };
} }, Gs = { parseTab(i, t, e) {
  const s = D;
  t += 4;
  const r = s.readShort, n = s.readUshort;
  return { ascender: r(i, t), descender: r(i, t + 2), lineGap: r(i, t + 4), advanceWidthMax: n(i, t + 6), minLeftSideBearing: r(i, t + 8), minRightSideBearing: r(i, t + 10), xMaxExtent: r(i, t + 12), caretSlopeRise: r(i, t + 14), caretSlopeRun: r(i, t + 16), caretOffset: r(i, t + 18), res0: r(i, t + 20), res1: r(i, t + 22), res2: r(i, t + 24), res3: r(i, t + 26), metricDataFormat: r(i, t + 28), numberOfHMetrics: n(i, t + 30) };
} }, Ks = { parseTab(i, t, e, s) {
  const r = D, n = [], h = [], a = s.maxp.numGlyphs, c = s.hhea.numberOfHMetrics;
  let u = 0, l = 0, f = 0;
  for (; f < c; ) u = r.readUshort(i, t + (f << 2)), l = r.readShort(i, t + (f << 2) + 2), n.push(u), h.push(l), f++;
  for (; f < a; ) n.push(u), h.push(l), f++;
  return { aWidth: n, lsBearing: h };
} }, Pe = { cmap: Ys, head: zs, hhea: Gs, maxp: { parseTab(i, t, e) {
  const s = D;
  return s.readUint(i, t), t += 4, { numGlyphs: s.readUshort(i, t) };
} }, hmtx: Ks, loca: { parseTab(i, t, e, s) {
  const r = D, n = [], h = s.head.indexToLocFormat, a = s.maxp.numGlyphs + 1;
  if (h === 0) for (let c = 0; c < a; c++) n.push(r.readUshort(i, t + (c << 1)) << 1);
  else if (h === 1) for (let c = 0; c < a; c++) n.push(r.readUint(i, t + (c << 2)));
  return n;
} }, glyf: { parseTab(i, t, e, s) {
  const r = [], n = s.maxp.numGlyphs;
  for (let h = 0; h < n; h++) r.push(null);
  return r;
}, lt(i, t) {
  const e = D, s = i.ft, r = i.loca;
  if (r[t] === r[t + 1]) return null;
  const n = Tt.findTable(s, "glyf", i.dt);
  if (!n) return null;
  let h = n[0] + r[t];
  const a = {};
  if (a.noc = e.readShort(s, h), h += 2, a.xMin = e.readShort(s, h), h += 2, a.yMin = e.readShort(s, h), h += 2, a.xMax = e.readShort(s, h), h += 2, a.yMax = e.readShort(s, h), h += 2, a.xMin >= a.xMax || a.yMin >= a.yMax) return null;
  if (a.noc > 0) {
    a.endPts = [];
    for (let d = 0; d < a.noc; d++) a.endPts.push(e.readUshort(s, h)), h += 2;
    const c = e.readUshort(s, h);
    if (h += 2, s.length - h < c) return null;
    h += c;
    const u = a.endPts[a.noc - 1] + 1;
    a.flags = [];
    for (let d = 0; d < u; d++) {
      const p = s[h];
      if (h++, a.flags.push(p), 8 & p) {
        const y = s[h];
        h++;
        for (let w = 0; w < y; w++) a.flags.push(p), d++;
      }
    }
    a.xs = [];
    for (let d = 0; d < u; d++) {
      const p = a.flags[d], y = !!(16 & p);
      2 & p ? (a.xs.push(y ? s[h] : -s[h]), h++) : y ? a.xs.push(0) : (a.xs.push(e.readShort(s, h)), h += 2);
    }
    a.ys = [];
    for (let d = 0; d < u; d++) {
      const p = a.flags[d], y = !!(32 & p);
      4 & p ? (a.ys.push(y ? s[h] : -s[h]), h++) : y ? a.ys.push(0) : (a.ys.push(e.readShort(s, h)), h += 2);
    }
    let l = 0, f = 0;
    for (let d = 0; d < u; d++) l += a.xs[d], f += a.ys[d], a.xs[d] = l, a.ys[d] = f;
  } else a.parts = [], a.endPts = [], a.flags = [], a.xs = [], a.ys = [];
  return a;
} } }, Tt = { parse(i) {
  const t = new Uint8Array(i), e = Pe, s = {}, r = { ft: t, _t: 0, dt: 0 };
  for (const n in e) {
    const h = n, a = Tt.findTable(t, h, 0);
    if (a) {
      const [c, u] = a;
      let l = s[c];
      l == null && (l = e[h].parseTab(t, c, u, r), s[c] = l), Object.assign(r, { [h]: l });
    }
  }
  return [r];
}, findTable(i, t, e) {
  const s = D, r = s.readUshort(i, e + 4);
  let n = e + 12;
  for (let h = 0; h < r; h++) {
    const a = s.readASCII(i, n, 4);
    s.readUint(i, n + 4);
    const c = s.readUint(i, n + 8), u = s.readUint(i, n + 12);
    if (a === t) return [c, u];
    n += 16;
  }
  return null;
}, T: Pe, B: D };
let ct;
function zt(i) {
  if (i.length === 0) return [];
  const t = ct !== void 0 ? ct : typeof Intl < "u" && "Segmenter" in Intl ? (ct = new Intl.Segmenter(void 0, { granularity: "grapheme" }), ct) : (ct = null, ct);
  return t ? Array.from(t.segment(i), (e) => e.segment) : Array.from(i);
}
function he(i) {
  return Array.from(i, (t) => t.codePointAt(0)).filter((t) => t !== void 0);
}
class Qs {
  constructor() {
    o(this, "gt");
    this.gt = new is();
  }
  vt(t, e) {
    const s = [], r = /* @__PURE__ */ new Map();
    return t.forEach((n, h) => {
      const a = { character: n, unicode: he(n)[0] ?? 0, color: this.yt(h), glyphData: this.wt(e, n) };
      s.push(a), r.set(n, a);
    }), { array: s, map: r };
  }
  yt(t) {
    return [t % 256 / 255, Math.floor(t / 256) % 256 / 255, 0];
  }
  wt(t, e) {
    const s = e.codePointAt(0) || 0, r = this.gt.st(t, s);
    if (r === 0) return null;
    const n = this.gt.ht(t, r), h = Tt.T.glyf.lt(t, r);
    return h ? { ...h, advanceWidth: n } : null;
  }
}
async function Zs(i) {
  if (typeof DecompressionStream > "u") throw Error("[textmode.js] WOFF font loading requires DecompressionStream support.");
  const t = D, e = new Uint8Array(i);
  if (e.length < 44) throw Error("Invalid WOFF header.");
  if (t.readASCII(e, 0, 4) !== "wOFF") throw Error("Invalid WOFF signature.");
  const s = t.readUint(e, 4), r = t.readUshort(e, 12), n = t.readUint(e, 16);
  if (44 + 20 * r > e.length) throw Error("Invalid WOFF table directory.");
  const h = [];
  let a = 44;
  for (let u = 0; u < r; u++) {
    const l = t.readASCII(e, a, 4), f = t.readUint(e, a + 4), d = t.readUint(e, a + 8), p = t.readUint(e, a + 12);
    if (t.readUint(e, a + 16), f + d > e.length) throw Error(`Invalid WOFF table bounds for ${l}.`);
    if (d > p) throw Error(`Invalid WOFF table length for ${l}.`);
    h.push({ tag: l, offset: f, compLength: d, origLength: p }), a += 20;
  }
  const c = await Promise.all(h.map((u) => (async function(l, f) {
    const d = new Uint8Array(l.buffer, f.offset, f.compLength);
    let p;
    return f.compLength === f.origLength ? p = new Uint8Array(d) : (p = await (async function(y) {
      const w = new ReadableStream({ start(g) {
        g.enqueue(y), g.close();
      } }).pipeThrough(new DecompressionStream("deflate")), v = await new Response(w).arrayBuffer();
      return new Uint8Array(v);
    })(d), p = (function(y, w) {
      if (y.length === w) return y;
      if (y.length < w) {
        const v = new Uint8Array(w);
        return v.set(y), v;
      }
      return y.subarray(0, w);
    })(p, f.origLength)), { ...f, data: p };
  })(e, u)));
  return (function(u, l, f) {
    const d = f.length;
    let p = 1, y = 0;
    for (; p << 1 <= d; ) p <<= 1, y++;
    const w = 16 * p, v = 16 * d - w;
    let g = 12 + 16 * d;
    const b = {};
    for (const T of f) b[T.tag] = g, g = Yt(g + T.data.length);
    const A = Math.max(l || 0, g), x = new Uint8Array(A);
    et(x, 0, u), Ut(x, 4, d), Ut(x, 6, w), Ut(x, 8, y), Ut(x, 10, v);
    let C = 12;
    for (const T of f) Xs(x, C, T.tag), C += 4, et(x, C, js(T)), C += 4, et(x, C, b[T.tag]), C += 4, et(x, C, T.data.length), C += 4;
    for (const T of f) x.set(T.data, b[T.tag]);
    const R = b.head;
    if (R !== void 0) {
      const T = (function(M, F) {
        const P = F + 8, k = [M[P], M[P + 1], M[P + 2], M[P + 3]];
        et(M, P, 0);
        const G = 2981146554 - (ne(M, 0, Yt(M.length)) >>> 0) >>> 0;
        return M[P] = k[0], M[P + 1] = k[1], M[P + 2] = k[2], M[P + 3] = k[3], G >>> 0;
      })(x, R);
      et(x, R + 8, T);
    }
    return x.buffer;
  })(s, n, c);
}
function js(i) {
  if (i.tag !== "head" || i.data.length < 12) return ne(i.data, 0, Yt(i.data.length));
  const t = new Uint8Array(i.data);
  return et(t, 8, 0), ne(t, 0, Yt(t.length));
}
class N extends Ft {
  constructor(e, s = 16) {
    super();
    o(this, "H");
    o(this, "bt");
    o(this, "Mt", []);
    o(this, "At", /* @__PURE__ */ new Map());
    o(this, "xt", 16);
    o(this, "Ct", { width: 0, height: 0 });
    o(this, "St");
    o(this, "Et");
    o(this, "Ft");
    o(this, "Tt");
    o(this, "Pt", !1);
    this.H = e, this.xt = s, this.St = new ks(), this.Et = new Ns(e), this.Ft = new Bs(), this.Tt = new Qs();
  }
  Lt(e = {}) {
    if (!this.Pt) throw new E("Cannot fork an uninitialized TextmodeFont.");
    const s = e.fontSize ?? this.xt, r = new N(this.H, s);
    return r.bt = this.bt, r.Mt = this.Mt, r.At = new Map(this.At), r.Pt = !0, r.Dt(), r;
  }
  async kt(e) {
    if (this.Pt) return;
    if (!e) throw new E("TextmodeFont requires an explicit font source.");
    const s = await this.Rt(e);
    await this.Ot(s);
  }
  It(e) {
    if (e === void 0) return this.xt;
    this.xt = e, this.Dt();
  }
  Dt() {
    this.Ct = this.Ft.ut(this.Mt, this.xt, this.bt), this.Et.J(this.Mt, this.Ct, this.xt, this.bt);
  }
  async Bt(e) {
    try {
      const s = await this.Rt(e);
      await this.Ot(s);
    } catch (s) {
      throw new E("Failed to load font: " + (s instanceof Error ? s.message : "Unknown error"), { originalError: s });
    }
  }
  async Rt(e) {
    const s = await fetch(e);
    if (!s.ok) throw new E(`Failed to load font file: ${s.status} ${s.statusText}`);
    return s.arrayBuffer();
  }
  async Ot(e) {
    const s = await (async function(r) {
      const n = D.readASCII(new Uint8Array(r), 0, 4);
      if (n === "wOFF") {
        const h = await Zs(r);
        return Tt.parse(h);
      }
      if (n === "wOF2") throw Error("[textmode.js] WOFF2 fonts are not supported. Use .woff, .ttf, or .otf.");
      return Tt.parse(r);
    })(e);
    if (!s || s.length === 0) throw Error("Failed to parse font file");
    this.bt = s[0], await this.Nt();
  }
  async Nt() {
    const e = this.St.I(this.bt);
    if (e.length === 0) throw new E("[textmode.js] Font has no supported cmap glyphs.");
    const { array: s, map: r } = this.Tt.vt(e, this.bt);
    this.Mt = s, this.At = r, this.Dt(), this.Pt = !0;
  }
  jt(e) {
    const s = this.At.get(e);
    return s ? s.color : [1, 1, 0];
  }
  zt(e) {
    return zt(e).map((s) => {
      const r = this.At.get(s);
      return r ? r.color : [1, 1, 0];
    });
  }
  dispose() {
    this.Et.L(), super.dispose();
  }
  get framebuffer() {
    return this.Et.framebuffer;
  }
  get characterMap() {
    return this.At;
  }
  get characters() {
    return this.Mt;
  }
  get textureColumns() {
    return this.Et.columns;
  }
  get textureRows() {
    return this.Et.rows;
  }
  get columns() {
    return this.Et.columns;
  }
  get rows() {
    return this.Et.rows;
  }
  get cellWidth() {
    return this.Ct.width;
  }
  get cellHeight() {
    return this.Ct.height;
  }
  get cellDimensions() {
    return this.Ct;
  }
  get maxGlyphDimensions() {
    return this.Ct;
  }
  get fontSize() {
    return this.xt;
  }
  get font() {
    return this.bt;
  }
}
class Vs {
  constructor(t) {
    this.q = new ss(t);
  }
  J(t, e, s, r) {
    this.q.K(t.length, e.width, e.height), this.Qt(t, e, s, r), this.q.W();
  }
  L() {
    this.q.L();
  }
  Qt(t, e, s, r) {
    const n = this.q.Y, h = this.q.X;
    for (let a = 0; a < t.length; a++) {
      const c = a % h, u = Math.floor(a / h), l = a % r.columns, f = Math.floor(a / r.columns), d = r.marginX + l * (r.cellWidth + r.spacingX), p = r.marginY + f * (r.cellHeight + r.spacingY), y = c * e.width, w = u * e.height;
      n.drawImage(s, d, p, r.cellWidth, r.cellHeight, y, w, e.width, e.height);
    }
  }
  get framebuffer() {
    return this.q.V;
  }
  get columns() {
    return this.q.X;
  }
  get rows() {
    return this.q.h;
  }
}
const O = class O extends Ft {
  constructor(e, s, r) {
    super();
    o(this, "H");
    o(this, "Et", null);
    o(this, "Mt", []);
    o(this, "At", /* @__PURE__ */ new Map());
    o(this, "Xt", { width: 0, height: 0 });
    o(this, "Yt", { width: 0, height: 0 });
    o(this, "xt", 0);
    o(this, "Kt");
    o(this, "Wt");
    o(this, "Zt");
    o(this, "$t");
    o(this, "Pt", !1);
    this.H = e, this.xt = s === void 0 ? 0 : Math.abs(s), this.Zt = r;
  }
  Lt(e = {}) {
    if (!this.Pt || !this.Wt || !this.$t) throw new E("Cannot fork an uninitialized TextmodeTileset.");
    const s = new O(this.H, e.fontSize ?? this.xt);
    return s.Mt = this.$t.characters, s.At = new Map(this.$t.characterMap), s.Xt = { ...this.$t.nativeCellDimensions }, s.Kt = this.Kt, s.Wt = { ...this.Wt }, s.Zt = this.Zt, s.Pt = !0, s.qt(this.$t), s.Jt(), s;
  }
  async kt(e) {
    if (this.Pt) return;
    if (this.Zt = e ?? this.Zt, !this.Zt) throw new E("Cannot initialize a TextmodeTileset without source options.");
    const s = this.ti(this.Zt), r = this.ii(s);
    if (r) return this.qt(r), this.Mt = r.characters, this.At = new Map(r.characterMap), this.Xt = { ...r.nativeCellDimensions }, this.Wt = { ...r.layout }, this.xt === 0 && (this.xt = Math.abs(this.Zt.fontSize ?? r.nativeCellDimensions.height)), this.Jt(), void (this.Pt = !0);
    const n = await this.si(this.Zt.source), h = this.ei(n), a = this.ri(this.Zt, h.width, h.height), c = this.ni(this.Zt, a), u = await this.hi(this.Zt, c, a.columns), l = this.oi(u), f = new Map(l.map((p) => [p.character, p])), d = new Vs(this.H);
    this.Kt = n, this.Wt = a, this.Xt = { width: a.cellWidth, height: a.cellHeight }, this.Mt = l, this.At = f, this.xt === 0 && (this.xt = Math.abs(this.Zt.fontSize ?? a.cellHeight)), this.Jt(), d.J(this.Mt, this.Xt, n, a), this.qt({ cacheKey: s, textureAtlas: d, characters: l, characterMap: f, nativeCellDimensions: { ...this.Xt }, layout: { ...a }, referenceCount: 0 }), this.Pt = !0;
  }
  It(e) {
    if (e === void 0) return this.xt;
    this.xt = Math.abs(e), this.Jt();
  }
  jt(e) {
    const s = this.At.get(e);
    return s ? s.color : [1, 1, 0];
  }
  zt(e) {
    return zt(e).map((s) => this.jt(s));
  }
  dispose() {
    this.ai(), super.dispose();
  }
  qt(e) {
    this.$t !== e && (this.ai(), O.ci(this.H).set(e.cacheKey, e), e.referenceCount += 1, this.$t = e, this.Et = e.textureAtlas);
  }
  ai() {
    const e = this.$t;
    if (e) {
      if (e.referenceCount -= 1, e.referenceCount <= 0) {
        e.textureAtlas.L();
        const s = O.Gt.get(this.H);
        s == null || s.delete(e.cacheKey);
      }
      this.$t = void 0, this.Et = null;
    } else this.Et = null;
  }
  ti(e) {
    return JSON.stringify({ source: this.ui(e.source), columns: e.columns, rows: e.rows, count: e.count ?? null, margin: e.margin ?? null, marginX: e.marginX ?? null, marginY: e.marginY ?? null, spacing: e.spacing ?? null, spacingX: e.spacingX ?? null, spacingY: e.spacingY ?? null, mapping: this.li(e) });
  }
  ui(e) {
    return typeof e == "string" || e instanceof URL ? "url:" + (e + "") : "object:" + O.fi(e);
  }
  li(e) {
    return e.map === void 0 ? "auto:32" : Array.isArray(e.map) ? "rows:" + e.map.join(`
`) : e.map instanceof URL ? "url:" + (e.map + "") : this.di(e.map) ? "inline:" + e.map : "url:" + e.map;
  }
  ii(e) {
    var s;
    return (s = O.Gt.get(this.H)) == null ? void 0 : s.get(e);
  }
  static ci(e) {
    let s = O.Gt.get(e);
    return s || (s = /* @__PURE__ */ new Map(), O.Gt.set(e, s)), s;
  }
  static fi(e) {
    const s = O.Ht.get(e);
    if (s !== void 0) return s;
    const r = O.Vt++;
    return O.Ht.set(e, r), r;
  }
  async si(e) {
    if (typeof e != "string" && !(e instanceof URL)) return e;
    const s = e + "";
    return new Promise((r, n) => {
      const h = new Image();
      h.crossOrigin = "anonymous", h.onload = () => r(h), h.onerror = () => n(new E("Failed to load tileset image: " + s)), h.src = s;
    });
  }
  async hi(e, s, r) {
    if (e.map !== void 0) {
      const n = await this._i(e.map), h = this.pi(n, s, r);
      return this.mi(h, "tileset map"), h;
    }
    return this.gi(s);
  }
  async _i(e) {
    return Array.isArray(e) ? [...e] : e instanceof URL ? this.yi(await this.wi(e)) : this.di(e) ? this.yi(e) : this.yi(await this.wi(e));
  }
  pi(e, s, r) {
    const n = Math.ceil(s / r);
    if (e.length !== n) throw new E(`Tileset map must contain exactly ${n} row${n === 1 ? "" : "s"} for ${s} mapped tile${s === 1 ? "" : "s"}.`);
    const h = [];
    let a = s;
    for (let c = 0; c < e.length; c++) {
      const u = zt(e[c]), l = Math.min(r, a);
      if (u.length !== l) throw new E(`Tileset map row ${c + 1} must contain exactly ${l} character cell${l === 1 ? "" : "s"}.`);
      h.push(...u), a -= l;
    }
    return h;
  }
  gi(e) {
    this.bi(e);
    const s = [];
    for (let r = 0; r < e; r++) s.push(String.fromCodePoint(32 + r));
    return s;
  }
  async wi(e) {
    let s;
    try {
      s = await fetch(e);
    } catch (r) {
      throw new E("Failed to load tileset map: " + (r instanceof Error ? r.message : "Unknown error"));
    }
    if (!s.ok) throw new E(`Failed to load tileset map: ${s.status} ${s.statusText}`);
    return s.text();
  }
  yi(e) {
    const s = e.split(/\r\n|\n|\r/);
    return s.length > 0 && s[s.length - 1] === "" && s.pop(), s;
  }
  di(e) {
    return !(!e.includes(`
`) && !e.includes("\r")) || !this.Mi(e);
  }
  Mi(e) {
    return /^(?:[a-z]+:)?\/\//i.test(e) || e.startsWith("/") || e.startsWith("./") || e.startsWith("../") || e.includes("\\") || /\.[a-z0-9]+(?:$|[?#])/i.test(e);
  }
  ei(e) {
    const s = e, r = s.naturalWidth ?? s.videoWidth ?? s.displayWidth ?? s.width, n = s.naturalHeight ?? s.videoHeight ?? s.displayHeight ?? s.height;
    if (typeof r != "number" || typeof n != "number" || r <= 0 || n <= 0) throw new E("Tileset source must expose positive pixel dimensions.");
    return { width: r, height: n };
  }
  ri(e, s, r) {
    const n = e.marginX ?? e.margin ?? 0, h = e.marginY ?? e.margin ?? 0, a = e.spacingX ?? e.spacing ?? 0, c = e.spacingY ?? e.spacing ?? 0;
    if (e.columns <= 0 || e.rows <= 0) throw new E("Tileset columns and rows must be greater than 0.");
    const u = s - 2 * n - a * (e.columns - 1), l = r - 2 * h - c * (e.rows - 1);
    if (u <= 0 || l <= 0) throw new E("Tileset margins and spacing leave no usable tile area.");
    const f = u / e.columns, d = l / e.rows;
    if (!Number.isInteger(f) || !Number.isInteger(d)) throw new E("Tileset dimensions do not divide evenly. Check columns, rows, margins, and spacing.");
    return { columns: e.columns, rows: e.rows, marginX: n, marginY: h, spacingX: a, spacingY: c, cellWidth: f, cellHeight: d };
  }
  ni(e, s) {
    const r = s.columns * s.rows, n = e.count ?? r;
    if (n <= 0 || n > r) throw new E(`Tileset count must be between 1 and ${r}.`);
    return n;
  }
  bi(e) {
    if (32 + e - 1 > 1114111) throw new E("Tileset automatic character assignment exceeds the supported Unicode range.");
  }
  mi(e, s) {
    const r = /* @__PURE__ */ new Map();
    for (let n = 0; n < e.length; n++) {
      const h = e[n], a = r.get(h);
      if (a !== void 0) throw new E(`${s} contains duplicate character ${this.Ai(h)} at tile ${a + 1} and tile ${n + 1}.`);
      r.set(h, n);
    }
  }
  Ai(e) {
    const s = he(e);
    if (s.length === 0) return '""';
    const r = s.map((n) => "U+" + n.toString(16).toUpperCase().padStart(4, "0")).join(" ");
    return `${JSON.stringify(e)} (${r})`;
  }
  oi(e) {
    const s = [];
    for (let r = 0; r < e.length; r++) {
      const n = e[r], h = he(n)[0];
      if (h === void 0) throw new E(`Tileset character mapping produced an empty character at tile ${r + 1}.`);
      s.push({ character: n, unicode: h, color: this.xi(r) });
    }
    return s;
  }
  xi(e) {
    return [(255 & e) / 255, (e >> 8 & 255) / 255, (e >> 16 & 255) / 255];
  }
  Jt() {
    if (this.Xt.height <= 0 || this.Xt.width <= 0) return;
    const e = Math.max(1, this.xt || this.Xt.height), s = e / this.Xt.height;
    this.Yt = { width: Math.max(1, Math.round(this.Xt.width * s)), height: e };
  }
  get characters() {
    return this.Mt;
  }
  get characterMap() {
    return this.At;
  }
  get framebuffer() {
    return this.Et.framebuffer;
  }
  get fontFramebuffer() {
    return this.framebuffer;
  }
  get columns() {
    return this.Et.columns;
  }
  get rows() {
    return this.Et.rows;
  }
  get textureColumns() {
    return this.columns;
  }
  get textureRows() {
    return this.rows;
  }
  get nativeCellDimensions() {
    return this.Xt;
  }
  get maxGlyphDimensions() {
    return this.Yt;
  }
  get cellDimensions() {
    return this.Yt;
  }
  get cellWidth() {
    return this.Yt.width;
  }
  get cellHeight() {
    return this.Yt.height;
  }
  get fontSize() {
    return this.xt;
  }
};
o(O, "Gt", /* @__PURE__ */ new WeakMap()), o(O, "Ht", /* @__PURE__ */ new WeakMap()), o(O, "Vt", 1);
let Y = O;
const Hr = Object.freeze(Object.defineProperty({ __proto__: null, TextmodeFont: N, TextmodeTileset: Y }, Symbol.toStringTag, { value: "Module" })), Gt = ["normal", "additive", "multiply", "screen", "subtract", "darken", "lighten", "overlay", "softLight", "hardLight", "colorDodge", "colorBurn", "difference", "exclusion"];
var rs = ((i) => (i[i.SILENT = 0] = "SILENT", i[i.WARNING = 1] = "WARNING", i[i.ERROR = 2] = "ERROR", i[i.THROW = 3] = "THROW", i))(rs || {});
const st = class st {
  constructor() {
    o(this, "Zt", { globalLevel: 3 });
    o(this, "Si", /* @__PURE__ */ new Set());
  }
  static Ei() {
    return st.Ci || (st.Ci = new st()), st.Ci;
  }
  Fi(t, e) {
    const s = "%c[textmode.js] Oops! (╯°□°)╯︵ Something went wrong in your code.", r = "color: #f44336; font-weight: bold; background: #ffebee; padding: 2px 6px; border-radius: 3px;";
    switch (this.Zt.globalLevel) {
      case 0:
        return !1;
      case 1:
        return !!this.Ti("warning", t, e) && (console.group(s, r), console.warn(E.R(t, e, { includeFooterArrows: !1 })), console.groupEnd(), !1);
      case 2:
        return !!this.Ti("error", t, e) && (console.group(s, r), console.error(E.R(t, e, { includeFooterArrows: !1 })), console.groupEnd(), !1);
      default:
        throw new E(t, e);
    }
  }
  Pi(t, e, s) {
    return !!t || (this.Fi(e, s), !1);
  }
  Li(t) {
    this.Zt.globalLevel = t;
  }
  Di(t) {
    t.globalLevel !== void 0 && (this.Zt.globalLevel = t.globalLevel);
  }
  ki() {
    this.Si.clear();
  }
  Ti(t, e, s) {
    const r = this.Ri(t, e, s);
    return !this.Si.has(r) && (this.Si.add(r), !0);
  }
  Ri(t, e, s) {
    return `${t}|${e}|${s ? this.Oi(s) : ""}`;
  }
  Oi(t) {
    return t == null ? t + "" : typeof t == "number" || typeof t == "boolean" || typeof t == "string" ? JSON.stringify(t) : Array.isArray(t) ? `[${t.map((e) => this.Oi(e)).join(",")}]` : typeof t == "object" ? `{${Object.entries(t).sort(([e], [s]) => e.localeCompare(s)).map(([e, s]) => `${JSON.stringify(e)}:${this.Oi(s)}`).join(",")}}` : t + "";
  }
};
o(st, "Ci", null);
let oe = st;
const pt = oe.Ei();
var L = ((i) => (i[i.NORMAL = 0] = "NORMAL", i[i.ADDITIVE = 1] = "ADDITIVE", i[i.MULTIPLY = 2] = "MULTIPLY", i[i.SCREEN = 3] = "SCREEN", i[i.SUBTRACT = 4] = "SUBTRACT", i[i.DARKEN = 5] = "DARKEN", i[i.LIGHTEN = 6] = "LIGHTEN", i[i.OVERLAY = 7] = "OVERLAY", i[i.SOFT_LIGHT = 8] = "SOFT_LIGHT", i[i.HARD_LIGHT = 9] = "HARD_LIGHT", i[i.COLOR_DODGE = 10] = "COLOR_DODGE", i[i.COLOR_BURN = 11] = "COLOR_BURN", i[i.DIFFERENCE = 12] = "DIFFERENCE", i[i.EXCLUSION = 13] = "EXCLUSION", i))(L || {});
const Ot = new Map(Gt.map((i, t) => [i, t]));
new Map(Array.from(Ot.entries()).map(([i, t]) => [t, i]));
const Ws = new Set(Object.values(L).filter((i) => typeof i == "number"));
function Z(i) {
  return i * (Math.PI / 180);
}
function yt(i) {
  return i * (180 / Math.PI);
}
function Le(i, t, e, s) {
  return yt(Math.atan2(s - t, e - i));
}
function Et(i, t, e, s) {
  return Math.hypot(e - i, s - t);
}
function X(i, t, e) {
  return Math.min(Math.max(i, t), e);
}
const qs = ["linear", "inQuad", "outQuad", "inOutQuad", "inCubic", "outCubic", "inOutCubic", "inQuart", "outQuart", "inOutQuart", "inQuint", "outQuint", "inOutQuint", "inSine", "outSine", "inOutSine", "inExpo", "outExpo", "inOutExpo", "inCirc", "outCirc", "inOutCirc", "inBack", "outBack", "inOutBack", "inElastic", "outElastic", "inOutElastic", "inBounce", "outBounce", "inOutBounce"], Ue = 1.70158, De = 2.5949095, Ie = 2 * Math.PI / 3, He = 2 * Math.PI / 4.5;
function Dt(i) {
  if (i < 1 / 2.75) return 7.5625 * i * i;
  if (i < 2 / 2.75) {
    const r = i - 0.5454545454545454;
    return 7.5625 * r * r + 0.75;
  }
  if (i < 2.5 / 2.75) {
    const r = i - 0.8181818181818182;
    return 7.5625 * r * r + 0.9375;
  }
  const s = i - 2.625 / 2.75;
  return 7.5625 * s * s + 0.984375;
}
const $s = { linear: (i) => i, inQuad: (i) => i * i, outQuad: (i) => 1 - Math.pow(1 - i, 2), inOutQuad: (i) => i < 0.5 ? 2 * i * i : 1 - Math.pow(-2 * i + 2, 2) / 2, inCubic: (i) => i * i * i, outCubic: (i) => 1 - Math.pow(1 - i, 3), inOutCubic: (i) => i < 0.5 ? 4 * i * i * i : 1 - Math.pow(-2 * i + 2, 3) / 2, inQuart: (i) => i * i * i * i, outQuart: (i) => 1 - Math.pow(1 - i, 4), inOutQuart: (i) => i < 0.5 ? 8 * Math.pow(i, 4) : 1 - Math.pow(-2 * i + 2, 4) / 2, inQuint: (i) => i * i * i * i * i, outQuint: (i) => 1 - Math.pow(1 - i, 5), inOutQuint: (i) => i < 0.5 ? 16 * Math.pow(i, 5) : 1 - Math.pow(-2 * i + 2, 5) / 2, inSine: (i) => 1 - Math.cos(i * Math.PI / 2), outSine: (i) => Math.sin(i * Math.PI / 2), inOutSine: (i) => -(Math.cos(Math.PI * i) - 1) / 2, inExpo: (i) => i === 0 ? 0 : Math.pow(2, 10 * i - 10), outExpo: (i) => i === 1 ? 1 : 1 - Math.pow(2, -10 * i), inOutExpo: (i) => i === 0 || i === 1 ? i : i < 0.5 ? Math.pow(2, 20 * i - 10) / 2 : (2 - Math.pow(2, -20 * i + 10)) / 2, inCirc: (i) => 1 - Math.sqrt(1 - Math.pow(i, 2)), outCirc: (i) => Math.sqrt(1 - Math.pow(i - 1, 2)), inOutCirc: (i) => i < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * i, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * i + 2, 2)) + 1) / 2, inBack: (i) => 2.70158 * i * i * i - Ue * i * i, outBack: (i) => 1 + 2.70158 * Math.pow(i - 1, 3) + Ue * Math.pow(i - 1, 2), inOutBack: (i) => i < 0.5 ? Math.pow(2 * i, 2) * (7.189819 * i - De) / 2 : (Math.pow(2 * i - 2, 2) * (3.5949095 * (2 * i - 2) + De) + 2) / 2, inElastic: (i) => i === 0 || i === 1 ? i : -Math.pow(2, 10 * i - 10) * Math.sin((10 * i - 10.75) * Ie), outElastic: (i) => i === 0 || i === 1 ? i : Math.pow(2, -10 * i) * Math.sin((10 * i - 0.75) * Ie) + 1, inOutElastic: (i) => i === 0 || i === 1 ? i : i < 0.5 ? -Math.pow(2, 20 * i - 10) * Math.sin((20 * i - 11.125) * He) / 2 : Math.pow(2, -20 * i + 10) * Math.sin((20 * i - 11.125) * He) / 2 + 1, inBounce: (i) => 1 - Dt(1 - i), outBounce: Dt, inOutBounce: (i) => i < 0.5 ? (1 - Dt(1 - 2 * i)) / 2 : (1 + Dt(2 * i - 1)) / 2 };
function Js(i, t) {
  const e = $s[i];
  if (!e) throw Error(`Unknown easing function "${i}". Available easing functions: ${qs.join(", ")}.`);
  return e((function(s) {
    return Number.isNaN(s) ? 0 : s === 1 / 0 ? 1 : s === -1 / 0 ? 0 : X(s, 0, 1);
  })(t));
}
function jt(i) {
  return (i % 360 + 360) % 360 / 360;
}
function it(i = new Float32Array(16)) {
  return i[0] = 1, i[1] = 0, i[2] = 0, i[3] = 0, i[4] = 0, i[5] = 1, i[6] = 0, i[7] = 0, i[8] = 0, i[9] = 0, i[10] = 1, i[11] = 0, i[12] = 0, i[13] = 0, i[14] = 0, i[15] = 1, i;
}
function Oe(i, t, e, s = new Float32Array(16)) {
  let r = i[0] - t[0], n = i[1] - t[1], h = i[2] - t[2], a = Math.hypot(r, n, h);
  a === 0 ? h = 1 : (a = 1 / a, r *= a, n *= a, h *= a);
  let c = e[1] * h - e[2] * n, u = e[2] * r - e[0] * h, l = e[0] * n - e[1] * r;
  a = Math.hypot(c, u, l), a === 0 ? (c = 1, u = 0, l = 0) : (a = 1 / a, c *= a, u *= a, l *= a);
  const f = n * l - h * u, d = h * c - r * l, p = r * u - n * c;
  return s[0] = c, s[1] = f, s[2] = r, s[3] = 0, s[4] = u, s[5] = d, s[6] = n, s[7] = 0, s[8] = l, s[9] = p, s[10] = h, s[11] = 0, s[12] = -(c * i[0] + u * i[1] + l * i[2]), s[13] = -(f * i[0] + d * i[1] + p * i[2]), s[14] = -(r * i[0] + n * i[1] + h * i[2]), s[15] = 1, s;
}
class J {
  constructor(t = 0, e = 0, s = 0, r = 0, n = 0, h = 0, a = 0, c = 1, u = 0) {
    o(this, "Ii");
    o(this, "Bi");
    o(this, "Ni");
    o(this, "ji");
    o(this, "zi");
    o(this, "Qi");
    o(this, "Gi");
    o(this, "Hi");
    o(this, "Vi");
    this.Ii = t, this.Bi = e, this.Ni = s, this.ji = r, this.zi = n, this.Qi = h, this.Gi = a, this.Hi = c, this.Vi = u;
  }
  static Xi(t, e) {
    const s = t.Ki.Yi, r = t.Ki.Wi, n = t.Ki.Zi, h = t.Ki.$i, a = t.Ki.qi, c = t.Ki.Ji;
    if (t.Ki.ts) {
      const u = 0.5 * Math.max(1, e) / Math.tan(0.5 * t.Ki.ss);
      return new J(s, r, n + u, s, r, n, h, a, c);
    }
    return new J(t.Ki.es, t.Ki.rs, t.Ki.ns, s, r, n, h, a, c);
  }
  hs(t) {
    t.Ki.cs(this.Ii, this.Bi, this.Ni, this.ji, this.zi, this.Qi, this.Gi, this.Hi, this.Vi);
  }
  setPosition(t, e, s) {
    return this.Ii = t, this.Bi = e, this.Ni = s, this;
  }
  lookAt(t, e, s) {
    return this.ji = t, this.zi = e, this.Qi = s, this;
  }
  setUp(t, e, s) {
    return this.Gi = t, this.Hi = e, this.Vi = s, this;
  }
  move(t, e, s) {
    return this.Ii += t, this.Bi += e, this.Ni += s, this.ji += t, this.zi += e, this.Qi += s, this;
  }
  copy() {
    return new J(this.Ii, this.Bi, this.Ni, this.ji, this.zi, this.Qi, this.Gi, this.Hi, this.Vi);
  }
  get eyeX() {
    return this.Ii;
  }
  get eyeY() {
    return this.Bi;
  }
  get eyeZ() {
    return this.Ni;
  }
  get targetX() {
    return this.ji;
  }
  get targetY() {
    return this.zi;
  }
  get targetZ() {
    return this.Qi;
  }
  get upX() {
    return this.Gi;
  }
  get upY() {
    return this.Hi;
  }
  get upZ() {
    return this.Vi;
  }
}
class ti {
  constructor(t) {
    o(this, "us", null);
    o(this, "ts", !0);
    o(this, "es", 0);
    o(this, "rs", 0);
    o(this, "ns", 0);
    o(this, "Yi", 0);
    o(this, "Wi", 0);
    o(this, "Zi", 0);
    o(this, "$i", 0);
    o(this, "qi", 1);
    o(this, "Ji", 0);
    o(this, "ls", "perspective");
    o(this, "fs");
    o(this, "ds");
    o(this, "_s");
    this.ts = t.Ki.ts, this.es = t.Ki.es, this.rs = t.Ki.rs, this.ns = t.Ki.ns, this.Yi = t.Ki.Yi, this.Wi = t.Ki.Wi, this.Zi = t.Ki.Zi, this.$i = t.Ki.$i, this.qi = t.Ki.qi, this.Ji = t.Ki.Ji, t.Ki.ts || (this.us = new J(t.Ki.es, t.Ki.rs, t.Ki.ns, t.Ki.Yi, t.Ki.Wi, t.Ki.Zi, t.Ki.$i, t.Ki.qi, t.Ki.Ji)), t.Ki.ps ? this.ls = "ortho" : (this.ls = "perspective", this.fs = 180 * t.Ki.ss / Math.PI), this.ds = t.Ki.ds, this._s = t.Ki._s;
  }
  createCamera(t, e) {
    let s;
    if (this.ts) {
      const r = Math.max(1, t), n = this.fs ?? e, h = 0.5 * r / Math.tan(n * Math.PI / 360);
      s = new J(this.Yi, this.Wi, this.Zi + h, this.Yi, this.Wi, this.Zi, this.$i, this.qi, this.Ji);
    } else s = new J(this.es, this.rs, this.ns, this.Yi, this.Wi, this.Zi, this.$i, this.qi, this.Ji);
    return this.setCamera(s), s;
  }
  setCamera(t) {
    this.us = t, this.ts = !1, this.es = t.eyeX, this.rs = t.eyeY, this.ns = t.eyeZ, this.Yi = t.targetX, this.Wi = t.targetY, this.Zi = t.targetZ, this.$i = t.upX, this.qi = t.upY, this.Ji = t.upZ;
  }
  resetCamera() {
    this.us = null, this.ts = !0, this.es = 0, this.rs = 0, this.ns = 0, this.Yi = 0, this.Wi = 0, this.Zi = 0, this.$i = 0, this.qi = 1, this.Ji = 0;
  }
  camera(t, e, s, r = 0, n = 0, h = 0, a = 0, c = 1, u = 0) {
    this.us ? this.us.setPosition(t, e, s).lookAt(r, n, h).setUp(a, c, u) : this.us = new J(t, e, s, r, n, h, a, c, u), this.ts = !1, this.es = t, this.rs = e, this.ns = s, this.Yi = r, this.Wi = n, this.Zi = h, this.$i = a, this.qi = c, this.Ji = u;
  }
  lookAt(t, e, s, r, n, h) {
    this.us && (this.us.lookAt(t, e, s), r === void 0 && n === void 0 && h === void 0 || this.us.setUp(r ?? this.us.upX, n ?? this.us.upY, h ?? this.us.upZ)), this.Yi = t, this.Wi = e, this.Zi = s, r !== void 0 && (this.$i = r), n !== void 0 && (this.qi = n), h !== void 0 && (this.Ji = h);
  }
  perspective(t, e, s) {
    this.ls = "perspective", t !== void 0 && (this.fs = t), e !== void 0 && (this.ds = e), s !== void 0 && (this._s = s);
  }
  ortho(t, e) {
    this.ls = "ortho", t !== void 0 && (this.ds = t), e !== void 0 && (this._s = e);
  }
  getActiveCamera() {
    return this.us;
  }
  applyToState(t) {
    if (this.ls === "ortho" ? t.Ki.gs(this.ds, this._s) : t.Ki.vs(this.fs, this.ds, this._s), this.ts) return t.Ki.ws(), void (this.Yi === 0 && this.Wi === 0 && this.Zi === 0 && this.$i === 0 && this.qi === 1 && this.Ji === 0 || t.Ki.bs(this.Yi, this.Wi, this.Zi, this.$i, this.qi, this.Ji));
    t.Ki.cs(this.es, this.rs, this.ns, this.Yi, this.Wi, this.Zi, this.$i, this.qi, this.Ji);
  }
}
const ei = Object.freeze({ source: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAITElEQVR42u1d2XLkIAz0//909jWVHYPUhyR7SNXUHnhsDI3ULQlyXdf1s/usfiLtv6/5+/dPz4r0Y3XN6ru750fHIPv8u3FC3u/umt39b/oXf/nfN7gb0FU7OwBo+18gRiYrsgAQgN5dd7dYVAD4ND+jAJCxHp8GKfLyu9WwAyVjAVfvkgVA1PoEF5jfBUxpX012BphZAEdWPeviVgBYjVcYAHc3Qgc4stJUFijCAVgAZFwQyyEibYn+5VxAZFI+mTiFj4/4bYZEoi5gBzC1f9+12TiAyge6J5ABEEMCs8QPVTHI6qdUwPlc1OQP//gHTrEaoyuQsTCohagGohwACMPNtKOrbWfSMiSzkoMgZlwV6MrwmI8AWAVMMhoW9bXI5K6IJ6oCUAsTVUU7tZUNdBELdAYAohqZkZiR560UzK49S5KRMK4NANHViLQ7Qq27OACaC4ia2Kxejy4K9Pm0C+gEADIpWSugirQhk6/gANkwM8wBOkkgk0mrYvkulRCxUEggKwSAJ8jA8xkQB4iij5GBzPfQFZJZRVkFcwAgkmHZ2Ds6ic72iZHNEgBk0rUrQhm5PwqADEvPyrBpbg/mAKxpRy1AliDtJKEaAEiwZ8jk1yWDsjo840ZWQZcqAERkMds3hcqisoHsgxUVNRmXIBogqY9nXZCh7zNcABL0KVwlMoLXAYDNvY8WHkbKemQgq6OzcXxhJIuNhcv63wWIbCn6fySQKCgMmejM/RX+LZNZrOi/SmWoXMBtLmCVGmYA4ACMcsVMAQBjAYlnaAIpTNVrdMCZXHp2kBmAd/IAwJLWhVIzE6y0INn/V4Sqp1qAZU0gAwBV2bLLRLMAYAs+OjlAKBDEsGgFy87G29XZQLZ/T7iejgSez4vrAdQ6nSlbFpc90yQPLeqMhqpZl8Nsfr1QEuTy2Yr7u2QnS3JZ/hDc7Zutl7hSN6vQ8eo4APt8tcphikUjZedtAFBJJHQAIwOMvJ8SACxAkXR4CgBIPvppFgCNQ7ChcGV8JVqBBQPA6QLexgHU76cmgVsAOFhyhwpAq4YdKkB5f7sKOJ8vjwOoV7Di+24Vwuh0dyTUdU4hnAuokoWuegM3ANhcQQYUSLZ1HADYejxH/l6VDq7OpAp2ZnlMoKMkTKUymFWqyogqr0GJcZgDsBVD7CpRhaozGU3X1u8JpelbC5CNbLE6vhIAQKBEEiFU+/lSAOy2XrET5DbBLAl0Vy0r8gnEzqKjhU89gHDXzxM3SqjLtZxlXdbzAaZ03BEsYUPJkwBmPSAi6oPVMlC1c0eVDXRUPasKa5H7U7mA7kghuzFjSkWQas/CriAk+X49O2kqs3GZAyicoWoWALuCEDC0/TwLoNbZ3fUAbhlLA+AOZU/hAKpYv6peIQsCRRzj1AOczzkgYspBEGwkVHxCyTklY8r7ObalBUCE+XAHC6/YeNJdEeQCwKc+Bce/bkDRNOfTC0LcoeZsqvvPNVoL4NhfP7EghI1GqgtCiP2b+HZkpOyL3cvGxPrZgpCuI2LU+RoZAJjVs0NpJg6hjKUrK44mqYAlAM7niz8/5p/q41rVEUml9s+OD3JNevzeCoApRZfo+KAJJBgAUwI7VRM82QIorEV4nKoAkH3pae3oBGUBwFqMkQCIMGzFGX3KdvUEKayF8hmlLuCJAMhKMZVMc4OgjQMwgzuh3Ukgqwh2Kwf4hoyectNGmSXIsmaElKBFjVPaHeHeyBY2tsQsFQjqBsDKFyPtf/+faa8AwCqdOwIA7NFmb7IADAmMAmBVycOUrLcDYPfv3QS5vp9NOKE+OQpAdPPpsQBGC8BE6hRb1BTfScvALgBkfX8FB3DkBth0ehkAjgrwASAbhZSelloBgPPx//o5GwDeHgiKrLrdn2hpnCLZRM9BdS5gJXFW5m11XWSSdj5/Z14jnEFZt69wSwcACdmHWgD2bERXnUL4+m8DQEZ/Z0CgrpJmrz0AAE1+RnJWnSLKVj0tr/9WDpAxtQoOsNP/qLuQAcBZFDqZBLIWIJOwQQI5yuNkPj5nWlXwRFnIcADXOAlL1vpCnB3br9RxCjaQ5hif5LP0Z/CtMm+Mj1MBQGmhMlFRtwugAZA1K5HTw5UyR12QUXXyRwUJJFzOvuAAqUhBXjTKbhWrIlsRjBxyEbVgChk4HgDsCkYBpCi2QM8qrAoEkQTd7wJYADgiZegAdyalsiBOA8BBApUmXOmTK7JxFckggUyvy3M7Sp5cMq8znqEoT4MAMFlHuybQqTgq+se2X+zu2KrDE5nUavb+jj65+se2X4oOTQIBO6GVk6/qH9WOsHilj3ds3kSUhGLyO/sHtztkHCrlqgbQ/Xx3u7h/Wtnj1tEdPrvSJ7PjB9xfL3vcOnoSZ+kAhLJ/l0PaVehoVkZ1Ru4qDqtKy8A31PqrtHnX/ZtOUDsAOAA4ADgAcBzCGJGRbLLDcX/2/VyJG3sy6ADgywEw3UR3m/Dp5xyD/TsAOAA4ADgAmBToyUbCIhs4VKXq6tPBs+OIhI03+zXqfgGCa3/8FAAoSBwzRnQouPMwY5YJdwMA7T8LgGgCaGEN+s+yZe+9A4DbvzP9VwAgulN5uS9APfFoiZkaALvVkl2pUw57Xh0pG60n+OgC3D+OAfx2AEhIYPXPFAC4t2NXAQAmgT8P/+nmAN0AsJNA51k2lS7njjeo3rETANE9nTfvrdvZw1TsdKiMNwFgNdEbEOj29nVsbcq4COZI1SpSrJ787TXVAZ0pvzTpLQCITP7yWjbf3g2Abg4wJRAEcwA1ANCyZufKcXKACaFgigM4AIBmCx0VMSwHqN7fzxxjN4IDOFfTkwpLK9PBDAf4BzY4SAYFZUTuAAAAAElFTkSuQmCC", columns: 16, rows: 16, map: `☺☻♥♦♣♠•◘○◙♂♀♪♫☼
►◄↕‼¶§▬↨↑↓→←∟↔▲▼
 !"#$%&'()*+,-./
0123456789:;<=>?
@ABCDEFGHIJKLMNO
PQRSTUVWXYZ[\\]^_
\`abcdefghijklmno
pqrstuvwxyz{|}~⌂
ÇüéâäàåçêëèïîìÄÅ
ÉæÆôöòûùÿÖÜ¢£¥₧ƒ
áíóúñÑªº¿⌐¬½¼¡«»
░▒▓│┤╡╢╖╕╣║╗╝╜╛┐
└┴┬├─┼╞╟╚╔╩╦╠═╬╧
╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀
αßΓπΣσµτΦΘΩδ∞φε∩
≡±≥≤⌠⌡÷≈°∙·√ⁿ²■□
` });
class j {
  constructor(t, e = {}) {
    o(this, "Ms");
    o(this, "As");
    o(this, "Cs");
    o(this, "l");
    o(this, "_");
    o(this, "Ss");
    o(this, "xt");
    o(this, "Es");
    o(this, "H");
    o(this, "Fs");
    o(this, "Ts");
    o(this, "bt");
    o(this, "Ps");
    o(this, "Ls");
    o(this, "Ds");
    o(this, "ks");
    o(this, "Rs", () => {
    });
    o(this, "Os", () => {
    });
    o(this, "Is", []);
    o(this, "Bs", []);
    o(this, "Ns", !1);
    o(this, "js", !1);
    o(this, "zs");
    o(this, "Qs");
    o(this, "Gs", /* @__PURE__ */ new Map());
    this.H = t, this.Ms = e.visible ?? !0, this.As = e.opacity ?? 1;
    const s = e.blendMode ?? L.NORMAL;
    this.Cs = L.NORMAL, j.Hs(s) && (this.Cs = typeof s == "string" ? Ot.get(s) : s), pt.Pi(j.Hs(s), `Invalid blend mode. Expected one of: ${Gt.join(", ")} or a LayerBlendMode constant (e.g. t.BLEND_ADDITIVE).`, { method: "constructor", property: "blendMode", providedValue: e.blendMode });
    const r = e.fontSize ?? 16;
    this.xt = Math.abs(r), this.Qs = e.fontSize !== void 0, pt.Pi(typeof r == "number", "Font size must be a number.", { method: "fontSize", providedValue: r }), this.l = e.offsetX ?? 0, this._ = e.offsetY ?? 0, this.Ss = e.rotationZ ?? 0;
    const n = e.fontSource;
    this.Es = n, this.bt = n instanceof N || n instanceof Y ? n : n === void 0 ? new Y(t, this.xt, ei) : new N(t, this.xt), this.zs = new ti(t.state);
  }
  async Vs(t) {
    if (this.Fs = t, this.Es instanceof N || this.Es instanceof Y) {
      this.Es.Pt || await this.Es.kt();
      const r = this.Es, n = r.Lt({ fontSize: this.Xs(r) });
      this.Ys(n);
    }
    this.bt.Pt || (this.bt instanceof N ? await this.bt.kt(this.Es) : await this.bt.kt());
    const e = this.bt.maxGlyphDimensions;
    this.Ts = new Ds(this.Fs.canvas.canvas, e.width, e.height);
    const s = this.Ts;
    this.Ps = this.Fs.createFramebuffer(s.cols, s.rows, 3), this.Ls = this.Fs.createFramebuffer(s.width, s.height, 1, { depth: !1 }), this.Ds = this.Fs.createFramebuffer(s.width, s.height, 1, { depth: !1 }), this.ks = [this.Fs.createFramebuffer(s.width, s.height, 1, { depth: !1 }), this.Fs.createFramebuffer(s.width, s.height, 1, { depth: !1 })], this.Ts.S(() => {
      var r, n, h;
      this.Ps.resize(this.Ts.cols, this.Ts.rows), this.Ls.resize(this.Ts.width, this.Ts.height), (r = this.Ds) == null || r.resize(this.Ts.width, this.Ts.height), (n = this.ks) == null || n[0].resize(this.Ts.width, this.Ts.height), (h = this.ks) == null || h[1].resize(this.Ts.width, this.Ts.height);
    });
  }
  draw(t) {
    this.Rs = t;
  }
  postDraw(t) {
    this.Os = t;
  }
  show() {
    this.Ms = !0;
  }
  hide() {
    this.Ms = !1;
  }
  opacity(t) {
    if (t === void 0) return this.As;
    this.As = X(t, 0, 1);
  }
  blendMode(t) {
    if (t === void 0) return this.Cs;
    pt.Pi(j.Hs(t), `Invalid blend mode. Expected one of: ${Gt.join(", ")} or a LayerBlendMode constant (e.g. t.BLEND_ADDITIVE).`, { method: "blendMode", providedValue: t }) && (this.Cs = typeof t == "string" ? Ot.get(t) : t);
  }
  offset(t, e = 0) {
    if (t === void 0) return { x: this.l, y: this._ };
    this.l = t, this._ = e;
  }
  rotateZ(t) {
    if (t === void 0) return this.Ss;
    this.Ss = t;
  }
  createCamera() {
    var s;
    const t = this.Ks(), e = 180 * (((s = this.Fs) == null ? void 0 : s.renderer.state.Ki.ss) ?? Math.PI / 4) / Math.PI;
    return this.zs.createCamera(t.height, e);
  }
  setCamera(t) {
    this.zs.setCamera(t), this.Ws();
  }
  resetCamera() {
    this.zs.resetCamera(), this.Ws();
  }
  camera(t, e, s, r = 0, n = 0, h = 0, a = 0, c = 1, u = 0) {
    this.zs.camera(t, e, s, r, n, h, a, c, u), this.Ws();
  }
  lookAt(t, e, s, r, n, h) {
    this.zs.lookAt(t, e, s, r, n, h), this.Ws();
  }
  perspective(t, e, s) {
    this.zs.perspective(t, e, s), this.Ws();
  }
  ortho(t, e) {
    this.zs.ortho(t, e), this.Ws();
  }
  Zs() {
    return this.zs.getActiveCamera();
  }
  filter(t, e) {
    (this.Ns ? this.Bs : this.Is).push({ name: t, params: e });
  }
  setPluginState(t, e) {
    this.Gs.set(t, e);
  }
  getPluginState(t) {
    return this.Gs.get(t);
  }
  hasPluginState(t) {
    return this.Gs.has(t);
  }
  deletePluginState(t) {
    return this.Gs.delete(t);
  }
  fontSize(t) {
    if (t === void 0) return this.bt.fontSize;
    if (!pt.Pi(typeof t == "number", "Font size must be a number.", { method: "fontSize", providedValue: t })) return;
    const e = Math.abs(t);
    this.bt.fontSize !== e && (this.Qs = !0, this.xt = e, this.bt.It(e), this.$s());
  }
  useTileColors(t) {
    if (t === void 0) return this.js;
    this.js = t;
  }
  async loadFont(t) {
    if (!this.bt) throw Error("Layer font not initialized. Ensure layer is attached before loading fonts.");
    if (t instanceof N) {
      t.Pt || await t.kt();
      const e = t, s = e.Lt({ fontSize: this.Xs(e) });
      this.Ys(s);
    } else if (this.bt instanceof N) await this.bt.Bt(t);
    else {
      const e = new N(this.H, this.bt.fontSize);
      await e.kt(t), this.Ys(e);
    }
    return this.Es = t, this.xt = this.bt.fontSize, this.$s(), this.bt;
  }
  async loadTileset(t) {
    if (!this.bt) throw Error("Layer font not initialized. Ensure layer is attached before loading tilesets.");
    if (t instanceof Y) {
      t.Pt || await t.kt();
      const e = t.Lt({ fontSize: this.Xs(t) });
      this.Ys(e);
    } else {
      const e = this.Qs ? this.xt : t.fontSize, s = new Y(this.H, e, t);
      await s.kt(), this.Ys(s);
    }
    return this.Es = t, this.xt = this.bt.fontSize, this.$s(), this.bt;
  }
  qs(t, e, s = {}) {
    if (!this.Ms || !this.Ps || !this.Ls) return;
    const r = this.Fs.renderer, n = this.Ts, h = s.skipPluginHooks ?? !1;
    h || t.te.Js(this);
    try {
      let a = !1;
      try {
        this.Ps.begin(), a = !0, r.state.se.ie(), r.state.ee(), this.zs.applyToState(r.state), t.re = this, this.Rs.call(t);
      } finally {
        t.re = void 0, a && this.Ps.end();
      }
      h || t.te.ne(this);
      const c = this.Is.length > 0, u = c ? this.Ds : this.Ls;
      let l = !1;
      try {
        u.begin(), l = !0, r.he(e), e.oe({ u_characterTexture: this.bt.framebuffer, u_charsetDimensions: [this.bt.textureColumns, this.bt.textureRows], Ur: this.Ps.textures[0], Us: this.Ps.textures[1], Ut: this.Ps.textures[2], Uu: !(this.bt instanceof Y && this.js), Uv: [n.cols, n.rows], Uw: [u.width, u.height], Ux: [0, 0, 0, 0] }), r.ae(0, 0, n.width, n.height);
      } finally {
        l && u.end();
      }
      c && this.Fs.filterManager.ce(this.Ds.textures[0], this.Ls, this.Is, this.Ls.width, this.Ls.height, this.ks);
      try {
        this.Ns = !0, t.re = this, this.Os.call(t);
      } finally {
        this.Ns = !1, t.re = void 0;
      }
      this.Bs.length > 0 && this.Fs.filterManager.ce(this.Ls.textures[0], this.Ls, this.Bs, this.Ls.width, this.Ls.height, this.ks);
    } finally {
      this.Is = [], this.Bs = [], this.Ns = !1;
    }
  }
  ue() {
    var t;
    this.Ps && this.Ls && ((t = this.Ts) == null || t.reset());
  }
  L() {
    var t, e, s, r, n, h, a;
    (t = this.Ps) == null || t.dispose(), (e = this.Ls) == null || e.dispose(), (s = this.Ds) == null || s.dispose(), (r = this.ks) == null || r[0].dispose(), (n = this.ks) == null || n[1].dispose(), (h = this.bt) == null || h.dispose(), (a = this.Ts) == null || a.L();
  }
  get texture() {
    var t;
    return (t = this.Ls) == null ? void 0 : t.textures[0];
  }
  get grid() {
    return this.Ts;
  }
  get font() {
    return this.bt;
  }
  get width() {
    return this.Ls ? this.Ls.width : 0;
  }
  get height() {
    return this.Ls ? this.Ls.height : 0;
  }
  get drawFramebuffer() {
    return this.Ps;
  }
  get asciiFramebuffer() {
    return this.Ls;
  }
  $s() {
    if (!this.Ts || !this.bt) return;
    const t = this.bt.maxGlyphDimensions;
    this.Ts.U(t.width, t.height), this.Ps && this.Ls && this.ue();
  }
  static Hs(t) {
    return typeof t == "number" ? Ws.has(t) : typeof t == "string" && Ot.has(t);
  }
  Ys(t) {
    (this.Es instanceof N || this.Es instanceof Y) && this.bt === this.Es || this.bt === t || this.bt.dispose(), this.bt = t;
  }
  Xs(t) {
    return this.Qs ? this.xt : t.fontSize;
  }
  Ws() {
    this.zs.applyToState(this.Fs.renderer.state);
  }
  Ks() {
    var s, r, n, h;
    if (this.Ps) return { width: Math.max(1, this.Ps.width), height: Math.max(1, this.Ps.height) };
    if (this.Ts) return { width: Math.max(1, this.Ts.cols), height: Math.max(1, this.Ts.rows) };
    const t = ((s = this.Fs) == null ? void 0 : s.renderer.context.canvas.width) ?? ((r = this.Fs) == null ? void 0 : r.canvas.width) ?? 1, e = ((n = this.Fs) == null ? void 0 : n.renderer.context.canvas.height) ?? ((h = this.Fs) == null ? void 0 : h.canvas.height) ?? 1;
    return { width: Math.max(1, t), height: Math.max(1, e) };
  }
}
class ns {
  constructor(t) {
    o(this, "le");
    o(this, "fe");
    o(this, "Rs");
    o(this, "Pt", !1);
    this.le = t;
  }
  draw(t) {
    this.Rs = t;
  }
  async kt() {
    if (this.Pt) return;
    const t = this.de();
    this.fe = t, this.Pt = !0;
  }
  L() {
    var t;
    this.Pt && ((t = this.fe) == null || t.L(), this.Pt = !1);
  }
  _e(t, e) {
    const s = this.fe;
    s.show(), s.draw(() => {
      this.le.clear(), this.le.push();
      try {
        (this.Rs || t)(e), this.pe(e);
      } finally {
        this.le.pop();
      }
    });
  }
  pe(t) {
    const { textmodifier: e, grid: s } = t, r = [116, 101, 120, 116, 109, 111, 100, 101, 46, 106, 115].map((c) => String.fromCharCode(c)).join(""), n = (s.rows + 1 >> 1) - 2, h = 2 - (s.cols + 1 >> 1), a = [[142, 249, 243], [241, 91, 181], [255, 155, 113]];
    e.push(), e.translate(h, n, 0);
    for (let c = 0; c < r.length; c++) {
      const u = r[c], l = Math.floor(0.1 * e.frameCount + 0.5 * c) % a.length, [f, d, p] = a[l], y = e.color(f, d, p);
      e.charColor(y), e.char(u), e.point(), e.translateX(1);
    }
    e.pop();
  }
}
function mt(i, t, e) {
  (function(s, r, n, h) {
    s.push(), s.translate(n, h, 0);
    for (const a of r) s.char(a), s.rect(1, 1), s.translateX(1);
    s.pop();
  })(i, t, -Math.floor(t.length / 2), e);
}
const si = ({ textmodifier: i, grid: t, errorTitle: e, errorMessage: s }) => {
  i.background("#222323"), i.cellColor("#222323"), i.charColor("#FF6B6B"), mt(i, "X", -2), mt(i, e || "SKETCH ERROR", 0), i.charColor("#C0C0C0");
  const r = s || "Unknown error", n = Math.floor(0.8 * t.cols), h = ke(r, n), a = h.slice(0, 3);
  h.length > 3 && (a[2] = a[2].substring(0, n - 3) + "..."), a.forEach((l, f) => {
    mt(i, l, 3 + f);
  });
  const c = ke("CHECK CONSOLE FOR DETAILS", n), u = 5 + a.length;
  c.forEach((l, f) => {
    mt(i, l, u + f);
  });
}, ke = (i, t) => {
  const e = i.split(" "), s = [];
  let r = "";
  for (const n of e) (r + " " + n).length <= t ? r = r ? r + " " + n : n : (r && s.push(r), r = n);
  return r && s.push(r), s;
};
class hs extends ns {
  constructor(e) {
    super(e);
    o(this, "me", "inactive");
    o(this, "ge", "SKETCH ERROR");
    o(this, "ve", "Unknown error");
    o(this, "ye", "");
  }
  async kt() {
    this.Pt || (await super.kt(), this.fe.opacity(1), this.fe.hide());
  }
  get we() {
    return this.Pt && this.me === "active";
  }
  be(e) {
    this.Me(e), this.Pt && (this.fe.opacity(1), this.fe.show());
  }
  Ae() {
    this.we && this.xe();
  }
  L() {
    super.L();
  }
  de() {
    return new j(this.le.H, { visible: !0, opacity: 1 });
  }
  xe() {
    const e = { textmodifier: this.le, grid: this.fe.grid, errorTitle: this.ge, errorMessage: this.ve, errorDetails: this.ye || void 0 };
    this._e(si, e);
  }
  Me(e) {
    var s;
    if (this.me = "active", e instanceof Error) {
      const r = (s = e.name) != null && s.trim() ? e.name.trim().toUpperCase() : "SKETCH ERROR";
      return this.ge = r.endsWith("ERROR") ? r : r + " ERROR", this.ve = e.message || "Unknown error", void (this.ye = e.stack || "");
    }
    if (typeof e == "string") return this.ge = "SKETCH ERROR", this.ve = e || "Unknown error", void (this.ye = "");
    this.ge = "SKETCH ERROR", this.ve = "Unknown error", this.ye = "";
  }
}
const Or = Object.freeze(Object.defineProperty({ __proto__: null, ErrorLayerController: hs, TextmodeError: E, TextmodeErrorLevel: rs }, Symbol.toStringTag, { value: "Module" }));
function os(i, t) {
  i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, 1), i.texImage2D(i.TEXTURE_2D, 0, i.RGBA, i.RGBA, i.UNSIGNED_BYTE, t);
}
function as(i) {
  if (i instanceof HTMLVideoElement) return i.readyState >= i.HAVE_CURRENT_DATA && i.videoWidth > 0 && i.videoHeight > 0;
  const { width: t, height: e } = ls(i);
  return t > 0 && e > 0;
}
function Kt(i, t, e) {
  as(e) && (i.bindTexture(i.TEXTURE_2D, t), os(i, e), i.bindTexture(i.TEXTURE_2D, null));
}
function ve(i, t, e = i.NEAREST, s = i.NEAREST, r = i.CLAMP_TO_EDGE, n = i.CLAMP_TO_EDGE) {
  const h = i.createTexture();
  i.bindTexture(i.TEXTURE_2D, h), cs(i, e, s, r, n), as(t) ? os(i, t) : (function(u) {
    u.texImage2D(u.TEXTURE_2D, 0, u.RGBA, 1, 1, 0, u.RGBA, u.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
  })(i), i.bindTexture(i.TEXTURE_2D, null);
  const { width: a, height: c } = ls(t);
  return { texture: h, width: Math.max(1, a), height: Math.max(1, c) };
}
function cs(i, t, e, s, r) {
  i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MIN_FILTER, t), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MAG_FILTER, e), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_S, s), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_T, r);
}
function Rt(i, t, e, s, r, n = 0, h = i.FLOAT, a = !1) {
  i.enableVertexAttribArray(t), i.vertexAttribPointer(t, e, h, a, s, r), i.vertexAttribDivisor(t, n);
}
function ae(i, t, e, s, r) {
  i.bindBuffer(t, e), i.bufferData(t, s, r), i.bindBuffer(t, null);
}
function ls(i) {
  let t = 0, e = 0;
  return i instanceof HTMLVideoElement ? (t = i.videoWidth, e = i.videoHeight) : i instanceof HTMLImageElement ? (t = i.naturalWidth, e = i.naturalHeight) : i instanceof HTMLCanvasElement && (t = i.width, e = i.height), { width: t, height: e };
}
class gt extends Ft {
  constructor(e, s, r = s, n = 1, h = {}, a) {
    super();
    o(this, "o");
    o(this, "u");
    o(this, "Zt");
    o(this, "Ce");
    o(this, "V");
    o(this, "Se", []);
    o(this, "Ee", null);
    o(this, "Fe");
    o(this, "H");
    o(this, "Te", null);
    o(this, "Pe", /* @__PURE__ */ new Map());
    this.o = s, this.u = r, this.Ce = e, this.Fe = X(n, 1, 8), this.H = a, this.Zt = { filter: "nearest", wrap: "clamp", type: "unsigned_byte", depth: !0, ...h };
    const c = e.getParameter(e.MAX_DRAW_BUFFERS), u = e.getParameter(e.MAX_COLOR_ATTACHMENTS);
    this.Fe = Math.min(this.Fe, c, u), this.V = e.createFramebuffer(), this.Le(), this.De(), this.Zt.depth && this.ke();
  }
  Le() {
    const e = this.Ce, s = this.Zt.filter === "linear" ? e.LINEAR : e.NEAREST, r = this.Zt.wrap === "repeat" ? e.REPEAT : e.CLAMP_TO_EDGE;
    for (let n = 0; n < this.Fe; n++) {
      const h = e.createTexture();
      e.bindTexture(e.TEXTURE_2D, h), cs(e, s, s, r, r), this.Re(h, !1), this.Se.push(h);
    }
    e.bindTexture(e.TEXTURE_2D, null);
  }
  Re(e, s = !0) {
    const r = this.Ce, n = this.Zt.type === "float" ? r.FLOAT : r.UNSIGNED_BYTE, h = n === r.FLOAT ? r.RGBA32F : r.RGBA8, a = r.RGBA;
    s && r.bindTexture(r.TEXTURE_2D, e), r.texImage2D(r.TEXTURE_2D, 0, h, this.o, this.u, 0, a, n, null);
  }
  De() {
    const e = this.Ce;
    if (e.bindFramebuffer(e.FRAMEBUFFER, this.V), this.Fe === 1) e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, this.Se[0], 0);
    else {
      const s = [];
      for (let r = 0; r < this.Fe; r++) {
        const n = e.COLOR_ATTACHMENT0 + r;
        e.framebufferTexture2D(e.FRAMEBUFFER, n, e.TEXTURE_2D, this.Se[r], 0), s.push(n);
      }
      e.drawBuffers(s);
    }
    e.bindFramebuffer(e.FRAMEBUFFER, null);
  }
  ke() {
    const e = this.Ce;
    this.Ee = e.createRenderbuffer(), this.Oe(), e.bindFramebuffer(e.FRAMEBUFFER, this.V), e.framebufferRenderbuffer(e.FRAMEBUFFER, e.DEPTH_ATTACHMENT, e.RENDERBUFFER, this.Ee), e.bindFramebuffer(e.FRAMEBUFFER, null);
  }
  Oe() {
    if (!this.Ee) return;
    const e = this.Ce;
    e.bindRenderbuffer(e.RENDERBUFFER, this.Ee), e.renderbufferStorage(e.RENDERBUFFER, e.DEPTH_COMPONENT24, this.o, this.u), e.bindRenderbuffer(e.RENDERBUFFER, null);
  }
  $(e) {
    Kt(this.Ce, this.Se[0], e);
  }
  resize(e, s) {
    this.o = e, this.u = s, this.Pe.clear();
    const r = this.Ce;
    for (const n of this.Se) this.Re(n, !0);
    r.bindTexture(r.TEXTURE_2D, null), this.Oe(), this.Te = null;
  }
  readPixels(e) {
    const s = this.Pe.get(e);
    if (s) return s;
    const r = this.Ce, n = this.o, h = this.u, a = new Uint8Array(n * h * 4), c = r.getParameter(r.READ_FRAMEBUFFER_BINDING);
    r.bindFramebuffer(r.READ_FRAMEBUFFER, this.V), r.readBuffer(r.COLOR_ATTACHMENT0 + e), r.readPixels(0, 0, n, h, r.RGBA, r.UNSIGNED_BYTE, a), r.bindFramebuffer(r.READ_FRAMEBUFFER, c);
    const u = 4 * n, l = new Uint8Array(a.length);
    for (let f = 0; f < h; f++) {
      const d = (h - 1 - f) * u, p = f * u;
      l.set(a.subarray(d, d + u), p);
    }
    return this.Pe.set(e, l), l;
  }
  begin() {
    const e = this.Ce;
    this.Pe.clear(), this.H.Ie(), this.H.Be(this.V, this.o, this.u, this.Fe), this.Zt.depth && e.clear(e.DEPTH_BUFFER_BIT), this.H.state.Ne();
  }
  end() {
    this.H.state.je(), this.H.ze(), this.H.Qe();
  }
  Ge() {
    return this.Te || this.He(), this.Te;
  }
  He() {
    if (!this.H) return;
    const e = this.Fe > 1, s = this.Fe > 2, r = this.Fe > 3, n = { U1: this.Se[0], U2: e ? this.Se[1] : this.Se[0], U3: s ? this.Se[2] : this.Se[0], U4: r ? this.Se[3] : this.Se[0], U5: [this.o, this.u], U6: e, U7: s, U8: r }, h = this.H.materialManager.Ve;
    this.Te = this.H.materialManager.Xe(h, n);
  }
  dispose() {
    const e = this.Ce;
    e.deleteFramebuffer(this.V), this.Se.forEach((s) => {
      e.deleteTexture(s);
    }), this.Ee && e.deleteRenderbuffer(this.Ee), super.dispose();
  }
  get width() {
    return this.o;
  }
  get height() {
    return this.u;
  }
  get framebuffer() {
    return this.V;
  }
  get textures() {
    return this.Se;
  }
  get attachmentCount() {
    return this.Fe;
  }
}
function Ct(i) {
  return typeof i == "object" && i !== null && "textures" in i && Array.isArray(i.textures);
}
class rt extends Ft {
  constructor(e, s, r) {
    super();
    o(this, "Ce");
    o(this, "Ye");
    o(this, "Ke", /* @__PURE__ */ new Map());
    o(this, "We", /* @__PURE__ */ new Map());
    o(this, "Ze", /* @__PURE__ */ new Map());
    o(this, "$e", 0);
    o(this, "qe", /* @__PURE__ */ new Map());
    o(this, "Je");
    this.Ce = e, this.Je = e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS) ?? 16, this.Ye = this.tr(s, r), this.ir();
  }
  ir() {
    const e = this.Ce.getProgramParameter(this.Ye, this.Ce.ACTIVE_UNIFORMS);
    for (let s = 0; s < e; s++) {
      const r = this.Ce.getActiveUniform(this.Ye, s);
      if (r) {
        const n = r.name.replace(/\[0\]$/, ""), h = this.Ce.getUniformLocation(this.Ye, n);
        h && (this.Ke.set(n, h), this.We.set(n, { type: r.type, size: r.size }));
      }
    }
  }
  tr(e, s) {
    const r = this.sr(this.Ce.VERTEX_SHADER, e), n = this.sr(this.Ce.FRAGMENT_SHADER, s), h = this.Ce.createProgram();
    if (!h) throw Error("Failed to create WebGL program");
    if (this.Ce.attachShader(h, r), this.Ce.attachShader(h, n), this.Ce.linkProgram(h), !this.Ce.getProgramParameter(h, this.Ce.LINK_STATUS)) {
      const a = this.Ce.getProgramInfoLog(h);
      throw Error("Shader program link error: " + a);
    }
    return this.Ce.deleteShader(r), this.Ce.deleteShader(n), h;
  }
  sr(e, s) {
    const r = this.Ce.createShader(e);
    if (!r) throw Error("Failed to create shader of type " + e);
    if (this.Ce.shaderSource(r, s), this.Ce.compileShader(r), !this.Ce.getShaderParameter(r, this.Ce.COMPILE_STATUS)) {
      const n = this.Ce.getShaderInfoLog(r);
      throw this.Ce.deleteShader(r), Error("Shader compilation error: " + n);
    }
    return r;
  }
  er() {
    this.Ce.useProgram(this.Ye), this.rr();
  }
  rr() {
    this.$e = 0, this.qe.clear();
    for (const [e, s] of this.Ze) (s instanceof WebGLTexture || Ct(s)) && this.Ze.delete(e);
  }
  oe(e) {
    for (const s in e) this.nr(s, e[s]);
  }
  nr(e, s) {
    const r = this.Ke.get(e);
    if (!r) return;
    const n = this.Ze.get(e);
    let h = !0;
    if (n !== void 0 && (typeof s == "number" || typeof s == "boolean" ? n === s && (h = !1) : (s instanceof WebGLTexture || Ct(s)) && n === s && (h = !1)), !h) return;
    typeof s == "number" || typeof s == "boolean" || s instanceof WebGLTexture || Ct(s) ? this.Ze.set(e, s) : this.Ze.delete(e);
    const a = this.We.get(e);
    if (!a) return;
    const { type: c, size: u } = a, l = this.Ce;
    if (s instanceof WebGLTexture) {
      const f = this.hr(e);
      return l.uniform1i(r, f), l.activeTexture(l.TEXTURE0 + f), void l.bindTexture(l.TEXTURE_2D, s);
    }
    if (Ct(s)) {
      const f = this.hr(e);
      return l.uniform1i(r, f), l.activeTexture(l.TEXTURE0 + f), void l.bindTexture(l.TEXTURE_2D, s.textures[0]);
    }
    if (typeof s != "number") if (typeof s != "boolean") if (Array.isArray(s) && Array.isArray(s[0])) {
      const f = s.flat();
      switch (c) {
        case l.FLOAT_VEC2:
          l.uniform2fv(r, f);
          break;
        case l.FLOAT_VEC3:
          l.uniform3fv(r, f);
          break;
        case l.FLOAT_VEC4:
          l.uniform4fv(r, f);
      }
    } else {
      const f = s;
      switch (c) {
        case l.FLOAT:
          u > 1 ? l.uniform1fv(r, f) : l.uniform1f(r, f[0]);
          break;
        case l.FLOAT_VEC2:
          l.uniform2fv(r, f);
          break;
        case l.FLOAT_VEC3:
          l.uniform3fv(r, f);
          break;
        case l.FLOAT_VEC4:
          l.uniform4fv(r, f);
          break;
        case l.INT:
          u > 1 ? l.uniform1iv(r, f) : l.uniform1i(r, f[0]);
          break;
        case l.INT_VEC2:
          l.uniform2iv(r, f);
          break;
        case l.INT_VEC3:
          l.uniform3iv(r, f);
          break;
        case l.INT_VEC4:
          l.uniform4iv(r, f);
          break;
        case l.BOOL:
          l.uniform1iv(r, f);
          break;
        case l.FLOAT_MAT2:
          l.uniformMatrix2fv(r, !1, f);
          break;
        case l.FLOAT_MAT3:
          l.uniformMatrix3fv(r, !1, f);
          break;
        case l.FLOAT_MAT4:
          l.uniformMatrix4fv(r, !1, f);
      }
    }
    else l.uniform1i(r, s ? 1 : 0);
    else c === l.INT || c === l.BOOL ? l.uniform1i(r, s) : l.uniform1f(r, s);
  }
  hr(e) {
    const s = this.qe.get(e);
    if (s !== void 0) return s;
    if (this.$e >= this.Je) throw Error(`[textmode.js] Shader attempted to bind more than ${this.Je} texture samplers. Uniform "${e}" cannot be assigned.`);
    const r = this.$e++;
    return this.qe.set(e, r), r;
  }
  get program() {
    return this.Ye;
  }
  dispose() {
    this.Ce.deleteProgram(this.Ye), super.dispose();
  }
}
const us = /* @__PURE__ */ new WeakMap();
function te(i, t) {
  us.set(i, t);
}
function fs(i) {
  return us.get(i);
}
const ii = [255, 255, 255, 255], ri = [360, 100, 100, 1];
function ds(i) {
  return [(t = i === "rgb" ? ii : ri)[0], t[1], t[2], t[3]];
  var t;
}
function ce() {
  return { mode: "rgb", maxes: ds("rgb") };
}
function le(i, t) {
  return Number.isNaN(i) ? 0 : X(i, 0, t) / t;
}
function _t(i, t) {
  return Math.round(255 * le(i, t));
}
function ps(i, t) {
  return _t(i ?? t, t);
}
function ee(i, t, e) {
  return e < 0 && (e += 1), e > 1 && (e -= 1), e < 1 / 6 ? i + 6 * (t - i) * e : e < 0.5 ? t : e < 2 / 3 ? i + (t - i) * (2 / 3 - e) * 6 : i;
}
function ni(i, t, e, s, r) {
  if (Array.isArray(i)) {
    if (i.length < 3) throw Error("Component tuples must include at least RGB values.");
    return Ne(i[0], i[1], i[2], i.length === 4 ? i[3] : void 0, r);
  }
  return typeof t == "number" && typeof e == "number" ? Ne(i, t, e, s, r) : (function(n, h, a) {
    const c = a.mode === "rgb" ? a.maxes[0] : a.maxes[2], u = _t(n, c);
    return [u, u, u, ps(h, a.maxes[3])];
  })(i, t ?? s, r);
}
function Ne(i, t, e, s, r) {
  const [n, h, a, c] = r.maxes, u = ps(s, c);
  if (r.mode === "rgb") return [_t(i, n), _t(t, h), _t(e, a), u];
  const l = (d = n, Number.isNaN(f = i) ? 0 : (f % d + d) % d / d);
  var f, d;
  const p = le(t, h), y = le(e, a), [w, v, g] = r.mode === "hsb" ? (function(b, A, x) {
    if (A === 0) return [x, x, x];
    const C = 6 * b, R = Math.floor(C), T = C - R, M = x * (1 - A), F = x * (1 - T * A), P = x * (1 - (1 - T) * A);
    switch (R % 6) {
      case 0:
        return [x, P, M];
      case 1:
        return [F, x, M];
      case 2:
        return [M, x, P];
      case 3:
        return [M, F, x];
      case 4:
        return [P, M, x];
      default:
        return [x, M, F];
    }
  })(l, p, y) : (function(b, A, x) {
    if (A === 0) return [x, x, x];
    const C = x < 0.5 ? x * (1 + A) : x + A - x * A, R = 2 * x - C;
    return [ee(R, C, b + 1 / 3), ee(R, C, b), ee(R, C, b - 1 / 3)];
  })(l, p, y);
  return [Math.round(255 * w), Math.round(255 * v), Math.round(255 * g), u];
}
class hi {
  constructor() {
    o(this, "ar", 0);
    o(this, "cr", 0);
    o(this, "ur", 0);
    o(this, "lr", 0);
    o(this, "dr", 0);
    o(this, "_r", 0);
    o(this, "pr", 1);
    o(this, "mr", 1);
    o(this, "gr", 1);
    o(this, "vr", it());
    o(this, "yr", it());
    o(this, "wr", it());
  }
  br(t) {
    t.ar = this.ar, t.cr = this.cr, t.ur = this.ur, t.lr = this.lr, t.dr = this.dr, t._r = this._r, t.pr = this.pr, t.mr = this.mr, t.gr = this.gr;
    for (let e = 0; e < 16; e++) t.vr[e] = this.vr[e];
  }
  Mr(t) {
    this.ar = t.ar, this.cr = t.cr, this.ur = t.ur, this.lr = t.lr, this.dr = t.dr, this._r = t._r, this.pr = t.pr, this.mr = t.mr, this.gr = t.gr;
    for (let e = 0; e < 16; e++) this.vr[e] = t.vr[e];
  }
  Ar(t = 0, e = 0, s = 0) {
    t === 0 && e === 0 && s === 0 || (this.yr[0] = 1, this.yr[1] = 0, this.yr[2] = 0, this.yr[3] = 0, this.yr[4] = 0, this.yr[5] = 1, this.yr[6] = 0, this.yr[7] = 0, this.yr[8] = 0, this.yr[9] = 0, this.yr[10] = 1, this.yr[11] = 0, this.yr[12] = t, this.yr[13] = e, this.yr[14] = s, this.yr[15] = 1, this.Cr(this.yr));
  }
  Sr(t, e, s) {
    const r = e === void 0 ? t : e, n = s === void 0 ? e === void 0 ? t : 1 : s;
    t === 1 && r === 1 && n === 1 || (this.yr[0] = t, this.yr[1] = 0, this.yr[2] = 0, this.yr[3] = 0, this.yr[4] = 0, this.yr[5] = r, this.yr[6] = 0, this.yr[7] = 0, this.yr[8] = 0, this.yr[9] = 0, this.yr[10] = n, this.yr[11] = 0, this.yr[12] = 0, this.yr[13] = 0, this.yr[14] = 0, this.yr[15] = 1, this.Cr(this.yr));
  }
  Er(t) {
    if (t === 0) return;
    const e = Z(t);
    this.yr[0] = 1, this.yr[1] = 0, this.yr[2] = 0, this.yr[3] = 0, this.yr[4] = 0, this.yr[5] = Math.cos(e), this.yr[6] = Math.sin(e), this.yr[7] = 0, this.yr[8] = 0, this.yr[9] = -Math.sin(e), this.yr[10] = Math.cos(e), this.yr[11] = 0, this.yr[12] = 0, this.yr[13] = 0, this.yr[14] = 0, this.yr[15] = 1, this.Cr(this.yr);
  }
  Fr(t) {
    if (t === 0) return;
    const e = Z(t);
    this.yr[0] = Math.cos(e), this.yr[1] = 0, this.yr[2] = -Math.sin(e), this.yr[3] = 0, this.yr[4] = 0, this.yr[5] = 1, this.yr[6] = 0, this.yr[7] = 0, this.yr[8] = Math.sin(e), this.yr[9] = 0, this.yr[10] = Math.cos(e), this.yr[11] = 0, this.yr[12] = 0, this.yr[13] = 0, this.yr[14] = 0, this.yr[15] = 1, this.Cr(this.yr);
  }
  Tr(t) {
    if (t === 0) return;
    const e = Z(t);
    this.yr[0] = Math.cos(e), this.yr[1] = Math.sin(e), this.yr[2] = 0, this.yr[3] = 0, this.yr[4] = -Math.sin(e), this.yr[5] = Math.cos(e), this.yr[6] = 0, this.yr[7] = 0, this.yr[8] = 0, this.yr[9] = 0, this.yr[10] = 1, this.yr[11] = 0, this.yr[12] = 0, this.yr[13] = 0, this.yr[14] = 0, this.yr[15] = 1, this.Cr(this.yr);
  }
  Pr(t, e, s, r) {
    if (t === 0) return;
    const n = Math.hypot(e, s, r);
    if (n < 1e-6) return;
    const h = e / n, a = s / n, c = r / n, u = Z(t), l = Math.cos(u), f = Math.sin(u), d = 1 - l;
    this.yr[0] = d * h * h + l, this.yr[1] = d * h * a + f * c, this.yr[2] = d * h * c - f * a, this.yr[3] = 0, this.yr[4] = d * h * a - f * c, this.yr[5] = d * a * a + l, this.yr[6] = d * a * c + f * h, this.yr[7] = 0, this.yr[8] = d * h * c + f * a, this.yr[9] = d * a * c - f * h, this.yr[10] = d * c * c + l, this.yr[11] = 0, this.yr[12] = 0, this.yr[13] = 0, this.yr[14] = 0, this.yr[15] = 1, this.Cr(this.yr);
  }
  Lr() {
    it(this.vr), this.ar = 0, this.cr = 0, this.ur = 0, this.lr = 0, this.dr = 0, this._r = 0, this.pr = 1, this.mr = 1, this.gr = 1;
  }
  Dr(t) {
    if (!this.kr(t)) throw Error("applyMatrix() only supports affine transform matrices without shear or perspective.");
    this.Cr(t);
  }
  Cr(t) {
    (function(e, s, r = new Float32Array(16)) {
      const n = e[0], h = e[1], a = e[2], c = e[3], u = e[4], l = e[5], f = e[6], d = e[7], p = e[8], y = e[9], w = e[10], v = e[11], g = e[12], b = e[13], A = e[14], x = e[15], C = s[0], R = s[1], T = s[2], M = s[3], F = s[4], P = s[5], k = s[6], G = s[7], ot = s[8], at = s[9], K = s[10], I = s[11], tt = s[12], V = s[13], W = s[14], q = s[15];
      r[0] = n * C + u * R + p * T + g * M, r[1] = h * C + l * R + y * T + b * M, r[2] = a * C + f * R + w * T + A * M, r[3] = c * C + d * R + v * T + x * M, r[4] = n * F + u * P + p * k + g * G, r[5] = h * F + l * P + y * k + b * G, r[6] = a * F + f * P + w * k + A * G, r[7] = c * F + d * P + v * k + x * G, r[8] = n * ot + u * at + p * K + g * I, r[9] = h * ot + l * at + y * K + b * I, r[10] = a * ot + f * at + w * K + A * I, r[11] = c * ot + d * at + v * K + x * I, r[12] = n * tt + u * V + p * W + g * q, r[13] = h * tt + l * V + y * W + b * q, r[14] = a * tt + f * V + w * W + A * q, r[15] = c * tt + d * V + v * W + x * q;
    })(this.vr, t, this.wr);
    for (let e = 0; e < 16; e++) this.vr[e] = this.wr[e];
    this.Rr();
  }
  Rr() {
    const t = this.vr, e = this.lr, s = this.dr, r = this._r;
    this.ar = t[12], this.cr = t[13], this.ur = t[14];
    const n = t[0], h = t[1], a = t[2], c = t[4], u = t[5], l = t[6], f = t[8], d = t[9], p = t[10];
    let y = Math.hypot(n, h, a), w = Math.hypot(c, u, l), v = Math.hypot(f, d, p);
    y < 1e-6 && (y = 1e-6), w < 1e-6 && (w = 1e-6), v < 1e-6 && (v = 1e-6), t[0] * (t[5] * t[10] - t[6] * t[9]) - t[4] * (t[1] * t[10] - t[2] * t[9]) + t[8] * (t[1] * t[6] - t[2] * t[5]) < 0 && (v = -v), this.pr = y, this.mr = w, this.gr = v;
    const g = n / y, b = c / w, A = d / v, x = p / v, C = X(f / v, -1, 1), R = Math.asin(C);
    let T, M;
    Math.abs(Math.cos(R)) > 1e-6 ? (T = Math.atan2(-A, x), M = Math.atan2(-b, g)) : (T = Math.atan2(t[6] / w, t[5] / w), M = 0);
    const F = this.Or(T + Math.PI), P = this.Or(Math.PI - R), k = this.Or(M + Math.PI), G = Math.abs(this.Or(T - e)) + Math.abs(this.Or(R - s)) + Math.abs(this.Or(M - r));
    Math.abs(this.Or(F - e)) + Math.abs(this.Or(P - s)) + Math.abs(this.Or(k - r)) < G ? (this.lr = F, this.dr = P, this._r = k) : (this.lr = T, this.dr = R, this._r = M);
  }
  Or(t) {
    let e = (t + Math.PI) % (2 * Math.PI);
    return e < 0 && (e += 2 * Math.PI), e - Math.PI;
  }
  kr(t) {
    if (t.length !== 16 || Math.abs(t[3]) > 1e-6 || Math.abs(t[7]) > 1e-6 || Math.abs(t[11]) > 1e-6 || Math.abs(t[15] - 1) > 1e-6) return !1;
    const e = t[0], s = t[1], r = t[2], n = t[4], h = t[5], a = t[6], c = t[8], u = t[9], l = t[10], f = Math.hypot(e, s, r), d = Math.hypot(n, h, a), p = Math.hypot(c, u, l);
    if (f < 1e-6 || d < 1e-6 || p < 1e-6) return !1;
    const y = e / f, w = s / f, v = r / f, g = n / d, b = h / d, A = a / d, x = c / p, C = u / p, R = l / p, T = y * x + w * C + v * R, M = g * x + b * C + A * R;
    return Math.abs(y * g + w * b + v * A) < 1e-4 && Math.abs(T) < 1e-4 && Math.abs(M) < 1e-4;
  }
}
const ms = 0.4899573262537283;
class oi {
  constructor() {
    o(this, "ps", !1);
    o(this, "Ir", 0);
    o(this, "Br", 0);
    o(this, "ss", ms);
    o(this, "ds", 0.1);
    o(this, "_s", 4096);
    o(this, "ts", !0);
    o(this, "es", 0);
    o(this, "rs", 0);
    o(this, "ns", 0);
    o(this, "Yi", 0);
    o(this, "Wi", 0);
    o(this, "Zi", 0);
    o(this, "$i", 0);
    o(this, "qi", 1);
    o(this, "Ji", 0);
  }
  br(t) {
    t.ps = this.ps, t.Ir = this.Ir, t.Br = this.Br, t.ss = this.ss, t.ds = this.ds, t._s = this._s, t.ts = this.ts, t.es = this.es, t.rs = this.rs, t.ns = this.ns, t.Yi = this.Yi, t.Wi = this.Wi, t.Zi = this.Zi, t.$i = this.$i, t.qi = this.qi, t.Ji = this.Ji;
  }
  Mr(t) {
    this.ps = t.ps, this.Ir = t.Ir, this.Br = t.Br, this.ss = t.ss, this.ds = t.ds, this._s = t._s, this.ts = t.ts, this.es = t.es, this.rs = t.rs, this.ns = t.ns, this.Yi = t.Yi, this.Wi = t.Wi, this.Zi = t.Zi, this.$i = t.$i, this.qi = t.qi, this.Ji = t.Ji;
  }
  Nr(t) {
    if (t)
      return this.ps ? void 0 : (this.ps = !0, void this.Ir++);
    this.ps && (this.ps = !1, this.Ir++);
  }
  vs(t, e, s) {
    let r = !1;
    if (t !== void 0) {
      const n = Z(Math.max(1, Math.min(179, t)));
      this.ss !== n && (this.ss = n, r = !0);
    }
    e === void 0 && s === void 0 || (r = this.jr(e, s) || r), this.ps && (this.ps = !1, r = !0), r && this.Ir++;
  }
  gs(t, e) {
    let s = !1;
    s = this.jr(t, e) || s, this.ps || (this.ps = !0, s = !0), s && this.Ir++;
  }
  cs(t, e, s, r = 0, n = 0, h = 0, a = 0, c = 1, u = 0) {
    (this.ts || this.es !== t || this.rs !== e || this.ns !== s || this.Yi !== r || this.Wi !== n || this.Zi !== h || this.$i !== a || this.qi !== c || this.Ji !== u) && (this.ts = !1, this.es = t, this.rs = e, this.ns = s, this.Yi = r, this.Wi = n, this.Zi = h, this.$i = a, this.qi = c, this.Ji = u, this.Br++);
  }
  bs(t, e, s, r, n, h) {
    let a = this.Yi !== t || this.Wi !== e || this.Zi !== s;
    r !== void 0 && this.$i !== r && (this.$i = r, a = !0), n !== void 0 && this.qi !== n && (this.qi = n, a = !0), h !== void 0 && this.Ji !== h && (this.Ji = h, a = !0), a && (this.Yi = t, this.Wi = e, this.Zi = s, this.Br++);
  }
  ws() {
    (!this.ts || this.es !== 0 || this.rs !== 0 || this.ns !== 0 || this.Yi !== 0 || this.Wi !== 0 || this.Zi !== 0 || this.$i !== 0 || this.qi !== 1 || this.Ji !== 0) && (this.ts = !0, this.es = 0, this.rs = 0, this.ns = 0, this.Yi = 0, this.Wi = 0, this.Zi = 0, this.$i = 0, this.qi = 1, this.Ji = 0, this.Br++);
  }
  zr() {
    this.ps && (this.ps = !1, this.Ir++);
  }
  jr(t, e) {
    if (t === void 0 && e === void 0) return !1;
    const s = t === void 0 ? this.ds : Math.max(1e-4, t), r = s + 1e-4, n = e === void 0 ? Math.max(this._s, r) : Math.max(r, e);
    return (s !== this.ds || n !== this._s) && (this.ds = s, this._s = n, !0);
  }
}
const lt = 15;
class ai {
  constructor() {
    o(this, "Qr", new Float32Array(3));
    o(this, "Gr", 0);
    o(this, "Hr", new Float32Array(lt));
    o(this, "Vr", new Float32Array(lt));
    o(this, "Xr", new Float32Array([1, 0, 0]));
    o(this, "Yr", !1);
    o(this, "Kr", 0);
  }
  br(t) {
    t.Qr[0] = this.Qr[0], t.Qr[1] = this.Qr[1], t.Qr[2] = this.Qr[2], t.Gr = this.Gr, t.Yr = this.Yr, t.Kr = this.Kr;
    for (let e = 0; e < lt; e++) t.Hr[e] = this.Hr[e], t.Vr[e] = this.Vr[e];
    t.Xr[0] = this.Xr[0], t.Xr[1] = this.Xr[1], t.Xr[2] = this.Xr[2];
  }
  Mr(t) {
    this.Qr[0] = t.Qr[0], this.Qr[1] = t.Qr[1], this.Qr[2] = t.Qr[2], this.Gr = t.Gr, this.Yr = t.Yr, this.Kr = t.Kr;
    for (let e = 0; e < lt; e++) this.Hr[e] = t.Hr[e], this.Vr[e] = t.Vr[e];
    this.Xr[0] = t.Xr[0], this.Xr[1] = t.Xr[1], this.Xr[2] = t.Xr[2];
  }
  Wr(t, e, s) {
    this.Yr = !0, this.Qr[0] += t, this.Qr[1] += e, this.Qr[2] += s, this.Kr++;
  }
  Zr(t, e, s, r, n, h) {
    if (this.Gr >= 5) return;
    this.Yr = !0;
    const a = 3 * this.Gr;
    this.Hr[a] = r, this.Hr[a + 1] = n, this.Hr[a + 2] = h, this.Vr[a] = t, this.Vr[a + 1] = e, this.Vr[a + 2] = s, this.Gr++, this.Kr++;
  }
  $r(t, e, s) {
    let r = Math.max(0, t);
    const n = Math.max(0, e), h = Math.max(0, s);
    r === 0 && n === 0 && h === 0 && (r = 1), this.Xr[0] === r && this.Xr[1] === n && this.Xr[2] === h || (this.Xr[0] = r, this.Xr[1] = n, this.Xr[2] = h, this.Kr++);
  }
  qr() {
    const t = this.Qr[0] !== 0 || this.Qr[1] !== 0 || this.Qr[2] !== 0, e = this.Gr > 0, s = this.Yr || t || e, r = this.Xr[0] !== 1 || this.Xr[1] !== 0 || this.Xr[2] !== 0;
    if (s || r) {
      this.Yr = !1, this.Qr[0] = 0, this.Qr[1] = 0, this.Qr[2] = 0, this.Gr = 0;
      for (let n = 0; n < lt; n++) this.Hr[n] = 0, this.Vr[n] = 0;
      this.Xr[0] = 1, this.Xr[1] = 0, this.Xr[2] = 0, this.Kr++;
    }
  }
  ie() {
    const t = this.Qr[0] !== 0 || this.Qr[1] !== 0 || this.Qr[2] !== 0;
    if (this.Gr !== 0 || t || this.Yr) {
      this.Yr = !1, this.Qr[0] = 0, this.Qr[1] = 0, this.Qr[2] = 0, this.Gr = 0;
      for (let e = 0; e < lt; e++) this.Hr[e] = 0, this.Vr[e] = 0;
      this.Kr++;
    }
  }
}
function kt(i, t, e, s, r = 255) {
  i[0] = t / 255, i[1] = (e ?? t) / 255, i[2] = (s ?? t) / 255, i[3] = r / 255;
}
class ci {
  constructor() {
    o(this, "Jr", 1);
    o(this, "tn", [1, 1, 0]);
    o(this, "sn", "");
    o(this, "en", [1, 1, 1, 1]);
    o(this, "rn", [0, 0, 0, 1]);
    o(this, "nn", "rgb");
    o(this, "hn", ce().maxes);
    o(this, "an", !1);
    o(this, "cn", !1);
    o(this, "un", !1);
    o(this, "ln", 0);
    o(this, "dn", [0, 0, 0, 1]);
  }
  br(t) {
    t._n = this.Jr, t.pn = this.an, t.mn = this.cn, t.un = this.un, t.ln = this.ln, t.gn[0] = this.tn[0], t.gn[1] = this.tn[1], t.gn[2] = this.tn[2], t.vn = this.sn, t.yn[0] = this.en[0], t.yn[1] = this.en[1], t.yn[2] = this.en[2], t.yn[3] = this.en[3], t.wn[0] = this.rn[0], t.wn[1] = this.rn[1], t.wn[2] = this.rn[2], t.wn[3] = this.rn[3], t.nn = this.nn, t.hn[0] = this.hn[0], t.hn[1] = this.hn[1], t.hn[2] = this.hn[2], t.hn[3] = this.hn[3];
  }
  Mr(t) {
    this.Jr = t._n, this.an = t.pn, this.cn = t.mn, this.un = t.un, this.ln = t.ln, this.tn[0] = t.gn[0], this.tn[1] = t.gn[1], this.tn[2] = t.gn[2], this.sn = t.vn, this.en[0] = t.yn[0], this.en[1] = t.yn[1], this.en[2] = t.yn[2], this.en[3] = t.yn[3], this.rn[0] = t.wn[0], this.rn[1] = t.wn[1], this.rn[2] = t.wn[2], this.rn[3] = t.wn[3], this.nn = t.nn, this.hn[0] = t.hn[0], this.hn[1] = t.hn[1], this.hn[2] = t.hn[2], this.hn[3] = t.hn[3];
  }
  bn(t) {
    this.Jr = Math.abs(t);
  }
  Mn(t) {
    this.tn[0] = t[0], this.tn[1] = t[1], this.tn[2] = t[2];
  }
  An(t) {
    this.sn = t;
  }
  xn(t, e, s, r = 255) {
    kt(this.en, t, e, s, r);
  }
  Cn(t, e, s, r = 255) {
    kt(this.rn, t, e, s, r);
  }
  Sn(t) {
    this.an = t;
  }
  En(t) {
    this.cn = t;
  }
  Fn(t) {
    this.un = t;
  }
  Tn(t) {
    this.ln = jt(t);
  }
  Pn(t, e, s, r) {
    kt(this.dn, t, e, s, r);
  }
  Ln() {
    return { mode: this.nn, maxes: [this.hn[0], this.hn[1], this.hn[2], this.hn[3]] };
  }
  Dn(t, e) {
    this.nn = t, this.hn[0] = e[0], this.hn[1] = e[1], this.hn[2] = e[2], this.hn[3] = e[3];
  }
}
function Be(i, t) {
  i[0] = t[0], i[1] = t[1], i[2] = t[2], i[3] = t[3];
}
function se(i, t) {
  if (t.kind === "none") return i.kind = "none", i.source = null, void (i.framebuffer = null);
  if (t.kind === "source") {
    const s = i;
    return s.kind = "source", s.source = t.source, s.palette = t.palette, s.brightnessStart = t.brightnessStart, s.brightnessEnd = t.brightnessEnd, s.invert = t.invert, s.flipX = t.flipX, s.flipY = t.flipY, s.charRotation = t.charRotation, s.charColorMode = t.charColorMode, s.cellColorMode = t.cellColorMode, s.charColor ?? (s.charColor = [1, 1, 1, 1]), s.cellColor ?? (s.cellColor = [0, 0, 0, 1]), Be(s.charColor, t.charColor), void Be(s.cellColor, t.cellColor);
  }
  const e = i;
  e.kind = "framebuffer", e.framebuffer = t.framebuffer, e.textures ?? (e.textures = []), e.textures.length = t.textures.length;
  for (let s = 0; s < t.textures.length; s++) e.textures[s] = t.textures[s];
  e.width = t.width, e.height = t.height, e.attachmentCount = t.attachmentCount;
}
class li {
  constructor() {
    o(this, "kn", { kind: "source", source: null, palette: null, brightnessStart: 0, brightnessEnd: 1, invert: !1, flipX: !1, flipY: !1, charRotation: 0, charColorMode: "sampled", cellColorMode: "fixed", charColor: [1, 1, 1, 1], cellColor: [0, 0, 0, 1] });
    o(this, "Rn", 0);
    this.kn.kind = "none", this.kn.source = null, this.kn.framebuffer = null;
  }
  On(t) {
    se(this.kn, t), this.Rn++;
  }
  In(t) {
    const e = this.kn;
    e.kind = "framebuffer", e.framebuffer = t, e.textures ?? (e.textures = []), e.textures.length = t.textures.length;
    for (let s = 0; s < t.textures.length; s++) e.textures[s] = t.textures[s];
    e.width = t.width, e.height = t.height, e.attachmentCount = t.attachmentCount, this.Rn++;
  }
  Bn() {
    this.kn.kind !== "none" && (this.kn.kind = "none", this.kn.source = null, this.kn.framebuffer = null, this.Rn++);
  }
  br(t) {
    t.Nn = this.Rn, se(t.jn, this.kn);
  }
  Mr(t) {
    this.Rn = t.Nn, se(this.kn, t.jn);
  }
  get current() {
    return this.kn;
  }
}
class wt {
  constructor() {
    o(this, "zn", new hi());
    o(this, "Ki", new oi());
    o(this, "se", new ai());
    o(this, "gn", new ci());
    o(this, "Qn", new li());
    o(this, "Gn", []);
    o(this, "Hn", []);
  }
  static Vn() {
    return { _n: 1, ar: 0, cr: 0, ur: 0, lr: 0, dr: 0, _r: 0, pr: 1, mr: 1, gr: 1, vr: it(), ln: 0, pn: !1, mn: !1, un: !1, ps: !1, Ir: 0, Br: 0, ss: ms, ds: 0.1, _s: 4096, ts: !0, es: 0, rs: 0, ns: 0, Yi: 0, Wi: 0, Zi: 0, $i: 0, qi: 1, Ji: 0, Gr: 0, Hr: new Float32Array(15), Vr: new Float32Array(15), Qr: new Float32Array(3), Xr: new Float32Array([1, 0, 0]), Yr: !1, Kr: 0, Nn: 0, jn: { kind: "source", source: null, palette: null, brightnessStart: 0, brightnessEnd: 1, invert: !1, flipX: !1, flipY: !1, charRotation: 0, charColorMode: "sampled", cellColorMode: "fixed", charColor: [1, 1, 1, 1], cellColor: [0, 0, 0, 1] }, gn: [1, 1, 0], vn: "", yn: [1, 1, 1, 1], wn: [0, 0, 0, 1], nn: ce().mode, hn: ce().maxes };
  }
  Xn(t) {
    this.zn.br(t), this.Ki.br(t), this.se.br(t), this.gn.br(t), this.Qn.br(t);
  }
  Yn(t) {
    this.zn.Mr(t), this.Ki.Mr(t), this.se.Mr(t), this.gn.Mr(t), this.Qn.Mr(t);
  }
  Kn(t) {
    this.Yn(t);
  }
  Ne() {
    let t = this.Hn.pop();
    t || (t = wt.Vn()), this.Xn(t), this.Gn.push(t);
  }
  je() {
    const t = this.Gn.pop();
    t ? (this.Yn(t), this.Hn.push(t)) : console.warn("pop() called without matching push()");
  }
  ee() {
    this.zn.Lr(), this.Ki.zr();
  }
}
var _ = ((i) => (i.RECTANGLE = "rectangle", i.LINE = "line", i.ELLIPSE = "ellipse", i.ARC = "arc", i.BEZIER_CURVE = "bezier_curve", i.BOX = "box", i.SPHERE = "sphere", i.TORUS = "torus", i.CONE = "cone", i.CYLINDER = "cylinder", i.ELLIPSOID = "ellipsoid", i))(_ || {});
const gs = { rectangle: 2, line: 2, ellipse: 2, arc: 3, bezier_curve: 4, box: 5, sphere: 6, torus: 7, cone: 8, cylinder: 9, ellipsoid: 6 }, ue = new Float32Array([-0.5, -0.5, 0, 0, 0.5, -0.5, 1, 0, -0.5, 0.5, 0, 1, -0.5, 0.5, 0, 1, 0.5, -0.5, 1, 0, 0.5, 0.5, 1, 1]), bt = { Wn: 16, Zn: { $n: { size: 2, offset: 0 }, qn: { size: 2, offset: 8 } } }, ui = { Wn: 20, Zn: { $n: { size: 3, offset: 0 }, qn: { size: 2, offset: 12 } } }, fi = { Wn: 24, Zn: { $n: { size: 4, offset: 0 }, qn: { size: 2, offset: 16 } } };
class di {
  constructor(t) {
    o(this, "Ce");
    o(this, "Jn");
    o(this, "th");
    this.Ce = t, this.Jn = t.createBuffer(), this.th = new Float32Array(ue.length);
  }
  ih(t, e, s, r) {
    const n = this.Ce, h = fs(this.Ce), a = h[2], c = h[3], u = t / a * 2 - 1, l = (t + s) / a * 2 - 1, f = 1 - (e + r) / c * 2, d = 1 - e / c * 2, p = ue, y = this.th;
    for (let w = 0; w < p.length; w += 4) {
      const v = p[w], g = p[w + 1], b = p[w + 2], A = p[w + 3], x = u + (v + 0.5) * (l - u), C = f + (g + 0.5) * (d - f);
      y[w] = x, y[w + 1] = C, y[w + 2] = b, y[w + 3] = A;
    }
    n.bindBuffer(n.ARRAY_BUFFER, this.Jn), n.bufferData(n.ARRAY_BUFFER, y, n.DYNAMIC_DRAW), Rt(n, 0, 2, 16, 0), Rt(n, 1, 2, 16, 8), n.drawArrays(n.TRIANGLES, 0, 6), n.disableVertexAttribArray(1), n.disableVertexAttribArray(0), n.bindBuffer(n.ARRAY_BUFFER, null);
  }
  L() {
    this.Ce.deleteBuffer(this.Jn);
  }
}
const fe = "glyph_run", ys = "custom_shape";
class pi {
  constructor(t) {
    o(this, "Ce");
    o(this, "sh", /* @__PURE__ */ new Map());
    o(this, "eh", null);
    this.Ce = t;
  }
  rh(t) {
    const { shader: e, geometryKey: s, unit: r, geometryBuffer: n, indexBuffer: h, instanceAttributes: a } = t, c = this.Ce, u = e.program;
    let l = this.sh.get(e);
    l || (l = /* @__PURE__ */ new Map(), this.sh.set(e, l), e.k(() => this.nh(e)));
    let f = l.get(s);
    if (f && f.instanceBufferVersion !== a.hh && (f.vao && (c.deleteVertexArray(f.vao), this.eh === f.vao && (this.eh = null)), l.delete(s), f = void 0), f) this.eh !== f.vao && (c.bindVertexArray(f.vao), this.eh = f.vao);
    else {
      const d = c.createVertexArray();
      f = { vao: d, instanceBufferVersion: a.hh }, l.set(s, f), c.bindVertexArray(d), this.eh = d, c.bindBuffer(c.ARRAY_BUFFER, n), h && c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, h);
      const p = c.getAttribLocation(u, "A0");
      p !== -1 && Rt(c, p, r.Zn.$n.size, r.Wn, r.Zn.$n.offset, 0, c.FLOAT, !1);
      const y = c.getAttribLocation(u, "A1");
      y !== -1 && Rt(c, y, r.Zn.qn.size, r.Wn, r.Zn.qn.offset, 0, c.FLOAT, !1), a.oh(e);
    }
  }
  nh(t) {
    const e = this.sh.get(t);
    if (e) {
      for (const [, s] of e) s.vao && this.Ce.deleteVertexArray(s.vao);
      this.sh.delete(t);
    }
  }
  ah() {
    this.eh !== null && (this.Ce.bindVertexArray(null), this.eh = null);
  }
  L() {
    for (const [, t] of this.sh) for (const [, e] of t) e.vao && this.Ce.deleteVertexArray(e.vao);
    this.sh.clear();
  }
}
class B {
}
o(B, "BYTES_PER_INSTANCE", 144), o(B, "FLOATS_PER_INSTANCE", 36);
function z(i, t) {
  return { location: -1, size: i, stride: B.BYTES_PER_INSTANCE, offset: t, divisor: 1 };
}
class Qt {
}
o(Qt, "STRIDE", B.BYTES_PER_INSTANCE), o(Qt, "ATTRIBUTES", { A2: z(2, 0), A3: z(2, 8), A4: z(3, 16), A5: z(4, 28), A6: z(4, 44), A7: z(4, 60), A8: z(3, 76), A9: z(3, 88), Aa: z(4, 100), Ab: z(4, 116), Ac: z(3, 132) });
class mi {
  constructor(t = 1e3, e = 1.5) {
    o(this, "uh");
    o(this, "fh");
    o(this, "dh");
    o(this, "_h", 0);
    o(this, "ph", 0);
    this.fh = t, this.dh = e;
    const s = t * B.FLOATS_PER_INSTANCE;
    this.uh = new Float32Array(s);
  }
  mh(t) {
    if (t <= this.fh) return;
    const e = Math.ceil(t * this.dh), s = this.fh;
    this.fh = e;
    const r = new Float32Array(e * B.FLOATS_PER_INSTANCE), n = s * B.FLOATS_PER_INSTANCE;
    r.set(this.uh.subarray(0, Math.min(n, this._h))), this.uh = r;
  }
  gh(t) {
    this._h += t, this.ph++;
  }
  yh() {
    this._h = 0, this.ph = 0;
  }
  wh(t = 0, e) {
    return this.uh.subarray(t, e ?? this._h);
  }
}
function vs(i, t) {
  return { x: 0, y: 0, width: 0, height: 0, char0: 0, char1: 0, char2: 0, r1: 0, g1: 0, b1: 0, a1: 0, r2: 0, g2: 0, b2: 0, a2: 0, invert: 0, flipX: 0, flipY: 0, charRot: 0, translationX: 0, translationY: 0, translationZ: 0, rotationX: 0, rotationY: 0, rotationZ: 0, curveParams0: i, curveParams1: t, depth: 0, baseZ: 0, geometryType: 0 };
}
class gi {
  constructor(t) {
    o(this, "uh");
    this.uh = t;
  }
  bh(t) {
    this.uh.ph >= this.uh.fh && this.uh.mh(this.uh.ph + 1);
    const e = this.uh.uh, s = this.uh._h;
    e[s + 0] = t.x, e[s + 1] = t.y, e[s + 2] = t.width, e[s + 3] = t.height, e[s + 4] = t.char0, e[s + 5] = t.char1, e[s + 6] = t.char2, e[s + 7] = t.r1, e[s + 8] = t.g1, e[s + 9] = t.b1, e[s + 10] = t.a1, e[s + 11] = t.r2, e[s + 12] = t.g2, e[s + 13] = t.b2, e[s + 14] = t.a2, e[s + 15] = t.invert, e[s + 16] = t.flipX, e[s + 17] = t.flipY, e[s + 18] = t.charRot, e[s + 19] = t.translationX, e[s + 20] = t.translationY, e[s + 21] = t.translationZ, e[s + 22] = t.rotationX, e[s + 23] = t.rotationY, e[s + 24] = t.rotationZ;
    const r = t.curveParams0, n = t.curveParams1;
    return e[s + 25] = r[0], e[s + 26] = r[1], e[s + 27] = r[2], e[s + 28] = r[3], e[s + 29] = n[0], e[s + 30] = n[1], e[s + 31] = n[2], e[s + 32] = n[3], e[s + 33] = t.depth, e[s + 34] = t.baseZ, e[s + 35] = t.geometryType, this.uh.gh(B.FLOATS_PER_INSTANCE), this.uh.ph - 1;
  }
}
class yi {
  constructor(t, e = 1e3) {
    o(this, "Ce");
    o(this, "Mh", null);
    o(this, "Ah", 0);
    o(this, "xh", /* @__PURE__ */ new WeakMap());
    o(this, "Rn", 0);
    this.Ce = t, this.Ch(e);
  }
  Ch(t) {
    const e = this.Ce;
    this.Mh && e.deleteBuffer(this.Mh), this.Rn++, this.Mh = e.createBuffer();
    const s = t * B.BYTES_PER_INSTANCE;
    ae(e, e.ARRAY_BUFFER, this.Mh, s, e.DYNAMIC_DRAW), this.Ah = t;
  }
  Sh(t) {
    this.Ch(t);
  }
  W(t, e) {
    if (e === 0) return;
    const s = this.Ce;
    s.bindBuffer(s.ARRAY_BUFFER, this.Mh), s.bufferSubData(s.ARRAY_BUFFER, 0, t, 0, e);
  }
  get hh() {
    return this.Rn;
  }
  Eh(t) {
    let e = this.xh.get(t);
    if (!e) {
      e = /* @__PURE__ */ new Map();
      const s = this.Ce;
      for (const r in Qt.ATTRIBUTES) {
        const n = r, h = s.getAttribLocation(t, n);
        h !== -1 && e.set(n, h);
      }
      this.xh.set(t, e);
    }
    return e;
  }
  oh(t) {
    const e = this.Ce, s = t.program, r = this.Eh(s);
    e.bindBuffer(e.ARRAY_BUFFER, this.Mh);
    for (const [n, h] of r) {
      const a = Qt.ATTRIBUTES[n];
      a && Rt(e, h, a.size, a.stride, a.offset, a.divisor);
    }
  }
  L() {
    this.Mh && (this.Ce.deleteBuffer(this.Mh), this.Mh = null);
  }
}
class ws {
  constructor(t, e = 1e3, s = 1.5) {
    o(this, "Ce");
    o(this, "uh");
    o(this, "Fh");
    o(this, "Th");
    this.Ce = t, this.uh = new mi(e, s), this.Fh = new gi(this.uh), this.Th = new yi(t, e);
  }
  Ph() {
    this.uh.fh > this.Th.Ah && this.Th.Sh(this.uh.fh);
  }
  get writer() {
    return this.Fh;
  }
  get Lh() {
    return this.Th;
  }
  Dh() {
    this.uh.yh();
  }
  kh(t, e) {
    if (e === 0) return;
    const s = e * B.FLOATS_PER_INSTANCE;
    this.uh.mh(this.uh.ph + e);
    const r = this.uh.uh, n = this.uh._h;
    for (let h = 0; h < s; h++) r[n + h] = t[h];
    this.uh._h += s, this.uh.ph += e;
  }
  Rh() {
    this.uh.ph !== 0 && (this.Ph(), this.Th.W(this.uh.uh, this.uh._h));
  }
  ih(t, e) {
    const s = this.uh.ph;
    s !== 0 && this.Ce.drawArraysInstanced(t, 0, e, s);
  }
  Oh(t, e, s, r = 0) {
    const n = this.uh.ph;
    n !== 0 && this.Ce.drawElementsInstanced(t, e, s, r, n);
  }
  L() {
    this.Th.L();
  }
}
class At {
  constructor(t, e, s, r) {
    o(this, "Ce");
    o(this, "Ih");
    o(this, "Bh");
    o(this, "Nh");
    o(this, "jh", null);
    o(this, "zh", null);
    o(this, "Qh", [0, 0, 0, 0]);
    o(this, "Gh", [0, 0, 0, 0]);
    o(this, "Hh");
    this.Ce = t, this.Ih = e, this.Bh = s, this.Nh = r, this.Hh = vs(this.Qh, this.Gh);
    const n = this.Ce.createBuffer();
    if (ae(this.Ce, this.Ce.ARRAY_BUFFER, n, this.Nh.Vh, this.Ce.STATIC_DRAW), this.jh = n, this.Nh.Xh) {
      const h = this.Ce.createBuffer();
      ae(this.Ce, this.Ce.ELEMENT_ARRAY_BUFFER, h, this.Nh.Xh, this.Ce.STATIC_DRAW), this.zh = h;
    }
  }
  get type() {
    return this.Bh;
  }
  get unitGeometry() {
    return this.Nh;
  }
  get unitBuffer() {
    return this.jh;
  }
  get unitIndexBuffer() {
    return this.zh;
  }
  get batch() {
    return this.Ih;
  }
  Yh() {
    this.Ih.Dh();
  }
  Kh() {
    return this.Ih.uh.ph !== 0;
  }
  L() {
    this.Ih.L(), this.Ce.deleteBuffer(this.jh), this.zh && this.Ce.deleteBuffer(this.zh);
  }
  bh(t, e, s, r, n, h, a) {
    const c = n.ar ?? 0, u = n.cr ?? 0, l = n.ur ?? 0, f = n.lr ?? 0, d = n.dr ?? 0, p = a ?? n._r ?? 0, y = n.pr ?? 1, w = n.mr ?? 1, v = n.gr ?? 1, g = this.Qh, b = this.Gh;
    g[0] = 0, g[1] = 0, g[2] = 0, g[3] = 0, b[0] = 0, b[1] = 0, b[2] = 0, b[3] = 0, h && (h.bezStartX !== void 0 && h.bezStartY !== void 0 && h.bezEndX !== void 0 && h.bezEndY !== void 0 ? (g[0] = h.cp1x ?? 0, g[1] = h.cp1y ?? 0, g[2] = h.cp2x ?? 0, g[3] = h.cp2y ?? 0, b[0] = h.bezStartX ?? 0, b[1] = h.bezStartY ?? 0, b[2] = h.bezEndX ?? 0, b[3] = h.bezEndY ?? 0) : h.arcStart === void 0 && h.arcStop === void 0 || (g[0] = h.arcStart ?? 0, g[1] = h.arcStop ?? 0));
    const A = this.Hh;
    return A.x = t * y, A.y = e * w, A.width = s * y, A.height = r * w, A.char0 = n.gn[0], A.char1 = n.gn[1], A.char2 = n.gn[2], A.r1 = n.yn[0], A.g1 = n.yn[1], A.b1 = n.yn[2], A.a1 = n.yn[3], A.r2 = n.wn[0], A.g2 = n.wn[1], A.b2 = n.wn[2], A.a2 = n.wn[3], A.invert = n.un ? 1 : 0, A.flipX = n.pn ? 1 : 0, A.flipY = n.mn ? 1 : 0, A.charRot = n.ln, A.translationX = c, A.translationY = u, A.translationZ = l, A.rotationX = f, A.rotationY = d, A.rotationZ = p, A.depth = ((h == null ? void 0 : h.depth) ?? 0) * v, A.baseZ = ((h == null ? void 0 : h.baseZ) ?? 0) * v, A.geometryType = gs[this.Bh] ?? 0, this.Ih.writer.bh(A);
  }
}
const vi = { Vh: ue, Wh: 6, ...bt };
class wi extends At {
  constructor(t, e) {
    super(t, e, _.RECTANGLE, vi);
  }
  Zh(t, e) {
    return this.bh(0, 0, t.width, t.height, e);
  }
}
const bi = { Vh: new Float32Array([0, -0.5, 0, 0, 1, -0.5, 1, 0, 0, 0.5, 0, 1, 0, 0.5, 0, 1, 1, -0.5, 1, 0, 1, 0.5, 1, 1]), Wh: 6, ...bt };
class Ai extends At {
  constructor(t, e) {
    super(t, e, _.LINE, bi);
  }
  Zh(t, e) {
    const s = t.x2 - t.x1, r = t.y2 - t.y1, n = Math.hypot(s, r), h = Math.atan2(r, s), a = e._n || 1, c = Math.cos(-h), u = Math.sin(-h), l = t.x1 * c - t.y1 * u, f = t.x1 * u + t.y1 * c;
    return this.bh(l, f, n, a, e, null, (e._r || 0) + h);
  }
}
const xi = { Vh: (function(i = 32) {
  const t = [], e = 2 * Math.PI / i;
  for (let s = 0; s < i; s++) {
    const r = s * e, n = (s + 1) % i * e, h = Math.cos(r), a = Math.sin(r), c = 0.5 * (h + 1), u = 0.5 * (a + 1), l = Math.cos(n), f = Math.sin(n), d = 0.5 * (l + 1), p = 0.5 * (f + 1);
    t.push(0, 0, 0.5, 0.5, h, a, c, u, l, f, d, p);
  }
  return new Float32Array(t);
})(32), Wh: 96, ...bt };
class Ei extends At {
  constructor(t, e) {
    super(t, e, _.ELLIPSE, xi);
  }
  Zh(t, e) {
    return this.bh(0, 0, t.width, t.height, e);
  }
}
const Ci = { Vh: (function(i) {
  const t = [];
  for (let e = 0; e < i; e++) {
    const s = e / i, r = (e + 1) / i;
    t.push(s, 0, s, 0, s, 1, s, 1, r, 1, r, 1);
  }
  return new Float32Array(t);
})(32), Wh: 96, ...bt };
class Mi extends At {
  constructor(t, e) {
    super(t, e, _.ARC, Ci);
  }
  Zh(t, e) {
    const s = Z(t.start), r = Z(t.stop);
    return this.bh(0, 0, t.width, t.height, e, { arcStart: s, arcStop: r });
  }
}
const _i = { Vh: (function(i = 16) {
  const t = [];
  for (let e = 0; e < i; e++) {
    const s = e / i, r = (e + 1) / i;
    t.push(s, -0.5, s, 0, r, -0.5, r, 0, s, 0.5, s, 1, s, 0.5, s, 1, r, -0.5, r, 0, r, 0.5, r, 1);
  }
  return new Float32Array(t);
})(16), Wh: 96, ...bt };
class Ti extends At {
  constructor(t, e) {
    super(t, e, _.BEZIER_CURVE, _i);
  }
  Zh(t, e) {
    return this.bh(0, 0, 1, e._n || 1, e, { cp1x: t.cp1x, cp1y: t.cp1y, cp2x: t.cp2x, cp2y: t.cp2y, bezStartX: t.x1, bezStartY: t.y1, bezEndX: t.x2, bezEndY: t.y2 });
  }
}
class ut extends At {
  constructor(t, e, s, r) {
    super(t, e, s, (function(n, h) {
      const a = n === _.TORUS ? fi : ui;
      return { Vh: h.vertices, Xh: h.indices, Wh: h.vertices.length / (a.Wn / 4), $h: h.indices.length, ...a };
    })(s, r));
  }
  Zh(t, e) {
    return this.bh(0, 0, t.width, t.height, e, { depth: t.depth });
  }
}
const Ri = { Vh: new Float32Array(0), Wh: 0, ...bt };
class Si {
  constructor(t) {
    o(this, "Ce");
    o(this, "uh");
    o(this, "Ih");
    o(this, "Nh", { ...Ri });
    o(this, "qh", [0, 0, 0, 0]);
    o(this, "Jh", [0, 0, 0, 0]);
    o(this, "io");
    o(this, "so", 1);
    o(this, "eo", 0);
    this.Ce = t, this.uh = t.createBuffer(), this.Ih = new ws(t, 1), this.io = vs(this.qh, this.Jh);
  }
  ih(t, e, s, r, n) {
    s !== 0 && (this.ro(e, s), this.bh(r), this.Ih.Rh(), n.rh({ shader: t, geometryKey: "custom_shape:" + this.so, unit: this.Nh, geometryBuffer: this.uh, instanceAttributes: this.Ih.Lh }), this.Ih.ih(this.Ce.TRIANGLES, s), this.Ih.Dh());
  }
  L() {
    this.Ih.L(), this.Ce.deleteBuffer(this.uh);
  }
  ro(t, e) {
    const s = 4 * e;
    s > this.eo && (this.eo = s, this.so++), this.Nh.Wh = e, this.Ce.bindBuffer(this.Ce.ARRAY_BUFFER, this.uh), this.Ce.bufferData(this.Ce.ARRAY_BUFFER, t.subarray(0, s), this.Ce.DYNAMIC_DRAW);
  }
  bh(t) {
    this.Ih.Dh();
    const e = this.io;
    e.x = 0, e.y = 0, e.width = t.pr ?? 1, e.height = t.mr ?? 1, e.char0 = t.gn[0], e.char1 = t.gn[1], e.char2 = t.gn[2], e.r1 = t.yn[0], e.g1 = t.yn[1], e.b1 = t.yn[2], e.a1 = t.yn[3], e.r2 = t.wn[0], e.g2 = t.wn[1], e.b2 = t.wn[2], e.a2 = t.wn[3], e.invert = t.un ? 1 : 0, e.flipX = t.pn ? 1 : 0, e.flipY = t.mn ? 1 : 0, e.charRot = t.ln, e.translationX = t.ar ?? 0, e.translationY = t.cr ?? 0, e.translationZ = t.ur ?? 0, e.rotationX = t.lr ?? 0, e.rotationY = t.dr ?? 0, e.rotationZ = t._r ?? 0, e.depth = t.gr ?? 1, e.baseZ = 0, e.geometryType = 10, this.Ih.writer.bh(e);
  }
}
const Fi = { vertices: new Float32Array([-0.5, -0.5, 0.5, 0, 0, 0.5, -0.5, 0.5, 1, 0, 0.5, 0.5, 0.5, 1, 1, -0.5, 0.5, 0.5, 0, 1, 0.5, -0.5, -0.5, 0, 0, -0.5, -0.5, -0.5, 1, 0, -0.5, 0.5, -0.5, 1, 1, 0.5, 0.5, -0.5, 0, 1, -0.5, -0.5, -0.5, 0, 0, -0.5, -0.5, 0.5, 1, 0, -0.5, 0.5, 0.5, 1, 1, -0.5, 0.5, -0.5, 0, 1, 0.5, -0.5, 0.5, 0, 0, 0.5, -0.5, -0.5, 1, 0, 0.5, 0.5, -0.5, 1, 1, 0.5, 0.5, 0.5, 0, 1, -0.5, 0.5, 0.5, 0, 0, 0.5, 0.5, 0.5, 1, 0, 0.5, 0.5, -0.5, 1, 1, -0.5, 0.5, -0.5, 0, 1, -0.5, -0.5, -0.5, 0, 0, 0.5, -0.5, -0.5, 1, 0, 0.5, -0.5, 0.5, 1, 1, -0.5, -0.5, 0.5, 0, 1]), indices: new Uint16Array([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23]) }, Xe = (function(i = 12, t = 16) {
  const e = [], s = [];
  for (let n = 0; n <= i; n++) {
    const h = n / i, a = h * Math.PI, c = Math.sin(a), u = Math.cos(a);
    for (let l = 0; l <= t; l++) {
      const f = l / t, d = f * Math.PI * 2, p = Math.sin(d), y = Math.cos(d) * c * 0.5, w = 0.5 * u, v = p * c * 0.5;
      e.push(y, w, v, f, h);
    }
  }
  const r = t + 1;
  for (let n = 0; n < i; n++) for (let h = 0; h < t; h++) {
    const a = n * r + h, c = a + r;
    s.push(a, c, a + 1, a + 1, c, c + 1);
  }
  return { vertices: new Float32Array(e), indices: new Uint16Array(s) };
})(14, 20), Pi = (function(i = 16, t = 12) {
  const e = [], s = [];
  for (let n = 0; n <= i; n++) {
    const h = n / i * Math.PI * 2, a = Math.cos(h), c = Math.sin(h);
    for (let u = 0; u <= t; u++) {
      const l = u / t * Math.PI * 2, f = Math.cos(l), d = Math.sin(l);
      e.push(a, c, f, d, n / i, u / t);
    }
  }
  const r = t + 1;
  for (let n = 0; n < i; n++) for (let h = 0; h < t; h++) {
    const a = n * r + h, c = (n + 1) * r + h;
    s.push(a, c, a + 1, a + 1, c, c + 1);
  }
  return { vertices: new Float32Array(e), indices: new Uint16Array(s) };
})(20, 16), Li = (function(i = 20) {
  const t = [], e = [];
  for (let s = 0; s < i; s++) {
    const r = s / i, n = (s + 1) / i, h = r * Math.PI * 2, a = n * Math.PI * 2, c = t.length / 5;
    t.push(0, 0.5, 0, 0.5 * (r + n), 1, 0.5 * Math.cos(h), -0.5, 0.5 * Math.sin(h), r, 0, 0.5 * Math.cos(a), -0.5, 0.5 * Math.sin(a), n, 0, 0, -0.5, 0, 0.5, 0.5), e.push(c, c + 1, c + 2, c + 3, c + 2, c + 1);
  }
  return { vertices: new Float32Array(t), indices: new Uint16Array(e) };
})(24), Ui = (function(i = 24) {
  const t = [], e = [];
  for (let s = 0; s < i; s++) {
    const r = s / i, n = (s + 1) / i, h = r * Math.PI * 2, a = n * Math.PI * 2, c = 0.5 * Math.cos(h), u = 0.5 * Math.sin(h), l = 0.5 * Math.cos(a), f = 0.5 * Math.sin(a), d = t.length / 5;
    t.push(c, 0.5, u, r, 1, c, -0.5, u, r, 0, l, 0.5, f, n, 1, l, -0.5, f, n, 0), e.push(d, d + 1, d + 2, d + 2, d + 1, d + 3);
    const p = t.length / 5;
    t.push(0, 0.5, 0, 0.5, 0.5, l, 0.5, f, l + 0.5, f + 0.5, c, 0.5, u, c + 0.5, u + 0.5, 0, -0.5, 0, 0.5, 0.5, c, -0.5, u, c + 0.5, u + 0.5, l, -0.5, f, l + 0.5, f + 0.5), e.push(p, p + 1, p + 2, p + 3, p + 4, p + 5);
  }
  return { vertices: new Float32Array(t), indices: new Uint16Array(e) };
})(24), Di = { [_.RECTANGLE]: (i, t) => new wi(i, t), [_.LINE]: (i, t) => new Ai(i, t), [_.ELLIPSE]: (i, t) => new Ei(i, t), [_.ARC]: (i, t) => new Mi(i, t), [_.BEZIER_CURVE]: (i, t) => new Ti(i, t), [_.BOX]: (i, t) => new ut(i, t, _.BOX, Fi), [_.SPHERE]: (i, t) => new ut(i, t, _.SPHERE, Xe), [_.TORUS]: (i, t) => new ut(i, t, _.TORUS, Pi), [_.CONE]: (i, t) => new ut(i, t, _.CONE, Li), [_.CYLINDER]: (i, t) => new ut(i, t, _.CYLINDER, Ui), [_.ELLIPSOID]: (i, t) => new ut(i, t, _.ELLIPSOID, Xe) };
class Ii {
  constructor(t) {
    o(this, "Ce");
    o(this, "no");
    o(this, "ho");
    o(this, "oo");
    o(this, "ao", null);
    o(this, "co", /* @__PURE__ */ new Map());
    o(this, "uo", null);
    o(this, "lo", "");
    o(this, "fo", it());
    o(this, "do", it());
    o(this, "_o", [0, 0, 0]);
    o(this, "po", [0, 0, 0]);
    o(this, "mo", [0, 1, 0]);
    this.Ce = t, this.ho = new pi(t), this.oo = new Si(t), this.no = /* @__PURE__ */ new Map();
    for (const e of Object.values(_)) {
      const s = new ws(t), r = (0, Di[e])(t, s);
      this.no.set(e, r);
    }
  }
  vo(t) {
    this.ao = null, this.co.clear(), this.uo = null, this.lo = "";
    let e = null, s = null, r = null, n = !1, h = -1, a = -1, c = -1, u = null;
    for (const l of t) {
      if (l.type === ys) {
        r && r.Kh() && this.yo(r, e, s, u), e = null, s = null, r = null, n = !1, h = -1, a = -1, c = -1, u = null, this.wo(l);
        continue;
      }
      const f = l.type === fe ? _.RECTANGLE : l.type;
      e === l.material && s === f && n === l.state.ps && h === l.state.Ir && a === l.state.Br && c === l.state.Kr || (r && r.Kh() && this.yo(r, e, s, u), e = l.material, s = f, r = this.no.get(s), n = l.state.ps, h = l.state.Ir, a = l.state.Br, c = l.state.Kr, u = l.state, r.Yh()), l.type === fe ? r.batch.kh(l.params.data, l.params.instanceCount) : r.Zh(l.params, l.state);
    }
    r && r.Kh() && this.yo(r, e, s, u), this.ho.ah();
  }
  wo(t) {
    this.bo(t.material, t.state), this.oo.ih(t.material.shader, t.params.vertices, t.params.vertexCount, t.state, this.ho);
  }
  yo(t, e, s, r) {
    this.bo(e, r);
    const n = t.unitGeometry, h = t.unitBuffer, a = n.Mo ?? this.Ce.TRIANGLES;
    try {
      t.batch.Rh(), this.ho.rh({ shader: e.shader, geometryKey: s + "", unit: n, geometryBuffer: h, indexBuffer: t.unitIndexBuffer, instanceAttributes: t.batch.Lh }), n.Xh && n.$h ? t.batch.Oh(a, n.$h, n.Ao ?? this.Ce.UNSIGNED_SHORT, n.xo ?? 0) : t.batch.ih(a, n.Wh);
    } finally {
      t.Yh();
    }
  }
  bo(t, e) {
    this.ao !== t.shader && (t.shader.er(), this.ao = t.shader), this.uo !== t && (t.shader.oe(t.uniforms), this.uo = t);
    const s = fs(this.Ce), r = `${e.Ir}:${e.Br}:${e.Kr}:${s[2]}:${s[3]}`;
    if (this.co.get(t.shader) === r) return;
    const n = `${e.Ir}:${e.Br}:${s[2]}:${s[3]}`;
    this.lo !== n && (this.Co(e, s[2], s[3]), this.lo = n), t.shader.oe({ Uy: s[2] / s[3], Uz: this.fo, UA: this.do, u_tmUseLighting: e.Yr || e.Gr > 0 || e.Qr[0] !== 0 || e.Qr[1] !== 0 || e.Qr[2] !== 0, u_tmAmbientLightColor: e.Qr, u_tmPointLightCount: e.Gr, u_tmPointLightPositions: e.Hr, u_tmPointLightColors: e.Vr, u_tmLightFalloff: e.Xr }), this.co.set(t.shader, r);
  }
  Co(t, e, s) {
    const r = Math.max(1, s), n = Math.max(1 / 4096, e / r), h = t.ds, a = t._s;
    if (this.po[0] = t.Yi, this.po[1] = t.Wi, this.po[2] = t.Zi, this.mo[0] = t.$i, this.mo[1] = t.qi, this.mo[2] = t.Ji, t.ts) {
      const c = 0.5 * r / Math.tan(0.5 * t.ss);
      this._o[0] = this.po[0], this._o[1] = this.po[1], this._o[2] = this.po[2] + c, Oe(this._o, this.po, this.mo, this.fo);
    } else this._o[0] = t.es, this._o[1] = t.rs, this._o[2] = t.ns, Oe(this._o, this.po, this.mo, this.fo);
    if (t.ps) {
      const c = 0.5 * e, u = 0.5 * r;
      return void (function(l, f, d, p, y, w, v = new Float32Array(16)) {
        const g = 1 / (l - f), b = 1 / (d - p), A = 1 / (y - w);
        v[0] = -2 * g, v[1] = 0, v[2] = 0, v[3] = 0, v[4] = 0, v[5] = -2 * b, v[6] = 0, v[7] = 0, v[8] = 0, v[9] = 0, v[10] = 2 * A, v[11] = 0, v[12] = (l + f) * g, v[13] = (p + d) * b, v[14] = (w + y) * A, v[15] = 1;
      })(-c, c, -u, u, h, a, this.do);
    }
    (function(c, u, l, f, d = new Float32Array(16)) {
      const p = 1 / Math.tan(0.5 * c), y = 1 / (l - f);
      d[0] = p / u, d[1] = 0, d[2] = 0, d[3] = 0, d[4] = 0, d[5] = p, d[6] = 0, d[7] = 0, d[8] = 0, d[9] = 0, d[10] = (f + l) * y, d[11] = -1, d[12] = 0, d[13] = 0, d[14] = 2 * f * l * y, d[15] = 0;
    })(t.ss, n, h, a, this.do);
  }
  L() {
    for (const t of this.no.values()) t.L();
    this.no.clear(), this.oo.L(), this.ho.L();
  }
}
const bs = "vec3 rotateAroundX(vec3 A,float B){float C=cos(B);float D=sin(B);return vec3(A.x,A.y*C-A.z*D,A.y*D+A.z*C);}vec3 rotateAroundY(vec3 A,float B){float C=cos(B);float D=sin(B);return vec3(A.x*C+A.z*D,A.y,-A.x*D+A.z*C);}vec3 rotateAroundZ(vec3 A,float B){float C=cos(B);float D=sin(B);return vec3(A.x*C-A.y*D,A.x*D+A.y*C,A.z);}vec3 applyRotation(vec3 A,vec3 E){vec3 F=A;if(E.z!=0.0f){F=rotateAroundZ(F,E.z);}if(E.y!=0.0f){F=rotateAroundY(F,E.y);}if(E.x!=0.0f){F=rotateAroundX(F,E.x);}return F;}", Nt = `#version 300 es
in vec4 A0;in vec2 A1;in vec2 A2;in vec2 A3;in vec3 A4;in vec4 A5;in vec4 A6;in vec4 A7;in vec3 A8;in vec3 A9;in vec4 Aa;in vec4 Ab;in vec3 Ac;uniform mat4 Uz;uniform mat4 UA;out vec2 v_uv;out vec2 v_textureUv;out vec3 v_glyphIndex;out vec4 v_glyphColor;out vec4 v_cellColor;out vec4 v_glyphFlags;out vec3 v_worldPosition;out vec3 v_normal;out float v_geometryType;const float A=6.28318530718f;const int B=2;const int C=3;const int D=4;const int E=5;const int F=6;const int G=7;const int H=8;const int I=9;const int J=10;
` + bs + `
vec2 K(float L,vec2 M,vec2 N,vec2 O,vec2 P){float Q=1.0f-L;float R=Q*Q;float S=R*Q;float T=L*L;float U=T*L;return S*M+3.0f*R*L*N+3.0f*Q*T*O+U*P;}vec2 V(float L,vec2 M,vec2 N,vec2 O,vec2 P){float Q=1.0f-L;float R=Q*Q;float T=L*L;return-3.0f*R*M+3.0f*(R-2.0f*Q*L)*N+3.0f*(2.0f*Q*L-T)*O+3.0f*T*P;}void main(){vec2 W=A1;vec2 X=A1;v_glyphIndex=A4;v_glyphColor=A5;v_cellColor=A6;v_glyphFlags=A7;vec4 Y=Aa;vec4 Z=Ab;vec2 a=A3;vec2 b=A2;float c=Ac.x;float d=Ac.y;int e=int(Ac.z);vec3 f=vec3(0.0f);if(e==D){float L=clamp(A0.x,0.0f,1.0f);vec2 M=Z.xy;vec2 N=Y.xy;vec2 O=Y.zw;vec2 P=Z.zw;vec2 g=K(L,M,N,O,P);vec2 h=V(L,M,N,O,P);float i=length(h);vec2 j=i>0.0f?h/i:vec2(1.0f,0.0f);vec2 k=vec2(-j.y,j.x);vec2 l=g+k*A0.y*a.y;f=vec3(l,d);}else if(e==C){float m=mod(Y.x,A);if(m<0.0f){m+=A;}float n=mod(Y.y,A);if(n<0.0f){n+=A;}float o=m-n;if(o<=0.0f){o+=A;}float p=m-A0.x*o;vec2 q=vec2(cos(p),sin(p))*A0.y;vec2 l=q*a+b;f=vec3(l,d);}else if(e==B){vec2 l=A0.xy*a+b;f=vec3(l,d);}else if(e==J){vec2 l=A0.xy*a+b;f=vec3(l,A1.x*c+d);}else if(e==G){float r=max(0.0f,a.x*0.5f);float s=max(0.0f,c*0.5f);float t=max(0.0f,a.y*0.5f);float u=max(0.0f,r-t);float v=max(0.0f,s-t);float w=A0.x;float x=A0.y;float y=A0.z;float z=A0.w;W=vec2(y,z);float AA=u+t*y;float AB=v+t*y;f=vec3(AA*w+b.x,t*z+b.y,AB*x+d);}else if(e==E||e==F||e==H||e==I){vec3 AC=A0.xyz;W=vec2(AC.z,0.0f);f=vec3(A0.x*a.x+b.x,A0.y*a.y+b.y,A0.z*c+d);}vec3 AD=applyRotation(f,A9);vec3 AE=AD+A8;vec3 AF=vec3(0.0f,0.0f,1.0f);v_uv=W;v_textureUv=X;v_worldPosition=AE;v_normal=AF;v_geometryType=float(e);vec4 AG=UA*Uz*vec4(AE,1.0f);AG.y=-AG.y;gl_Position=AG;}`, As = `#version 300 es
in vec2 A0;in vec2 A1;in vec2 A2;in vec2 A3;in vec3 A4;in vec4 A5;in vec4 A6;in vec4 A7;in vec3 A8;in vec3 A9;in vec3 Ac;uniform mat4 Uz;uniform mat4 UA;out vec2 v_uv;out vec2 v_textureUv;out vec3 v_glyphIndex;out vec4 v_glyphColor;out vec4 v_cellColor;out vec4 v_glyphFlags;out vec3 v_worldPosition;out vec3 v_normal;out float v_geometryType;const float A=2.0f;
` + bs + `
void main(){v_uv=A1;v_textureUv=A1;v_glyphIndex=A4;v_glyphColor=A5;v_cellColor=A6;v_glyphFlags=A7;vec2 B=A0.xy*A3+A2;float C=Ac.y;vec3 D=vec3(B,C);vec3 E=applyRotation(D,A9)+A8;v_worldPosition=E;v_normal=vec3(0.0f,0.0f,1.0f);v_geometryType=A;vec4 F=UA*Uz*vec4(E,1.0f);F.y=-F.y;gl_Position=F;}`, Vt = "uniform bool u_tmUseLighting;uniform vec3 u_tmAmbientLightColor;uniform int u_tmPointLightCount;uniform vec3 u_tmPointLightPositions[5];uniform vec3 u_tmPointLightColors[5];uniform vec3 u_tmLightFalloff;const int TM_MAX_POINT_LIGHTS=5;vec3 tmComputeGeometricNormal(vec3 A){vec3 B=cross(dFdy(A),dFdx(A));float C=length(B);if(C<=0.000001f){return vec3(0.0f,0.0f,1.0f);}return B/C;}vec3 tmApplyLighting(vec3 D,vec3 A){if(!u_tmUseLighting){return D;}vec3 E=D*u_tmAmbientLightColor;if(u_tmPointLightCount>0){vec3 B=tmComputeGeometricNormal(A);for(int F=0;F<TM_MAX_POINT_LIGHTS;F++){if(F>=u_tmPointLightCount){break;}vec3 G=u_tmPointLightPositions[F]-A;float H=length(G);vec3 I=H>0.000001f?G/H:B;float J=max(dot(B,I),0.0f);float K=u_tmLightFalloff.x+H*u_tmLightFalloff.y+H*H*u_tmLightFalloff.z;float L=K>0.0f?1.0f/K:1.0f;E+=D*u_tmPointLightColors[F]*(J*L);}}return clamp(E,0.0f,1.0f);}", Hi = `#version 300 es
precision highp float;in vec3 v_glyphIndex;in vec4 v_glyphColor;in vec4 v_cellColor;in vec4 v_glyphFlags;in vec3 v_worldPosition;layout(location=0)out vec4 o_character;layout(location=1)out vec4 o_primaryColor;layout(location=2)out vec4 o_secondaryColor;layout(location=3)out vec4 o_statePayload;
` + Vt + `
void main(){int A=int(v_glyphFlags.r>0.5?1:0);int B=int(v_glyphFlags.g>0.5?1:0);int C=int(v_glyphFlags.b>0.5?1:0);float D=float(A|(B<<1)|(C<<2))/255.;o_character=vec4(v_glyphIndex.xy,D,clamp(v_glyphFlags.a,0.,1.));vec3 E=tmApplyLighting(v_glyphColor.rgb,v_worldPosition);vec3 F=tmApplyLighting(v_cellColor.rgb,v_worldPosition);o_primaryColor=vec4(E,v_glyphColor.a);o_secondaryColor=vec4(F,v_cellColor.a);o_statePayload=vec4(0.);}`, Oi = `#version 300 es
precision highp float;in vec2 v_textureUv;in vec3 v_worldPosition;uniform sampler2D U9;uniform bool Ua;uniform bool Ub;uniform bool Uc;uniform float Ud;uniform float Ue;uniform float Uf;uniform bool Ug;uniform vec4 Uh;uniform bool Ui;uniform vec4 Uj;uniform int Uk;uniform sampler2D Ul;uniform ivec2 Um;layout(location=0)out vec4 o_character;layout(location=1)out vec4 o_primaryColor;layout(location=2)out vec4 o_secondaryColor;layout(location=3)out vec4 o_statePayload;
` + Vt + `
float A(vec3 B){return dot(B,vec3(0.299f,0.587f,0.114f));}vec3 C(int D){int E=max(Um.x,1);int F=D/E;int G=D%E;return texelFetch(Ul,ivec2(G,F),0).rgb;}void main(){vec2 H=vec2(v_textureUv.x,1.0f-v_textureUv.y);vec4 I=texture(U9,H);if(Ua){I.rgb=vec3(1.0f)-I.rgb;}float J=A(I.rgb);if(I.a<0.01f||J<Ue||J>Uf){discard;}vec2 K=vec2(0.0f);if(Uk>0){float L=float(Uk);float M=clamp(J*(L-1.0f),0.0f,L-1.0f);int N=int(floor(M+0.5f));K=C(N).xy;}vec4 O=Ug?Uh:I;vec4 P=Ui?Uj:I;vec3 Q=tmApplyLighting(O.rgb,v_worldPosition);vec3 R=tmApplyLighting(P.rgb,v_worldPosition);int S=int(Ua?1:0);int T=int(Ub?1:0);int U=int(Uc?1:0);float V=float(S|(T<<1)|(U<<2))/255.0f;o_character=vec4(K,V,clamp(Ud,0.0f,1.0f));o_primaryColor=vec4(Q,O.a);o_secondaryColor=vec4(R,P.a);o_statePayload=vec4(0.0f);}`, Ye = `#version 300 es
precision highp float;in vec2 v_textureUv;in vec3 v_worldPosition;uniform sampler2D U1;uniform sampler2D U2;uniform sampler2D U3;uniform sampler2D U4;uniform vec2 U5;uniform bool U6;uniform bool U7;uniform bool U8;layout(location=0)out vec4 o_character;layout(location=1)out vec4 o_primaryColor;layout(location=2)out vec4 o_secondaryColor;layout(location=3)out vec4 o_statePayload;
` + Vt + `
void main(){vec2 A=vec2(v_textureUv.x,1.-v_textureUv.y);vec2 B=A*U5;vec2 C=(floor(B)+0.5f)/U5;vec4 D=texture(U1,C);vec4 E=U6?texture(U2,C):vec4(0.);if(U6&&E.a==0.){discard;}vec4 F=U7?texture(U3,C):vec4(0.);vec4 G=U8?texture(U4,C):vec4(0.);vec3 H=tmApplyLighting(E.rgb,v_worldPosition);vec3 I=tmApplyLighting(F.rgb,v_worldPosition);o_character=D;o_primaryColor=vec4(H,E.a);o_secondaryColor=vec4(I,F.a);o_statePayload=G;}`;
class ki {
  constructor(t) {
    o(this, "So", 0);
    o(this, "he");
    o(this, "Eo");
    o(this, "Fo");
    o(this, "Ve");
    o(this, "To");
    this.he = new rt(t, Nt, Hi), this.Eo = new rt(t, Nt, Oi), this.Fo = new rt(t, Nt, Ye), this.Ve = new rt(t, As, Ye), this.To = { id: this.So++, shader: this.he, uniforms: Object.freeze({}), isBuiltIn: !0 };
  }
  Xe(t, e = {}) {
    return { id: this.So++, shader: t, uniforms: Object.freeze({ ...e }), isBuiltIn: !1 };
  }
  Uo(t) {
    return this.Xe(this.Eo, t);
  }
  Po(t) {
    return this.Xe(this.Fo, t);
  }
  L() {
    this.he.dispose(), this.Eo.dispose(), this.Fo.dispose(), this.Ve.dispose();
  }
}
class Ni {
  constructor() {
    o(this, "Lo", []);
    o(this, "Do", 1);
    o(this, "ko", 0);
  }
  Ro(t, e) {
    if (this.ko >= this.Lo.length) {
      const r = { id: this.Do++, type: t, params: {}, state: wt.Vn(), material: e };
      this.Lo.push(r);
    }
    const s = this.Lo[this.ko];
    return s.id = this.Do++, s.type = t, s.material = e, this.ko++, s;
  }
  Oo(t, e) {
    var r;
    if (t.data && t.data.length >= e) return;
    let s = Math.max(B.FLOATS_PER_INSTANCE, ((r = t.data) == null ? void 0 : r.length) ?? 0);
    for (; s < e; ) s *= 2;
    t.data = new Float32Array(s);
  }
  Io(t, e) {
    var r;
    if (t.vertices && t.vertices.length >= e) return;
    let s = Math.max(24, ((r = t.vertices) == null ? void 0 : r.length) ?? 0);
    for (; s < e; ) s *= 2;
    t.vertices = new Float32Array(s);
  }
  Bo(t, e, s, r) {
    const n = this.Ro(_.RECTANGLE, r), h = n.params;
    return h.width = t, h.height = e, s.Xn(n.state), n.id;
  }
  No(t, e, s, r, n, h) {
    const a = this.Ro(_.LINE, h), c = a.params;
    return c.x1 = t, c.y1 = e, c.x2 = s, c.y2 = r, n.Xn(a.state), a.id;
  }
  jo(t, e, s, r) {
    const n = this.Ro(_.ELLIPSE, r), h = n.params;
    return h.width = t, h.height = e, s.Xn(n.state), n.id;
  }
  zo(t, e, s, r, n, h) {
    const a = this.Ro(_.ARC, h), c = a.params;
    return c.width = t, c.height = e, c.start = s, c.stop = r, n.Xn(a.state), a.id;
  }
  Qo(t, e, s, r, n, h, a, c, u, l) {
    const f = this.Ro(_.BEZIER_CURVE, l), d = f.params;
    return d.x1 = t, d.y1 = e, d.cp1x = s, d.cp1y = r, d.cp2x = n, d.cp2y = h, d.x2 = a, d.y2 = c, u.Xn(f.state), f.id;
  }
  Go(t, e, s, r, n, h) {
    const a = this.Ro(t, h), c = a.params;
    return c.width = e, c.height = s, c.depth = r, n.Xn(a.state), a.id;
  }
  Ho(t, e, s, r) {
    const n = this.Ro(fe, r), h = n.params, a = e * B.FLOATS_PER_INSTANCE;
    this.Oo(h, a);
    for (let c = 0; c < a; c++) h.data[c] = t[c];
    return h.instanceCount = e, s.Xn(n.state), n.id;
  }
  Vo(t, e, s, r) {
    if (e === 0) return 0;
    const n = this.Ro(ys, r), h = n.params, a = 4 * e;
    this.Io(h, a);
    for (let c = 0; c < a; c++) h.vertices[c] = t[c];
    return h.vertexCount = e, s.Xn(n.state), n.id;
  }
  Dh() {
    this.ko = 0;
  }
  [Symbol.iterator]() {
    let t = 0;
    const e = this.ko, s = this.Lo;
    return { next: () => t < e ? { value: s[t++], done: !1 } : { value: void 0, done: !0 } };
  }
}
class Bi {
  constructor(t, e = 64) {
    o(this, "Xo", /* @__PURE__ */ new Map());
    o(this, "Yo", /* @__PURE__ */ new WeakMap());
    o(this, "fh");
    o(this, "Ko", 0);
    o(this, "Wo", 1);
    this.Ce = t, this.fh = Math.max(1, e);
  }
  resolve(t, e = null) {
    const s = this.Zo(), r = Math.min(s * s, 65535);
    if (t.length > r) throw new E("[textmode.js] Character palette exceeds the supported GPU texture capacity.", { requestedCharacters: t.length, maxCharacters: r, maxTextureSize: s });
    const n = this.$o(t), h = `${e ? this.qo(e) : "none"}:${t.length}:${this.Jo(n)}`, a = this.Xo.get(h);
    if (a && this.ta(a.data, n)) return a.lastUsed = ++this.Ko, a;
    const c = this.W(t, n, h);
    return this.Xo.set(h, c), this.ia(), c;
  }
  dispose() {
    for (const t of this.Xo.values()) this.Ce.deleteTexture(t.texture);
    this.Xo.clear();
  }
  get size() {
    return this.Xo.size;
  }
  W(t, e, s) {
    const r = Math.max(t.length, 1), n = this.Zo(), h = Math.min(n, Math.ceil(Math.sqrt(r))), a = Math.max(1, Math.ceil(r / h)), c = new Uint8Array(h * a * 4);
    c.set(e);
    const u = this.Ce.createTexture();
    if (!u) throw new E("[textmode.js] Failed to create character palette texture.");
    const l = this.Ce;
    return l.bindTexture(l.TEXTURE_2D, u), l.texParameteri(l.TEXTURE_2D, l.TEXTURE_MIN_FILTER, l.NEAREST), l.texParameteri(l.TEXTURE_2D, l.TEXTURE_MAG_FILTER, l.NEAREST), l.texParameteri(l.TEXTURE_2D, l.TEXTURE_WRAP_S, l.CLAMP_TO_EDGE), l.texParameteri(l.TEXTURE_2D, l.TEXTURE_WRAP_T, l.CLAMP_TO_EDGE), l.pixelStorei(l.UNPACK_FLIP_Y_WEBGL, 0), l.texImage2D(l.TEXTURE_2D, 0, l.RGBA8, h, a, 0, l.RGBA, l.UNSIGNED_BYTE, c), l.bindTexture(l.TEXTURE_2D, null), { texture: u, columns: h, rows: a, count: t.length, key: s, data: e, lastUsed: ++this.Ko };
  }
  $o(t) {
    const e = new Uint8Array(4 * Math.max(t.length, 1));
    for (let s = 0; s < t.length; s++) {
      const r = t[s], n = 4 * s;
      e[n] = this.sa(r[0]), e[n + 1] = this.sa(r[1]), e[n + 2] = this.sa(r[2]), e[n + 3] = 255;
    }
    return e;
  }
  sa(t) {
    return Math.max(0, Math.min(255, Math.round(255 * t)));
  }
  Zo() {
    return Math.max(1, Number(this.Ce.getParameter(this.Ce.MAX_TEXTURE_SIZE)) || 4096);
  }
  Jo(t) {
    let e = 2166136261;
    for (let s = 0; s < t.length; s++) e ^= t[s], e = Math.imul(e, 16777619);
    return (e >>> 0).toString(16);
  }
  ta(t, e) {
    if (t.length !== e.length) return !1;
    for (let s = 0; s < t.length; s++) if (t[s] !== e[s]) return !1;
    return !0;
  }
  qo(t) {
    const e = t;
    return (e.id ?? e.ea ?? this.ra(t)) + "";
  }
  ra(t) {
    const e = this.Yo.get(t);
    if (e) return e;
    const s = this.Wo++;
    return this.Yo.set(t, s), s;
  }
  ia() {
    for (; this.Xo.size > this.fh; ) {
      let t = null, e = 1 / 0;
      for (const [r, n] of this.Xo) n.lastUsed < e && (e = n.lastUsed, t = r);
      if (!t) return;
      const s = this.Xo.get(t);
      s && (this.Ce.deleteTexture(s.texture), this.Xo.delete(t));
    }
  }
}
class Xi {
  constructor(t) {
    o(this, "na", /* @__PURE__ */ new Map());
    o(this, "ha", /* @__PURE__ */ new WeakMap());
    o(this, "oa", 1);
    this.H = t;
  }
  materialFor(t) {
    t.kind === "source" && t.source.aa();
    const e = this.ca(t), s = this.na.get(e);
    if (s) return s;
    const r = t.kind === "source" ? this.H.materialManager.Uo(this.H.ua(t)) : this.H.materialManager.Po(this.H.la(t));
    return this.na.set(e, r), r;
  }
  dispose() {
    this.na.clear();
  }
  get size() {
    return this.na.size;
  }
  ca(t) {
    return t.kind === "source" ? ["source", this.fa(t.source.texture), this.fa(t.palette.texture), t.palette.count, t.palette.columns, t.palette.rows, t.brightnessStart, t.brightnessEnd, t.invert ? 1 : 0, t.flipX ? 1 : 0, t.flipY ? 1 : 0, t.charRotation, t.charColorMode, t.cellColorMode, ...t.charColor, ...t.cellColor].join("|") : ["framebuffer", this.ra(t.framebuffer), t.attachmentCount, t.width, t.height, ...t.textures.map((e) => this.fa(e))].join("|");
  }
  fa(t) {
    return this.ra(t);
  }
  ra(t) {
    const e = this.ha.get(t);
    if (e) return e;
    const s = this.oa++;
    return this.ha.set(t, s), s;
  }
}
class Yi {
  constructor(t) {
    o(this, "Ce");
    o(this, "ao", null);
    o(this, "da");
    o(this, "_a");
    o(this, "pa");
    o(this, "ma");
    o(this, "ga");
    o(this, "va");
    o(this, "ya");
    o(this, "wa", null);
    o(this, "ba", {});
    o(this, "Ma", []);
    o(this, "xa", []);
    o(this, "Ca", []);
    o(this, "Sa", []);
    o(this, "Ea", null);
    o(this, "Fa", [0, 0, 0, 0]);
    o(this, "Ta", 1);
    o(this, "Pa", !0);
    o(this, "La", !0);
    o(this, "Da", !1);
    o(this, "ka", new Float32Array(4));
    o(this, "Ra", new Float32Array(12));
    o(this, "Oa", /* @__PURE__ */ new Set());
    this.Ce = t, t.enable(t.DEPTH_TEST), t.depthFunc(t.LEQUAL), t.clearDepth(1), t.depthMask(!0), this.Pa = !0, this.La = !0, t.disable(t.CULL_FACE), this.ga = new wt(), this._a = new ki(t), this.pa = new Bi(t), this.ma = new Xi(this), this.va = new Ni(), this.da = new Ii(t), this.ya = new di(t);
    const e = [0, 0, t.canvas.width, t.canvas.height];
    te(t, e), this.xa.push(null), this.Ca.push(e), this.Sa.push(1), this.Ea = null, this.Fa = e, this.Ta = 1;
  }
  Ie() {
    this.xa.push(this.Ea), this.Ca.push([...this.Fa]), this.Sa.push(this.Ta);
  }
  Qe() {
    const t = this.xa.pop() ?? null, e = this.Ca.pop() ?? [0, 0, this.Ce.canvas.width, this.Ce.canvas.height], s = this.Sa.pop() ?? 1;
    this.Be(t, e[2], e[3], s);
  }
  Be(t, e, s, r = 1) {
    const n = this.Ce;
    this.Ea !== t && (n.bindFramebuffer(n.FRAMEBUFFER, t), this.Ea = t), this.Ta = r;
    const h = [0, 0, e, s];
    this.Fa[0] === h[0] && this.Fa[1] === h[1] && this.Fa[2] === h[2] && this.Fa[3] === h[3] || (n.viewport(...h), te(n, h), this.Fa = h);
  }
  he(t) {
    this.ao !== t && (this.ao = t, t.er());
  }
  Ia(t) {
    if (this.Da = t, t) this.Oa.clear();
    else {
      for (const e of this.Oa) e.Ba();
      this.Oa.clear();
    }
  }
  Na() {
    return this.Da;
  }
  ja(t) {
    this.Oa.add(t);
  }
  sr(t, e) {
    return new rt(this.Ce, t, e);
  }
  za(t) {
    this.wa = t, t && (this.ba = {});
  }
  Qa() {
    this.wa = null, this.ba = {};
  }
  nr(t, e) {
    this.ba[t] = e;
  }
  oe(t) {
    Object.assign(this.ba, t);
  }
  Ga(t = !1) {
    this.Ma.push({ shader: this.wa, uniforms: { ...this.ba } }), t && this.Qa();
  }
  Ha() {
    const t = this.Ma.pop();
    t && (this.wa = t.shader, this.ba = t.shader ? { ...t.uniforms } : {});
  }
  Va(t) {
    return new rt(this.Ce, Nt, t);
  }
  Xa() {
    if (this.wa) return this._a.Xe(this.wa, this.ba);
    const t = this.ga.Qn.current;
    return t.kind === "source" || t.kind === "framebuffer" ? this.ma.materialFor(t) : this._a.To;
  }
  ua(t) {
    return t.source.aa(), { U9: t.source.texture, Ua: t.invert, Ub: t.flipX, Uc: t.flipY, Ud: t.charRotation, Ue: t.brightnessStart, Uf: t.brightnessEnd, Ug: t.charColorMode === "fixed", Uh: t.charColor, Ui: t.cellColorMode === "fixed", Uj: t.cellColor, Uk: t.palette.count, Ul: t.palette.texture, Um: [t.palette.columns, t.palette.rows] };
  }
  la(t) {
    const e = t.textures, s = t.attachmentCount > 1, r = t.attachmentCount > 2, n = t.attachmentCount > 3;
    return { U1: e[0], U2: s ? e[1] : e[0], U3: r ? e[2] : e[0], U4: n ? e[3] : e[0], U5: [t.width, t.height], U6: s, U7: r, U8: n };
  }
  Ya(t, e, s, r) {
    t instanceof gt || !r || t.Ka(r);
    const n = t instanceof gt ? [t.Ge()] : t.Wa(), h = e ?? t.width, a = s ?? t.height;
    for (const c of n) this.va.Bo(h, a, this.ga, c);
    t instanceof gt || !t.Za() || this.ja(t);
  }
  ae(t, e, s, r) {
    this.ya.ih(t, e, s, r);
  }
  $a(t, e) {
    this.va.Bo(t, e, this.ga, this.Xa());
  }
  Ho(t, e) {
    e !== 0 && this.va.Ho(t, e, this.ga, this.Xa());
  }
  qa(t, e, s, r) {
    this.va.No(t, e, s, r, this.ga, this.Xa());
  }
  Ja(t, e) {
    this.va.Vo(t, e, this.ga, this.Xa());
  }
  tc(t, e) {
    this.va.jo(t, e, this.ga, this.Xa());
  }
  sc(t, e, s, r, n, h) {
    this.Ra[0] = t, this.Ra[1] = e, this.Ra[2] = 0, this.Ra[3] = 0, this.Ra[4] = s, this.Ra[5] = r, this.Ra[6] = 0, this.Ra[7] = 0, this.Ra[8] = n, this.Ra[9] = h, this.Ra[10] = 0, this.Ra[11] = 0, this.va.Vo(this.Ra, 3, this.ga, this.Xa());
  }
  ec(t, e, s, r, n, h, a, c) {
    this.va.Qo(t, e, s, r, n, h, a, c, this.ga, this.Xa());
  }
  rc(t, e, s, r) {
    this.va.zo(t, e, s, r, this.ga, this.Xa());
  }
  nc(t, e, s) {
    this.va.Go(_.BOX, t, e, s, this.ga, this.Xa());
  }
  hc(t) {
    const e = 2 * t;
    this.va.Go(_.SPHERE, e, e, e, this.ga, this.Xa());
  }
  oc(t, e) {
    const s = 2 * (t + e);
    this.va.Go(_.TORUS, s, 2 * e, s, this.ga, this.Xa());
  }
  ac(t, e) {
    const s = 2 * t;
    this.va.Go(_.CONE, s, e, s, this.ga, this.Xa());
  }
  cc(t, e) {
    const s = 2 * t;
    this.va.Go(_.CYLINDER, s, e, s, this.ga, this.Xa());
  }
  uc(t, e, s) {
    this.va.Go(_.ELLIPSOID, 2 * t, 2 * e, 2 * s, this.ga, this.Xa());
  }
  Z(t, e, s = 1, r = {}) {
    return new gt(this.Ce, t, e, s, r, this);
  }
  lc(t, e = t, s = t, r = 255) {
    this.ga.gn.Pn(t, e ?? t, s ?? t, r);
    const [n, h, a, c] = this.ga.gn.dn;
    this.fc(n, h, a, c);
  }
  Dh(t = 0, e = 0, s = 0, r = 0) {
    this.fc(t, e, s, r);
  }
  fc(t, e, s, r) {
    const n = this.Ce, h = this.ka;
    if (this.Ta > 1) {
      h[0] = 1, h[1] = 1, h[2] = 0, h[3] = 0, n.clearBufferfv(n.COLOR, 0, h), h[0] = 0, h[1] = 0, h[2] = 0, h[3] = 0, n.clearBufferfv(n.COLOR, 1, h), this.Ta >= 3 && (h[0] = t, h[1] = e, h[2] = s, h[3] = r, n.clearBufferfv(n.COLOR, 2, h)), this.Ta >= 3 && (h[0] = 0, h[1] = 0, h[2] = 0, h[3] = 0);
      for (let a = 3; a < this.Ta; a++) n.clearBufferfv(n.COLOR, a, h);
    } else n.clearColor(t, e, s, r), n.clear(n.COLOR_BUFFER_BIT);
  }
  dc() {
    const t = [0, 0, this.Ce.canvas.width, this.Ce.canvas.height];
    this.Ce.viewport(...t), te(this.Ce, t), this.Fa = t, this.Ca.length > 0 && (this.Ca[0] = t);
  }
  _c(t) {
    this.Pa !== t && (t ? this.Ce.enable(this.Ce.DEPTH_TEST) : this.Ce.disable(this.Ce.DEPTH_TEST), this.Pa = t);
  }
  mc(t) {
    this.La !== t && (this.Ce.depthMask(t), this.La = t);
  }
  gc() {
    return this.Pa;
  }
  vc() {
    return this.La;
  }
  ze() {
    const t = this.va;
    this.da.vo(t), t.Dh(), this.ao = null;
  }
  L() {
    this.ma.dispose(), this.pa.dispose(), this._a.L(), this.da.L(), this.ya.L();
  }
  get context() {
    return this.Ce;
  }
  get state() {
    return this.ga;
  }
  get materialManager() {
    return this._a;
  }
  get glyphPaletteService() {
    return this.pa;
  }
}
class zi {
  constructor(t = {}) {
    o(this, "p");
    o(this, "yc", null);
    o(this, "wc", !1);
    o(this, "bc");
    o(this, "Mc", null);
    o(this, "xc", !0);
    o(this, "Ce", null);
    o(this, "Cc", null);
    o(this, "Sc", null);
    o(this, "Ec", !1);
    o(this, "Fc");
    if (this.wc = t.overlay ?? !1, this.Fc = t.pixelDensity ?? 1, t.gl) this.Mc = t.gl, this.p = t.gl.canvas, this.bc = !1, this.xc = !1;
    else if (this.wc && t.canvas) this.yc = t.canvas, this.p = this.Tc(), this.bc = !0, this.Pc();
    else if (t.canvas) {
      if (typeof HTMLVideoElement < "u" && t.canvas instanceof HTMLVideoElement) throw new E("Video elements are only supported in overlay mode.");
      this.p = t.canvas, this.bc = !1;
    } else this.p = this.Lc(t.width, t.height), this.bc = !0;
    typeof HTMLCanvasElement < "u" && this.p instanceof HTMLCanvasElement && (this.p.style.imageRendering = "pixelated");
  }
  Lc(t, e) {
    const s = document.createElement("canvas");
    s.className = "textmodeCanvas", s.style.imageRendering = "pixelated";
    const r = t || 800, n = e || 600;
    return s.width = r * this.Fc, s.height = n * this.Fc, s.style.width = r + "px", s.style.height = n + "px", this.Dc(s), s;
  }
  Dc(t) {
    const e = () => {
      if (this.Ec || t.parentNode) return;
      const s = document.body;
      s && s.appendChild(t);
    };
    document.body ? e() : (this.Cc = () => {
      this.Cc = null, e();
    }, document.addEventListener("DOMContentLoaded", this.Cc, { once: !0 }));
  }
  Tc() {
    const t = document.createElement("canvas");
    t.className = "textmodeCanvas", t.style.imageRendering = "pixelated";
    const e = this.yc.getBoundingClientRect();
    let s = Math.round(e.width), r = Math.round(e.height);
    if (typeof HTMLVideoElement < "u" && this.yc instanceof HTMLVideoElement) {
      const a = this.yc;
      (s === 0 || r === 0) && a.videoWidth > 0 && a.videoHeight > 0 && (s = a.videoWidth, r = a.videoHeight);
    }
    t.width = s * this.Fc, t.height = r * this.Fc, t.style.width = s + "px", t.style.height = r + "px", t.style.position = "absolute";
    const n = window.getComputedStyle(this.yc);
    let h = parseInt(n.zIndex || "0", 10);
    return isNaN(h) && (h = 0), t.style.zIndex = "" + (h + 1), t;
  }
  Pc() {
    var t;
    this.kc(), this.Rc(), (t = this.yc) != null && t.parentNode || document.readyState !== "loading" || (this.Sc = () => {
      this.Sc = null, this.Ec || (this.kc(), this.Rc());
    }, document.addEventListener("DOMContentLoaded", this.Sc, { once: !0 }));
  }
  Rc() {
    var t;
    this.p instanceof HTMLCanvasElement && this.yc && !this.p.parentNode && ((t = this.yc.parentNode) == null || t.insertBefore(this.p, this.yc.nextSibling));
  }
  kc() {
    if (!this.yc || !(this.p instanceof HTMLCanvasElement)) return;
    const t = this.yc.getBoundingClientRect(), e = this.yc.offsetParent;
    if (e && e !== document.body) {
      const s = e.getBoundingClientRect();
      this.p.style.top = t.top - s.top + "px", this.p.style.left = t.left - s.left + "px";
    } else this.p.style.top = t.top + window.scrollY + "px", this.p.style.left = t.left + window.scrollX + "px";
  }
  ue(t, e) {
    if (this.wc) {
      const s = this.yc.getBoundingClientRect(), r = Math.round(s.width), n = Math.round(s.height);
      this.p.width = r * this.Fc, this.p.height = n * this.Fc, this.p.style.width = r + "px", this.p.style.height = n + "px", this.kc();
    } else {
      const s = t ?? Math.round(this.p.width / this.Fc), r = e ?? Math.round(this.p.height / this.Fc);
      this.p.width = s * this.Fc, this.p.height = r * this.Fc, this.p instanceof HTMLCanvasElement && (this.p.style.width = s + "px", this.p.style.height = r + "px");
    }
  }
  Oc() {
    if (this.Mc) return this.Mc;
    const t = this.p.getContext("webgl2", { alpha: !0, premultipliedAlpha: !1, preserveDrawingBuffer: !0, antialias: !1, depth: !0, stencil: !1, powerPreference: "high-performance" });
    if (!t) throw new E("`textmode.js` requires WebGL2 support.");
    return this.Ce = t, t;
  }
  L() {
    if (this.Ec || (this.Ec = !0, this.Ic(), !this.xc)) return;
    const t = this.Ce ?? this.Mc;
    if (t) {
      const e = t.getExtension("WEBGL_lose_context");
      e == null || e.loseContext();
    }
    this.bc && typeof HTMLCanvasElement < "u" && this.p instanceof HTMLCanvasElement && this.p.parentNode && this.p.parentNode.removeChild(this.p);
  }
  Ic() {
    this.Cc && (document.removeEventListener("DOMContentLoaded", this.Cc), this.Cc = null), this.Sc && (document.removeEventListener("DOMContentLoaded", this.Sc), this.Sc = null);
  }
  get canvas() {
    return this.p;
  }
  get targetCanvas() {
    return this.yc;
  }
  get width() {
    return this.p.width;
  }
  get height() {
    return this.p.height;
  }
  get ownsContext() {
    return this.xc;
  }
  get pixelDensity() {
    return this.Fc;
  }
  Bc(t) {
    t <= 0 || (this.Fc = t);
  }
}
function It(i) {
  return parseInt(i, 16);
}
const Gi = /^rgba?\(([^)]+)\)$/i;
function nt(i) {
  return Number.isNaN(i = Math.round(i)) ? 0 : X(i, 0, 255);
}
function Ki(i, t = !1) {
  if (!i) return null;
  const e = i.trim().toLowerCase();
  if (!e) return null;
  let s = null;
  return e.startsWith("rgb") && (s = (function(r) {
    const n = Gi.exec(r.trim());
    if (!n) return null;
    const h = n[1].split(",").map((f) => f.trim());
    if (h.length < 3) return null;
    const a = nt(parseFloat(h[0])), c = nt(parseFloat(h[1])), u = nt(parseFloat(h[2]));
    let l = 255;
    if (h[3] !== void 0) {
      const f = h[3].trim();
      let d = parseFloat(f);
      f.endsWith("%") && (d /= 100), l = 255 * X(d, 0, 1);
    }
    return [a, c, u, Math.round(l)];
  })(e)), s && (t || s[3] !== 0) ? s : null;
}
class S {
  constructor(t, e, s, r) {
    o(this, "Nc");
    o(this, "jc");
    o(this, "r");
    o(this, "g");
    o(this, "b");
    o(this, "a");
    this.r = nt(t), this.g = nt(e), this.b = nt(s), this.a = nt(r);
  }
  static zc(t, e, s, r) {
    if (t instanceof S) return t;
    if (Array.isArray(t)) {
      if (t.length < 3) throw Error("Component tuples must include at least RGB values.");
      const [n, h, a] = t, c = t.length === 4 ? t[3] : 255;
      return S.Qc(n, h, a, c);
    }
    if (typeof t == "string") {
      const n = t.trim();
      if (n.length === 0) throw Error("Color strings cannot be empty.");
      const h = Ki(n, !0);
      return h ? S.Qc(...h) : S.Gc(n);
    }
    if (typeof t == "number") return typeof e == "number" && typeof s == "number" ? S.Qc(t, e, s, r ?? 255) : typeof e == "number" ? S.Hc(t, e) : S.Hc(t, r ?? 255);
    throw Error("Unsupported color input passed.");
  }
  static Vc(t, e, s, r, n) {
    if (t instanceof S || typeof t == "string") return S.zc(t);
    const [h, a, c, u] = ni(t, e, s, r, n);
    return S.Qc(h, a, c, u);
  }
  static Qc(t, e, s, r = 255) {
    return new S(t, e, s, r);
  }
  static Hc(t, e = 255) {
    return new S(t, t, t, e);
  }
  static Gc(t) {
    return new S(...(function(e) {
      const s = e.trim().replace(/^#|0x/gi, "");
      if (!/^[0-9A-Fa-f]+$/.test(s)) throw Error("Invalid hex color: " + e);
      const r = (n = s).length === 3 || n.length === 4 ? n.split("").map((h) => h + h).join("") : n;
      var n;
      if (r.length !== 6 && r.length !== 8) throw Error("Invalid hex color: " + e);
      return [It(r.slice(0, 2)), It(r.slice(2, 4)), It(r.slice(4, 6)), r.length === 8 ? It(r.slice(6, 8)) : 255];
    })(t));
  }
  static Xc(t, e, s, r) {
    return new S(Math.round(255 * t), Math.round(255 * e), Math.round(255 * s), Math.round(255 * r));
  }
  get rgb() {
    return [this.r, this.g, this.b];
  }
  get rgba() {
    return this.Nc || (this.Nc = [this.r, this.g, this.b, this.a]), [...this.Nc];
  }
  get normalized() {
    return this.jc || (this.jc = [this.r / 255, this.g / 255, this.b / 255, this.a / 255]), [...this.jc];
  }
  withAlpha(t) {
    return new S(this.r, this.g, this.b, t);
  }
}
class Qi {
  constructor(t, e, s) {
    o(this, "Zc", "brightness");
    o(this, "$c", null);
    o(this, "qc", null);
    o(this, "Jc", null);
    this.Yc = t, this.Kc = e, this.Wc = s;
  }
  get conversionMode() {
    return this.Zc;
  }
  setConversionMode(t, e) {
    e ? (this.$c = t, this.Kc.disposeStack(this.Jc), this.Jc = null) : (this.Zc = t, this.Kc.disposeStack(this.qc), this.qc = null);
  }
  setConversions(t, e) {
    if (!Array.isArray(t)) throw new E("[textmode.js] conversions() expects an array of conversion steps.", { method: "conversions", providedValue: t });
    if (t.length === 0) return this.clearConversions(e), !1;
    const s = t.map((r, n) => this.tu(r, n));
    return e ? (this.$c = null, this.Kc.disposeStack(this.Jc), this.Jc = s) : (this.Kc.disposeStack(this.qc), this.qc = s), !0;
  }
  clearConversions(t) {
    t ? (this.$c = null, this.Kc.disposeStack(this.Jc), this.Jc = []) : (this.Kc.disposeStack(this.qc), this.qc = null);
  }
  clearFrameOverrides() {
    this.$c = null, this.Kc.disposeStack(this.Jc), this.Jc = null;
  }
  getActiveStack() {
    return this.$c !== null ? null : this.Jc !== null ? this.Jc.length > 0 ? this.Jc : null : this.qc;
  }
  getSingleMode() {
    return this.$c ?? this.Zc;
  }
  hasFrameOverrides() {
    return this.$c !== null || this.Jc !== null;
  }
  invalidateMaterials() {
    var t, e;
    (t = this.qc) == null || t.forEach((s) => {
      s.material = null;
    }), (e = this.Jc) == null || e.forEach((s) => {
      s.material = null;
    });
  }
  refreshPalettes() {
    this.iu(this.qc), this.iu(this.Jc);
  }
  dispose() {
    this.Kc.disposeStack(this.qc), this.Kc.disposeStack(this.Jc), this.qc = null, this.Jc = null;
  }
  get debugSnapshot() {
    return { conversionMode: this.Zc, conversionStack: this.qc, frameConversionStack: this.Jc };
  }
  tu(t, e) {
    if (!t || typeof t != "object") throw new E("[textmode.js] Conversion stack steps must be objects.", { method: "conversions", index: e, providedValue: t });
    if (typeof t.mode != "string" || t.mode.trim() === "") throw new E("[textmode.js] Conversion stack step mode must be a non-empty string.", { method: "conversions", index: e, providedValue: t.mode });
    const s = { mode: t.mode, options: this.su(t.options, e), paletteTexture: null, paletteDirty: !1, material: null };
    if (t.characters !== void 0) {
      if (typeof t.characters != "string") throw new E("[textmode.js] Conversion stack step characters must be a string.", { method: "conversions", index: e, providedValue: t.characters });
      s.characters = t.characters, s.glyphColors = this.Yc.getCharacterPalette(t.characters), s.paletteDirty = !0;
    }
    if (t.invert !== void 0 && (s.invert = t.invert ? 1 : 0), t.flipX !== void 0 && (s.flipX = t.flipX ? 1 : 0), t.flipY !== void 0 && (s.flipY = t.flipY ? 1 : 0), t.charRotation !== void 0 && (s.charRotation = jt(t.charRotation)), t.brightnessStart !== void 0 || t.brightnessEnd !== void 0) {
      if (t.brightnessStart === void 0 || t.brightnessEnd === void 0) throw new E("[textmode.js] Conversion stack step brightnessStart and brightnessEnd must be provided together.", { method: "conversions", index: e, brightnessStart: t.brightnessStart, brightnessEnd: t.brightnessEnd });
      const [r, n] = this.eu(t.brightnessStart, t.brightnessEnd, "conversions", e);
      s.brightnessStart = r, s.brightnessEnd = n;
    }
    return t.charColorMode !== void 0 && (this.ru(t.charColorMode, "charColorMode", e), s.charColorMode = t.charColorMode), t.cellColorMode !== void 0 && (this.ru(t.cellColorMode, "cellColorMode", e), s.cellColorMode = t.cellColorMode), t.charColor !== void 0 && (s.charColor = this.Wc(t.charColor)), t.cellColor !== void 0 && (s.cellColor = this.Wc(t.cellColor)), s;
  }
  ru(t, e, s) {
    if (t !== "sampled" && t !== "fixed") throw new E(`[textmode.js] Conversion stack step ${e} must be 'sampled' or 'fixed'.`, { method: "conversions", index: s, providedValue: t });
  }
  su(t, e) {
    if (t === void 0) return {};
    if (t === null || typeof t != "object" || Array.isArray(t)) throw new E("[textmode.js] Conversion stack step options must be an object.", { method: "conversions", index: e, providedValue: t });
    return { ...t };
  }
  eu(t, e, s, r) {
    const n = { method: s, start: t, end: e };
    if (r !== void 0 && (n.index = r), !Number.isFinite(t) || !Number.isFinite(e)) throw new E("[textmode.js] brightness range values must be finite numbers.", n);
    if (t < 0 || t > 255 || e < 0 || e > 255) throw new E("[textmode.js] brightness range values must be between 0 and 255.", n);
    if (t > e) throw new E("[textmode.js] brightness range start must be less than or equal to end.", n);
    return [t / 255, e / 255];
  }
  iu(t) {
    if (t) for (const e of t) e.characters !== void 0 && (e.glyphColors = this.Yc.getCharacterPalette(e.characters), e.paletteDirty = !0, e.material = null);
  }
}
class Zi {
  constructor(t) {
    o(this, "hu", null);
    o(this, "ou", null);
    o(this, "au", !0);
    o(this, "cu", !1);
    o(this, "uu", null);
    this.nu = t;
  }
  setActiveGlyphAtlas(t) {
    this.uu = t, this.markBaseDirty(), this.markFrameDirty();
  }
  markBaseDirty() {
    this.au = !0;
  }
  markFrameDirty() {
    this.cu = !0;
  }
  clearFrame() {
    this.cu = !1;
  }
  getBase(t) {
    return this.hu && !this.au || (this.hu = this.W(t, this.hu), this.au = !1), this.hu;
  }
  getFrame(t) {
    return this.ou && !this.cu || (this.ou = this.W(t, this.ou), this.cu = !1), this.ou;
  }
  getStep(t, e) {
    return t.paletteTexture && !t.paletteDirty || (t.paletteTexture = this.W(e, t.paletteTexture), t.paletteDirty = !1), t.paletteTexture;
  }
  disposeStep(t) {
    t.paletteTexture = null, t.material = null;
  }
  disposeStack(t) {
    if (t) for (const e of t) this.disposeStep(e);
  }
  disposeAll() {
    this.hu = null, this.ou = null;
  }
  get basePalette() {
    return this.hu;
  }
  get framePalette() {
    return this.ou;
  }
  W(t, e) {
    const s = this.nu.resolve(t, this.uu);
    return (e == null ? void 0 : e.texture) === s.texture ? e : s;
  }
}
class ji {
  constructor(t = S.zc) {
    o(this, "uu", null);
    o(this, "vn", null);
    o(this, "un", 0);
    o(this, "pn", 0);
    o(this, "mn", 0);
    o(this, "ln", 0);
    o(this, "lu", 0);
    o(this, "fu", 1);
    o(this, "du", "sampled");
    o(this, "_u", "fixed");
    o(this, "yn", [1, 1, 1, 1]);
    o(this, "wn", [0, 0, 0, 1]);
    o(this, "pu", [0, 0, 0, 1]);
    o(this, "mu", [[0.1, 0, 0]]);
    o(this, "gu", null);
    o(this, "vu", null);
    o(this, "yu", null);
    o(this, "wu", null);
    o(this, "bu", null);
    o(this, "Mu", null);
    o(this, "Au", null);
    o(this, "xu", null);
    o(this, "Cu", null);
    o(this, "Su", null);
    o(this, "Eu", null);
    o(this, "Fu", null);
    this.Wc = t;
  }
  get activeGlyphAtlas() {
    return this.uu;
  }
  setActiveGlyphAtlas(t, e) {
    return this.uu !== t && (this.uu = t, e.setActiveGlyphAtlas(t), this.vn && this.Tu(this.vn, e), !0);
  }
  setInvert(t, e) {
    this.Pu("invert", t ? 1 : 0, e);
  }
  setFlipX(t, e) {
    this.Pu("flipX", t ? 1 : 0, e);
  }
  setFlipY(t, e) {
    this.Pu("flipY", t ? 1 : 0, e);
  }
  setCharRotation(t, e) {
    this.Pu("charRotation", jt(t), e);
  }
  setBrightnessRange(t, e, s) {
    const r = t / 255, n = e / 255;
    s ? (this.bu = r, this.Mu = n) : (this.lu = r, this.fu = n);
  }
  setCharColorMode(t, e) {
    e ? this.Au = t : this.du = t;
  }
  setCellColorMode(t, e) {
    e ? this.xu = t : this._u = t;
  }
  setColor(t, e, s, r, n, h) {
    const a = this.Lu(t, e), c = this.Wc(s, r, n, h);
    kt(a, c.r, c.g, c.b, c.a);
  }
  setCharacters(t, e, s) {
    if (e) {
      const r = this.getCharacterPalette(t);
      return this.Fu = r.length > 0 ? r : null, void (r.length > 0 && s.markFrameDirty());
    }
    this.vn = t, this.Tu(t, s);
  }
  clearFrameOverrides(t) {
    this.gu = null, this.vu = null, this.yu = null, this.wu = null, this.bu = null, this.Mu = null, this.Au = null, this.xu = null, this.Cu = null, this.Su = null, this.Eu = null, this.Fu = null, t.clearFrame();
  }
  hasFrameUniformOverrides() {
    return this.gu !== null || this.vu !== null || this.yu !== null || this.wu !== null || this.bu !== null || this.Mu !== null || this.Au !== null || this.xu !== null || this.Cu !== null || this.Su !== null || this.Eu !== null || this.Fu !== null;
  }
  getCharacterPalette(t) {
    return this.uu ? this.uu.zt(t).filter((e) => Array.isArray(e)) : [];
  }
  createBaseUniforms(t, e, s) {
    const r = (e == null ? void 0 : e.invert) ?? this.gu ?? this.un, n = (e == null ? void 0 : e.flipX) ?? this.vu ?? this.pn, h = (e == null ? void 0 : e.flipY) ?? this.yu ?? this.mn, a = (e == null ? void 0 : e.charRotation) ?? this.wu ?? this.ln, c = (e == null ? void 0 : e.brightnessStart) ?? this.bu ?? this.lu, u = (e == null ? void 0 : e.brightnessEnd) ?? this.Mu ?? this.fu, l = (e == null ? void 0 : e.charColorMode) ?? this.Au ?? this.du, f = (e == null ? void 0 : e.cellColorMode) ?? this.xu ?? this._u, d = (e == null ? void 0 : e.charColor) ?? this.Cu ?? this.yn, p = (e == null ? void 0 : e.cellColor) ?? this.Su ?? this.wn, y = this.Eu ?? this.pu, w = (e == null ? void 0 : e.glyphColors) !== void 0, v = !w && this.Fu !== null, g = w ? e.glyphColors : this.Fu ?? this.mu, b = w ? s.getStep(e, g) : v ? s.getFrame(g) : s.getBase(g);
    return { u_image: t, u_invert: !!r, u_flipX: !!n, u_flipY: !!h, u_charRotation: a, UB: c, UC: u, u_charColorFixed: l === "fixed", u_charColor: d, u_cellColorFixed: f === "fixed", u_cellColor: p, u_backgroundColor: y, u_charCount: g.length, u_charPaletteTexture: b.texture, u_charPaletteDimensions: [b.columns, b.rows] };
  }
  createGeometryTextureSnapshot(t, e) {
    const s = this.gu ?? this.un, r = this.vu ?? this.pn, n = this.yu ?? this.mn, h = this.wu ?? this.ln, a = this.bu ?? this.lu, c = this.Mu ?? this.fu, u = this.Au ?? this.du, l = this.xu ?? this._u, f = this.Cu ?? this.yn, d = this.Su ?? this.wn, p = this.Fu ?? this.mu;
    return { kind: "source", source: t, palette: this.Fu ? e.getFrame(p) : e.getBase(p), brightnessStart: a, brightnessEnd: c, invert: !!s, flipX: !!r, flipY: !!n, charRotation: h, charColorMode: u, cellColorMode: l, charColor: [f[0], f[1], f[2], f[3]], cellColor: [d[0], d[1], d[2], d[3]] };
  }
  get debugSnapshot() {
    return { invert: this.un, flipX: this.pn, flipY: this.mn, charRotation: this.ln, brightnessStart: this.lu, brightnessEnd: this.fu, charColorMode: this.du, cellColorMode: this._u, charColor: this.yn, cellColor: this.wn, backgroundColor: this.pu, glyphColors: this.mu };
  }
  Pu(t, e, s) {
    t === "invert" ? s ? this.gu = e : this.un = e : t === "flipX" ? s ? this.vu = e : this.pn = e : t === "flipY" ? s ? this.yu = e : this.mn = e : s ? this.wu = e : this.ln = e;
  }
  Lu(t, e) {
    return e ? t === "char" ? (this.Cu ?? (this.Cu = [0, 0, 0, 1]), this.Cu) : t === "cell" ? (this.Su ?? (this.Su = [0, 0, 0, 1]), this.Su) : (this.Eu ?? (this.Eu = [0, 0, 0, 1]), this.Eu) : t === "char" ? this.yn : t === "cell" ? this.wn : this.pu;
  }
  Tu(t, e) {
    const s = this.getCharacterPalette(t);
    s.length > 0 && (this.mu = s, e.markBaseDirty());
  }
}
class Vi {
  constructor(t) {
    o(this, "Te", null);
    o(this, "Du", null);
    o(this, "ku", null);
    o(this, "Ru");
    this.Zt = t;
  }
  invalidateMaterials() {
    this.Te = null, this.Zt.stackState.invalidateMaterials();
  }
  clearStrategyCache() {
    this.Du = null;
  }
  getMaterial() {
    return this.hasFrameOverrides() ? this.Ou() : (this.Te || (this.Te = this.Ou()), this.Te);
  }
  getMaterials() {
    const t = this.Zt.stackState.getActiveStack();
    if (!t) return [this.getMaterial()];
    this.Zt.beforeMaterialUpdate();
    const e = !this.Zt.conversionState.hasFrameUniformOverrides();
    return t.map((s, r) => this.Iu(s, r, t.length, e));
  }
  hasFrameOverrides() {
    return this.Zt.conversionState.hasFrameUniformOverrides() || this.Zt.stackState.hasFrameOverrides();
  }
  createBaseUniforms() {
    return this.Zt.conversionState.createBaseUniforms(this.Zt.getTexture(), this.ku, this.Zt.paletteCache);
  }
  get material() {
    return this.Te;
  }
  Ou(t = this.Zt.stackState.getSingleMode(), e = null, s) {
    e || this.Zt.beforeMaterialUpdate();
    const r = this.ku, n = this.Ru;
    this.ku = e, this.Ru = s;
    try {
      const h = e ? this.Bu(t) : this.Nu(), a = this.ju(s), c = this.Zt.conversionManager.zu(t, a), u = h.createUniforms(a);
      return this.Zt.renderer.materialManager.Xe(c, u);
    } finally {
      this.ku = r, this.Ru = n;
    }
  }
  Iu(t, e, s, r) {
    if (r && t.material) return t.material;
    const n = { index: e, count: s, mode: t.mode, options: t.options }, h = this.Ou(t.mode, t, n);
    return r && (t.material = h), h;
  }
  Bu(t) {
    const e = this.Zt.conversionManager.Qu(t);
    if (!e) throw Error(`[textmode.js] Conversion mode "${t}" is not registered. If this mode is provided by an add-on, make sure its plugin is installed before loading sources.`);
    return e;
  }
  Nu() {
    const t = this.Zt.stackState.getSingleMode();
    if (this.Du && this.Du.id === t) return this.Du;
    const e = this.Bu(t);
    return this.Du = e, e;
  }
  ju(t) {
    const e = this.Zt.conversionState.activeGlyphAtlas;
    if (!e) throw Error("[textmode.js] Cannot create conversion context: no active glyph atlas set. Ensure _setActiveFont() is called before rendering.");
    const s = t ?? this.Ru, r = { renderer: this.Zt.renderer, gl: this.Zt.gl, font: e, glyphAtlas: e, source: this.Zt.source, createBaseUniforms: () => this.createBaseUniforms() };
    return s && (r.pass = s), r;
  }
}
class xt extends Ft {
  constructor(e, s, r, n, h, a, c, u, l = S.zc) {
    super();
    o(this, "Ce");
    o(this, "H");
    o(this, "Qn");
    o(this, "Gu");
    o(this, "Hu");
    o(this, "o");
    o(this, "u");
    o(this, "Kc");
    o(this, "Yc");
    o(this, "Vu");
    o(this, "Xu");
    this.Ce = e, this.H = s, this.Qn = r, this.Gu = h, this.Hu = a, this.Yu(c, u), this.Kc = new Zi(s.glyphPaletteService), this.Yc = new ji(l), this.Vu = new Qi(this.Yc, this.Kc, (f) => l(f).normalized), this.Xu = new Vi({ gl: e, renderer: s, conversionManager: n, source: this, stackState: this.Vu, conversionState: this.Yc, paletteCache: this.Kc, getTexture: () => this.Qn, beforeMaterialUpdate: () => this.Ku() });
  }
  conversionMode(e) {
    const s = this.Da();
    return this.Vu.setConversionMode(e, s), s || (this.Xu.clearStrategyCache(), this.Xu.invalidateMaterials()), this;
  }
  conversions(e) {
    const s = this.Da(), r = this.Vu.setConversions(e, s);
    return !s && r && this.Xu.invalidateMaterials(), this;
  }
  clearConversions() {
    const e = this.Da();
    return this.Vu.clearConversions(e), e || this.Xu.invalidateMaterials(), this;
  }
  dispose() {
    this.Qn && (this.Ce.deleteTexture(this.Qn), this.Qn = null), this.Vu.dispose(), this.Kc.disposeAll(), super.dispose();
  }
  invert(e = !0) {
    return this.Yc.setInvert(e, this.Da()), this.Wu(), this;
  }
  flipX(e = !0) {
    return this.Yc.setFlipX(e, this.Da()), this.Wu(), this;
  }
  flipY(e = !0) {
    return this.Yc.setFlipY(e, this.Da()), this.Wu(), this;
  }
  charRotation(e) {
    return this.Yc.setCharRotation(e, this.Da()), this.Wu(), this;
  }
  brightnessRange(e, s) {
    return this.Zu(e, s), this.Yc.setBrightnessRange(e, s, this.Da()), this.Wu(), this;
  }
  charColorMode(e) {
    return this.Yc.setCharColorMode(e, this.Da()), this.Wu(), this;
  }
  cellColorMode(e) {
    return this.Yc.setCellColorMode(e, this.Da()), this.Wu(), this;
  }
  charColor(e, s, r, n) {
    return this.$u("char", e, s, r, n), this;
  }
  cellColor(e, s, r, n) {
    return this.$u("cell", e, s, r, n), this;
  }
  background(e, s, r, n) {
    return this.$u("background", e, s, r, n), this;
  }
  characters(e) {
    return this.Yc.setCharacters(e, this.Da(), this.Kc), this.Wu(), this;
  }
  Ka(e) {
    this.Yc.setActiveGlyphAtlas(e, this.Kc) && (this.Vu.refreshPalettes(), this.Xu.invalidateMaterials());
  }
  get texture() {
    return this.Qn;
  }
  get width() {
    return this.o;
  }
  get height() {
    return this.u;
  }
  get originalWidth() {
    return this.Gu;
  }
  get originalHeight() {
    return this.Hu;
  }
  ue(e, s) {
    this.Yu(e, s), this.Xu.invalidateMaterials();
  }
  Ge() {
    return this.Xu.getMaterial();
  }
  Wa() {
    return this.Xu.getMaterials();
  }
  qu(e) {
    if (this.Ka(e), this.Vu.getActiveStack()) throw new E("[textmode.js] texture() does not support conversion stacks. Call clearConversions() or draw the stacked source with image().", { method: "texture" });
    const s = this.Vu.getSingleMode();
    if (s !== "brightness") throw new E("[textmode.js] texture() supports the built-in brightness conversion mode only. Use image() for custom conversion modes.", { method: "texture", conversionMode: s });
    return this.Yc.createGeometryTextureSnapshot(this, this.Kc);
  }
  aa() {
  }
  Ba() {
    this.Yc.clearFrameOverrides(this.Kc), this.Vu.clearFrameOverrides();
  }
  Za() {
    return this.Xu.hasFrameOverrides();
  }
  Ku() {
  }
  Ju() {
    this.Xu.invalidateMaterials();
  }
  tl() {
    return { sourceState: this.Yc.debugSnapshot, stackState: this.Vu.debugSnapshot, material: this.Xu.material, basePalette: this.Kc.basePalette, framePalette: this.Kc.framePalette };
  }
  Yu(e, s) {
    const { width: r, height: n } = (function(h, a, c, u) {
      const l = Math.min(c / h, u / a);
      return { width: Math.max(1, Math.min(c, Math.round(h * l))), height: Math.max(1, Math.min(u, Math.round(a * l))), scale: l };
    })(this.Gu, this.Hu, e, s);
    this.o = r, this.u = n;
  }
  $u(e, s, r, n, h) {
    this.Yc.setColor(e, this.Da(), s, r, n, h), this.Wu();
  }
  Wu() {
    this.Da() || this.Xu.invalidateMaterials();
  }
  Da() {
    return this.H.Na();
  }
  Zu(e, s) {
    const r = { method: "brightnessRange", start: e, end: s };
    if (!Number.isFinite(e) || !Number.isFinite(s)) throw new E("[textmode.js] brightness range values must be finite numbers.", r);
    if (e < 0 || e > 255 || s < 0 || s > 255) throw new E("[textmode.js] brightness range values must be between 0 and 255.", r);
    if (e > s) throw new E("[textmode.js] brightness range start must be less than or equal to end.", r);
  }
}
class Pt extends xt {
  constructor(t, e, s, r, n, h, a, c, u) {
    super(t, e, s, r, n, h, a, c, u);
  }
  static il(t, e, s, r, n, h) {
    const a = t.context, { texture: c, width: u, height: l } = ve(a, s);
    return new Pt(a, t, c, e, u, l, r, n, h);
  }
}
class Wi {
  constructor(t = 60) {
    o(this, "sl");
    o(this, "el");
    o(this, "rl", null);
    o(this, "nl", 0);
    o(this, "hl", null);
    o(this, "ol", null);
    o(this, "al", !0);
    o(this, "cl", 0);
    o(this, "ul", 0);
    o(this, "ll", []);
    o(this, "fl", 10);
    o(this, "dl", 0);
    o(this, "_l", 0);
    o(this, "pl", -1);
    this.el = t, this.sl = 1e3 / t;
  }
  ml(t, e) {
    if (this.hl = t, e !== void 0 && (this.ol = e), !this.vl() || (this.pl === -1 && (this.pl = performance.now()), this.rl !== null)) return;
    this.nl = performance.now();
    const s = (r) => {
      var a;
      if (!this.vl()) return void (this.rl = null);
      const n = typeof r == "number" ? r : performance.now(), h = n - this.nl;
      h >= this.sl && ((a = this.hl) == null || a.call(this), this.nl = n - h % this.sl), this.vl() ? this.rl = requestAnimationFrame(s) : this.rl = null;
    };
    this.rl = requestAnimationFrame(s);
  }
  yl() {
    this.rl !== null && (cancelAnimationFrame(this.rl), this.rl = null);
  }
  wl() {
    this.al && (this.al = !1, this.vl() || this.yl());
  }
  bl(t) {
    this.al || (this.al = !0, this.ml(t));
  }
  Ml(t, e) {
    if (t === void 0) return this.cl;
    this.el = t, this.sl = 1e3 / t, this.rl !== null && e && (this.yl(), this.ml(e));
  }
  Al() {
    const t = performance.now();
    if (this.ul > 0) {
      const e = t - this.ul;
      this.dl = e, this.ll.push(e), this.ll.length > this.fl && this.ll.shift();
      const s = this.ll.reduce((r, n) => r + n, 0) / this.ll.length;
      this.cl = 1e3 / s;
    }
    this.ul = t;
  }
  xl(t) {
    this.el = t, this.sl = 1e3 / t;
  }
  vl() {
    var t;
    return this.al || ((t = this.ol) == null ? void 0 : t.call(this)) === !0;
  }
  Cl() {
    this._l++;
  }
  get Sl() {
    return this.pl === -1 ? 0 : performance.now() - this.pl;
  }
  set Sl(t) {
    this.pl = performance.now() - t;
  }
  get El() {
    return this.Sl / 1e3;
  }
  set El(t) {
    this.Sl = 1e3 * t;
  }
}
function de(i, t, e) {
  return i ? i.P(t, e) : { x: -1 / 0, y: -1 / 0 };
}
class Wt {
  constructor() {
    o(this, "Fl", []);
  }
  Tl(t, e, s, r) {
    const n = s;
    r === void 0 ? t.addEventListener(e, n) : t.addEventListener(e, n, r), this.Fl.push({ target: t, type: e, listener: n, capture: typeof r == "boolean" ? r : r == null ? void 0 : r.capture });
  }
  Pl() {
    for (let t = this.Fl.length - 1; t >= 0; t -= 1) {
      const { target: e, type: s, listener: r, capture: n } = this.Fl[t];
      n === void 0 ? e.removeEventListener(s, r) : e.removeEventListener(s, r, n);
    }
    this.Fl = [];
  }
}
const we = ["keyPressed", "keyTyped", "keyReleased"], be = ["mouseClicked", "doubleClicked", "mousePressed", "mouseReleased", "mouseMoved", "mouseDragged", "mouseScrolled"], Ae = ["touchStarted", "touchMoved", "touchEnded", "touchCancelled"], xe = ["tap", "doubleTap", "longPress", "swipe", "pinch", "rotateGesture"], Ee = ["gamepadConnected", "gamepadDisconnected", "gamepadButtonPressed", "gamepadButtonReleased", "gamepadAxisChanged"], qi = [...we, ...be, ...Ae, ...xe, ...Ee];
class $i {
  constructor() {
    o(this, "Fl", {});
  }
  Ll(t, e) {
    var n;
    const s = (n = this.Fl)[t] ?? (n[t] = []), r = { fn: e, once: !1 };
    return s.push(r), () => this.Dl(t, e);
  }
  Dl(t, e) {
    const s = this.Fl[t];
    if (!s) return;
    const r = s.findIndex((n) => n.fn === e);
    r !== -1 && s.splice(r, 1);
  }
  kl(t, e) {
    var n;
    const s = (n = this.Fl)[t] ?? (n[t] = []), r = { fn: e, once: !0 };
    return s.push(r), () => this.Dl(t, e);
  }
  Rl(t, ...e) {
    const s = this.Fl[t];
    if (!s || s.length === 0) return;
    const r = s.slice();
    for (const n of r) {
      if (n.once) {
        const h = s.indexOf(n);
        h !== -1 && s.splice(h, 1);
      }
      n.fn(...e);
    }
  }
  Ol(t) {
    const e = this.Fl[t];
    return !!e && e.length > 0;
  }
  Pl(t) {
    t !== void 0 ? delete this.Fl[t] : this.Fl = {};
  }
}
class Ji {
  constructor(t, e, s) {
    o(this, "p");
    o(this, "Il");
    o(this, "Bl", { x: -1 / 0, y: -1 / 0 });
    o(this, "Nl", { x: -1 / 0, y: -1 / 0 });
    o(this, "jl", { x: -1 / 0, y: -1 / 0 });
    o(this, "zl", { x: -1 / 0, y: -1 / 0 });
    o(this, "Ql", { x: 0, y: 0 });
    o(this, "Gl", { x: 0, y: 0 });
    o(this, "Hl", !1);
    o(this, "Vl", null);
    o(this, "Xl", 0);
    o(this, "Fl", new Wt());
    o(this, "Yl", !1);
    o(this, "Kl");
    this.p = t, this.Il = e, this.Kl = s;
  }
  Wl(t) {
    const e = performance.now() + Math.max(0, t);
    e > this.Xl && (this.Xl = e);
  }
  Zl() {
    return performance.now() < this.Xl;
  }
  $l(t) {
    const e = this.p.canvas;
    e.style.cursor = t == null || t === "" ? "" : t;
  }
  ql() {
    const t = this.p.canvas;
    return typeof t.requestPointerLock == "function" && (t.requestPointerLock(), !0);
  }
  Jl() {
    this.tf() && typeof document.exitPointerLock == "function" && document.exitPointerLock();
  }
  if() {
    if (this.Yl) return;
    const t = this.p.canvas;
    this.Fl.Tl(t, "mousemove", (e) => {
      this.sf(e), this.ef(e);
    }, { passive: !0 }), this.Fl.Tl(t, "mouseleave", () => {
      this.Nl = { ...this.Bl }, this.Bl.x = -1 / 0, this.Bl.y = -1 / 0, this.Vl = null;
    }, { passive: !0 }), this.Fl.Tl(t, "mousedown", (e) => {
      this.sf(e), this.rf(e);
    }, { passive: !0 }), this.Fl.Tl(t, "mouseup", (e) => {
      this.sf(e), this.nf(e);
    }, { passive: !0 }), this.Fl.Tl(t, "click", (e) => {
      this.sf(e), this.hf(e);
    }, { passive: !0 }), this.Fl.Tl(t, "dblclick", (e) => {
      this.sf(e), this.af(e);
    }, { passive: !0 }), this.Fl.Tl(t, "wheel", (e) => {
      this.sf(e), this.cf(e);
    }, { passive: !1 }), this.Fl.Tl(window, "mouseup", () => {
      this.Hl = !1;
    }, { passive: !0 }), this.Fl.Tl(window, "blur", () => {
      this.Hl = !1;
    }), this.Yl = !0;
  }
  uf() {
    this.Yl && (this.Fl.Pl(), this.Yl = !1, this.Jl(), this.Hl = !1, this.Ql = { x: 0, y: 0 }, this.Gl = { x: 0, y: 0 });
  }
  lf() {
    if (this.Yl) try {
      if (this.Vl) {
        const t = new MouseEvent("mousemove", { clientX: this.Vl.x, clientY: this.Vl.y, bubbles: !1, cancelable: !1 });
        this.sf(t);
      }
    } catch {
      this.Bl.x = -1 / 0, this.Bl.y = -1 / 0;
    }
  }
  ff() {
    return { x: this.Bl.x, y: this.Bl.y };
  }
  df() {
    return { x: this.jl.x, y: this.jl.y };
  }
  _f() {
    return this.Ql.x;
  }
  pf() {
    return this.Ql.y;
  }
  mf() {
    return this.Hl;
  }
  gf() {
    this.jl = { ...this.zl }, this.zl = { ...this.Bl }, this.Ql = { ...this.Gl }, this.Gl = { x: 0, y: 0 };
  }
  vf(t, e = {}) {
    return { position: { ...this.Bl }, previousPosition: { ...this.Nl }, originalEvent: t, ...e };
  }
  ef(t) {
    this.Zl() || (this.yf(t) ? this.Kl.Rl("mouseDragged", this.vf(t, { button: this.wf(t) })) : this.Kl.Rl("mouseMoved", this.vf(t)));
  }
  rf(t) {
    this.Zl() || (this.Hl = !0, this.Kl.Rl("mousePressed", this.vf(t, { button: t.button })));
  }
  nf(t) {
    this.Zl() || (this.Hl = !1, this.Kl.Rl("mouseReleased", this.vf(t, { button: t.button })));
  }
  hf(t) {
    this.Zl() || this.Kl.Rl("mouseClicked", this.vf(t, { button: t.button }));
  }
  af(t) {
    this.Zl() || this.Kl.Rl("doubleClicked", this.vf(t, { button: t.button }));
  }
  cf(t) {
    this.Zl() || this.Kl.Rl("mouseScrolled", this.vf(t, { delta: { x: t.deltaX, y: t.deltaY } }));
  }
  sf(t) {
    const e = this.Il();
    if (this.Nl = { ...this.Bl }, t instanceof MouseEvent && t.type === "mousemove" && this.bf(t), t instanceof MouseEvent && t.type === "mousemove" && this.tf()) return;
    this.Vl = { x: t.clientX, y: t.clientY };
    const s = de(e, t.clientX, t.clientY);
    this.Bl.x = s.x, this.Bl.y = s.y;
  }
  yf(t) {
    return t.buttons !== 0;
  }
  wf(t) {
    return 1 & t.buttons ? 0 : 4 & t.buttons ? 1 : 2 & t.buttons ? 2 : 8 & t.buttons ? 3 : 16 & t.buttons ? 4 : void 0;
  }
  bf(t) {
    if (this.tf()) return this.Gl.x += t.movementX, void (this.Gl.y += t.movementY);
    this.Vl && (this.Gl.x += t.clientX - this.Vl.x, this.Gl.y += t.clientY - this.Vl.y);
  }
  tf() {
    return document.pointerLockElement === this.p.canvas;
  }
}
class tr {
  constructor(t) {
    o(this, "Mf", /* @__PURE__ */ new Map());
    o(this, "Af", null);
    o(this, "xf", null);
    o(this, "Fl", new Wt());
    o(this, "Yl", !1);
    o(this, "Kl");
    o(this, "Cf", { ArrowUp: "UP_ARROW", ArrowDown: "DOWN_ARROW", ArrowLeft: "LEFT_ARROW", ArrowRight: "RIGHT_ARROW", F1: "F1", F2: "F2", F3: "F3", F4: "F4", F5: "F5", F6: "F6", F7: "F7", F8: "F8", F9: "F9", F10: "F10", F11: "F11", F12: "F12", Enter: "ENTER", Return: "RETURN", Tab: "TAB", Escape: "ESCAPE", Backspace: "BACKSPACE", Delete: "DELETE", Insert: "INSERT", Home: "HOME", End: "END", PageUp: "PAGE_UP", PageDown: "PAGE_DOWN", Shift: "SHIFT", Control: "CONTROL", Alt: "ALT", Meta: "META", " ": "SPACE" });
    this.Kl = t;
  }
  if() {
    this.Yl || (this.Fl.Tl(window, "keydown", (t) => {
      this.Sf(t);
    }, { passive: !1 }), this.Fl.Tl(window, "keyup", (t) => {
      this.Ef(t);
    }, { passive: !1 }), this.Yl = !0);
  }
  uf() {
    this.Yl && (this.Fl.Pl(), this.Yl = !1, this.Mf.clear(), this.Af = null, this.xf = null);
  }
  Ff(t) {
    const e = this.Tf(t), s = this.Mf.get(t) || this.Mf.get(e);
    return (s == null ? void 0 : s.isPressed) || !1;
  }
  Pf() {
    return this.Af;
  }
  Lf() {
    return this.xf;
  }
  Df() {
    const t = [];
    for (const [e, s] of this.Mf) s.isPressed && t.push(e);
    return t;
  }
  kf() {
    return { ctrl: this.Ff("Control"), shift: this.Ff("Shift"), alt: this.Ff("Alt"), meta: this.Ff("Meta") };
  }
  Rf() {
    this.Mf.clear(), this.Af = null, this.xf = null;
  }
  Sf(t) {
    const e = t.key, s = Date.now();
    this.Mf.has(e) || this.Mf.set(e, { isPressed: !1, lastPressTime: 0, lastReleaseTime: 0 });
    const r = this.Mf.get(e);
    r.isPressed || (r.isPressed = !0, r.lastPressTime = s, this.Af = e, this.Kl.Rl("keyPressed", this.vf(e, !0, t)), this.Of(t) && this.Kl.Rl("keyTyped", this.vf(e, !0, t)));
  }
  vf(t, e, s) {
    return { key: t, keyCode: s.keyCode, ctrlKey: s.ctrlKey, shiftKey: s.shiftKey, altKey: s.altKey, metaKey: s.metaKey, isPressed: e, originalEvent: s };
  }
  Ef(t) {
    const e = t.key, s = Date.now();
    this.Mf.has(e) || this.Mf.set(e, { isPressed: !1, lastPressTime: 0, lastReleaseTime: 0 });
    const r = this.Mf.get(e);
    r.isPressed = !1, r.lastReleaseTime = s, this.xf = e, this.Kl.Rl("keyReleased", this.vf(e, !1, t));
  }
  Tf(t) {
    return this.Cf[t] || t.toLowerCase();
  }
  Of(t) {
    return !(t.ctrlKey || t.altKey || t.metaKey) && t.key !== "Dead" && Array.from(t.key).length === 1;
  }
}
class er {
  constructor(t, e) {
    o(this, "If");
    o(this, "Bf");
    o(this, "Nf", /* @__PURE__ */ new Map());
    o(this, "jf", null);
    o(this, "zf", 320);
    o(this, "Qf", 350);
    o(this, "Gf", 10);
    o(this, "Hf", 550);
    o(this, "Vf", 14);
    o(this, "Xf", 48);
    o(this, "Yf", 650);
    o(this, "Kf", 0.02);
    o(this, "Wf", 2);
    o(this, "Zf", 0);
    o(this, "$f", null);
    this.If = t, this.Bf = e;
  }
  yh() {
    this.Nf.forEach((t) => {
      t.timer !== null && window.clearTimeout(t.timer);
    }), this.Nf.clear(), this.jf = null, this.Zf = 0, this.$f = null;
  }
  qf(t, e) {
    const s = { timer: null, fired: !1 };
    s.timer = window.setTimeout(() => {
      this.Nf.has(t.id) && (s.fired = !0, this.Bf.Rl("longPress", { touch: this.Jf(t.lastPosition), duration: performance.now() - t.startTime, originalEvent: e }));
    }, this.Hf), this.Nf.set(t.id, s);
  }
  td(t, e) {
    const s = this.Nf.get(t.id);
    !s || !e || Et(e.clientX, e.clientY, t.lastPosition.clientX, t.lastPosition.clientY) > this.Vf && s.timer !== null && (window.clearTimeout(s.timer), s.timer = null);
  }
  sd(t, e) {
    const s = this.Nf.get(t.id);
    s && s.timer !== null && (window.clearTimeout(s.timer), s.timer = null), this.ed(t, e, (s == null ? void 0 : s.fired) ?? !1), this.Nf.delete(t.id);
  }
  rd(t) {
    const e = this.Nf.get(t);
    e && e.timer !== null && window.clearTimeout(e.timer), this.Nf.delete(t);
  }
  nd(t) {
    if (t.size !== 2) return void (this.jf = null);
    const e = Array.from(t.values()), [s, r] = e, n = [s.id, r.id];
    if (this.jf && this.jf.ids[0] === n[0] && this.jf.ids[1] === n[1]) return;
    const h = Et(s.x, s.y, r.x, r.y), a = Le(s.clientX, s.clientY, r.clientX, r.clientY);
    this.jf = { ids: n, initialDistance: Math.max(h, 1e-4), initialAngle: a, lastScale: 1, lastRotation: 0 };
  }
  hd(t, e) {
    if (this.nd(t), !this.jf) return;
    const [s, r] = this.jf.ids, n = t.get(s), h = t.get(r);
    if (!n || !h) return;
    const a = Et(n.x, n.y, h.x, h.y) / this.jf.initialDistance, c = a - this.jf.lastScale;
    Math.abs(c) > this.Kf && (this.Bf.Rl("pinch", { touches: [this.Jf(n), this.Jf(h)], scale: a, deltaScale: c, center: this.od(n, h), originalEvent: e }), this.jf.lastScale = a);
    let u = Le(n.clientX, n.clientY, h.clientX, h.clientY) - this.jf.initialAngle;
    u = (u + 180) % 360 - 180;
    const l = u - this.jf.lastRotation;
    Math.abs(l) > this.Wf && (this.Bf.Rl("rotateGesture", { touches: [this.Jf(n), this.Jf(h)], rotation: u, deltaRotation: l, center: this.od(n, h), originalEvent: e }), this.jf.lastRotation = u);
  }
  od(t, e) {
    const s = (t.clientX + e.clientX) / 2, r = (t.clientY + e.clientY) / 2, n = this.If(s, r);
    return { x: n.x, y: n.y };
  }
  ed(t, e, s) {
    const r = performance.now(), n = r - t.startTime, h = t.lastPosition.clientX - t.startPosition.clientX, a = t.lastPosition.clientY - t.startPosition.clientY, c = Math.hypot(h, a);
    if (!s && n <= this.zf && c <= this.Gf)
      this.ad(t.lastPosition, r) ? this.Bf.Rl("doubleTap", { touch: this.Jf(t.lastPosition), taps: 2, originalEvent: e }) : this.Bf.Rl("tap", { touch: this.Jf(t.lastPosition), taps: 1, originalEvent: e });
    else if (!s && n <= this.Yf && c >= this.Xf) {
      const u = Math.max(c, 1e-4), l = { x: h / u, y: a / u }, f = { x: h / n, y: a / n };
      this.Bf.Rl("swipe", { touch: this.Jf(t.lastPosition), direction: l, distance: u, velocity: f, originalEvent: e });
    }
    this.Zf = r, this.$f = this.Jf(t.lastPosition);
  }
  ad(t, e) {
    return !this.$f || e - this.Zf > this.Qf ? !1 : Et(t.clientX, t.clientY, this.$f.clientX, this.$f.clientY) <= this.Gf;
  }
  Jf(t) {
    return { ...t };
  }
}
class sr {
  constructor(t, e, s, r) {
    o(this, "p");
    o(this, "ud");
    o(this, "Il");
    o(this, "ld");
    o(this, "fd", /* @__PURE__ */ new Map());
    o(this, "dd", /* @__PURE__ */ new Map());
    o(this, "_d", /* @__PURE__ */ new Map());
    o(this, "pd");
    o(this, "md");
    o(this, "Fl", new Wt());
    o(this, "Yl", !1);
    o(this, "Kl");
    o(this, "gd", 600);
    this.p = t, this.Il = e, this.Kl = s, this.ud = r, this.ld = new er((h, a) => de(this.Il(), h, a), this.Kl);
    const n = this.p.canvas;
    this.pd = n.style.touchAction, this.md = n.style.userSelect, n.style.touchAction || (n.style.touchAction = "none"), n.style.userSelect || (n.style.userSelect = "none");
  }
  if() {
    if (this.Yl) return;
    const t = this.p.canvas;
    this.Fl.Tl(t, "touchstart", (e) => {
      this.vd(e);
    }, { passive: !1 }), this.Fl.Tl(t, "touchmove", (e) => {
      this.yd(e);
    }, { passive: !1 }), this.Fl.Tl(t, "touchend", (e) => {
      this.wd(e);
    }, { passive: !1 }), this.Fl.Tl(t, "touchcancel", (e) => {
      this.bd(e);
    }, { passive: !1 }), this.Yl = !0;
  }
  uf() {
    if (!this.Yl) return;
    const t = this.p.canvas;
    this.Fl.Pl(), this.Yl = !1, this.fd.clear(), this.dd.clear(), this._d.clear(), this.ld.yh(), t.style.touchAction = this.pd, t.style.userSelect = this.md;
  }
  lf() {
    if (!this.Il() || this.fd.size === 0) return;
    const t = /* @__PURE__ */ new Map();
    for (const e of this.fd.values()) {
      const s = this.If(e.clientX, e.clientY, e.id, e);
      t.set(e.id, s);
      const r = this._d.get(e.id);
      r && (r.lastPosition = s);
    }
    this.fd = t;
  }
  Md() {
    return Array.from(this.fd.values()).map((t) => ({ ...t }));
  }
  vd(t) {
    var r;
    if (!this.Il()) return;
    t.preventDefault(), (r = this.ud) == null || r.Wl(this.gd);
    const e = performance.now(), s = this.Ad(t.changedTouches);
    for (const n of s) {
      const h = this.fd.get(n.id);
      h && this.dd.set(n.id, this.Jf(h)), this.fd.set(n.id, n);
      const a = { id: n.id, startPosition: n, lastPosition: n, startTime: e, lastTime: e };
      this._d.set(n.id, a), this.ld.qf(a, t), this.Kl.Rl("touchStarted", this.xd(n, t, void 0, e));
    }
    this.ld.nd(this.fd);
  }
  yd(t) {
    var r;
    if (!this.Il()) return;
    t.preventDefault(), (r = this.ud) == null || r.Wl(this.gd);
    const e = performance.now(), s = this.Ad(t.changedTouches);
    for (const n of s) {
      const h = this.fd.get(n.id), a = h ? this.Jf(h) : void 0;
      a && this.dd.set(n.id, a), this.fd.set(n.id, n);
      const c = this._d.get(n.id);
      c && (c.lastPosition = n, c.lastTime = e, this.ld.td(c, a)), this.Kl.Rl("touchMoved", this.xd(n, t, a, e));
    }
    this.ld.hd(this.fd, t);
  }
  wd(t) {
    if (!this.Il()) return;
    t.preventDefault();
    const e = performance.now(), s = this.Ad(t.changedTouches);
    for (const r of s) {
      const n = this.fd.get(r.id), h = n ? this.Jf(n) : void 0, a = this._d.get(r.id);
      this.Kl.Rl("touchEnded", this.xd(r, t, h, e)), a && this.ld.sd(a, t), this._d.delete(r.id), this.dd.delete(r.id), this.fd.delete(r.id);
    }
    this.ld.nd(this.fd);
  }
  bd(t) {
    if (!this.Il()) return;
    t.preventDefault();
    const e = performance.now(), s = this.Ad(t.changedTouches);
    for (const r of s) {
      const n = this.fd.get(r.id), h = n ? this.Jf(n) : void 0;
      this.Kl.Rl("touchCancelled", this.xd(r, t, h, e)), this.ld.rd(r.id), this._d.delete(r.id), this.dd.delete(r.id), this.fd.delete(r.id);
    }
    this.ld.nd(this.fd);
  }
  Ad(t) {
    const e = [];
    for (let s = 0; s < t.length; s += 1) {
      const r = t.item(s);
      r && e.push(this.Cd(r));
    }
    return e;
  }
  Cd(t) {
    return this.If(t.clientX, t.clientY, t.identifier, { id: t.identifier, x: -1, y: -1, clientX: t.clientX, clientY: t.clientY, pressure: t.force, radiusX: t.radiusX, radiusY: t.radiusY, rotationAngle: t.rotationAngle });
  }
  If(t, e, s, r) {
    const n = de(this.Il(), t, e);
    return { id: s, x: n.x, y: n.y, clientX: t, clientY: e, pressure: r.pressure, radiusX: r.radiusX, radiusY: r.radiusY, rotationAngle: r.rotationAngle };
  }
  xd(t, e, s, r) {
    const n = this._d.get(t.id), h = Array.from(this.dd.values()).map((u) => this.Jf(u)), a = Array.from(this.fd.values()).map((u) => this.Jf(u)), c = this.Ad(e.changedTouches);
    return { touch: this.Jf(t), previousTouch: s ? this.Jf(s) : void 0, touches: a, previousTouches: h, changedTouches: c, deltaTime: n ? r - n.lastTime : 0, originalEvent: e };
  }
  Jf(t) {
    return { ...t };
  }
}
const U = { south: 0, east: 1, west: 2, north: 3, l1: 4, r1: 5, l2: 6, r2: 7, select: 8, start: 9, leftStickPress: 10, rightStickPress: 11, dpadUp: 12, dpadDown: 13, dpadLeft: 14, dpadRight: 15, home: 16 }, Mt = { leftStickX: 0, leftStickY: 1, rightStickX: 2, rightStickY: 3 }, ir = new Map(Object.entries(U).map(([i, t]) => [t, i])), rr = new Map(Object.entries(Mt).map(([i, t]) => [t, i]));
function nr(i, t) {
  const e = Array.from(i.buttons, (h) => ({ pressed: !!h.pressed, touched: h.touched === void 0 ? void 0 : !!h.touched, value: h.value })), s = Array.from(i.axes, (h) => h), r = i.mapping === "standard" ? "standard" : "", n = { index: i.index, id: i.id, connected: !!i.connected, mapping: r, timestamp: i.timestamp, buttons: e, axes: s };
  return r === "standard" && (n.standard = (function(h, a, c) {
    const u = h[U.home];
    return { faceButtons: { south: H(h, U.south), east: H(h, U.east), west: H(h, U.west), north: H(h, U.north) }, shoulders: { l1: H(h, U.l1), r1: H(h, U.r1), l2: H(h, U.l2), r2: H(h, U.r2) }, center: { select: H(h, U.select), start: H(h, U.start), leftStickPress: H(h, U.leftStickPress), rightStickPress: H(h, U.rightStickPress), ...u ? { home: H(h, U.home) } : {} }, dpad: { up: H(h, U.dpadUp), down: H(h, U.dpadDown), left: H(h, U.dpadLeft), right: H(h, U.dpadRight) }, leftStick: ze(a, Mt.leftStickX, Mt.leftStickY, c), rightStick: ze(a, Mt.rightStickX, Mt.rightStickY, c) };
  })(e, s, t)), n;
}
function H(i, t) {
  return i[t] ?? { pressed: !1, value: 0 };
}
function ze(i, t, e, s) {
  const r = i[t] ?? 0, n = i[e] ?? 0, h = Math.hypot(r, n);
  return h <= s ? { x: 0, y: 0, magnitude: 0 } : { x: r, y: n, magnitude: h };
}
const hr = { axisDeadzone: 0.15, axisChangeEpsilon: 0.01, buttonPressThreshold: 0.5, buttonReleaseThreshold: 0.45 };
class or {
  constructor(t, e = {}) {
    o(this, "Sd");
    o(this, "Ed", []);
    o(this, "Fd", /* @__PURE__ */ new Map());
    o(this, "Td", /* @__PURE__ */ new Map());
    o(this, "Fl", new Wt());
    o(this, "Yl", !1);
    o(this, "Pd", /* @__PURE__ */ new Set());
    o(this, "Ld", /* @__PURE__ */ new Set());
    o(this, "Kl");
    this.Sd = { ...hr, ...e }, this.Kl = t;
  }
  if() {
    this.Yl || (this.Fl.Tl(window, "gamepadconnected", (t) => {
      const e = t.gamepad;
      e && (this.Pd.add(e.index), this.Ld.delete(e.index));
    }), this.Fl.Tl(window, "gamepaddisconnected", (t) => {
      const e = t.gamepad;
      e && (this.Ld.add(e.index), this.Pd.delete(e.index));
    }), this.Yl = !0);
  }
  uf() {
    this.Yl && (this.Fl.Pl(), this.Yl = !1, this.Pd.clear(), this.Ld.clear(), this.Ed = [], this.Fd.clear(), this.Td.clear());
  }
  gf() {
    const t = /* @__PURE__ */ new Map();
    for (const e of this.Dd()) {
      if (!e || !e.connected) continue;
      const s = nr(e, this.Sd.axisDeadzone);
      t.set(s.index, s);
    }
    for (const [e, s] of this.Fd) t.has(e) || this.Kl.Rl("gamepadDisconnected", { gamepad: { ...s, connected: !1 } });
    for (const [e, s] of t) this.Fd.has(e) || this.Kl.Rl("gamepadConnected", { gamepad: s });
    for (const [e, s] of t) {
      const r = this.Fd.get(e);
      r && (this.kd(s, r), this.Rd(s, r));
    }
    this.Td = this.Fd, this.Fd = t, this.Ed = Array.from(t.values()).sort((e, s) => e.index - s.index), this.Pd.clear(), this.Ld.clear();
  }
  Od() {
    return this.Ed;
  }
  Id(t) {
    return this.Fd.get(t);
  }
  Bd(t, e) {
    if (e === "standard") return (function(s, r) {
      if (r === "standard") return ir.get(s);
    })(t, e);
  }
  Nd(t, e) {
    if (e === "standard") return (function(s, r) {
      if (r === "standard") return rr.get(s);
    })(t, e);
  }
  kd(t, e) {
    const s = Math.max(t.buttons.length, e.buttons.length);
    for (let r = 0; r < s; r++) {
      const n = t.buttons[r] ?? { pressed: !1, value: 0 }, h = e.buttons[r] ?? { pressed: !1, value: 0 }, a = h.value >= this.Sd.buttonPressThreshold;
      n.value >= this.Sd.buttonPressThreshold && !a && this.Kl.Rl("gamepadButtonPressed", { gamepad: t, buttonIndex: r, button: n, previousButton: h, standardButtonName: this.Bd(r, t.mapping) });
      const c = h.value >= this.Sd.buttonReleaseThreshold;
      !(n.value >= this.Sd.buttonReleaseThreshold) && c && this.Kl.Rl("gamepadButtonReleased", { gamepad: t, buttonIndex: r, button: n, previousButton: h, standardButtonName: this.Bd(r, t.mapping) });
    }
  }
  Rd(t, e) {
    const s = Math.max(t.axes.length, e.axes.length);
    for (let r = 0; r < s; r++) {
      const n = t.axes[r] ?? 0, h = e.axes[r] ?? 0, a = n - h;
      (Math.abs(h) <= this.Sd.axisDeadzone != Math.abs(n) <= this.Sd.axisDeadzone || Math.abs(a) >= this.Sd.axisChangeEpsilon) && this.Kl.Rl("gamepadAxisChanged", { gamepad: t, axisIndex: r, value: n, previousValue: h, delta: a, standardAxisName: this.Nd(r, t.mapping) });
    }
  }
  Dd() {
    const t = navigator;
    if (typeof t.getGamepads != "function") return [];
    const e = t.getGamepads.call(navigator);
    return Array.from(e ?? []);
  }
}
class ar {
  constructor(t) {
    o(this, "jd");
    o(this, "zd", /* @__PURE__ */ new Map());
    o(this, "Qd", /* @__PURE__ */ new Map());
    o(this, "Gd", /* @__PURE__ */ new Map());
    o(this, "Hd", /* @__PURE__ */ new Map());
    o(this, "Vd", /* @__PURE__ */ new Map());
    o(this, "Xd", /* @__PURE__ */ new Map());
    o(this, "Yd", /* @__PURE__ */ new Map());
    this.jd = t;
  }
  Kd(t, e) {
    return this.Wd(this.zd, t, e);
  }
  Zd(t, e) {
    return this.Wd(this.Qd, t, e);
  }
  $d(t, e) {
    return this.Wd(this.Gd, t, e);
  }
  qd(t, e) {
    return this.Wd(this.Hd, t, e);
  }
  Jd(t, e) {
    return this.Wd(this.Vd, t, e);
  }
  t_(t, e) {
    return this.Wd(this.Xd, t, e);
  }
  i_(t, e) {
    return this.Wd(this.Yd, t, e);
  }
  s_() {
    this.e_(this.zd, (t) => t());
  }
  r_() {
    this.e_(this.Qd, (t) => t());
  }
  n_(t) {
    this.e_(this.Gd, (e) => e(t));
  }
  Js(t) {
    this.e_(this.Hd, (e) => e(t));
  }
  ne(t) {
    this.e_(this.Vd, (e) => e(t));
  }
  async h_() {
    await this.o_(this.Xd, (t) => t());
  }
  async a_() {
    await this.o_(this.Yd, (t) => t());
  }
  c_(t) {
    this.zd.delete(t), this.Qd.delete(t), this.Gd.delete(t), this.Hd.delete(t), this.Vd.delete(t), this.Xd.delete(t), this.Yd.delete(t);
  }
  Wd(t, e, s) {
    const r = t.get(e) ?? /* @__PURE__ */ new Set();
    return r.add(s), t.set(e, r), () => {
      const n = t.get(e);
      n && (n.delete(s), n.size === 0 && t.delete(e));
    };
  }
  e_(t, e) {
    for (const s of this.jd) {
      const r = t.get(s);
      r && r.forEach(e);
    }
  }
  async o_(t, e) {
    for (const s of this.jd) {
      const r = t.get(s);
      if (r) for (const n of r) await e(n);
    }
  }
}
class Ge {
  constructor(t) {
    o(this, "u_");
    o(this, "l_");
    o(this, "f_", /* @__PURE__ */ new Map());
    this.u_ = t.targetName, this.l_ = t.getPrototype;
  }
  d_(t, e, s) {
    let r = this.f_.get(t);
    r || (r = /* @__PURE__ */ new Map(), this.f_.set(t, r));
    for (const [n, h] of this.f_) if (n !== t && h.has(e)) throw new E(`Plugin "${t}" attempted to register ${this.u_} method "${e}" which is already provided by plugin "${n}".`, { plugin: t, method: e, conflictingPlugin: n });
    r.set(e, s), this.__(e, s);
  }
  p_(t, e) {
    const s = this.f_.get(t);
    if (!s) return;
    s.delete(e);
    let r = !1;
    for (const [n, h] of this.f_) if (n !== t && h.has(e)) {
      r = !0;
      const a = h.get(e);
      this.__(e, a);
      break;
    }
    r || this.m_(e), s.size === 0 && this.f_.delete(t);
  }
  g_(t) {
    const e = this.f_.get(t);
    if (e) {
      for (const s of e.keys()) this.m_(s);
      this.f_.delete(t);
    }
  }
  __(t, e) {
    const s = this.l_();
    Object.defineProperty(s, t, { value: e, writable: !0, configurable: !0, enumerable: !1 });
  }
  m_(t) {
    const e = this.l_(), s = Object.getOwnPropertyDescriptor(e, t);
    s && s.configurable && delete e[t];
  }
}
class cr {
  constructor(t, e, s, r) {
    o(this, "le");
    o(this, "v_");
    o(this, "y_");
    o(this, "w_");
    this.le = t, this.v_ = e, this.y_ = s, this.w_ = r;
  }
  b_(t) {
    const e = this.le, s = this.v_, r = this.y_, n = this.w_, h = { get canvas() {
      return e.p.canvas;
    }, get targetCanvas() {
      return e.p.targetCanvas;
    }, get width() {
      return e.p.width;
    }, get height() {
      return e.p.height;
    }, get ownsContext() {
      return e.p.ownsContext;
    } };
    return { get renderer() {
      return e.H;
    }, get canvas() {
      return h;
    }, get layerManager() {
      return e.layers;
    }, get font() {
      return e.layers.base.font;
    }, get glyphAtlas() {
      return e.layers.base.font;
    }, get grid() {
      return e.layers.base.grid;
    }, get drawFramebuffer() {
      return e.layers.base.drawFramebuffer;
    }, get asciiFramebuffer() {
      return e.layers.base.asciiFramebuffer;
    }, registerPreDrawHook: (a) => s.Kd(t, a), registerPostDrawHook: (a) => s.Zd(t, a), registerLayerDisposedHook: (a) => s.$d(t, a), registerLayerPreRenderHook: (a) => s.qd(t, a), registerLayerPostRenderHook: (a) => s.Jd(t, a), registerPreSetupHook: (a) => s.t_(t, a), registerPostSetupHook: (a) => s.i_(t, a), extendLayer: (a, c) => {
      r.d_(t, a, c);
    }, removeLayerExtension: (a) => {
      r.p_(t, a);
    }, extendSource: (a, c) => {
      n.d_(t, a, c);
    }, removeSourceExtension: (a) => {
      n.p_(t, a);
    } };
  }
}
class lr {
  constructor() {
    o(this, "M_", /* @__PURE__ */ new Map());
    o(this, "jd", []);
  }
  A_(t) {
    return this.M_.has(t);
  }
  Qu(t) {
    return this.M_.get(t);
  }
  Tl(t) {
    this.M_.set(t.name, t), this.jd.push(t.name);
  }
  x_(t) {
    this.M_.delete(t);
    const e = this.jd.indexOf(t);
    e !== -1 && this.jd.splice(e, 1);
  }
  C_() {
    return [...this.jd];
  }
  S_() {
    return this.jd;
  }
}
class ur {
  constructor(t) {
    o(this, "le");
    o(this, "E_");
    o(this, "v_");
    o(this, "y_");
    o(this, "w_");
    o(this, "F_");
    this.le = t, this.E_ = new lr(), this.v_ = new ar(this.E_.S_()), this.y_ = new Ge({ targetName: "layer", getPrototype: () => Object.getPrototypeOf(this.le.layers.base) }), this.w_ = new Ge({ targetName: "source", getPrototype: () => xt.prototype }), this.F_ = new cr(this.le, this.v_, this.y_, this.w_);
  }
  T_(t) {
    for (const e of t) {
      if (this.E_.A_(e.name)) {
        console.warn(`[textmode.js] Plugin "${e.name}" is already installed.`);
        continue;
      }
      const s = this.U_(e.name);
      try {
        const r = e.install(this.le, s);
        r instanceof Promise && r.catch((n) => {
          console.error(`[textmode.js] Async plugin "${e.name}" installation error:`, n), this.P_(e.name);
        });
      } catch (r) {
        throw this.P_(e.name), r;
      }
      this.E_.Tl(e);
    }
  }
  async L_(t) {
    for (const e of t) {
      if (this.E_.A_(e.name)) {
        console.warn(`[textmode.js] Plugin "${e.name}" is already installed.`);
        continue;
      }
      const s = this.U_(e.name);
      try {
        await e.install(this.le, s);
      } catch (r) {
        throw this.P_(e.name), r;
      }
      this.E_.Tl(e);
    }
  }
  async D_(t) {
    const e = this.E_.Qu(t);
    if (!e) return;
    const s = this.U_(t);
    e.uninstall && await e.uninstall(this.le, s), this.E_.x_(t), this.P_(t);
  }
  s_() {
    this.v_.s_();
  }
  r_() {
    this.v_.r_();
  }
  n_(t) {
    this.v_.n_(t);
  }
  Js(t) {
    this.v_.Js(t);
  }
  ne(t) {
    this.v_.ne(t);
  }
  async h_() {
    await this.v_.h_();
  }
  async a_() {
    await this.v_.a_();
  }
  async k_() {
    const t = this.E_.C_();
    for (const e of t) await this.D_(e);
  }
  U_(t) {
    return this.F_.b_(t);
  }
  P_(t) {
    this.v_.c_(t), this.y_.g_(t), this.w_.g_(t);
  }
}
const vt = `#version 300 es
layout(location=0)in vec2 A0;layout(location=1)in vec2 A1;out vec2 v_uv;void main(){v_uv=A1;gl_Position=vec4(A0,0.,1.);}`, xs = `#version 300 es
precision highp float;uniform sampler2D u_texture;in vec2 v_uv;out vec4 fragColor;void main(){fragColor=texture(u_texture,v_uv);}`, fr = ({ textmodifier: i }) => {
  const t = "|/-\\", e = Math.floor(i.millis / 120) % 4;
  i.background("#222323"), i.charColor("#F8F8F8"), i.cellColor("#222323"), mt(i, t[e], 0), i.charColor("#C0C0C0"), mt(i, "LOADING...", 5);
}, dr = { transition: "fade", transitionDuration: 500 };
class Es extends ns {
  constructor(e, s) {
    super(e);
    o(this, "Zt");
    o(this, "me", "active");
    o(this, "R_", 0);
    o(this, "O_");
    this.Zt = { ...dr, ...s ?? {} }, this.Zt.transition === "none" && (this.Zt.transitionDuration = 0);
  }
  async kt() {
    this.Pt || (await super.kt(), this.fe.opacity(1), this.fe.show());
  }
  get we() {
    return this.me === "active" || this.me === "transitioning";
  }
  I_() {
    this.Zt.transitionDuration > 0 ? (this.B_(), this.R_ = performance.now(), this.Pt && (this.fe.opacity(1), this.fe.show())) : (this.Pt && (this.fe.opacity(0), this.fe.hide()), this.N_(), this.j_());
  }
  z_(e) {
    this.O_ = e;
  }
  Ae() {
    if (this.me === "transitioning" && this.Q_())
      return this.G_(), void this.j_();
    this.xe();
  }
  de() {
    return new j(this.le.H, { visible: !0, opacity: 1, fontSize: 16 });
  }
  j_() {
    this.O_ && this.O_();
  }
  Q_() {
    if (!this.Pt) return !0;
    const e = this.Zt.transitionDuration;
    if (e <= 0) return this.fe.opacity(0), this.fe.hide(), !0;
    const s = performance.now() - this.R_, r = Math.min(1, s / e);
    return this.fe.opacity(1 - r), r >= 1 && (this.fe.hide(), !0);
  }
  xe() {
    if (!this.Pt) return;
    const e = { textmodifier: this.le, grid: this.fe.grid };
    this._e(fr, e);
  }
  N_() {
    this.me !== "disabled" && (this.me = "done");
  }
  B_() {
    this.me !== "disabled" && (this.me = "transitioning");
  }
  G_() {
    this.me === "transitioning" && (this.me = "done");
  }
}
const kr = Object.freeze(Object.defineProperty({ __proto__: null, LoadingLayerController: Es }, Symbol.toStringTag, { value: "Module" }));
class pr {
  constructor(t, e, s) {
    o(this, "H");
    o(this, "H_");
    o(this, "ks");
    o(this, "V_", 0);
    this.H = t, this.H_ = t.sr(vt, `#version 300 es
precision highp float;uniform sampler2D UD;uniform sampler2D UE;uniform vec2 UF;uniform vec2 UG;uniform vec2 UH;uniform float UI;uniform float UJ;uniform int UK;in vec2 v_uv;out vec4 fragColor;const int A=0;const int B=1;const int C=2;const int D=3;const int E=4;const int F=5;const int G=6;const int H=7;const int I=8;const int J=9;const int K=10;const int L=11;const int M=12;const int N=13;vec3 O(vec3 P,vec3 Q){return Q;}vec3 R(vec3 P,vec3 Q){return P+Q;}vec3 S(vec3 P,vec3 Q){return P*Q;}vec3 T(vec3 P,vec3 Q){return 1.-(1.-P)*(1.-Q);}vec3 U(vec3 P,vec3 Q){return max(P-Q,0.);}vec3 V(vec3 P,vec3 Q){return min(P,Q);}vec3 W(vec3 P,vec3 Q){return max(P,Q);}vec3 X(vec3 P,vec3 Q){return mix(2.*P*Q,1.-2.*(1.-P)*(1.-Q),step(0.5,P));}vec3 Y(vec3 P,vec3 Q){return mix(P-(1.-2.*Q)*P*(1.-P),mix(P+(2.*Q-1.)*(P*(3.-2.*P)-P),P+(2.*Q-1.)*(sqrt(P)-P),step(0.25,P)),step(0.5,Q));}vec3 Z(vec3 P,vec3 Q){return mix(2.*P*Q,1.-2.*(1.-P)*(1.-Q),step(0.5,Q));}vec3 a(vec3 P,vec3 Q){return mix(min(vec3(1.),P/max(1.-Q,0.0001)),vec3(1.),step(1.,Q));}vec3 b(vec3 P,vec3 Q){return mix(1.-min(vec3(1.),(1.-P)/max(Q,0.0001)),vec3(0.),step(Q,vec3(0.)));}vec3 c(vec3 P,vec3 Q){return abs(P-Q);}vec3 d(vec3 P,vec3 Q){return P+Q-2.*P*Q;}vec3 e(int f,vec3 P,vec3 Q){if(f==A)return O(P,Q);if(f==B)return R(P,Q);if(f==C)return S(P,Q);if(f==D)return T(P,Q);if(f==E)return U(P,Q);if(f==F)return V(P,Q);if(f==G)return W(P,Q);if(f==H)return X(P,Q);if(f==I)return Y(P,Q);if(f==J)return Z(P,Q);if(f==K)return a(P,Q);if(f==L)return b(P,Q);if(f==M)return c(P,Q);if(f==N)return d(P,Q);return O(P,Q);}void main(){vec4 g=texture(UE,v_uv);vec2 h=v_uv*UF;vec2 i=h-UH;vec2 j=UG*0.5;vec2 k=i-j;float l=cos(-UJ);float m=sin(-UJ);vec2 n=vec2(k.x*l-k.y*m,k.x*m+k.y*l);i=n+j;bool o=any(lessThan(i,vec2(0.)))||any(greaterThanEqual(i,UG));if(o){fragColor=g;return;}vec2 p=(floor(i)+0.5)/UG;vec4 q=texture(UD,p);float r=q.a*UI;if(r<=0.){fragColor=g;return;}vec3 s=e(UK,g.rgb,q.rgb);vec3 t=mix(g.rgb,s,r);float u=g.a+r*(1.-g.a);fragColor=vec4(t,u);}`), this.ks = [this.H.Z(e, s, 1, { depth: !1 }), this.H.Z(e, s, 1, { depth: !1 })];
  }
  X_(t) {
    const { base: e, targetFramebuffer: s, backgroundColor: r, layers: n, canvasWidth: h, canvasHeight: a } = t, c = this.H.gc(), u = this.H.vc();
    this.H._c(!1), this.H.mc(!1);
    const l = this.ks[0];
    l.begin(), this.H.Dh(...r), l.end(), this.V_ = 0, e.layer.Ms && this.Y_(e.texture, h, a, e.width, e.height, e.layer.As, e.offsetX, e.offsetY, e.layer.Ss, L.NORMAL);
    for (const f of n) {
      const d = f.layer;
      d.Ms && this.Y_(f.texture, h, a, f.width, f.height, d.As, f.offsetX, f.offsetY, d.Ss, d.Cs);
    }
    this.K_(s, h, a), this.H.mc(u), this.H._c(c);
  }
  Y_(t, e, s, r, n, h, a, c, u, l) {
    const f = this.ks[this.V_], d = this.V_ === 0 ? 1 : 0, p = this.ks[d], y = Z(u);
    p.begin(), this.H.he(this.H_), this.H_.oe({ UD: t, UE: f.textures[0], UF: [e, s], UG: [r, n], UH: [a, c], UI: h, UJ: y, UK: l }), this.H.ae(0, 0, f.width, f.height), p.end(), this.V_ = d;
  }
  K_(t, e, s) {
    const r = this.ks[this.V_];
    t.begin(), this.H.he(this.H_), this.H_.oe({ UD: r.textures[0], UE: r.textures[0], UF: [e, s], UG: [r.width, r.height], UH: [0, 0], UI: 1, UJ: 0, UK: L.NORMAL }), this.H.ae(0, 0, e, s), t.end();
  }
  ue(t, e) {
    this.ks[0].resize(t, e), this.ks[1].resize(t, e);
  }
  L() {
    this.H_.dispose(), this.ks[0].dispose(), this.ks[1].dispose();
  }
}
function mr(i) {
  if (typeof i == "number" || typeof i == "boolean") return !0;
  if (Array.isArray(i)) {
    if (i.length === 0) return !0;
    const t = i[0];
    return typeof t == "number" || !!Array.isArray(t);
  }
  return i instanceof Float32Array || i instanceof Int32Array || !!Ct(i) || typeof WebGLTexture < "u" && i instanceof WebGLTexture;
}
async function Bt(i) {
  if (i.startsWith("./") || i.startsWith("../") || i.endsWith(".vert") || i.endsWith(".frag") || i.endsWith(".glsl")) {
    const t = await fetch(i);
    if (!t.ok) throw Error(`Failed to load shader from ${i}: ${t.statusText}`);
    return await t.text();
  }
  return i;
}
class Cs {
  constructor(t) {
    o(this, "H");
    o(this, "W_", /* @__PURE__ */ new Map());
    o(this, "Z_", /* @__PURE__ */ new Map());
    o(this, "Ve");
    o(this, "ks");
    o(this, "Pt", !1);
    this.H = t, this.Ve = t.sr(vt, xs), this.q_();
  }
  async register(t, e, s = {}) {
    const r = typeof e == "string" ? this.H.sr(vt, await Bt(e)) : e;
    this.J_(t, r, s);
  }
  tp(t, e, s) {
    this.J_(t, this.H.sr(vt, e), s);
  }
  J_(t, e, s) {
    this.Z_.set(t, e);
    const r = Object.entries(s), n = r.length > 0 ? r[0][1][0] : null;
    this.W_.set(t, { id: t, createShader: () => e, createUniforms: (h, a) => {
      const c = { u_resolution: [a.width, a.height] };
      for (const [u, [l, f]] of r) {
        let d = f;
        if (h != null) {
          if (typeof h == "number" && l === n) d = h;
          else if (typeof h == "object" && l in h) {
            const p = h[l];
            mr(p) && (d = p);
          }
        }
        c[u] = d;
      }
      return c;
    } });
  }
  unregister(t) {
    const e = this.Z_.get(t);
    return e && (e.dispose(), this.Z_.delete(t)), this.W_.delete(t);
  }
  has(t) {
    return this.W_.has(t);
  }
  kt(t, e) {
    this.Pt || (this.ks = [this.H.Z(t, e, 1, { depth: !1 }), this.H.Z(t, e, 1, { depth: !1 })], this.Pt = !0);
  }
  ip(t, e, s, r, n) {
    this.ks[0].width === r && this.ks[0].height === n || (this.ks[0].resize(r, n), this.ks[1].resize(r, n)), this.ce(t, e, s, r, n, this.ks);
  }
  ce(t, e, s, r, n, h) {
    if (s.length === 0)
      return this.sp(t, e) ? void 0 : void this.ep(t, e, r, n);
    let a = t, c = 0;
    for (let u = 0; u < s.length; u++) {
      const l = s[u];
      let f = e;
      if (u !== s.length - 1 || this.sp(a, e)) {
        const d = this.rp(a, h, c);
        f = d.buffer, c = d.index === 0 ? 1 : 0;
      }
      this.np(l, a, f, r, n), a = f.textures[0];
    }
    this.sp(a, e) || this.ep(a, e, r, n);
  }
  np(t, e, s, r, n) {
    const h = this.W_.get(t.name);
    if (!h) return console.warn(`[textmode.js] Unknown filter: "${t.name}". Skipping.`), void this.ep(e, s, r, n);
    const a = this.hp(t.name, h, r, n), c = { renderer: this.H, gl: this.H.context, width: r, height: n };
    s.begin(), this.H.he(a), a.oe({ u_texture: e });
    const u = h.createUniforms(t.params, c);
    a.oe(u), this.H.ae(0, 0, r, n), s.end();
  }
  sp(t, e) {
    return e.textures.includes(t);
  }
  rp(t, e, s) {
    const r = e[s];
    if (!this.sp(t, r)) return { buffer: r, index: s };
    const n = s === 0 ? 1 : 0, h = e[n];
    return this.sp(t, h) ? { buffer: r, index: s } : { buffer: h, index: n };
  }
  hp(t, e, s, r) {
    let n = this.Z_.get(t);
    if (!n && e) {
      const h = { renderer: this.H, gl: this.H.context, width: s, height: r };
      n = e.createShader(h), this.Z_.set(t, n);
    }
    return n;
  }
  ep(t, e, s, r) {
    e.begin(), this.H.he(this.Ve), this.Ve.oe({ u_texture: t, u_resolution: [s, r] }), this.H.ae(0, 0, s, r), e.end();
  }
  ue(t, e) {
    this.ks && (this.ks[0].resize(t, e), this.ks[1].resize(t, e));
  }
  L() {
    for (const t of this.Z_.values()) t.dispose();
    this.Z_.clear(), this.W_.clear(), this.Ve.dispose(), this.ks && (this.ks[0].dispose(), this.ks[1].dispose()), this.Pt = !1;
  }
  q_() {
    this.tp("invert", `#version 300 es
precision highp float;uniform sampler2D u_texture;in vec2 v_uv;out vec4 fragColor;void main(){vec4 A=texture(u_texture,v_uv);fragColor=vec4(1.-A.rgb,A.a);}`, {}), this.tp("grayscale", `#version 300 es
precision highp float;uniform sampler2D u_texture;uniform float Un;in vec2 v_uv;out vec4 fragColor;void main(){vec4 A=texture(u_texture,v_uv);float B=dot(A.rgb,vec3(0.299,0.587,0.114));vec3 C=mix(A.rgb,vec3(B),Un);fragColor=vec4(C,A.a);}`, { Un: ["amount", 1] }), this.tp("sepia", `#version 300 es
precision highp float;uniform sampler2D u_texture;uniform float Un;in vec2 v_uv;out vec4 fragColor;void main(){vec4 A=texture(u_texture,v_uv);vec3 B;B.r=dot(A.rgb,vec3(0.393,0.769,0.189));B.g=dot(A.rgb,vec3(0.349,0.686,0.168));B.b=dot(A.rgb,vec3(0.272,0.534,0.131));vec3 C=mix(A.rgb,B,Un);fragColor=vec4(C,A.a);}`, { Un: ["amount", 1] }), this.tp("threshold", `#version 300 es
precision highp float;uniform sampler2D u_texture;uniform float Uq;in vec2 v_uv;out vec4 fragColor;void main(){vec4 A=texture(u_texture,v_uv);float B=dot(A.rgb,vec3(0.299,0.587,0.114));float C=step(Uq,B);fragColor=vec4(vec3(C),A.a);}`, { Uq: ["threshold", 0.5] });
  }
}
const Nr = Object.freeze(Object.defineProperty({ __proto__: null, TextmodeFilterManager: Cs }, Symbol.toStringTag, { value: "Module" }));
class Ms {
  constructor(t, e) {
    o(this, "le");
    o(this, "H");
    o(this, "op");
    o(this, "ap");
    o(this, "cp", []);
    o(this, "lp", []);
    o(this, "fp");
    o(this, "dp", !1);
    o(this, "_p", /* @__PURE__ */ new Set());
    o(this, "pp", []);
    o(this, "mp", []);
    o(this, "gp", !1);
    o(this, "vp", () => {
    });
    o(this, "yp");
    o(this, "wp");
    o(this, "bp");
    o(this, "Mp");
    o(this, "Ap");
    o(this, "xp", { Ms: !0, As: 1, Ss: 0, Cs: L.NORMAL });
    this.le = t, this.H = t.H, this.ap = new Cs(this.H), this.op = new pr(this.H, this.le.p.width, this.le.p.height), this.fp = new j(this.H, { visible: !0, opacity: 1, fontSize: e.fontSize, fontSource: e.fontSource }), this.Mp = new Es(this.le, e.loadingScreen), this.Ap = new hs(this.le);
  }
  async kt() {
    await this.Cp(this.fp);
    const t = this.le.p;
    this.yp = this.H.Z(t.width, t.height, 1, { depth: !1 }), this.wp = this.H.Z(t.width, t.height, 1, { depth: !1 }), this.bp = this.yp, this.ap.kt(t.width, t.height), await this.Mp.kt(), await this.Ap.kt(), await this.Cp(this.Mp.fe), await this.Cp(this.Ap.fe), await this.Sp(), this.dp = !0;
  }
  Ep(t, e) {
    (this.gp ? this.mp : this.pp).push({ name: t, params: e });
  }
  Fp(t) {
    this.vp = t;
  }
  Tp() {
    this.pp = [], this.mp = [];
  }
  add(t = {}) {
    const e = new j(this.H, t);
    return this.dp ? (this.Cp(e), this.cp.push(e)) : this.lp.push(e), e;
  }
  remove(t) {
    this.Up(this.cp, t) || this.Up(this.lp, t);
  }
  move(t, e) {
    this.Pp(this.cp, t, e) || this.Pp(this.lp, t, e);
  }
  swap(t, e) {
    this.Lp(this.cp, t, e) || this.Lp(this.lp, t, e);
  }
  clear() {
    this.Dp(this.cp), this.cp = [], this.Dp(this.lp), this.lp = [];
  }
  kp(t, e = [], s = !1) {
    this.le.te.s_(), this.fp.qs(this.le, this.le.Rp);
    const r = [...this.H.state.gn.dn];
    let n = r;
    for (const h of this.cp) h.qs(this.le, this.le.Rp);
    for (const h of e) h.Ms && h.qs(this.le, this.le.Rp, { skipPluginHooks: !0 });
    if (s && e.length > 0) {
      const h = e[0], a = [...this.H.state.gn.dn], c = Math.max(0, Math.min(1, h.As));
      n = this.Op(r, a, c);
    }
    this.Ip(t, n, e);
  }
  Op(t, e, s) {
    const r = 1 - s;
    return [t[0] * r + e[0] * s, t[1] * r + e[1] * s, t[2] * r + e[2] * s, t[3] * r + e[3] * s];
  }
  Bp() {
    this.kp(this.yp), this.Np();
  }
  jp(t, e = !1) {
    this.kp(this.yp, [t], e), this.Np();
  }
  Np() {
    let t = this.yp.textures[0];
    if (this.pp.length > 0) {
      const e = this.le.p;
      this.ap.ip(this.yp.textures[0], this.wp, this.pp, e.width, e.height), t = this.wp.textures[0], this.bp = this.wp, this.pp = [];
    } else this.bp = this.yp;
    try {
      try {
        this.gp = !0, this.vp.call(this.le);
      } finally {
        this.gp = !1;
      }
      if (this.mp.length > 0) {
        const e = this.wp;
        this.ap.ip(this.bp.textures[0], e, this.mp, this.le.p.width, this.le.p.height), t = e.textures[0], this.bp = e;
      }
    } finally {
      this.mp = [], this.gp = !1;
    }
    this.zp(t), this.le.te.r_();
  }
  zp(t) {
    const e = this.le.p;
    this.H.Dh(0, 0, 0, 0), this.H.he(this.le.Qp), this.le.Qp.oe({ u_texture: t }), this.H.ae(0, 0, e.width, e.height);
  }
  Gp(t) {
    this.Hp(() => {
      t.qs(this.le, this.le.Rp, { skipPluginHooks: !0 });
      const e = t.texture, s = t.grid;
      e && s && (this.H.Dh(...this.H.state.gn.dn), this.H.he(this.le.Qp), this.le.Qp.oe({ u_texture: e }), this.H.ae(s.offsetX, s.offsetY, s.width, s.height));
    });
  }
  Vp(t, e = !1) {
    this.Hp(() => {
      const s = this.le.p, r = this.bp ?? this.yp, n = r.textures[0];
      if (!n) return;
      t.qs(this.le, this.le.Rp, { skipPluginHooks: !0 });
      const h = this.Xp(t);
      if (!h) return void this.zp(n);
      let a = [0, 0, 0, 0];
      if (e) {
        const u = [...this.H.state.gn.dn], l = Math.max(0, Math.min(1, t.As));
        a = this.Op(a, u, l);
      }
      const c = this.Yp(r);
      this.op.X_({ base: { layer: this.xp, texture: n, width: s.width, height: s.height, offsetX: 0, offsetY: 0 }, layers: [h], targetFramebuffer: c, backgroundColor: a, canvasWidth: s.width, canvasHeight: s.height }), this.zp(c.textures[0]);
    });
  }
  Hp(t) {
    const e = !this.H.Na();
    e && this.H.Ia(!0), this.H.Ga(!0), this.H.state.Ne();
    try {
      this.H.state.Ki.ws(), this.H.state.ee(), t();
    } finally {
      this.H.state.je(), this.H.Ha(), e && this.H.Ia(!1);
    }
  }
  Yp(t) {
    return t === this.yp ? this.wp : this.yp;
  }
  Xp(t) {
    if (!t.grid || !t.texture) return;
    const e = t.grid;
    return { layer: t, texture: t.texture, width: e.width, height: e.height, offsetX: e.offsetX + t.l, offsetY: e.offsetY + t._ };
  }
  Ip(t, e, s = []) {
    const r = this.le.p, n = this.Xp(this.fp);
    if (!n) return;
    const h = [];
    for (const a of this.cp) {
      const c = this.Xp(a);
      c && h.push(c);
    }
    for (const a of s) {
      if (!a.Ms) continue;
      const c = this.Xp(a);
      c && h.push(c);
    }
    this.op.X_({ base: n, layers: h, targetFramebuffer: t, backgroundColor: e, canvasWidth: r.width, canvasHeight: r.height });
  }
  ue() {
    var e, s, r, n, h;
    if (!this.dp) return;
    const t = this.le.p;
    this.fp.ue();
    for (const a of this.cp) a.ue();
    (e = this.Mp.fe) == null || e.ue(), (s = this.Ap.fe) == null || s.ue(), this.op.ue(t.width, t.height), (r = this.yp) == null || r.resize(t.width, t.height), (n = this.wp) == null || n.resize(t.width, t.height), (h = this.ap) == null || h.ue(t.width, t.height);
  }
  L() {
    var t, e;
    this.Mp.L(), this.Ap.L(), this.clear(), this.le.te.n_(this.fp), this.fp.L(), this.ap.L(), this.op.L(), (t = this.yp) == null || t.dispose(), (e = this.wp) == null || e.dispose(), this.pp = [], this.mp = [], this.gp = !1, this.dp = !1;
  }
  get all() {
    return this.cp;
  }
  get base() {
    return this.fp;
  }
  get filters() {
    return this.ap;
  }
  get resultFramebuffer() {
    const t = this.pp.length > 0 || this.mp.length > 0 ? this.wp : this.bp ?? this.yp;
    if (!t) throw new E("LayerManager.resultFramebuffer is not available before initialization completes.");
    return t;
  }
  get loading() {
    return this.Mp;
  }
  get errors() {
    return this.Ap;
  }
  Kp() {
    const t = this.cp;
    for (let e = t.length - 1; e >= 0; e--) {
      const s = t[e];
      if (s.Ms && s.grid) return s.grid;
    }
    return this.fp.grid;
  }
  Wp(t) {
    this._p.add(t);
  }
  Zp() {
    for (const t of this._p) t();
  }
  async Sp() {
    for (let t = 0; t < this.lp.length; t++) {
      const e = this.lp[t];
      await this.Cp(e), this.cp.push(e);
    }
    this.lp = [];
  }
  Up(t, e) {
    const s = t.indexOf(e);
    return s !== -1 && (t.splice(s, 1), this.$p(e), !0);
  }
  Pp(t, e, s) {
    const r = t.indexOf(e);
    return r !== -1 && (t.splice(r, 1), t.splice(X(s, 0, t.length), 0, e), !0);
  }
  Lp(t, e, s) {
    if (e === s) return !0;
    const r = t.indexOf(e), n = t.indexOf(s);
    return r !== -1 && n !== -1 && (t[r] = s, t[n] = e, !0);
  }
  Dp(t) {
    for (const e of t) this.$p(e);
  }
  $p(t) {
    this.le.te.n_(t), t.L();
  }
  async Cp(t) {
    var s;
    const e = { renderer: this.H, canvas: this.le.p, filterManager: this.ap, createFramebuffer: (r, n, h = 1, a) => this.H.Z(r, n, h, a) };
    await t.Vs(e), (s = t.grid) == null || s.S(() => this.Zp());
  }
}
const Br = Object.freeze(Object.defineProperty({ __proto__: null, LayerBlendMode: L, TEXTMODE_LAYER_BLEND_MODES: Gt, TextmodeLayer: j, TextmodeLayerManager: Ms }, Symbol.toStringTag, { value: "Module" })), gr = `#version 300 es
precision highp float;in vec2 v_uv;in vec3 v_worldPosition;uniform sampler2D u_image;uniform bool u_invert;uniform bool u_flipX;uniform bool u_flipY;uniform float u_charRotation;uniform float UB;uniform float UC;uniform bool u_charColorFixed;uniform vec4 u_charColor;uniform bool u_cellColorFixed;uniform vec4 u_cellColor;uniform vec4 u_backgroundColor;uniform int u_charCount;uniform sampler2D u_charPaletteTexture;uniform ivec2 u_charPaletteDimensions;layout(location=0)out vec4 o_character;layout(location=1)out vec4 o_primaryColor;layout(location=2)out vec4 o_secondaryColor;layout(location=3)out vec4 o_statePayload;
` + Vt + `
float A(vec3 B){return dot(B,vec3(0.299f,0.587f,0.114f));}vec3 C(int D){int E=max(u_charPaletteDimensions.x,1);int F=D/E;int G=D%E;return texelFetch(u_charPaletteTexture,ivec2(G,F),0).rgb;}void main(){vec2 H=vec2(v_uv.x,1.0f-v_uv.y);vec4 I=texture(u_image,H);float J=A(I.rgb);if(I.a<0.01f||J<UB||J>UC){discard;}vec2 K=vec2(0.);if(u_charCount>0){float L=float(u_charCount);float M=clamp(J*(L-1.0f),0.0f,L-1.0f);int N=int(floor(M+0.5f));vec3 O=C(N);K=O.xy;}else{K=vec2(0.0f,0.0f);}vec4 P=u_charColorFixed?u_charColor:I;vec4 Q=u_cellColorFixed?u_cellColor:I;vec3 R=tmApplyLighting(P.rgb,v_worldPosition);vec3 S=tmApplyLighting(Q.rgb,v_worldPosition);o_primaryColor=vec4(R,P.a);o_secondaryColor=vec4(S,Q.a);o_statePayload=vec4(0.);int T=int(u_invert?1:0);int U=int(u_flipX?1:0);int V=int(u_flipY?1:0);float W=float(T|(U<<1)|(V<<2))/255.;o_character=vec4(K,W,clamp(u_charRotation,0.0f,1.0f));}`, yr = { id: "brightness", createShader: ({ gl: i }) => new rt(i, As, gr), createUniforms: (i) => i.createBaseUniforms() };
class _s {
  constructor() {
    o(this, "qp", /* @__PURE__ */ new Map());
    o(this, "Z_", /* @__PURE__ */ new Map());
    this.Jp();
  }
  register(t) {
    this.qp.set(t.id, t);
  }
  unregister(t) {
    const e = this.Z_.get(t);
    return e && (e.dispose(), this.Z_.delete(t)), this.qp.delete(t);
  }
  has(t) {
    return this.qp.has(t);
  }
  Qu(t) {
    return this.qp.get(t);
  }
  zu(t, e) {
    let s = this.Z_.get(t);
    if (!s) {
      const r = this.qp.get(t);
      if (!r) throw Error(`[textmode.js] Conversion mode "${t}" is not registered.`);
      s = r.createShader(e), this.Z_.set(t, s);
    }
    return s;
  }
  L() {
    for (const t of this.Z_.values()) t.dispose();
    this.Z_.clear(), this.qp.clear();
  }
  Jp() {
    this.register(yr);
  }
}
const Xr = Object.freeze(Object.defineProperty({ __proto__: null, TextmodeConversionManager: _s }, Symbol.toStringTag, { value: "Module" })), pe = "textmode-v1";
function Ts() {
  var t, e;
  const i = globalThis.crypto;
  if (i != null && i.getRandomValues) {
    const s = new Uint32Array(4);
    return i.getRandomValues(s), `auto:${s[0]}:${s[1]}:${s[2]}:${s[3]}`;
  }
  return `auto:${Date.now()}:${((e = (t = globalThis.performance) == null ? void 0 : t.now) == null ? void 0 : e.call(t)) ?? 0}:${Math.random()}`;
}
function Ce(i) {
  return typeof i == "number" ? "number:" + (i + "") : "string:" + i;
}
function me(i, t) {
  return `stream:${i.length}:${i}:${t.length}:${t}`;
}
function Ht(i, t) {
  let e = (2166136261 ^ t) >>> 0;
  for (let s = 0; s < i.length; s += 1) e ^= i.charCodeAt(s), e = Math.imul(e, 16777619), e ^= e >>> 13;
  return e ^= i.length, e = Math.imul(e ^ e >>> 16, 2146121005), e = Math.imul(e ^ e >>> 15, 2221713035), (e ^ e >>> 16) >>> 0;
}
function Ke(i) {
  const t = i[0] + i[1] + i[3] | 0;
  return i[3] = i[3] + 1 | 0, i[0] = i[1] ^ i[1] >>> 9, i[1] = i[2] + (i[2] << 3) | 0, i[2] = i[2] << 21 | i[2] >>> 11, i[2] = i[2] + t | 0, t >>> 0;
}
class qt {
  constructor(t = Ts()) {
    o(this, "me");
    o(this, "tm");
    this.randomSeed(t);
  }
  random(t, e) {
    if (Array.isArray(t))
      return t.length === 0 ? void 0 : t[Math.floor(this.im() * t.length)];
    const s = this.im();
    return typeof t != "number" ? s : e === void 0 ? s * t : t + s * (e - t);
  }
  randomGaussian(t = 0, e = 1) {
    if (this.tm !== void 0) {
      const a = this.tm;
      return this.tm = void 0, t + a * e;
    }
    const s = Math.sqrt(-2 * Math.log(1 - this.im())), r = 2 * Math.PI * this.im(), n = s * Math.cos(r), h = s * Math.sin(r);
    return this.tm = h, t + n * e;
  }
  randomSeed(t) {
    this.me = (function(e) {
      const s = `${pe}\0${e}`, r = [Ht(s, 608135816), Ht(s, 2242054355), Ht(s, 320440878), Ht(s, 57701188)];
      r.every((n) => n === 0) && (r[0] = 1831565813);
      for (let n = 0; n < 12; n += 1) Ke(r);
      return r;
    })(Ce(t)), this.tm = void 0;
  }
  im() {
    return Ke(this.me) / 4294967296;
  }
  static get sm() {
    return pe;
  }
}
const Yr = Object.freeze(Object.defineProperty({ __proto__: null, TEXTMODE_RANDOM_ALGORITHM: pe, TextmodeRandom: qt }, Symbol.toStringTag, { value: "Module" })), $ = 4095;
function ie(i) {
  return 0.5 * (1 - Math.cos(i * Math.PI));
}
class vr {
  constructor(t) {
    o(this, "rm", []);
    o(this, "nm", 4);
    o(this, "hm", 0.5);
    this.noiseSeed(t);
  }
  noise(t, e = 0, s = 0) {
    t < 0 && (t = -t), e < 0 && (e = -e), s < 0 && (s = -s);
    let r = Math.floor(t), n = Math.floor(e), h = Math.floor(s), a = t - r, c = e - n, u = s - h, l = 0, f = 0.5;
    for (let d = 0; d < this.nm; d += 1) {
      let p = r + (n << 4) + (h << 8);
      const y = ie(a), w = ie(c);
      let v = this.rm[p & $], g = this.rm[p + 1 & $];
      v += y * (g - v), g = this.rm[p + 16 & $];
      let b = this.rm[p + 16 + 1 & $];
      g += y * (b - g), v += w * (g - v), p += 256, g = this.rm[p & $], b = this.rm[p + 1 & $], g += y * (b - g);
      let A = this.rm[p + 16 & $];
      b = this.rm[p + 16 + 1 & $], A += y * (b - A), g += w * (A - g), v += ie(u) * (g - v), l += v * f, f *= this.hm, r <<= 1, a *= 2, n <<= 1, c *= 2, h <<= 1, u *= 2, a >= 1 && (r += 1, a -= 1), c >= 1 && (n += 1, c -= 1), u >= 1 && (h += 1, u -= 1);
    }
    return X(l, 0, 1);
  }
  noiseSeed(t) {
    const e = new qt(t);
    this.rm = Array.from({ length: 4096 }, () => e.random());
  }
  noiseDetail(t, e) {
    this.nm = Number.isFinite(t) ? Math.max(1, Math.floor(t)) : 1, e !== void 0 && Number.isFinite(e) && (this.hm = X(e, 0, 1));
  }
}
const zr = Object.freeze(Object.defineProperty({ __proto__: null, TextmodeColor: S }, Symbol.toStringTag, { value: "Module" }));
class m {
  constructor(t = {}) {
    o(this, "H");
    o(this, "Rp");
    o(this, "Qp");
    o(this, "p");
    o(this, "om");
    o(this, "ud");
    o(this, "am");
    o(this, "um");
    o(this, "lm");
    o(this, "fm");
    o(this, "dm");
    o(this, "re");
    o(this, "_m");
    o(this, "pm", null);
    o(this, "gm", []);
    o(this, "vm", []);
    o(this, "ym", []);
    o(this, "wm", []);
    o(this, "bm", []);
    o(this, "Mm", null);
    o(this, "Am", new Float32Array(24));
    o(this, "xm", /* @__PURE__ */ new Set());
    o(this, "te");
    o(this, "Cm");
    o(this, "Sm");
    o(this, "Em", /* @__PURE__ */ new Map());
    o(this, "Fm");
    o(this, "Tm");
    o(this, "Pm");
    o(this, "Lm");
    o(this, "Da", !1);
    o(this, "Dm", !1);
    o(this, "Ec", !1);
    o(this, "km", null);
    o(this, "Rm", !1);
    o(this, "Om", 0);
    o(this, "Im", () => {
    });
    o(this, "Bm", () => {
    });
    o(this, "Nm");
    o(this, "jm");
    o(this, "zm");
    o(this, "wc", !1);
    o(this, "Qm");
    o(this, "Gm");
    o(this, "Xm", (t, e, s, r) => S.Vc(t, e, s, r, this.H.state.gn.Ln()));
    this.te = new ur(this), this.wc = t.overlay ?? !1;
    const e = t.seed ?? Ts();
    this.Sm = Ce(e), this.Cm = new qt(e), this.Fm = new vr(me(this.Sm, "noise")), this.Tm = new Promise((r) => {
      this.Lm = r;
    }), this.p = new zi(t), this.H = new Yi(this.p.Oc()), this.Rp = this.H.sr(vt, `#version 300 es
precision highp float;uniform sampler2D u_characterTexture;uniform vec2 u_charsetDimensions;uniform sampler2D Us;uniform sampler2D Ut;uniform sampler2D Ur;uniform bool Uu;uniform vec2 Uv;uniform vec2 Uw;uniform vec4 Ux;in vec2 v_uv;out vec4 fragColor;mat2 A(float B){float C=sin(B);float D=cos(B);return mat2(D,-C,C,D);}float E(vec3 F){return dot(F,vec3(0.299f,0.587f,0.114f));}void main(){vec2 G=gl_FragCoord.xy/Uw;vec2 H=G*Uv;vec2 I=floor(H);vec2 J=(I+0.5)/Uv;vec4 K=texture(Us,J);vec4 L=texture(Ut,J);vec4 M=texture(Ur,J);int N=int(M.r*255.+0.5);int O=int(M.g*255.+0.5);int P=int(M.a*255.+0.5);if(N==255&&O==255){fragColor=mix(Ux,L,L.a);return;}int Q=int(M.b*255.+0.5);bool R=(Q&1)!=0;bool S=(Q&2)!=0;bool T=(Q&4)!=0;int U=N+O*256;int V=int(u_charsetDimensions.x);int W=U/V;int X=U-(W*V);float Y=(u_charsetDimensions.y-1.)-float(W);vec2 Z=1./u_charsetDimensions;vec2 a=vec2(float(X),Y)*Z;vec2 b=a+Z;float c=-M.a*360.*0.017453292;vec2 d=fract(H)-0.5f;vec2 e=vec2(S?-1.:1.,T?-1.:1.);d*=e;d=A(c)*d+0.5;vec2 f=a+clamp(d,0.,1.)*Z;const float g=0.0001;if(any(lessThan(f,a-g))||any(greaterThan(f,b+g))){fragColor=R?K:L;return;}vec4 h=texture(u_characterTexture,f);if(!Uu){fragColor=h;return;}float i=(h.a>0.0f&&E(h.rgb)>0.5f)?1.0f:0.0f;if(R)i=1.0f-i;vec4 j=mix(Ux,L,L.a);fragColor=mix(j,K,i);}`), this.Qp = this.H.sr(vt, xs), this.om = new Wi(t.frameRate ?? 60), this.dm = new Ms(this, t);
    const s = () => this.Hm();
    this.fm = new $i(), this.ud = new Ji(this.p, s, this.fm), this.am = new sr(this.p, s, this.fm, this.ud), this.um = new tr(this.fm), this.lm = new or(this.fm), this._m = new _s(), this.te.T_(t.plugins ?? []), this.Pm = this.kt();
  }
  Vm(t) {
    var e;
    this.xm.add(t), (e = t.k) == null || e.call(t, () => {
      this.xm.delete(t);
    });
  }
  Ym(t, e) {
    var s;
    this.p.ue(t, e), (s = this.dm) == null || s.ue(), this.H.dc(), this.qs();
  }
  Km() {
    var r;
    const t = (r = this.dm) == null ? void 0 : r.base.grid;
    if (!t) return;
    const e = t.cols, s = t.rows;
    for (const n of this.xm) n instanceof xt && n.ue(e, s);
    this.Qm && this.Qm.ue(e, s);
  }
  async kt() {
    await this.dm.kt(), this.Lm();
    const t = this.dm.base.grid;
    this.Km(), this.dm.Wp(() => {
      this.ud.lf(), this.am.lf();
    }), this.wc && (this.Qm = Pt.il(this.H, this._m, this.p.targetCanvas, t.cols, t.rows, this.Xm)), this.Wm(), t.S(() => {
      this.Km();
    }), this.Zm();
    try {
      await this.te.h_(), await this.Im(), await this.te.a_(), this.om._l = 0, this.loading.I_(), this.Rm = !0, this.Zm();
    } catch (e) {
      this.$m(e, "setup");
    }
  }
  Zm() {
    this.om.ml(() => this.qs(), () => this.qm());
  }
  qm() {
    return !this.Dm && !this.Ec && (this.loading.we || this.errors.we || this.Rm || this.Om > 0 || this.km !== null);
  }
  Jm(t) {
    this.Om += t, this.Zm(), this.Da || this.loading.we || this.errors.we || this.tg();
  }
  Wm() {
    this.Nm = () => {
      if (this.wc) {
        const t = this.p.targetCanvas.getBoundingClientRect();
        this.resizeCanvas(Math.round(t.width), Math.round(t.height));
      }
      this.Bm();
    }, window.addEventListener("resize", this.Nm), this.ud.if(), this.am.if(), this.um.if(), this.lm.if(), this.jm = () => {
      this.um.Rf();
    }, window.addEventListener("blur", this.jm), this.wc && (this.zm = new ResizeObserver(() => {
      const t = this.p.targetCanvas.getBoundingClientRect();
      this.resizeCanvas(Math.round(t.width), Math.round(t.height));
    }), this.zm.observe(this.p.targetCanvas));
  }
  qs() {
    if (this.errors.we) {
      this.errors.Ae();
      const t = this.errors.fe;
      return void (t && this.dm.Gp(t));
    }
    if (this.loading.we) try {
      this.loading.Ae();
      const t = this.loading.fe;
      if (!t || !this.loading.we) return;
      if (this.loading.me === "transitioning") {
        if (this.ig(), this.errors.we || !this.loading.we) return;
        this.dm.Vp(t, !0);
      } else this.dm.Gp(t);
    } catch (t) {
      this.$m(t, "loading screen");
    }
    else this.tg() || this.sg() && this.eg();
  }
  sg() {
    return this.Rm || this.om.al;
  }
  ig() {
    this.sg() && this.eg();
  }
  tg() {
    if (this.loading.we || this.errors.we || this.Om <= 0) return !1;
    for (this.Rm = !1; this.Om > 0; ) this.Om--, this.eg();
    return !0;
  }
  eg() {
    this.Rm = !1, this.om.Al(), this.om.Cl(), this.ud.gf(), this.lm.gf(), this.Da = !0, this.H.Ia(!0);
    try {
      this.wc && Kt(this.H.context, this.Qm.texture, this.p.targetCanvas), this.dm.Bp();
    } catch (t) {
      this.$m(t, "draw loop");
    } finally {
      if (this.Da = !1, this.H.Ia(!1), this.Dm && !this.Ec) this.rg();
      else if (this.km) {
        const { width: t, height: e } = this.km;
        this.km = null, this.Ym(t, e);
      }
    }
  }
  resizeCanvas(t, e) {
    this.Da ? this.km = { width: t, height: e } : this.Ym(t, e);
  }
  destroy() {
    this.Ec || this.Dm || (this.Dm = !0, this.om.wl(), this.Da || this.rg());
  }
  async rg() {
    var t, e, s, r;
    this.p.L(), await this.te.k_(), window.removeEventListener("resize", this.Nm), window.removeEventListener("blur", this.jm), (t = this.zm) == null || t.disconnect(), this.ud.uf(), this.am.uf(), this.um.uf(), this.lm.uf(), (e = this.dm) == null || e.L(), (s = this._m) == null || s.L();
    for (const n of this.xm) n.dispose();
    this.xm.clear(), this.Rp.dispose(), this.Qp.dispose(), this.H.L(), (r = this.Qm) == null || r.dispose(), this.Ec = !0;
  }
  filter(t, e) {
    this.dm.Ep(t, e);
  }
  draw(t) {
    this.dm.base.draw(t);
  }
  postDraw(t) {
    this.dm.base.postDraw(t);
  }
  finalDraw(t) {
    this.dm.Fp(t);
  }
  async loadFont(t, e = !0) {
    if (e) return await this.dm.base.loadFont(t), this.dm.base.font;
    if (t instanceof N) return t.Pt || await t.kt(), t;
    const s = new N(this.H);
    return await s.kt(t), this.Vm(s), s;
  }
  async loadTileset(t, e = !0) {
    if (e) return await this.dm.base.loadTileset(t), this.dm.base.font;
    if (t instanceof Y) return t.Pt || await t.kt(), t;
    const s = new Y(this.H, t.fontSize, t);
    return await s.kt(), this.Vm(s), s;
  }
  fontSize(t) {
    return this.dm.base.fontSize(t);
  }
  useTileColors(t) {
    return this.dm.base.useTileColors(t);
  }
  inputGrid(t) {
    return t === void 0 ? this.Gm ?? "topmost" : t === "topmost" ? (this.Gm = void 0, this.ud.lf(), void this.am.lf()) : (this.Gm = t, this.ud.lf(), void this.am.lf());
  }
  Hm() {
    return this.Gm ? this.Gm : this.dm.Kp();
  }
  $m(t, e) {
    console.error(`Error during ${e}:`, t), this.loading.I_(), this.errors.be(t), this.Zm();
  }
  async setup(t) {
    this.Im = t;
  }
  windowResized(t) {
    this.Bm = t;
  }
  get grid() {
    var t;
    return ((t = this.re) == null ? void 0 : t.grid) ?? this.dm.base.grid;
  }
  get font() {
    var t;
    return ((t = this.re) == null ? void 0 : t.font) ?? this.dm.base.font;
  }
  get width() {
    return this.p.width;
  }
  get height() {
    return this.p.height;
  }
  pixelDensity(t) {
    if (t === void 0) return this.p.pixelDensity;
    if (t <= 0 || t === this.p.pixelDensity) return;
    const e = this.p.pixelDensity, s = this.p.width / e, r = this.p.height / e;
    this.p.Bc(t), this.resizeCanvas(s, r);
  }
  get canvas() {
    return this.p.canvas;
  }
  get isDisposed() {
    return this.Ec;
  }
  get overlay() {
    return this.Qm;
  }
  get loading() {
    return this.dm.loading;
  }
  get errors() {
    return this.dm.errors;
  }
  get layers() {
    return this.dm;
  }
  get filters() {
    return this.dm.filters;
  }
  get conversions() {
    return this._m;
  }
  get isRenderingFrame() {
    return this.Da;
  }
}
class Me {
  constructor() {
  }
  static create(t = {}) {
    return new m(t);
  }
  static setErrorLevel(t) {
    pt.Li(t);
  }
  static get version() {
    return "0.16.0";
  }
}
const Qe = /* @__PURE__ */ new WeakMap();
function wr(i, t, e) {
  var n;
  let s = Qe.get(i);
  s || (s = /* @__PURE__ */ new Map(), Qe.set(i, s)), (n = s.get(t)) == null || n();
  const r = i.fm.Ll(t, e);
  s.set(t, r);
}
function St(i) {
  const t = m.prototype;
  for (const e of i) t[e] = function(s) {
    wr(this, e, s);
  };
}
function $t(i) {
  for (const { name: t, get: e } of i) Object.defineProperty(m.prototype, t, { get: e, configurable: !0, enumerable: !0 });
}
function Rs(i, t) {
  const e = m.prototype;
  e[i] = e[t];
}
function Ss(i, t) {
  return function(e, s, r, n) {
    if (e === void 0) return S.Xc(...i.call(this));
    const h = this.Xm(e, s, r, n);
    t.call(this, h);
  };
}
const br = Object.freeze(Object.defineProperty({ __proto__: null, MOUSE_EVENT_NAMES: be }, Symbol.toStringTag, { value: "Module" }));
St(be), m.prototype.cursor = function(i) {
  this.ud.$l(i);
}, m.prototype.requestPointerLock = function() {
  return this.ud.ql();
}, m.prototype.exitPointerLock = function() {
  this.ud.Jl();
}, $t([{ name: "mouse", get: function() {
  return this.ud.ff();
} }, { name: "mouseIsPressed", get: function() {
  return this.ud.mf();
} }, { name: "pmouse", get: function() {
  return this.ud.df();
} }, { name: "movedX", get: function() {
  return this.ud._f();
} }, { name: "movedY", get: function() {
  return this.ud.pf();
} }]), m.prototype.frameRate = function(i) {
  return i === void 0 ? this.om.cl : this.om.Ml(i, () => this.qs());
}, m.prototype.targetFrameRate = function(i) {
  if (i === void 0) return this.om.el;
  this.om.xl(i);
}, m.prototype.noLoop = function() {
  this.om.wl();
}, m.prototype.loop = function() {
  this.om.bl(() => this.qs());
}, m.prototype.redraw = function(i = 1) {
  pt.Pi(typeof i == "number" && i > 0 && Number.isInteger(i), "Redraw count must be a positive integer.", { method: "redraw", providedValue: i }) && this.Jm(i);
}, m.prototype.isLooping = function() {
  return this.om.al;
}, m.prototype.deltaTime = function() {
  return this.om.dl;
}, Object.defineProperty(m.prototype, "frameCount", { get: function() {
  return this.om._l;
}, set: function(i) {
  this.om._l = i;
}, configurable: !0, enumerable: !0 }), Object.defineProperty(m.prototype, "millis", { get: function() {
  return this.om.Sl;
}, set: function(i) {
  this.om.Sl = i;
}, configurable: !0, enumerable: !0 }), Object.defineProperty(m.prototype, "secs", { get: function() {
  return this.om.El;
}, set: function(i) {
  this.om.El = i;
}, configurable: !0, enumerable: !0 });
const Ar = Object.freeze(Object.defineProperty({ __proto__: null, GESTURE_EVENT_NAMES: xe, TOUCH_EVENT_NAMES: Ae }, Symbol.toStringTag, { value: "Module" }));
St(Ae), St(xe), $t([{ name: "touches", get: function() {
  return this.am.Md();
} }]);
const xr = Object.freeze(Object.defineProperty({ __proto__: null, KEYBOARD_EVENT_NAMES: we }, Symbol.toStringTag, { value: "Module" }));
St(we), m.prototype.isKeyPressed = function(i) {
  return this.um.Ff(i);
}, $t([{ name: "lastKeyPressed", get: function() {
  return this.um.Pf();
} }, { name: "lastKeyReleased", get: function() {
  return this.um.Lf();
} }, { name: "pressedKeys", get: function() {
  return this.um.Df();
} }, { name: "modifierState", get: function() {
  return this.um.kf();
} }]);
const Er = Object.freeze(Object.defineProperty({ __proto__: null, GAMEPAD_EVENT_NAMES: Ee }, Symbol.toStringTag, { value: "Module" }));
St(Ee), m.prototype.gamepad = function(i) {
  return this.lm.Id(i);
}, $t([{ name: "gamepads", get: function() {
  return this.lm.Od();
} }]), m.prototype.perspective = function(i, t, e) {
  this.layers.base.perspective(i, t, e);
}, m.prototype.createCamera = function() {
  return this.layers.base.createCamera();
}, m.prototype.setCamera = function(i) {
  this.layers.base.setCamera(i);
}, m.prototype.resetCamera = function() {
  this.layers.base.resetCamera();
}, m.prototype.camera = function(i, t, e, s = 0, r = 0, n = 0, h = 0, a = 1, c = 0) {
  this.layers.base.camera(i, t, e, s, r, n, h, a, c);
}, m.prototype.lookAt = function(i, t, e, s, r, n) {
  this.layers.base.lookAt(i, t, e, s, r, n);
}, m.prototype.ortho = function(i, t) {
  this.layers.base.ortho(i, t);
};
var Cr = ((i) => (i[i.POINTS = 0] = "POINTS", i[i.LINES = 1] = "LINES", i[i.LINE_STRIP = 2] = "LINE_STRIP", i[i.LINE_LOOP = 3] = "LINE_LOOP", i[i.TRIANGLES = 4] = "TRIANGLES", i[i.TRIANGLE_STRIP = 5] = "TRIANGLE_STRIP", i[i.TRIANGLE_FAN = 6] = "TRIANGLE_FAN", i[i.QUADS = 7] = "QUADS", i[i.QUAD_STRIP = 8] = "QUAD_STRIP", i))(Cr || {});
const Mr = { POINTS: 0, LINES: 1, LINE_STRIP: 2, LINE_LOOP: 3, TRIANGLES: 4, TRIANGLE_STRIP: 5, TRIANGLE_FAN: 6, QUADS: 7, QUAD_STRIP: 8 }, _r = { 0: function(i, t, e, s, r, n) {
  for (let h = 0; h < n; h++) {
    const a = i.H.state;
    a.Ne(), a.Kn(r[h]), a.zn.Ar(t[h], e[h], s[h]), i.H.$a(1, 1), a.je();
  }
}, 1: function(i, t, e, s, r, n) {
  for (let h = 0; h + 1 < n; h += 2) ge(i, t, e, r, h, h + 1);
}, 2: Ze, 3: function(i, t, e, s, r, n) {
  Ze(i, t, e, s, r, n, "close");
}, 4: function(i, t, e, s, r, n) {
  for (let h = 0; h + 2 < n; h += 3) re(i, t, e, s, r[h], h, h + 1, h + 2);
}, 5: function(i, t, e, s, r, n) {
  for (let h = 0; h + 2 < n; h++) re(i, t, e, s, r[h], h, h + 1, h + 2);
}, 6: function(i, t, e, s, r, n) {
  for (let h = 1; h + 1 < n; h++) re(i, t, e, s, r[0], 0, h, h + 1);
}, 7: function(i, t, e, s, r, n) {
  for (let h = 0; h + 3 < n; h += 4) je(i, t, e, s, r[h], h, h + 1, h + 2, h + 3);
}, 8: function(i, t, e, s, r, n) {
  for (let h = 0; h + 3 < n; h += 2) je(i, t, e, s, r[h], h, h + 1, h + 3, h + 2);
} };
for (const [i, t] of Object.entries(Mr)) Object.defineProperty(m.prototype, i, { configurable: !0, enumerable: !1, value: t, writable: !1 });
function Ze(i, t, e, s, r, n, h) {
  for (let a = 0; a + 1 < n; a++) ge(i, t, e, r, a, a + 1);
  h === "close" && n > 2 && ge(i, t, e, r, n - 1, 0);
}
function ge(i, t, e, s, r, n) {
  const h = i.H.state;
  h.Ne(), h.Kn(s[r]), i.H.qa(t[r], e[r], t[n], e[n]), h.je();
}
function re(i, t, e, s, r, n, h, a) {
  Ps(i, 12);
  const c = i.Am;
  Q(c, 0, t[n], e[n], s[n]), Q(c, 4, t[h], e[h], s[h]), Q(c, 8, t[a], e[a], s[a]), Fs(i, r, 3);
}
function je(i, t, e, s, r, n, h, a, c) {
  Ps(i, 24);
  const u = i.Am;
  Q(u, 0, t[n], e[n], s[n]), Q(u, 4, t[h], e[h], s[h]), Q(u, 8, t[a], e[a], s[a]), Q(u, 12, t[n], e[n], s[n]), Q(u, 16, t[a], e[a], s[a]), Q(u, 20, t[c], e[c], s[c]), Fs(i, r, 6);
}
function Fs(i, t, e) {
  const s = i.H.state;
  s.Ne(), s.Kn(t), i.H.Ja(i.Am, e), s.je();
}
function Q(i, t, e, s, r) {
  i[t] = e, i[t + 1] = s, i[t + 2] = r, i[t + 3] = 0;
}
function Ps(i, t) {
  if (i.Am.length >= t) return;
  let e = i.Am.length;
  for (; e < t; ) e *= 2;
  i.Am = new Float32Array(e);
}
m.prototype.rect = function(i = 1, t = 1) {
  this.H.$a(i, t);
}, m.prototype.point = function() {
  this.H.$a(1, 1);
}, m.prototype.line = function(i, t, e, s) {
  this.H.qa(i, t, e, s);
}, m.prototype.lineWeight = function(i) {
  if (i === void 0) return this.H.state.gn.Jr;
  this.H.state.gn.bn(i);
}, m.prototype.ellipse = function(i = 1, t = 1) {
  this.H.tc(i / 2, t / 2);
}, m.prototype.triangle = function(i, t, e, s, r, n) {
  this.H.sc(i, t, e, s, r, n);
}, m.prototype.arc = function(i, t, e, s) {
  this.H.rc(i / 2, t / 2, e, s);
}, m.prototype.bezierCurve = function(i, t, e, s, r, n, h, a) {
  this.H.ec(i, t, e, s, r, n, h, a);
}, m.prototype.beginShape = function(i = 2) {
  if (this.pm !== null) throw Error("beginShape() called before endShape(). Call endShape() first.");
  this.pm = i, this.gm.length = 0, this.vm.length = 0, this.ym.length = 0, this.wm.length = 0, this.Mm ?? (this.Mm = wt.Vn()), this.H.state.Xn(this.Mm);
}, m.prototype.vertex = function(i, t, e = 0) {
  if (this.pm === null) throw Error("vertex() must be called between beginShape() and endShape().");
  const s = this.bm.pop() ?? wt.Vn();
  this.H.state.Xn(s), this.gm.push(i), this.vm.push(t), this.ym.push(e), this.wm.push(s);
}, m.prototype.endShape = function(i) {
  if (this.pm === null || this.Mm === null) throw Error("endShape() must be called after beginShape().");
  const t = this.pm, e = this.gm, s = this.vm, r = this.ym, n = this.wm, h = n.length, a = this.Mm;
  try {
    (function(c, u, l, f, d, p, y, w) {
      const v = _r[u];
      v == null || v(c, l, f, d, p, y, w);
    })(this, t, e, s, r, n, h, i);
  } finally {
    this.H.state.Kn(a);
    for (let c = 0; c < n.length; c++) this.bm.push(n[c]);
    e.length = 0, s.length = 0, r.length = 0, n.length = 0, this.pm = null;
  }
}, m.prototype.box = function(i = 50, t, e) {
  const s = t ?? i, r = e ?? s;
  this.H.nc(i, s, r);
}, m.prototype.sphere = function(i = 50) {
  this.H.hc(i);
}, m.prototype.torus = function(i = 50, t = 10) {
  this.H.oc(i, t);
}, m.prototype.cone = function(i = 50, t) {
  this.H.ac(i, t ?? i);
}, m.prototype.cylinder = function(i = 50, t) {
  this.H.cc(i, t ?? i);
}, m.prototype.ellipsoid = function(i = 50, t, e) {
  this.H.uc(i, t ?? i, e ?? i);
};
const Ve = new Float32Array(16);
m.prototype.rotate = function(i = 0, t, e) {
  const s = this.H.state.zn;
  if (typeof t == "number" || e !== void 0) return s.Er(i), s.Fr(t ?? 0), void s.Tr(e ?? 0);
  t === void 0 ? s.Tr(i) : Array.isArray(t) ? s.Pr(i, t[0] ?? 0, t[1] ?? 0, t[2] ?? 0) : s.Pr(i, t.x ?? 0, t.y ?? 0, t.z ?? 0);
}, m.prototype.rotateX = function(i) {
  if (i === void 0) return yt(this.H.state.zn.lr);
  this.H.state.zn.Er(i);
}, m.prototype.rotateY = function(i) {
  if (i === void 0) return yt(this.H.state.zn.dr);
  this.H.state.zn.Fr(i);
}, m.prototype.rotateZ = function(i) {
  if (i === void 0) return yt(this.H.state.zn._r);
  this.H.state.zn.Tr(i);
}, m.prototype.translate = function(i = 0, t = 0, e = 0) {
  this.H.state.zn.Ar(i, t, e);
}, m.prototype.translateX = function(i) {
  if (i === void 0) return this.H.state.zn.ar;
  this.H.state.zn.Ar(i, 0, 0);
}, m.prototype.translateY = function(i) {
  if (i === void 0) return this.H.state.zn.cr;
  this.H.state.zn.Ar(0, i, 0);
}, m.prototype.translateZ = function(i) {
  if (i === void 0) return this.H.state.zn.ur;
  this.H.state.zn.Ar(0, 0, i);
}, m.prototype.scale = function(i, t, e) {
  this.H.state.zn.Sr(i, t, e);
}, m.prototype.resetMatrix = function() {
  this.H.state.zn.Lr();
}, m.prototype.applyMatrix = function(...i) {
  let t;
  if (i.length === 1 && typeof i[0] != "number") t = i[0];
  else {
    if (i.length !== 16) throw Error("applyMatrix() expects either a 16-length array-like or 16 numeric arguments.");
    t = i;
  }
  if (t.length !== 16) throw Error("applyMatrix() expects exactly 16 values.");
  for (let e = 0; e < 16; e++) Ve[e] = Number(t[e] ?? 0);
  this.H.state.zn.Dr(Ve);
}, m.prototype.push = function() {
  this.H.state.Ne();
}, m.prototype.pop = function() {
  this.H.state.je();
}, Object.defineProperty(m.prototype, "windowWidth", { get: function() {
  return window.innerWidth;
}, configurable: !0, enumerable: !0 }), Object.defineProperty(m.prototype, "windowHeight", { get: function() {
  return window.innerHeight;
}, configurable: !0, enumerable: !0 }), Object.defineProperty(m.prototype, "displayWidth", { get: function() {
  return screen.width;
}, configurable: !0, enumerable: !0 }), Object.defineProperty(m.prototype, "displayHeight", { get: function() {
  return screen.height;
}, configurable: !0, enumerable: !0 }), m.prototype.color = function(i, t, e, s) {
  return this.Xm(i, t, e, s);
}, m.prototype.colorMode = function(i, t, e, s, r) {
  const n = this.H.state.gn;
  if (i === void 0) return n.Ln();
  const h = (function(a, c, u, l, f) {
    if (a !== "rgb" && a !== "hsb" && a !== "hsl") throw Error("colorMode() mode must be 'rgb', 'hsb', or 'hsl'.");
    let d = ds(a);
    if (c !== void 0 && u === void 0 && l === void 0 && f === void 0) d = [c, c, c, c];
    else if (c !== void 0 || u !== void 0 || l !== void 0 || f !== void 0) {
      if (c === void 0 || u === void 0 || l === void 0) throw Error("colorMode() expects either one shared max or max1, max2, and max3.");
      d = [c, u, l, f ?? d[3]];
    }
    for (const p of d) if (!Number.isFinite(p) || p <= 0) throw Error("colorMode() max values must be finite numbers greater than 0.");
    return { mode: a, maxes: d };
  })(i, t, e, s, r);
  n.Dn(h.mode, h.maxes);
}, m.prototype.background = function(i, t, e, s = 255) {
  if (i === void 0) {
    const [n, h, a, c] = this.H.state.gn.dn;
    return S.Xc(n, h, a, c);
  }
  const r = this.Xm(i, t, e, s);
  this.H.state.gn.Pn(r.r, r.g, r.b, r.a), this.H.lc(r.r, r.g, r.b, r.a);
}, m.prototype.clear = function() {
  this.H.Dh(0, 0, 0, 0);
};
const Tr = Ss(function() {
  return this.H.state.gn.en;
}, function(i) {
  this.H.state.gn.xn(i.r, i.g, i.b, i.a);
});
m.prototype.charColor = Tr, Rs("stroke", "charColor");
const Rr = Ss(function() {
  return this.H.state.gn.rn;
}, function(i) {
  this.H.state.gn.Cn(i.r, i.g, i.b, i.a);
});
function We(i) {
  if (typeof i != "object" || i === null) return !1;
  const t = i;
  return typeof t.x == "number" && typeof t.y == "number" && typeof t.z == "number";
}
m.prototype.cellColor = Rr, Rs("fill", "cellColor"), m.prototype.char = function(i) {
  if (i === void 0) return this.H.state.gn.sn;
  const t = typeof i == "number" ? this.font.characters[i].character : i;
  if (t.length === 0) throw Error("char() requires at least one character.");
  this.H.state.gn.Mn(this.font.jt(t)), this.H.state.gn.An(t);
}, m.prototype.flipX = function(i) {
  if (i === void 0) return this.H.state.gn.an;
  this.H.state.gn.Sn(i);
}, m.prototype.flipY = function(i) {
  if (i === void 0) return this.H.state.gn.cn;
  this.H.state.gn.En(i);
}, m.prototype.charRotation = function(i) {
  if (i === void 0) return 360 * this.H.state.gn.ln;
  this.H.state.gn.Tn(i);
}, m.prototype.invert = function(i) {
  if (i === void 0) return this.H.state.gn.un;
  this.H.state.gn.Fn(i);
}, m.prototype.ambientLight = function(i, t, e, s) {
  const r = S.zc(i, t, e, s), [n, h, a] = r.normalized;
  this.H.state.se.Wr(n, h, a);
}, m.prototype.pointLight = function(i, t, e, s, r, n) {
  let h, a;
  if (typeof i == "number" && typeof t == "number" && typeof e == "number") if (h = S.zc(i, t, e), We(s)) a = s;
  else {
    if (typeof s != "number" || typeof r != "number" || typeof n != "number") throw Error("pointLight() expected RGB + XYZ or RGB + { x, y, z }.");
    a = { x: s, y: r, z: n };
  }
  else if (h = S.zc(i), We(t)) a = t;
  else {
    if (typeof t != "number" || typeof e != "number" || typeof s != "number") throw Error("pointLight() expected color + XYZ or color + { x, y, z }.");
    a = { x: t, y: e, z: s };
  }
  const [c, u, l] = h.normalized;
  this.H.state.se.Zr(c, u, l, a.x, a.y, a.z);
}, m.prototype.lightFalloff = function(i, t, e) {
  this.H.state.se.$r(i, t, e);
}, m.prototype.noLights = function() {
  this.H.state.se.qr();
}, m.prototype.shader = function(i) {
  this.H.za(i);
}, m.prototype.resetShader = function() {
  this.H.Qa();
}, m.prototype.setUniform = function(i, t) {
  this.H.nr(i, t);
}, m.prototype.setUniforms = function(i) {
  this.H.oe(i);
}, m.prototype.createMaterialShader = async function(i) {
  const t = await Bt(i), e = this.H.Va(t);
  return this.Vm(e), e;
}, m.prototype.createFilterShader = async function(i) {
  return this.createMaterialShader(i);
}, m.prototype.createShader = async function(i, t) {
  const e = await Bt(i), s = await Bt(t), r = this.H.sr(e, s);
  return this.Vm(r), r;
};
class Lt extends xt {
  constructor(e, s, r, n, h, a, c, u, l, f) {
    super(e, s, r, n, h, a, c, u, f);
    o(this, "Kt");
    this.Kt = l;
  }
  static ng(e, s, r, n, h, a) {
    const c = e.context, { texture: u, width: l, height: f } = ve(c, r);
    return new Lt(c, e, u, s, l, f, n, h, r, a);
  }
  $() {
    this.Kt instanceof HTMLVideoElement ? this.Kt.readyState >= this.Kt.HAVE_CURRENT_DATA && Kt(this.Ce, this.Qn, this.Kt) : Kt(this.Ce, this.Qn, this.Kt);
  }
  Ge() {
    return this.Ju(), super.Ge();
  }
  Wa() {
    return this.Ju(), super.Wa();
  }
  Ku() {
    this.$();
  }
  aa() {
    this.$();
  }
  get source() {
    return this.Kt;
  }
}
class ht extends Lt {
  constructor(t, e, s, r, n, h, a, c, u, l) {
    super(t, e, s, r, h, a, c, u, n, l);
  }
  dispose() {
    super.dispose(), this.hg.pause(), this.hg.src = "", this.hg.load();
  }
  static async og(t) {
    const e = document.createElement("video");
    return e.crossOrigin = "anonymous", e.loop = !0, e.muted = !0, e.playsInline = !0, await new Promise((s, r) => {
      e.addEventListener("loadedmetadata", () => s(), { once: !0 }), e.addEventListener("error", (n) => {
        var a;
        const h = n.target;
        r(Error("Failed to load video: " + (((a = h.error) == null ? void 0 : a.message) || "Unknown error")));
      }, { once: !0 }), e.src = t;
    }), e;
  }
  static ng(t, e, s, r, n, h) {
    const a = t.context, { texture: c, width: u, height: l } = ve(a, s, a.LINEAR, a.LINEAR, a.CLAMP_TO_EDGE, a.CLAMP_TO_EDGE);
    return new ht(a, t, c, e, s, u, l, r, n, h);
  }
  static async il(t, e, s, r, n, h) {
    const a = await ht.og(s);
    return ht.ng(t, e, a, r, n, h);
  }
  async play() {
    await this.hg.play();
  }
  pause() {
    this.hg.pause();
  }
  stop() {
    this.hg.pause(), this.hg.currentTime = 0;
  }
  speed(t) {
    return this.hg.playbackRate = t, this;
  }
  loop(t = !0) {
    return this.hg.loop = t, this;
  }
  time(t) {
    return this.hg.currentTime = t, this;
  }
  volume(t) {
    return this.hg.volume = X(t, 0, 1), this;
  }
  get videoElement() {
    return this.hg;
  }
  get currentTime() {
    return this.hg.currentTime;
  }
  get duration() {
    return this.hg.duration;
  }
  get isPlaying() {
    return !this.hg.paused && !this.hg.ended;
  }
  get hg() {
    return this.Kt;
  }
}
m.prototype.createFramebuffer = function(i) {
  const t = this.H.Z(i.width ?? this.grid.cols, i.height ?? this.grid.rows, i.attachments ?? 3);
  return this.Vm(t), t;
}, m.prototype.image = function(i, t, e) {
  this.H.Ya(i, t, e, this.font), i instanceof gt && this.H.ze();
}, m.prototype.loadImage = async function(i) {
  const t = i, e = new Promise((h, a) => {
    const c = new Image();
    c.crossOrigin = "anonymous", c.onload = () => h(c), c.onerror = (u) => a(u), c.src = t;
  }), [s] = await Promise.all([e, this.Tm]), r = this.grid;
  if (!r) throw Error("[textmode.js] Cannot load image before grid initialization completes.");
  const n = Pt.il(this.H, this._m, s, r.cols, r.rows, this.Xm);
  return this.Vm(n), n;
}, m.prototype.loadVideo = async function(i) {
  const [t] = await Promise.all([ht.og(i), this.Tm]), e = this.grid;
  if (!e) throw Error("[textmode.js] Cannot load video before grid initialization completes.");
  const s = ht.ng(this.H, this._m, t, e.cols, e.rows, this.Xm);
  return this.Vm(s), s;
}, m.prototype.createTexture = function(i) {
  const t = this.grid, e = Lt.ng(this.H, this._m, i, (t == null ? void 0 : t.cols) ?? 1, (t == null ? void 0 : t.rows) ?? 1, this.Xm);
  return this.Vm(e), e;
}, m.prototype.texture = function(i) {
  if (i instanceof gt) return void this.H.state.Qn.In(i);
  if (!(i instanceof xt)) throw new E("[textmode.js] texture() expects a TextmodeImage, TextmodeVideo, TextmodeTexture, or TextmodeFramebuffer source.", { method: "texture", providedValue: i });
  const t = i.qu(this.font);
  i.Za() && this.H.ja(i), this.H.state.Qn.On(t);
}, m.prototype.noTexture = function() {
  this.H.state.Qn.Bn();
};
const Sr = { BLEND_NORMAL: L.NORMAL, BLEND_ADDITIVE: L.ADDITIVE, BLEND_MULTIPLY: L.MULTIPLY, BLEND_SCREEN: L.SCREEN, BLEND_SUBTRACT: L.SUBTRACT, BLEND_DARKEN: L.DARKEN, BLEND_LIGHTEN: L.LIGHTEN, BLEND_OVERLAY: L.OVERLAY, BLEND_SOFT_LIGHT: L.SOFT_LIGHT, BLEND_HARD_LIGHT: L.HARD_LIGHT, BLEND_COLOR_DODGE: L.COLOR_DODGE, BLEND_COLOR_BURN: L.COLOR_BURN, BLEND_DIFFERENCE: L.DIFFERENCE, BLEND_EXCLUSION: L.EXCLUSION };
for (const [i, t] of Object.entries(Sr)) Object.defineProperty(m.prototype, i, { configurable: !0, enumerable: !1, value: t, writable: !1 });
m.prototype.on = function(i, t) {
  return this.fm.Ll(i, t);
}, m.prototype.off = function(i, t) {
  this.fm.Dl(i, t);
}, m.prototype.once = function(i, t) {
  return this.fm.kl(i, t);
}, m.prototype.random = function(i, t) {
  return Array.isArray(i) ? this.Cm.random(i) : typeof i != "number" ? this.Cm.random() : typeof t != "number" ? this.Cm.random(i) : this.Cm.random(i, t);
}, m.prototype.randomGaussian = function(i, t) {
  return this.Cm.randomGaussian(i, t);
}, m.prototype.randomSeed = function(i) {
  this.Sm = Ce(i), this.Cm.randomSeed(i), this.Em.clear(), this.Fm.noiseSeed(me(this.Sm, "noise"));
}, m.prototype.randomStream = function(i) {
  const t = i + "", e = this.Em.get(t);
  if (e) return e;
  const s = new qt(me(this.Sm, t));
  return this.Em.set(t, s), s;
}, m.prototype.noise = function(i, t, e) {
  return this.Fm.noise(i, t, e);
}, m.prototype.noiseSeed = function(i) {
  this.Fm.noiseSeed(i);
}, m.prototype.noiseDetail = function(i, t) {
  this.Fm.noiseDetail(i, t);
};
class Zt {
  constructor(t = 0, e = 0, s = 0) {
    o(this, "x");
    o(this, "y");
    o(this, "z");
    this.x = t, this.y = e, this.z = s;
  }
  set(t, e, s) {
    return _e(t) ? (this.x = t.x, this.y = t.y, this.z = t.z ?? 0, this) : Te(t) ? (this.x = t[0] ?? 0, this.y = t[1] ?? 0, this.z = t[2] ?? 0, this) : (this.x = t ?? 0, this.y = e ?? 0, this.z = s ?? 0, this);
  }
  copy() {
    return new Zt(this.x, this.y, this.z);
  }
  add(t, e, s) {
    const [r, n, h] = qe(t, e, s);
    return this.x += r, this.y += n, this.z += h, this;
  }
  sub(t, e, s) {
    const [r, n, h] = qe(t, e, s);
    return this.x -= r, this.y -= n, this.z -= h, this;
  }
  mult(t, e, s) {
    const [r, n, h] = $e(t, e, s);
    return this.x *= r, this.y *= n, this.z *= h, this;
  }
  div(t, e, s) {
    const [r, n, h] = $e(t, e, s);
    return this.x /= r, this.y /= n, this.z /= h, this;
  }
  mag() {
    return Math.hypot(this.x, this.y, this.z);
  }
  magSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }
  normalize() {
    const t = this.mag();
    return t !== 0 && this.div(t), this;
  }
  limit(t) {
    return this.magSq() > t * t && this.setMag(t), this;
  }
  setMag(t) {
    return this.normalize().mult(t);
  }
  dist(t, e, s) {
    const [r, n, h] = Xt(t, e, s);
    return Math.hypot(this.x - r, this.y - n, this.z - h);
  }
  dot(t, e, s) {
    const [r, n, h] = Xt(t, e, s);
    return this.x * r + this.y * n + this.z * h;
  }
  cross(t, e, s) {
    const [r, n, h] = Xt(t, e, s);
    return new Zt(this.y * h - this.z * n, this.z * r - this.x * h, this.x * n - this.y * r);
  }
  heading() {
    return yt(Math.atan2(this.y, this.x));
  }
}
function _e(i) {
  return typeof i == "object" && i !== null && "x" in i && "y" in i && typeof i.x == "number" && typeof i.y == "number";
}
function Te(i) {
  return Array.isArray(i);
}
function Xt(i, t, e) {
  return _e(i) ? [i.x, i.y, i.z ?? 0] : Te(i) ? [i[0] ?? 0, i[1] ?? 0, i[2] ?? 0] : [i ?? 0, t ?? 0, e ?? 0];
}
function qe(i, t, e) {
  return Xt(i, t, e);
}
function $e(i, t, e) {
  if (_e(i)) return [i.x, i.y, i.z ?? 1];
  if (Te(i)) {
    if (i.length === 1) {
      const s = i[0] ?? 1;
      return [s, s, s];
    }
    return [i[0] ?? 1, i[1] ?? 1, i[2] ?? 1];
  }
  return i !== void 0 && t === void 0 && e === void 0 ? [i, i, i] : [i ?? 1, t ?? 1, e ?? 1];
}
m.prototype.sin = Math.sin, m.prototype.cos = Math.cos, m.prototype.tan = Math.tan, m.prototype.asin = Math.asin, m.prototype.acos = Math.acos, m.prototype.atan = Math.atan, m.prototype.atan2 = Math.atan2, m.prototype.floor = Math.floor, m.prototype.ceil = Math.ceil, m.prototype.round = function(i, t = 0) {
  if (t <= 0) return Math.round(i);
  const e = Math.pow(10, t);
  return Math.round(i * e) / e;
}, m.prototype.abs = Math.abs, m.prototype.min = function(...i) {
  const t = Array.isArray(i[0]) ? i[0] : i;
  return Math.min(...t);
}, m.prototype.max = function(...i) {
  const t = Array.isArray(i[0]) ? i[0] : i;
  return Math.max(...t);
}, m.prototype.sq = function(i) {
  return i * i;
}, m.prototype.sqrt = Math.sqrt, m.prototype.pow = Math.pow, m.prototype.fract = function(i) {
  return i - Math.floor(i);
}, m.prototype.exp = Math.exp, m.prototype.log = Math.log, m.prototype.lerp = function(i, t, e) {
  return i + (t - i) * e;
}, m.prototype.ease = function(i, t) {
  return Js(i, t);
}, m.prototype.map = function(i, t, e, s, r) {
  return s + (r - s) * (i - t) / (e - t);
}, m.prototype.norm = function(i, t, e) {
  return this.map(i, t, e, 0, 1);
}, m.prototype.constrain = function(i, t, e) {
  return X(i, t, e);
}, m.prototype.clamp = function(i, t, e) {
  return X(i, t, e);
}, m.prototype.dist = function(i, t, e, s) {
  return Et(i, t, e, s);
}, m.prototype.degrees = function(i) {
  return yt(i);
}, m.prototype.radians = function(i) {
  return Z(i);
}, m.prototype.createVector = function(i = 0, t = 0, e = 0) {
  return new Zt(i, t, e);
};
class Re {
  constructor(t) {
    o(this, "ag");
    o(this, "characters");
    o(this, "length");
    const e = zt(t);
    if (e.length < 2) throw Error("TextmodeGlyphRamp requires at least two characters.");
    this.characters = t, this.length = e.length, this.ag = e;
  }
  at(t, e, s) {
    if (e !== void 0 || s !== void 0) {
      if (e === void 0 || s === void 0) throw Error("TextmodeGlyphRamp.at() range mapping requires both min and max.");
      if (e === s) throw Error("TextmodeGlyphRamp.at() requires min and max to be different.");
      return this.at((t - e) / (s - e));
    }
    const r = (function(h) {
      return Number.isNaN(h) ? 0 : h === 1 / 0 ? 1 : h === -1 / 0 ? 0 : Math.min(Math.max(h, 0), 1);
    })(t), n = Math.min(Math.floor(r * this.length), this.length - 1);
    return this.ag[n];
  }
  shift(t) {
    const e = (Math.trunc(t) % this.length + this.length) % this.length, s = [...this.ag.slice(e), ...this.ag.slice(0, e)].join("");
    return new Re(s);
  }
}
m.prototype.createGlyphRamp = function(i) {
  return new Re(i);
};
const Fr = { red: "#ff0000", green: "#00ff00", blue: "#0000ff", yellow: "#ffff00", cyan: "#00ffff", magenta: "#ff00ff", white: "#ffffff", black: "#000000", gray: "#808080", grey: "#808080", orange: "#ffa500", purple: "#800080", pink: "#ffc0cb", brown: "#a52a2a" }, dt = B.FLOATS_PER_INSTANCE, Pr = gs[_.RECTANGLE];
function Lr(i) {
  if (i.startsWith("fg=")) return { kind: "fg", value: i.substring(3).trim() };
  if (i === "/fg") return { kind: "/fg" };
  if (i.startsWith("bg=")) return { kind: "bg", value: i.substring(3).trim() };
  if (i === "/bg") return { kind: "/bg" };
  if (i.startsWith("rot=")) {
    const t = i.substring(4).trim(), e = t.length > 0 ? Number(t) : NaN;
    return { kind: "rot", value: Number.isFinite(e) ? e : void 0 };
  }
  return i === "/rot" ? { kind: "/rot" } : i === "inv" ? { kind: "inv" } : i === "/inv" ? { kind: "/inv" } : i === "fx" ? { kind: "fx" } : i === "/fx" ? { kind: "/fx" } : i === "fy" ? { kind: "fy" } : i === "/fy" ? { kind: "/fy" } : void 0;
}
function Ur(i, t, e, s, r) {
  let n = new Float32Array(Math.max(16, Math.min(i.length, 256)) * dt);
  const h = [], a = [], c = (function(v) {
    const g = v.H.state.gn;
    return { fg: [ts(g.en)], bg: [ts(g.rn)], invert: [g.un], flipX: [g.an], flipY: [g.cn], charRotation: [g.ln] };
  })(this), u = this.font;
  let l = 0, f = 0, d = 0, p = 0, y = 0;
  const w = (v) => {
    ((C) => {
      if (C * dt <= n.length) return;
      let R = n.length / dt;
      for (; R < C; ) R *= 2;
      const T = new Float32Array(R * dt);
      T.set(n), n = T;
    })(l + 1);
    const g = l * dt, b = u.jt(v), A = c.fg[c.fg.length - 1], x = c.bg[c.bg.length - 1];
    n[g + 0] = d * (1 + r), n[g + 1] = f * e, n[g + 2] = 1, n[g + 3] = 1, n[g + 4] = b[0], n[g + 5] = b[1], n[g + 6] = b[2], n[g + 7] = A[0], n[g + 8] = A[1], n[g + 9] = A[2], n[g + 10] = A[3], n[g + 11] = x[0], n[g + 12] = x[1], n[g + 13] = x[2], n[g + 14] = x[3], n[g + 15] = c.invert[c.invert.length - 1] ? 1 : 0, n[g + 16] = c.flipX[c.flipX.length - 1] ? 1 : 0, n[g + 17] = c.flipY[c.flipY.length - 1] ? 1 : 0, n[g + 18] = c.charRotation[c.charRotation.length - 1], n[g + 19] = 0, n[g + 20] = 0, n[g + 21] = 0, n[g + 22] = 0, n[g + 23] = 0, n[g + 24] = 0, n[g + 25] = 0, n[g + 26] = 0, n[g + 27] = 0, n[g + 28] = 0, n[g + 29] = 0, n[g + 30] = 0, n[g + 31] = 0, n[g + 32] = 0, n[g + 33] = 0, n[g + 34] = 0, n[g + 35] = Pr, h[l] = f, l++;
  };
  for (; y < i.length; ) {
    const v = i[y];
    if (v !== `
`) if (t && v === "[" && i[y + 1] === "[") w("["), p++, d++, y += 2;
    else if (t && v === "]" && i[y + 1] === "]") w("]"), p++, d++, y += 2;
    else {
      if (t && v === "[") {
        const g = i.indexOf("]", y);
        if (g !== -1) {
          const b = Lr(i.substring(y + 1, g));
          if (b) {
            Dr(b, c), y = g + 1;
            continue;
          }
        }
      }
      v !== "	" ? (w(v), p++, d++, y++) : (p++, d += s, y++);
    }
    else a.push(p), p = 0, f++, d = 0, y++;
  }
  return a.push(p), { data: n, glyphLines: h, glyphCount: l, lineWidths: a };
}
function Dr(i, t) {
  i.kind === "fg" ? Je(t.fg, i.value) : i.kind === "/fg" ? ft(t.fg) : i.kind === "bg" ? Je(t.bg, i.value) : i.kind === "/bg" ? ft(t.bg) : i.kind === "inv" ? t.invert.push(!0) : i.kind === "/inv" ? ft(t.invert) : i.kind === "fx" ? t.flipX.push(!0) : i.kind === "/fx" ? ft(t.flipX) : i.kind === "fy" ? t.flipY.push(!0) : i.kind === "/fy" ? ft(t.flipY) : i.kind === "rot" ? t.charRotation.push(i.value === void 0 ? t.charRotation[t.charRotation.length - 1] : jt(i.value)) : i.kind === "/rot" && ft(t.charRotation);
}
function Je(i, t) {
  const e = Fr[t.toLowerCase()] || t;
  try {
    i.push([(s = S.zc(e)).r / 255, s.g / 255, s.b / 255, s.a / 255]);
  } catch {
    i.push(i[i.length - 1]);
  }
  var s;
}
function ts(i) {
  return [i[0], i[1], i[2], i[3]];
}
function ft(i) {
  i.length > 1 && i.pop();
}
m.prototype.printAlign = function(i, t = "top") {
  this.cg = i, this.ug = t;
}, m.prototype.print = function(i, t, e, s) {
  const r = (s == null ? void 0 : s.leading) ?? 1, n = (s == null ? void 0 : s.tabSize) ?? 4, h = (s == null ? void 0 : s.letterSpacing) ?? 0, a = (s == null ? void 0 : s.markup) !== !1, c = this.cg || "left", u = this.ug || "top", l = Ur.call(this, i, a, r, n, h);
  l.glyphCount !== 0 && ((function(f, d, p, y, w, v, g) {
    const { data: b, glyphLines: A, glyphCount: x, lineWidths: C } = d, R = C.length;
    let T = 0;
    v === "middle" ? T = -Math.floor((R - 1) * g / 2) : v === "bottom" && (T = -(R - 1) * g);
    const M = f.H.state.zn, F = M.vr, P = M.pr, k = M.mr, G = M.lr, ot = M.dr, at = M._r;
    for (let K = 0; K < x; K++) {
      const I = K * dt, tt = C[A[K]] ?? 0;
      let V = 0;
      w === "center" ? V = -Math.floor(tt / 2) : w === "right" && (V = -tt);
      const W = p + V + b[I + 0], q = y + T + b[I + 1];
      b[I + 0] = 0, b[I + 1] = 0, b[I + 2] = P, b[I + 3] = k, b[I + 19] = F[0] * W + F[4] * q + F[12], b[I + 20] = F[1] * W + F[5] * q + F[13], b[I + 21] = F[2] * W + F[6] * q + F[14], b[I + 22] = G, b[I + 23] = ot, b[I + 24] = at;
    }
  })(this, l, t, e, c, u, r), this.H.Ho(l.data, l.glyphCount));
};
const Gr = Object.freeze(Object.defineProperty({ __proto__: null, TextmodeImage: Pt, TextmodeSource: xt, TextmodeTexture: Lt, TextmodeVideo: ht }, Symbol.toStringTag, { value: "Module" })), Kr = Object.freeze(Object.defineProperty({ __proto__: null, INPUT_EVENT_NAMES: qi, gamepad: Er, keyboard: xr, mouse: br, touch: Ar }, Symbol.toStringTag, { value: "Module" })), Qr = Object.freeze(Object.defineProperty({ __proto__: null }, Symbol.toStringTag, { value: "Module" })), Zr = Me.create, jr = Me.setErrorLevel, Vr = Me.version;
export {
  Cr as BeginShapeMode,
  hs as ErrorLayerController,
  qi as INPUT_EVENT_NAMES,
  L as LayerBlendMode,
  Es as LoadingLayerController,
  qs as TEXTMODE_EASE_NAMES,
  Gt as TEXTMODE_LAYER_BLEND_MODES,
  J as TextmodeCamera,
  _s as TextmodeConversionManager,
  E as TextmodeError,
  rs as TextmodeErrorLevel,
  Cs as TextmodeFilterManager,
  N as TextmodeFont,
  gt as TextmodeFramebuffer,
  Re as TextmodeGlyphRamp,
  Ds as TextmodeGrid,
  Pt as TextmodeImage,
  j as TextmodeLayer,
  Ms as TextmodeLayerManager,
  qt as TextmodeRandom,
  rt as TextmodeShader,
  xt as TextmodeSource,
  Lt as TextmodeTexture,
  Y as TextmodeTileset,
  Zt as TextmodeVector,
  ht as TextmodeVideo,
  m as Textmodifier,
  zr as color,
  Xr as conversion,
  Zr as create,
  Or as errors,
  Nr as filters,
  Hr as fonts,
  Kr as input,
  Br as layering,
  kr as loading,
  Gr as media,
  Qr as plugins,
  Yr as random,
  jr as setErrorLevel,
  Me as textmode,
  Vr as version
};
