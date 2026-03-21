"use client";

import { useMemo } from "react";
import { Fragrance } from "@/types";
import { BottleModel } from "./BottleModel";

interface ShelfLayoutProps {
  fragrances: Fragrance[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const SHELF_ROWS = 2;
const BOTTLES_PER_ROW = 6;
const BOTTLE_SPACING = 1.5;
const ROW_DEPTH = 1.6;
const SHELF_Y = [0, 1.7];

function Shelf({ y, width }: { y: number; width: number }) {
  return (
    <group position={[0, y, 0]}>
      {/* Shelf board */}
      <mesh receiveShadow position={[0, -0.04, 0]}>
        <boxGeometry args={[width + 0.5, 0.06, 0.7]} />
        <meshStandardMaterial color="#2a1f10" roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Shelf edge highlight */}
      <mesh position={[0, -0.01, 0.35]}>
        <boxGeometry args={[width + 0.5, 0.02, 0.02]} />
        <meshStandardMaterial color="#3d2d16" roughness={0.6} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 0.6, -0.36]} receiveShadow>
        <boxGeometry args={[width + 0.5, 1.4, 0.04]} />
        <meshStandardMaterial color="#1a1208" roughness={0.95} />
      </mesh>
    </group>
  );
}

export function ShelfLayout({ fragrances, selectedId, onSelect }: ShelfLayoutProps) {
  const positioned = useMemo(() => {
    const result = [];
    for (let row = 0; row < SHELF_ROWS; row++) {
      const start = row * BOTTLES_PER_ROW;
      const rowFragrances = fragrances.slice(start, start + BOTTLES_PER_ROW);
      for (let col = 0; col < rowFragrances.length; col++) {
        const f = rowFragrances[col];
        const rowWidth = Math.min(rowFragrances.length, BOTTLES_PER_ROW) * BOTTLE_SPACING;
        const x = col * BOTTLE_SPACING - rowWidth / 2 + BOTTLE_SPACING / 2;
        const y = SHELF_Y[row] ?? row * 1.7;
        result.push({ fragrance: f, position: [x, y, 0] as [number, number, number] });
      }
    }
    return result;
  }, [fragrances]);

  const shelfWidth = Math.min(fragrances.length, BOTTLES_PER_ROW) * BOTTLE_SPACING;

  return (
    <group>
      {SHELF_Y.map((y, i) => (
        <Shelf key={i} y={y} width={shelfWidth} />
      ))}

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.07, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0d0d10" roughness={1} />
      </mesh>

      {positioned.map(({ fragrance, position }) => (
        <BottleModel
          key={fragrance.id}
          fragrance={fragrance}
          position={position}
          selected={selectedId === fragrance.id}
          onSelect={() => onSelect(fragrance.id)}
        />
      ))}
    </group>
  );
}
