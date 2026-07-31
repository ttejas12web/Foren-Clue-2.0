import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';

function createForenclueEmbroideryTexture() {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#0a1128';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#1e2942';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 6) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let j = 0; j < canvas.height; j += 6) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
    }

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 12;
    ctx.setLineDash([22, 14]);
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    ctx.setLineDash([]);
    ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.strokeRect(46, 46, canvas.width - 92, canvas.height - 92);

    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('🔬  LEFT STAGE  ✦  OPTICAL BRIDGE  ✦  RIGHT STAGE  🔬', canvas.width / 2, 100);

    ctx.shadowColor = '#d97706';
    ctx.shadowBlur = 14;
    ctx.font = '900 76px "Montserrat", "Arial Black", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('FORENCLUE COMPARISON LAB', canvas.width / 2, 215);

    ctx.shadowBlur = 0;
    ctx.font = '700 30px "Montserrat", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('FORENSIC BALLISTICS & TRACE COMPARISON MICROSCOPE', canvas.width / 2, 310);

    ctx.font = '600 22px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('DUAL-STAGE OPTICAL BRIDGE SYSTEM • MODEL CM-900', canvas.width / 2, 390);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

interface ComparisonMicroscope3DProps {
  leftFocus?: number;
  rightFocus?: number;
  objective?: number;
  lightIntensity?: number;
  leftStageX?: number;
  leftStageY?: number;
  rightStageX?: number;
  rightStageY?: number;
  leftRotation?: number;
  rightRotation?: number;
  splitPosition?: number;
  category?: 'ballistics' | 'cartridge' | 'fiber' | 'toolmark';
}

export function ComparisonMicroscope3D({
  leftFocus = 50,
  rightFocus = 50,
  objective = 10,
  lightIntensity = 50,
  leftStageX = 50,
  leftStageY = 50,
  rightStageX = 50,
  rightStageY = 50,
  leftRotation = 0,
  rightRotation = 0,
  splitPosition = 50,
  category = 'ballistics'
}: ComparisonMicroscope3DProps) {
  const leftStageRef = useRef<THREE.Group>(null);
  const rightStageRef = useRef<THREE.Group>(null);
  const leftSpecimenRef = useRef<THREE.Group>(null);
  const rightSpecimenRef = useRef<THREE.Group>(null);

  const embroideryTexture = useMemo(() => createForenclueEmbroideryTexture(), []);

  useFrame(() => {
    // Smooth stage height adjust based on focus
    if (leftStageRef.current) {
      const targetY = 1.6 + (leftFocus - 50) * 0.005;
      leftStageRef.current.position.y = THREE.MathUtils.lerp(leftStageRef.current.position.y, targetY, 0.1);
    }
    if (rightStageRef.current) {
      const targetY = 1.6 + (rightFocus - 50) * 0.005;
      rightStageRef.current.position.y = THREE.MathUtils.lerp(rightStageRef.current.position.y, targetY, 0.1);
    }

    // Specimen rotations
    if (leftSpecimenRef.current) {
      leftSpecimenRef.current.rotation.y = THREE.MathUtils.degToRad(leftRotation);
    }
    if (rightSpecimenRef.current) {
      rightSpecimenRef.current.rotation.y = THREE.MathUtils.degToRad(rightRotation);
    }
  });

  const bodyMaterialProps = {
    color: "#1e293b",
    metalness: 0.8,
    roughness: 0.2,
  };

  const chromeProps = {
    color: "#e2e8f0",
    metalness: 0.95,
    roughness: 0.1,
  };

  const brassProps = {
    color: "#d97706",
    metalness: 0.9,
    roughness: 0.2,
  };

  return (
    <group position={[0, -2.5, 0]}>
      {/* Heavy Base Plate */}
      <RoundedBox args={[7.5, 0.5, 4.5]} position={[0, 0.25, 0]} radius={0.08}>
        <meshStandardMaterial {...bodyMaterialProps} />
      </RoundedBox>

      {/* ForenClue Center Emblem Badge on Base */}
      <group position={[0, 0.51, 1.2]} rotation={[-0.1, 0, 0]}>
        <RoundedBox args={[3.2, 0.04, 1.2]} radius={0.03}>
          <meshStandardMaterial color="#b45309" metalness={0.9} roughness={0.2} />
        </RoundedBox>
        {embroideryTexture && (
          <Box args={[3.1, 0.05, 1.1]} position={[0, 0.01, 0]}>
            <meshStandardMaterial map={embroideryTexture} roughness={0.5} metalness={0.2} />
          </Box>
        )}
      </group>

      {/* LEFT MICROSCOPE ASSEMBLY */}
      <group position={[-2.2, 0, 0]}>
        {/* Pillar */}
        <Cylinder args={[0.35, 0.4, 4.5]} position={[0, 2.5, -1.2]}>
          <meshStandardMaterial {...bodyMaterialProps} />
        </Cylinder>
        <Cylinder args={[0.25, 0.25, 4.8]} position={[0, 2.6, -1.2]}>
          <meshStandardMaterial {...chromeProps} />
        </Cylinder>

        {/* Left Stage & Mount */}
        <group ref={leftStageRef} position={[0, 1.6, 0]}>
          <RoundedBox args={[2.2, 0.2, 2.2]} radius={0.04}>
            <meshStandardMaterial color="#0f172a" roughness={0.4} />
          </RoundedBox>
          <Cylinder args={[0.6, 0.6, 0.05]} position={[0, 0.11, 0]}>
            <meshStandardMaterial color="#334155" />
          </Cylinder>

          {/* Left Specimen Mount (Bullet / Specimen Cylinder) */}
          <group ref={leftSpecimenRef} position={[(leftStageX - 50) * 0.01, 0.25, (leftStageY - 50) * 0.01]}>
            {category === 'ballistics' ? (
              // Fired Bullet specimen
              <group>
                <Cylinder args={[0.25, 0.25, 0.7]} position={[0, 0.35, 0]}>
                  <meshStandardMaterial color="#b45309" metalness={0.85} roughness={0.3} />
                </Cylinder>
                <Cylinder args={[0.23, 0.05, 0.4]} position={[0, 0.9, 0]}>
                  <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
                </Cylinder>
                {/* Groove striation lines */}
                {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                  <Box key={i} args={[0.02, 0.6, 0.52]} rotation={[0, THREE.MathUtils.degToRad(deg), 0]} position={[0, 0.35, 0]}>
                    <meshStandardMaterial color="#78350f" metalness={0.9} />
                  </Box>
                ))}
              </group>
            ) : category === 'cartridge' ? (
              // Fired Cartridge Casing specimen
              <group>
                <Cylinder args={[0.3, 0.3, 0.8]} position={[0, 0.4, 0]}>
                  <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.25} />
                </Cylinder>
                <Cylinder args={[0.35, 0.35, 0.1]} position={[0, 0.05, 0]}>
                  <meshStandardMaterial color="#ca8a04" metalness={0.95} />
                </Cylinder>
              </group>
            ) : (
              // Slide glass / fiber / toolmark specimen
              <group>
                <Box args={[1.2, 0.04, 0.5]} position={[0, 0.02, 0]}>
                  <meshPhysicalMaterial color="#38bdf8" transmission={0.9} opacity={0.6} transparent roughness={0.1} />
                </Box>
                <Cylinder args={[0.08, 0.08, 0.3]} rotation={[0, 0, Math.PI / 2]} position={[0, 0.06, 0]}>
                  <meshStandardMaterial color="#ef4444" roughness={0.3} />
                </Cylinder>
              </group>
            )}
          </group>
        </group>

        {/* Left Objective Revolver Turret */}
        <group position={[0, 4.2, 0]}>
          <Cylinder args={[0.6, 0.7, 0.3]} position={[0, 0, 0]}>
            <meshStandardMaterial {...brassProps} />
          </Cylinder>
          {[0, 90, 180, 270].map((deg, i) => (
            <group key={i} rotation={[0, THREE.MathUtils.degToRad(deg), 0]}>
              <Cylinder args={[0.12, 0.15, 0.6]} position={[0.35, -0.3, 0]} rotation={[0, 0, -0.2]}>
                <meshStandardMaterial {...chromeProps} />
              </Cylinder>
            </group>
          ))}
        </group>
      </group>

      {/* RIGHT MICROSCOPE ASSEMBLY */}
      <group position={[2.2, 0, 0]}>
        {/* Pillar */}
        <Cylinder args={[0.35, 0.4, 4.5]} position={[0, 2.5, -1.2]}>
          <meshStandardMaterial {...bodyMaterialProps} />
        </Cylinder>
        <Cylinder args={[0.25, 0.25, 4.8]} position={[0, 2.6, -1.2]}>
          <meshStandardMaterial {...chromeProps} />
        </Cylinder>

        {/* Right Stage & Mount */}
        <group ref={rightStageRef} position={[0, 1.6, 0]}>
          <RoundedBox args={[2.2, 0.2, 2.2]} radius={0.04}>
            <meshStandardMaterial color="#0f172a" roughness={0.4} />
          </RoundedBox>
          <Cylinder args={[0.6, 0.6, 0.05]} position={[0, 0.11, 0]}>
            <meshStandardMaterial color="#334155" />
          </Cylinder>

          {/* Right Specimen Mount */}
          <group ref={rightSpecimenRef} position={[(rightStageX - 50) * 0.01, 0.25, (rightStageY - 50) * 0.01]}>
            {category === 'ballistics' ? (
              <group>
                <Cylinder args={[0.25, 0.25, 0.7]} position={[0, 0.35, 0]}>
                  <meshStandardMaterial color="#b45309" metalness={0.85} roughness={0.3} />
                </Cylinder>
                <Cylinder args={[0.23, 0.05, 0.4]} position={[0, 0.9, 0]}>
                  <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
                </Cylinder>
                {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                  <Box key={i} args={[0.02, 0.6, 0.52]} rotation={[0, THREE.MathUtils.degToRad(deg), 0]} position={[0, 0.35, 0]}>
                    <meshStandardMaterial color="#78350f" metalness={0.9} />
                  </Box>
                ))}
              </group>
            ) : category === 'cartridge' ? (
              <group>
                <Cylinder args={[0.3, 0.3, 0.8]} position={[0, 0.4, 0]}>
                  <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.25} />
                </Cylinder>
                <Cylinder args={[0.35, 0.35, 0.1]} position={[0, 0.05, 0]}>
                  <meshStandardMaterial color="#ca8a04" metalness={0.95} />
                </Cylinder>
              </group>
            ) : (
              <group>
                <Box args={[1.2, 0.04, 0.5]} position={[0, 0.02, 0]}>
                  <meshPhysicalMaterial color="#38bdf8" transmission={0.9} opacity={0.6} transparent roughness={0.1} />
                </Box>
                <Cylinder args={[0.08, 0.08, 0.3]} rotation={[0, 0, Math.PI / 2]} position={[0, 0.06, 0]}>
                  <meshStandardMaterial color="#ef4444" roughness={0.3} />
                </Cylinder>
              </group>
            )}
          </group>
        </group>

        {/* Right Objective Revolver Turret */}
        <group position={[0, 4.2, 0]}>
          <Cylinder args={[0.6, 0.7, 0.3]} position={[0, 0, 0]}>
            <meshStandardMaterial {...brassProps} />
          </Cylinder>
          {[0, 90, 180, 270].map((deg, i) => (
            <group key={i} rotation={[0, THREE.MathUtils.degToRad(deg), 0]}>
              <Cylinder args={[0.12, 0.15, 0.6]} position={[0.35, -0.3, 0]} rotation={[0, 0, -0.2]}>
                <meshStandardMaterial {...chromeProps} />
              </Cylinder>
            </group>
          ))}
        </group>
      </group>

      {/* CENTRAL OPTICAL COMPARISON BRIDGE HOUSING */}
      <group position={[0, 4.8, 0]}>
        {/* Horizontal Bridge Arm connecting Left and Right */}
        <Box args={[5.2, 0.6, 0.8]} position={[0, 0, 0]}>
          <meshStandardMaterial {...bodyMaterialProps} />
        </Box>

        {/* Golden Central Prism Module */}
        <Box args={[1.6, 0.8, 1.0]} position={[0, 0.3, 0]}>
          <meshStandardMaterial {...brassProps} />
        </Box>
        <Text fontSize={0.18} color="#ffffff" position={[0, 0.3, 0.52]}>
          OPTICAL BRIDGE PRISM
        </Text>

        {/* Split-Screen Divider Selector Knob on Front */}
        <Cylinder args={[0.25, 0.25, 0.2]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.5]}>
          <meshStandardMaterial color="#0284c7" metalness={0.8} />
        </Cylinder>

        {/* Binocular Eyepiece Head */}
        <group position={[0, 1.0, 0.2]} rotation={[0.25, 0, 0]}>
          <Cylinder args={[0.5, 0.6, 0.5]} position={[0, 0, 0]}>
            <meshStandardMaterial {...bodyMaterialProps} />
          </Cylinder>

          {/* Left Eyepiece Tube */}
          <group position={[-0.32, 0.4, 0]}>
            <Cylinder args={[0.14, 0.14, 0.7]} position={[0, 0.35, 0]}>
              <meshStandardMaterial {...chromeProps} />
            </Cylinder>
            <Cylinder args={[0.18, 0.16, 0.2]} position={[0, 0.7, 0]}>
              <meshStandardMaterial color="#020617" roughness={0.2} />
            </Cylinder>
          </group>

          {/* Right Eyepiece Tube */}
          <group position={[0.32, 0.4, 0]}>
            <Cylinder args={[0.14, 0.14, 0.7]} position={[0, 0.35, 0]}>
              <meshStandardMaterial {...chromeProps} />
            </Cylinder>
            <Cylinder args={[0.18, 0.16, 0.2]} position={[0, 0.7, 0]}>
              <meshStandardMaterial color="#020617" roughness={0.2} />
            </Cylinder>
          </group>
        </group>
      </group>

      {/* ILLUMINATION GOOSENECK FIBER-OPTIC ARMS */}
      {/* Left Gooseneck */}
      <group position={[-2.2, 0.4, -1.0]}>
        <Cylinder args={[0.08, 0.1, 1.8]} rotation={[0.4, 0.2, -0.3]} position={[-0.4, 0.8, 0.4]}>
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
        </Cylinder>
        {/* Lamp Hood */}
        <Cylinder args={[0.18, 0.12, 0.5]} rotation={[-0.8, -0.4, 0.2]} position={[-0.6, 1.6, 0.8]}>
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </Cylinder>
      </group>

      {/* Right Gooseneck */}
      <group position={[2.2, 0.4, -1.0]}>
        <Cylinder args={[0.08, 0.1, 1.8]} rotation={[0.4, -0.2, 0.3]} position={[0.4, 0.8, 0.4]}>
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
        </Cylinder>
        {/* Lamp Hood */}
        <Cylinder args={[0.18, 0.12, 0.5]} rotation={[-0.8, 0.4, -0.2]} position={[0.6, 1.6, 0.8]}>
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </Cylinder>
      </group>

      {/* COAXIAL FOCUS KNOBS ON BASE PILLARS */}
      {/* Left Pillar Knobs */}
      <group position={[-2.2, 1.2, -1.2]}>
        {/* Coarse Focus Knob */}
        <Cylinder args={[0.45, 0.45, 0.3]} rotation={[0, 0, Math.PI / 2]} position={[-0.4, 0, 0]}>
          <meshStandardMaterial color="#020617" metalness={0.9} roughness={0.4} />
        </Cylinder>
        {/* Fine Focus Inner Knob */}
        <Cylinder args={[0.3, 0.3, 0.5]} rotation={[0, 0, Math.PI / 2]} position={[-0.5, 0, 0]}>
          <meshStandardMaterial {...brassProps} />
        </Cylinder>
      </group>

      {/* Right Pillar Knobs */}
      <group position={[2.2, 1.2, -1.2]}>
        {/* Coarse Focus Knob */}
        <Cylinder args={[0.45, 0.45, 0.3]} rotation={[0, 0, Math.PI / 2]} position={[0.4, 0, 0]}>
          <meshStandardMaterial color="#020617" metalness={0.9} roughness={0.4} />
        </Cylinder>
        {/* Fine Focus Inner Knob */}
        <Cylinder args={[0.3, 0.3, 0.5]} rotation={[0, 0, Math.PI / 2]} position={[0.5, 0, 0]}>
          <meshStandardMaterial {...brassProps} />
        </Cylinder>
      </group>

      {/* ILLUMINATION SPOTLIGHTS */}
      {/* Left Oblique Spotlight */}
      <spotLight position={[-3.2, 4.2, 2.2]} target-position={[-2.2, 1.8, 0]} intensity={(lightIntensity / 100) * 3.5} angle={0.6} penumbra={0.3} color="#fef08a" />
      {/* Right Oblique Spotlight */}
      <spotLight position={[3.2, 4.2, 2.2]} target-position={[2.2, 1.8, 0]} intensity={(lightIntensity / 100) * 3.5} angle={0.6} penumbra={0.3} color="#fef08a" />
    </group>
  );
}
