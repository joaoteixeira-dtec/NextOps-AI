import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ── Floating particle constellation ── */
function Particles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null!);

  const { positions, basePositions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      [0.39, 0.4, 0.95],   // indigo
      [0.13, 0.83, 0.93],   // cyan
      [0.66, 0.55, 0.98],   // violet
      [0.2, 0.82, 0.6],     // emerald
      [0.91, 0.47, 0.98],   // fuchsia
    ];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
    }
    return { positions: pos, basePositions: new Float32Array(pos), colors: col };
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * 0.12;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = basePositions[i3] + Math.sin(t + i * 0.25) * 0.2;
      pos[i3 + 1] = basePositions[i3 + 1] + Math.cos(t * 0.7 + i * 0.18) * 0.18;
      pos[i3 + 2] = basePositions[i3 + 2] + Math.sin(t * 0.4 + i * 0.12) * 0.1;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.y = t * 0.06;
    ref.current.rotation.x = Math.sin(t * 0.3) * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        vertexColors
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ── Floating connection lines between nearby particles ── */
function ConnectionLines({ count }: { count: number }) {
  const ref = useRef<THREE.LineSegments>(null!);
  const maxConnections = 80;
  const maxDist = 2.8;

  const positions = useMemo(() => new Float32Array(maxConnections * 6), [maxConnections]);

  useFrame(({ scene }) => {
    if (!ref.current) return;
    const points = scene.children.find((c) => c.type === "Points") as THREE.Points | undefined;
    if (!points) return;

    const posArr = points.geometry.attributes.position.array as Float32Array;
    const linePos = ref.current.geometry.attributes.position.array as Float32Array;
    let lineIdx = 0;

    for (let i = 0; i < count && lineIdx < maxConnections; i++) {
      for (let j = i + 1; j < count && lineIdx < maxConnections; j++) {
        const dx = posArr[i * 3] - posArr[j * 3];
        const dy = posArr[i * 3 + 1] - posArr[j * 3 + 1];
        const dz = posArr[i * 3 + 2] - posArr[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxDist) {
          const li = lineIdx * 6;
          linePos[li] = posArr[i * 3];
          linePos[li + 1] = posArr[i * 3 + 1];
          linePos[li + 2] = posArr[i * 3 + 2];
          linePos[li + 3] = posArr[j * 3];
          linePos[li + 4] = posArr[j * 3 + 1];
          linePos[li + 5] = posArr[j * 3 + 2];
          lineIdx++;
        }
      }
    }

    // Clear remaining
    for (let i = lineIdx * 6; i < maxConnections * 6; i++) {
      linePos[i] = 0;
    }

    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.geometry.setDrawRange(0, lineIdx * 2);
  });

  return (
    <lineSegments ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={maxConnections * 2} array={positions} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color="#6366f1" transparent opacity={0.08} depthWrite={false} blending={THREE.AdditiveBlending} />
    </lineSegments>
  );
}

export function ParticleField() {
  const [show, setShow] = useState(false);
  const [count, setCount] = useState(100);

  useEffect(() => {
    const w = window.innerWidth;
    if (w >= 768) {
      setShow(true);
      setCount(w >= 1024 ? 140 : 90);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="absolute inset-0 opacity-50">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        dpr={[1, 1.5]}
        style={{ pointerEvents: "none" }}
      >
        <Particles count={count} />
        <ConnectionLines count={count} />
      </Canvas>
    </div>
  );
}
