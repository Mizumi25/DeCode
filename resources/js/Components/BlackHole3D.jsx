import React, { useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { gsap } from 'gsap';

// Particle System Component
function Particles({ count = 1000 }) {
  const mesh = useRef();
  const particlesRef = useRef([]);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = 3 + Math.random() * 5;
      
      temp.push({
        position: new THREE.Vector3(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        speed: 0.5 + Math.random() * 1.5,
        size: Math.random() * 0.05 + 0.02
      });
    }
    return temp;
  }, [count]);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    
    const positions = mesh.current.geometry.attributes.position.array;
    const time = state.clock.elapsedTime;
    
    particles.forEach((particle, i) => {
      // Calculate direction to center (blackhole)
      const direction = new THREE.Vector3()
        .subVectors(new THREE.Vector3(0, 0, 0), particle.position)
        .normalize();
      
      // Apply gravitational pull
      particle.velocity.add(direction.multiplyScalar(0.001 * particle.speed));
      
      // Add orbital motion
      const tangent = new THREE.Vector3(-particle.position.y, particle.position.x, 0).normalize();
      particle.velocity.add(tangent.multiplyScalar(0.005));
      
      // Apply velocity
      particle.position.add(particle.velocity);
      
      // Reset if too close to center (sucked in)
      const distance = particle.position.length();
      if (distance < 0.5) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const radius = 5 + Math.random() * 3;
        
        particle.position.set(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        );
        particle.velocity.multiplyScalar(0.1);
      }
      
      // Update positions
      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;
    });
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
    mesh.current.rotation.y += 0.0005;
  });

  const particlePositions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    particles.forEach((particle, i) => {
      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;
    });
    return positions;
  }, [particles, count]);

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlePositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// BlackHole Model Component
function BlackHoleModel({ scrollProgress }) {
  console.log('🎨 BlackHoleModel: Loading GLTF...');
  const { scene } = useGLTF('/3d/black_hole.gltf');
  console.log('🎨 BlackHoleModel: GLTF loaded successfully', scene);
  const groupRef = useRef();
  
  useEffect(() => {
    // Keep original GLTF materials but make them GLOW
    scene.traverse((child) => {
      if (child.isMesh) {
        // Clone the original material to keep its properties
        const originalMaterial = child.material;
        child.material = new THREE.MeshStandardMaterial({
          color: originalMaterial.color || 0xffffff,
          emissive: originalMaterial.emissive || 0xffffff,
          emissiveIntensity: 2.0, // CRANK IT UP
          metalness: 0.9,
          roughness: 0.2,
          envMapIntensity: 1.5,
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Horizontal rotation (facing sideways)
      groupRef.current.rotation.y += 0.005;
      
      // Subtle breathing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      groupRef.current.scale.setScalar(scale);
    }
  });
  
  return (
    <group ref={groupRef} rotation={[0, Math.PI / 2, 0]}>
      <primitive object={scene} scale={1.2} />
      {/* Add point light that follows the model for extra glow */}
      <pointLight position={[0, 0, 0]} intensity={3} distance={10} color="#ffffff" />
    </group>
  );
}

// Accretion Disk Component
function AccretionDisk() {
  const diskRef = useRef();
  
  useFrame((state) => {
    if (diskRef.current) {
      diskRef.current.rotation.z += 0.01;
      // Pulsing effect
      const opacity = 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      diskRef.current.material.opacity = opacity;
    }
  });
  
  return (
    <mesh ref={diskRef} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.2, 2.5, 64]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.4}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Main Scene Component
function BlackHoleScene({ onLoaded, scrollProgress }) {
  const groupRef = useRef();
  
  useEffect(() => {
    if (groupRef.current && onLoaded) {
      // Animate appearance like a real blackhole
      gsap.fromTo(groupRef.current.scale,
        { x: 0, y: 0, z: 0 },
        {
          x: 1,
          y: 1,
          z: 1,
          duration: 2,
          ease: 'elastic.out(1, 0.5)',
          onComplete: () => onLoaded()
        }
      );
    }
  }, [onLoaded]);
  
  return (
    <>
      <group ref={groupRef}>
        {/* INTENSE Lighting for that GLOW */}
        <ambientLight intensity={0.8} />
        <pointLight position={[5, 5, 5]} intensity={4} color="#ffffff" decay={0.5} />
        <pointLight position={[-5, -5, -5]} intensity={4} color="#ffffff" decay={0.5} />
        <pointLight position={[0, 0, 10]} intensity={5} color="#ffffff" decay={0.5} />
        <pointLight position={[10, 0, 0]} intensity={3} color="#88ccff" decay={0.5} />
        <pointLight position={[-10, 0, 0]} intensity={3} color="#ff88cc" decay={0.5} />
        <spotLight
          position={[0, 15, 0]}
          angle={0.6}
          penumbra={1}
          intensity={3}
          color="#ffffff"
          castShadow
        />
        
        {/* BlackHole Model */}
        <BlackHoleModel scrollProgress={scrollProgress} />
        
        {/* Accretion Disk */}
        <AccretionDisk />
        
        {/* Particles being sucked in */}
        <Particles count={1500} />
        
        {/* Inner Glow */}
        <mesh>
          <sphereGeometry args={[2.8, 32, 32]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.15}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        
        {/* Outer Glow Halo */}
        <mesh>
          <sphereGeometry args={[4, 32, 32]} />
          <meshBasicMaterial
            color="#aaccff"
            transparent
            opacity={0.08}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
      
      {/* Environment map for reflections */}
      <Environment preset="night" />
    </>
  );
}

// Main Export Component
export default function BlackHole3D({ className = '', onLoaded, scrollProgress = 0 }) {
  console.log('🌌 BlackHole3D: Component initializing...');
  const [isReady, setIsReady] = React.useState(false);
  
  useEffect(() => {
    console.log('🌌 BlackHole3D: useEffect running, setting ready...');
    // Ensure Three.js and Canvas are ready
    setIsReady(true);
  }, []);
  
  if (!isReady) {
    console.log('⏳ BlackHole3D: Not ready yet, showing empty div');
    return <div className={`${className}`} style={{ width: '100%', height: '100%' }} />;
  }
  
  console.log('✅ BlackHole3D: Ready! Rendering Canvas');
  
  return (
    <div className={`${className}`} style={{ width: '100%', height: '100%' }}>
      <Canvas
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.5,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000', 0);
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
        <Suspense fallback={null}>
          <BlackHoleScene onLoaded={onLoaded} scrollProgress={scrollProgress} />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />
        {/* POST-PROCESSING EFFECTS - THIS IS THE MAGIC! */}
        <EffectComposer>
          <Bloom
            intensity={2.5}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
            radius={1}
          />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={[0.001, 0.001]}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

// Preload the model
if (typeof window !== 'undefined') {
  useGLTF.preload('/3d/black_hole.gltf');
}
