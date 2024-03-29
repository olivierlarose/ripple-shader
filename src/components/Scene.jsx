'use client'
import { Canvas } from '@react-three/fiber'
import React from 'react'
import Model from './Model';

export default function Scene() {
  return (
    <Canvas flat linear style={{background: "black"}}>
        <Model />
        {/* <ambientLight intensity={0.1} /> */}
    </Canvas>
  )
}
