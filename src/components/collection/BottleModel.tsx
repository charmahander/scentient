"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Fragrance } from "@/types";
import { parseJson, getAccordColor } from "@/lib/utils";

interface BottleModelProps {
  fragrance: Fragrance;
  position: [number, number, number];
  selected: boolean;
  onSelect: () => void;
}

function getBottleGeometry(shape: string | null | undefined): [string, [number, number, number, number]] {
  switch (shape) {
    case "round":
      return ["cylinder", [0.18, 0.18, 0.75, 24]];
    case "rectangular":
      return ["box", [0.28, 0.8, 0.18, 1]];
    case "spray":
      return ["cylinder", [0.15, 0.18, 0.85, 6]];
    case "flacon":
      return ["cylinder", [0.2, 0.14, 0.9, 16]];
    default:
      return ["box", [0.22, 0.85, 0.16, 1]];
  }
}

function getBottleColor(fragrance: Fragrance): string {
  const accords = parseJson<string[]>(fragrance.accords, []);
  if (accords.length > 0) return getAccordColor(accords[0]);

  // Fallback by brand
  const brand = fragrance.brand.toLowerCase();
  if (brand.includes("chanel")) return "#c8a96d";
  if (brand.includes("dior")) return "#4a7cc7";
  if (brand.includes("tom ford")) return "#2d2d2d";
  if (brand.includes("gucci")) return "#8b6340";
  return "#7c7c9c";
}

export function BottleModel({ fragrance, position, selected, onSelect }: BottleModelProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [geoType, geoDims] = getBottleGeometry(fragrance.bottleShape);
  const bottleColor = useMemo(() => getBottleColor(fragrance), [fragrance]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetY = selected ? 0.15 : hovered ? 0.06 : 0;
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.1;
    if (selected && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  const glassColor = new THREE.Color(bottleColor);

  return (
    <group position={position}>
      <group ref={groupRef}>
        {/* Main bottle body */}
        <mesh
          ref={meshRef}
          castShadow
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
        >
          {geoType === "box" ? (
            <boxGeometry args={[geoDims[0], geoDims[1], geoDims[2]]} />
          ) : (
            <cylinderGeometry args={[geoDims[0], geoDims[1], geoDims[2], geoDims[3]]} />
          )}
          <meshPhysicalMaterial
            color={glassColor}
            transparent
            opacity={0.55}
            roughness={0.05}
            metalness={0.0}
            transmission={0.7}
            ior={1.5}
            thickness={0.5}
            reflectivity={1}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* Liquid inside */}
        <mesh position={[0, -0.1, 0]}>
          {geoType === "box" ? (
            <boxGeometry args={[geoDims[0] * 0.85, geoDims[1] * 0.65, geoDims[2] * 0.85]} />
          ) : (
            <cylinderGeometry args={[geoDims[0] * 0.8, geoDims[1] * 0.8, geoDims[2] * 0.6, geoDims[3]]} />
          )}
          <meshPhysicalMaterial
            color={glassColor}
            transparent
            opacity={0.6}
            roughness={0.1}
            metalness={0}
          />
        </mesh>

        {/* Cap / atomizer */}
        <mesh position={[0, geoDims[1] / 2 + 0.1, 0]}>
          <boxGeometry args={[geoDims[0] * 0.7, 0.15, geoDims[2] * 0.7]} />
          <meshStandardMaterial color="#c8a96d" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Spray nozzle */}
        <mesh position={[0, geoDims[1] / 2 + 0.22, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.12, 8]} />
          <meshStandardMaterial color="#a08040" roughness={0.3} metalness={0.9} />
        </mesh>

        {/* Selection glow ring */}
        {selected && (
          <mesh position={[0, -geoDims[1] / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[geoDims[0] * 0.9, geoDims[0] * 1.4, 32]} />
            <meshBasicMaterial color="#c9a96e" transparent opacity={0.4} />
          </mesh>
        )}

        {/* Label */}
        <Html
          position={[0, -geoDims[1] / 2 - 0.3, 0]}
          center
          style={{ pointerEvents: "none", whiteSpace: "nowrap" }}
        >
          <div
            style={{
              background: "rgba(9,9,11,0.85)",
              border: "1px solid rgba(201,169,110,0.3)",
              borderRadius: 8,
              padding: "2px 8px",
              fontSize: 9,
              color: selected ? "#c9a96e" : "rgba(255,255,255,0.7)",
              backdropFilter: "blur(8px)",
              transition: "color 0.2s",
              maxWidth: 100,
              textAlign: "center",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 9 }}>{fragrance.brand}</div>
            <div style={{ opacity: 0.7, fontSize: 8 }}>{fragrance.name}</div>
          </div>
        </Html>
      </group>
    </group>
  );
}
