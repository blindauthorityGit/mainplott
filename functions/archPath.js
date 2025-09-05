// utils/arcPath.js
export function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

export function polarToCartesian(cx, cy, r, deg) {
    const a = ((deg - 90) * Math.PI) / 180; // SVG: 0° = oben
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

export function describeArc(cx, cy, r, startDeg, endDeg) {
    const start = polarToCartesian(cx, cy, r, endDeg);
    const end = polarToCartesian(cx, cy, r, startDeg);
    const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    const sweep = 1;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
}

// functions/archPath.js// functions/archPath.js
export function centeredTextPath(lengthPx, curvature, steps = 64) {
    // keine Biegung: horizontale Linie, Mittelpunkt bei (0,0)
    if (!curvature || Math.abs(curvature) < 0.001) {
        const half = lengthPx / 2;
        return `M ${-half} 0 L ${half} 0`;
    }

    const MAX_DEG = 140; // ggf. 160/180 wenn du mehr willst
    const theta = (Math.abs(curvature) / 100) * ((Math.PI * MAX_DEG) / 180); // Bogenwinkel (rad)
    const r = Math.max(1, lengthPx / theta); // r so, dass Bogenlänge ~ Textbreite
    const s = curvature > 0 ? -1 : 1; // + = nach oben biegen (neg. y). Für „+ = nach unten“ einfach invertieren.

    // Richtung immer links->rechts: a von -theta/2 bis +theta/2
    const start = -theta / 2;
    const end = theta / 2;

    const pt = (a) => {
        const x = r * Math.sin(a);
        const y = s * (r * (1 - Math.cos(a))); // y(0)=0 -> Mittelpunkt bleibt (0,0)
        return [x, y];
    };

    let [x0, y0] = pt(start);
    let d = `M ${x0} ${y0}`;
    for (let i = 1; i <= steps; i++) {
        const a = start + (i * (end - start)) / steps;
        const [x, y] = pt(a);
        d += ` L ${x} ${y}`;
    }
    return d;
}

export function measureTextPx(text = "", fontFamily = "Roboto", fontSize = 36, fontStyle = "normal") {
    const canvas = measureTextPx._c || (measureTextPx._c = document.createElement("canvas"));
    const ctx = measureTextPx._ctx || (measureTextPx._ctx = canvas.getContext("2d"));
    measureTextPx._ctx = ctx;
    ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}`;
    const m = ctx.measureText(text);
    return {
        width: m.width,
        ascent: m.actualBoundingBoxAscent ?? fontSize * 0.8,
        descent: m.actualBoundingBoxDescent ?? fontSize * 0.2,
    };
}
