"use client";

import type { ComponentType } from "react";
import { useEffect, useLayoutEffect as _useLayoutEffect, useRef } from "react";

const useSyncEffect =
    typeof window !== "undefined" ? _useLayoutEffect : useEffect;

const PLAYBACK_ID = "Bnxef00RI4GizGZ028BWXYJtW00x554PmovqLgVZYrphiU";
const TARGET = "rabbit holes";
const HOP_DIST = 36;
const DESKTOP_TRAVEL_PX = HOP_DIST * 3;

function ensureMuxLoaded(): void {
    const id = "mux-player-script";
    if (
        document.getElementById(id) ||
        (window as any).customElements?.get("mux-player")
    )
        return;
    const s = document.createElement("script");
    s.id = id;
    s.type = "module";
    s.src = "https://cdn.jsdelivr.net/npm/@mux/mux-player@3/dist/mux-player.mjs";
    document.head.appendChild(s);
}

function createRabbitSVG(): SVGSVGElement {
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg") as SVGSVGElement;
    svg.setAttribute("viewBox", "0 0 985 990");
    svg.setAttribute("fill", "none");
    svg.setAttribute("xmlns", NS);
    svg.id = "rh-rabbit";
    // display:block + opacity:0 — fades in after DOM settles to avoid flash
    svg.style.cssText = `
        display: block; width: 1.15em; height: 1.15em;
        overflow: visible; color: inherit;
        will-change: transform; pointer-events: none; opacity: 0;
    `;
    const bodyPaths = [
        "M572.782 55.527L500.373 55.5246C500.228 61.6226 500.354 67.4722 500.48 73.5674L534.094 73.5123C540.487 73.535 548.703 73.8444 554.923 73.4992L554.964 91.6214C560.95 91.691 567.188 91.8602 573.152 91.6755L573.366 109.788L591.025 109.778L591.113 146.384C596.617 146.359 604.151 146.605 609.44 146.09L609.544 182.36C615.425 182.485 621.495 182.396 627.397 182.377L627.575 218.854L645.617 218.911L645.604 124.351C645.604 108.199 646.053 89.4509 645.41 73.5152C652.687 73.4804 659.964 73.5017 667.24 73.579C671.388 73.6245 678.093 73.898 681.961 73.449L682.168 91.5982C688.192 91.7355 694.217 91.7703 700.241 91.7035C700.714 109.445 700.313 128.467 700.44 146.35C706.072 146.095 712.664 146.436 718.581 146.279L718.665 291.526L681.995 291.474C682.03 285.56 682.016 279.646 681.955 273.733C676.147 273.538 669.832 273.616 663.982 273.586L663.954 219.07C657.873 219.081 651.791 219.043 645.71 218.956L645.812 328.019C651.305 327.905 658.559 327.803 663.96 328.105L663.912 309.935C687.467 309.397 713.176 309.85 736.872 309.946L737 328.071C740.093 327.814 746.192 328.016 749.466 328.026C757.375 328.081 765.284 328.065 773.193 327.979L773.356 346.077L791.088 346.086L791.125 364.053L809.47 364.116L809.561 382.709C815.56 382.77 821.56 382.788 827.559 382.762C827.921 394.49 827.811 406.947 827.909 418.756L845.981 418.726L846.164 446.877C846.184 452.166 846.418 458.96 845.994 464.058L864.092 464.129L864.066 476.51L864.104 491.089L845.994 491.109C846.228 493.724 846.126 498.171 846.142 500.926C839.991 500.999 833.774 500.951 827.617 500.951C827.765 498.002 827.671 494.14 827.686 491.118L809.281 491.113C809.271 499.728 809.644 510.735 809.21 519.146L827.759 519.276C827.314 530.259 827.748 544.519 827.906 555.657C821.772 555.575 815.323 555.357 809.226 555.778C809.53 560.781 809.254 568.568 809.222 573.765C790.839 573.485 771.771 573.736 753.344 573.736L645.619 573.75C645.522 567.809 645.512 561.869 645.59 555.928C635.082 555.227 620.002 555.71 609.105 555.662L609.012 537.442L590.855 537.326C591.202 532.023 590.726 524.966 590.931 519.184C585.1 519.03 579.107 519.146 573.264 519.189C573.18 531.26 573.203 543.335 573.334 555.405C579.229 555.459 585.125 555.415 591.019 555.28L591.251 573.451C602.699 573.789 616.021 573.736 627.479 573.523C627.632 579.614 627.696 585.715 627.672 591.81C645.54 592.158 664.074 591.873 682.026 592.004C682.09 597.974 682.237 604.108 682.085 610.063L736.594 610.068L736.634 682.341C730.898 682.167 724.376 682.404 718.615 682.525C718.552 697.534 718.3 712.974 718.595 727.945L700.354 728.051L700.337 746.038L682.323 746.106C682.209 751.83 681.949 758.646 682.347 764.267L645.675 764.282L645.743 782.434C640.395 782.177 632.982 782.424 627.479 782.443C627.578 758.162 627.531 733.881 627.335 709.6L609.429 709.59L609.506 818.732L627.645 818.843C627.236 829.541 627.751 843.777 627.841 854.682C633.756 854.793 639.758 854.977 645.667 854.856L645.82 873.076L663.869 873.109L663.956 909.311L645.628 909.33C645.672 903.448 645.529 897.366 645.457 891.474C639.849 891.309 633.445 891.483 627.776 891.517C627.609 897.439 627.566 903.361 627.646 909.282C615.437 909.427 603.037 909.321 590.813 909.316C591.045 903.955 590.799 896.96 590.747 891.469C584.882 891.319 578.702 891.392 572.809 891.377C572.953 885.639 572.816 879.273 572.816 873.482L554.769 873.414L554.652 836.898L536.104 836.768L536.086 800.619L518.177 800.532L518.058 709.658C512.267 709.571 506.261 709.663 500.451 709.677C500.093 726.732 500.296 744.361 500.296 761.449C500.223 780.601 500.257 799.754 500.397 818.901L408.92 818.916V800.537C414.976 800.406 421.278 800.469 427.359 800.445C427.325 794.49 427.257 788.534 427.16 782.579L445.72 782.545C445.125 743.829 445.657 703.369 445.676 664.591C440.05 664.175 433.057 664.335 427.286 664.33C427.465 658.621 427.301 652.143 427.262 646.386C421.278 646.255 414.952 646.347 408.939 646.342L408.886 628.162C385.469 627.596 359.936 628.017 336.403 628.109C336.398 634.146 336.427 640.184 336.49 646.222C354.363 645.912 373.353 646.226 391.289 646.26C391.081 651.94 391.492 658.176 391.303 664.151L409.147 664.199C409.234 669.782 409.766 686.208 409.031 691.192L427.648 691.236L427.711 764.238L409.326 764.311C409.384 770.286 409.307 776.401 409.292 782.39C403.618 782.255 397.098 782.458 391.356 782.506C391.24 788.365 390.95 794.789 391.342 800.595C385.295 800.518 379.254 800.571 373.212 800.754C373.198 806.821 373.241 812.883 373.343 818.95L354.875 818.969C354.996 824.808 354.88 831.044 354.88 836.913C337.336 836.342 317.873 837.077 300.077 836.913V854.803C353.952 855.929 409.558 853.851 463.641 854.963L463.607 836.85C481.654 836.584 500.325 836.83 518.423 836.83C518.355 842.805 518.396 848.78 518.547 854.755C524.364 854.837 530.636 855.05 536.416 854.852C536.378 867.028 536.411 879.2 536.515 891.377L554.915 891.387L554.968 909.364C560.305 909.485 568.068 909.77 573.224 909.408C573.352 915.46 573.414 921.512 573.411 927.569C608.843 928.101 646.398 927.84 681.889 927.555C681.748 921.846 681.917 915.431 681.945 909.664C694.388 909.118 708.601 909.34 721.106 909.345C731.823 909.35 744.144 909.127 754.665 909.601L754.625 855.132C748.643 855.132 742.68 855.18 736.702 854.938C737.11 858.124 736.885 865.254 736.87 868.706C736.821 876.261 736.845 883.817 736.942 891.367L718.25 891.425C718.672 885.702 718.224 879.495 718.607 873.491C712.526 873.327 706.456 873.448 700.373 873.525L700.334 891.295L681.943 891.387L681.902 855.151L663.68 855.064L663.612 836.946C657.861 836.855 651.357 836.685 645.669 837.062L645.578 800.479L663.843 800.445C663.586 794.562 663.635 788.486 663.636 782.593H682.034C682.185 800.624 681.861 818.751 682.373 836.768C694.323 836.951 706.609 836.83 718.586 836.845L718.514 819.061C712.735 818.79 705.906 818.896 700.045 818.848C700.597 801.76 700.262 781.37 699.905 764.234C705.728 763.963 712.715 764.098 718.629 764.069C718.231 758.984 718.383 751.351 718.332 746.068C724.167 745.86 730.608 745.966 736.488 745.961C736.579 733.9 736.569 721.835 736.457 709.774L754.682 709.6C754.205 670.561 754.931 631.077 754.573 591.946C778.614 591.598 803.537 591.902 827.64 591.95C827.678 585.864 827.673 579.783 827.626 573.702C837.319 573.393 854.291 573.243 863.909 573.663L863.882 555.715C857.884 555.546 851.882 555.536 845.884 555.681C845.917 543.519 845.888 531.356 845.798 519.194C851.739 519.059 858.128 519.194 864.103 519.223C864.016 531.313 864.038 543.408 864.167 555.502C869.976 555.328 876.321 555.42 882.172 555.391C882.785 542.885 882.257 525.923 882.257 513.127C882.398 490.819 882.338 468.512 882.077 446.205C875.999 446.097 869.803 446.126 863.714 446.095L863.723 400.853L845.884 400.775L845.855 364.25C839.926 364.022 833.607 364.12 827.64 364.12C827.909 358.885 827.654 351.547 827.62 346.164L809.484 346.078C809.4 340.147 809.358 334.215 809.359 328.283L790.947 328.223C791.021 322.261 790.904 316.066 790.872 310.085L754.647 310.029C754.645 303.913 754.679 297.797 754.748 291.681C749.298 291.364 742.195 291.508 736.625 291.471L736.596 127.988C730.611 127.916 724.625 127.921 718.641 128.003C718.482 109.897 718.442 91.7906 718.524 73.6844C713.183 73.3238 705.45 73.4944 699.927 73.4543C700.071 67.493 700.061 61.5293 699.898 55.569C676.985 54.9227 650.917 55.5565 627.735 55.5743L627.507 128.118C621.66 127.89 615.06 128.005 609.15 127.992C608.79 116.411 609.038 103.517 609.026 91.8379L590.889 91.7359C590.854 85.6896 590.849 79.6428 590.875 73.5964C584.956 73.462 578.81 73.5147 572.872 73.4881C572.898 67.5008 572.868 61.5134 572.782 55.527Z",
        "M571.361 310.09L554.885 309.985L554.923 364.11L536.491 364.19L536.478 400.741L518.485 400.9L518.495 446.075C452.119 446.774 384.943 445.976 318.458 446.175C318.375 452.133 318.414 458.172 318.409 464.137L282.054 464.366C281.953 470.697 281.948 477.03 282.035 483.361L245.496 483.408C245.399 489.252 245.404 495.097 245.506 500.941L227.362 501.13C227.536 506.708 227.333 513.408 227.314 519.078C221.224 519.054 215.134 519.097 209.039 519.204C209.03 525.217 209.064 531.226 209.136 537.239C203.428 537.529 196.386 537.404 190.577 537.452C191.63 547.226 190.214 562.845 190.867 573.702L172.723 573.751C173.443 582.486 172.863 600.758 172.897 610.286C166.885 610.223 160.867 610.266 154.855 610.421L154.763 664.248C136.634 664.552 118.5 664.639 100.366 664.499C100.39 673.418 100.298 682.331 100.09 691.245L82.0093 691.274L82.0431 800.426C88.012 800.305 94.4063 800.426 100.404 800.435L100.54 818.747C130.525 819.201 161.152 818.727 191.22 818.906C190.876 821.956 191.084 828.574 191.089 831.837C191.06 839.562 191.118 847.291 191.263 855.016C185.507 855.229 178.803 855.084 172.974 855.093L173.027 909.355C178.223 909.451 186.188 909.795 191.171 909.451C191.398 915.286 191.345 921.657 191.398 927.54C235.525 928.038 280.508 927.627 324.697 927.632L500.04 927.555C500.262 919.656 500.185 911.511 500.204 903.593L500.136 873.501C494.172 873.351 487.899 873.424 481.911 873.4C482.399 883.923 481.949 898.425 481.998 909.302C475.879 909.326 469.765 909.316 463.651 909.273C463.81 903.496 463.622 897.279 463.544 891.459C457.749 891.329 451.52 891.454 445.691 891.469C445.609 897.415 445.623 903.361 445.739 909.306L208.977 909.277C209.344 905.444 209.049 895.708 209.03 891.469C203.182 891.271 196.696 891.387 190.799 891.377L190.751 873.148C196.565 872.95 203.182 873.08 209.054 873.061C209.054 867.033 209.001 861.005 208.894 854.977C214.201 854.678 221.789 854.813 227.086 855.016L227.077 818.959L209.068 818.843C208.948 813.313 208.875 806.347 209.184 800.899C203.907 800.411 196.275 800.566 190.852 800.547L190.794 764.306L172.67 764.277C172.858 758.554 172.737 752.492 172.708 746.754C172.525 713.269 173.037 679.711 172.592 646.231L190.794 646.159L190.722 591.941C196.57 591.82 202.911 591.96 208.798 591.984L208.759 555.555L226.932 555.41L227 537.206C232.872 536.998 239.551 537.119 245.486 537.09L245.467 519.334C251.421 519.097 257.758 519.126 263.751 519.073C263.765 513.123 263.838 507.158 263.587 501.217L300.096 501.11C300.164 495.541 300.135 489.968 300.005 484.394C311.884 484.022 324.045 484.578 336.161 484.143C336.031 477.579 336.176 470.705 336.229 464.113C357.012 463.762 378.848 464.088 399.708 464.087L518.509 464.137C518.437 471.382 518.454 478.627 518.56 485.873L536.16 485.859C536.273 463.542 536.269 441.223 536.15 418.905C542.333 418.79 548.517 418.746 554.701 418.771L554.813 382.796L572.948 382.738C572.709 376.964 572.858 370.064 572.836 364.203C578.065 363.869 585.567 364.049 590.969 364.018C590.69 358.66 590.878 351.64 590.884 346.151L572.8 346.079C572.916 341.857 573.176 312.995 572.507 310.456L571.361 310.09ZM136.827 691.216L154.7 691.26C154.889 727.471 154.236 764.533 154.821 800.6C150.452 800.605 119.321 801.073 118.012 799.947L117.954 782.361C111.989 782.453 106.02 782.492 100.051 782.487L99.979 709.687L118.099 709.595C118.161 700.565 118.123 691.54 117.987 682.515C124.261 682.443 130.534 682.414 136.813 682.433L136.827 691.216Z",
        "M552.68 109.976C547.405 109.864 541.769 109.955 536.469 109.96L536.463 218.957L554.881 218.928L554.927 255.279L573.265 255.295L573.292 291.432C579.219 291.37 585.146 291.346 591.073 291.358C591.107 296.302 590.505 325.172 591.612 327.855L592.909 328.023C598.277 328.105 603.713 327.779 609.061 328.033L609.033 200.701C604.179 201.003 596.102 200.725 591.007 200.71C590.824 188.745 590.984 176.367 590.988 164.37L573.049 164.355C573.343 152.424 572.922 140.055 573.168 127.956C567.079 127.831 560.988 127.849 554.901 128.011C554.828 124.422 555.385 112.681 554.238 110.249L552.68 109.976Z",
        "M500.069 73.3934C494.114 73.6047 487.966 73.5525 481.993 73.5786L482.06 200.686C486.294 200.852 496.4 201.13 500.277 200.595C500.576 218.596 500.383 237.182 500.388 255.234L518.384 255.295C517.825 266.626 519.001 279.929 518.258 291.322L536.455 291.46L536.493 308.937C536.554 309.249 536.807 309.49 536.981 309.756C541.895 310.154 549.559 309.928 554.705 309.903C554.954 298.157 554.718 285.516 554.72 273.696C548.563 273.589 542.283 273.619 536.115 273.589L536.059 237.21C530.388 237.012 524.123 237.106 518.403 237.087L518.151 182.652C512.933 182.299 505.711 182.41 500.267 182.274C499.687 146.13 500.639 109.603 500.069 73.3934Z",
        "M736.571 400.933C719.159 400.541 699.835 400.76 682.412 400.98L682.437 464.058L736.543 464.045L736.571 400.933ZM718.75 436.978C715.552 436.995 702.823 437.222 700.456 436.833C700.586 430.623 700.696 424.905 700.492 418.699C706.14 418.824 713.093 419.139 718.659 418.793C718.667 424.775 718.595 431.018 718.75 436.978Z",
        "M736.584 836.908C733.789 836.869 720.705 836.54 718.626 837.13C718.64 843.028 718.577 849.104 718.686 854.982C724.625 854.798 730.747 854.909 736.702 854.938C736.621 848.93 736.581 842.916 736.584 836.908Z",
        "M481.688 855.108C475.753 855.113 469.823 855.084 463.893 855.021C463.989 860.981 463.897 867.139 463.883 873.114L481.722 873.066L481.688 855.108Z",
    ];
    const frag = document.createDocumentFragment();
    bodyPaths.forEach((d) => {
        const p = document.createElementNS(NS, "path");
        p.setAttribute("d", d);
        p.setAttribute("fill", "currentColor");
        frag.appendChild(p);
    });
    const EYE_X = 686, EYE_Y = 404, EYE_W = 46, EYE_H = 56;
    const eyeBg = document.createElementNS(NS, "rect");
    eyeBg.setAttribute("x", String(EYE_X));
    eyeBg.setAttribute("y", String(EYE_Y));
    eyeBg.setAttribute("width", String(EYE_W));
    eyeBg.setAttribute("height", String(EYE_H));
    eyeBg.setAttribute("fill", "var(--color-bg)");
    frag.appendChild(eyeBg);
    const eyeBorder = document.createElementNS(NS, "rect");
    eyeBorder.setAttribute("x", String(EYE_X));
    eyeBorder.setAttribute("y", String(EYE_Y));
    eyeBorder.setAttribute("width", String(EYE_W));
    eyeBorder.setAttribute("height", String(EYE_H));
    eyeBorder.setAttribute("fill", "none");
    eyeBorder.setAttribute("stroke", "currentColor");
    eyeBorder.setAttribute("stroke-width", "24");
    frag.appendChild(eyeBorder);
    const eyelid = document.createElementNS(NS, "rect") as SVGRectElement;
    eyelid.id = "rh-eyelid";
    eyelid.setAttribute("x", String(EYE_X));
    eyelid.setAttribute("y", String(EYE_Y));
    eyelid.setAttribute("width", String(EYE_W));
    eyelid.setAttribute("height", "0");
    eyelid.setAttribute("fill", "currentColor");
    frag.appendChild(eyelid);
    svg.appendChild(frag);
    return svg;
}

function setupBlink(svg: SVGSVGElement): () => void {
    const found = svg.querySelector<SVGRectElement>("#rh-eyelid");
    if (!found) return () => {};
    const lid = found;
    const FULL_H = 56, STEP_PX = 4, FRAME_MS = 18;
    let rafId = 0, timerId = 0;
    let phase: "idle" | "closing" | "opening" = "idle";
    let h = 0, lastTs = 0;
    function frame(now: number) {
        if (now - lastTs < FRAME_MS) { rafId = requestAnimationFrame(frame); return; }
        lastTs = now;
        if (phase === "closing") {
            h = Math.min(h + STEP_PX, FULL_H);
            lid.setAttribute("height", String(h));
            if (h >= FULL_H) {
                phase = "idle";
                timerId = window.setTimeout(() => { phase = "opening"; rafId = requestAnimationFrame(frame); }, 120);
                return;
            }
        } else if (phase === "opening") {
            h = Math.max(h - STEP_PX, 0);
            lid.setAttribute("height", String(h));
            if (h <= 0) { phase = "idle"; schedule(); return; }
        }
        rafId = requestAnimationFrame(frame);
    }
    function schedule() {
        timerId = window.setTimeout(() => {
            if (phase !== "idle") return;
            phase = "closing";
            rafId = requestAnimationFrame(frame);
        }, 3000 + Math.random() * 3000);
    }
    schedule();
    return () => { cancelAnimationFrame(rafId); clearTimeout(timerId); };
}

function createHopController(svg: SVGSVGElement, maxTravel: number) {
    const HOP_MS = 320;
    const ARC_PX = 7;
    const DWELL_MS = 80;
    const TURN_DWELL_MS = 200;

    let clampedHops = Math.max(1, Math.floor(maxTravel / HOP_DIST));
    let MAX_X = HOP_DIST * clampedHops;
    let running = false, paused = false, pendingStop = false, pendingPause = false;
    let rafId = 0, direction = 1, translateX = 0;
    let hopStartX = 0, legCount = 0, hopStart = 0;
    let phase: "hopping" | "dwelling" = "hopping", phaseUntil = 0;

    const ease = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

    function apply(tx: number, ty: number, flip: boolean) {
        svg.style.transform = `translateX(${tx.toFixed(2)}px) translateY(${ty.toFixed(2)}px) scaleX(${flip ? -1 : 1})`;
    }
    function showAtCurrent() { apply(translateX, 0, direction === -1); }

    function tick(now: number) {
        if (!running || paused) return;
        if (phase === "dwelling") {
            if (now < phaseUntil) { rafId = requestAnimationFrame(tick); return; }
            phase = "hopping";
            hopStartX = translateX;
            hopStart = now;
        }
        const t = Math.min((now - hopStart) / HOP_MS, 1);
        apply(
            Math.max(0, Math.min(hopStartX + direction * HOP_DIST * ease(t), MAX_X)),
            -ARC_PX * Math.sin(t * Math.PI),
            direction === -1,
        );
        if (t < 1) { rafId = requestAnimationFrame(tick); return; }

        translateX = Math.max(0, Math.min(hopStartX + direction * HOP_DIST, MAX_X));
        legCount++;

        if (pendingPause) { pendingPause = false; paused = true; showAtCurrent(); return; }
        if (pendingStop) { running = false; pendingStop = false; showAtCurrent(); return; }

        if (legCount >= clampedHops) {
            direction *= -1;
            legCount = 0;
            apply(translateX, 0, direction === -1);
            phase = "dwelling";
            phaseUntil = performance.now() + TURN_DWELL_MS;
        } else {
            phase = "dwelling";
            phaseUntil = performance.now() + DWELL_MS;
        }
        rafId = requestAnimationFrame(tick);
    }

    function start() {
        pendingStop = false; pendingPause = false;
        if (running) return;
        running = true; paused = false;
        phase = "hopping"; hopStartX = translateX; hopStart = performance.now();
        rafId = requestAnimationFrame(tick);
    }
    function stop() {
        if (!running) { showAtCurrent(); return; }
        if (phase === "hopping") { pendingStop = true; }
        else { running = false; paused = false; cancelAnimationFrame(rafId); showAtCurrent(); }
    }
    function pause() {
        if (!running || paused) return;
        if (phase === "hopping") { pendingPause = true; }
        else { paused = true; cancelAnimationFrame(rafId); showAtCurrent(); }
    }
    function resume() {
        if (!running) return;
        paused = false; pendingPause = false;
        hopStartX = translateX; hopStart = performance.now();
        phase = "hopping";
        rafId = requestAnimationFrame(tick);
    }
    function updateMaxTravel(newMax: number) {
        const newHops = Math.max(1, Math.floor(newMax / HOP_DIST));
        if (newHops === clampedHops) return;
        running = false; paused = false; pendingStop = false; pendingPause = false;
        cancelAnimationFrame(rafId);
        clampedHops = newHops;
        MAX_X = HOP_DIST * clampedHops;
        translateX = Math.min(translateX, MAX_X);
        showAtCurrent();
    }
    return { start, stop, pause, resume, updateMaxTravel };
}

// ─── DOM helpers ──────────────────────────────────────────────────────────────

function findAndWrap(node: Node): HTMLElement | null {
    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        const idx = text.toLowerCase().indexOf(TARGET);
        if (idx === -1 || document.getElementById("rh-trigger")) return null;

        const before = document.createTextNode(text.slice(0, idx));

        const trigger = document.createElement("span");
        trigger.id = "rh-trigger";
        trigger.style.cssText = `
            color: inherit;
            text-decoration: underline;
            text-decoration-thickness: 2px;
            text-underline-offset: 4px;
            text-decoration-color: inherit;
            cursor: crosshair;
            white-space: nowrap;
            transition: color 0.2s ease, text-decoration-color 0.2s ease;
        `;

        const splitAt = TARGET.lastIndexOf(" ") + 1;
        trigger.appendChild(document.createTextNode(TARGET.slice(0, splitAt)));

        const holesAnchor = document.createElement("span");
        holesAnchor.id = "rh-holes-anchor";
        holesAnchor.textContent = TARGET.slice(splitAt);
        holesAnchor.style.cssText = `
            color: inherit;
            position: relative;
            display: inline-block;
            vertical-align: baseline;
            text-decoration: underline;
            text-decoration-thickness: 2px;
            text-underline-offset: 4px;
            text-decoration-color: inherit;
            transition: color 0.2s ease, text-decoration-color 0.2s ease;
        `;
        trigger.appendChild(holesAnchor);

        const after = document.createTextNode(text.slice(idx + TARGET.length));

        node.parentNode?.insertBefore(before, node);
        node.parentNode?.insertBefore(trigger, node);
        node.parentNode?.insertBefore(after, node);
        node.parentNode?.removeChild(node);

        return holesAnchor;
    }
    for (const child of Array.from(node.childNodes)) {
        const result = findAndWrap(child);
        if (result) return result;
    }
    return null;
}

function injectRabbit(holesAnchor: HTMLElement): (() => void) | null {
    if (document.getElementById("rh-rabbit")) return null;
    const rabbit = createRabbitSVG();

    const container = document.createElement("span");
    container.id = "rh-rabbit-container";
    container.style.cssText = `
        position: absolute;
        left: calc(100% + 0.1em);
        top: 50%;
        transform: translateY(-50%);
        overflow: visible;
        pointer-events: none;
        z-index: 1;
    `;
    container.appendChild(rabbit);
    holesAnchor.appendChild(container);

    return setupBlink(rabbit);
}

function computeMaxTravel(svg: SVGSVGElement): number {
    const rect = svg.getBoundingClientRect();
    return Math.max(0, Math.min(window.innerWidth - rect.right - 16, DESKTOP_TRAVEL_PX));
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RabbitHoleVideo(Component: ComponentType): ComponentType {
    return (props: any) => {
        const wrapRef = useRef<HTMLDivElement>(null);

        useSyncEffect(() => {
            const root = wrapRef.current;
            if (!root) return;

            ensureMuxLoaded();

            // The whole feature is built by hand-mutating the DOM (splitting the
            // text node, injecting the SVG, wiring listeners) — none of it is
            // visible to React's virtual DOM. If anything causes this subtree to
            // re-render (e.g. a theme toggle rippling through the tree), React
            // reconciles against what it thinks is still a plain text node and
            // stomps our injected spans back to plain text — the feature just
            // silently disappears, since this effect only runs once on mount.
            // A MutationObserver below detects that and re-runs setup() to heal it.
            type Teardown = (() => void) | null;
            let teardown: Teardown = null;

            const setup = (): Teardown => {
            const textEl =
                root.querySelector<HTMLElement>("h1, h2, h3, h4, p") ??
                (root.firstElementChild as HTMLElement) ??
                root;

            const mobileQuery = window.matchMedia("(hover: none)");
            const isMobile = () => mobileQuery.matches;

            let isOpen = false, isPaused = false;
            let overTrigger = false, overRabbit = false;
            let cleanupBlink: (() => void) | null = null;
            let resizeCleanup: (() => void) | null = null;
            let hopper: ReturnType<typeof createHopController> | null = null;

            // Remove a stale rh-trigger left in the DOM by an exiting page instance
            // (AnimatePresence keeps the old page mounted during its exit animation)
            const stale = document.getElementById("rh-trigger");
            if (stale && !root.contains(stale)) {
                stale.parentNode?.insertBefore(document.createTextNode(TARGET), stale);
                stale.remove();
            }

            const holesAnchor = findAndWrap(textEl);
            if (!holesAnchor) return null;

            cleanupBlink = injectRabbit(holesAnchor);
            const svg = document.getElementById("rh-rabbit") as SVGSVGElement | null;
            let hoverZone: HTMLSpanElement | null = null;

            if (svg) {
                const wrapper = document.createElement("span");
                wrapper.id = "rh-rabbit-wrapper";
                wrapper.style.cssText = `position:relative;display:inline-block;pointer-events:none;`;
                svg.parentNode?.insertBefore(wrapper, svg);
                wrapper.appendChild(svg);

                let maxTravel = computeMaxTravel(svg);
                hopper = createHopController(svg, maxTravel);

                hoverZone = document.createElement("span");
                hoverZone.id = "rh-hover-zone";
                hoverZone.style.cssText = `
                    position: absolute; left: 0; top: -0.5em;
                    width: ${maxTravel + 24}px; bottom: -0.5em;
                    pointer-events: all; cursor: crosshair;
                `;
                wrapper.appendChild(hoverZone);

                requestAnimationFrame(() =>
                    requestAnimationFrame(() => {
                        svg.style.transition = "opacity 0.15s ease";
                        svg.style.opacity = "1";
                    })
                );

                hoverZone.addEventListener("mouseenter", () => {
                    overRabbit = true;
                    if (!isMobile()) open();
                });
                hoverZone.addEventListener("mouseleave", () => {
                    overRabbit = false;
                    if (!isMobile()) maybeClose();
                });
                hoverZone.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (!isMobile()) togglePause();
                    else isOpen ? close() : open();
                });

                let resizeRaf = 0;
                const onResize = () => {
                    cancelAnimationFrame(resizeRaf);
                    resizeRaf = requestAnimationFrame(() => {
                        maxTravel = computeMaxTravel(svg);
                        hopper?.updateMaxTravel(maxTravel);
                        if (hoverZone) hoverZone.style.width = `${maxTravel + 24}px`;
                    });
                };
                window.addEventListener("resize", onResize, { passive: true });
                resizeCleanup = () => {
                    cancelAnimationFrame(resizeRaf);
                    window.removeEventListener("resize", onResize);
                };
            }

            const trigger = document.getElementById("rh-trigger")!;

            const win = document.createElement("div");
            win.style.cssText = `
                position: fixed; z-index: 99999; pointer-events: none;
                opacity: 0; left: -9999px; top: -9999px;
                transform: scale(0.96);
                transition: opacity 0.22s ease, transform 0.26s cubic-bezier(0.34,1.2,0.64,1);
                width: 360px; aspect-ratio: 16/9;
                border-radius: 3px; overflow: hidden;
                box-shadow: 0 8px 32px rgba(0,0,0,0.12); background: #000;
            `;
            document.body.appendChild(win);

            let playerMounted = false, player: any = null;

            function mountPlayer() {
                if (playerMounted) return;
                playerMounted = true;
                player = document.createElement("mux-player");
                player.setAttribute("playback-id", PLAYBACK_ID);
                player.setAttribute("preload", "auto");
                player.setAttribute("autoplay", "muted");
                player.setAttribute("loop", "");
                player.setAttribute("muted", "");
                player.setAttribute("no-controls", "");
                player.style.cssText = `
                    position: absolute; top: 50%; left: 50%;
                    width: 104%; height: 104%;
                    transform: translate(-50%, -50%);
                    display: block; pointer-events: none;
                    --controls: none; --media-object-fit: cover;
                    --media-object-position: center;
                `;
                win.appendChild(player);
                requestAnimationFrame(() => {
                    player.muted = true;
                    player.volume = 0;
                    player.play?.().catch(() => {});
                });
            }

            function position() {
                const rect = trigger.getBoundingClientRect();
                const vw = window.innerWidth;
                const popW = Math.min(360, Math.max(240, vw * 0.85));
                const popH = Math.round((popW * 9) / 16);
                const ideal = rect.left + rect.width / 2 - popW / 2;
                const left = Math.max(12, Math.min(ideal, vw - popW - 12));
                const isAbove = rect.top > popH + 24;
                const top = isAbove ? rect.top - popH - 16 : rect.bottom + 8;
                win.style.width = `${popW}px`;
                win.style.left = `${left}px`;
                win.style.top = `${top}px`;
                // Scale from the edge nearest the trigger word so the popup
                // feels spatially anchored to where it came from.
                win.style.transformOrigin = isAbove ? "bottom center" : "top center";
            }

            function open() {
                mountPlayer();
                position();
                isOpen = true;
                isPaused = false;
                win.style.pointerEvents = "none";
                win.style.opacity = "1";
                win.style.transform = "scale(1)";
                player?.play?.().catch(() => {});
                hopper?.start();
            }
            function close() {
                isOpen = false;
                isPaused = false;
                win.style.opacity = "0";
                win.style.transform = "scale(0.96)";
                player?.pause?.();
                hopper?.stop();
            }
            function togglePause() {
                if (!isOpen) return;
                isPaused = !isPaused;
                if (isPaused) {
                    player?.pause?.();
                    hopper?.pause();
                } else {
                    player?.play?.().catch(() => {});
                    hopper?.resume();
                }
            }
            const maybeClose = () => { if (!overTrigger && !overRabbit) close(); };

            trigger.addEventListener("mouseenter", () => {
                overTrigger = true;
                if (!isMobile()) open();
            });
            trigger.addEventListener("mouseleave", () => {
                overTrigger = false;
                if (!isMobile()) maybeClose();
            });
            trigger.addEventListener("click", (e) => {
                e.stopPropagation();
                if (!isMobile()) togglePause();
                else isOpen ? close() : open();
            });

            function onDocTap(e: MouseEvent | TouchEvent) {
                if (!isOpen || !isMobile()) return;
                const t = e.target as Node;
                if (!win.contains(t) && t !== trigger) close();
            }
            document.addEventListener("mousedown", onDocTap, { passive: true });
            document.addEventListener("touchstart", onDocTap, { passive: true });

            return () => {
                cleanupBlink?.();
                resizeCleanup?.();
                hopper?.stop();
                document.removeEventListener("mousedown", onDocTap);
                document.removeEventListener("touchstart", onDocTap);
                win.remove();
                // Undo the DOM wrapping so StrictMode re-mount and navigation work correctly
                if (trigger?.parentNode) {
                    trigger.parentNode.insertBefore(document.createTextNode(TARGET), trigger);
                    trigger.parentNode.removeChild(trigger);
                }
            };
            };

            teardown = setup();

            // Self-heal: if #rh-trigger ever goes missing while this component is
            // still mounted (React reconciliation wiped it), tear down whatever's
            // left and set back up. The idempotent guards in setup()/injectRabbit
            // make this safe to also fire (as a no-op) from setup()'s own mutations.
            const observer = new MutationObserver(() => {
                if (document.getElementById("rh-trigger")) return;
                teardown?.();
                teardown = setup();
            });
            observer.observe(root, { childList: true, subtree: true });

            return () => {
                observer.disconnect();
                teardown?.();
            };
        }, []);

        return (
            <div ref={wrapRef} style={{ display: "contents" }}>
                <Component {...props} />
            </div>
        );
    };
}
