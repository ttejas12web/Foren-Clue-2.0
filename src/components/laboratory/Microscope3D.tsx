import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

function createForenclueEmbroideryTexture() {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Dark navy blue velvet/leather base
    ctx.fillStyle = '#0a1128';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Fine fabric texture weave
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

    // Heavy Gold Embroidered Stitched Outer Frame
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 12;
    ctx.setLineDash([22, 14]);
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Solid inner golden thread border
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    ctx.setLineDash([]);
    ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

    // Cyan accent thread frame
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.strokeRect(46, 46, canvas.width - 92, canvas.height - 92);

    // Forensic Emblems Icon Bar
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('🔬   ✦   🧬   ✦   ⚖️', canvas.width / 2, 110);

    // FORENCLUE Raised Embroidery Text
    ctx.shadowColor = '#d97706';
    ctx.shadowBlur = 14;
    ctx.font = '900 86px "Montserrat", "Arial Black", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('FORENCLUE', canvas.width / 2, 225);

    ctx.shadowBlur = 0;
    // Subtitle Threading
    ctx.font = '700 32px "Montserrat", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('FORENSIC EDTECH SIMULATION', canvas.width / 2, 320);

    ctx.font = '600 24px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('AUTHENTICATED LABORATORY INSTRUMENT • FC-9000', canvas.width / 2, 395);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

export function Microscope3D({ focus, objective, lightIntensity, stageX, stageY }: any) {
    const nosepieceRef = useRef<THREE.Group>(null);
    const stageRef = useRef<THREE.Group>(null);
    const coarseKnobRef = useRef<THREE.Group>(null);
    const fineKnobRef = useRef<THREE.Group>(null);

    const embroideryTexture = useMemo(() => createForenclueEmbroideryTexture(), []);

    // Map objectives to nosepiece rotation (Y-axis)
    // Objectives: 4, 10, 40, 100
    const objRotations: Record<number, number> = { 4: 0, 10: Math.PI / 2, 40: Math.PI, 100: -Math.PI / 2 };

    useFrame(() => {
        // Rotate nosepiece
        if (nosepieceRef.current) {
            const targetRotation = new THREE.Euler(0, objRotations[objective] || 0, 0);
            const targetQuat = new THREE.Quaternion().setFromEuler(targetRotation);
            nosepieceRef.current.quaternion.slerp(targetQuat, 0.1);
        }

        // Move stage up/down based on focus (0-100)
        if (stageRef.current) {
            const targetY = 1.5 + (focus / 100) * 1.5; // range: 1.5 to 3.0
            stageRef.current.position.y = THREE.MathUtils.lerp(stageRef.current.position.y, targetY, 0.2);
        }

        // Rotate knobs based on focus values to give feedback
        if (coarseKnobRef.current) {
            coarseKnobRef.current.rotation.x = focus * 0.1;
        }
        if (fineKnobRef.current) {
            fineKnobRef.current.rotation.x = focus * 0.5;
        }
    });

    const bodyProps = {
        color: "#f0f2f5",
        roughness: 0.1,
        metalness: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
    };

    const darkMetalProps = {
        color: "#1a1a1a",
        roughness: 0.5,
        metalness: 0.8,
        clearcoat: 0.3,
    };

    const silverMetalProps = {
        color: "#d0d0d0",
        roughness: 0.3,
        metalness: 0.9,
        clearcoat: 0.5,
    };
    
    const glassProps = {
        color: "#ffffff",
        transmission: 0.95,
        opacity: 1,
        metalness: 0.1,
        roughness: 0,
        ior: 1.52,
        thickness: 0.5,
        specularIntensity: 1,
    };

    return (
        <group position={[0, -3.5, 0]}>
            {/* Base Foot */}
            <RoundedBox args={[3.5, 0.6, 5]} position={[0, 0.3, 0.5]} radius={0.1} smoothness={4}>
                <meshPhysicalMaterial {...bodyProps} />
            </RoundedBox>
            <RoundedBox args={[1.5, 0.8, 2]} position={[0, 1.0, -1]} radius={0.1} smoothness={4}>
                <meshPhysicalMaterial {...bodyProps} />
            </RoundedBox>
            
            {/* Power Switch on Base */}
            <Box args={[0.2, 0.1, 0.3]} position={[1.5, 0.6, 1.5]} rotation={[0, 0, 0.2]}>
                <meshPhysicalMaterial color={lightIntensity > 0 ? "#ef4444" : "#222"} metalness={0.5} roughness={0.5} />
            </Box>

            {/* Light source / Illuminator */}
            <group position={[0, 0.7, 1.2]}>
                <Cylinder args={[0.7, 0.8, 0.3, 64]}>
                    <meshPhysicalMaterial {...darkMetalProps} />
                </Cylinder>
                <Cylinder args={[0.55, 0.55, 0.32, 64]}>
                    <meshPhysicalMaterial
                        emissive="#ffffff"
                        emissiveIntensity={lightIntensity / 40}
                        color="#fff"
                    />
                </Cylinder>
                <pointLight position={[0, 0.5, 0]} intensity={(lightIntensity / 100) * 30} distance={10} color="#fff" />
            </group>

            {/* Arm - curved back */}
            <RoundedBox args={[1.4, 6, 1.4]} position={[0, 4, -1.2]} rotation={[0.1, 0, 0]} radius={0.2} smoothness={4}>
                <meshPhysicalMaterial {...bodyProps} />
            </RoundedBox>
            <RoundedBox args={[1.4, 1.5, 2.5]} position={[0, 6.8, -0.2]} rotation={[0.0, 0, 0]} radius={0.2} smoothness={4}>
                <meshPhysicalMaterial {...bodyProps} />
            </RoundedBox>

            {/* ForenClue Gold Embroidery Patch - Left Arm */}
            <group position={[-0.71, 4.3, -1.2]} rotation={[0.1, -Math.PI / 2, 0]}>
                <RoundedBox args={[1.8, 1.0, 0.04]} radius={0.03}>
                    <meshStandardMaterial color="#b45309" metalness={0.9} roughness={0.2} />
                </RoundedBox>
                {embroideryTexture && (
                    <Box args={[1.7, 0.9, 0.05]} position={[0, 0, 0.01]}>
                        <meshStandardMaterial map={embroideryTexture} roughness={0.6} metalness={0.1} />
                    </Box>
                )}
            </group>

            {/* ForenClue Gold Embroidery Patch - Right Arm */}
            <group position={[0.71, 4.3, -1.2]} rotation={[0.1, Math.PI / 2, 0]}>
                <RoundedBox args={[1.8, 1.0, 0.04]} radius={0.03}>
                    <meshStandardMaterial color="#b45309" metalness={0.9} roughness={0.2} />
                </RoundedBox>
                {embroideryTexture && (
                    <Box args={[1.7, 0.9, 0.05]} position={[0, 0, 0.01]}>
                        <meshStandardMaterial map={embroideryTexture} roughness={0.6} metalness={0.1} />
                    </Box>
                )}
            </group>

            {/* ForenClue Gold Embroidery Badge - Base Plate */}
            <group position={[0, 0.61, 2.0]} rotation={[-0.1, 0, 0]}>
                <RoundedBox args={[2.4, 0.05, 1.0]} radius={0.02}>
                    <meshStandardMaterial color="#b45309" metalness={0.95} roughness={0.15} />
                </RoundedBox>
                {embroideryTexture && (
                    <Box args={[2.3, 0.06, 0.9]} position={[0, 0.01, 0]}>
                        <meshStandardMaterial map={embroideryTexture} roughness={0.5} metalness={0.2} />
                    </Box>
                )}
            </group>

            {/* Binocular Head */}
            <group position={[0, 7.5, 0.5]} rotation={[0.2, 0, 0]}>
                {/* Head Base */}
                <Cylinder args={[0.8, 0.8, 1, 64]} rotation={[0, 0, 0]}>
                    <meshPhysicalMaterial {...bodyProps} />
                </Cylinder>
                
                {/* Left Eyepiece */}
                <group position={[-0.4, 0.5, 0.5]} rotation={[0.4, 0, 0]}>
                    <Cylinder args={[0.15, 0.2, 1.5, 64]}>
                        <meshPhysicalMaterial {...darkMetalProps} />
                    </Cylinder>
                    {/* Eyepiece cup */}
                    <Cylinder args={[0.22, 0.22, 0.3, 64]} position={[0, 0.8, 0]}>
                        <meshPhysicalMaterial color="#111" roughness={0.8} />
                    </Cylinder>
                    {/* Lens glass */}
                    <Cylinder args={[0.15, 0.15, 0.31, 32]} position={[0, 0.8, 0]}>
                        <meshPhysicalMaterial {...glassProps} />
                    </Cylinder>
                </group>

                {/* Right Eyepiece */}
                <group position={[0.4, 0.5, 0.5]} rotation={[0.4, 0, 0]}>
                    <Cylinder args={[0.15, 0.2, 1.5, 64]}>
                        <meshPhysicalMaterial {...darkMetalProps} />
                    </Cylinder>
                    {/* Eyepiece cup */}
                    <Cylinder args={[0.22, 0.22, 0.3, 64]} position={[0, 0.8, 0]}>
                        <meshPhysicalMaterial color="#111" roughness={0.8} />
                    </Cylinder>
                    {/* Lens glass */}
                    <Cylinder args={[0.15, 0.15, 0.31, 32]} position={[0, 0.8, 0]}>
                        <meshPhysicalMaterial {...glassProps} />
                    </Cylinder>
                </group>
            </group>

            {/* Nosepiece & Objectives */}
            <group position={[0, 6.2, 1.2]}>
                {/* Fixed part */}
                <Cylinder args={[0.9, 1.1, 0.6, 64]} position={[0, 0.3, 0]}>
                    <meshPhysicalMaterial {...bodyProps} />
                </Cylinder>
                
                {/* Revolving part */}
                <group ref={nosepieceRef}>
                    <Cylinder args={[0.9, 0.9, 0.2, 64]}>
                        <meshPhysicalMaterial {...darkMetalProps} />
                    </Cylinder>
                    <Cylinder args={[0.92, 0.92, 0.05, 64]} position={[0, 0.05, 0]}>
                        <meshPhysicalMaterial {...silverMetalProps} />
                    </Cylinder>

                    {/* 4x Red - pointing down when rot=0 */}
                    <group position={[0, 0, 0.65]}>
                        <Cylinder args={[0.2, 0.15, 0.7, 32]} position={[0, -0.4, 0]}>
                            <meshPhysicalMaterial {...silverMetalProps} />
                        </Cylinder>
                        <Cylinder args={[0.16, 0.16, 0.1, 32]} position={[0, -0.4, 0]}>
                            <meshPhysicalMaterial color="#ef4444" roughness={0.2} metalness={0.5} />
                        </Cylinder>
                        <Cylinder args={[0.12, 0.12, 0.1, 32]} position={[0, -0.75, 0]}>
                            <meshPhysicalMaterial {...glassProps} />
                        </Cylinder>
                    </group>

                    {/* 10x Yellow */}
                    <group position={[0.65, 0, 0]}>
                        <Cylinder args={[0.2, 0.15, 0.9, 32]} position={[0, -0.5, 0]}>
                            <meshPhysicalMaterial {...silverMetalProps} />
                        </Cylinder>
                        <Cylinder args={[0.16, 0.16, 0.1, 32]} position={[0, -0.5, 0]}>
                            <meshPhysicalMaterial color="#eab308" roughness={0.2} metalness={0.5} />
                        </Cylinder>
                        <Cylinder args={[0.12, 0.12, 0.1, 32]} position={[0, -0.95, 0]}>
                            <meshPhysicalMaterial {...glassProps} />
                        </Cylinder>
                    </group>

                    {/* 40x Blue */}
                    <group position={[0, 0, -0.65]}>
                        <Cylinder args={[0.2, 0.15, 1.1, 32]} position={[0, -0.6, 0]}>
                            <meshPhysicalMaterial {...silverMetalProps} />
                        </Cylinder>
                        <Cylinder args={[0.16, 0.16, 0.1, 32]} position={[0, -0.6, 0]}>
                            <meshPhysicalMaterial color="#3b82f6" roughness={0.2} metalness={0.5} />
                        </Cylinder>
                        <Cylinder args={[0.12, 0.12, 0.1, 32]} position={[0, -1.15, 0]}>
                            <meshPhysicalMaterial {...glassProps} />
                        </Cylinder>
                    </group>

                    {/* 100x White */}
                    <group position={[-0.65, 0, 0]}>
                        <Cylinder args={[0.2, 0.15, 1.3, 32]} position={[0, -0.7, 0]}>
                            <meshPhysicalMaterial {...silverMetalProps} />
                        </Cylinder>
                        <Cylinder args={[0.16, 0.16, 0.1, 32]} position={[0, -0.7, 0]}>
                            <meshPhysicalMaterial color="#ffffff" roughness={0.2} metalness={0.5} />
                        </Cylinder>
                        <Cylinder args={[0.12, 0.12, 0.1, 32]} position={[0, -1.35, 0]}>
                            <meshPhysicalMaterial {...glassProps} />
                        </Cylinder>
                    </group>
                </group>
            </group>

            {/* Stage */}
            <group ref={stageRef} position={[0, 3.0, 1.2]}>
                {/* Stage Plate */}
                <RoundedBox args={[3.2, 0.15, 3.2]} radius={0.05} smoothness={4}>
                    <meshPhysicalMaterial {...darkMetalProps} />
                </RoundedBox>
                
                {/* Condenser */}
                <Cylinder args={[0.5, 0.7, 0.4, 64]} position={[0, -0.25, 0]}>
                    <meshPhysicalMaterial {...darkMetalProps} />
                </Cylinder>
                <Cylinder args={[0.4, 0.4, 0.41, 64]} position={[0, -0.25, 0]}>
                    <meshPhysicalMaterial color="#000" metalness={0.8} roughness={0.2} />
                </Cylinder>
                <Cylinder args={[0.3, 0.3, 0.1, 32]} position={[0, -0.05, 0]}>
                    <meshPhysicalMaterial {...glassProps} />
                </Cylinder>
                
                {/* Iris Diaphragm Lever */}
                <Cylinder args={[0.05, 0.05, 0.6, 16]} position={[-0.6, -0.25, 0]} rotation={[0, 0, Math.PI/2]}>
                    <meshPhysicalMaterial {...silverMetalProps} />
                </Cylinder>

                {/* Mechanical Stage Frame */}
                <RoundedBox args={[3.4, 0.2, 0.5]} position={[0, 0.15, -1.35]} radius={0.05}>
                    <meshPhysicalMaterial color="#2a2a2a" roughness={0.6} metalness={0.5} />
                </RoundedBox>
                <RoundedBox args={[0.5, 0.2, 3.2]} position={[1.45, 0.15, 0]} radius={0.05}>
                    <meshPhysicalMaterial color="#2a2a2a" roughness={0.6} metalness={0.5} />
                </RoundedBox>

                {/* X-Y Translation Knobs */}
                <group position={[1.7, -0.5, -1.3]} rotation={[0, 0, 0]}>
                    <Cylinder args={[0.08, 0.08, 1, 32]} rotation={[Math.PI/2, 0, 0]}>
                        <meshPhysicalMaterial {...silverMetalProps} />
                    </Cylinder>
                    {/* Y knob */}
                    <Cylinder args={[0.2, 0.2, 0.3, 64]} position={[0, 0, 0.5]} rotation={[Math.PI/2, 0, 0]}>
                        <meshPhysicalMaterial {...darkMetalProps} />
                    </Cylinder>
                    {/* X knob */}
                    <Cylinder args={[0.15, 0.15, 0.3, 64]} position={[0, 0, 0.8]} rotation={[Math.PI/2, 0, 0]}>
                        <meshPhysicalMaterial color="#111" roughness={0.6} metalness={0.4} />
                    </Cylinder>
                </group>

                {/* The Slide */}
                <group position={[(stageX - 50) / 40, 0.1, (stageY - 50) / 40]}>
                    {/* Glass */}
                    <Box args={[1.5, 0.05, 0.5]}>
                        <meshPhysicalMaterial {...glassProps} opacity={0.6} transmission={0.9} />
                    </Box>
                    {/* Cover slip */}
                    <Box args={[0.4, 0.06, 0.4]}>
                        <meshPhysicalMaterial {...glassProps} color="aliceblue" opacity={0.8} transmission={0.95} />
                    </Box>
                    {/* Specimen */}
                    <Cylinder args={[0.1, 0.1, 0.07, 32]}>
                        <meshPhysicalMaterial color="#ef4444" opacity={0.8} transparent transmission={0.5} />
                    </Cylinder>
                </group>

                {/* Slide Clip */}
                <RoundedBox args={[0.15, 0.05, 1.4]} position={[(stageX - 50) / 40 - 0.7, 0.12, (stageY - 50) / 40]} radius={0.02}>
                     <meshPhysicalMaterial {...silverMetalProps} />
                </RoundedBox>
                <Cylinder args={[0.1, 0.1, 0.1, 32]} position={[(stageX - 50) / 40 - 0.7, 0.15, (stageY - 50) / 40 + 0.6]}>
                    <meshPhysicalMaterial {...darkMetalProps} />
                </Cylinder>
            </group>

            {/* Focus Knobs Assembly */}
            <group position={[0, 3.0, -1.0]}>
                {/* Axis shaft */}
                <Cylinder args={[0.15, 0.15, 2.5, 64]} rotation={[0, 0, Math.PI / 2]}>
                    <meshPhysicalMaterial {...silverMetalProps} />
                </Cylinder>
                
                {/* Left Knobs */}
                <group position={[-1.2, 0, 0]}>
                    <group ref={coarseKnobRef}>
                        <Cylinder args={[0.5, 0.5, 0.4, 64]} rotation={[0, 0, Math.PI / 2]}>
                            <meshPhysicalMaterial {...darkMetalProps} />
                        </Cylinder>
                    </group>
                    <group ref={fineKnobRef}>
                        <Cylinder args={[0.25, 0.25, 0.7, 64]} rotation={[0, 0, Math.PI / 2]}>
                            <meshPhysicalMaterial color="#111" roughness={0.6} metalness={0.4} />
                        </Cylinder>
                    </group>
                </group>

                {/* Right Knobs */}
                <group position={[1.2, 0, 0]}>
                    <group ref={coarseKnobRef}>
                        <Cylinder args={[0.5, 0.5, 0.4, 64]} rotation={[0, 0, Math.PI / 2]}>
                            <meshPhysicalMaterial {...darkMetalProps} />
                        </Cylinder>
                    </group>
                    <group ref={fineKnobRef}>
                        <Cylinder args={[0.25, 0.25, 0.7, 64]} rotation={[0, 0, Math.PI / 2]}>
                            <meshPhysicalMaterial color="#111" roughness={0.6} metalness={0.4} />
                        </Cylinder>
                    </group>
                </group>
            </group>
        </group>
    );
}
