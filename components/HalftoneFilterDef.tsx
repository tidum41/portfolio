import React from "react";

export function HalftoneFilterDef({ id, dk, hoverColor }: any) {
  const dotSize = dk?.dotSize ?? 4;
  
  // Generate soft dot pattern
  const svgPattern = `<svg width="${dotSize}" height="${dotSize}" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="g" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-opacity="1" stop-color="white" /><stop offset="100%" stop-opacity="0" stop-color="white" /></radialGradient></defs><circle cx="${dotSize / 2}" cy="${dotSize / 2}" r="${dotSize / 2}" fill="url(#g)" /></svg>`;
  const dataUri = `data:image/svg+xml,${encodeURIComponent(svgPattern)}`;

  return (
    <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none", color: hoverColor }}>
      <defs>
        <filter id={id} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation={dk?.blurAmount ?? 1.5} result="blurredText" />
          
          <feImage href={dataUri} x={dk?.offsetX ?? 0} y={dk?.offsetY ?? 0} width={dotSize} height={dotSize} preserveAspectRatio="none" result="dot" />
          <feTile in="dot" result="pattern" />
          
          <feComposite 
            in="blurredText" 
            in2="pattern" 
            operator="arithmetic" 
            k1="1" 
            k2="0" 
            k3="0" 
            k4="0" 
            result="added" 
          />
          
          <feColorMatrix type="matrix" in="added" values={`
            0 0 0 0 1
            0 0 0 0 1
            0 0 0 0 1
            0 0 0 ${dk?.thresholdMult ?? 20} -${(dk?.thresholdOffset ?? 20) / 10}
          `} result="halftoneMask" />
          
          <feFlood floodColor="currentColor" result="flood" />
          <feComposite in="flood" in2="halftoneMask" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}
