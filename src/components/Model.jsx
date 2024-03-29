import { useFrame, createPortal, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react';
import { useFBO, useAspect, useTexture } from "@react-three/drei";
import { vertex, fragment } from './shader';
import Waves from './Waves';

import * as THREE from 'three';

export default function Scene() {
    const plane = useRef();
    const waveScene = new THREE.Scene();
    const texture = useTexture({map: "/medias/background2.jpg"})
    const renderTarget = useFBO();

    useFrame( ({gl, pointer, viewport, scene, camera}) => {
        gl.setRenderTarget(renderTarget)
        gl.render(waveScene, camera)
        plane.current.material.uniforms.winResolution.value = new THREE.Vector2(
            window.innerWidth,
            window.innerHeight
        ).multiplyScalar(Math.min(window.devicePixelRatio, 2));
        plane.current.material.uniforms.uDisplacement.value = renderTarget.texture
        gl.setRenderTarget(null);
    })

    const uniforms = useMemo( () => ({
        uTexture: { value: texture.map },
        uDisplacement: { value: null },
        winResolution: { value: new THREE.Vector2(0, 0) }
    }), [])
    
    const scale = useAspect(
        texture.map.image.width,
        texture.map.image.height,
        1
    )
    const { pointer } = useThree();
    return (
        <group>
            {createPortal(<Waves pointer={pointer}/>, waveScene)}
            <mesh ref={plane} scale={scale}>
                <planeGeometry/>
                <shaderMaterial
                    fragmentShader={fragment}
                    vertexShader={vertex}
                    uniforms={uniforms}
                />
            </mesh>
        </group>
    )
}

