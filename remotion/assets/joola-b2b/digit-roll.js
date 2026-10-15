/**
 * Per-digit roll shared by the prototype and the film.
 * Each column is only as tall as the ink it swaps, on one shared baseline,
 * so a moving digit is not sliced by a line box and a comma is not clipped.
 * Settled text is the plain string. Tabular figures.
 * t is 0..1, already eased by the caller. play() eases over ~450ms.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (typeof root !== "undefined") root.JOOLA_ROLL = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  var cache = new Map();

  function easeOut(x) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    var x1 = 0.2, y1 = 0, x2 = 0, y2 = 1;
    var cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    var cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    var sx = function (t) { return ((ax * t + bx) * t + cx) * t; };
    var sy = function (t) { return ((ay * t + by) * t + cy) * t; };
    var dx = function (t) { return (3 * ax * t + 2 * bx) * t + cx; };
    var t = x;
    for (var i = 0; i < 8; i++) {
      var e = sx(t) - x, d = dx(t);
      if (Math.abs(e) < 1e-6) return sy(t);
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    var lo = 0, hi = 1;
    t = x;
    for (var j = 0; j < 20; j++) {
      var v = sx(t);
      if (Math.abs(v - x) < 1e-6) break;
      if (v < x) lo = t; else hi = t;
      t = (lo + hi) / 2;
    }
    return sy(t);
  }

  function fontKey(cs) {
    return [cs.fontFamily, cs.fontSize, cs.fontWeight, cs.letterSpacing, cs.fontStyle].join("|");
  }

  function probeFor(el) {
    var cs = getComputedStyle(el);
    var key = fontKey(cs);
    var hit = cache.get(key);
    if (hit) return hit;
    var probe = document.createElement("span");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText = [
      "position:absolute", "left:0", "top:0", "visibility:hidden", "pointer-events:none",
      "white-space:pre", "padding:0", "margin:0", "border:0", "display:inline-block",
      "font-family:" + cs.fontFamily,
      "font-size:" + cs.fontSize,
      "font-weight:" + cs.fontWeight,
      "font-style:" + cs.fontStyle,
      "letter-spacing:" + cs.letterSpacing,
      "font-variant-numeric:tabular-nums",
      "font-feature-settings:\"tnum\" 1",
      "line-height:normal",
      "text-box:none",
    ].join(";");
    var mark = document.createElement("span");
    mark.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
    probe.appendChild(mark);
    (el.ownerDocument.body || el.ownerDocument.documentElement).appendChild(probe);
    var canvas = el.ownerDocument.createElement("canvas").getContext("2d");
    var family = cs.fontFamily.split(",")[0].replace(/["']/g, "").trim();
    canvas.font = cs.fontStyle + " " + cs.fontWeight + " " + cs.fontSize + ' "' + family + '"';
    hit = { probe: probe, mark: mark, widths: new Map(), canvas: canvas };
    cache.set(key, hit);
    return hit;
  }

  function layoutBox(node) {
    var rect = node.getBoundingClientRect();
    var sx = 1, sy = 1, el = node;
    while (el) {
      var tr = getComputedStyle(el).transform;
      if (tr && tr !== "none") {
        var dm = new DOMMatrix(tr);
        sx *= dm.a || 1;
        sy *= dm.d || 1;
      }
      el = el.parentElement;
    }
    return { w: rect.width / sx, h: rect.height / sy, top: rect.top };
  }

  function metrics(el, text) {
    var ready = !document.fonts || document.fonts.status === "loaded";
    if (!ready) cache.clear();
    var hit = probeFor(el);
    if (text.length === 1 && ready) {
      var known = hit.widths.get(text);
      if (known) return known;
    }
    var node = el.ownerDocument.createTextNode(text);
    hit.probe.insertBefore(node, hit.mark);
    var box = layoutBox(hit.probe);
    var out;
    if (text.length !== 1) {
      out = { w: box.w, asc: 0, desc: 0, base: 0 };
    } else {
      var ink = hit.canvas.measureText(text);
      out = {
        w: text === " " ? 0 : box.w,
        asc: ink.actualBoundingBoxAscent || 0,
        desc: ink.actualBoundingBoxDescent || 0,
        base: hit.mark.getBoundingClientRect().top - box.top,
      };
      if (ready) hit.widths.set(text, out);
    }
    node.parentNode.removeChild(node);
    return out;
  }

  function measureText(el, text) {
    return metrics(el, text).w;
  }

  function clearRoll(el) {
    el.classList.remove("j-roll");
    el.style.width = "";
    el.style.height = "";
    el.style.lineHeight = "";
    el.style.display = "";
    el.style.overflow = "";
    el.style.textAlign = "";
    el.style.removeProperty("text-box");
  }

  function paintDigitRoll(el, from, to, t, opts) {
    var maxBlur = opts && opts.maxBlur != null ? opts.maxBlur : 1;
    var align = (opts && opts.align) || "left";
    var natural = metrics(el, to).w;
    if (t <= 0 || t >= 1 || from === to) {
      clearRoll(el);
      el.textContent = t >= 1 || from === to ? to : from;
      if (align === "right" && from !== to) {
        el.style.display = "inline-block";
        el.style.textAlign = "right";
        el.style.width = natural.toFixed(3) + "px";
      }
      return;
    }
    var n = Math.max(from.length, to.length);
    var a = align === "right" ? from.padStart(n, " ") : from.padEnd(n, " ");
    var b = align === "right" ? to.padStart(n, " ") : to.padEnd(n, " ");
    var cols = [];
    var maxAsc = 0, maxDesc = 0, sum = 0;
    for (var i = 0; i < n; i++) {
      var A = metrics(el, a[i]);
      var B = metrics(el, b[i]);
      var asc = Math.max(A.asc, B.asc);
      var desc = Math.max(A.desc, B.desc);
      var h = Math.max(asc + desc, 0.01);
      var w = Math.max(A.w, B.w);
      maxAsc = Math.max(maxAsc, asc);
      maxDesc = Math.max(maxDesc, desc);
      sum += w;
      cols.push({ a: a[i], b: b[i], asc: asc, desc: desc, h: h, w: w });
    }
    if (sum > 0 && Math.abs(natural - sum) < 2 && cols.length) {
      cols[cols.length - 1].w += natural - sum;
      sum = natural;
    }
    var parentH = Math.max(maxAsc + maxDesc, 1);
    el.classList.add("j-roll");
    el.style.setProperty("text-box", "none", "important");
    el.style.setProperty("display", "inline-flex", "important");
    el.style.setProperty("align-items", "flex-start", "important");
    el.style.setProperty("overflow", "hidden", "important");
    el.style.setProperty("height", parentH.toFixed(3) + "px", "important");
    el.style.setProperty("width", sum.toFixed(3) + "px", "important");
    el.style.whiteSpace = "nowrap";
    el.style.fontVariantNumeric = "tabular-nums";
    el.style.fontFeatureSettings = '"tnum" 1';
    el.style.lineHeight = "normal";
    el.replaceChildren();
    var blur = Math.sin(Math.PI * t) * maxBlur;
    function place(ch, into, asc) {
      if (ch === " ") return;
      var m = metrics(el, ch);
      var tx = document.createElement("span");
      tx.className = "j-roll-glyph";
      tx.textContent = ch;
      tx.style.position = "absolute";
      tx.style.left = "0";
      tx.style.width = "100%";
      tx.style.top = (asc - m.base).toFixed(3) + "px";
      tx.style.textAlign = "center";
      tx.style.lineHeight = "normal";
      tx.style.whiteSpace = "pre";
      tx.style.setProperty("text-box", "none", "important");
      into.appendChild(tx);
    }
    cols.forEach(function (c) {
      if (c.w <= 0) return;
      var slot = document.createElement("span");
      slot.className = "j-roll-slot";
      slot.style.position = "relative";
      slot.style.display = "block";
      slot.style.flex = "0 0 auto";
      slot.style.setProperty("overflow", "hidden", "important");
      slot.style.setProperty("width", c.w.toFixed(3) + "px", "important");
      slot.style.setProperty("height", c.h.toFixed(3) + "px", "important");
      slot.style.marginTop = (maxAsc - c.asc).toFixed(3) + "px";
      if (c.a === c.b) {
        place(c.b, slot, c.asc);
      } else {
        var col = document.createElement("span");
        col.className = "j-roll-col";
        col.style.position = "absolute";
        col.style.left = "0";
        col.style.top = "0";
        col.style.width = "100%";
        col.style.transform = "translateY(" + (-t * c.h).toFixed(3) + "px)";
        if (blur >= 0.35) col.style.filter = "blur(" + blur.toFixed(2) + "px)";
        [c.a, c.b].forEach(function (ch) {
          var cell = document.createElement("span");
          cell.style.display = "block";
          cell.style.position = "relative";
          cell.style.height = c.h.toFixed(3) + "px";
          cell.style.setProperty("overflow", "hidden", "important");
          place(ch, cell, c.asc);
          col.appendChild(cell);
        });
        slot.appendChild(col);
      }
      el.appendChild(slot);
    });
  }

  function playDigitRoll(el, from, to, ms) {
    var dur = ms || 450;
    var start = performance.now();
    function frame(now) {
      var u = Math.min(1, (now - start) / dur);
      paintDigitRoll(el, from, to, easeOut(u), { maxBlur: 1, align: "right" });
      if (u < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  return { paint: paintDigitRoll, play: playDigitRoll, measure: measureText, paintDigitRoll: paintDigitRoll, playDigitRoll: playDigitRoll, measureText: measureText };
});
