'use client';

// Displacement map - radial gradient for edge distortion
// Center neutral (128,128,128), edges push outward
const DISPLACEMENT_MAP = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">
  <defs>
    <radialGradient id="disp" cx="50%" cy="50%" r="60%" fx="50%" fy="50%">
      <stop offset="0%" stop-color="rgb(128,128,128)"/>
      <stop offset="30%" stop-color="rgb(128,128,128)"/>
      <stop offset="60%" stop-color="rgb(100,156,128)"/>
      <stop offset="85%" stop-color="rgb(60,196,128)"/>
      <stop offset="100%" stop-color="rgb(20,236,128)"/>
    </radialGradient>
  </defs>
  <rect width="400" height="200" fill="url(#disp)"/>
</svg>
`)}`;

// Specular map - top-left highlight gradient (simulates light reflection)
const SPECULAR_MAP = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">
  <defs>
    <linearGradient id="spec" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.6)"/>
      <stop offset="20%" stop-color="rgba(255,255,255,0.25)"/>
      <stop offset="50%" stop-color="rgba(255,255,255,0.05)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
    <radialGradient id="edge" cx="50%" cy="50%" r="50%">
      <stop offset="85%" stop-color="rgba(255,255,255,0)"/>
      <stop offset="95%" stop-color="rgba(255,255,255,0.15)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0.25)"/>
    </radialGradient>
  </defs>
  <rect width="400" height="200" fill="url(#spec)"/>
  <rect width="400" height="200" fill="url(#edge)"/>
</svg>
`)}`;

export function LiquidGlassDefs() {
  return (
    <svg className="hidden fixed top-0 left-0 w-0 h-0 pointer-events-none" aria-hidden="true">
      <defs>
        {/* Complete liquid glass filter with displacement + specular */}
        <filter id="liquid-glass" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
          {/* Step 1: Slight blur on source */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blurred_source" />

          {/* Step 2: Load displacement map */}
          <feImage href={DISPLACEMENT_MAP} preserveAspectRatio="none" result="displacement_map" />

          {/* Step 3: Apply displacement */}
          <feDisplacementMap
            in="blurred_source"
            in2="displacement_map"
            scale="40"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />

          {/* Step 4: Boost saturation slightly */}
          <feColorMatrix
            in="displaced"
            type="saturate"
            values="1.3"
            result="displaced_saturated"
          />

          {/* Step 5: Load specular highlight map */}
          <feImage href={SPECULAR_MAP} preserveAspectRatio="none" result="specular_layer" />

          {/* Step 6: Fade specular to 40% opacity */}
          <feComponentTransfer in="specular_layer" result="specular_faded">
            <feFuncA type="linear" slope="0.4" />
          </feComponentTransfer>

          {/* Step 7: Blend specular on top of displaced content */}
          <feBlend in="specular_faded" in2="displaced_saturated" mode="screen" />
        </filter>
      </defs>
    </svg>
  );
}

