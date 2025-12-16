'use client';

export function LiquidGlassDefs() {
    return (
        <svg className="hidden fixed top-0 left-0 w-0 h-0 pointer-events-none" aria-hidden="true">
            <defs>

                <filter id="wavy-distort" x="-50%" y="-50%" width="200%" height="200%">
                    <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="2" result="turbulence" />
                    <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="10" xChannelSelector="R" yChannelSelector="G" />
                </filter>
            </defs>
        </svg>
    );
}
