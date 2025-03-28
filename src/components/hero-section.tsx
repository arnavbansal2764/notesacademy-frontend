"use client"

import { Suspense, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { PresentationControls, Float, Environment, Text } from "@react-three/drei"
import * as THREE from "three"
import { Button } from "@/components/ui/button"
import { FileUp } from "lucide-react"

function FloatingDocuments() {
    const group = useRef<THREE.Group>(null)

    useFrame(({ clock }) => {
        if (group.current) {
            group.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.2
        }
    })

    return (
        <group ref={group}>
            {/* PDF Document */}
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                <mesh position={[-2, 0, 0]} rotation={[0, 0.5, 0.2]}>
                    <boxGeometry args={[1.5, 2, 0.1]} />
                    <meshStandardMaterial color="#f87171" />
                    <Text position={[0, 0, 0.06]} fontSize={0.2} color="white" anchorX="center" anchorY="middle">
                        PDF
                    </Text>
                </mesh>
            </Float>

            {/* MCQ Document */}
            <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.4}>
                <mesh position={[0, 0.5, 0]} rotation={[0.1, -0.3, 0]}>
                    <boxGeometry args={[1.5, 2, 0.1]} />
                    <meshStandardMaterial color="#60a5fa" />
                    <Text position={[0, 0.5, 0.06]} fontSize={0.15} color="white" anchorX="center" anchorY="middle">
                        MCQs
                    </Text>
                    <Text position={[0, 0, 0.06]} fontSize={0.1} color="white" anchorX="center" anchorY="middle">
                        A. Option 1
                    </Text>
                    <Text position={[0, -0.2, 0.06]} fontSize={0.1} color="white" anchorX="center" anchorY="middle">
                        B. Option 2
                    </Text>
                    <Text position={[0, -0.4, 0.06]} fontSize={0.1} color="white" anchorX="center" anchorY="middle">
                        C. Option 3
                    </Text>
                </mesh>
            </Float>

            {/* Flowchart */}
            <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.6}>
                <mesh position={[2, 0, 0]} rotation={[0, -0.5, -0.1]}>
                    <boxGeometry args={[2, 2, 0.1]} />
                    <meshStandardMaterial color="#8b5cf6" />
                    <group position={[0, 0, 0.06]}>
                        {/* Simple flowchart representation */}
                        <mesh position={[0, 0.6, 0.01]}>
                            <cylinderGeometry args={[0.3, 0.3, 0.05, 32]} />
                            <meshStandardMaterial color="#c4b5fd" />
                        </mesh>
                        <mesh position={[0, 0, 0.01]}>
                            <boxGeometry args={[0.6, 0.3, 0.05]} />
                            <meshStandardMaterial color="#c4b5fd" />
                        </mesh>
                        <mesh position={[0, -0.6, 0.01]}>
                            <cylinderGeometry args={[0.3, 0.3, 0.05, 32]} />
                            <meshStandardMaterial color="#c4b5fd" />
                        </mesh>
                        {/* Connecting lines */}
                        <mesh position={[0, 0.3, 0.01]}>
                            <boxGeometry args={[0.05, 0.3, 0.02]} />
                            <meshStandardMaterial color="white" />
                        </mesh>
                        <mesh position={[0, -0.3, 0.01]}>
                            <boxGeometry args={[0.05, 0.3, 0.02]} />
                            <meshStandardMaterial color="white" />
                        </mesh>
                    </group>
                </mesh>
            </Float>
        </group>
    )
}

export default function HeroSection() {
    return (
        <section className="min-h-screen pt-16 flex flex-col">
            <div className="relative h-[60vh]">
                <div className="absolute inset-0">
                    <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                        <Suspense fallback={null}>
                            <ambientLight intensity={0.5} />
                            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                            <PresentationControls
                                global
                                rotation={[0, 0, 0]}
                                polar={[-Math.PI / 4, Math.PI / 4]}
                                azimuth={[-Math.PI / 4, Math.PI / 4]}
                                speed={2}
                                damping={0.2}
                                snap={true}
                            >
                                <FloatingDocuments />
                            </PresentationControls>
                            <Environment preset="city" />
                        </Suspense>
                    </Canvas>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 flex flex-col justify-center items-center text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-400 bg-clip-text text-transparent">
                    Transform Your Learning Experience
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mb-8">
                    AI-powered tools to generate MCQs, subjective questions, and interactive flowcharts from your study materials
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                        size="lg"
                        className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                    >
                        Get Started
                    </Button>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                        <FileUp className="mr-2 h-4 w-4" /> Upload PDF
                    </Button>
                </div>
            </div>
        </section>
    )
}

