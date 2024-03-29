import { useLoader, useFrame, useThree, createPortal } from '@react-three/fiber'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import { useMemo, useRef } from 'react';
import { useFBO, useAspect, useTexture } from "@react-three/drei";
import { vertex, fragment } from './shader';

import * as THREE from 'three';

export default function Scene() {
    const meshes = useRef([]);
    const plane = useRef();
    const waveScene = new THREE.Scene();
    const prevMouse = useRef({
        x: 0,
        y: 0
    })
    const index = useRef(0);
    const max = 500
    const map = useLoader(TextureLoader, "/medias/ripple.png")
    const texture = useTexture({map: "/medias/background.jpeg"})

    const renderTarget = useFBO();
    const { viewport } = useThree();

    useFrame( ({gl, pointer, viewport, scene, camera}) => {
        manageMouse({
            x: (pointer.x * viewport.width) / 2,
            y: (pointer.y * viewport.height) / 2
        })
        manageWaves();

        gl.setRenderTarget(renderTarget)
        gl.render(waveScene, camera)
        // plane.current.material.map = renderTarget.texture;
        plane.current.material.uniforms.winResolution.value = new THREE.Vector2(
            window.innerWidth,
            window.innerHeight
        );
        //.multiplyScalar(Math.min(window.devicePixelRatio, 2)) 
        plane.current.material.uniforms.uDisplacement.value = renderTarget.texture
        gl.setRenderTarget(null);
    })

    const uniforms = useMemo( () => ({
        uTexture: { value: texture.map },
        uDisplacement: { value: null },
        winResolution: { value: new THREE.Vector2(
            0,
            0
          ),
        }
        // winResolution: { value: new THREE.Vector2(
        //     0,
        //     0
        //   ).multiplyScalar(Math.min(window.devicePixelRatio, 2)),
        // }
    }), [])
    
    const scale = useAspect(
        texture.map.image.width,
        texture.map.image.height,
        1
    )

    const manageWaves = () => {
        meshes.current.forEach(mesh => {
            mesh.rotation.z += 0.025;
            mesh.material.opacity *= 0.99
            mesh.scale.x = mesh.scale.x * 0.99 + 0.1
            mesh.scale.y = mesh.scale.y * 0.99 + 0.1
        })
    }

    const manageMouse = (pointer) => {
        const { x, y } = prevMouse.current;
        if(Math.abs(pointer.x - x) > 0.001 || Math.abs(pointer.y - y ) > 0.001){
            index.current = (index.current + 1) % max
            prevMouse.current = {...pointer}
            setWave(pointer.x, pointer.y, index.current);
        }
    }

    const setWave = (x, y, index) => {
        const mesh = meshes.current[index]
        mesh.position.x = x;
        mesh.position.y = y;
        mesh.material.opacity = 1;
        mesh.scale.x = 1.75;
        mesh.scale.y = 1.75;
        mesh.visible = true;
    }

    return (
        <group>
            {createPortal(
                [...Array(max)].map( (_,i) => {
                    return <mesh key={i} ref={ref => meshes.current[i] = ref} rotation-z={Math.random()} visible={false}>
                        <planeGeometry args={[1, 1, 1, 1]}/>
                        <meshBasicMaterial map={map} transparent={true}/>
                    </mesh>
                }),
                waveScene
            )}

            {/* {
                 [...Array(max)].map( (_,i) => {
                    return <mesh scale={[viewport.width, viewport.height, 1]} key={i} ref={ref => meshes.current[i] = ref} rotation-z={Math.random()} visible={false}>
                        <planeGeometry args={[1, 1, 1, 1]}/>
                        <meshBasicMaterial map={map} transparent={true}/>
                    </mesh>
                })
            } */}
            <mesh ref={plane} scale={scale}>
                <planeGeometry/>
                <shaderMaterial
                    fragmentShader={fragment}
                    vertexShader={vertex}
                    uniforms={uniforms}
                />
                {/* <meshBasicMaterial map={texture.map}/> */}
            </mesh>
            {/* <Image scale={[viewport.width, viewport.height, 1]} url="/medias/background.jpeg">
                <planeGeometry args={[1, 1, 1, 1]}/>
            </Image> */}
        </group>
    )
}
