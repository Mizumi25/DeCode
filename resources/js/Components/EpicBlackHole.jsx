import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

// Extend THREE with post-processing
extend({ EffectComposer, RenderPass, UnrealBloomPass, ShaderPass });

const BLACK_HOLE_RADIUS = 1.3;
const DISK_INNER_RADIUS = BLACK_HOLE_RADIUS + 0.2;
const DISK_OUTER_RADIUS = 8.0;
const DISK_TILT_ANGLE = Math.PI / 3.0;

// Simplex Noise function for accretion disk
const simplexNoiseGLSL = `
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 = v - i + dot(i, C.xxx) ;
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute( permute( permute( 
                 i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
               + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        float n_ = 0.142857142857;
        vec3  ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }
`;

// Twinkling Stars Component
function TwinklingStars() {
  const pointsRef = useRef();
  const starCount = 150000;
  const starFieldRadius = 2000;

  const { positions, colors, sizes, twinkle } = useMemo(() => {
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const twinkle = new Float32Array(starCount);

    const starPalette = [
      new THREE.Color(0x88aaff), new THREE.Color(0xffaaff), new THREE.Color(0xaaffff),
      new THREE.Color(0xffddaa), new THREE.Color(0xffeecc), new THREE.Color(0xffffff),
      new THREE.Color(0xff8888), new THREE.Color(0x88ff88), new THREE.Color(0xffff88),
      new THREE.Color(0x88ffff)
    ];

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const phi = Math.acos(-1 + (2 * i) / starCount);
      const theta = Math.sqrt(starCount * Math.PI) * phi;
      const radius = Math.cbrt(Math.random()) * starFieldRadius + 100;

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const starColor = starPalette[Math.floor(Math.random() * starPalette.length)].clone();
      starColor.multiplyScalar(Math.random() * 0.7 + 0.3);
      colors[i3] = starColor.r;
      colors[i3 + 1] = starColor.g;
      colors[i3 + 2] = starColor.b;
      sizes[i] = THREE.MathUtils.randFloat(0.6, 3.0);
      twinkle[i] = Math.random() * Math.PI * 2;
    }

    return { positions, colors, sizes, twinkle };
  }, []);

  const starMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.5) }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uPixelRatio;
        attribute float size;
        attribute float twinkle;
        varying vec3 vColor;
        varying float vTwinkle;
        
        void main() {
          vColor = color;
          vTwinkle = sin(uTime * 2.5 + twinkle) * 0.5 + 0.5;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vTwinkle;
        
        void main() {
          float dist = distance(gl_PointCoord, vec2(0.5));
          if (dist > 0.5) discard;
          
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha *= (0.2 + vTwinkle * 0.8);
          
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      starMaterial.uniforms.uTime.value = state.clock.elapsedTime;
      pointsRef.current.rotation.y += 0.003 * 0.016;
      pointsRef.current.rotation.x += 0.001 * 0.016;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={starCount} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={starCount} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={starCount} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-twinkle" count={starCount} array={twinkle} itemSize={1} />
      </bufferGeometry>
      <primitive object={starMaterial} attach="material" />
    </points>
  );
}

// Event Horizon Component
function EventHorizon() {
  const meshRef = useRef();
  const { camera } = useThree();

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uCameraPosition: { value: camera.position }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uCameraPosition;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vec3 viewDirection = normalize(uCameraPosition - vPosition);
          float fresnel = 1.0 - abs(dot(vNormal, viewDirection));
          fresnel = pow(fresnel, 2.5);
          
          vec3 glowColor = vec3(1.0, 0.4, 0.1);
          float pulse = sin(uTime * 2.5) * 0.15 + 0.85;
          
          gl_FragColor = vec4(glowColor * fresnel * pulse, fresnel * 0.4);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
  }, [camera]);

  useFrame((state) => {
    if (meshRef.current) {
      material.uniforms.uTime.value = state.clock.elapsedTime;
      material.uniforms.uCameraPosition.value.copy(camera.position);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[BLACK_HOLE_RADIUS * 1.05, 128, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

// Black Hole Core Component
function BlackHoleCore() {
  return (
    <mesh renderOrder={0}>
      <sphereGeometry args={[BLACK_HOLE_RADIUS, 128, 64]} />
      <meshBasicMaterial color={0x000000} />
    </mesh>
  );
}

// Accretion Disk Component
function AccretionDisk() {
  const meshRef = useRef();

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uColorHot: { value: new THREE.Color(0xffffff) },
        uColorMid1: { value: new THREE.Color(0xff7733) },
        uColorMid2: { value: new THREE.Color(0xff4477) },
        uColorMid3: { value: new THREE.Color(0x7744ff) },
        uColorOuter: { value: new THREE.Color(0x4477ff) },
        uNoiseScale: { value: 2.5 },
        uFlowSpeed: { value: 0.22 },
        uDensity: { value: 1.3 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vRadius;
        varying float vAngle;
        void main() {
          vUv = uv;
          vRadius = length(position.xy);
          vAngle = atan(position.y, position.x);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColorHot;
        uniform vec3 uColorMid1;
        uniform vec3 uColorMid2;
        uniform vec3 uColorMid3;
        uniform vec3 uColorOuter;
        uniform float uNoiseScale;
        uniform float uFlowSpeed;
        uniform float uDensity;

        varying vec2 vUv;
        varying float vRadius;
        varying float vAngle;

        ${simplexNoiseGLSL}

        void main() {
          float normalizedRadius = smoothstep(${DISK_INNER_RADIUS.toFixed(2)}, ${DISK_OUTER_RADIUS.toFixed(2)}, vRadius);
          
          float spiral = vAngle * 3.0 - (1.0 / (normalizedRadius + 0.1)) * 2.0;
          vec2 noiseUv = vec2(vUv.x + uTime * uFlowSpeed * (2.0 / (vRadius * 0.3 + 1.0)) + sin(spiral) * 0.1, vUv.y * 0.8 + cos(spiral) * 0.1);
          float noiseVal1 = snoise(vec3(noiseUv * uNoiseScale, uTime * 0.15));
          float noiseVal2 = snoise(vec3(noiseUv * uNoiseScale * 3.0 + 0.8, uTime * 0.22));
          float noiseVal3 = snoise(vec3(noiseUv * uNoiseScale * 6.0 + 1.5, uTime * 0.3));
          
          float noiseVal = (noiseVal1 * 0.45 + noiseVal2 * 0.35 + noiseVal3 * 0.2);
          noiseVal = (noiseVal + 1.0) * 0.5;
          
          vec3 color = uColorOuter;
          color = mix(color, uColorMid3, smoothstep(0.0, 0.25, normalizedRadius));
          color = mix(color, uColorMid2, smoothstep(0.2, 0.55, normalizedRadius));
          color = mix(color, uColorMid1, smoothstep(0.5, 0.75, normalizedRadius));
          color = mix(color, uColorHot, smoothstep(0.7, 0.95, normalizedRadius));
          
          color *= (0.5 + noiseVal * 1.0);
          float brightness = pow(1.0 - normalizedRadius, 1.0) * 3.5 + 0.5;
          brightness *= (0.3 + noiseVal * 2.2);
          
          float pulse = sin(uTime * 1.8 + normalizedRadius * 12.0 + vAngle * 2.0) * 0.15 + 0.85;
          brightness *= pulse;
          
          float alpha = uDensity * (0.2 + noiseVal * 0.9);
          alpha *= smoothstep(0.0, 0.15, normalizedRadius);
          alpha *= (1.0 - smoothstep(0.85, 1.0, normalizedRadius));
          alpha = clamp(alpha, 0.0, 1.0);

          gl_FragColor = vec4(color * brightness, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      material.uniforms.uTime.value = state.clock.elapsedTime;
      meshRef.current.rotation.z += 0.005 * 0.016;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[DISK_TILT_ANGLE, 0, 0]} renderOrder={1}>
      <ringGeometry args={[DISK_INNER_RADIUS, DISK_OUTER_RADIUS, 256, 128]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

// Post-Processing Effects
function Effects() {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef();
  const blackHolePosRef = useRef(new THREE.Vector3());

  useEffect(() => {
    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.8, 0.7, 0.8
    );
    composer.addPass(bloomPass);

    const lensingShader = {
      uniforms: {
        tDiffuse: { value: null },
        blackHoleScreenPos: { value: new THREE.Vector2(0.5, 0.5) },
        lensingStrength: { value: 0.12 },
        lensingRadius: { value: 0.3 },
        aspectRatio: { value: size.width / size.height },
        chromaticAberration: { value: 0.005 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 blackHoleScreenPos;
        uniform float lensingStrength;
        uniform float lensingRadius;
        uniform float aspectRatio;
        uniform float chromaticAberration;
        varying vec2 vUv;
        
        void main() {
          vec2 screenPos = vUv;
          vec2 toCenter = screenPos - blackHoleScreenPos;
          toCenter.x *= aspectRatio;
          float dist = length(toCenter);
          
          float distortionAmount = lensingStrength / (dist * dist + 0.003);
          distortionAmount = clamp(distortionAmount, 0.0, 0.7);
          float falloff = smoothstep(lensingRadius, lensingRadius * 0.3, dist);
          distortionAmount *= falloff;
          
          vec2 offset = normalize(toCenter) * distortionAmount;
          offset.x /= aspectRatio;
          
          vec2 distortedUvR = screenPos - offset * (1.0 + chromaticAberration);
          vec2 distortedUvG = screenPos - offset;
          vec2 distortedUvB = screenPos - offset * (1.0 - chromaticAberration);
          
          float r = texture2D(tDiffuse, distortedUvR).r;
          float g = texture2D(tDiffuse, distortedUvG).g;
          float b = texture2D(tDiffuse, distortedUvB).b;
          
          gl_FragColor = vec4(r, g, b, 1.0);
        }
      `
    };

    const lensingPass = new ShaderPass(lensingShader);
    composer.addPass(lensingPass);

    composerRef.current = { composer, lensingPass };

    return () => composer.dispose();
  }, [gl, scene, camera, size]);

  useFrame(() => {
    if (composerRef.current) {
      const { composer, lensingPass } = composerRef.current;
      
      // Update black hole screen position for gravitational lensing
      blackHolePosRef.current.set(0, 0, 0).project(camera);
      lensingPass.uniforms.blackHoleScreenPos.value.set(
        (blackHolePosRef.current.x + 1) / 2,
        (blackHolePosRef.current.y + 1) / 2
      );

      composer.render();
    }
  }, 1);

  return null;
}

// Main Scene Component
function BlackHoleScene() {
  const groupRef = useRef();
  const animationProgress = useRef(0);
  const isAnimating = useRef(true);

  useFrame((state, delta) => {
    if (groupRef.current && isAnimating.current) {
      // Smooth animation over ~2 seconds with easeOutCubic
      animationProgress.current += delta * 0.8; // Speed multiplier
      
      if (animationProgress.current >= 1) {
        animationProgress.current = 1;
        isAnimating.current = false;
      }
      
      // EaseOutCubic for smooth deceleration
      const t = animationProgress.current;
      const eased = 1 - Math.pow(1 - t, 3);
      
      // Scale from 0.05 to 1.0
      const scale = 0.05 + eased * 0.95;
      groupRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <>
      <fog attach="fog" args={[0x020104, 0, 2000]} />
      <TwinklingStars />
      <group ref={groupRef} scale={[0.05, 0.05, 0.05]}>
        <EventHorizon />
        <BlackHoleCore />
        <AccretionDisk />
      </group>
    </>
  );
}

// Main Export
export default function EpicBlackHole({ className = '' }) {
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [-6.5, 5.0, 6.5], fov: 60, near: 0.1, far: 4000 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        }}
      >
        <BlackHoleScene />
        <Effects />
      </Canvas>
    </div>
  );
}
