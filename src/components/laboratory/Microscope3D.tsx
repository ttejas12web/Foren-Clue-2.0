import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Sphere } from '@react-three/drei';
import * as THREE from 'three';

export function Microscope3D({ focus, objective, lightIntensity, stageX, stageY }: any) {
    const nosepieceRef = useRef<THREE.Group>(null);
    const stageRef = useRef<THREE.Group>(null);
    const coarseKnobRef = useRef<THREE.Group>(null);
    const fineKnobRef = useRef<THREE.Group>(null);

    // Map objectives to nosepiece rotation (Y-axis)
    // Objectives: 4, 10, 40, 100
    const objRotations: Record<number, number> = { 4: 0, 10: Math.PI / 2, 40: Math.PI, 100: -Math.PI / 2 };

    useFrame(() => {
        // Rotate nosepiece
        if (nosepieceRef.current) {
            // Need to handle shortest path for rotation but simple lerp is okay for now
            // A better way is to use quaternions or manually wrap, but simple lerp on Y is fine
            // We use slerp for smooth shortest-path rotation
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

    const bodyColor = "#f5f5f5";
    const darkMetal = "#222222";
    const silverMetal = "#cccccc";

    return (
        <group position={[0, -3.5, 0]}>
            {/* Base Foot */}
            <Box args={[3.5, 0.6, 5]} position={[0, 0.3, 0.5]}>
                <meshStandardMaterial color={bodyColor} roughness={0.4} metalness={0.1} />
            </Box>
            <Box args={[1.5, 0.8, 2]} position={[0, 1.0, -1]}>
                <meshStandardMaterial color={bodyColor} roughness={0.4} metalness={0.1} />
            </Box>
            
            {/* Power Switch on Base */}
            <Box args={[0.2, 0.1, 0.3]} position={[1.5, 0.6, 1.5]} rotation={[0, 0, 0.2]}>
                <meshStandardMaterial color={lightIntensity > 0 ? "#ef4444" : "#444"} />
            </Box>

            {/* Light source / Illuminator */}
            <group position={[0, 0.7, 1.2]}>
                <Cylinder args={[0.7, 0.8, 0.3, 32]}>
                    <meshStandardMaterial color={darkMetal} />
                </Cylinder>
                <Cylinder args={[0.55, 0.55, 0.32, 32]}>
                    <meshStandardMaterial
                        emissive="#ffffff"
                        emissiveIntensity={lightIntensity / 50}
                        color="#fff"
                    />
                </Cylinder>
                <pointLight position={[0, 0.5, 0]} intensity={(lightIntensity / 100) * 20} distance={10} color="#fff" />
            </group>

            {/* Arm - curved back */}
            <Box args={[1.4, 6, 1.4]} position={[0, 4, -1.2]} rotation={[0.1, 0, 0]}>
                <meshStandardMaterial color={bodyColor} roughness={0.4} metalness={0.1} />
            </Box>
            <Box args={[1.4, 1.5, 2.5]} position={[0, 6.8, -0.2]} rotation={[0.0, 0, 0]}>
                <meshStandardMaterial color={bodyColor} roughness={0.4} metalness={0.1} />
            </Box>

            {/* Binocular Head */}
            <group position={[0, 7.5, 0.5]} rotation={[0.2, 0, 0]}>
                {/* Head Base */}
                <Cylinder args={[0.8, 0.8, 1, 32]} rotation={[0, 0, 0]}>
                    <meshStandardMaterial color={bodyColor} roughness={0.4} />
                </Cylinder>
                
                {/* Left Eyepiece */}
                <group position={[-0.4, 0.5, 0.5]} rotation={[0.4, 0, 0]}>
                    <Cylinder args={[0.15, 0.2, 1.5, 32]}>
                        <meshStandardMaterial color={darkMetal} roughness={0.2} metalness={0.8} />
                    </Cylinder>
                    {/* Eyepiece cup */}
                    <Cylinder args={[0.22, 0.22, 0.3, 32]} position={[0, 0.8, 0]}>
                        <meshStandardMaterial color="#111" />
                    </Cylinder>
                    {/* Lens glass */}
                    <Cylinder args={[0.15, 0.15, 0.31, 32]} position={[0, 0.8, 0]}>
                        <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
                    </Cylinder>
                </group>

                {/* Right Eyepiece */}
                <group position={[0.4, 0.5, 0.5]} rotation={[0.4, 0, 0]}>
                    <Cylinder args={[0.15, 0.2, 1.5, 32]}>
                        <meshStandardMaterial color={darkMetal} roughness={0.2} metalness={0.8} />
                    </Cylinder>
                    {/* Eyepiece cup */}
                    <Cylinder args={[0.22, 0.22, 0.3, 32]} position={[0, 0.8, 0]}>
                        <meshStandardMaterial color="#111" />
                    </Cylinder>
                    {/* Lens glass */}
                    <Cylinder args={[0.15, 0.15, 0.31, 32]} position={[0, 0.8, 0]}>
                        <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
                    </Cylinder>
                </group>
            </group>

            {/* Nosepiece & Objectives */}
            <group position={[0, 6.2, 1.2]}>
                {/* Fixed part */}
                <Cylinder args={[0.9, 1.1, 0.6, 32]} position={[0, 0.3, 0]}>
                    <meshStandardMaterial color={bodyColor} />
                </Cylinder>
                
                {/* Revolving part */}
                <group ref={nosepieceRef}>
                    <Cylinder args={[0.9, 0.9, 0.2, 32]}>
                        <meshStandardMaterial color={darkMetal} metalness={0.5} roughness={0.5} />
                    </Cylinder>
                    <Cylinder args={[0.92, 0.92, 0.05, 64]} position={[0, 0.05, 0]}>
                        <meshStandardMaterial color={silverMetal} metalness={0.9} roughness={0.2} />
                    </Cylinder>

                    {/* 4x Red - pointing down when rot=0 */}
                    <group position={[0, 0, 0.65]}>
                        <Cylinder args={[0.2, 0.15, 0.7]} position={[0, -0.4, 0]}>
                            <meshStandardMaterial color={silverMetal} metalness={0.8} roughness={0.2} />
                        </Cylinder>
                        <Cylinder args={[0.16, 0.16, 0.1]} position={[0, -0.4, 0]}>
                            <meshStandardMaterial color="#ef4444" />
                        </Cylinder>
                    </group>

                    {/* 10x Yellow */}
                    <group position={[0.65, 0, 0]}>
                        <Cylinder args={[0.2, 0.15, 0.9]} position={[0, -0.5, 0]}>
                            <meshStandardMaterial color={silverMetal} metalness={0.8} roughness={0.2} />
                        </Cylinder>
                        <Cylinder args={[0.16, 0.16, 0.1]} position={[0, -0.5, 0]}>
                            <meshStandardMaterial color="#eab308" />
                        </Cylinder>
                    </group>

                    {/* 40x Blue */}
                    <group position={[0, 0, -0.65]}>
                        <Cylinder args={[0.2, 0.15, 1.1]} position={[0, -0.6, 0]}>
                            <meshStandardMaterial color={silverMetal} metalness={0.8} roughness={0.2} />
                        </Cylinder>
                        <Cylinder args={[0.16, 0.16, 0.1]} position={[0, -0.6, 0]}>
                            <meshStandardMaterial color="#3b82f6" />
                        </Cylinder>
                    </group>

                    {/* 100x White */}
                    <group position={[-0.65, 0, 0]}>
                        <Cylinder args={[0.2, 0.15, 1.3]} position={[0, -0.7, 0]}>
                            <meshStandardMaterial color={silverMetal} metalness={0.8} roughness={0.2} />
                        </Cylinder>
                        <Cylinder args={[0.16, 0.16, 0.1]} position={[0, -0.7, 0]}>
                            <meshStandardMaterial color="#ffffff" />
                        </Cylinder>
                    </group>
                </group>
            </group>

            {/* Stage */}
            <group ref={stageRef} position={[0, 3.0, 1.2]}>
                {/* Stage Plate */}
                <Box args={[3.2, 0.15, 3.2]}>
                    <meshStandardMaterial color={darkMetal} roughness={0.8} />
                </Box>
                
                {/* Condenser */}
                <Cylinder args={[0.5, 0.7, 0.4, 32]} position={[0, -0.25, 0]}>
                    <meshStandardMaterial color={darkMetal} />
                </Cylinder>
                <Cylinder args={[0.4, 0.4, 0.41, 32]} position={[0, -0.25, 0]}>
                    <meshStandardMaterial color="#000" metalness={0.5} roughness={0.1} />
                </Cylinder>
                <Cylinder args={[0.1, 0.1, 0.6, 16]} position={[-0.6, -0.25, 0]} rotation={[0, 0, Math.PI/2]}>
                    <meshStandardMaterial color={silverMetal} metalness={0.9} />
                </Cylinder>

                {/* Mechanical Stage Frame */}
                <Box args={[3.4, 0.2, 0.5]} position={[0, 0.15, -1.35]}>
                    <meshStandardMaterial color="#333" />
                </Box>
                <Box args={[0.5, 0.2, 3.2]} position={[1.45, 0.15, 0]}>
                    <meshStandardMaterial color="#333" />
                </Box>

                {/* X-Y Translation Knobs */}
                <group position={[1.7, -0.5, -1.3]} rotation={[0, 0, 0]}>
                    <Cylinder args={[0.08, 0.08, 1]} rotation={[Math.PI/2, 0, 0]}>
                        <meshStandardMaterial color={silverMetal} metalness={0.9} />
                    </Cylinder>
                    {/* Y knob */}
                    <Cylinder args={[0.2, 0.2, 0.3, 32]} position={[0, 0, 0.5]} rotation={[Math.PI/2, 0, 0]}>
                        <meshStandardMaterial color={darkMetal} />
                    </Cylinder>
                    {/* X knob */}
                    <Cylinder args={[0.15, 0.15, 0.3, 32]} position={[0, 0, 0.8]} rotation={[Math.PI/2, 0, 0]}>
                        <meshStandardMaterial color="#111" />
                    </Cylinder>
                </group>

                {/* The Slide */}
                <group position={[(stageX - 50) / 40, 0.1, (stageY - 50) / 40]}>
                    {/* Glass */}
                    <Box args={[1.5, 0.05, 0.5]}>
                        <meshStandardMaterial color="white" opacity={0.3} transparent />
                    </Box>
                    {/* Cover slip */}
                    <Box args={[0.4, 0.06, 0.4]}>
                        <meshStandardMaterial color="skyblue" opacity={0.3} transparent />
                    </Box>
                    {/* Specimen (tiny red dot) */}
                    <Cylinder args={[0.1, 0.1, 0.07, 16]}>
                        <meshStandardMaterial color="red" />
                    </Cylinder>
                </group>

                {/* Slide Clip (holds slide in place) */}
                <Box args={[0.15, 0.05, 1.4]} position={[(stageX - 50) / 40 - 0.7, 0.12, (stageY - 50) / 40]}>
                     <meshStandardMaterial color={silverMetal} metalness={0.9} roughness={0.2} />
                </Box>
                <Cylinder args={[0.1, 0.1, 0.1]} position={[(stageX - 50) / 40 - 0.7, 0.15, (stageY - 50) / 40 + 0.6]}>
                    <meshStandardMaterial color={darkMetal} />
                </Cylinder>
            </group>

            {/* Focus Knobs Assembly */}
            <group position={[0, 3.0, -1.0]}>
                {/* Axis shaft */}
                <Cylinder args={[0.15, 0.15, 2.5, 32]} rotation={[0, 0, Math.PI / 2]}>
                    <meshStandardMaterial color={silverMetal} metalness={0.9} />
                </Cylinder>
                
                {/* Left Knobs */}
                <group position={[-1.2, 0, 0]}>
                    <group ref={coarseKnobRef}>
                        <Cylinder args={[0.5, 0.5, 0.4, 32]} rotation={[0, 0, Math.PI / 2]}>
                            <meshStandardMaterial color={darkMetal} />
                        </Cylinder>
                    </group>
                    <group ref={fineKnobRef}>
                        <Cylinder args={[0.25, 0.25, 0.7, 32]} rotation={[0, 0, Math.PI / 2]}>
                            <meshStandardMaterial color="#111" />
                        </Cylinder>
                    </group>
                </group>

                {/* Right Knobs */}
                <group position={[1.2, 0, 0]}>
                    <group ref={coarseKnobRef}>
                        <Cylinder args={[0.5, 0.5, 0.4, 32]} rotation={[0, 0, Math.PI / 2]}>
                            <meshStandardMaterial color={darkMetal} />
                        </Cylinder>
                    </group>
                    <group ref={fineKnobRef}>
                        <Cylinder args={[0.25, 0.25, 0.7, 32]} rotation={[0, 0, Math.PI / 2]}>
                            <meshStandardMaterial color="#111" />
                        </Cylinder>
                    </group>
                </group>
            </group>
        </group>
    );
}

