import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Billboard, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Zone, Worker, Vehicle, Device } from '@/lib/simulation';

// ─── Zone 3D placement: x, y (depth into screen), z (vertical level) ───
const ZONE_3D: { idx: number; pos: [number, number, number]; size: [number, number, number] }[] = [
  { idx: 0, pos: [-6, 0, 4], size: [5, 1.4, 1.6] },
  { idx: 1, pos: [0, 0, 4], size: [5, 1.4, 1.6] },
  { idx: 2, pos: [6, 0, 4], size: [5, 1.4, 1.6] },
  { idx: 3, pos: [-6, 0, 0], size: [5, 1.4, 1.6] },
  { idx: 5, pos: [0, 0, 0], size: [5, 1.4, 1.6] },
  { idx: 4, pos: [6, 0, 0], size: [5, 1.4, 1.6] },
  { idx: 6, pos: [-6, 0, -4], size: [5, 1.4, 1.6] },
  { idx: 7, pos: [0, 0, -4], size: [5, 1.4, 1.6] },
  { idx: 8, pos: [6, 0, -4], size: [5, 1.4, 1.6] },
];

const SHAFT_POSITIONS: [number, number, number][] = [[-9, 0, 0], [9, 0, 0]];

const riskColorHex = (level: string) => {
  if (level === 'critical') return '#ef4444';
  if (level === 'warning') return '#eab308';
  return '#22c55e';
};

const riskEmissive = (level: string) => {
  if (level === 'critical') return '#ff0000';
  if (level === 'warning') return '#aa8800';
  return '#005500';
};

// ─── Tunnel Zone ───
function TunnelZone({ zone, position, size, selected, onClick }: {
  zone: Zone; position: [number, number, number]; size: [number, number, number];
  selected: boolean; onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = riskColorHex(zone.riskLevel);
  const emissive = riskEmissive(zone.riskLevel);

  useFrame((_, delta) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      const target = selected ? 0.4 : 0.15;
      mat.emissiveIntensity += (target - mat.emissiveIntensity) * delta * 4;
    }
  });

  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <RoundedBox ref={meshRef} args={size} radius={0.15} smoothness={4}>
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.35}
          emissive={emissive}
          emissiveIntensity={0.15}
          side={THREE.DoubleSide}
        />
      </RoundedBox>
      {/* Wireframe overlay */}
      <RoundedBox args={size} radius={0.15} smoothness={4}>
        <meshBasicMaterial color={color} wireframe transparent opacity={selected ? 0.6 : 0.3} />
      </RoundedBox>
      {/* Zone label */}
      <Billboard position={[0, size[1] / 2 + 0.3, 0]}>
        <Text fontSize={0.28} color="#e2e8f0" anchorX="center" anchorY="bottom" font={undefined}>
          {zone.name}
        </Text>
        <Text fontSize={0.2} color={color} anchorX="center" anchorY="top" position={[0, -0.05, 0]} font={undefined}>
          CO: {zone.gasLevels.CO.toFixed(1)} ppm
        </Text>
      </Billboard>
    </group>
  );
}

// ─── Shaft Column ───
function ShaftColumn({ position, label }: { position: [number, number, number]; label: string }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.6, 0.8, 10, 8]} />
        <meshStandardMaterial color="#0ea5e9" transparent opacity={0.12} emissive="#0ea5e9" emissiveIntensity={0.1} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.6, 0.8, 10, 8]} />
        <meshBasicMaterial color="#0ea5e9" wireframe transparent opacity={0.25} />
      </mesh>
      <Billboard position={[0, 5.5, 0]}>
        <Text fontSize={0.3} color="#7dd3fc" font={undefined}>{label}</Text>
      </Billboard>
    </group>
  );
}

// ─── Tunnel Connector (pipes between zones) ───
function TunnelConnector({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const mid = useMemo(() => new THREE.Vector3(
    (from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2
  ), [from, to]);
  const dir = useMemo(() => new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]), [from, to]);
  const len = dir.length();

  return (
    <group position={mid}>
      <mesh rotation={[0, Math.atan2(dir.x, dir.z), 0]}>
        <boxGeometry args={[0.2, 0.2, len]} />
        <meshStandardMaterial color="#22d3ee" transparent opacity={0.15} emissive="#22d3ee" emissiveIntensity={0.1} />
      </mesh>
    </group>
  );
}

// ─── Animated Worker Dot ───
function WorkerDot({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2 + position[0]) * 0.05;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.8} />
    </mesh>
  );
}

// ─── Vehicle Box ───
function VehicleBox({ position, type }: { position: [number, number, number]; type: string }) {
  const color = type === 'truck' ? '#f97316' : type === 'loader' ? '#eab308' : '#a855f7';
  return (
    <mesh position={position}>
      <boxGeometry args={[0.25, 0.15, 0.35]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </mesh>
  );
}

// ─── Device Marker ───
function DeviceMarker({ position, type }: { position: [number, number, number]; type: Device['type'] }) {
  const color = type === 'gas_sensor' ? '#f59e0b' : type === 'env_sensor' ? '#3b82f6'
    : type === 'ble_tracker' ? '#10b981' : type === 'rfid_reader' ? '#a855f7' : '#ec4899';
  return (
    <mesh position={position}>
      <octahedronGeometry args={[0.08, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
    </mesh>
  );
}

// ─── Airflow Particles ───
function AirflowParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 200;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 3;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      const x = pos.getX(i) + delta * 1.5;
      pos.setX(i, x > 10 ? -10 : x);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#22d3ee" size={0.04} transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

// ─── Connections between adjacent zones ───
const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [3, 4], [4, 5], [6, 7], [7, 8],
  [0, 3], [3, 6], [2, 5], [5, 8], [1, 4], [4, 7],
];

// ─── Pseudo-random seeded position within zone bounds ───
function seededPos(seed: number, zonePos: [number, number, number], zoneSize: [number, number, number]): [number, number, number] {
  const s = (n: number) => {
    const x = Math.sin(n * 9301 + 49297) % 1;
    return x - Math.floor(x);
  };
  return [
    zonePos[0] + (s(seed) - 0.5) * (zoneSize[0] - 1),
    zonePos[1] + (s(seed + 100) - 0.5) * (zoneSize[1] - 0.4),
    zonePos[2] + (s(seed + 200) - 0.5) * (zoneSize[2] - 0.6),
  ];
}

// ─── Main Scene ───
function MineScene({ zones, workers, vehicles, devices, selectedZone, onSelectZone }: {
  zones: Zone[]; workers: Worker[]; vehicles: Vehicle[]; devices: Device[];
  selectedZone: Zone | null; onSelectZone: (z: Zone | null) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 15, 10]} intensity={0.6} />
      <pointLight position={[0, 8, 0]} intensity={0.4} color="#22d3ee" />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[24, 16]} />
        <meshStandardMaterial color="#0a0f1a" transparent opacity={0.5} />
      </mesh>

      {/* Grid */}
      <gridHelper args={[24, 24, '#1e3a5f', '#0d1b2a']} position={[0, -1.49, 0]} />

      {/* Shafts */}
      <ShaftColumn position={SHAFT_POSITIONS[0]} label="Shaft A" />
      <ShaftColumn position={SHAFT_POSITIONS[1]} label="Shaft B" />

      {/* Zone tunnels */}
      {ZONE_3D.map(({ idx, pos, size }) => {
        const zone = zones[idx];
        if (!zone) return null;
        return (
          <TunnelZone
            key={zone.id}
            zone={zone}
            position={pos}
            size={size}
            selected={selectedZone?.id === zone.id}
            onClick={() => onSelectZone(selectedZone?.id === zone.id ? null : zone)}
          />
        );
      })}

      {/* Connections */}
      {CONNECTIONS.map(([a, b], i) => {
        const za = ZONE_3D.find(z => z.idx === a);
        const zb = ZONE_3D.find(z => z.idx === b);
        if (!za || !zb) return null;
        return <TunnelConnector key={i} from={za.pos} to={zb.pos} />;
      })}

      {/* Workers */}
      {workers.map((w, i) => {
        const z3d = ZONE_3D.find(z => zones[z.idx]?.id === w.zone);
        if (!z3d) return null;
        return <WorkerDot key={w.id} position={seededPos(i * 7, z3d.pos, z3d.size)} />;
      })}

      {/* Vehicles */}
      {vehicles.map((v, i) => {
        const z3d = ZONE_3D.find(z => zones[z.idx]?.id === v.zone);
        if (!z3d) return null;
        return <VehicleBox key={v.id} position={seededPos(i * 13 + 50, z3d.pos, z3d.size)} type={v.type} />;
      })}

      {/* Devices */}
      {devices.map((d, i) => {
        const z3d = ZONE_3D.find(z => zones[z.idx]?.id === d.zone);
        if (!z3d) return null;
        return <DeviceMarker key={d.id} position={seededPos(i * 23 + 100, z3d.pos, z3d.size)} type={d.type} />;
      })}

      {/* Airflow particles */}
      <AirflowParticles />

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        maxPolarAngle={Math.PI / 2.2}
        minDistance={5}
        maxDistance={25}
        target={[0, 0, 0]}
      />
    </>
  );
}

// ─── Exported Canvas Wrapper ───
export default function MineScene3DCanvas({ zones, workers, vehicles, devices, selectedZone, onSelectZone }: {
  zones: Zone[]; workers: Worker[]; vehicles: Vehicle[]; devices: Device[];
  selectedZone: Zone | null; onSelectZone: (z: Zone | null) => void;
}) {
  return (
    <Canvas
      camera={{ position: [12, 10, 12], fov: 50 }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
    >
      <MineScene
        zones={zones} workers={workers} vehicles={vehicles} devices={devices}
        selectedZone={selectedZone} onSelectZone={onSelectZone}
      />
    </Canvas>
  );
}
