import { useLoader, useFrame } from '@react-three/fiber'
import React, { useRef } from 'react'
import { TextureLoader } from 'three/src/loaders/TextureLoader'

export default function Waves({pointer}) {

    const meshes = useRef([]);
    const prevMouse = useRef({
        x: 0,
        y: 0
    })
    const index = useRef(0);
    const max = 100
    const map = useLoader(TextureLoader, "/medias/ripple.png")

    useFrame( ({viewport}) => {
        manageMouse({
            x: (pointer.x * viewport.width) / 2,
            y: (pointer.y * viewport.height) / 2
        })
        manageWaves();
    })
    
    const manageMouse = (pointer) => {
        const { x, y } = prevMouse.current;
        if(Math.abs(pointer.x - x) > 0.01 || Math.abs(pointer.y - y ) > 0.01){
            index.current = (index.current + 1) % max
            prevMouse.current = {...pointer}
            setWave(pointer.x, pointer.y, index.current);
        }
    }

    const manageWaves = () => {
        meshes.current.forEach(mesh => {
            mesh.rotation.z += 0.025;
            mesh.material.opacity *= 0.95
            mesh.scale.x = mesh.scale.x * 0.98 + 0.155
            mesh.scale.y = mesh.scale.y * 0.98 + 0.155
        })
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
        {
            [...Array(max)].map( (_,i) => {
                return <mesh key={i} ref={ref => meshes.current[i] = ref} rotation-z={Math.random()} visible={false}>
                    <planeGeometry args={[1, 1, 1, 1]}/>
                    <meshBasicMaterial map={map} transparent={true}/>
                </mesh>
            })
        }
        </group>
    )
}
