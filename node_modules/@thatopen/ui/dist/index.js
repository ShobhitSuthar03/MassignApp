var Fs = Object.defineProperty;
var Vs = (i, t, e) => t in i ? Fs(i, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : i[t] = e;
var ot = (i, t, e) => (Vs(i, typeof t != "symbol" ? t + "" : t, e), e);
const Rt = Math.min, J = Math.max, $e = Math.round, ct = (i) => ({
  x: i,
  y: i
}), Us = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
}, qs = {
  start: "end",
  end: "start"
};
function nn(i, t, e) {
  return J(i, Rt(t, e));
}
function ce(i, t) {
  return typeof i == "function" ? i(t) : i;
}
function K(i) {
  return i.split("-")[0];
}
function Ne(i) {
  return i.split("-")[1];
}
function Hn(i) {
  return i === "x" ? "y" : "x";
}
function Dn(i) {
  return i === "y" ? "height" : "width";
}
function Et(i) {
  return ["top", "bottom"].includes(K(i)) ? "y" : "x";
}
function Fn(i) {
  return Hn(Et(i));
}
function Ws(i, t, e) {
  e === void 0 && (e = !1);
  const s = Ne(i), n = Fn(i), r = Dn(n);
  let o = n === "x" ? s === (e ? "end" : "start") ? "right" : "left" : s === "start" ? "bottom" : "top";
  return t.reference[r] > t.floating[r] && (o = Ce(o)), [o, Ce(o)];
}
function Qs(i) {
  const t = Ce(i);
  return [ri(i), t, ri(t)];
}
function ri(i) {
  return i.replace(/start|end/g, (t) => qs[t]);
}
function Ys(i, t, e) {
  const s = ["left", "right"], n = ["right", "left"], r = ["top", "bottom"], o = ["bottom", "top"];
  switch (i) {
    case "top":
    case "bottom":
      return e ? t ? n : s : t ? s : n;
    case "left":
    case "right":
      return t ? r : o;
    default:
      return [];
  }
}
function Gs(i, t, e, s) {
  const n = Ne(i);
  let r = Ys(K(i), e === "start", s);
  return n && (r = r.map((o) => o + "-" + n), t && (r = r.concat(r.map(ri)))), r;
}
function Ce(i) {
  return i.replace(/left|right|bottom|top/g, (t) => Us[t]);
}
function Xs(i) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...i
  };
}
function Vn(i) {
  return typeof i != "number" ? Xs(i) : {
    top: i,
    right: i,
    bottom: i,
    left: i
  };
}
function Mt(i) {
  const {
    x: t,
    y: e,
    width: s,
    height: n
  } = i;
  return {
    width: s,
    height: n,
    top: e,
    left: t,
    right: t + s,
    bottom: e + n,
    x: t,
    y: e
  };
}
function sn(i, t, e) {
  let {
    reference: s,
    floating: n
  } = i;
  const r = Et(t), o = Fn(t), l = Dn(o), a = K(t), c = r === "y", u = s.x + s.width / 2 - n.width / 2, d = s.y + s.height / 2 - n.height / 2, f = s[l] / 2 - n[l] / 2;
  let p;
  switch (a) {
    case "top":
      p = {
        x: u,
        y: s.y - n.height
      };
      break;
    case "bottom":
      p = {
        x: u,
        y: s.y + s.height
      };
      break;
    case "right":
      p = {
        x: s.x + s.width,
        y: d
      };
      break;
    case "left":
      p = {
        x: s.x - n.width,
        y: d
      };
      break;
    default:
      p = {
        x: s.x,
        y: s.y
      };
  }
  switch (Ne(t)) {
    case "start":
      p[o] -= f * (e && c ? -1 : 1);
      break;
    case "end":
      p[o] += f * (e && c ? -1 : 1);
      break;
  }
  return p;
}
const Js = async (i, t, e) => {
  const {
    placement: s = "bottom",
    strategy: n = "absolute",
    middleware: r = [],
    platform: o
  } = e, l = r.filter(Boolean), a = await (o.isRTL == null ? void 0 : o.isRTL(t));
  let c = await o.getElementRects({
    reference: i,
    floating: t,
    strategy: n
  }), {
    x: u,
    y: d
  } = sn(c, s, a), f = s, p = {}, b = 0;
  for (let v = 0; v < l.length; v++) {
    const {
      name: g,
      fn: S
    } = l[v], {
      x: E,
      y: x,
      data: $,
      reset: O
    } = await S({
      x: u,
      y: d,
      initialPlacement: s,
      placement: f,
      strategy: n,
      middlewareData: p,
      rects: c,
      platform: o,
      elements: {
        reference: i,
        floating: t
      }
    });
    u = E ?? u, d = x ?? d, p = {
      ...p,
      [g]: {
        ...p[g],
        ...$
      }
    }, O && b <= 50 && (b++, typeof O == "object" && (O.placement && (f = O.placement), O.rects && (c = O.rects === !0 ? await o.getElementRects({
      reference: i,
      floating: t,
      strategy: n
    }) : O.rects), {
      x: u,
      y: d
    } = sn(c, f, a)), v = -1);
  }
  return {
    x: u,
    y: d,
    placement: f,
    strategy: n,
    middlewareData: p
  };
};
async function Un(i, t) {
  var e;
  t === void 0 && (t = {});
  const {
    x: s,
    y: n,
    platform: r,
    rects: o,
    elements: l,
    strategy: a
  } = i, {
    boundary: c = "clippingAncestors",
    rootBoundary: u = "viewport",
    elementContext: d = "floating",
    altBoundary: f = !1,
    padding: p = 0
  } = ce(t, i), b = Vn(p), g = l[f ? d === "floating" ? "reference" : "floating" : d], S = Mt(await r.getClippingRect({
    element: (e = await (r.isElement == null ? void 0 : r.isElement(g))) == null || e ? g : g.contextElement || await (r.getDocumentElement == null ? void 0 : r.getDocumentElement(l.floating)),
    boundary: c,
    rootBoundary: u,
    strategy: a
  })), E = d === "floating" ? {
    x: s,
    y: n,
    width: o.floating.width,
    height: o.floating.height
  } : o.reference, x = await (r.getOffsetParent == null ? void 0 : r.getOffsetParent(l.floating)), $ = await (r.isElement == null ? void 0 : r.isElement(x)) ? await (r.getScale == null ? void 0 : r.getScale(x)) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  }, O = Mt(r.convertOffsetParentRelativeRectToViewportRelativeRect ? await r.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: l,
    rect: E,
    offsetParent: x,
    strategy: a
  }) : E);
  return {
    top: (S.top - O.top + b.top) / $.y,
    bottom: (O.bottom - S.bottom + b.bottom) / $.y,
    left: (S.left - O.left + b.left) / $.x,
    right: (O.right - S.right + b.right) / $.x
  };
}
const Ks = function(i) {
  return i === void 0 && (i = {}), {
    name: "flip",
    options: i,
    async fn(t) {
      var e, s;
      const {
        placement: n,
        middlewareData: r,
        rects: o,
        initialPlacement: l,
        platform: a,
        elements: c
      } = t, {
        mainAxis: u = !0,
        crossAxis: d = !0,
        fallbackPlacements: f,
        fallbackStrategy: p = "bestFit",
        fallbackAxisSideDirection: b = "none",
        flipAlignment: v = !0,
        ...g
      } = ce(i, t);
      if ((e = r.arrow) != null && e.alignmentOffset)
        return {};
      const S = K(n), E = Et(l), x = K(l) === l, $ = await (a.isRTL == null ? void 0 : a.isRTL(c.floating)), O = f || (x || !v ? [Ce(l)] : Qs(l)), _ = b !== "none";
      !f && _ && O.push(...Gs(l, v, b, $));
      const L = [l, ...O], D = await Un(t, g), F = [];
      let A = ((s = r.flip) == null ? void 0 : s.overflows) || [];
      if (u && F.push(D[S]), d) {
        const W = Ws(n, o, $);
        F.push(D[W[0]], D[W[1]]);
      }
      if (A = [...A, {
        placement: n,
        overflows: F
      }], !F.every((W) => W <= 0)) {
        var kt, Qt;
        const W = (((kt = r.flip) == null ? void 0 : kt.index) || 0) + 1, Tt = L[W];
        if (Tt)
          return {
            data: {
              index: W,
              overflows: A
            },
            reset: {
              placement: Tt
            }
          };
        let nt = (Qt = A.filter((st) => st.overflows[0] <= 0).sort((st, Q) => st.overflows[1] - Q.overflows[1])[0]) == null ? void 0 : Qt.placement;
        if (!nt)
          switch (p) {
            case "bestFit": {
              var Pt;
              const st = (Pt = A.filter((Q) => {
                if (_) {
                  const rt = Et(Q.placement);
                  return rt === E || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  rt === "y";
                }
                return !0;
              }).map((Q) => [Q.placement, Q.overflows.filter((rt) => rt > 0).reduce((rt, Ds) => rt + Ds, 0)]).sort((Q, rt) => Q[1] - rt[1])[0]) == null ? void 0 : Pt[0];
              st && (nt = st);
              break;
            }
            case "initialPlacement":
              nt = l;
              break;
          }
        if (n !== nt)
          return {
            reset: {
              placement: nt
            }
          };
      }
      return {};
    }
  };
};
function qn(i) {
  const t = Rt(...i.map((r) => r.left)), e = Rt(...i.map((r) => r.top)), s = J(...i.map((r) => r.right)), n = J(...i.map((r) => r.bottom));
  return {
    x: t,
    y: e,
    width: s - t,
    height: n - e
  };
}
function Zs(i) {
  const t = i.slice().sort((n, r) => n.y - r.y), e = [];
  let s = null;
  for (let n = 0; n < t.length; n++) {
    const r = t[n];
    !s || r.y - s.y > s.height / 2 ? e.push([r]) : e[e.length - 1].push(r), s = r;
  }
  return e.map((n) => Mt(qn(n)));
}
const tr = function(i) {
  return i === void 0 && (i = {}), {
    name: "inline",
    options: i,
    async fn(t) {
      const {
        placement: e,
        elements: s,
        rects: n,
        platform: r,
        strategy: o
      } = t, {
        padding: l = 2,
        x: a,
        y: c
      } = ce(i, t), u = Array.from(await (r.getClientRects == null ? void 0 : r.getClientRects(s.reference)) || []), d = Zs(u), f = Mt(qn(u)), p = Vn(l);
      function b() {
        if (d.length === 2 && d[0].left > d[1].right && a != null && c != null)
          return d.find((g) => a > g.left - p.left && a < g.right + p.right && c > g.top - p.top && c < g.bottom + p.bottom) || f;
        if (d.length >= 2) {
          if (Et(e) === "y") {
            const A = d[0], kt = d[d.length - 1], Qt = K(e) === "top", Pt = A.top, W = kt.bottom, Tt = Qt ? A.left : kt.left, nt = Qt ? A.right : kt.right, st = nt - Tt, Q = W - Pt;
            return {
              top: Pt,
              bottom: W,
              left: Tt,
              right: nt,
              width: st,
              height: Q,
              x: Tt,
              y: Pt
            };
          }
          const g = K(e) === "left", S = J(...d.map((A) => A.right)), E = Rt(...d.map((A) => A.left)), x = d.filter((A) => g ? A.left === E : A.right === S), $ = x[0].top, O = x[x.length - 1].bottom, _ = E, L = S, D = L - _, F = O - $;
          return {
            top: $,
            bottom: O,
            left: _,
            right: L,
            width: D,
            height: F,
            x: _,
            y: $
          };
        }
        return f;
      }
      const v = await r.getElementRects({
        reference: {
          getBoundingClientRect: b
        },
        floating: s.floating,
        strategy: o
      });
      return n.reference.x !== v.reference.x || n.reference.y !== v.reference.y || n.reference.width !== v.reference.width || n.reference.height !== v.reference.height ? {
        reset: {
          rects: v
        }
      } : {};
    }
  };
};
async function er(i, t) {
  const {
    placement: e,
    platform: s,
    elements: n
  } = i, r = await (s.isRTL == null ? void 0 : s.isRTL(n.floating)), o = K(e), l = Ne(e), a = Et(e) === "y", c = ["left", "top"].includes(o) ? -1 : 1, u = r && a ? -1 : 1, d = ce(t, i);
  let {
    mainAxis: f,
    crossAxis: p,
    alignmentAxis: b
  } = typeof d == "number" ? {
    mainAxis: d,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: d.mainAxis || 0,
    crossAxis: d.crossAxis || 0,
    alignmentAxis: d.alignmentAxis
  };
  return l && typeof b == "number" && (p = l === "end" ? b * -1 : b), a ? {
    x: p * u,
    y: f * c
  } : {
    x: f * c,
    y: p * u
  };
}
const Wn = function(i) {
  return {
    name: "offset",
    options: i,
    async fn(t) {
      var e, s;
      const {
        x: n,
        y: r,
        placement: o,
        middlewareData: l
      } = t, a = await er(t, i);
      return o === ((e = l.offset) == null ? void 0 : e.placement) && (s = l.arrow) != null && s.alignmentOffset ? {} : {
        x: n + a.x,
        y: r + a.y,
        data: {
          ...a,
          placement: o
        }
      };
    }
  };
}, ir = function(i) {
  return i === void 0 && (i = {}), {
    name: "shift",
    options: i,
    async fn(t) {
      const {
        x: e,
        y: s,
        placement: n
      } = t, {
        mainAxis: r = !0,
        crossAxis: o = !1,
        limiter: l = {
          fn: (g) => {
            let {
              x: S,
              y: E
            } = g;
            return {
              x: S,
              y: E
            };
          }
        },
        ...a
      } = ce(i, t), c = {
        x: e,
        y: s
      }, u = await Un(t, a), d = Et(K(n)), f = Hn(d);
      let p = c[f], b = c[d];
      if (r) {
        const g = f === "y" ? "top" : "left", S = f === "y" ? "bottom" : "right", E = p + u[g], x = p - u[S];
        p = nn(E, p, x);
      }
      if (o) {
        const g = d === "y" ? "top" : "left", S = d === "y" ? "bottom" : "right", E = b + u[g], x = b - u[S];
        b = nn(E, b, x);
      }
      const v = l.fn({
        ...t,
        [f]: p,
        [d]: b
      });
      return {
        ...v,
        data: {
          x: v.x - e,
          y: v.y - s,
          enabled: {
            [f]: r,
            [d]: o
          }
        }
      };
    }
  };
};
function He() {
  return typeof window < "u";
}
function ut(i) {
  return Qn(i) ? (i.nodeName || "").toLowerCase() : "#document";
}
function z(i) {
  var t;
  return (i == null || (t = i.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function gt(i) {
  var t;
  return (t = (Qn(i) ? i.ownerDocument : i.document) || window.document) == null ? void 0 : t.documentElement;
}
function Qn(i) {
  return He() ? i instanceof Node || i instanceof z(i).Node : !1;
}
function Y(i) {
  return He() ? i instanceof Element || i instanceof z(i).Element : !1;
}
function G(i) {
  return He() ? i instanceof HTMLElement || i instanceof z(i).HTMLElement : !1;
}
function rn(i) {
  return !He() || typeof ShadowRoot > "u" ? !1 : i instanceof ShadowRoot || i instanceof z(i).ShadowRoot;
}
function ue(i) {
  const {
    overflow: t,
    overflowX: e,
    overflowY: s,
    display: n
  } = j(i);
  return /auto|scroll|overlay|hidden|clip/.test(t + s + e) && !["inline", "contents"].includes(n);
}
function nr(i) {
  return ["table", "td", "th"].includes(ut(i));
}
function sr(i) {
  return [":popover-open", ":modal"].some((t) => {
    try {
      return i.matches(t);
    } catch {
      return !1;
    }
  });
}
function yi(i) {
  const t = _i(), e = Y(i) ? j(i) : i;
  return e.transform !== "none" || e.perspective !== "none" || (e.containerType ? e.containerType !== "normal" : !1) || !t && (e.backdropFilter ? e.backdropFilter !== "none" : !1) || !t && (e.filter ? e.filter !== "none" : !1) || ["transform", "perspective", "filter"].some((s) => (e.willChange || "").includes(s)) || ["paint", "layout", "strict", "content"].some((s) => (e.contain || "").includes(s));
}
function rr(i) {
  let t = zt(i);
  for (; G(t) && !De(t); ) {
    if (yi(t))
      return t;
    if (sr(t))
      return null;
    t = zt(t);
  }
  return null;
}
function _i() {
  return typeof CSS > "u" || !CSS.supports ? !1 : CSS.supports("-webkit-backdrop-filter", "none");
}
function De(i) {
  return ["html", "body", "#document"].includes(ut(i));
}
function j(i) {
  return z(i).getComputedStyle(i);
}
function Fe(i) {
  return Y(i) ? {
    scrollLeft: i.scrollLeft,
    scrollTop: i.scrollTop
  } : {
    scrollLeft: i.scrollX,
    scrollTop: i.scrollY
  };
}
function zt(i) {
  if (ut(i) === "html")
    return i;
  const t = (
    // Step into the shadow DOM of the parent of a slotted node.
    i.assignedSlot || // DOM Element detected.
    i.parentNode || // ShadowRoot detected.
    rn(i) && i.host || // Fallback.
    gt(i)
  );
  return rn(t) ? t.host : t;
}
function Yn(i) {
  const t = zt(i);
  return De(t) ? i.ownerDocument ? i.ownerDocument.body : i.body : G(t) && ue(t) ? t : Yn(t);
}
function oi(i, t, e) {
  var s;
  t === void 0 && (t = []), e === void 0 && (e = !0);
  const n = Yn(i), r = n === ((s = i.ownerDocument) == null ? void 0 : s.body), o = z(n);
  if (r) {
    const l = or(o);
    return t.concat(o, o.visualViewport || [], ue(n) ? n : [], l && e ? oi(l) : []);
  }
  return t.concat(n, oi(n, [], e));
}
function or(i) {
  return i.parent && Object.getPrototypeOf(i.parent) ? i.frameElement : null;
}
function Gn(i) {
  const t = j(i);
  let e = parseFloat(t.width) || 0, s = parseFloat(t.height) || 0;
  const n = G(i), r = n ? i.offsetWidth : e, o = n ? i.offsetHeight : s, l = $e(e) !== r || $e(s) !== o;
  return l && (e = r, s = o), {
    width: e,
    height: s,
    $: l
  };
}
function Xn(i) {
  return Y(i) ? i : i.contextElement;
}
function It(i) {
  const t = Xn(i);
  if (!G(t))
    return ct(1);
  const e = t.getBoundingClientRect(), {
    width: s,
    height: n,
    $: r
  } = Gn(t);
  let o = (r ? $e(e.width) : e.width) / s, l = (r ? $e(e.height) : e.height) / n;
  return (!o || !Number.isFinite(o)) && (o = 1), (!l || !Number.isFinite(l)) && (l = 1), {
    x: o,
    y: l
  };
}
const lr = /* @__PURE__ */ ct(0);
function Jn(i) {
  const t = z(i);
  return !_i() || !t.visualViewport ? lr : {
    x: t.visualViewport.offsetLeft,
    y: t.visualViewport.offsetTop
  };
}
function ar(i, t, e) {
  return t === void 0 && (t = !1), !e || t && e !== z(i) ? !1 : t;
}
function ee(i, t, e, s) {
  t === void 0 && (t = !1), e === void 0 && (e = !1);
  const n = i.getBoundingClientRect(), r = Xn(i);
  let o = ct(1);
  t && (s ? Y(s) && (o = It(s)) : o = It(i));
  const l = ar(r, e, s) ? Jn(r) : ct(0);
  let a = (n.left + l.x) / o.x, c = (n.top + l.y) / o.y, u = n.width / o.x, d = n.height / o.y;
  if (r) {
    const f = z(r), p = s && Y(s) ? z(s) : s;
    let b = f, v = b.frameElement;
    for (; v && s && p !== b; ) {
      const g = It(v), S = v.getBoundingClientRect(), E = j(v), x = S.left + (v.clientLeft + parseFloat(E.paddingLeft)) * g.x, $ = S.top + (v.clientTop + parseFloat(E.paddingTop)) * g.y;
      a *= g.x, c *= g.y, u *= g.x, d *= g.y, a += x, c += $, b = z(v), v = b.frameElement;
    }
  }
  return Mt({
    width: u,
    height: d,
    x: a,
    y: c
  });
}
const cr = [":popover-open", ":modal"];
function Kn(i) {
  return cr.some((t) => {
    try {
      return i.matches(t);
    } catch {
      return !1;
    }
  });
}
function ur(i) {
  let {
    elements: t,
    rect: e,
    offsetParent: s,
    strategy: n
  } = i;
  const r = n === "fixed", o = gt(s), l = t ? Kn(t.floating) : !1;
  if (s === o || l && r)
    return e;
  let a = {
    scrollLeft: 0,
    scrollTop: 0
  }, c = ct(1);
  const u = ct(0), d = G(s);
  if ((d || !d && !r) && ((ut(s) !== "body" || ue(o)) && (a = Fe(s)), G(s))) {
    const f = ee(s);
    c = It(s), u.x = f.x + s.clientLeft, u.y = f.y + s.clientTop;
  }
  return {
    width: e.width * c.x,
    height: e.height * c.y,
    x: e.x * c.x - a.scrollLeft * c.x + u.x,
    y: e.y * c.y - a.scrollTop * c.y + u.y
  };
}
function hr(i) {
  return Array.from(i.getClientRects());
}
function Zn(i) {
  return ee(gt(i)).left + Fe(i).scrollLeft;
}
function dr(i) {
  const t = gt(i), e = Fe(i), s = i.ownerDocument.body, n = J(t.scrollWidth, t.clientWidth, s.scrollWidth, s.clientWidth), r = J(t.scrollHeight, t.clientHeight, s.scrollHeight, s.clientHeight);
  let o = -e.scrollLeft + Zn(i);
  const l = -e.scrollTop;
  return j(s).direction === "rtl" && (o += J(t.clientWidth, s.clientWidth) - n), {
    width: n,
    height: r,
    x: o,
    y: l
  };
}
function fr(i, t) {
  const e = z(i), s = gt(i), n = e.visualViewport;
  let r = s.clientWidth, o = s.clientHeight, l = 0, a = 0;
  if (n) {
    r = n.width, o = n.height;
    const c = _i();
    (!c || c && t === "fixed") && (l = n.offsetLeft, a = n.offsetTop);
  }
  return {
    width: r,
    height: o,
    x: l,
    y: a
  };
}
function pr(i, t) {
  const e = ee(i, !0, t === "fixed"), s = e.top + i.clientTop, n = e.left + i.clientLeft, r = G(i) ? It(i) : ct(1), o = i.clientWidth * r.x, l = i.clientHeight * r.y, a = n * r.x, c = s * r.y;
  return {
    width: o,
    height: l,
    x: a,
    y: c
  };
}
function on(i, t, e) {
  let s;
  if (t === "viewport")
    s = fr(i, e);
  else if (t === "document")
    s = dr(gt(i));
  else if (Y(t))
    s = pr(t, e);
  else {
    const n = Jn(i);
    s = {
      ...t,
      x: t.x - n.x,
      y: t.y - n.y
    };
  }
  return Mt(s);
}
function ts(i, t) {
  const e = zt(i);
  return e === t || !Y(e) || De(e) ? !1 : j(e).position === "fixed" || ts(e, t);
}
function mr(i, t) {
  const e = t.get(i);
  if (e)
    return e;
  let s = oi(i, [], !1).filter((l) => Y(l) && ut(l) !== "body"), n = null;
  const r = j(i).position === "fixed";
  let o = r ? zt(i) : i;
  for (; Y(o) && !De(o); ) {
    const l = j(o), a = yi(o);
    !a && l.position === "fixed" && (n = null), (r ? !a && !n : !a && l.position === "static" && !!n && ["absolute", "fixed"].includes(n.position) || ue(o) && !a && ts(i, o)) ? s = s.filter((u) => u !== o) : n = l, o = zt(o);
  }
  return t.set(i, s), s;
}
function br(i) {
  let {
    element: t,
    boundary: e,
    rootBoundary: s,
    strategy: n
  } = i;
  const o = [...e === "clippingAncestors" ? mr(t, this._c) : [].concat(e), s], l = o[0], a = o.reduce((c, u) => {
    const d = on(t, u, n);
    return c.top = J(d.top, c.top), c.right = Rt(d.right, c.right), c.bottom = Rt(d.bottom, c.bottom), c.left = J(d.left, c.left), c;
  }, on(t, l, n));
  return {
    width: a.right - a.left,
    height: a.bottom - a.top,
    x: a.left,
    y: a.top
  };
}
function gr(i) {
  const {
    width: t,
    height: e
  } = Gn(i);
  return {
    width: t,
    height: e
  };
}
function vr(i, t, e) {
  const s = G(t), n = gt(t), r = e === "fixed", o = ee(i, !0, r, t);
  let l = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const a = ct(0);
  if (s || !s && !r)
    if ((ut(t) !== "body" || ue(n)) && (l = Fe(t)), s) {
      const d = ee(t, !0, r, t);
      a.x = d.x + t.clientLeft, a.y = d.y + t.clientTop;
    } else
      n && (a.x = Zn(n));
  const c = o.left + l.scrollLeft - a.x, u = o.top + l.scrollTop - a.y;
  return {
    x: c,
    y: u,
    width: o.width,
    height: o.height
  };
}
function ln(i, t) {
  return !G(i) || j(i).position === "fixed" ? null : t ? t(i) : i.offsetParent;
}
function es(i, t) {
  const e = z(i);
  if (!G(i) || Kn(i))
    return e;
  let s = ln(i, t);
  for (; s && nr(s) && j(s).position === "static"; )
    s = ln(s, t);
  return s && (ut(s) === "html" || ut(s) === "body" && j(s).position === "static" && !yi(s)) ? e : s || rr(i) || e;
}
const yr = async function(i) {
  const t = this.getOffsetParent || es, e = this.getDimensions;
  return {
    reference: vr(i.reference, await t(i.floating), i.strategy),
    floating: {
      x: 0,
      y: 0,
      ...await e(i.floating)
    }
  };
};
function _r(i) {
  return j(i).direction === "rtl";
}
const xr = {
  convertOffsetParentRelativeRectToViewportRelativeRect: ur,
  getDocumentElement: gt,
  getClippingRect: br,
  getOffsetParent: es,
  getElementRects: yr,
  getClientRects: hr,
  getDimensions: gr,
  getScale: It,
  isElement: Y,
  isRTL: _r
}, is = ir, ns = Ks, ss = tr, rs = (i, t, e) => {
  const s = /* @__PURE__ */ new Map(), n = {
    platform: xr,
    ...e
  }, r = {
    ...n.platform,
    _c: s
  };
  return Js(i, t, {
    ...n,
    platform: r
  });
};
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const _e = globalThis, xi = _e.ShadowRoot && (_e.ShadyCSS === void 0 || _e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, wi = Symbol(), an = /* @__PURE__ */ new WeakMap();
let os = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== wi)
      throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (xi && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = an.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && an.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const wr = (i) => new os(typeof i == "string" ? i : i + "", void 0, wi), C = (i, ...t) => {
  const e = i.length === 1 ? i[0] : t.reduce((s, n, r) => s + ((o) => {
    if (o._$cssResult$ === !0)
      return o.cssText;
    if (typeof o == "number")
      return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n) + i[r + 1], i[0]);
  return new os(e, i, wi);
}, $r = (i, t) => {
  if (xi)
    i.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else
    for (const e of t) {
      const s = document.createElement("style"), n = _e.litNonce;
      n !== void 0 && s.setAttribute("nonce", n), s.textContent = e.cssText, i.appendChild(s);
    }
}, cn = xi ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules)
    e += s.cssText;
  return wr(e);
})(i) : i;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Cr, defineProperty: Er, getOwnPropertyDescriptor: Sr, getOwnPropertyNames: Ar, getOwnPropertySymbols: Or, getPrototypeOf: kr } = Object, at = globalThis, un = at.trustedTypes, Pr = un ? un.emptyScript : "", Xe = at.reactiveElementPolyfillSupport, Xt = (i, t) => i, Ee = { toAttribute(i, t) {
  switch (t) {
    case Boolean:
      i = i ? Pr : null;
      break;
    case Object:
    case Array:
      i = i == null ? i : JSON.stringify(i);
  }
  return i;
}, fromAttribute(i, t) {
  let e = i;
  switch (t) {
    case Boolean:
      e = i !== null;
      break;
    case Number:
      e = i === null ? null : Number(i);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(i);
      } catch {
        e = null;
      }
  }
  return e;
} }, $i = (i, t) => !Cr(i, t), hn = { attribute: !0, type: String, converter: Ee, reflect: !1, hasChanged: $i };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), at.litPropertyMetadata ?? (at.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
class Lt extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = hn) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = Symbol(), n = this.getPropertyDescriptor(t, s, e);
      n !== void 0 && Er(this.prototype, t, n);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: n, set: r } = Sr(this.prototype, t) ?? { get() {
      return this[e];
    }, set(o) {
      this[e] = o;
    } };
    return { get() {
      return n == null ? void 0 : n.call(this);
    }, set(o) {
      const l = n == null ? void 0 : n.call(this);
      r.call(this, o), this.requestUpdate(t, l, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? hn;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Xt("elementProperties")))
      return;
    const t = kr(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Xt("finalized")))
      return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Xt("properties"))) {
      const e = this.properties, s = [...Ar(e), ...Or(e)];
      for (const n of s)
        this.createProperty(n, e[n]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0)
        for (const [s, n] of e)
          this.elementProperties.set(s, n);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, s] of this.elementProperties) {
      const n = this._$Eu(e, s);
      n !== void 0 && this._$Eh.set(n, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const n of s)
        e.unshift(cn(n));
    } else
      t !== void 0 && e.push(cn(t));
    return e;
  }
  static _$Eu(t, e) {
    const s = e.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var t;
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (t = this.constructor.l) == null || t.forEach((e) => e(this));
  }
  addController(t) {
    var e;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t), this.renderRoot !== void 0 && this.isConnected && ((e = t.hostConnected) == null || e.call(t));
  }
  removeController(t) {
    var e;
    (e = this._$EO) == null || e.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const s of e.keys())
      this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return $r(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    var t;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$EO) == null || t.forEach((e) => {
      var s;
      return (s = e.hostConnected) == null ? void 0 : s.call(e);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$EO) == null || t.forEach((e) => {
      var s;
      return (s = e.hostDisconnected) == null ? void 0 : s.call(e);
    });
  }
  attributeChangedCallback(t, e, s) {
    this._$AK(t, s);
  }
  _$EC(t, e) {
    var r;
    const s = this.constructor.elementProperties.get(t), n = this.constructor._$Eu(t, s);
    if (n !== void 0 && s.reflect === !0) {
      const o = (((r = s.converter) == null ? void 0 : r.toAttribute) !== void 0 ? s.converter : Ee).toAttribute(e, s.type);
      this._$Em = t, o == null ? this.removeAttribute(n) : this.setAttribute(n, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    var r;
    const s = this.constructor, n = s._$Eh.get(t);
    if (n !== void 0 && this._$Em !== n) {
      const o = s.getPropertyOptions(n), l = typeof o.converter == "function" ? { fromAttribute: o.converter } : ((r = o.converter) == null ? void 0 : r.fromAttribute) !== void 0 ? o.converter : Ee;
      this._$Em = n, this[n] = l.fromAttribute(e, o.type), this._$Em = null;
    }
  }
  requestUpdate(t, e, s) {
    if (t !== void 0) {
      if (s ?? (s = this.constructor.getPropertyOptions(t)), !(s.hasChanged ?? $i)(this[t], e))
        return;
      this.P(t, e, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$ET());
  }
  P(t, e, s) {
    this._$AL.has(t) || this._$AL.set(t, e), s.reflect === !0 && this._$Em !== t && (this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Set())).add(t);
  }
  async _$ET() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var s;
    if (!this.isUpdatePending)
      return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [r, o] of this._$Ep)
          this[r] = o;
        this._$Ep = void 0;
      }
      const n = this.constructor.elementProperties;
      if (n.size > 0)
        for (const [r, o] of n)
          o.wrapped !== !0 || this._$AL.has(r) || this[r] === void 0 || this.P(r, this[r], o);
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), (s = this._$EO) == null || s.forEach((n) => {
        var r;
        return (r = n.hostUpdate) == null ? void 0 : r.call(n);
      }), this.update(e)) : this._$EU();
    } catch (n) {
      throw t = !1, this._$EU(), n;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var e;
    (e = this._$EO) == null || e.forEach((s) => {
      var n;
      return (n = s.hostUpdated) == null ? void 0 : n.call(s);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EU() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Ej && (this._$Ej = this._$Ej.forEach((e) => this._$EC(e, this[e]))), this._$EU();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
}
Lt.elementStyles = [], Lt.shadowRootOptions = { mode: "open" }, Lt[Xt("elementProperties")] = /* @__PURE__ */ new Map(), Lt[Xt("finalized")] = /* @__PURE__ */ new Map(), Xe == null || Xe({ ReactiveElement: Lt }), (at.reactiveElementVersions ?? (at.reactiveElementVersions = [])).push("2.0.4");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Jt = globalThis, Se = Jt.trustedTypes, dn = Se ? Se.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, ls = "$lit$", lt = `lit$${Math.random().toFixed(9).slice(2)}$`, as = "?" + lt, Tr = `<${as}>`, St = document, ie = () => St.createComment(""), ne = (i) => i === null || typeof i != "object" && typeof i != "function", Ci = Array.isArray, Lr = (i) => Ci(i) || typeof (i == null ? void 0 : i[Symbol.iterator]) == "function", Je = `[ 	
\f\r]`, Yt = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, fn = /-->/g, pn = />/g, xt = RegExp(`>|${Je}(?:([^\\s"'>=/]+)(${Je}*=${Je}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), mn = /'/g, bn = /"/g, cs = /^(?:script|style|textarea|title)$/i, Ir = (i) => (t, ...e) => ({ _$litType$: i, strings: t, values: e }), m = Ir(1), At = Symbol.for("lit-noChange"), k = Symbol.for("lit-nothing"), gn = /* @__PURE__ */ new WeakMap(), wt = St.createTreeWalker(St, 129);
function us(i, t) {
  if (!Ci(i) || !i.hasOwnProperty("raw"))
    throw Error("invalid template strings array");
  return dn !== void 0 ? dn.createHTML(t) : t;
}
const Rr = (i, t) => {
  const e = i.length - 1, s = [];
  let n, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = Yt;
  for (let l = 0; l < e; l++) {
    const a = i[l];
    let c, u, d = -1, f = 0;
    for (; f < a.length && (o.lastIndex = f, u = o.exec(a), u !== null); )
      f = o.lastIndex, o === Yt ? u[1] === "!--" ? o = fn : u[1] !== void 0 ? o = pn : u[2] !== void 0 ? (cs.test(u[2]) && (n = RegExp("</" + u[2], "g")), o = xt) : u[3] !== void 0 && (o = xt) : o === xt ? u[0] === ">" ? (o = n ?? Yt, d = -1) : u[1] === void 0 ? d = -2 : (d = o.lastIndex - u[2].length, c = u[1], o = u[3] === void 0 ? xt : u[3] === '"' ? bn : mn) : o === bn || o === mn ? o = xt : o === fn || o === pn ? o = Yt : (o = xt, n = void 0);
    const p = o === xt && i[l + 1].startsWith("/>") ? " " : "";
    r += o === Yt ? a + Tr : d >= 0 ? (s.push(c), a.slice(0, d) + ls + a.slice(d) + lt + p) : a + lt + (d === -2 ? l : p);
  }
  return [us(i, r + (i[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class se {
  constructor({ strings: t, _$litType$: e }, s) {
    let n;
    this.parts = [];
    let r = 0, o = 0;
    const l = t.length - 1, a = this.parts, [c, u] = Rr(t, e);
    if (this.el = se.createElement(c, s), wt.currentNode = this.el.content, e === 2 || e === 3) {
      const d = this.el.content.firstChild;
      d.replaceWith(...d.childNodes);
    }
    for (; (n = wt.nextNode()) !== null && a.length < l; ) {
      if (n.nodeType === 1) {
        if (n.hasAttributes())
          for (const d of n.getAttributeNames())
            if (d.endsWith(ls)) {
              const f = u[o++], p = n.getAttribute(d).split(lt), b = /([.?@])?(.*)/.exec(f);
              a.push({ type: 1, index: r, name: b[2], strings: p, ctor: b[1] === "." ? zr : b[1] === "?" ? jr : b[1] === "@" ? Br : Ve }), n.removeAttribute(d);
            } else
              d.startsWith(lt) && (a.push({ type: 6, index: r }), n.removeAttribute(d));
        if (cs.test(n.tagName)) {
          const d = n.textContent.split(lt), f = d.length - 1;
          if (f > 0) {
            n.textContent = Se ? Se.emptyScript : "";
            for (let p = 0; p < f; p++)
              n.append(d[p], ie()), wt.nextNode(), a.push({ type: 2, index: ++r });
            n.append(d[f], ie());
          }
        }
      } else if (n.nodeType === 8)
        if (n.data === as)
          a.push({ type: 2, index: r });
        else {
          let d = -1;
          for (; (d = n.data.indexOf(lt, d + 1)) !== -1; )
            a.push({ type: 7, index: r }), d += lt.length - 1;
        }
      r++;
    }
  }
  static createElement(t, e) {
    const s = St.createElement("template");
    return s.innerHTML = t, s;
  }
}
function jt(i, t, e = i, s) {
  var o, l;
  if (t === At)
    return t;
  let n = s !== void 0 ? (o = e._$Co) == null ? void 0 : o[s] : e._$Cl;
  const r = ne(t) ? void 0 : t._$litDirective$;
  return (n == null ? void 0 : n.constructor) !== r && ((l = n == null ? void 0 : n._$AO) == null || l.call(n, !1), r === void 0 ? n = void 0 : (n = new r(i), n._$AT(i, e, s)), s !== void 0 ? (e._$Co ?? (e._$Co = []))[s] = n : e._$Cl = n), n !== void 0 && (t = jt(i, n._$AS(i, t.values), n, s)), t;
}
class Mr {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: s } = this._$AD, n = ((t == null ? void 0 : t.creationScope) ?? St).importNode(e, !0);
    wt.currentNode = n;
    let r = wt.nextNode(), o = 0, l = 0, a = s[0];
    for (; a !== void 0; ) {
      if (o === a.index) {
        let c;
        a.type === 2 ? c = new he(r, r.nextSibling, this, t) : a.type === 1 ? c = new a.ctor(r, a.name, a.strings, this, t) : a.type === 6 && (c = new Nr(r, this, t)), this._$AV.push(c), a = s[++l];
      }
      o !== (a == null ? void 0 : a.index) && (r = wt.nextNode(), o++);
    }
    return wt.currentNode = St, n;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV)
      s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class he {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, e, s, n) {
    this.type = 2, this._$AH = k, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = s, this.options = n, this._$Cv = (n == null ? void 0 : n.isConnected) ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && (t == null ? void 0 : t.nodeType) === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = jt(this, t, e), ne(t) ? t === k || t == null || t === "" ? (this._$AH !== k && this._$AR(), this._$AH = k) : t !== this._$AH && t !== At && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Lr(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== k && ne(this._$AH) ? this._$AA.nextSibling.data = t : this.T(St.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var r;
    const { values: e, _$litType$: s } = t, n = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = se.createElement(us(s.h, s.h[0]), this.options)), s);
    if (((r = this._$AH) == null ? void 0 : r._$AD) === n)
      this._$AH.p(e);
    else {
      const o = new Mr(n, this), l = o.u(this.options);
      o.p(e), this.T(l), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = gn.get(t.strings);
    return e === void 0 && gn.set(t.strings, e = new se(t)), e;
  }
  k(t) {
    Ci(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, n = 0;
    for (const r of t)
      n === e.length ? e.push(s = new he(this.O(ie()), this.O(ie()), this, this.options)) : s = e[n], s._$AI(r), n++;
    n < e.length && (this._$AR(s && s._$AB.nextSibling, n), e.length = n);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var s;
    for ((s = this._$AP) == null ? void 0 : s.call(this, !1, !0, e); t && t !== this._$AB; ) {
      const n = t.nextSibling;
      t.remove(), t = n;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cv = t, (e = this._$AP) == null || e.call(this, t));
  }
}
class Ve {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, s, n, r) {
    this.type = 1, this._$AH = k, this._$AN = void 0, this.element = t, this.name = e, this._$AM = n, this.options = r, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = k;
  }
  _$AI(t, e = this, s, n) {
    const r = this.strings;
    let o = !1;
    if (r === void 0)
      t = jt(this, t, e, 0), o = !ne(t) || t !== this._$AH && t !== At, o && (this._$AH = t);
    else {
      const l = t;
      let a, c;
      for (t = r[0], a = 0; a < r.length - 1; a++)
        c = jt(this, l[s + a], e, a), c === At && (c = this._$AH[a]), o || (o = !ne(c) || c !== this._$AH[a]), c === k ? t = k : t !== k && (t += (c ?? "") + r[a + 1]), this._$AH[a] = c;
    }
    o && !n && this.j(t);
  }
  j(t) {
    t === k ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class zr extends Ve {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === k ? void 0 : t;
  }
}
class jr extends Ve {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== k);
  }
}
class Br extends Ve {
  constructor(t, e, s, n, r) {
    super(t, e, s, n, r), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = jt(this, t, e, 0) ?? k) === At)
      return;
    const s = this._$AH, n = t === k && s !== k || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, r = t !== k && (s === k || n);
    n && this.element.removeEventListener(this.name, this, s), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e;
    typeof this._$AH == "function" ? this._$AH.call(((e = this.options) == null ? void 0 : e.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Nr {
  constructor(t, e, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    jt(this, t);
  }
}
const Ke = Jt.litHtmlPolyfillSupport;
Ke == null || Ke(se, he), (Jt.litHtmlVersions ?? (Jt.litHtmlVersions = [])).push("3.2.1");
const Bt = (i, t, e) => {
  const s = (e == null ? void 0 : e.renderBefore) ?? t;
  let n = s._$litPart$;
  if (n === void 0) {
    const r = (e == null ? void 0 : e.renderBefore) ?? null;
    s._$litPart$ = n = new he(t.insertBefore(ie(), r), r, void 0, e ?? {});
  }
  return n._$AI(i), n;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
let w = class extends Lt {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var e;
    const t = super.createRenderRoot();
    return (e = this.renderOptions).renderBefore ?? (e.renderBefore = t.firstChild), t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Bt(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), (t = this._$Do) == null || t.setConnected(!0);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._$Do) == null || t.setConnected(!1);
  }
  render() {
    return At;
  }
};
var Nn;
w._$litElement$ = !0, w.finalized = !0, (Nn = globalThis.litElementHydrateSupport) == null || Nn.call(globalThis, { LitElement: w });
const Ze = globalThis.litElementPolyfillSupport;
Ze == null || Ze({ LitElement: w });
(globalThis.litElementVersions ?? (globalThis.litElementVersions = [])).push("4.1.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Hr = { attribute: !0, type: String, converter: Ee, reflect: !1, hasChanged: $i }, Dr = (i = Hr, t, e) => {
  const { kind: s, metadata: n } = e;
  let r = globalThis.litPropertyMetadata.get(n);
  if (r === void 0 && globalThis.litPropertyMetadata.set(n, r = /* @__PURE__ */ new Map()), r.set(e.name, i), s === "accessor") {
    const { name: o } = e;
    return { set(l) {
      const a = t.get.call(this);
      t.set.call(this, l), this.requestUpdate(o, a, i);
    }, init(l) {
      return l !== void 0 && this.P(o, void 0, i), l;
    } };
  }
  if (s === "setter") {
    const { name: o } = e;
    return function(l) {
      const a = this[o];
      t.call(this, l), this.requestUpdate(o, a, i);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function h(i) {
  return (t, e) => typeof e == "object" ? Dr(i, t, e) : ((s, n, r) => {
    const o = n.hasOwnProperty(r);
    return n.constructor.createProperty(r, o ? { ...s, wrapped: !0 } : s), o ? Object.getOwnPropertyDescriptor(n, r) : void 0;
  })(i, t, e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Vt(i) {
  return h({ ...i, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Fr = (i) => i.strings === void 0;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const hs = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 }, ds = (i) => (...t) => ({ _$litDirective$: i, values: t });
let fs = class {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, e, s) {
    this._$Ct = t, this._$AM = e, this._$Ci = s;
  }
  _$AS(t, e) {
    return this.update(t, e);
  }
  update(t, e) {
    return this.render(...e);
  }
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Kt = (i, t) => {
  var s;
  const e = i._$AN;
  if (e === void 0)
    return !1;
  for (const n of e)
    (s = n._$AO) == null || s.call(n, t, !1), Kt(n, t);
  return !0;
}, Ae = (i) => {
  let t, e;
  do {
    if ((t = i._$AM) === void 0)
      break;
    e = t._$AN, e.delete(i), i = t;
  } while ((e == null ? void 0 : e.size) === 0);
}, ps = (i) => {
  for (let t; t = i._$AM; i = t) {
    let e = t._$AN;
    if (e === void 0)
      t._$AN = e = /* @__PURE__ */ new Set();
    else if (e.has(i))
      break;
    e.add(i), qr(t);
  }
};
function Vr(i) {
  this._$AN !== void 0 ? (Ae(this), this._$AM = i, ps(this)) : this._$AM = i;
}
function Ur(i, t = !1, e = 0) {
  const s = this._$AH, n = this._$AN;
  if (n !== void 0 && n.size !== 0)
    if (t)
      if (Array.isArray(s))
        for (let r = e; r < s.length; r++)
          Kt(s[r], !1), Ae(s[r]);
      else
        s != null && (Kt(s, !1), Ae(s));
    else
      Kt(this, i);
}
const qr = (i) => {
  i.type == hs.CHILD && (i._$AP ?? (i._$AP = Ur), i._$AQ ?? (i._$AQ = Vr));
};
class Wr extends fs {
  constructor() {
    super(...arguments), this._$AN = void 0;
  }
  _$AT(t, e, s) {
    super._$AT(t, e, s), ps(this), this.isConnected = t._$AU;
  }
  _$AO(t, e = !0) {
    var s, n;
    t !== this.isConnected && (this.isConnected = t, t ? (s = this.reconnected) == null || s.call(this) : (n = this.disconnected) == null || n.call(this)), e && (Kt(this, t), Ae(this));
  }
  setValue(t) {
    if (Fr(this._$Ct))
      this._$Ct._$AI(t, this);
    else {
      const e = [...this._$Ct._$AH];
      e[this._$Ci] = t, this._$Ct._$AI(e, this, 0);
    }
  }
  disconnected() {
  }
  reconnected() {
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Nt = () => new Qr();
class Qr {
}
const ti = /* @__PURE__ */ new WeakMap(), Ht = ds(class extends Wr {
  render(i) {
    return k;
  }
  update(i, [t]) {
    var s;
    const e = t !== this.Y;
    return e && this.Y !== void 0 && this.rt(void 0), (e || this.lt !== this.ct) && (this.Y = t, this.ht = (s = i.options) == null ? void 0 : s.host, this.rt(this.ct = i.element)), k;
  }
  rt(i) {
    if (this.isConnected || (i = void 0), typeof this.Y == "function") {
      const t = this.ht ?? globalThis;
      let e = ti.get(t);
      e === void 0 && (e = /* @__PURE__ */ new WeakMap(), ti.set(t, e)), e.get(this.Y) !== void 0 && this.Y.call(this.ht, void 0), e.set(this.Y, i), i !== void 0 && this.Y.call(this.ht, i);
    } else
      this.Y.value = i;
  }
  get lt() {
    var i, t;
    return typeof this.Y == "function" ? (i = ti.get(this.ht ?? globalThis)) == null ? void 0 : i.get(this.Y) : (t = this.Y) == null ? void 0 : t.value;
  }
  disconnected() {
    this.lt === this.ct && this.rt(void 0);
  }
  reconnected() {
    this.rt(this.ct);
  }
});
/**
* (c) Iconify
*
* For the full copyright and license information, please view the license.txt
* files at https://github.com/iconify/iconify
*
* Licensed under MIT.
*
* @license MIT
* @version 2.0.0
*/
const ms = Object.freeze(
  {
    left: 0,
    top: 0,
    width: 16,
    height: 16
  }
), Oe = Object.freeze({
  rotate: 0,
  vFlip: !1,
  hFlip: !1
}), de = Object.freeze({
  ...ms,
  ...Oe
}), li = Object.freeze({
  ...de,
  body: "",
  hidden: !1
}), Yr = Object.freeze({
  width: null,
  height: null
}), bs = Object.freeze({
  // Dimensions
  ...Yr,
  // Transformations
  ...Oe
});
function Gr(i, t = 0) {
  const e = i.replace(/^-?[0-9.]*/, "");
  function s(n) {
    for (; n < 0; )
      n += 4;
    return n % 4;
  }
  if (e === "") {
    const n = parseInt(i);
    return isNaN(n) ? 0 : s(n);
  } else if (e !== i) {
    let n = 0;
    switch (e) {
      case "%":
        n = 25;
        break;
      case "deg":
        n = 90;
    }
    if (n) {
      let r = parseFloat(i.slice(0, i.length - e.length));
      return isNaN(r) ? 0 : (r = r / n, r % 1 === 0 ? s(r) : 0);
    }
  }
  return t;
}
const Xr = /[\s,]+/;
function Jr(i, t) {
  t.split(Xr).forEach((e) => {
    switch (e.trim()) {
      case "horizontal":
        i.hFlip = !0;
        break;
      case "vertical":
        i.vFlip = !0;
        break;
    }
  });
}
const gs = {
  ...bs,
  preserveAspectRatio: ""
};
function vn(i) {
  const t = {
    ...gs
  }, e = (s, n) => i.getAttribute(s) || n;
  return t.width = e("width", null), t.height = e("height", null), t.rotate = Gr(e("rotate", "")), Jr(t, e("flip", "")), t.preserveAspectRatio = e("preserveAspectRatio", e("preserveaspectratio", "")), t;
}
function Kr(i, t) {
  for (const e in gs)
    if (i[e] !== t[e])
      return !0;
  return !1;
}
const Zt = /^[a-z0-9]+(-[a-z0-9]+)*$/, fe = (i, t, e, s = "") => {
  const n = i.split(":");
  if (i.slice(0, 1) === "@") {
    if (n.length < 2 || n.length > 3)
      return null;
    s = n.shift().slice(1);
  }
  if (n.length > 3 || !n.length)
    return null;
  if (n.length > 1) {
    const l = n.pop(), a = n.pop(), c = {
      // Allow provider without '@': "provider:prefix:name"
      provider: n.length > 0 ? n[0] : s,
      prefix: a,
      name: l
    };
    return t && !xe(c) ? null : c;
  }
  const r = n[0], o = r.split("-");
  if (o.length > 1) {
    const l = {
      provider: s,
      prefix: o.shift(),
      name: o.join("-")
    };
    return t && !xe(l) ? null : l;
  }
  if (e && s === "") {
    const l = {
      provider: s,
      prefix: "",
      name: r
    };
    return t && !xe(l, e) ? null : l;
  }
  return null;
}, xe = (i, t) => i ? !!((i.provider === "" || i.provider.match(Zt)) && (t && i.prefix === "" || i.prefix.match(Zt)) && i.name.match(Zt)) : !1;
function Zr(i, t) {
  const e = {};
  !i.hFlip != !t.hFlip && (e.hFlip = !0), !i.vFlip != !t.vFlip && (e.vFlip = !0);
  const s = ((i.rotate || 0) + (t.rotate || 0)) % 4;
  return s && (e.rotate = s), e;
}
function yn(i, t) {
  const e = Zr(i, t);
  for (const s in li)
    s in Oe ? s in i && !(s in e) && (e[s] = Oe[s]) : s in t ? e[s] = t[s] : s in i && (e[s] = i[s]);
  return e;
}
function to(i, t) {
  const e = i.icons, s = i.aliases || /* @__PURE__ */ Object.create(null), n = /* @__PURE__ */ Object.create(null);
  function r(o) {
    if (e[o])
      return n[o] = [];
    if (!(o in n)) {
      n[o] = null;
      const l = s[o] && s[o].parent, a = l && r(l);
      a && (n[o] = [l].concat(a));
    }
    return n[o];
  }
  return Object.keys(e).concat(Object.keys(s)).forEach(r), n;
}
function eo(i, t, e) {
  const s = i.icons, n = i.aliases || /* @__PURE__ */ Object.create(null);
  let r = {};
  function o(l) {
    r = yn(
      s[l] || n[l],
      r
    );
  }
  return o(t), e.forEach(o), yn(i, r);
}
function vs(i, t) {
  const e = [];
  if (typeof i != "object" || typeof i.icons != "object")
    return e;
  i.not_found instanceof Array && i.not_found.forEach((n) => {
    t(n, null), e.push(n);
  });
  const s = to(i);
  for (const n in s) {
    const r = s[n];
    r && (t(n, eo(i, n, r)), e.push(n));
  }
  return e;
}
const io = {
  provider: "",
  aliases: {},
  not_found: {},
  ...ms
};
function ei(i, t) {
  for (const e in t)
    if (e in i && typeof i[e] != typeof t[e])
      return !1;
  return !0;
}
function ys(i) {
  if (typeof i != "object" || i === null)
    return null;
  const t = i;
  if (typeof t.prefix != "string" || !i.icons || typeof i.icons != "object" || !ei(i, io))
    return null;
  const e = t.icons;
  for (const n in e) {
    const r = e[n];
    if (!n.match(Zt) || typeof r.body != "string" || !ei(
      r,
      li
    ))
      return null;
  }
  const s = t.aliases || /* @__PURE__ */ Object.create(null);
  for (const n in s) {
    const r = s[n], o = r.parent;
    if (!n.match(Zt) || typeof o != "string" || !e[o] && !s[o] || !ei(
      r,
      li
    ))
      return null;
  }
  return t;
}
const ke = /* @__PURE__ */ Object.create(null);
function no(i, t) {
  return {
    provider: i,
    prefix: t,
    icons: /* @__PURE__ */ Object.create(null),
    missing: /* @__PURE__ */ new Set()
  };
}
function ht(i, t) {
  const e = ke[i] || (ke[i] = /* @__PURE__ */ Object.create(null));
  return e[t] || (e[t] = no(i, t));
}
function Ei(i, t) {
  return ys(t) ? vs(t, (e, s) => {
    s ? i.icons[e] = s : i.missing.add(e);
  }) : [];
}
function so(i, t, e) {
  try {
    if (typeof e.body == "string")
      return i.icons[t] = { ...e }, !0;
  } catch {
  }
  return !1;
}
function ro(i, t) {
  let e = [];
  return (typeof i == "string" ? [i] : Object.keys(ke)).forEach((n) => {
    (typeof n == "string" && typeof t == "string" ? [t] : Object.keys(ke[n] || {})).forEach((o) => {
      const l = ht(n, o);
      e = e.concat(
        Object.keys(l.icons).map(
          (a) => (n !== "" ? "@" + n + ":" : "") + o + ":" + a
        )
      );
    });
  }), e;
}
let re = !1;
function _s(i) {
  return typeof i == "boolean" && (re = i), re;
}
function oe(i) {
  const t = typeof i == "string" ? fe(i, !0, re) : i;
  if (t) {
    const e = ht(t.provider, t.prefix), s = t.name;
    return e.icons[s] || (e.missing.has(s) ? null : void 0);
  }
}
function xs(i, t) {
  const e = fe(i, !0, re);
  if (!e)
    return !1;
  const s = ht(e.provider, e.prefix);
  return so(s, e.name, t);
}
function _n(i, t) {
  if (typeof i != "object")
    return !1;
  if (typeof t != "string" && (t = i.provider || ""), re && !t && !i.prefix) {
    let n = !1;
    return ys(i) && (i.prefix = "", vs(i, (r, o) => {
      o && xs(r, o) && (n = !0);
    })), n;
  }
  const e = i.prefix;
  if (!xe({
    provider: t,
    prefix: e,
    name: "a"
  }))
    return !1;
  const s = ht(t, e);
  return !!Ei(s, i);
}
function xn(i) {
  return !!oe(i);
}
function oo(i) {
  const t = oe(i);
  return t ? {
    ...de,
    ...t
  } : null;
}
function lo(i) {
  const t = {
    loaded: [],
    missing: [],
    pending: []
  }, e = /* @__PURE__ */ Object.create(null);
  i.sort((n, r) => n.provider !== r.provider ? n.provider.localeCompare(r.provider) : n.prefix !== r.prefix ? n.prefix.localeCompare(r.prefix) : n.name.localeCompare(r.name));
  let s = {
    provider: "",
    prefix: "",
    name: ""
  };
  return i.forEach((n) => {
    if (s.name === n.name && s.prefix === n.prefix && s.provider === n.provider)
      return;
    s = n;
    const r = n.provider, o = n.prefix, l = n.name, a = e[r] || (e[r] = /* @__PURE__ */ Object.create(null)), c = a[o] || (a[o] = ht(r, o));
    let u;
    l in c.icons ? u = t.loaded : o === "" || c.missing.has(l) ? u = t.missing : u = t.pending;
    const d = {
      provider: r,
      prefix: o,
      name: l
    };
    u.push(d);
  }), t;
}
function ws(i, t) {
  i.forEach((e) => {
    const s = e.loaderCallbacks;
    s && (e.loaderCallbacks = s.filter((n) => n.id !== t));
  });
}
function ao(i) {
  i.pendingCallbacksFlag || (i.pendingCallbacksFlag = !0, setTimeout(() => {
    i.pendingCallbacksFlag = !1;
    const t = i.loaderCallbacks ? i.loaderCallbacks.slice(0) : [];
    if (!t.length)
      return;
    let e = !1;
    const s = i.provider, n = i.prefix;
    t.forEach((r) => {
      const o = r.icons, l = o.pending.length;
      o.pending = o.pending.filter((a) => {
        if (a.prefix !== n)
          return !0;
        const c = a.name;
        if (i.icons[c])
          o.loaded.push({
            provider: s,
            prefix: n,
            name: c
          });
        else if (i.missing.has(c))
          o.missing.push({
            provider: s,
            prefix: n,
            name: c
          });
        else
          return e = !0, !0;
        return !1;
      }), o.pending.length !== l && (e || ws([i], r.id), r.callback(
        o.loaded.slice(0),
        o.missing.slice(0),
        o.pending.slice(0),
        r.abort
      ));
    });
  }));
}
let co = 0;
function uo(i, t, e) {
  const s = co++, n = ws.bind(null, e, s);
  if (!t.pending.length)
    return n;
  const r = {
    id: s,
    icons: t,
    callback: i,
    abort: n
  };
  return e.forEach((o) => {
    (o.loaderCallbacks || (o.loaderCallbacks = [])).push(r);
  }), n;
}
const ai = /* @__PURE__ */ Object.create(null);
function wn(i, t) {
  ai[i] = t;
}
function ci(i) {
  return ai[i] || ai[""];
}
function ho(i, t = !0, e = !1) {
  const s = [];
  return i.forEach((n) => {
    const r = typeof n == "string" ? fe(n, t, e) : n;
    r && s.push(r);
  }), s;
}
var fo = {
  resources: [],
  index: 0,
  timeout: 2e3,
  rotate: 750,
  random: !1,
  dataAfterTimeout: !1
};
function po(i, t, e, s) {
  const n = i.resources.length, r = i.random ? Math.floor(Math.random() * n) : i.index;
  let o;
  if (i.random) {
    let _ = i.resources.slice(0);
    for (o = []; _.length > 1; ) {
      const L = Math.floor(Math.random() * _.length);
      o.push(_[L]), _ = _.slice(0, L).concat(_.slice(L + 1));
    }
    o = o.concat(_);
  } else
    o = i.resources.slice(r).concat(i.resources.slice(0, r));
  const l = Date.now();
  let a = "pending", c = 0, u, d = null, f = [], p = [];
  typeof s == "function" && p.push(s);
  function b() {
    d && (clearTimeout(d), d = null);
  }
  function v() {
    a === "pending" && (a = "aborted"), b(), f.forEach((_) => {
      _.status === "pending" && (_.status = "aborted");
    }), f = [];
  }
  function g(_, L) {
    L && (p = []), typeof _ == "function" && p.push(_);
  }
  function S() {
    return {
      startTime: l,
      payload: t,
      status: a,
      queriesSent: c,
      queriesPending: f.length,
      subscribe: g,
      abort: v
    };
  }
  function E() {
    a = "failed", p.forEach((_) => {
      _(void 0, u);
    });
  }
  function x() {
    f.forEach((_) => {
      _.status === "pending" && (_.status = "aborted");
    }), f = [];
  }
  function $(_, L, D) {
    const F = L !== "success";
    switch (f = f.filter((A) => A !== _), a) {
      case "pending":
        break;
      case "failed":
        if (F || !i.dataAfterTimeout)
          return;
        break;
      default:
        return;
    }
    if (L === "abort") {
      u = D, E();
      return;
    }
    if (F) {
      u = D, f.length || (o.length ? O() : E());
      return;
    }
    if (b(), x(), !i.random) {
      const A = i.resources.indexOf(_.resource);
      A !== -1 && A !== i.index && (i.index = A);
    }
    a = "completed", p.forEach((A) => {
      A(D);
    });
  }
  function O() {
    if (a !== "pending")
      return;
    b();
    const _ = o.shift();
    if (_ === void 0) {
      if (f.length) {
        d = setTimeout(() => {
          b(), a === "pending" && (x(), E());
        }, i.timeout);
        return;
      }
      E();
      return;
    }
    const L = {
      status: "pending",
      resource: _,
      callback: (D, F) => {
        $(L, D, F);
      }
    };
    f.push(L), c++, d = setTimeout(O, i.rotate), e(_, t, L.callback);
  }
  return setTimeout(O), S;
}
function $s(i) {
  const t = {
    ...fo,
    ...i
  };
  let e = [];
  function s() {
    e = e.filter((l) => l().status === "pending");
  }
  function n(l, a, c) {
    const u = po(
      t,
      l,
      a,
      (d, f) => {
        s(), c && c(d, f);
      }
    );
    return e.push(u), u;
  }
  function r(l) {
    return e.find((a) => l(a)) || null;
  }
  return {
    query: n,
    find: r,
    setIndex: (l) => {
      t.index = l;
    },
    getIndex: () => t.index,
    cleanup: s
  };
}
function Si(i) {
  let t;
  if (typeof i.resources == "string")
    t = [i.resources];
  else if (t = i.resources, !(t instanceof Array) || !t.length)
    return null;
  return {
    // API hosts
    resources: t,
    // Root path
    path: i.path || "/",
    // URL length limit
    maxURL: i.maxURL || 500,
    // Timeout before next host is used.
    rotate: i.rotate || 750,
    // Timeout before failing query.
    timeout: i.timeout || 5e3,
    // Randomise default API end point.
    random: i.random === !0,
    // Start index
    index: i.index || 0,
    // Receive data after time out (used if time out kicks in first, then API module sends data anyway).
    dataAfterTimeout: i.dataAfterTimeout !== !1
  };
}
const Ue = /* @__PURE__ */ Object.create(null), Gt = [
  "https://api.simplesvg.com",
  "https://api.unisvg.com"
], we = [];
for (; Gt.length > 0; )
  Gt.length === 1 || Math.random() > 0.5 ? we.push(Gt.shift()) : we.push(Gt.pop());
Ue[""] = Si({
  resources: ["https://api.iconify.design"].concat(we)
});
function $n(i, t) {
  const e = Si(t);
  return e === null ? !1 : (Ue[i] = e, !0);
}
function qe(i) {
  return Ue[i];
}
function mo() {
  return Object.keys(Ue);
}
function Cn() {
}
const ii = /* @__PURE__ */ Object.create(null);
function bo(i) {
  if (!ii[i]) {
    const t = qe(i);
    if (!t)
      return;
    const e = $s(t), s = {
      config: t,
      redundancy: e
    };
    ii[i] = s;
  }
  return ii[i];
}
function Cs(i, t, e) {
  let s, n;
  if (typeof i == "string") {
    const r = ci(i);
    if (!r)
      return e(void 0, 424), Cn;
    n = r.send;
    const o = bo(i);
    o && (s = o.redundancy);
  } else {
    const r = Si(i);
    if (r) {
      s = $s(r);
      const o = i.resources ? i.resources[0] : "", l = ci(o);
      l && (n = l.send);
    }
  }
  return !s || !n ? (e(void 0, 424), Cn) : s.query(t, n, e)().abort;
}
const En = "iconify2", le = "iconify", Es = le + "-count", Sn = le + "-version", Ss = 36e5, go = 168, vo = 50;
function ui(i, t) {
  try {
    return i.getItem(t);
  } catch {
  }
}
function Ai(i, t, e) {
  try {
    return i.setItem(t, e), !0;
  } catch {
  }
}
function An(i, t) {
  try {
    i.removeItem(t);
  } catch {
  }
}
function hi(i, t) {
  return Ai(i, Es, t.toString());
}
function di(i) {
  return parseInt(ui(i, Es)) || 0;
}
const $t = {
  local: !0,
  session: !0
}, As = {
  local: /* @__PURE__ */ new Set(),
  session: /* @__PURE__ */ new Set()
};
let Oi = !1;
function yo(i) {
  Oi = i;
}
let ye = typeof window > "u" ? {} : window;
function Os(i) {
  const t = i + "Storage";
  try {
    if (ye && ye[t] && typeof ye[t].length == "number")
      return ye[t];
  } catch {
  }
  $t[i] = !1;
}
function ks(i, t) {
  const e = Os(i);
  if (!e)
    return;
  const s = ui(e, Sn);
  if (s !== En) {
    if (s) {
      const l = di(e);
      for (let a = 0; a < l; a++)
        An(e, le + a.toString());
    }
    Ai(e, Sn, En), hi(e, 0);
    return;
  }
  const n = Math.floor(Date.now() / Ss) - go, r = (l) => {
    const a = le + l.toString(), c = ui(e, a);
    if (typeof c == "string") {
      try {
        const u = JSON.parse(c);
        if (typeof u == "object" && typeof u.cached == "number" && u.cached > n && typeof u.provider == "string" && typeof u.data == "object" && typeof u.data.prefix == "string" && // Valid item: run callback
        t(u, l))
          return !0;
      } catch {
      }
      An(e, a);
    }
  };
  let o = di(e);
  for (let l = o - 1; l >= 0; l--)
    r(l) || (l === o - 1 ? (o--, hi(e, o)) : As[i].add(l));
}
function Ps() {
  if (!Oi) {
    yo(!0);
    for (const i in $t)
      ks(i, (t) => {
        const e = t.data, s = t.provider, n = e.prefix, r = ht(
          s,
          n
        );
        if (!Ei(r, e).length)
          return !1;
        const o = e.lastModified || -1;
        return r.lastModifiedCached = r.lastModifiedCached ? Math.min(r.lastModifiedCached, o) : o, !0;
      });
  }
}
function _o(i, t) {
  const e = i.lastModifiedCached;
  if (
    // Matches or newer
    e && e >= t
  )
    return e === t;
  if (i.lastModifiedCached = t, e)
    for (const s in $t)
      ks(s, (n) => {
        const r = n.data;
        return n.provider !== i.provider || r.prefix !== i.prefix || r.lastModified === t;
      });
  return !0;
}
function xo(i, t) {
  Oi || Ps();
  function e(s) {
    let n;
    if (!$t[s] || !(n = Os(s)))
      return;
    const r = As[s];
    let o;
    if (r.size)
      r.delete(o = Array.from(r).shift());
    else if (o = di(n), o >= vo || !hi(n, o + 1))
      return;
    const l = {
      cached: Math.floor(Date.now() / Ss),
      provider: i.provider,
      data: t
    };
    return Ai(
      n,
      le + o.toString(),
      JSON.stringify(l)
    );
  }
  t.lastModified && !_o(i, t.lastModified) || Object.keys(t.icons).length && (t.not_found && (t = Object.assign({}, t), delete t.not_found), e("local") || e("session"));
}
function On() {
}
function wo(i) {
  i.iconsLoaderFlag || (i.iconsLoaderFlag = !0, setTimeout(() => {
    i.iconsLoaderFlag = !1, ao(i);
  }));
}
function $o(i, t) {
  i.iconsToLoad ? i.iconsToLoad = i.iconsToLoad.concat(t).sort() : i.iconsToLoad = t, i.iconsQueueFlag || (i.iconsQueueFlag = !0, setTimeout(() => {
    i.iconsQueueFlag = !1;
    const { provider: e, prefix: s } = i, n = i.iconsToLoad;
    delete i.iconsToLoad;
    let r;
    if (!n || !(r = ci(e)))
      return;
    r.prepare(e, s, n).forEach((l) => {
      Cs(e, l, (a) => {
        if (typeof a != "object")
          l.icons.forEach((c) => {
            i.missing.add(c);
          });
        else
          try {
            const c = Ei(
              i,
              a
            );
            if (!c.length)
              return;
            const u = i.pendingIcons;
            u && c.forEach((d) => {
              u.delete(d);
            }), xo(i, a);
          } catch (c) {
            console.error(c);
          }
        wo(i);
      });
    });
  }));
}
const ki = (i, t) => {
  const e = ho(i, !0, _s()), s = lo(e);
  if (!s.pending.length) {
    let a = !0;
    return t && setTimeout(() => {
      a && t(
        s.loaded,
        s.missing,
        s.pending,
        On
      );
    }), () => {
      a = !1;
    };
  }
  const n = /* @__PURE__ */ Object.create(null), r = [];
  let o, l;
  return s.pending.forEach((a) => {
    const { provider: c, prefix: u } = a;
    if (u === l && c === o)
      return;
    o = c, l = u, r.push(ht(c, u));
    const d = n[c] || (n[c] = /* @__PURE__ */ Object.create(null));
    d[u] || (d[u] = []);
  }), s.pending.forEach((a) => {
    const { provider: c, prefix: u, name: d } = a, f = ht(c, u), p = f.pendingIcons || (f.pendingIcons = /* @__PURE__ */ new Set());
    p.has(d) || (p.add(d), n[c][u].push(d));
  }), r.forEach((a) => {
    const { provider: c, prefix: u } = a;
    n[c][u].length && $o(a, n[c][u]);
  }), t ? uo(t, s, r) : On;
}, Co = (i) => new Promise((t, e) => {
  const s = typeof i == "string" ? fe(i, !0) : i;
  if (!s) {
    e(i);
    return;
  }
  ki([s || i], (n) => {
    if (n.length && s) {
      const r = oe(s);
      if (r) {
        t({
          ...de,
          ...r
        });
        return;
      }
    }
    e(i);
  });
});
function Eo(i) {
  try {
    const t = typeof i == "string" ? JSON.parse(i) : i;
    if (typeof t.body == "string")
      return {
        ...t
      };
  } catch {
  }
}
function So(i, t) {
  const e = typeof i == "string" ? fe(i, !0, !0) : null;
  if (!e) {
    const r = Eo(i);
    return {
      value: i,
      data: r
    };
  }
  const s = oe(e);
  if (s !== void 0 || !e.prefix)
    return {
      value: i,
      name: e,
      data: s
      // could be 'null' -> icon is missing
    };
  const n = ki([e], () => t(i, e, oe(e)));
  return {
    value: i,
    name: e,
    loading: n
  };
}
function ni(i) {
  return i.hasAttribute("inline");
}
let Ts = !1;
try {
  Ts = navigator.vendor.indexOf("Apple") === 0;
} catch {
}
function Ao(i, t) {
  switch (t) {
    case "svg":
    case "bg":
    case "mask":
      return t;
  }
  return t !== "style" && (Ts || i.indexOf("<a") === -1) ? "svg" : i.indexOf("currentColor") === -1 ? "bg" : "mask";
}
const Oo = /(-?[0-9.]*[0-9]+[0-9.]*)/g, ko = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
function fi(i, t, e) {
  if (t === 1)
    return i;
  if (e = e || 100, typeof i == "number")
    return Math.ceil(i * t * e) / e;
  if (typeof i != "string")
    return i;
  const s = i.split(Oo);
  if (s === null || !s.length)
    return i;
  const n = [];
  let r = s.shift(), o = ko.test(r);
  for (; ; ) {
    if (o) {
      const l = parseFloat(r);
      isNaN(l) ? n.push(r) : n.push(Math.ceil(l * t * e) / e);
    } else
      n.push(r);
    if (r = s.shift(), r === void 0)
      return n.join("");
    o = !o;
  }
}
function Po(i, t = "defs") {
  let e = "";
  const s = i.indexOf("<" + t);
  for (; s >= 0; ) {
    const n = i.indexOf(">", s), r = i.indexOf("</" + t);
    if (n === -1 || r === -1)
      break;
    const o = i.indexOf(">", r);
    if (o === -1)
      break;
    e += i.slice(n + 1, r).trim(), i = i.slice(0, s).trim() + i.slice(o + 1);
  }
  return {
    defs: e,
    content: i
  };
}
function To(i, t) {
  return i ? "<defs>" + i + "</defs>" + t : t;
}
function Lo(i, t, e) {
  const s = Po(i);
  return To(s.defs, t + s.content + e);
}
const Io = (i) => i === "unset" || i === "undefined" || i === "none";
function Ls(i, t) {
  const e = {
    ...de,
    ...i
  }, s = {
    ...bs,
    ...t
  }, n = {
    left: e.left,
    top: e.top,
    width: e.width,
    height: e.height
  };
  let r = e.body;
  [e, s].forEach((v) => {
    const g = [], S = v.hFlip, E = v.vFlip;
    let x = v.rotate;
    S ? E ? x += 2 : (g.push(
      "translate(" + (n.width + n.left).toString() + " " + (0 - n.top).toString() + ")"
    ), g.push("scale(-1 1)"), n.top = n.left = 0) : E && (g.push(
      "translate(" + (0 - n.left).toString() + " " + (n.height + n.top).toString() + ")"
    ), g.push("scale(1 -1)"), n.top = n.left = 0);
    let $;
    switch (x < 0 && (x -= Math.floor(x / 4) * 4), x = x % 4, x) {
      case 1:
        $ = n.height / 2 + n.top, g.unshift(
          "rotate(90 " + $.toString() + " " + $.toString() + ")"
        );
        break;
      case 2:
        g.unshift(
          "rotate(180 " + (n.width / 2 + n.left).toString() + " " + (n.height / 2 + n.top).toString() + ")"
        );
        break;
      case 3:
        $ = n.width / 2 + n.left, g.unshift(
          "rotate(-90 " + $.toString() + " " + $.toString() + ")"
        );
        break;
    }
    x % 2 === 1 && (n.left !== n.top && ($ = n.left, n.left = n.top, n.top = $), n.width !== n.height && ($ = n.width, n.width = n.height, n.height = $)), g.length && (r = Lo(
      r,
      '<g transform="' + g.join(" ") + '">',
      "</g>"
    ));
  });
  const o = s.width, l = s.height, a = n.width, c = n.height;
  let u, d;
  o === null ? (d = l === null ? "1em" : l === "auto" ? c : l, u = fi(d, a / c)) : (u = o === "auto" ? a : o, d = l === null ? fi(u, c / a) : l === "auto" ? c : l);
  const f = {}, p = (v, g) => {
    Io(g) || (f[v] = g.toString());
  };
  p("width", u), p("height", d);
  const b = [n.left, n.top, a, c];
  return f.viewBox = b.join(" "), {
    attributes: f,
    viewBox: b,
    body: r
  };
}
function Pi(i, t) {
  let e = i.indexOf("xlink:") === -1 ? "" : ' xmlns:xlink="http://www.w3.org/1999/xlink"';
  for (const s in t)
    e += " " + s + '="' + t[s] + '"';
  return '<svg xmlns="http://www.w3.org/2000/svg"' + e + ">" + i + "</svg>";
}
function Ro(i) {
  return i.replace(/"/g, "'").replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/\s+/g, " ");
}
function Mo(i) {
  return "data:image/svg+xml," + Ro(i);
}
function Is(i) {
  return 'url("' + Mo(i) + '")';
}
const zo = () => {
  let i;
  try {
    if (i = fetch, typeof i == "function")
      return i;
  } catch {
  }
};
let Pe = zo();
function jo(i) {
  Pe = i;
}
function Bo() {
  return Pe;
}
function No(i, t) {
  const e = qe(i);
  if (!e)
    return 0;
  let s;
  if (!e.maxURL)
    s = 0;
  else {
    let n = 0;
    e.resources.forEach((o) => {
      n = Math.max(n, o.length);
    });
    const r = t + ".json?icons=";
    s = e.maxURL - n - e.path.length - r.length;
  }
  return s;
}
function Ho(i) {
  return i === 404;
}
const Do = (i, t, e) => {
  const s = [], n = No(i, t), r = "icons";
  let o = {
    type: r,
    provider: i,
    prefix: t,
    icons: []
  }, l = 0;
  return e.forEach((a, c) => {
    l += a.length + 1, l >= n && c > 0 && (s.push(o), o = {
      type: r,
      provider: i,
      prefix: t,
      icons: []
    }, l = a.length), o.icons.push(a);
  }), s.push(o), s;
};
function Fo(i) {
  if (typeof i == "string") {
    const t = qe(i);
    if (t)
      return t.path;
  }
  return "/";
}
const Vo = (i, t, e) => {
  if (!Pe) {
    e("abort", 424);
    return;
  }
  let s = Fo(t.provider);
  switch (t.type) {
    case "icons": {
      const r = t.prefix, l = t.icons.join(","), a = new URLSearchParams({
        icons: l
      });
      s += r + ".json?" + a.toString();
      break;
    }
    case "custom": {
      const r = t.uri;
      s += r.slice(0, 1) === "/" ? r.slice(1) : r;
      break;
    }
    default:
      e("abort", 400);
      return;
  }
  let n = 503;
  Pe(i + s).then((r) => {
    const o = r.status;
    if (o !== 200) {
      setTimeout(() => {
        e(Ho(o) ? "abort" : "next", o);
      });
      return;
    }
    return n = 501, r.json();
  }).then((r) => {
    if (typeof r != "object" || r === null) {
      setTimeout(() => {
        r === 404 ? e("abort", r) : e("next", n);
      });
      return;
    }
    setTimeout(() => {
      e("success", r);
    });
  }).catch(() => {
    e("next", n);
  });
}, Uo = {
  prepare: Do,
  send: Vo
};
function kn(i, t) {
  switch (i) {
    case "local":
    case "session":
      $t[i] = t;
      break;
    case "all":
      for (const e in $t)
        $t[e] = t;
      break;
  }
}
const si = "data-style";
let Rs = "";
function qo(i) {
  Rs = i;
}
function Pn(i, t) {
  let e = Array.from(i.childNodes).find((s) => s.hasAttribute && s.hasAttribute(si));
  e || (e = document.createElement("style"), e.setAttribute(si, si), i.appendChild(e)), e.textContent = ":host{display:inline-block;vertical-align:" + (t ? "-0.125em" : "0") + "}span,svg{display:block}" + Rs;
}
function Ms() {
  wn("", Uo), _s(!0);
  let i;
  try {
    i = window;
  } catch {
  }
  if (i) {
    if (Ps(), i.IconifyPreload !== void 0) {
      const e = i.IconifyPreload, s = "Invalid IconifyPreload syntax.";
      typeof e == "object" && e !== null && (e instanceof Array ? e : [e]).forEach((n) => {
        try {
          // Check if item is an object and not null/array
          (typeof n != "object" || n === null || n instanceof Array || // Check for 'icons' and 'prefix'
          typeof n.icons != "object" || typeof n.prefix != "string" || // Add icon set
          !_n(n)) && console.error(s);
        } catch {
          console.error(s);
        }
      });
    }
    if (i.IconifyProviders !== void 0) {
      const e = i.IconifyProviders;
      if (typeof e == "object" && e !== null)
        for (const s in e) {
          const n = "IconifyProviders[" + s + "] is invalid.";
          try {
            const r = e[s];
            if (typeof r != "object" || !r || r.resources === void 0)
              continue;
            $n(s, r) || console.error(n);
          } catch {
            console.error(n);
          }
        }
    }
  }
  return {
    enableCache: (e) => kn(e, !0),
    disableCache: (e) => kn(e, !1),
    iconLoaded: xn,
    iconExists: xn,
    getIcon: oo,
    listIcons: ro,
    addIcon: xs,
    addCollection: _n,
    calculateSize: fi,
    buildIcon: Ls,
    iconToHTML: Pi,
    svgToURL: Is,
    loadIcons: ki,
    loadIcon: Co,
    addAPIProvider: $n,
    appendCustomStyle: qo,
    _api: {
      getAPIConfig: qe,
      setAPIModule: wn,
      sendAPIQuery: Cs,
      setFetch: jo,
      getFetch: Bo,
      listAPIProviders: mo
    }
  };
}
const pi = {
  "background-color": "currentColor"
}, zs = {
  "background-color": "transparent"
}, Tn = {
  image: "var(--svg)",
  repeat: "no-repeat",
  size: "100% 100%"
}, Ln = {
  "-webkit-mask": pi,
  mask: pi,
  background: zs
};
for (const i in Ln) {
  const t = Ln[i];
  for (const e in Tn)
    t[i + "-" + e] = Tn[e];
}
function In(i) {
  return i ? i + (i.match(/^[-0-9.]+$/) ? "px" : "") : "inherit";
}
function Wo(i, t, e) {
  const s = document.createElement("span");
  let n = i.body;
  n.indexOf("<a") !== -1 && (n += "<!-- " + Date.now() + " -->");
  const r = i.attributes, o = Pi(n, {
    ...r,
    width: t.width + "",
    height: t.height + ""
  }), l = Is(o), a = s.style, c = {
    "--svg": l,
    width: In(r.width),
    height: In(r.height),
    ...e ? pi : zs
  };
  for (const u in c)
    a.setProperty(u, c[u]);
  return s;
}
let te;
function Qo() {
  try {
    te = window.trustedTypes.createPolicy("iconify", {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      createHTML: (i) => i
    });
  } catch {
    te = null;
  }
}
function Yo(i) {
  return te === void 0 && Qo(), te ? te.createHTML(i) : i;
}
function Go(i) {
  const t = document.createElement("span"), e = i.attributes;
  let s = "";
  e.width || (s = "width: inherit;"), e.height || (s += "height: inherit;"), s && (e.style = s);
  const n = Pi(i.body, e);
  return t.innerHTML = Yo(n), t.firstChild;
}
function mi(i) {
  return Array.from(i.childNodes).find((t) => {
    const e = t.tagName && t.tagName.toUpperCase();
    return e === "SPAN" || e === "SVG";
  });
}
function Rn(i, t) {
  const e = t.icon.data, s = t.customisations, n = Ls(e, s);
  s.preserveAspectRatio && (n.attributes.preserveAspectRatio = s.preserveAspectRatio);
  const r = t.renderedMode;
  let o;
  switch (r) {
    case "svg":
      o = Go(n);
      break;
    default:
      o = Wo(n, {
        ...de,
        ...e
      }, r === "mask");
  }
  const l = mi(i);
  l ? o.tagName === "SPAN" && l.tagName === o.tagName ? l.setAttribute("style", o.getAttribute("style")) : i.replaceChild(o, l) : i.appendChild(o);
}
function Mn(i, t, e) {
  const s = e && (e.rendered ? e : e.lastRender);
  return {
    rendered: !1,
    inline: t,
    icon: i,
    lastRender: s
  };
}
function Xo(i = "iconify-icon") {
  let t, e;
  try {
    t = window.customElements, e = window.HTMLElement;
  } catch {
    return;
  }
  if (!t || !e)
    return;
  const s = t.get(i);
  if (s)
    return s;
  const n = [
    // Icon
    "icon",
    // Mode
    "mode",
    "inline",
    "observe",
    // Customisations
    "width",
    "height",
    "rotate",
    "flip"
  ], r = class extends e {
    /**
     * Constructor
     */
    constructor() {
      super();
      // Root
      ot(this, "_shadowRoot");
      // Initialised
      ot(this, "_initialised", !1);
      // Icon state
      ot(this, "_state");
      // Attributes check queued
      ot(this, "_checkQueued", !1);
      // Connected
      ot(this, "_connected", !1);
      // Observer
      ot(this, "_observer", null);
      ot(this, "_visible", !0);
      const a = this._shadowRoot = this.attachShadow({
        mode: "open"
      }), c = ni(this);
      Pn(a, c), this._state = Mn({
        value: ""
      }, c), this._queueCheck();
    }
    /**
     * Connected to DOM
     */
    connectedCallback() {
      this._connected = !0, this.startObserver();
    }
    /**
     * Disconnected from DOM
     */
    disconnectedCallback() {
      this._connected = !1, this.stopObserver();
    }
    /**
     * Observed attributes
     */
    static get observedAttributes() {
      return n.slice(0);
    }
    /**
     * Observed properties that are different from attributes
     *
     * Experimental! Need to test with various frameworks that support it
     */
    /*
    static get properties() {
        return {
            inline: {
                type: Boolean,
                reflect: true,
            },
            // Not listing other attributes because they are strings or combination
            // of string and another type. Cannot have multiple types
        };
    }
    */
    /**
     * Attribute has changed
     */
    attributeChangedCallback(a) {
      switch (a) {
        case "inline": {
          const c = ni(this), u = this._state;
          c !== u.inline && (u.inline = c, Pn(this._shadowRoot, c));
          break;
        }
        case "observer": {
          this.observer ? this.startObserver() : this.stopObserver();
          break;
        }
        default:
          this._queueCheck();
      }
    }
    /**
     * Get/set icon
     */
    get icon() {
      const a = this.getAttribute("icon");
      if (a && a.slice(0, 1) === "{")
        try {
          return JSON.parse(a);
        } catch {
        }
      return a;
    }
    set icon(a) {
      typeof a == "object" && (a = JSON.stringify(a)), this.setAttribute("icon", a);
    }
    /**
     * Get/set inline
     */
    get inline() {
      return ni(this);
    }
    set inline(a) {
      a ? this.setAttribute("inline", "true") : this.removeAttribute("inline");
    }
    /**
     * Get/set observer
     */
    get observer() {
      return this.hasAttribute("observer");
    }
    set observer(a) {
      a ? this.setAttribute("observer", "true") : this.removeAttribute("observer");
    }
    /**
     * Restart animation
     */
    restartAnimation() {
      const a = this._state;
      if (a.rendered) {
        const c = this._shadowRoot;
        if (a.renderedMode === "svg")
          try {
            c.lastChild.setCurrentTime(0);
            return;
          } catch {
          }
        Rn(c, a);
      }
    }
    /**
     * Get status
     */
    get status() {
      const a = this._state;
      return a.rendered ? "rendered" : a.icon.data === null ? "failed" : "loading";
    }
    /**
     * Queue attributes re-check
     */
    _queueCheck() {
      this._checkQueued || (this._checkQueued = !0, setTimeout(() => {
        this._check();
      }));
    }
    /**
     * Check for changes
     */
    _check() {
      if (!this._checkQueued)
        return;
      this._checkQueued = !1;
      const a = this._state, c = this.getAttribute("icon");
      if (c !== a.icon.value) {
        this._iconChanged(c);
        return;
      }
      if (!a.rendered || !this._visible)
        return;
      const u = this.getAttribute("mode"), d = vn(this);
      (a.attrMode !== u || Kr(a.customisations, d) || !mi(this._shadowRoot)) && this._renderIcon(a.icon, d, u);
    }
    /**
     * Icon value has changed
     */
    _iconChanged(a) {
      const c = So(a, (u, d, f) => {
        const p = this._state;
        if (p.rendered || this.getAttribute("icon") !== u)
          return;
        const b = {
          value: u,
          name: d,
          data: f
        };
        b.data ? this._gotIconData(b) : p.icon = b;
      });
      c.data ? this._gotIconData(c) : this._state = Mn(c, this._state.inline, this._state);
    }
    /**
     * Force render icon on state change
     */
    _forceRender() {
      if (!this._visible) {
        const a = mi(this._shadowRoot);
        a && this._shadowRoot.removeChild(a);
        return;
      }
      this._queueCheck();
    }
    /**
     * Got new icon data, icon is ready to (re)render
     */
    _gotIconData(a) {
      this._checkQueued = !1, this._renderIcon(a, vn(this), this.getAttribute("mode"));
    }
    /**
     * Re-render based on icon data
     */
    _renderIcon(a, c, u) {
      const d = Ao(a.data.body, u), f = this._state.inline;
      Rn(this._shadowRoot, this._state = {
        rendered: !0,
        icon: a,
        inline: f,
        customisations: c,
        attrMode: u,
        renderedMode: d
      });
    }
    /**
     * Start observer
     */
    startObserver() {
      if (!this._observer)
        try {
          this._observer = new IntersectionObserver((a) => {
            const c = a.some((u) => u.isIntersecting);
            c !== this._visible && (this._visible = c, this._forceRender());
          }), this._observer.observe(this);
        } catch {
          if (this._observer) {
            try {
              this._observer.disconnect();
            } catch {
            }
            this._observer = null;
          }
        }
    }
    /**
     * Stop observer
     */
    stopObserver() {
      this._observer && (this._observer.disconnect(), this._observer = null, this._visible = !0, this._connected && this._forceRender());
    }
  };
  n.forEach((l) => {
    l in r.prototype || Object.defineProperty(r.prototype, l, {
      get: function() {
        return this.getAttribute(l);
      },
      set: function(a) {
        a !== null ? this.setAttribute(l, a) : this.removeAttribute(l);
      }
    });
  });
  const o = Ms();
  for (const l in o)
    r[l] = r.prototype[l] = o[l];
  return t.define(i, r), r;
}
Xo() || Ms();
const Jo = C`
  ::-webkit-scrollbar {
    width: 0.4rem;
    height: 0.4rem;
    overflow: hidden;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 0.25rem;
    background-color: var(
      --bim-scrollbar--c,
      color-mix(in lab, var(--bim-ui_main-base), white 15%)
    );
  }

  ::-webkit-scrollbar-track {
    background-color: var(--bim-scrollbar--bgc, var(--bim-ui_bg-base));
  }
`, Ko = C`
  :root {
    /* Grayscale Colors */
    --bim-ui_gray-0: hsl(210 10% 5%);
    --bim-ui_gray-1: hsl(210 10% 10%);
    --bim-ui_gray-2: hsl(210 10% 20%);
    --bim-ui_gray-3: hsl(210 10% 30%);
    --bim-ui_gray-4: hsl(210 10% 40%);
    --bim-ui_gray-6: hsl(210 10% 60%);
    --bim-ui_gray-7: hsl(210 10% 70%);
    --bim-ui_gray-8: hsl(210 10% 80%);
    --bim-ui_gray-9: hsl(210 10% 90%);
    --bim-ui_gray-10: hsl(210 10% 95%);

    /* Brand Colors */
    --bim-ui_main-base: #6528d7;
    --bim-ui_accent-base: #bcf124;

    /* Brand Colors Contrasts */
    --bim-ui_main-contrast: var(--bim-ui_gray-10);
    --bim-ui_accent-contrast: var(--bim-ui_gray-0);

    /* Sizes */
    --bim-ui_size-4xs: 0.375rem;
    --bim-ui_size-3xs: 0.5rem;
    --bim-ui_size-2xs: 0.625rem;
    --bim-ui_size-xs: 0.75rem;
    --bim-ui_size-sm: 0.875rem;
    --bim-ui_size-base: 1rem;
    --bim-ui_size-lg: 1.125rem;
    --bim-ui_size-xl: 1.25rem;
    --bim-ui_size-2xl: 1.375rem;
    --bim-ui_size-3xl: 1.5rem;
    --bim-ui_size-4xl: 1.625rem;
    --bim-ui_size-5xl: 1.75rem;
    --bim-ui_size-6xl: 1.875rem;
    --bim-ui_size-7xl: 2rem;
    --bim-ui_size-8xl: 2.125rem;
    --bim-ui_size-9xl: 2.25rem;
  }

  /* Background Colors */
  @media (prefers-color-scheme: dark) {
    :root {
      --bim-ui_bg-base: var(--bim-ui_gray-0);
      --bim-ui_bg-contrast-10: var(--bim-ui_gray-1);
      --bim-ui_bg-contrast-20: var(--bim-ui_gray-2);
      --bim-ui_bg-contrast-30: var(--bim-ui_gray-3);
      --bim-ui_bg-contrast-40: var(--bim-ui_gray-4);
      --bim-ui_bg-contrast-60: var(--bim-ui_gray-6);
      --bim-ui_bg-contrast-80: var(--bim-ui_gray-8);
      --bim-ui_bg-contrast-100: var(--bim-ui_gray-10);
    }
  }

  @media (prefers-color-scheme: light) {
    :root {
      --bim-ui_bg-base: var(--bim-ui_gray-10);
      --bim-ui_bg-contrast-10: var(--bim-ui_gray-9);
      --bim-ui_bg-contrast-20: var(--bim-ui_gray-8);
      --bim-ui_bg-contrast-30: var(--bim-ui_gray-7);
      --bim-ui_bg-contrast-40: var(--bim-ui_gray-6);
      --bim-ui_bg-contrast-60: var(--bim-ui_gray-4);
      --bim-ui_bg-contrast-80: var(--bim-ui_gray-2);
      --bim-ui_bg-contrast-100: var(--bim-ui_gray-0);
      --bim-ui_accent-base: #6528d7;
    }
  }

  html.bim-ui-dark {
    --bim-ui_bg-base: var(--bim-ui_gray-0);
    --bim-ui_bg-contrast-10: var(--bim-ui_gray-1);
    --bim-ui_bg-contrast-20: var(--bim-ui_gray-2);
    --bim-ui_bg-contrast-30: var(--bim-ui_gray-3);
    --bim-ui_bg-contrast-40: var(--bim-ui_gray-4);
    --bim-ui_bg-contrast-60: var(--bim-ui_gray-6);
    --bim-ui_bg-contrast-80: var(--bim-ui_gray-8);
    --bim-ui_bg-contrast-100: var(--bim-ui_gray-10);
  }

  html.bim-ui-light {
    --bim-ui_bg-base: var(--bim-ui_gray-10);
    --bim-ui_bg-contrast-10: var(--bim-ui_gray-9);
    --bim-ui_bg-contrast-20: var(--bim-ui_gray-8);
    --bim-ui_bg-contrast-30: var(--bim-ui_gray-7);
    --bim-ui_bg-contrast-40: var(--bim-ui_gray-6);
    --bim-ui_bg-contrast-60: var(--bim-ui_gray-4);
    --bim-ui_bg-contrast-80: var(--bim-ui_gray-2);
    --bim-ui_bg-contrast-100: var(--bim-ui_gray-0);
    --bim-ui_accent-base: #6528d7;
  }

  [data-context-dialog]::backdrop {
    background-color: transparent;
  }
`, vt = {
  scrollbar: Jo,
  globalStyles: Ko
}, y = class y {
  static set config(t) {
    this._config = { ...y._config, ...t };
  }
  static get config() {
    return y._config;
  }
  static addGlobalStyles() {
    let t = document.querySelector("style[id='bim-ui']");
    if (t)
      return;
    t = document.createElement("style"), t.id = "bim-ui", t.textContent = vt.globalStyles.cssText;
    const e = document.head.firstChild;
    e ? document.head.insertBefore(t, e) : document.head.append(t);
  }
  static defineCustomElement(t, e) {
    customElements.get(t) || customElements.define(t, e);
  }
  /**
   * @deprecated Use `Manager.init()` instead.
   */
  static registerComponents() {
    y.init();
  }
  /**
   * Initializes the BIM UI library by defining custom elements.
   * It ensures that all necessary styles and custom elements are registered for use in BIM UI components.
   *
   * @example
   * ```typescript
   * import { Manager } from "@thatopen/ui";
   * Manager.init();
   * ```
   */
  static init() {
    y.addGlobalStyles(), y.defineCustomElement("bim-button", sl), y.defineCustomElement("bim-checkbox", dt), y.defineCustomElement("bim-color-input", Z), y.defineCustomElement("bim-context-menu", gi), y.defineCustomElement("bim-dropdown", V), y.defineCustomElement("bim-grid", ae), y.defineCustomElement("bim-icon", vi), y.defineCustomElement("bim-input", Ot), y.defineCustomElement("bim-label", ft), y.defineCustomElement("bim-number-input", R), y.defineCustomElement("bim-option", T), y.defineCustomElement("bim-panel", tt), y.defineCustomElement("bim-panel-section", pt), y.defineCustomElement("bim-selector", mt), y.defineCustomElement("bim-table", M), y.defineCustomElement("bim-tabs", X), y.defineCustomElement("bim-tab", I), y.defineCustomElement("bim-table-cell", Re), y.defineCustomElement("bim-table-children", Me), y.defineCustomElement("bim-table-group", ze), y.defineCustomElement("bim-table-row", et), y.defineCustomElement("bim-text-input", B), y.defineCustomElement("bim-toolbar", Ft), y.defineCustomElement("bim-toolbar-group", Dt), y.defineCustomElement(
      "bim-toolbar-section",
      bt
    ), y.defineCustomElement("bim-viewport", je);
  }
  static newRandomId() {
    const t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let e = "";
    for (let s = 0; s < 10; s++) {
      const n = Math.floor(Math.random() * t.length);
      e += t.charAt(n);
    }
    return e;
  }
};
y._config = {
  sectionLabelOnVerticalToolbar: !1
  // draggableToolbars: true,
  // draggablePanels: true,
};
let Te = y;
class Le extends w {
  constructor() {
    super(...arguments), this._lazyLoadObserver = null, this._visibleElements = [], this.ELEMENTS_BEFORE_OBSERVER = 20, this.useObserver = !1, this.elements = /* @__PURE__ */ new Set(), this.observe = (t) => {
      if (!this.useObserver)
        return;
      for (const s of t)
        this.elements.add(s);
      const e = t.slice(this.ELEMENTS_BEFORE_OBSERVER);
      for (const s of e)
        s.remove();
      this.observeLastElement();
    };
  }
  set visibleElements(t) {
    this._visibleElements = this.useObserver ? t : [], this.requestUpdate();
  }
  get visibleElements() {
    return this._visibleElements;
  }
  getLazyObserver() {
    if (!this.useObserver)
      return null;
    if (this._lazyLoadObserver)
      return this._lazyLoadObserver;
    const t = new IntersectionObserver(
      (e) => {
        const s = e[0];
        if (!s.isIntersecting)
          return;
        const n = s.target;
        t.unobserve(n);
        const r = this.ELEMENTS_BEFORE_OBSERVER + this.visibleElements.length, o = [...this.elements][r];
        o && (this.visibleElements = [...this.visibleElements, o], t.observe(o));
      },
      { threshold: 0.5 }
    );
    return t;
  }
  observeLastElement() {
    const t = this.getLazyObserver();
    if (!t)
      return;
    const e = this.ELEMENTS_BEFORE_OBSERVER + this.visibleElements.length - 1, s = [...this.elements][e];
    s && t.observe(s);
  }
  resetVisibleElements() {
    const t = this.getLazyObserver();
    if (t) {
      for (const e of this.elements)
        t.unobserve(e);
      this.visibleElements = [], this.observeLastElement();
    }
  }
  /**
   * Creates a new UI component instance based on the provided template and initial state.
   *
   * @template T - The type of the UI component element.
   * @template S - The type of the component state.
   *
   * @param template - The component template function (stateless or stateful).
   * @param initialState - The initial state of the component (optional for stateless components).
   * @returns The created UI component element or an array containing the element and a function to update its state.
   */
  static create(t, e) {
    const s = document.createDocumentFragment();
    if (t.length === 0)
      return Bt(t(), s), s.firstElementChild;
    if (!e)
      throw new Error(
        "UIComponent: Initial state is required for statefull components."
      );
    let n = e;
    const r = t, o = (c) => (n = { ...n, ...c }, Bt(r(n, o), s), n);
    o(e);
    const l = () => n;
    return [s.firstElementChild, o, l];
  }
}
const Ie = (i, t = {}, e = !0) => {
  let s = {};
  for (const n of i.children) {
    const r = n, o = r.getAttribute("name") || r.getAttribute("label"), l = t[o];
    if (o) {
      if ("value" in r && typeof r.value < "u" && r.value !== null) {
        const a = r.value;
        if (typeof a == "object" && !Array.isArray(a) && Object.keys(a).length === 0)
          continue;
        s[o] = l ? l(r.value) : r.value;
      } else if (e) {
        const a = Ie(r, t);
        if (Object.keys(a).length === 0)
          continue;
        s[o] = l ? l(a) : a;
      }
    } else
      e && (s = { ...s, ...Ie(r, t) });
  }
  return s;
}, We = (i) => i === "true" || i === "false" ? i === "true" : i && !isNaN(Number(i)) && i.trim() !== "" ? Number(i) : i, Zo = [">=", "<=", "=", ">", "<", "?", "/", "#"];
function zn(i) {
  const t = Zo.find(
    (l) => i.split(l).length === 2
  ), e = i.split(t).map((l) => l.trim()), [s, n] = e, r = n.startsWith("'") && n.endsWith("'") ? n.replace(/'/g, "") : We(n);
  return { key: s, condition: t, value: r };
}
const bi = (i) => {
  try {
    const t = [], e = i.split(/&(?![^()]*\))/).map((s) => s.trim());
    for (const s of e) {
      const n = !s.startsWith("(") && !s.endsWith(")"), r = s.startsWith("(") && s.endsWith(")");
      if (n) {
        const o = zn(s);
        t.push(o);
      }
      if (r) {
        const c = {
          operator: "&",
          queries: s.replace(/^(\()|(\))$/g, "").split("&").map((u) => u.trim()).map((u, d) => {
            const f = zn(u);
            return d > 0 && (f.operator = "&"), f;
          })
        };
        t.push(c);
      }
    }
    return t;
  } catch {
    return null;
  }
}, jn = (i, t, e) => {
  let s = !1;
  switch (t) {
    case "=":
      s = i === e;
      break;
    case "?":
      s = String(i).includes(String(e));
      break;
    case "<":
      (typeof i == "number" || typeof e == "number") && (s = i < e);
      break;
    case "<=":
      (typeof i == "number" || typeof e == "number") && (s = i <= e);
      break;
    case ">":
      (typeof i == "number" || typeof e == "number") && (s = i > e);
      break;
    case ">=":
      (typeof i == "number" || typeof e == "number") && (s = i >= e);
      break;
    case "/":
      s = String(i).startsWith(String(e));
      break;
  }
  return s;
};
var tl = Object.defineProperty, el = Object.getOwnPropertyDescriptor, js = (i, t, e, s) => {
  for (var n = el(t, e), r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(t, e, n) || n);
  return n && tl(t, e, n), n;
}, P;
const Ti = (P = class extends w {
  constructor() {
    super(...arguments), this._previousContainer = null, this._visible = !1;
  }
  get placement() {
    return this._placement;
  }
  set placement(t) {
    this._placement = t, this.updatePosition();
  }
  static removeMenus() {
    for (const t of P.menus)
      t instanceof P && (t.visible = !1);
    P.dialog.close(), P.dialog.remove();
  }
  get visible() {
    return this._visible;
  }
  set visible(t) {
    var e;
    this._visible = t, t ? (P.dialog.parentElement || document.body.append(P.dialog), this._previousContainer = this.parentElement, P.dialog.style.top = `${window.scrollY || document.documentElement.scrollTop}px`, P.dialog.append(this), P.dialog.showModal(), this.updatePosition(), this.dispatchEvent(new Event("visible"))) : ((e = this._previousContainer) == null || e.append(this), this._previousContainer = null, this.dispatchEvent(new Event("hidden")));
  }
  /**
   * Asynchronously updates the position of the context menu relative to a target element.
   * If no target element is provided, it attempts to use the parent node as the target.
   * The position is calculated using the `computePosition` function from `@floating-ui/dom`,
   * which considers various adjustments like offset, inline positioning, flipping, and shifting
   * to ensure the context menu is properly placed relative to the target element.
   *
   * @param [target] - The target element relative to which the context menu should be positioned.
   *                                 If not provided, the parent node is used as the target.
   * @returns A promise that resolves once the position has been updated. This method
   *                          does not explicitly return a value but updates the context menu's style
   *                          properties to position it on the screen.
   */
  async updatePosition() {
    if (!(this.visible && this._previousContainer))
      return;
    const t = this.placement ?? "right", e = await rs(this._previousContainer, this, {
      placement: t,
      middleware: [Wn(10), ss(), ns(), is({ padding: 5 })]
    }), { x: s, y: n } = e;
    this.style.left = `${s}px`, this.style.top = `${n}px`;
  }
  connectedCallback() {
    super.connectedCallback(), P.menus.push(this);
  }
  render() {
    return m` <slot></slot> `;
  }
}, P.styles = [
  vt.scrollbar,
  C`
      :host {
        pointer-events: auto;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 999;
        overflow: auto;
        max-height: 20rem;
        min-width: 3rem;
        flex-direction: column;
        box-shadow: 1px 2px 8px 2px rgba(0, 0, 0, 0.15);
        padding: 0.5rem;
        border-radius: var(--bim-ui_size-4xs);
        display: flex;
        background-color: var(
          --bim-context-menu--bgc,
          var(--bim-ui_bg-contrast-20)
        );
      }

      :host(:not([visible])) {
        display: none;
      }
    `
], P.dialog = Le.create(() => m` <dialog
      @click=${(e) => {
  e.target === P.dialog && P.removeMenus();
}}
      @cancel=${() => P.removeMenus()}
      data-context-dialog
      style="
      width: 0;
      height: 0;
      position: relative;
      padding: 0;
      border: none;
      outline: none;
      margin: none;
      overflow: visible;
      background-color: transparent;
    "
    ></dialog>`), P.menus = [], P);
js([
  h({ type: String, reflect: !0 })
], Ti.prototype, "placement");
js([
  h({ type: Boolean, reflect: !0 })
], Ti.prototype, "visible");
let gi = Ti;
var il = Object.defineProperty, nl = Object.getOwnPropertyDescriptor, U = (i, t, e, s) => {
  for (var n = s > 1 ? void 0 : s ? nl(t, e) : t, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = (s ? o(t, e, n) : o(n)) || n);
  return s && n && il(t, e, n), n;
}, Ct;
const N = (Ct = class extends w {
  constructor() {
    super(), this.labelHidden = !1, this.active = !1, this.disabled = !1, this.vertical = !1, this.tooltipVisible = !1, this._stateBeforeLoading = {
      disabled: !1,
      icon: ""
    }, this._loading = !1, this._parent = Nt(), this._tooltip = Nt(), this._mouseLeave = !1, this.onClick = (t) => {
      t.stopPropagation(), this.disabled || this.dispatchEvent(new Event("click"));
    }, this.showContextMenu = () => {
      const t = this._contextMenu;
      if (t) {
        const e = this.getAttribute("data-context-group");
        e && t.setAttribute("data-context-group", e), this.closeNestedContexts();
        const s = Te.newRandomId();
        for (const n of t.children)
          n instanceof Ct && n.setAttribute("data-context-group", s);
        t.visible = !0;
      }
    }, this.mouseLeave = !0;
  }
  set loading(t) {
    if (this._loading = t, t)
      this._stateBeforeLoading = {
        disabled: this.disabled,
        icon: this.icon
      }, this.disabled = t, this.icon = "eos-icons:loading";
    else {
      const { disabled: e, icon: s } = this._stateBeforeLoading;
      this.disabled = e, this.icon = s;
    }
  }
  get loading() {
    return this._loading;
  }
  set mouseLeave(t) {
    this._mouseLeave = t, t && (this.tooltipVisible = !1, clearTimeout(this.timeoutID));
  }
  get mouseLeave() {
    return this._mouseLeave;
  }
  computeTooltipPosition() {
    const { value: t } = this._parent, { value: e } = this._tooltip;
    t && e && rs(t, e, {
      placement: "bottom",
      middleware: [Wn(10), ss(), ns(), is({ padding: 5 })]
    }).then((s) => {
      const { x: n, y: r } = s;
      Object.assign(e.style, {
        left: `${n}px`,
        top: `${r}px`
      });
    });
  }
  onMouseEnter() {
    if (!(this.tooltipTitle || this.tooltipText))
      return;
    this.mouseLeave = !1;
    const t = this.tooltipTime ?? 700;
    this.timeoutID = setTimeout(() => {
      this.mouseLeave || (this.computeTooltipPosition(), this.tooltipVisible = !0);
    }, t);
  }
  closeNestedContexts() {
    const t = this.getAttribute("data-context-group");
    if (t)
      for (const e of gi.dialog.children) {
        const s = e.getAttribute("data-context-group");
        if (e instanceof gi && s === t) {
          e.visible = !1, e.removeAttribute("data-context-group");
          for (const n of e.children)
            n instanceof Ct && (n.closeNestedContexts(), n.removeAttribute("data-context-group"));
        }
      }
  }
  click() {
    this.disabled || super.click();
  }
  get _contextMenu() {
    return this.querySelector("bim-context-menu");
  }
  connectedCallback() {
    super.connectedCallback(), this.addEventListener("click", this.showContextMenu);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.removeEventListener("click", this.showContextMenu);
  }
  render() {
    const t = m`
      <div ${Ht(this._tooltip)} class="tooltip">
        ${this.tooltipTitle ? m`<p style="text-wrap: nowrap;">
              <strong>${this.tooltipTitle}</strong>
            </p>` : null}
        ${this.tooltipText ? m`<p style="width: 9rem;">${this.tooltipText}</p>` : null}
      </div>
    `, e = m`<svg
      xmlns="http://www.w3.org/2000/svg"
      height="1.125rem"
      viewBox="0 0 24 24"
      width="1.125rem"
      style="fill: var(--bim-label--c)"
    >
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
    </svg>`;
    return m`
      <div ${Ht(this._parent)} class="parent" @click=${this.onClick}>
        ${this.label || this.icon ? m`
              <div
                class="button"
                @mouseenter=${this.onMouseEnter}
                @mouseleave=${() => this.mouseLeave = !0}
              >
                <bim-label
                  .icon=${this.icon}
                  .vertical=${this.vertical}
                  .labelHidden=${this.labelHidden}
                  >${this.label}${this.label && this._contextMenu ? e : null}</bim-label
                >
              </div>
            ` : null}
        ${this.tooltipTitle || this.tooltipText ? t : null}
      </div>
      <slot></slot>
    `;
  }
}, Ct.styles = C`
    :host {
      --bim-label--c: var(--bim-ui_bg-contrast-100, white);
      display: block;
      flex: 1;
      pointer-events: none;
      background-color: var(--bim-button--bgc, var(--bim-ui_bg-contrast-20));
      border-radius: var(--bim-ui_size-4xs);
      transition: all 0.15s;
    }

    :host(:not([disabled]):hover) {
      cursor: pointer;
    }

    bim-label {
      pointer-events: none;
    }

    .parent {
      --bim-icon--c: var(--bim-label--c);
      position: relative;
      display: flex;
      height: 100%;
      user-select: none;
      row-gap: 0.125rem;
      min-height: var(--bim-ui_size-5xl);
      min-width: var(--bim-ui_size-5xl);
    }

    .button,
    .children {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
    }

    .children {
      padding: 0 0.375rem;
      position: absolute;
      height: 100%;
      right: 0;
    }

    :host(:not([label-hidden])[icon][vertical]) .parent {
      min-height: 2.5rem;
    }

    .button {
      flex-grow: 1;
    }

    :host(:not([label-hidden])[label]) .button {
      justify-content: var(--bim-button--jc, center);
    }

    :host(:hover),
    :host([active]) {
      --bim-label--c: var(--bim-ui_main-contrast);
      background-color: var(--bim-ui_main-base);
    }

    :host(:not([label]):not([icon])) .children {
      flex: 1;
    }

    :host([vertical]) .parent {
      justify-content: center;
    }

    :host(:not([label-hidden])[label]) .button {
      padding: 0 0.5rem;
    }

    :host([disabled]) {
      --bim-label--c: var(--bim-ui_bg-contrast-80) !important;
      background-color: gray !important;
    }

    ::slotted(bim-button) {
      --bim-icon--fz: var(--bim-ui_size-base);
      --bim-button--bdrs: var(--bim-ui_size-4xs);
      --bim-button--olw: 0;
      --bim-button--olc: transparent;
    }

    .tooltip {
      position: absolute;
      padding: 0.75rem;
      z-index: 99;
      display: flex;
      flex-flow: column;
      row-gap: 0.375rem;
      box-shadow: 0 0 10px 3px rgba(0 0 0 / 20%);
      outline: 1px solid var(--bim-ui_bg-contrast-40);
      font-size: var(--bim-ui_size-xs);
      border-radius: var(--bim-ui_size-4xs);
      background-color: var(--bim-ui_bg-contrast-20);
      color: var(--bim-ui_bg-contrast-100);
    }

    .tooltip p {
      margin: 0;
      padding: 0;
    }

    :host(:not([tooltip-visible])) .tooltip {
      display: none;
    }
  `, Ct);
U([
  h({ type: String, reflect: !0 })
], N.prototype, "label", 2);
U([
  h({ type: Boolean, attribute: "label-hidden", reflect: !0 })
], N.prototype, "labelHidden", 2);
U([
  h({ type: Boolean, reflect: !0 })
], N.prototype, "active", 2);
U([
  h({ type: Boolean, reflect: !0, attribute: "disabled" })
], N.prototype, "disabled", 2);
U([
  h({ type: String, reflect: !0 })
], N.prototype, "icon", 2);
U([
  h({ type: Boolean, reflect: !0 })
], N.prototype, "vertical", 2);
U([
  h({ type: Number, attribute: "tooltip-time", reflect: !0 })
], N.prototype, "tooltipTime", 2);
U([
  h({ type: Boolean, attribute: "tooltip-visible", reflect: !0 })
], N.prototype, "tooltipVisible", 2);
U([
  h({ type: String, attribute: "tooltip-title", reflect: !0 })
], N.prototype, "tooltipTitle", 2);
U([
  h({ type: String, attribute: "tooltip-text", reflect: !0 })
], N.prototype, "tooltipText", 2);
U([
  h({ type: Boolean, reflect: !0 })
], N.prototype, "loading", 1);
let sl = N;
var rl = Object.defineProperty, pe = (i, t, e, s) => {
  for (var n = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(t, e, n) || n);
  return n && rl(t, e, n), n;
};
const Ii = class Ii extends w {
  constructor() {
    super(...arguments), this.checked = !1, this.inverted = !1, this.onValueChange = new Event("change");
  }
  /**
   * A getter that returns the current checked state of the checkbox. This is useful for retrieving the checkbox's value in form submissions or JavaScript interactions as it provides a consistent `value` property as many other components.
   * @type {boolean}
   * @default false
   * @example <script>console.log(document.querySelector('bim-checkbox').value);<\/script>
   * @example
   * const checkbox = document.createElement('bim-checkbox');
   * document.body.appendChild(checkbox);
   * console.log(checkbox.value); // false initially
   */
  get value() {
    return this.checked;
  }
  onChange(t) {
    t.stopPropagation(), this.checked = t.target.checked, this.dispatchEvent(this.onValueChange);
  }
  render() {
    return m`
      <div class="parent">
        ${this.label ? m`<bim-label .icon="${this.icon}">${this.label}</bim-label> ` : null}
        <input
          type="checkbox"
          aria-label=${this.label || this.name || "Checkbox Input"}
          @change="${this.onChange}"
          .checked="${this.checked}"
        />
      </div>
    `;
  }
};
Ii.styles = C`
    :host {
      display: block;
    }

    .parent {
      display: flex;
      justify-content: space-between;
      height: 1.75rem;
      column-gap: 0.25rem;
      width: 100%;
      align-items: center;
      transition: all 0.15s;
    }

    :host([inverted]) .parent {
      flex-direction: row-reverse;
      justify-content: start;
    }

    input {
      height: 1rem;
      width: 1rem;
      cursor: pointer;
      border: none;
      outline: none;
      accent-color: var(--bim-checkbox--c, var(--bim-ui_main-base));
      transition: all 0.15s;
    }

    input:focus {
      outline: var(--bim-checkbox--olw, 2px) solid
        var(--bim-checkbox--olc, var(--bim-ui_accent-base));
    }
  `;
let dt = Ii;
pe([
  h({ type: String, reflect: !0 })
], dt.prototype, "icon");
pe([
  h({ type: String, reflect: !0 })
], dt.prototype, "name");
pe([
  h({ type: String, reflect: !0 })
], dt.prototype, "label");
pe([
  h({ type: Boolean, reflect: !0 })
], dt.prototype, "checked");
pe([
  h({ type: Boolean, reflect: !0 })
], dt.prototype, "inverted");
var ol = Object.defineProperty, Ut = (i, t, e, s) => {
  for (var n = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(t, e, n) || n);
  return n && ol(t, e, n), n;
};
const Ri = class Ri extends w {
  constructor() {
    super(...arguments), this.vertical = !1, this.color = "#bcf124", this._colorInput = Nt(), this._textInput = Nt(), this.onValueChange = new Event("input"), this.onOpacityInput = (t) => {
      const e = t.target;
      this.opacity = e.value, this.dispatchEvent(this.onValueChange);
    };
  }
  /**
   * Represents both the color and opacity values combined into a single object. This is an instance property, not an HTMLElement attribute.
   * @type {Object}
   * @example
   * const colorInput = document.createElement('bim-color-input');
   * colorInput.value = { color: '#ff0000', opacity: 0.5 };
   */
  set value(t) {
    const { color: e, opacity: s } = t;
    this.color = e, s && (this.opacity = s);
  }
  get value() {
    const t = {
      color: this.color
    };
    return this.opacity && (t.opacity = this.opacity), t;
  }
  onColorInput(t) {
    t.stopPropagation();
    const { value: e } = this._colorInput;
    e && (this.color = e.value, this.dispatchEvent(this.onValueChange));
  }
  onTextInput(t) {
    t.stopPropagation();
    const { value: e } = this._textInput;
    if (!e)
      return;
    const { value: s } = e;
    let n = s.replace(/[^a-fA-F0-9]/g, "");
    n.startsWith("#") || (n = `#${n}`), e.value = n.slice(0, 7), e.value.length === 7 && (this.color = e.value, this.dispatchEvent(this.onValueChange));
  }
  /**
   * Focuses on the color input by programmatically triggering a click event on the underlying color input element.
   * If the color input element is not available, the function does nothing.
   */
  focus() {
    const { value: t } = this._colorInput;
    t && t.click();
  }
  render() {
    return m`
      <div class="parent">
        <bim-input
          .label=${this.label}
          .icon=${this.icon}
          .vertical="${this.vertical}"
        >
          <div class="color-container">
            <div
              style="display: flex; align-items: center; gap: .375rem; height: 100%; flex: 1; padding: 0 0.5rem;"
            >
              <input
                ${Ht(this._colorInput)}
                @input="${this.onColorInput}"
                type="color"
                aria-label=${this.label || this.name || "Color Input"}
                value="${this.color}"
              />
              <div
                @click=${this.focus}
                class="sample"
                style="background-color: ${this.color}"
              ></div>
              <input
                ${Ht(this._textInput)}
                @input="${this.onTextInput}"
                value="${this.color}"
                type="text"
                aria-label=${this.label || this.name || "Text Color Input"}
              />
            </div>
            ${this.opacity !== void 0 ? m`<bim-number-input
                  @change=${this.onOpacityInput}
                  slider
                  suffix="%"
                  min="0"
                  value=${this.opacity}
                  max="100"
                ></bim-number-input>` : null}
          </div>
        </bim-input>
      </div>
    `;
  }
};
Ri.styles = C`
    :host {
      --bim-input--bgc: var(--bim-ui_bg-contrast-20);
      flex: 1;
      display: block;
    }

    :host(:focus) {
      --bim-input--olw: var(--bim-number-input--olw, 2px);
      --bim-input--olc: var(--bim-ui_accent-base);
    }

    .parent {
      display: flex;
      gap: 0.375rem;
    }

    .color-container {
      position: relative;
      outline: none;
      display: flex;
      height: 100%;
      gap: 0.5rem;
      justify-content: flex-start;
      align-items: center;
      flex: 1;
      border-radius: var(--bim-color-input--bdrs, var(--bim-ui_size-4xs));
    }

    .color-container input[type="color"] {
      position: absolute;
      bottom: -0.25rem;
      visibility: hidden;
      width: 0;
      height: 0;
    }

    .color-container .sample {
      width: 1rem;
      height: 1rem;
      border-radius: 0.125rem;
      background-color: #fff;
    }

    .color-container input[type="text"] {
      height: 100%;
      flex: 1;
      width: 3.25rem;
      text-transform: uppercase;
      font-size: 0.75rem;
      background-color: transparent;
      padding: 0%;
      outline: none;
      border: none;
      color: var(--bim-color-input--c, var(--bim-ui_bg-contrast-100));
    }

    bim-number-input {
      flex-grow: 0;
    }
  `;
let Z = Ri;
Ut([
  h({ type: String, reflect: !0 })
], Z.prototype, "name");
Ut([
  h({ type: String, reflect: !0 })
], Z.prototype, "label");
Ut([
  h({ type: String, reflect: !0 })
], Z.prototype, "icon");
Ut([
  h({ type: Boolean, reflect: !0 })
], Z.prototype, "vertical");
Ut([
  h({ type: Number, reflect: !0 })
], Z.prototype, "opacity");
Ut([
  h({ type: String, reflect: !0 })
], Z.prototype, "color");
var ll = Object.defineProperty, al = Object.getOwnPropertyDescriptor, yt = (i, t, e, s) => {
  for (var n = s > 1 ? void 0 : s ? al(t, e) : t, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = (s ? o(t, e, n) : o(n)) || n);
  return s && n && ll(t, e, n), n;
};
const Mi = class Mi extends w {
  constructor() {
    super(...arguments), this.checked = !1, this.checkbox = !1, this.noMark = !1, this.vertical = !1;
  }
  get value() {
    return this._value !== void 0 ? this._value : this.label ? We(this.label) : this.label;
  }
  set value(t) {
    this._value = t;
  }
  render() {
    return m`
      <div class="parent" .title=${this.label ?? ""}>
        ${this.img || this.icon || this.label ? m` <div style="display: flex; column-gap: 0.375rem">
              ${this.checkbox && !this.noMark ? m`<bim-checkbox
                    style="pointer-events: none"
                    .checked=${this.checked}
                  ></bim-checkbox>` : null}
              <bim-label
                .vertical=${this.vertical}
                .icon=${this.icon}
                .img=${this.img}
                >${this.label}</bim-label
              >
            </div>` : null}
        ${!this.checkbox && !this.noMark && this.checked ? m`<svg
              xmlns="http://www.w3.org/2000/svg"
              height="1.125rem"
              viewBox="0 0 24 24"
              width="1.125rem"
              fill="#FFFFFF"
            >
              <path d="M0 0h24v24H0z" fill="none" />
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>` : null}
        <slot></slot>
      </div>
    `;
  }
};
Mi.styles = C`
    :host {
      --bim-label--c: var(--bim-ui_bg-contrast-100);
      display: block;
      box-sizing: border-box;
      flex: 1;
      padding: 0rem 0.5rem;
      border-radius: var(--bim-ui_size-4xs);
      transition: all 0.15s;
    }

    :host(:hover) {
      cursor: pointer;
      background-color: color-mix(
        in lab,
        var(--bim-selector--bgc, var(--bim-ui_bg-contrast-20)),
        var(--bim-ui_main-base) 10%
      );
    }

    :host([checked]) {
      --bim-label--c: color-mix(in lab, var(--bim-ui_main-base), white 30%);
    }

    :host([checked]) svg {
      fill: color-mix(in lab, var(--bim-ui_main-base), white 30%);
    }

    .parent {
      box-sizing: border-box;
      display: flex;
      justify-content: var(--bim-option--jc, space-between);
      column-gap: 0.5rem;
      align-items: center;
      min-height: 1.75rem;
      height: 100%;
    }

    input {
      height: 1rem;
      width: 1rem;
      cursor: pointer;
      border: none;
      outline: none;
      accent-color: var(--bim-checkbox--c, var(--bim-ui_main-base));
    }

    input:focus {
      outline: var(--bim-checkbox--olw, 2px) solid
        var(--bim-checkbox--olc, var(--bim-ui_accent-base));
    }

    bim-label {
      pointer-events: none;
    }
  `;
let T = Mi;
yt([
  h({ type: String, reflect: !0 })
], T.prototype, "img", 2);
yt([
  h({ type: String, reflect: !0 })
], T.prototype, "label", 2);
yt([
  h({ type: String, reflect: !0 })
], T.prototype, "icon", 2);
yt([
  h({ type: Boolean, reflect: !0 })
], T.prototype, "checked", 2);
yt([
  h({ type: Boolean, reflect: !0 })
], T.prototype, "checkbox", 2);
yt([
  h({ type: Boolean, attribute: "no-mark", reflect: !0 })
], T.prototype, "noMark", 2);
yt([
  h({
    converter: {
      fromAttribute(i) {
        return i && We(i);
      }
    }
  })
], T.prototype, "value", 1);
yt([
  h({ type: Boolean, reflect: !0 })
], T.prototype, "vertical", 2);
var cl = Object.defineProperty, ul = Object.getOwnPropertyDescriptor, _t = (i, t, e, s) => {
  for (var n = s > 1 ? void 0 : s ? ul(t, e) : t, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = (s ? o(t, e, n) : o(n)) || n);
  return s && n && cl(t, e, n), n;
};
const zi = class zi extends Le {
  constructor() {
    super(), this.multiple = !1, this.required = !1, this.vertical = !1, this._visible = !1, this._value = /* @__PURE__ */ new Set(), this.onValueChange = new Event("change"), this._contextMenu = Nt(), this.onOptionClick = (t) => {
      const e = t.target, s = this._value.has(e);
      if (!this.multiple && !this.required && !s)
        this._value = /* @__PURE__ */ new Set([e]);
      else if (!this.multiple && !this.required && s)
        this._value = /* @__PURE__ */ new Set([]);
      else if (!this.multiple && this.required && !s)
        this._value = /* @__PURE__ */ new Set([e]);
      else if (this.multiple && !this.required && !s)
        this._value = /* @__PURE__ */ new Set([...this._value, e]);
      else if (this.multiple && !this.required && s) {
        const n = [...this._value].filter((r) => r !== e);
        this._value = new Set(n);
      } else if (this.multiple && this.required && !s)
        this._value = /* @__PURE__ */ new Set([...this._value, e]);
      else if (this.multiple && this.required && s) {
        const n = [...this._value].filter((o) => o !== e), r = new Set(n);
        r.size !== 0 && (this._value = r);
      }
      this.updateOptionsState(), this.dispatchEvent(this.onValueChange);
    }, this.useObserver = !0;
  }
  set visible(t) {
    if (t) {
      const { value: e } = this._contextMenu;
      if (!e)
        return;
      for (const s of this.elements)
        e.append(s);
      this._visible = !0;
    } else {
      for (const e of this.elements)
        this.append(e);
      this._visible = !1, this.resetVisibleElements();
    }
  }
  get visible() {
    return this._visible;
  }
  /**
   * The selected values in the dropdown.
   * @type {any[]}
   * @example
   * const dropdown = document.createElement('bim-dropdown');
   * dropdown.value = ['option1', 'option2'];
   */
  set value(t) {
    if (this.required && Object.keys(t).length === 0)
      return;
    const e = /* @__PURE__ */ new Set();
    for (const s of t) {
      const n = this.findOption(s);
      if (n && (e.add(n), !this.multiple && Object.keys(t).length === 1))
        break;
    }
    this._value = e, this.updateOptionsState(), this.dispatchEvent(this.onValueChange);
  }
  get value() {
    return [...this._value].filter(
      (e) => e instanceof T && e.checked
    ).map((e) => e.value);
  }
  get _options() {
    const t = /* @__PURE__ */ new Set([...this.elements]);
    for (const e of this.children)
      e instanceof T && t.add(e);
    return [...t];
  }
  onSlotChange(t) {
    const e = t.target.assignedElements();
    this.observe(e);
    const s = /* @__PURE__ */ new Set();
    for (const n of this.elements) {
      if (!(n instanceof T)) {
        n.remove();
        continue;
      }
      n.checked && s.add(n), n.removeEventListener("click", this.onOptionClick), n.addEventListener("click", this.onOptionClick);
    }
    this._value = s;
  }
  updateOptionsState() {
    for (const t of this._options)
      t instanceof T && (t.checked = this._value.has(t));
  }
  findOption(t) {
    return this._options.find((s) => s instanceof T ? s.label === t || s.value === t : !1);
  }
  render() {
    let t, e, s;
    if (this._value.size === 0)
      t = "Select an option...";
    else if (this._value.size === 1) {
      const n = [...this._value][0];
      t = (n == null ? void 0 : n.label) || (n == null ? void 0 : n.value), e = n == null ? void 0 : n.img, s = n == null ? void 0 : n.icon;
    } else
      t = `Multiple (${this._value.size})`;
    return m`
      <bim-input
        title=${this.label ?? ""}
        .label=${this.label}
        .icon=${this.icon}
        .vertical=${this.vertical}
      >
        <div class="input" @click=${() => this.visible = !this.visible}>
          <bim-label
            .img=${e}
            .icon=${s}
            style="overflow: hidden;"
            >${t}</bim-label
          >
          <svg
            style="flex-shrink: 0; fill: var(--bim-dropdown--c, var(--bim-ui_bg-contrast-100))"
            xmlns="http://www.w3.org/2000/svg"
            height="1.125rem"
            viewBox="0 0 24 24"
            width="1.125rem"
            fill="#9ca3af"
          >
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
          </svg>
          <bim-context-menu
            ${Ht(this._contextMenu)}
            .visible=${this.visible}
            @hidden=${() => {
      this.visible && (this.visible = !1);
    }}
          >
            <slot @slotchange=${this.onSlotChange}></slot>
          </bim-context-menu>
        </div>
      </bim-input>
    `;
  }
};
zi.styles = [
  vt.scrollbar,
  C`
      :host {
        --bim-input--bgc: var(
          --bim-dropdown--bgc,
          var(--bim-ui_bg-contrast-20)
        );
        --bim-input--olw: 2px;
        --bim-input--olc: transparent;
        --bim-input--bdrs: var(--bim-ui_size-4xs);
        flex: 1;
        display: block;
      }

      :host([visible]) {
        --bim-input--olc: var(--bim-ui_accent-base);
      }

      .input {
        --bim-label--fz: var(--bim-drodown--fz, var(--bim-ui_size-xs));
        --bim-label--c: var(--bim-dropdown--c, var(--bim-ui_bg-contrast-100));
        height: 100%;
        display: flex;
        flex: 1;
        overflow: hidden;
        column-gap: 0.25rem;
        outline: none;
        cursor: pointer;
        align-items: center;
        justify-content: space-between;
        padding: 0 0.5rem;
      }

      bim-label {
        pointer-events: none;
      }
    `
];
let V = zi;
_t([
  h({ type: String, reflect: !0 })
], V.prototype, "name", 2);
_t([
  h({ type: String, reflect: !0 })
], V.prototype, "icon", 2);
_t([
  h({ type: String, reflect: !0 })
], V.prototype, "label", 2);
_t([
  h({ type: Boolean, reflect: !0 })
], V.prototype, "multiple", 2);
_t([
  h({ type: Boolean, reflect: !0 })
], V.prototype, "required", 2);
_t([
  h({ type: Boolean, reflect: !0 })
], V.prototype, "vertical", 2);
_t([
  h({ type: Boolean, reflect: !0 })
], V.prototype, "visible", 1);
_t([
  Vt()
], V.prototype, "_value", 2);
var hl = Object.defineProperty, Bs = (i, t, e, s) => {
  for (var n = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(t, e, n) || n);
  return n && hl(t, e, n), n;
};
const ji = class ji extends w {
  constructor() {
    super(...arguments), this.floating = !1, this._layouts = {}, this._updateFunctions = {};
  }
  /**
   * Represents a collection of predefined grid layouts for the Grid component.
   * Each layout is defined by a unique name, a grid template string, and a map of area names to HTMLElement instances or
   * Statefull/Stateless component definitions.
   * The grid template string defines the structure of the grid, and the area names correspond to the grid-area property of the HTMLElement instances.
   * The HTMLElement instances are used to populate the grid with content.
   * @remarks Once defined, the layout is meant to be immutable.
   */
  set layouts(t) {
    this._layouts = t;
    const e = {};
    for (const [s, n] of Object.entries(t))
      for (const r in n.elements)
        e[s] || (e[s] = {}), e[s][r] = (o) => {
          const l = this._updateFunctions[s];
          if (!l)
            return;
          const a = l[r];
          a && a(o);
        };
    this.updateComponent = e;
  }
  get layouts() {
    return this._layouts;
  }
  // private isVerticalArea(area: string) {
  //   const { rows } = this;
  //   const row = rows.find((row) => row.includes(area));
  //   if (!row)
  //     throw new Error(
  //       `${area} wasn't defined in the grid-template of this bim-grid`,
  //     );
  //   const index = rows.indexOf(row);
  //   const abovePanel = index > 0 && rows[index - 1].includes(area);
  //   const belowPanel =
  //     index < rows.length - 1 && rows[index + 1].includes(area);
  //   return abovePanel || belowPanel;
  // }
  getLayoutAreas(t) {
    const { template: e } = t, r = e.split(`
`).map((l) => l.trim()).map((l) => l.split('"')[1]).filter((l) => l !== void 0).flatMap((l) => l.split(/\s+/));
    return [...new Set(r)].filter((l) => l !== "");
  }
  firstUpdated() {
    this._onLayoutChange = new Event("layoutchange");
  }
  render() {
    if (this.layout) {
      if (this._updateFunctions = {}, this.layouts[this.layout]) {
        this.innerHTML = "", this._updateFunctions[this.layout] = {};
        const t = this._updateFunctions[this.layout], e = this.layouts[this.layout], n = this.getLayoutAreas(e).map((r) => {
          const o = e.elements[r];
          if (!o)
            return null;
          if (o instanceof HTMLElement)
            return o.style.gridArea = r, o;
          if ("template" in o) {
            const { template: a, initialState: c } = o, [u, d] = Le.create(a, c);
            return u.style.gridArea = r, t[r] = d, u;
          }
          return Le.create(o);
        }).filter((r) => !!r);
        this.style.gridTemplate = e.template, this.append(...n), this._onLayoutChange && this.dispatchEvent(this._onLayoutChange);
      }
    } else
      this._updateFunctions = {}, this.innerHTML = "", this.style.gridTemplate = "", this._onLayoutChange && this.dispatchEvent(this._onLayoutChange);
    return m`<slot></slot>`;
  }
};
ji.styles = C`
    :host {
      display: grid;
      height: 100%;
      width: 100%;
      overflow: hidden;
      box-sizing: border-box;
    }

    /* :host(:not([layout])) {
      display: none;
    } */

    :host([floating]) {
      --bim-panel--bdrs: var(--bim-ui_size-4xs);
      background-color: transparent;
      padding: 1rem;
      gap: 1rem;
      position: absolute;
      pointer-events: none;
      top: 0px;
      left: 0px;
    }

    :host(:not([floating])) {
      --bim-panel--bdrs: 0;
      background-color: var(--bim-ui_bg-contrast-20);
      gap: 1px;
    }
  `;
let ae = ji;
Bs([
  h({ type: Boolean, reflect: !0 })
], ae.prototype, "floating");
Bs([
  h({ type: String, reflect: !0 })
], ae.prototype, "layout");
const Be = class Be extends w {
  render() {
    return m`
      <iconify-icon .icon=${this.icon} height="none"></iconify-icon>
    `;
  }
};
Be.styles = C`
    :host {
      height: var(--bim-icon--fz, var(--bim-ui_size-sm));
      width: var(--bim-icon--fz, var(--bim-ui_size-sm));
    }

    iconify-icon {
      height: var(--bim-icon--fz, var(--bim-ui_size-sm));
      width: var(--bim-icon--fz, var(--bim-ui_size-sm));
      color: var(--bim-icon--c);
      transition: all 0.15s;
      display: flex;
    }
  `, Be.properties = {
  icon: { type: String }
};
let vi = Be;
var dl = Object.defineProperty, Qe = (i, t, e, s) => {
  for (var n = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(t, e, n) || n);
  return n && dl(t, e, n), n;
};
const Bi = class Bi extends w {
  constructor() {
    super(...arguments), this.vertical = !1, this.onValueChange = new Event("change");
  }
  get value() {
    const t = {};
    for (const e of this.children) {
      const s = e;
      "value" in s ? t[s.name || s.label] = s.value : "checked" in s && (t[s.name || s.label] = s.checked);
    }
    return t;
  }
  set value(t) {
    const e = [...this.children];
    for (const s in t) {
      const n = e.find((l) => {
        const a = l;
        return a.name === s || a.label === s;
      });
      if (!n)
        continue;
      const r = n, o = t[s];
      typeof o == "boolean" ? r.checked = o : r.value = o;
    }
  }
  render() {
    return m`
      <div class="parent">
        ${this.label || this.icon ? m`<bim-label .icon=${this.icon}>${this.label}</bim-label>` : null}
        <div class="input">
          <slot></slot>
        </div>
      </div>
    `;
  }
};
Bi.styles = C`
    :host {
      flex: 1;
      display: block;
    }

    .parent {
      display: flex;
      flex-wrap: wrap;
      column-gap: 1rem;
      row-gap: 0.375rem;
      user-select: none;
      flex: 1;
    }

    :host(:not([vertical])) .parent {
      justify-content: space-between;
    }

    :host([vertical]) .parent {
      flex-direction: column;
    }

    .input {
      overflow: hidden;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      min-height: 1.75rem;
      min-width: 3rem;
      gap: var(--bim-input--g, var(--bim-ui_size-4xs));
      padding: var(--bim-input--p, 0);
      background-color: var(--bim-input--bgc, transparent);
      outline: var(--bim-input--olw, 2px) solid
        var(--bim-input--olc, transparent);
      border-radius: var(--bim-input--bdrs, var(--bim-ui_size-4xs));
      transition: all 0.15s;
    }

    :host(:not([vertical])) .input {
      flex: 1;
      justify-content: flex-end;
    }

    :host(:not([vertical])[label]) .input {
      max-width: fit-content;
    }
  `;
let Ot = Bi;
Qe([
  h({ type: String, reflect: !0 })
], Ot.prototype, "name");
Qe([
  h({ type: String, reflect: !0 })
], Ot.prototype, "label");
Qe([
  h({ type: String, reflect: !0 })
], Ot.prototype, "icon");
Qe([
  h({ type: Boolean, reflect: !0 })
], Ot.prototype, "vertical");
var fl = Object.defineProperty, me = (i, t, e, s) => {
  for (var n = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(t, e, n) || n);
  return n && fl(t, e, n), n;
};
const Ni = class Ni extends w {
  constructor() {
    super(...arguments), this.labelHidden = !1, this.iconHidden = !1, this.vertical = !1;
  }
  get value() {
    return this.textContent ? We(this.textContent) : this.textContent;
  }
  render() {
    return m`
      <div class="parent" .title=${this.textContent ?? ""}>
        ${this.img ? m`<img .src=${this.img} .alt=${this.textContent || ""} />` : null}
        ${!this.iconHidden && this.icon ? m`<bim-icon .icon=${this.icon}></bim-icon>` : null}
        <p><slot></slot></p>
      </div>
    `;
  }
};
Ni.styles = C`
    :host {
      --bim-icon--c: var(--bim-label--c);
      color: var(--bim-label--c, var(--bim-ui_bg-contrast-60));
      font-size: var(--bim-label--fz, var(--bim-ui_size-xs));
      overflow: hidden;
      display: block;
      white-space: nowrap;
      line-height: 1.1em;
      transition: all 0.15s;
    }

    .parent {
      display: flex;
      align-items: center;
      column-gap: 0.25rem;
      row-gap: 0.125rem;
      user-select: text;
      height: 100%;
    }

    :host([vertical]) .parent {
      flex-direction: column;
    }

    .parent p {
      margin: 0;
      text-overflow: ellipsis;
      overflow: hidden;
      display: flex;
      align-items: center;
      gap: 0.125rem;
    }

    :host([label-hidden]) .parent p,
    :host(:empty) .parent p {
      display: none;
    }

    img {
      height: 100%;
      aspect-ratio: 1;
      border-radius: 100%;
      margin-right: 0.125rem;
    }

    :host(:not([vertical])) img {
      max-height: var(
        --bim-label_icon--sz,
        calc(var(--bim-label--fz, var(--bim-ui_size-xs)) * 1.8)
      );
    }

    :host([vertical]) img {
      max-height: var(
        --bim-label_icon--sz,
        calc(var(--bim-label--fz, var(--bim-ui_size-xs)) * 4)
      );
    }
  `;
let ft = Ni;
me([
  h({ type: String, reflect: !0 })
], ft.prototype, "img");
me([
  h({ type: Boolean, attribute: "label-hidden", reflect: !0 })
], ft.prototype, "labelHidden");
me([
  h({ type: String, reflect: !0 })
], ft.prototype, "icon");
me([
  h({ type: Boolean, attribute: "icon-hidden", reflect: !0 })
], ft.prototype, "iconHidden");
me([
  h({ type: Boolean, reflect: !0 })
], ft.prototype, "vertical");
var pl = Object.defineProperty, ml = Object.getOwnPropertyDescriptor, H = (i, t, e, s) => {
  for (var n = s > 1 ? void 0 : s ? ml(t, e) : t, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = (s ? o(t, e, n) : o(n)) || n);
  return s && n && pl(t, e, n), n;
};
const Hi = class Hi extends w {
  constructor() {
    super(...arguments), this._value = 0, this.vertical = !1, this.slider = !1, this._input = Nt(), this.onValueChange = new Event("change");
  }
  set value(t) {
    this.setValue(t.toString());
  }
  get value() {
    return this._value;
  }
  onChange(t) {
    t.stopPropagation();
    const { value: e } = this._input;
    e && this.setValue(e.value);
  }
  setValue(t) {
    const { value: e } = this._input;
    let s = t;
    if (s = s.replace(/[^0-9.-]/g, ""), s = s.replace(/(\..*)\./g, "$1"), s.endsWith(".") || (s.lastIndexOf("-") > 0 && (s = s[0] + s.substring(1).replace(/-/g, "")), s === "-" || s === "-0"))
      return;
    let n = Number(s);
    Number.isNaN(n) || (n = this.min !== void 0 ? Math.max(n, this.min) : n, n = this.max !== void 0 ? Math.min(n, this.max) : n, this.value !== n && (this._value = n, e && (e.value = this.value.toString()), this.requestUpdate(), this.dispatchEvent(this.onValueChange)));
  }
  onBlur() {
    const { value: t } = this._input;
    t && Number.isNaN(Number(t.value)) && (t.value = this.value.toString());
  }
  onSliderMouseDown(t) {
    document.body.style.cursor = "w-resize";
    const { clientX: e } = t, s = this.value;
    let n = !1;
    const r = (a) => {
      var v;
      n = !0;
      const { clientX: c } = a, u = this.step ?? 1, d = ((v = u.toString().split(".")[1]) == null ? void 0 : v.length) || 0, f = 1 / (this.sensitivity ?? 1), p = (c - e) / f;
      if (Math.floor(Math.abs(p)) !== Math.abs(p))
        return;
      const b = s + p * u;
      this.setValue(b.toFixed(d));
    }, o = () => {
      this.slider = !0, this.removeEventListener("blur", o);
    }, l = () => {
      document.removeEventListener("mousemove", r), document.body.style.cursor = "default", n ? n = !1 : (this.addEventListener("blur", o), this.slider = !1, requestAnimationFrame(() => this.focus())), document.removeEventListener("mouseup", l);
    };
    document.addEventListener("mousemove", r), document.addEventListener("mouseup", l);
  }
  onFocus(t) {
    t.stopPropagation();
    const e = (s) => {
      s.key === "Escape" && (this.blur(), window.removeEventListener("keydown", e));
    };
    window.addEventListener("keydown", e);
  }
  connectedCallback() {
    super.connectedCallback(), this.min && this.min > this.value && (this._value = this.min), this.max && this.max < this.value && (this._value = this.max);
  }
  /**
   * Sets focus to the input element of the number input component.
   * This method is useful for programmatically focusing the input element, for example,
   * in response to a user action or to emphasize the input in the UI.
   *
   * If the input element reference is not available (not yet rendered or disconnected),
   * this method will do nothing.
   */
  focus() {
    const { value: t } = this._input;
    t && t.focus();
  }
  render() {
    const t = m`
      ${this.pref || this.icon ? m`<bim-label
            style="pointer-events: auto"
            @mousedown=${this.onSliderMouseDown}
            .icon=${this.icon}
            >${this.pref}</bim-label
          >` : null}
      <input
        ${Ht(this._input)}
        type="text"
        aria-label=${this.label || this.name || "Number Input"}
        size="1"
        @input=${(l) => l.stopPropagation()}
        @change=${this.onChange}
        @blur=${this.onBlur}
        @focus=${this.onFocus}
        .value=${this.value.toString()}
      />
      ${this.suffix ? m`<bim-label
            style="pointer-events: auto"
            @mousedown=${this.onSliderMouseDown}
            >${this.suffix}</bim-label
          >` : null}
    `, e = this.min ?? -1 / 0, s = this.max ?? 1 / 0, n = 100 * (this.value - e) / (s - e), r = m`
      <style>
        .slider-indicator {
          width: ${`${n}%`};
        }
      </style>
      <div class="slider" @mousedown=${this.onSliderMouseDown}>
        <div class="slider-indicator"></div>
        ${this.pref || this.icon ? m`<bim-label
              style="z-index: 1; margin-right: 0.125rem"
              .icon=${this.icon}
              >${`${this.pref}: `}</bim-label
            >` : null}
        <bim-label style="z-index: 1;">${this.value}</bim-label>
        ${this.suffix ? m`<bim-label style="z-index: 1;">${this.suffix}</bim-label>` : null}
      </div>
    `, o = `${this.label || this.name || this.pref ? `${this.label || this.name || this.pref}: ` : ""}${this.value}${this.suffix ?? ""}`;
    return m`
      <bim-input
        title=${o}
        .label=${this.label}
        .icon=${this.icon}
        .vertical=${this.vertical}
      >
        ${this.slider ? r : t}
      </bim-input>
    `;
  }
};
Hi.styles = C`
    :host {
      --bim-input--bgc: var(
        --bim-number-input--bgc,
        var(--bim-ui_bg-contrast-20)
      );
      --bim-input--olw: var(--bim-number-input--olw, 2px);
      --bim-input--olc: var(--bim-number-input--olc, transparent);
      --bim-input--bdrs: var(--bim-number-input--bdrs, var(--bim-ui_size-4xs));
      --bim-input--p: 0 0.375rem;
      flex: 1;
      display: block;
    }

    :host(:focus) {
      --bim-input--olw: var(--bim-number-input--olw, 2px);
      --bim-input--olc: var(
        --bim-number-input¡focus--c,
        var(--bim-ui_accent-base)
      );
    }

    :host(:not([slider])) bim-label {
      --bim-label--c: var(
        --bim-number-input_affixes--c,
        var(--bim-ui_bg-contrast-60)
      );
      --bim-label--fz: var(
        --bim-number-input_affixes--fz,
        var(--bim-ui_size-xs)
      );
    }

    p {
      margin: 0;
      padding: 0;
    }

    input {
      background-color: transparent;
      outline: none;
      border: none;
      padding: 0;
      flex-grow: 1;
      text-align: right;
      font-family: inherit;
      font-feature-settings: inherit;
      font-variation-settings: inherit;
      font-size: var(--bim-number-input--fz, var(--bim-ui_size-xs));
      color: var(--bim-number-input--c, var(--bim-ui_bg-contrast-100));
    }

    :host([suffix]:not([pref])) input {
      text-align: left;
    }

    :host([slider]) {
      --bim-input--p: 0;
    }

    :host([slider]) .slider {
      --bim-label--c: var(--bim-ui_bg-contrast-100);
    }

    .slider {
      position: relative;
      display: flex;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding: 0 0.5rem;
    }

    .slider-indicator {
      height: 100%;
      background-color: var(--bim-ui_main-base);
      position: absolute;
      top: 0;
      left: 0;
      border-radius: var(--bim-input--bdrs, var(--bim-ui_size-4xs));
    }

    bim-input {
      display: flex;
    }

    bim-label {
      pointer-events: none;
    }
  `;
let R = Hi;
H([
  h({ type: String, reflect: !0 })
], R.prototype, "name", 2);
H([
  h({ type: String, reflect: !0 })
], R.prototype, "icon", 2);
H([
  h({ type: String, reflect: !0 })
], R.prototype, "label", 2);
H([
  h({ type: String, reflect: !0 })
], R.prototype, "pref", 2);
H([
  h({ type: Number, reflect: !0 })
], R.prototype, "min", 2);
H([
  h({ type: Number, reflect: !0 })
], R.prototype, "value", 1);
H([
  h({ type: Number, reflect: !0 })
], R.prototype, "step", 2);
H([
  h({ type: Number, reflect: !0 })
], R.prototype, "sensitivity", 2);
H([
  h({ type: Number, reflect: !0 })
], R.prototype, "max", 2);
H([
  h({ type: String, reflect: !0 })
], R.prototype, "suffix", 2);
H([
  h({ type: Boolean, reflect: !0 })
], R.prototype, "vertical", 2);
H([
  h({ type: Boolean, reflect: !0 })
], R.prototype, "slider", 2);
var bl = Object.defineProperty, gl = Object.getOwnPropertyDescriptor, be = (i, t, e, s) => {
  for (var n = s > 1 ? void 0 : s ? gl(t, e) : t, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = (s ? o(t, e, n) : o(n)) || n);
  return s && n && bl(t, e, n), n;
};
const Di = class Di extends w {
  constructor() {
    super(...arguments), this.onValueChange = new Event("change"), this._hidden = !1, this.headerHidden = !1, this.valueTransform = {}, this.activationButton = document.createElement("bim-button");
  }
  set hidden(t) {
    this._hidden = t, this.activationButton.active = !t, this.dispatchEvent(new Event("hiddenchange"));
  }
  get hidden() {
    return this._hidden;
  }
  /**
   * The `value` getter computes and returns the current state of the panel's form elements as an object. This property is dynamic and reflects the current input values within the panel. When accessed, it traverses the panel's child elements, collecting values from those that have a `name` or `label` attribute, and constructs an object where each key corresponds to the `name` or `label` of the element, and the value is the element's value. This property is particularly useful for forms or interactive panels where the user's input needs to be retrieved programmatically. The value returned is a snapshot of the panel's state at the time of access, and it does not maintain a live link to the input elements.
   *
   * @default {}
   * @example <bim-panel></bim-panel> <!-- Access via JavaScript to get value -->
   * @example
   * const panel = document.createElement('bim-panel');
   * document.body.appendChild(panel);
   * console.log(panel.value); // Logs the current value object of the panel
   */
  get value() {
    return Ie(this, this.valueTransform);
  }
  /**
   * The `value` setter allows programmatically updating the values of the panel's form elements. When a data object is passed to this property, it attempts to match the object's keys with the `name` or `label` attributes of the panel's child elements. If a match is found, the corresponding element's value is updated to the value associated with the key in the data object. This property is useful for initializing the panel with specific data or updating its state based on external inputs. Note that this operation does not affect elements without a matching `name` or `label`, and it only updates the values of elements that are direct children of the panel.
   *
   * @type {Record<string, any>}
   * @example <bim-panel></bim-panel> <!-- Set value via JavaScript -->
   * @example
   * const panel = document.createElement('bim-panel');
   * document.body.appendChild(panel);
   * panel.value = { 'input-name': 'John Doe', 'checkbox-name': true };
   */
  set value(t) {
    const e = [...this.children];
    for (const s in t) {
      const n = e.find((o) => {
        const l = o;
        return l.name === s || l.label === s;
      });
      if (!n)
        continue;
      const r = n;
      r.value = t[s];
    }
  }
  connectedCallback() {
    super.connectedCallback(), this.activationButton.active = !this.hidden, this.activationButton.onclick = () => this.hidden = !this.hidden;
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.activationButton.remove();
  }
  /**
   * Collapses all `bim-panel-section` elements within the panel.
   * This method iterates over each `bim-panel-section` found within the panel's DOM and sets their `collapsed` property to `true`,
   * effectively hiding their content from view. This can be used to programmatically minimize the space taken up by sections
   * within the panel, making the panel more compact or to hide details that are not immediately necessary.
   */
  collapseSections() {
    const t = this.querySelectorAll("bim-panel-section");
    for (const e of t)
      e.collapsed = !0;
  }
  /**
   * Expands all `bim-panel-section` elements within the panel.
   * This method iterates over each `bim-panel-section` found within the panel's DOM and sets their `collapsed` property to `false`,
   * effectively showing their content. This can be used to programmatically reveal the content of sections within the panel,
   * making the panel more informative or to display details that are necessary for the user.
   */
  expandSections() {
    const t = this.querySelectorAll("bim-panel-section");
    for (const e of t)
      e.collapsed = !1;
  }
  render() {
    return this.activationButton.icon = this.icon, this.activationButton.label = this.label || this.name, this.activationButton.tooltipTitle = this.label || this.name, m`
      <div class="parent">
        ${this.label || this.name || this.icon ? m`<bim-label .icon=${this.icon}>${this.label}</bim-label>` : null}
        <div class="sections">
          <slot></slot>
        </div>
      </div>
    `;
  }
};
Di.styles = [
  vt.scrollbar,
  C`
      :host {
        display: flex;
        border-radius: var(--bim-ui_size-base);
        background-color: var(--bim-ui_bg-base);
        overflow: auto;
      }

      :host([hidden]) {
        display: none;
      }

      .parent {
        display: flex;
        flex: 1;
        flex-direction: column;
        pointer-events: auto;
        overflow: auto;
      }

      .parent bim-label {
        --bim-label--c: var(--bim-panel--c, var(--bim-ui_bg-contrast-80));
        --bim-label--fz: var(--bim-panel--fz, var(--bim-ui_size-sm));
        font-weight: 600;
        padding: 1rem;
        flex-shrink: 0;
        border-bottom: 1px solid var(--bim-ui_bg-contrast-20);
      }

      :host([header-hidden]) .parent bim-label {
        display: none;
      }

      .sections {
        display: flex;
        flex-direction: column;
        overflow: auto;
      }

      ::slotted(bim-panel-section:not(:last-child)) {
        border-bottom: 1px solid var(--bim-ui_bg-contrast-20);
      }
    `
];
let tt = Di;
be([
  h({ type: String, reflect: !0 })
], tt.prototype, "icon", 2);
be([
  h({ type: String, reflect: !0 })
], tt.prototype, "name", 2);
be([
  h({ type: String, reflect: !0 })
], tt.prototype, "label", 2);
be([
  h({ type: Boolean, reflect: !0 })
], tt.prototype, "hidden", 1);
be([
  h({ type: Boolean, attribute: "header-hidden", reflect: !0 })
], tt.prototype, "headerHidden", 2);
var vl = Object.defineProperty, ge = (i, t, e, s) => {
  for (var n = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(t, e, n) || n);
  return n && vl(t, e, n), n;
};
const Fi = class Fi extends w {
  constructor() {
    super(...arguments), this.onValueChange = new Event("change"), this.valueTransform = {};
  }
  /**
   * The `value` getter computes and returns the current state of the panel section's form elements as an object. This object's keys are the `name` or `label` attributes of the child elements, and the values are the corresponding values of these elements. This property is particularly useful for retrieving a consolidated view of the user's input or selections within the panel section. When the value of any child element changes, the returned object from this getter will reflect those changes, providing a dynamic snapshot of the panel section's state. Note that this property does not have a default value as it dynamically reflects the current state of the panel section's form elements.
   * @example <bim-panel-section></bim-panel-section> <!-- Usage in HTML not directly applicable as this is a getter -->
   * @example
   * const section = document.createElement('bim-panel-section');
   * console.log(section.value); // Logs the current value object
   */
  get value() {
    const t = this.parentElement;
    let e;
    return t instanceof tt && (e = t.valueTransform), Object.values(this.valueTransform).length !== 0 && (e = this.valueTransform), Ie(this, e);
  }
  /**
   * The `value` setter allows programmatically updating the values of the panel section's child elements. It accepts an object where keys correspond to the `name` or `label` attributes of the child elements, and the values are the new values to be set for these elements. This property is useful for initializing the panel section with specific values or updating its state based on external data. When the property changes, the corresponding child elements' values are updated to reflect the new state. This does not have a default value as it is a method for updating child elements' values.
   * @type {Record<string, any>}
   * @default undefined
   * @example <bim-panel-section></bim-panel-section> <!-- Usage in HTML not directly applicable as this is a setter -->
   * @example
   * const section = document.createElement('bim-panel-section');
   * section.value = { 'user-settings': 'John Doe' }; // Programmatically sets the value of a child element named 'user-settings'
   */
  set value(t) {
    const e = [...this.children];
    for (const s in t) {
      const n = e.find((o) => {
        const l = o;
        return l.name === s || l.label === s;
      });
      if (!n)
        continue;
      const r = n;
      r.value = t[s];
    }
  }
  onHeaderClick() {
    this.fixed || (this.collapsed = !this.collapsed);
  }
  render() {
    const t = this.label || this.icon || this.name || this.fixed, e = m`<svg
      xmlns="http://www.w3.org/2000/svg"
      height="1.125rem"
      viewBox="0 0 24 24"
      width="1.125rem"
    >
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
    </svg>`, s = m`<svg
      xmlns="http://www.w3.org/2000/svg"
      height="1.125rem"
      viewBox="0 0 24 24"
      width="1.125rem"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" />
    </svg>`, n = this.collapsed ? e : s, r = m`
      <div
        class="header"
        title=${this.label ?? ""}
        @click=${this.onHeaderClick}
      >
        ${this.label || this.icon || this.name ? m`<bim-label .icon=${this.icon}>${this.label}</bim-label>` : null}
        ${this.fixed ? null : n}
      </div>
    `;
    return m`
      <div class="parent">
        ${t ? r : null}
        <div class="components">
          <slot></slot>
        </div>
      </div>
    `;
  }
};
Fi.styles = [
  vt.scrollbar,
  C`
      :host {
        display: block;
        pointer-events: auto;
      }

      :host(:not([fixed])) .header:hover {
        --bim-label--c: var(--bim-ui_accent-base);
        color: var(--bim-ui_accent-base);
        cursor: pointer;
      }

      :host(:not([fixed])) .header:hover svg {
        fill: var(--bim-ui_accent-base);
      }

      .header {
        --bim-label--fz: var(--bim-ui_size-sm);
        --bim-label--c: var(--bim-ui_bg-contrast-80);
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
        height: 1.5rem;
        padding: 0.75rem 1rem;
      }

      .header svg {
        fill: var(--bim-ui_bg-contrast-80);
      }

      .title {
        display: flex;
        align-items: center;
        column-gap: 0.5rem;
      }

      .title p {
        font-size: var(--bim-ui_size-sm);
      }

      .components {
        display: flex;
        flex-direction: column;
        row-gap: 0.75rem;
        padding: 0.125rem 1rem 1rem;
      }

      :host(:not([fixed])[collapsed]) .components {
        display: none;
        height: 0px;
      }

      bim-label {
        pointer-events: none;
      }
    `
];
let pt = Fi;
ge([
  h({ type: String, reflect: !0 })
], pt.prototype, "icon");
ge([
  h({ type: String, reflect: !0 })
], pt.prototype, "label");
ge([
  h({ type: String, reflect: !0 })
], pt.prototype, "name");
ge([
  h({ type: Boolean, reflect: !0 })
], pt.prototype, "fixed");
ge([
  h({ type: Boolean, reflect: !0 })
], pt.prototype, "collapsed");
var yl = Object.defineProperty, ve = (i, t, e, s) => {
  for (var n = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(t, e, n) || n);
  return n && yl(t, e, n), n;
};
const Vi = class Vi extends w {
  constructor() {
    super(...arguments), this.vertical = !1, this.onValueChange = new Event("change"), this._canEmitEvents = !1, this._value = document.createElement("bim-option"), this.onOptionClick = (t) => {
      this._value = t.target, this.dispatchEvent(this.onValueChange);
      for (const e of this.children)
        e instanceof T && (e.checked = e === t.target);
    };
  }
  get _options() {
    return [...this.querySelectorAll("bim-option")];
  }
  /**
   * Sets the value of the selector.
   * It finds the matching option based on the provided value and sets it as the selected option.
   * If no matching option is found, it does nothing.
   *
   * @param value - The value to set for the selector.
   */
  set value(t) {
    const e = this.findOption(t);
    if (e) {
      for (const s of this._options)
        s.checked = s === e;
      this._value = e, this._canEmitEvents && this.dispatchEvent(this.onValueChange);
    }
  }
  get value() {
    return this._value.value;
  }
  onSlotChange(t) {
    const e = t.target.assignedElements();
    for (const s of e)
      s instanceof T && (s.noMark = !0, s.removeEventListener("click", this.onOptionClick), s.addEventListener("click", this.onOptionClick));
  }
  findOption(t) {
    return this._options.find((s) => s instanceof T ? s.label === t || s.value === t : !1);
  }
  firstUpdated() {
    const t = [...this.children].find(
      (e) => e instanceof T && e.checked
    );
    t && (this._value = t);
  }
  render() {
    return m`
      <bim-input
        .vertical=${this.vertical}
        .label=${this.label}
        .icon=${this.icon}
      >
        <slot @slotchange=${this.onSlotChange}></slot>
      </bim-input>
    `;
  }
};
Vi.styles = C`
    :host {
      --bim-input--bgc: var(--bim-ui_bg-contrast-20);
      --bim-input--g: 0;
      --bim-option--jc: center;
      flex: 1;
      display: block;
    }

    ::slotted(bim-option) {
      border-radius: 0;
    }

    ::slotted(bim-option[checked]) {
      --bim-label--c: var(--bim-ui_main-contrast);
      background-color: var(--bim-ui_main-base);
    }
  `;
let mt = Vi;
ve([
  h({ type: String, reflect: !0 })
], mt.prototype, "name");
ve([
  h({ type: String, reflect: !0 })
], mt.prototype, "icon");
ve([
  h({ type: String, reflect: !0 })
], mt.prototype, "label");
ve([
  h({ type: Boolean, reflect: !0 })
], mt.prototype, "vertical");
ve([
  Vt()
], mt.prototype, "_value");
const _l = () => m`
    <style>
      div {
        display: flex;
        gap: 0.375rem;
        border-radius: 0.25rem;
        min-height: 1.25rem;
      }

      [data-type="row"] {
        background-color: var(--bim-ui_bg-contrast-10);
        animation: row-loading 1s linear infinite alternate;
        padding: 0.5rem;
      }

      [data-type="cell"] {
        background-color: var(--bim-ui_bg-contrast-20);
        flex: 0.25;
      }

      @keyframes row-loading {
        0% {
          background-color: var(--bim-ui_bg-contrast-10);
        }
        100% {
          background-color: var(--bim-ui_bg-contrast-20);
        }
      }
    </style>
    <div style="display: flex; flex-direction: column;">
      <div data-type="row" style="gap: 2rem">
        <div data-type="cell" style="flex: 1"></div>
        <div data-type="cell" style="flex: 2"></div>
        <div data-type="cell" style="flex: 1"></div>
        <div data-type="cell" style="flex: 0.5"></div>
      </div>
      <div style="display: flex;">
        <div data-type="row" style="flex: 1">
          <div data-type="cell" style="flex: 0.5"></div>
        </div>
        <div data-type="row" style="flex: 2">
          <div data-type="cell" style="flex: 0.75"></div>
        </div>
        <div data-type="row" style="flex: 1">
          <div data-type="cell"></div>
        </div>
        <div data-type="row" style="flex: 0.5">
          <div data-type="cell" style="flex: 0.75"></div>
        </div>
      </div>
      <div style="display: flex;">
        <div data-type="row" style="flex: 1">
          <div data-type="cell" style="flex: 0.75"></div>
        </div>
        <div data-type="row" style="flex: 2">
          <div data-type="cell"></div>
        </div>
        <div data-type="row" style="flex: 1">
          <div data-type="cell" style="flex: 0.5"></div>
        </div>
        <div data-type="row" style="flex: 0.5">
          <div data-type="cell" style="flex: 0.5"></div>
        </div>
      </div>
      <div style="display: flex;">
        <div data-type="row" style="flex: 1">
          <div data-type="cell"></div>
        </div>
        <div data-type="row" style="flex: 2">
          <div data-type="cell" style="flex: 0.5"></div>
        </div>
        <div data-type="row" style="flex: 1">
          <div data-type="cell" style="flex: 0.75"></div>
        </div>
        <div data-type="row" style="flex: 0.5">
          <div data-type="cell" style="flex: 0.7s5"></div>
        </div>
      </div>
    </div>
  `, xl = () => m`
    <style>
      .loader {
        grid-area: Processing;
        position: relative;
        padding: 0.125rem;
      }
      .loader:before {
        content: "";
        position: absolute;
      }
      .loader .loaderBar {
        position: absolute;
        top: 0;
        right: 100%;
        bottom: 0;
        left: 0;
        background: var(--bim-ui_main-base);
        /* width: 25%; */
        width: 0;
        animation: borealisBar 2s linear infinite;
      }

      @keyframes borealisBar {
        0% {
          left: 0%;
          right: 100%;
          width: 0%;
        }
        10% {
          left: 0%;
          right: 75%;
          width: 25%;
        }
        90% {
          right: 0%;
          left: 75%;
          width: 25%;
        }
        100% {
          left: 100%;
          right: 0%;
          width: 0%;
        }
      }
    </style>
    <div class="loader">
      <div class="loaderBar"></div>
    </div>
  `;
var wl = Object.defineProperty, $l = (i, t, e, s) => {
  for (var n = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(t, e, n) || n);
  return n && wl(t, e, n), n;
};
const Ui = class Ui extends w {
  constructor() {
    super(...arguments), this.column = "", this.columnIndex = 0, this.rowData = {};
  }
  get data() {
    return this.column ? this.rowData[this.column] : null;
  }
  render() {
    return m`
      <style>
        :host {
          grid-area: ${this.column ?? "unset"};
        }
      </style>
      <slot></slot>
    `;
  }
};
Ui.styles = C`
    :host {
      padding: 0.375rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    :host([data-column-index="0"]) {
      justify-content: normal;
    }

    :host([data-column-index="0"]:not([data-cell-header]))
      ::slotted(bim-label) {
      text-align: left;
    }

    ::slotted(*) {
      --bim-input--bgc: transparent;
      --bim-input--olc: var(--bim-ui_bg-contrast-20);
      --bim-input--olw: 1px;
    }

    ::slotted(bim-input) {
      --bim-input--olw: 0;
    }

    ::slotted(bim-label) {
      white-space: normal;
      text-align: center;
    }
  `;
let Re = Ui;
$l([
  h({ type: String, reflect: !0 })
], Re.prototype, "column");
var Cl = Object.defineProperty, El = (i, t, e, s) => {
  for (var n = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(t, e, n) || n);
  return n && Cl(t, e, n), n;
};
const qi = class qi extends w {
  constructor() {
    super(...arguments), this._groups = [], this.data = [], this.table = this.closest("bim-table");
  }
  toggleGroups(t, e = !1) {
    for (const s of this._groups)
      s.childrenHidden = typeof t > "u" ? !s.childrenHidden : !t, e && s.toggleChildren(t, e);
  }
  render() {
    return this._groups = [], m`
      <slot></slot>
      ${this.data.map((t) => {
      const e = document.createElement(
        "bim-table-group"
      );
      return this._groups.push(e), e.table = this.table, e.data = t, e;
    })}
    `;
  }
};
qi.styles = C`
    :host {
      --bim-button--bgc: transparent;
      position: relative;
      grid-area: Children;
    }

    :host([hidden]) {
      display: none;
    }

    ::slotted(.branch.branch-vertical) {
      top: 0;
      bottom: 1.125rem;
    }
  `;
let Me = qi;
El([
  h({ type: Array, attribute: !1 })
], Me.prototype, "data");
var Sl = Object.defineProperty, Al = (i, t, e, s) => {
  for (var n = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(t, e, n) || n);
  return n && Sl(t, e, n), n;
};
const Wi = class Wi extends w {
  constructor() {
    super(...arguments), this.data = { data: {} }, this.childrenHidden = !0, this.table = this.closest("bim-table");
  }
  connectedCallback() {
    super.connectedCallback(), this.table && this.table.expanded ? this.childrenHidden = !1 : this.childrenHidden = !0;
  }
  toggleChildren(t, e = !1) {
    this._children && (this.childrenHidden = typeof t > "u" ? !this.childrenHidden : !t, e && this._children.toggleGroups(t, e));
  }
  render() {
    if (!this.table)
      throw new Error("TableGroup: parent table wasn't found!");
    const t = this.table.getGroupIndentation(this.data) ?? 0, e = m`
      ${this.table.noIndentation ? null : m`
            <style>
              .branch-vertical {
                left: ${t + (this.table.selectableRows ? 1.9375 : 0.5625)}rem;
              }
            </style>
            <div class="branch branch-vertical"></div>
          `}
    `, s = document.createDocumentFragment();
    Bt(e, s);
    let n = null;
    this.table.noIndentation || (n = document.createElement("div"), n.classList.add("branch", "branch-horizontal"), n.style.left = `${t - 1 + (this.table.selectableRows ? 2.05 : 0.5625)}rem`);
    let r = null;
    if (!this.table.noIndentation) {
      const a = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      a.setAttribute("height", "9.5"), a.setAttribute("width", "7.5"), a.setAttribute("viewBox", "0 0 4.6666672 7.3333333");
      const c = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      c.setAttribute(
        "d",
        "m 1.7470835,6.9583848 2.5899999,-2.59 c 0.39,-0.39 0.39,-1.02 0,-1.41 L 1.7470835,0.36838483 c -0.63,-0.62000003 -1.71000005,-0.18 -1.71000005,0.70999997 v 5.17 c 0,0.9 1.08000005,1.34 1.71000005,0.71 z"
      ), a.append(c);
      const u = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      u.setAttribute("height", "6.5"), u.setAttribute("width", "9.5"), u.setAttribute("viewBox", "0 0 5.9111118 5.0175439");
      const d = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      d.setAttribute(
        "d",
        "M -0.33616196,1.922522 2.253838,4.5125219 c 0.39,0.39 1.02,0.39 1.41,0 L 6.2538379,1.922522 c 0.6200001,-0.63 0.18,-1.71000007 -0.7099999,-1.71000007 H 0.37383804 c -0.89999997,0 -1.33999997,1.08000007 -0.71,1.71000007 z"
      ), u.append(d), r = document.createElement("div"), r.addEventListener("click", (f) => {
        f.stopPropagation(), this.toggleChildren();
      }), r.classList.add("caret"), r.style.left = `${(this.table.selectableRows ? 1.5 : 0.125) + t}rem`, this.childrenHidden ? r.append(a) : r.append(u);
    }
    const o = document.createElement("bim-table-row");
    this.data.children && !this.childrenHidden && o.append(s), o.table = this.table, o.data = this.data.data, this.table.dispatchEvent(
      new CustomEvent("rowcreated", {
        detail: { row: o }
      })
    ), r && this.data.children && o.append(r), t !== 0 && (!this.data.children || this.childrenHidden) && n && o.append(n);
    let l;
    if (this.data.children) {
      l = document.createElement(
        "bim-table-children"
      ), this._children = l, l.table = this.table, l.data = this.data.children;
      const a = document.createDocumentFragment();
      Bt(e, a), l.append(a);
    }
    return m`
      <div class="parent">${o} ${this.childrenHidden ? null : l}</div>
    `;
  }
};
Wi.styles = C`
    :host {
      position: relative;
    }

    .parent {
      display: grid;
      grid-template-areas: "Data" "Children";
    }

    .branch {
      position: absolute;
      z-index: 1;
    }

    .branch-vertical {
      border-left: 1px dotted var(--bim-ui_bg-contrast-40);
    }

    .branch-horizontal {
      top: 50%;
      width: 1rem;
      border-bottom: 1px dotted var(--bim-ui_bg-contrast-40);
    }

    .caret {
      position: absolute;
      z-index: 2;
      transform: translateY(-50%) rotate(0deg);
      top: 50%;
      display: flex;
      width: 0.95rem;
      height: 0.95rem;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }

    .caret svg {
      fill: var(--bim-ui_bg-contrast-60);
    }
  `;
let ze = Wi;
Al([
  h({ type: Boolean, attribute: "children-hidden", reflect: !0 })
], ze.prototype, "childrenHidden");
var Ol = Object.defineProperty, qt = (i, t, e, s) => {
  for (var n = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(t, e, n) || n);
  return n && Ol(t, e, n), n;
};
const Qi = class Qi extends w {
  constructor() {
    super(...arguments), this.selected = !1, this.columns = [], this.hiddenColumns = [], this.data = {}, this.isHeader = !1, this.table = this.closest("bim-table"), this.onTableColumnsChange = () => {
      this.table && (this.columns = this.table.columns);
    }, this.onTableColumnsHidden = () => {
      this.table && (this.hiddenColumns = this.table.hiddenColumns);
    }, this._observer = new IntersectionObserver(
      (t) => {
        this._intersecting = t[0].isIntersecting;
      },
      { rootMargin: "36px" }
    );
  }
  get _columnNames() {
    return this.columns.filter(
      (s) => !this.hiddenColumns.includes(s.name)
    ).map((s) => s.name);
  }
  get _columnWidths() {
    return this.columns.filter(
      (s) => !this.hiddenColumns.includes(s.name)
    ).map((s) => s.width);
  }
  get _isSelected() {
    var t;
    return (t = this.table) == null ? void 0 : t.selection.has(this.data);
  }
  onSelectionChange(t) {
    if (!this.table)
      return;
    const e = t.target;
    this.selected = e.value, e.value ? (this.table.selection.add(this.data), this.table.dispatchEvent(
      new CustomEvent("rowselected", {
        detail: {
          data: this.data
        }
      })
    )) : (this.table.selection.delete(this.data), this.table.dispatchEvent(
      new CustomEvent("rowdeselected", {
        detail: {
          data: this.data
        }
      })
    ));
  }
  connectedCallback() {
    super.connectedCallback(), this._observer.observe(this), this.table && (this.columns = this.table.columns, this.hiddenColumns = this.table.hiddenColumns, this.table.addEventListener("columnschange", this.onTableColumnsChange), this.table.addEventListener("columnshidden", this.onTableColumnsHidden), this.toggleAttribute("selected", this._isSelected));
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._observer.unobserve(this), this.table && (this.columns = [], this.hiddenColumns = [], this.table.removeEventListener("columnschange", this.onTableColumnsChange), this.table.removeEventListener("columnshidden", this.onTableColumnsHidden), this.toggleAttribute("selected", !1));
  }
  compute() {
    if (!this.table)
      throw new Error("TableRow: parent table wasn't found!");
    const t = this.table.getRowIndentation(this.data) ?? 0, e = this.isHeader ? this.data : this.table.applyDataTransform(this.data) ?? this.data, s = [];
    for (const n in e) {
      if (this.hiddenColumns.includes(n))
        continue;
      const r = e[n];
      let o;
      if (typeof r == "string" || typeof r == "boolean" || typeof r == "number" ? (o = document.createElement("bim-label"), o.textContent = String(r)) : r instanceof HTMLElement ? o = r : (o = document.createDocumentFragment(), Bt(r, o)), !o)
        continue;
      const l = document.createElement("bim-table-cell");
      l.append(o), l.column = n, this._columnNames.indexOf(n) === 0 && (l.style.marginLeft = `${this.table.noIndentation ? 0 : t + 0.75}rem`);
      const a = this._columnNames.indexOf(n);
      l.setAttribute("data-column-index", String(a)), l.toggleAttribute(
        "data-no-indentation",
        a === 0 && this.table.noIndentation
      ), l.toggleAttribute("data-cell-header", this.isHeader), l.rowData = this.data, this.table.dispatchEvent(
        new CustomEvent("cellcreated", {
          detail: { cell: l }
        })
      ), s.push(l);
    }
    return this.style.gridTemplateAreas = `"${this.table.selectableRows ? "Selection" : ""} ${this._columnNames.join(" ")}"`, this.style.gridTemplateColumns = `${this.table.selectableRows ? "1.6rem" : ""} ${this._columnWidths.join(" ")}`, m`
      ${!this.isHeader && this.table.selectableRows ? m`<bim-checkbox
            @change=${this.onSelectionChange}
            .checked=${this._isSelected}
            style="align-self: center; justify-self: center"
          ></bim-checkbox>` : null}
      ${s}
      <slot></slot>
    `;
  }
  render() {
    return m`${this._intersecting ? this.compute() : m``}`;
  }
};
Qi.styles = C`
    :host {
      position: relative;
      grid-area: Data;
      display: grid;
      min-height: 2.25rem;
      transition: all 0.15s;
    }

    ::slotted(.branch.branch-vertical) {
      top: 50%;
      bottom: 0;
    }

    :host([selected]) {
      background-color: color-mix(
        in lab,
        var(--bim-ui_bg-contrast-20) 30%,
        var(--bim-ui_main-base) 10%
      );
    }
  `;
let et = Qi;
qt([
  h({ type: Boolean, reflect: !0 })
], et.prototype, "selected");
qt([
  h({ attribute: !1 })
], et.prototype, "columns");
qt([
  h({ attribute: !1 })
], et.prototype, "hiddenColumns");
qt([
  h({ attribute: !1 })
], et.prototype, "data");
qt([
  h({ type: Boolean, attribute: "is-header", reflect: !0 })
], et.prototype, "isHeader");
qt([
  Vt()
], et.prototype, "_intersecting");
var kl = Object.defineProperty, Pl = Object.getOwnPropertyDescriptor, q = (i, t, e, s) => {
  for (var n = s > 1 ? void 0 : s ? Pl(t, e) : t, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = (s ? o(t, e, n) : o(n)) || n);
  return s && n && kl(t, e, n), n;
};
const Yi = class Yi extends w {
  constructor() {
    super(...arguments), this._filteredData = [], this.headersHidden = !1, this.minColWidth = "4rem", this._columns = [], this._textDelimiters = {
      comma: ",",
      tab: "	"
    }, this._queryString = null, this._data = [], this.expanded = !1, this.preserveStructureOnFilter = !1, this.indentationInText = !1, this.dataTransform = {}, this.selectableRows = !1, this.selection = /* @__PURE__ */ new Set(), this.noIndentation = !1, this.loading = !1, this._errorLoading = !1, this._onColumnsHidden = new Event("columnshidden"), this._hiddenColumns = [], this._stringFilterFunction = (t, e) => Object.values(e.data).some((n) => String(n).toLowerCase().includes(t.toLowerCase())), this._queryFilterFunction = (t, e) => {
      let s = !1;
      const n = bi(t) ?? [];
      for (const r of n) {
        if ("queries" in r) {
          s = !1;
          break;
        }
        const { condition: o, value: l } = r;
        let { key: a } = r;
        if (a.startsWith("[") && a.endsWith("]")) {
          const c = a.replace("[", "").replace("]", "");
          a = c, s = Object.keys(e.data).filter((f) => f.includes(c)).map(
            (f) => jn(e.data[f], o, l)
          ).some((f) => f);
        } else
          s = jn(e.data[a], o, l);
        if (!s)
          break;
      }
      return s;
    };
  }
  set columns(t) {
    const e = [];
    for (const s of t) {
      const n = typeof s == "string" ? { name: s, width: `minmax(${this.minColWidth}, 1fr)` } : s;
      e.push(n);
    }
    this._columns = e, this.computeMissingColumns(this.data), this.dispatchEvent(new Event("columnschange"));
  }
  get columns() {
    return this._columns;
  }
  get _headerRowData() {
    const t = {};
    for (const e of this.columns) {
      const { name: s } = e;
      t[s] = String(s);
    }
    return t;
  }
  /**
   * Getter for the `value` property.
   * Returns the filtered data if a search string is provided, otherwise returns the original data.
   *
   * @example
   * ```typescript
   * const tableValue = table.value;
   * console.log(tableValue); // Output: The filtered or original data.
   * ```
   */
  get value() {
    return this._filteredData;
  }
  /**
   * Sets the search string for filtering the table data.
   * This property allows you to filter the table data based on a search string.
   * If a search string is provided, the table will only display rows that match the search criteria.
   * The search criteria can be a simple string or a complex query.
   * If a simple string is provided, the table will filter rows based on the string's presence in any column.
   * If a complex query is provided, the table will filter rows based on the query's conditions and values.
   *
   * @example Simple Query
   * ```typescript
   * table.queryString = "example";
   * ```
   *
   * @example Complex Query
   * ```typescript
   * table.queryString = "column1="Jhon Doe" & column2=20";
   * ```
   */
  set queryString(t) {
    this.toggleAttribute("data-processing", !0), this._queryString = t && t.trim() !== "" ? t.trim() : null, this.updateFilteredData(), this.toggleAttribute("data-processing", !1);
  }
  get queryString() {
    return this._queryString;
  }
  set data(t) {
    this._data = t, this.updateFilteredData(), this.computeMissingColumns(t) && (this.columns = this._columns);
  }
  get data() {
    return this._data;
  }
  get dataAsync() {
    return new Promise((t) => {
      setTimeout(() => {
        t(this.data);
      });
    });
  }
  set hiddenColumns(t) {
    this._hiddenColumns = t, setTimeout(() => {
      this.dispatchEvent(this._onColumnsHidden);
    });
  }
  get hiddenColumns() {
    return this._hiddenColumns;
  }
  updateFilteredData() {
    this.queryString ? (bi(this.queryString) ? (this.filterFunction = this._queryFilterFunction, this._filteredData = this.filter(this.queryString)) : (this.filterFunction = this._stringFilterFunction, this._filteredData = this.filter(this.queryString)), this.preserveStructureOnFilter && (this._expandedBeforeFilter === void 0 && (this._expandedBeforeFilter = this.expanded), this.expanded = !0)) : (this.preserveStructureOnFilter && this._expandedBeforeFilter !== void 0 && (this.expanded = this._expandedBeforeFilter, this._expandedBeforeFilter = void 0), this._filteredData = this.data);
  }
  computeMissingColumns(t) {
    let e = !1;
    for (const s of t) {
      const { children: n, data: r } = s;
      for (const o in r)
        this._columns.map((a) => typeof a == "string" ? a : a.name).includes(o) || (this._columns.push({
          name: o,
          width: `minmax(${this.minColWidth}, 1fr)`
        }), e = !0);
      if (n) {
        const o = this.computeMissingColumns(n);
        o && !e && (e = o);
      }
    }
    return e;
  }
  generateText(t = "comma", e = this.value, s = "", n = !0) {
    const r = this._textDelimiters[t];
    let o = "";
    const l = this.columns.map((a) => a.name);
    if (n) {
      this.indentationInText && (o += `Indentation${r}`);
      const a = `${l.join(r)}
`;
      o += a;
    }
    for (const [a, c] of e.entries()) {
      const { data: u, children: d } = c, f = this.indentationInText ? `${s}${a + 1}${r}` : "", p = l.map((v) => u[v] ?? ""), b = `${f}${p.join(r)}
`;
      o += b, d && (o += this.generateText(
        t,
        c.children,
        `${s}${a + 1}.`,
        !1
      ));
    }
    return o;
  }
  /**
   * A getter function that generates a CSV (Comma Separated Values) representation of the table data.
   *
   * @returns A string containing the CSV representation of the table data.
   *
   * @example
   * ```typescript
   * const csvData = table.csv;
   * console.log(csvData); // Output: "Column 1,Column 2\nValue 1,Value 2\nValue 3,Value 4"
   * ```
   */
  get csv() {
    return this.generateText("comma");
  }
  /**
   * A getter function that generates a Tab Separated Values (TSV) representation of the table data.
   *
   * @returns A string containing the TSV representation of the table data.
   *
   * @example
   * ```typescript
   * const tsvData = table.tsv;
   * console.log(tsvData); // Output: "Column 1\tColumn 2\nValue 1\tValue 2\nValue 3\tValue 4"
   * ```
   */
  get tsv() {
    return this.generateText("tab");
  }
  applyDataTransform(t) {
    const e = {};
    for (const n of Object.keys(this.dataTransform)) {
      const r = this.columns.find((o) => o.name === n);
      r && r.forceDataTransform && (n in t || (t[n] = ""));
    }
    const s = t;
    for (const n in s) {
      const r = this.dataTransform[n];
      r ? e[n] = r(s[n], t) : e[n] = t[n];
    }
    return e;
  }
  /**
   * The `downloadData` method is used to download the table data in different formats.
   *
   * @param fileName - The name of the downloaded file. Default is "BIM Table Data".
   * @param format - The format of the downloaded file. Can be "json", "tsv", or "csv". Default is "json".
   *
   * @returns - This method does not return any value.
   *
   * @example
   * ```typescript
   * table.downloadData("MyTableData", "tsv");
   * ```
   */
  downloadData(t = "BIM Table Data", e = "json") {
    let s = null;
    if (e === "json" && (s = new File(
      [JSON.stringify(this.value, void 0, 2)],
      `${t}.json`
    )), e === "csv" && (s = new File([this.csv], `${t}.csv`)), e === "tsv" && (s = new File([this.tsv], `${t}.tsv`)), !s)
      return;
    const n = document.createElement("a");
    n.href = URL.createObjectURL(s), n.download = s.name, n.click(), URL.revokeObjectURL(n.href);
  }
  getRowIndentation(t, e = this.value, s = 0) {
    for (const n of e) {
      if (n.data === t)
        return s;
      if (n.children) {
        const r = this.getRowIndentation(
          t,
          n.children,
          s + 1
        );
        if (r !== null)
          return r;
      }
    }
    return null;
  }
  getGroupIndentation(t, e = this.value, s = 0) {
    for (const n of e) {
      if (n === t)
        return s;
      if (n.children) {
        const r = this.getGroupIndentation(
          t,
          n.children,
          s + 1
        );
        if (r !== null)
          return r;
      }
    }
    return null;
  }
  connectedCallback() {
    super.connectedCallback(), this.dispatchEvent(new Event("connected"));
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.dispatchEvent(new Event("disconnected"));
  }
  /**
   * Asynchronously loads data into the table based on Table.loadFunction.
   * If the data is already available, just set it in Table.data.
   *
   * @param force - A boolean indicating whether to force loading even if the table already has data.
   *
   * @returns - A promise that resolves to a boolean indicating whether the data loading was successful.
   * If the promise resolves to `true`, the data loading was successful.
   * If the promise resolves to `false`, the data loading was not successful.
   *
   * @remarks - If the table already has data and `force` is `false`, the function resolves to `false` without making any changes.
   * If the table already has data and `force` is `true`, the existing data is discarded before loading the new data.
   * If an error occurs during data loading, the function sets the `errorLoadingMessage` property with the error message and resolves to `false`.
   */
  async loadData(t = !1) {
    if (this._filteredData.length !== 0 && !t || !this.loadFunction)
      return !1;
    this.loading = !0;
    try {
      const e = await this.loadFunction();
      return this.data = e, this.loading = !1, this._errorLoading = !1, !0;
    } catch (e) {
      if (this.loading = !1, this._filteredData.length !== 0)
        return !1;
      const s = this.querySelector("[slot='error-loading']"), n = s == null ? void 0 : s.querySelector(
        "[data-table-element='error-message']"
      );
      return e instanceof Error && n && e.message.trim() !== "" && (n.textContent = e.message), this._errorLoading = !0, !1;
    }
  }
  filter(t, e = this.filterFunction ?? this._stringFilterFunction, s = this.data) {
    const n = [];
    for (const r of s)
      if (e(t, r)) {
        if (this.preserveStructureOnFilter) {
          const l = { data: r.data };
          if (r.children) {
            const a = this.filter(
              t,
              e,
              r.children
            );
            a.length && (l.children = a);
          }
          n.push(l);
        } else if (n.push({ data: r.data }), r.children) {
          const l = this.filter(
            t,
            e,
            r.children
          );
          n.push(...l);
        }
      } else if (r.children) {
        const l = this.filter(
          t,
          e,
          r.children
        );
        this.preserveStructureOnFilter && l.length ? n.push({
          data: r.data,
          children: l
        }) : n.push(...l);
      }
    return n;
  }
  get _missingDataElement() {
    return this.querySelector("[slot='missing-data']");
  }
  render() {
    if (this.loading)
      return _l();
    if (this._errorLoading)
      return m`<slot name="error-loading"></slot>`;
    if (this._filteredData.length === 0 && this._missingDataElement)
      return m`<slot name="missing-data"></slot>`;
    const t = document.createElement("bim-table-row");
    t.table = this, t.isHeader = !0, t.data = this._headerRowData, t.style.gridArea = "Header", t.style.position = "sticky", t.style.top = "0", t.style.zIndex = "5";
    const e = document.createElement(
      "bim-table-children"
    );
    return e.table = this, e.data = this.value, e.style.gridArea = "Body", e.style.backgroundColor = "transparent", m`
      <div class="parent">
        ${this.headersHidden ? null : t} ${xl()}
        <div style="overflow-x: hidden; grid-area: Body">${e}</div>
      </div>
    `;
  }
};
Yi.styles = [
  vt.scrollbar,
  C`
      :host {
        position: relative;
        overflow: auto;
        display: block;
        pointer-events: auto;
      }

      :host(:not([data-processing])) .loader {
        display: none;
      }

      .parent {
        display: grid;
        grid-template:
          "Header" auto
          "Processing" auto
          "Body" 1fr
          "Footer" auto;
        overflow: auto;
        height: 100%;
      }

      .parent > bim-table-row[is-header] {
        color: var(--bim-table_header--c, var(--bim-ui_bg-contrast-100));
        background-color: var(
          --bim-table_header--bgc,
          var(--bim-ui_bg-contrast-20)
        );
      }

      .controls {
        display: flex;
        gap: 0.375rem;
        flex-wrap: wrap;
        margin-bottom: 0.5rem;
      }
    `
];
let M = Yi;
q([
  Vt()
], M.prototype, "_filteredData", 2);
q([
  h({
    type: Boolean,
    attribute: "headers-hidden",
    reflect: !0
  })
], M.prototype, "headersHidden", 2);
q([
  h({ type: String, attribute: "min-col-width", reflect: !0 })
], M.prototype, "minColWidth", 2);
q([
  h({ type: Array, attribute: !1 })
], M.prototype, "columns", 1);
q([
  h({ type: Array, attribute: !1 })
], M.prototype, "data", 1);
q([
  h({ type: Boolean, reflect: !0 })
], M.prototype, "expanded", 2);
q([
  h({ type: Boolean, reflect: !0, attribute: "selectable-rows" })
], M.prototype, "selectableRows", 2);
q([
  h({ attribute: !1 })
], M.prototype, "selection", 2);
q([
  h({ type: Boolean, attribute: "no-indentation", reflect: !0 })
], M.prototype, "noIndentation", 2);
q([
  h({ type: Boolean, reflect: !0 })
], M.prototype, "loading", 2);
q([
  Vt()
], M.prototype, "_errorLoading", 2);
var Tl = Object.defineProperty, Ll = Object.getOwnPropertyDescriptor, Wt = (i, t, e, s) => {
  for (var n = s > 1 ? void 0 : s ? Ll(t, e) : t, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = (s ? o(t, e, n) : o(n)) || n);
  return s && n && Tl(t, e, n), n;
};
const Gi = class Gi extends w {
  constructor() {
    super(...arguments), this._switchers = [], this.bottom = !1, this.switchersHidden = !1, this.floating = !1, this.switchersFull = !1, this.onTabHiddenChange = (t) => {
      const e = t.target;
      e instanceof I && !e.hidden && (e.removeEventListener("hiddenchange", this.onTabHiddenChange), this.tab = e.name, e.addEventListener("hiddenchange", this.onTabHiddenChange));
    };
  }
  set tab(t) {
    this._tab = t;
    const e = [...this.children], s = e.find(
      (n) => n instanceof I && n.name === t
    );
    for (const n of e) {
      if (!(n instanceof I))
        continue;
      n.hidden = s !== n;
      const r = this.getTabSwitcher(n.name);
      r && r.toggleAttribute("data-active", !n.hidden);
    }
  }
  get tab() {
    return this._tab;
  }
  getTabSwitcher(t) {
    return this._switchers.find(
      (s) => s.getAttribute("data-name") === t
    );
  }
  createSwitchers() {
    this._switchers = [];
    for (const t of this.children) {
      if (!(t instanceof I))
        continue;
      const e = document.createElement("div");
      e.addEventListener("click", () => {
        this.tab === t.name ? this.toggleAttribute("tab", !1) : this.tab = t.name;
      }), e.setAttribute("data-name", t.name), e.className = "switcher";
      const s = document.createElement("bim-label");
      s.textContent = t.label ?? null, s.icon = t.icon, e.append(s), this._switchers.push(e);
    }
  }
  updateSwitchers() {
    for (const t of this.children) {
      if (!(t instanceof I))
        continue;
      const e = this._switchers.find(
        (n) => n.getAttribute("data-name") === t.name
      );
      if (!e)
        continue;
      const s = e.querySelector("bim-label");
      s && (s.textContent = t.label ?? null, s.icon = t.icon);
    }
  }
  onSlotChange(t) {
    this.createSwitchers();
    const e = t.target.assignedElements(), s = e.find((n) => n instanceof I ? this.tab ? n.name === this.tab : !n.hidden : !1);
    s && s instanceof I && (this.tab = s.name);
    for (const n of e) {
      if (!(n instanceof I)) {
        n.remove();
        continue;
      }
      n.removeEventListener("hiddenchange", this.onTabHiddenChange), s !== n && (n.hidden = !0), n.addEventListener("hiddenchange", this.onTabHiddenChange);
    }
  }
  render() {
    return m`
      <div class="parent">
        <div class="switchers">${this._switchers}</div>
        <div class="content">
          <slot @slotchange=${this.onSlotChange}></slot>
        </div>
      </div>
    `;
  }
};
Gi.styles = [
  vt.scrollbar,
  C`
      * {
        box-sizing: border-box;
      }

      :host {
        background-color: var(--bim-ui_bg-base);
        display: block;
        overflow: auto;
      }

      .parent {
        display: grid;
        grid-template: "switchers" auto "content" 1fr;
        height: 100%;
      }

      :host([bottom]) .parent {
        grid-template: "content" 1fr "switchers" auto;
      }

      .switchers {
        display: flex;
        height: 2.25rem;
        font-weight: 600;
        grid-area: switchers;
      }

      .switcher {
        --bim-label--c: var(--bim-ui_bg-contrast-80);
        background-color: var(--bim-ui_bg-base);
        cursor: pointer;
        pointer-events: auto;
        padding: 0rem 0.75rem;
        display: flex;
        justify-content: center;
        transition: all 0.15s;
      }

      :host([switchers-full]) .switcher {
        flex: 1;
      }

      .switcher:hover,
      .switcher[data-active] {
        --bim-label--c: var(--bim-ui_main-contrast);
        background-color: var(--bim-ui_main-base);
      }

      .switchers bim-label {
        pointer-events: none;
      }

      :host([switchers-hidden]) .switchers {
        display: none;
      }

      .content {
        grid-area: content;
        overflow: auto;
      }

      :host(:not([bottom])) .content {
        border-top: 1px solid var(--bim-ui_bg-contrast-20);
      }

      :host([bottom]) .content {
        border-bottom: 1px solid var(--bim-ui_bg-contrast-20);
      }

      :host(:not([tab])) .content {
        display: none;
      }

      :host([floating]) {
        background-color: transparent;
      }

      :host([floating]) .switchers {
        justify-self: center;
        overflow: auto;
      }

      :host([floating]:not([bottom])) .switchers {
        border-radius: var(--bim-ui_size-2xs) var(--bim-ui_size-2xs) 0 0;
        border-top: 1px solid var(--bim-ui_bg-contrast-20);
        border-left: 1px solid var(--bim-ui_bg-contrast-20);
        border-right: 1px solid var(--bim-ui_bg-contrast-20);
      }

      :host([floating][bottom]) .switchers {
        border-radius: 0 0 var(--bim-ui_size-2xs) var(--bim-ui_size-2xs);
        border-bottom: 1px solid var(--bim-ui_bg-contrast-20);
        border-left: 1px solid var(--bim-ui_bg-contrast-20);
        border-right: 1px solid var(--bim-ui_bg-contrast-20);
      }

      :host([floating]:not([tab])) .switchers {
        border-radius: var(--bim-ui_size-2xs);
        border-bottom: 1px solid var(--bim-ui_bg-contrast-20);
      }

      :host([floating][bottom]:not([tab])) .switchers {
        border-top: 1px solid var(--bim-ui_bg-contrast-20);
      }

      :host([floating]) .content {
        border: 1px solid var(--bim-ui_bg-contrast-20);
        border-radius: var(--bim-ui_size-2xs);
        background-color: var(--bim-ui_bg-base);
      }
    `
];
let X = Gi;
Wt([
  Vt()
], X.prototype, "_switchers", 2);
Wt([
  h({ type: Boolean, reflect: !0 })
], X.prototype, "bottom", 2);
Wt([
  h({ type: Boolean, attribute: "switchers-hidden", reflect: !0 })
], X.prototype, "switchersHidden", 2);
Wt([
  h({ type: Boolean, reflect: !0 })
], X.prototype, "floating", 2);
Wt([
  h({ type: String, reflect: !0 })
], X.prototype, "tab", 1);
Wt([
  h({ type: Boolean, attribute: "switchers-full", reflect: !0 })
], X.prototype, "switchersFull", 2);
var Il = Object.defineProperty, Rl = Object.getOwnPropertyDescriptor, Ye = (i, t, e, s) => {
  for (var n = s > 1 ? void 0 : s ? Rl(t, e) : t, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = (s ? o(t, e, n) : o(n)) || n);
  return s && n && Il(t, e, n), n;
};
const Xi = class Xi extends w {
  constructor() {
    super(...arguments), this._defaultName = "__unnamed__", this.name = this._defaultName, this._hidden = !1;
  }
  set label(t) {
    this._label = t;
    const e = this.parentElement;
    e instanceof X && e.updateSwitchers();
  }
  get label() {
    return this._label;
  }
  set hidden(t) {
    this._hidden = t, this.dispatchEvent(new Event("hiddenchange"));
  }
  get hidden() {
    return this._hidden;
  }
  connectedCallback() {
    super.connectedCallback();
    const { parentElement: t } = this;
    if (t && this.name === this._defaultName) {
      const e = [...t.children].indexOf(this);
      this.name = `${this._defaultName}${e}`;
    }
  }
  render() {
    return m` <slot></slot> `;
  }
};
Xi.styles = C`
    :host {
      display: block;
      height: 100%;
    }

    :host([hidden]) {
      display: none;
    }
  `;
let I = Xi;
Ye([
  h({ type: String, reflect: !0 })
], I.prototype, "name", 2);
Ye([
  h({ type: String, reflect: !0 })
], I.prototype, "label", 1);
Ye([
  h({ type: String, reflect: !0 })
], I.prototype, "icon", 2);
Ye([
  h({ type: Boolean, reflect: !0 })
], I.prototype, "hidden", 1);
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Bn = (i) => i ?? k;
var Ml = Object.defineProperty, zl = Object.getOwnPropertyDescriptor, it = (i, t, e, s) => {
  for (var n = s > 1 ? void 0 : s ? zl(t, e) : t, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = (s ? o(t, e, n) : o(n)) || n);
  return s && n && Ml(t, e, n), n;
};
const Ji = class Ji extends w {
  constructor() {
    super(...arguments), this._inputTypes = [
      "date",
      "datetime-local",
      "email",
      "month",
      "password",
      "search",
      "tel",
      "text",
      "time",
      "url",
      "week",
      "area"
    ], this.value = "", this.vertical = !1, this._type = "text", this.onValueChange = new Event("input");
  }
  set type(t) {
    this._inputTypes.includes(t) && (this._type = t);
  }
  get type() {
    return this._type;
  }
  /**
   * Gets the query value derived from the current input value.
   * The `getQuery` function is assumed to be a utility function that takes a string as input
   * and returns a processed query value based on the input.
   *
   * @returns The processed query value derived from the current input value.
   *
   * @example
   * ```typescript
   * const textInput = new TextInput();
   * textInput.value = "Key?Value";
   * console.log(textInput.query);
   * ```
   */
  get query() {
    return bi(this.value);
  }
  onInputChange(t) {
    t.stopPropagation();
    const e = t.target;
    clearTimeout(this._debounceTimeoutID), this._debounceTimeoutID = setTimeout(() => {
      this.value = e.value, this.dispatchEvent(this.onValueChange);
    }, this.debounce);
  }
  focus() {
    setTimeout(() => {
      var e;
      const t = (e = this.shadowRoot) == null ? void 0 : e.querySelector("input");
      t == null || t.focus();
    });
  }
  render() {
    return m`
      <bim-input
        .name=${this.name}
        .icon=${this.icon}
        .label=${this.label}
        .vertical=${this.vertical}
      >
        ${this.type === "area" ? m` <textarea
              aria-label=${this.label || this.name || "Text Input"}
              .value=${this.value}
              .rows=${this.rows ?? 5}
              placeholder=${Bn(this.placeholder)}
              @input=${this.onInputChange}
            ></textarea>` : m` <input
              aria-label=${this.label || this.name || "Text Input"}
              .type=${this.type}
              .value=${this.value}
              placeholder=${Bn(this.placeholder)}
              @input=${this.onInputChange}
            />`}
      </bim-input>
    `;
  }
};
Ji.styles = [
  vt.scrollbar,
  C`
      :host {
        --bim-input--bgc: var(--bim-ui_bg-contrast-20);
        flex: 1;
        display: block;
      }

      input,
      textarea {
        font-family: inherit;
        background-color: transparent;
        border: none;
        width: 100%;
        padding: var(--bim-ui_size-3xs);
        color: var(--bim-text-input--c, var(--bim-ui_bg-contrast-100));
      }

      input {
        outline: none;
        height: 100%;
        padding: 0 var(--bim-ui_size-3xs); /* Override padding */
        border-radius: var(--bim-text-input--bdrs, var(--bim-ui_size-4xs));
      }

      textarea {
        line-height: 1.1rem;
        resize: vertical;
      }

      :host(:focus) {
        --bim-input--olc: var(--bim-ui_accent-base);
      }

      /* :host([disabled]) {
      --bim-input--bgc: var(--bim-ui_bg-contrast-20);
    } */
    `
];
let B = Ji;
it([
  h({ type: String, reflect: !0 })
], B.prototype, "icon", 2);
it([
  h({ type: String, reflect: !0 })
], B.prototype, "label", 2);
it([
  h({ type: String, reflect: !0 })
], B.prototype, "name", 2);
it([
  h({ type: String, reflect: !0 })
], B.prototype, "placeholder", 2);
it([
  h({ type: String, reflect: !0 })
], B.prototype, "value", 2);
it([
  h({ type: Boolean, reflect: !0 })
], B.prototype, "vertical", 2);
it([
  h({ type: Number, reflect: !0 })
], B.prototype, "debounce", 2);
it([
  h({ type: Number, reflect: !0 })
], B.prototype, "rows", 2);
it([
  h({ type: String, reflect: !0 })
], B.prototype, "type", 1);
var jl = Object.defineProperty, Bl = Object.getOwnPropertyDescriptor, Ns = (i, t, e, s) => {
  for (var n = s > 1 ? void 0 : s ? Bl(t, e) : t, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = (s ? o(t, e, n) : o(n)) || n);
  return s && n && jl(t, e, n), n;
};
const Ki = class Ki extends w {
  constructor() {
    super(...arguments), this.rows = 2, this._vertical = !1;
  }
  set vertical(t) {
    this._vertical = t, this.updateChildren();
  }
  get vertical() {
    return this._vertical;
  }
  updateChildren() {
    const t = this.children;
    for (const e of t)
      this.vertical ? e.setAttribute("label-hidden", "") : e.removeAttribute("label-hidden");
  }
  render() {
    return m`
      <style>
        .parent {
          grid-auto-flow: ${this.vertical ? "row" : "column"};
          grid-template-rows: repeat(${this.rows}, 1fr);
        }
      </style>
      <div class="parent">
        <slot @slotchange=${this.updateChildren}></slot>
      </div>
    `;
  }
};
Ki.styles = C`
    .parent {
      display: grid;
      gap: 0.25rem;
    }

    ::slotted(bim-button[label]:not([vertical])) {
      --bim-button--jc: flex-start;
    }

    ::slotted(bim-button) {
      --bim-label--c: var(--bim-ui_bg-contrast-80);
    }
  `;
let Dt = Ki;
Ns([
  h({ type: Number, reflect: !0 })
], Dt.prototype, "rows", 2);
Ns([
  h({ type: Boolean, reflect: !0 })
], Dt.prototype, "vertical", 1);
var Nl = Object.defineProperty, Hl = Object.getOwnPropertyDescriptor, Ge = (i, t, e, s) => {
  for (var n = s > 1 ? void 0 : s ? Hl(t, e) : t, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = (s ? o(t, e, n) : o(n)) || n);
  return s && n && Nl(t, e, n), n;
};
const Zi = class Zi extends w {
  constructor() {
    super(...arguments), this._vertical = !1, this._labelHidden = !1;
  }
  set vertical(t) {
    this._vertical = t, this.updateChildren();
  }
  get vertical() {
    return this._vertical;
  }
  set labelHidden(t) {
    this._labelHidden = t, this.updateChildren();
  }
  get labelHidden() {
    return this._labelHidden;
  }
  updateChildren() {
    const t = this.children;
    for (const e of t)
      e instanceof Dt && (e.vertical = this.vertical), e.toggleAttribute("label-hidden", this.vertical);
  }
  render() {
    return m`
      <div class="parent">
        <div class="children">
          <slot @slotchange=${this.updateChildren}></slot>
        </div>
        ${!this.labelHidden && (this.label || this.icon) ? m`<bim-label .icon=${this.icon}>${this.label}</bim-label>` : null}
      </div>
    `;
  }
};
Zi.styles = C`
    :host {
      --bim-label--fz: var(--bim-ui_size-xs);
      --bim-label--c: var(--bim-ui_bg-contrast-60);
      display: block;
      flex: 1;
    }

    :host(:not([vertical])) ::slotted(bim-button[vertical]) {
      --bim-icon--fz: var(--bim-ui_size-5xl);
      min-height: 3.75rem;
    }

    .parent {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      align-items: center;
      padding: 0.5rem;
      height: 100%;
      box-sizing: border-box;
      justify-content: space-between;
    }

    :host([vertical]) .parent {
      flex-direction: row-reverse;
    }

    :host([vertical]) .parent > bim-label {
      writing-mode: tb;
    }

    .children {
      display: flex;
      gap: 0.25rem;
    }

    :host([vertical]) .children {
      flex-direction: column;
    }
  `;
let bt = Zi;
Ge([
  h({ type: String, reflect: !0 })
], bt.prototype, "label", 2);
Ge([
  h({ type: String, reflect: !0 })
], bt.prototype, "icon", 2);
Ge([
  h({ type: Boolean, reflect: !0 })
], bt.prototype, "vertical", 1);
Ge([
  h({ type: Boolean, attribute: "label-hidden", reflect: !0 })
], bt.prototype, "labelHidden", 1);
var Dl = Object.defineProperty, Fl = Object.getOwnPropertyDescriptor, Li = (i, t, e, s) => {
  for (var n = s > 1 ? void 0 : s ? Fl(t, e) : t, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = (s ? o(t, e, n) : o(n)) || n);
  return s && n && Dl(t, e, n), n;
};
const tn = class tn extends w {
  constructor() {
    super(...arguments), this.labelsHidden = !1, this._vertical = !1, this._hidden = !1;
  }
  set vertical(t) {
    this._vertical = t, this.updateSections();
  }
  get vertical() {
    return this._vertical;
  }
  set hidden(t) {
    this._hidden = t, this.dispatchEvent(new Event("hiddenchange"));
  }
  get hidden() {
    return this._hidden;
  }
  // private setActivationButton() {
  //   this.activationButton.draggable = Manager.config.draggableToolbars;
  //   this.activationButton.addEventListener(
  //     "click",
  //     () => (this.hidden = !this.hidden),
  //   );
  //   this.activationButton.setAttribute("data-ui-manager-id", this._managerID);
  //   this.activationButton.addEventListener("dragstart", (e) => {
  //     const id = this.getAttribute("data-ui-manager-id");
  //     if (e.dataTransfer && id) {
  //       e.dataTransfer.setData("id", id);
  //       e.dataTransfer.effectAllowed = "move";
  //     }
  //     const containers = document.querySelectorAll("bim-toolbars-container");
  //     for (const container of containers) {
  //       if (container === this.parentElement) continue;
  //       container.dropping = true;
  //     }
  //   });
  //   this.activationButton.addEventListener("dragend", (e) => {
  //     if (e.dataTransfer) e.dataTransfer.clearData();
  //     const containers = document.querySelectorAll("bim-toolbars-container");
  //     for (const container of containers) {
  //       container.dropping = false;
  //     }
  //   });
  // }
  updateSections() {
    const t = this.children;
    for (const e of t)
      e instanceof bt && (e.labelHidden = this.vertical && !Te.config.sectionLabelOnVerticalToolbar, e.vertical = this.vertical);
  }
  // firstUpdated() {
  //   this.setAttribute("data-ui-manager-id", this._managerID);
  // }
  render() {
    return m`
      <div class="parent">
        <slot @slotchange=${this.updateSections}></slot>
      </div>
    `;
  }
};
tn.styles = C`
    :host {
      --bim-button--bgc: transparent;
      background-color: var(--bim-ui_bg-base);
      border-radius: var(--bim-ui_size-2xs);
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    .parent {
      display: flex;
      width: min-content;
      pointer-events: auto;
    }

    :host([vertical]) .parent {
      flex-direction: column;
    }

    :host([vertical]) {
      width: min-content;
      border-radius: var(--bim-ui_size-2xs);
      border: 1px solid var(--bim-ui_bg-contrast-20);
    }

    ::slotted(bim-toolbar-section:not(:last-child)) {
      border-right: 1px solid var(--bim-ui_bg-contrast-20);
      border-bottom: none;
    }

    :host([vertical]) ::slotted(bim-toolbar-section:not(:last-child)) {
      border-bottom: 1px solid var(--bim-ui_bg-contrast-20);
      border-right: none;
    }
  `;
let Ft = tn;
Li([
  h({ type: String, reflect: !0 })
], Ft.prototype, "icon", 2);
Li([
  h({ type: Boolean, attribute: "labels-hidden", reflect: !0 })
], Ft.prototype, "labelsHidden", 2);
Li([
  h({ type: Boolean, reflect: !0 })
], Ft.prototype, "vertical", 1);
var Vl = Object.defineProperty, Ul = (i, t, e, s) => {
  for (var n = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(t, e, n) || n);
  return n && Vl(t, e, n), n;
};
const en = class en extends w {
  constructor() {
    super(), this._onResize = new Event("resize"), new ResizeObserver(() => {
      setTimeout(() => {
        this.dispatchEvent(this._onResize);
      });
    }).observe(this);
  }
  render() {
    return m`
      <div class="parent">
        <slot></slot>
      </div>
    `;
  }
};
en.styles = C`
    :host {
      display: grid;
      min-width: 0;
      min-height: 0;
      height: 100%;
    }

    .parent {
      overflow: hidden;
      position: relative;
    }
  `;
let je = en;
Ul([
  h({ type: String, reflect: !0 })
], je.prototype, "name");
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Hs = "important", ql = " !" + Hs, Xl = ds(class extends fs {
  constructor(i) {
    var t;
    if (super(i), i.type !== hs.ATTRIBUTE || i.name !== "style" || ((t = i.strings) == null ? void 0 : t.length) > 2)
      throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
  }
  render(i) {
    return Object.keys(i).reduce((t, e) => {
      const s = i[e];
      return s == null ? t : t + `${e = e.includes("-") ? e : e.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${s};`;
    }, "");
  }
  update(i, [t]) {
    const { style: e } = i.element;
    if (this.ft === void 0)
      return this.ft = new Set(Object.keys(t)), this.render(t);
    for (const s of this.ft)
      t[s] == null && (this.ft.delete(s), s.includes("-") ? e.removeProperty(s) : e[s] = null);
    for (const s in t) {
      const n = t[s];
      if (n != null) {
        this.ft.add(s);
        const r = typeof n == "string" && n.endsWith(ql);
        s.includes("-") || r ? e.setProperty(s, r ? n.slice(0, -11) : n, r ? Hs : "") : e[s] = n;
      }
    }
    return At;
  }
});
export {
  sl as Button,
  dt as Checkbox,
  Z as ColorInput,
  Le as Component,
  gi as ContextMenu,
  V as Dropdown,
  ae as Grid,
  vi as Icon,
  Ot as Input,
  ft as Label,
  Te as Manager,
  R as NumberInput,
  T as Option,
  tt as Panel,
  pt as PanelSection,
  mt as Selector,
  I as Tab,
  M as Table,
  Re as TableCell,
  Me as TableChildren,
  ze as TableGroup,
  et as TableRow,
  X as Tabs,
  B as TextInput,
  Ft as Toolbar,
  Dt as ToolbarGroup,
  bt as ToolbarSection,
  je as Viewport,
  Ie as getElementValue,
  m as html,
  Ht as ref,
  Xl as styleMap
};
