"use client";

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Lightformer } from "@react-three/drei";
import { Fragrance } from "@/types";
import { ShelfLayout } from "./ShelfLayout";

interface CollectionSceneProps {
  fragrances: Fragrance[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CollectionScene({ fragrances, selectedId, onSelect }: CollectionSceneProps) {
  const owned = fragrances.filter((f) => f.owned);

  return (
    <div className="w-full" style={{ height: "60vh", minHeight: 320 }}>
      <Canvas
        camera={{ position: [0, 2, 7], fov: 50 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#09090b"]} />
        <fog attach="fog" args={["#09090b", 12, 25]} />

        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-3, 4, -2]} intensity={0.6} color="#c9a96e" />
        <pointLight position={[3, 3, 3]} intensity={0.4} color="#7dd3fc" />

        <Suspense fallback={null}>
          <ShelfLayout
            fragrances={owned}
            selectedId={selectedId}
            onSelect={onSelect}
          />
          <ContactShadows
            position={[0, -0.01, 0]}
            opacity={0.6}
            scale={20}
            blur={2}
            far={4}
          />
          {/* Procedural environment for reflections — no network fetch */}
          <Environment resolution={256}>
            <Lightformer intensity={1.2} position={[0, 5, -5]} scale={[12, 12, 1]} color="#ffffff" />
            <Lightformer intensity={0.6} position={[-5, 1, 1]} scale={[6, 6, 1]} color="#c9a96e" />
            <Lightformer intensity={0.5} position={[5, 2, 2]} scale={[6, 6, 1]} color="#7dd3fc" />
          </Environment>
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={12}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          target={[0, 0.5, 0]}
          makeDefault
        />
      </Canvas>
    </div>
  );
}
