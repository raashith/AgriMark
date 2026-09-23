'use client';

import React, { useEffect, useRef } from 'react';

export const Agrimark3DCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;

    function syncSize() {
      if (!canvas) return;
      const w = window.innerWidth || canvas.clientWidth || 1280;
      const h = window.innerHeight || canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    window.addEventListener('resize', syncSize);
    syncSize();

    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fs = `precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy) );
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  
  vec2 mouseNorm = (u_mouse / u_resolution.xy) - 0.5;
  p += mouseNorm * 0.08;

  float t = u_time * 0.15;

  vec3 colDeepLoam = vec3(0.027, 0.067, 0.051);
  vec3 colEmerald = vec3(0.106, 0.302, 0.243);
  vec3 colHarvestGrn = vec3(0.243, 0.482, 0.329);
  vec3 colGold = vec3(0.898, 0.663, 0.235);
  vec3 colSunWarm = vec3(0.988, 0.882, 0.588);
  vec3 colTealRiver = vec3(0.176, 0.831, 0.749);

  float horizon = 0.12 + mouseNorm.y * 0.05;
  float skyFactor = smoothstep(horizon - 0.2, horizon + 0.65, p.y);
  
  vec2 sunPos = vec2(0.0 + mouseNorm.x * 0.1, horizon + 0.22);
  float distSun = length(p - sunPos);
  float sunDisc = smoothstep(0.38, 0.01, distSun);
  float sunGlow = exp(-distSun * 2.2) * 0.85;

  vec3 sky = mix(colDeepLoam, vec3(0.06, 0.14, 0.10), skyFactor);
  sky += (colGold * 0.7 + colSunWarm * 0.5) * sunGlow;
  sky += colSunWarm * sunDisc * 0.9;

  float mtnNoise = snoise(vec2(p.x * 1.4 + 1.2, 0.5)) * 0.14 + snoise(vec2(p.x * 3.2, 1.8)) * 0.06;
  float mtnLine = horizon + 0.05 + mtnNoise;
  float mtnMask = smoothstep(mtnLine + 0.01, mtnLine - 0.01, p.y);
  vec3 mtnCol = mix(vec3(0.05, 0.12, 0.09), colDeepLoam, (p.y - horizon) * 2.0);

  float groundMask = step(p.y, horizon);
  vec2 groundUV = vec2(p.x / (horizon - p.y + 0.18), 1.0 / (horizon - p.y + 0.18));
  groundUV.y += t * 1.8;

  float fieldContour = snoise(groundUV * vec2(0.8, 0.3));
  float rowBands = sin(groundUV.x * 14.0 + fieldContour * 3.0);
  float furrow = smoothstep(-0.2, 0.8, rowBands);

  float riverPath = sin(groundUV.y * 0.45 + t * 0.5) * 0.65;
  float riverDist = abs(groundUV.x - riverPath);
  float riverMask = smoothstep(0.45, 0.08, riverDist);
  float riverPulse = sin(groundUV.y * 3.0 - t * 6.0) * 0.5 + 0.5;

  vec2 gridUV = fract(groundUV * vec2(1.5, 0.75)) - 0.5;
  float gridLines = smoothstep(0.06, 0.0, abs(gridUV.x)) + smoothstep(0.06, 0.0, abs(gridUV.y));
  float nodePoints = smoothstep(0.12, 0.02, length(gridUV)) * (sin(groundUV.y * 2.0 + t * 4.0) * 0.5 + 0.5);

  vec3 terrainCol = mix(colDeepLoam, colEmerald * 0.85, furrow);
  terrainCol = mix(terrainCol, colHarvestGrn * 0.9, fieldContour * 0.5 + 0.5);
  
  vec3 riverCol = mix(colTealRiver * 0.6, colSunWarm, riverPulse * 0.45);
  terrainCol = mix(terrainCol, riverCol, riverMask * 0.85);

  terrainCol += colGold * (gridLines * 0.18 + nodePoints * 0.7) * (1.0 - riverMask * 0.5);

  float depthFog = smoothstep(horizon - 0.8, horizon, p.y);
  vec3 groundWithFog = mix(terrainCol, mix(colEmerald * 0.5, colGold * 0.4, 0.4), depthFog * 0.75);

  vec3 finalColor = sky;
  finalColor = mix(finalColor, mtnCol, mtnMask * (1.0 - groundMask));
  finalColor = mix(finalColor, groundWithFog, groundMask);

  float vignette = 1.0 - length(uv - 0.5) * 0.7;
  finalColor *= clamp(vignette, 0.2, 1.0);

  gl_FragColor = vec4(finalColor, 1.0);
}`;

    function createShader(type: number, src: string) {
      if (!gl) return null;
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    const vertShader = createShader(gl.VERTEX_SHADER, vs);
    const fragShader = createShader(gl.FRAGMENT_SHADER, fs);
    if (!vertShader || !fragShader) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vertShader);
    gl.attachShader(prog, fragShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    let mouse = { x: (window.innerWidth || 1280) / 2, y: (window.innerHeight || 720) / 2 };

    const handleMouseMove = (event: MouseEvent) => {
      const w = window.innerWidth || canvas.width || 1;
      const h = window.innerHeight || canvas.height || 1;
      mouse.x = (event.clientX / w) * canvas.width;
      mouse.y = (1.0 - (event.clientY / h)) * canvas.height;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    function render(t: number) {
      if (!gl || !canvas) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', syncSize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden" style={{ display: 'block' }}>
      <canvas ref={canvasRef} className="w-full h-full block opacity-85" id="shader-canvas-ANIMATION_18" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#04100B]/80 via-transparent to-[#04100B]/90 mix-blend-multiply" />
      <div className="fixed inset-0 pointer-events-none z-0 tech-grid opacity-75" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1300px] h-[550px] bg-gradient-to-b from-[#1B4D3E]/30 via-[#E5A93C]/10 to-transparent blur-[140px] pointer-events-none z-0" />
    </div>
  );
};
