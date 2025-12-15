import React, { Suspense, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage, PresentationControls, Center } from '@react-three/drei';
import { Loader2, AlertCircle } from 'lucide-react';

function Model({ url }) {
  const { scene } = useGLTF(url);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  return <primitive object={clonedScene} />;
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#667eea" wireframe />
    </mesh>
  );
}

const ThreeDModelViewer = ({ src, alt }) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-gray-50 rounded-lg">
      <div className="w-full h-[400px] border border-gray-300 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-600">Loading 3D model...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="flex flex-col items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <p className="text-sm text-gray-600">Failed to load 3D model</p>
            </div>
          </div>
        )}
        
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ width: '100%', height: '100%' }}
          onCreated={({ gl }) => {
            gl.setClearColor('#f3f4f6', 1);
            setIsLoading(false);
          }}
          gl={{ 
            preserveDrawingBuffer: true,
            antialias: true,
            alpha: false
          }}
          frameloop="demand"
        >
          <color attach="background" args={['#f3f4f6']} />
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} />
          <hemisphereLight args={['#ffffff', '#444444', 1]} />
          
          <Suspense fallback={<LoadingFallback />}>
            <Center>
              <Model url={src} />
            </Center>
          </Suspense>
          <OrbitControls
            makeDefault
            enableZoom={true}
            enablePan={true}
            enableDamping={true}
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={10}
          />
        </Canvas>
      </div>
      
      <div className="text-center text-sm text-gray-600">
        <p className="font-medium">{alt}</p>
        <p className="text-xs">Drag to rotate • Scroll to zoom • Right-click to pan</p>
      </div>
    </div>
  );
};

export default ThreeDModelViewer;
