import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';

export function Spectrophotometer3D({ lidOpen, cuvetteInserted, wavelength }: { lidOpen: boolean, cuvetteInserted: boolean, wavelength: number }) {
    const lidRef = useRef<THREE.Group>(null);
    
    useFrame(() => {
        if (lidRef.current) {
            // Animate lid opening/closing
            const targetRotation = lidOpen ? Math.PI / 3 : 0;
            lidRef.current.rotation.x = THREE.MathUtils.lerp(lidRef.current.rotation.x, -targetRotation, 0.1);
        }
    });

    const bodyColor = "#e5e5e5";
    const darkAccent = "#222222";
    const screenColor = "#111111";

    return (
        <group position={[0, -2, 0]}>
            {/* Main Body */}
            <Box args={[4, 1.5, 3]} position={[0, 0.75, 0]}>
                <meshStandardMaterial color={bodyColor} roughness={0.6} metalness={0.1} />
            </Box>
            
            {/* Front Panel Slant */}
            <Box args={[4, 1.2, 1.5]} position={[0, 0.6, 1.8]} rotation={[-0.3, 0, 0]}>
                <meshStandardMaterial color={bodyColor} roughness={0.6} metalness={0.1} />
            </Box>

            {/* Screen */}
            <Box args={[1.5, 0.8, 0.1]} position={[-0.8, 1.1, 2.3]} rotation={[-0.3, 0, 0]}>
                <meshStandardMaterial color={screenColor} emissive={screenColor} emissiveIntensity={0.2} />
            </Box>
            
            {/* Screen Display Text (Wavelength) */}
            <group position={[-0.8, 1.1, 2.36]} rotation={[-0.3, 0, 0]}>
                <Text fontSize={0.2} color="#00ff00" position={[0, 0.1, 0]}>
                    {wavelength.toString()} nm
                </Text>
                <Text fontSize={0.1} color="#00ff00" position={[0, -0.15, 0]}>
                    Absorbance Mode
                </Text>
            </group>

            {/* Buttons */}
            <group position={[1.2, 0.8, 2.3]} rotation={[-0.3, 0, 0]}>
                {[0, 1, 2, 3].map((i) => (
                    <Box key={i} args={[0.2, 0.1, 0.2]} position={[(i % 2) * 0.4 - 0.2, -Math.floor(i / 2) * 0.3 + 0.1, 0]}>
                        <meshStandardMaterial color={darkAccent} roughness={0.8} />
                    </Box>
                ))}
            </group>

            {/* Cuvette Slot Area */}
            <group position={[0, 1.5, -0.5]}>
                {/* Hole */}
                <Box args={[1.2, 0.1, 1.2]} position={[0, 0, 0]}>
                    <meshStandardMaterial color={darkAccent} />
                </Box>
                
                {/* Cuvette inside if inserted */}
                {cuvetteInserted && (
                    <Box args={[0.3, 0.8, 0.3]} position={[0, 0.2, 0]}>
                        <meshPhysicalMaterial color="skyblue" opacity={0.6} transparent roughness={0.1} transmission={0.9} />
                    </Box>
                )}

                {/* Lid */}
                <group position={[0, 0.05, -0.6]} ref={lidRef}>
                    {/* The pivot is at Z=-0.6 (back of the hole) */}
                    <Box args={[1.4, 0.1, 1.4]} position={[0, 0, 0.6]}>
                        <meshStandardMaterial color={bodyColor} roughness={0.6} />
                    </Box>
                    <Box args={[1.4, 0.2, 0.2]} position={[0, 0.05, 1.2]}>
                        <meshStandardMaterial color={darkAccent} roughness={0.6} />
                    </Box>
                </group>
            </group>

            {/* Side Vents */}
            <group position={[2.01, 0.75, 0]}>
                {[0, 1, 2, 3, 4].map((i) => (
                    <Box key={i} args={[0.05, 0.8, 0.1]} position={[0, 0, i * 0.3 - 0.6]}>
                        <meshStandardMaterial color={darkAccent} />
                    </Box>
                ))}
            </group>
        </group>
    );
}
