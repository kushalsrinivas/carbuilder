import { useEffect, useRef } from 'react'
import { RigidBody } from '@react-three/rapier'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

import useGameStore from '../store/gameStore'

// Individual cube component
const Cube = ({ id, position, rotation, scale, isSelected, onSelect }) => {
    const rigidBodyRef = useRef()
    const meshRef = useRef()

    // Handle click to select
    const handleClick = (e) => {
        e.stopPropagation()
        onSelect(id)
    }

    // Update mesh material when selection changes
    useEffect(() => {
        if (meshRef.current) {
            if (isSelected) {
                meshRef.current.material.emissive.setHex(0x444444)
                meshRef.current.material.emissiveIntensity = 0.3
            } else {
                meshRef.current.material.emissive.setHex(0x000000)
                meshRef.current.material.emissiveIntensity = 0
            }
        }
    }, [isSelected])

    return (
        <RigidBody
            ref={rigidBodyRef}
            type="dynamic"
            position={[position.x, position.y, position.z]}
            rotation={[rotation.x, rotation.y, rotation.z]}
            colliders="cuboid"
            userData={{ id, type: 'placedObject' }}
        >
            <mesh ref={meshRef} castShadow receiveShadow onClick={handleClick}>
                <boxGeometry args={[scale.x, scale.y, scale.z]} />
                <meshStandardMaterial 
                    color="#ff6b35" 
                    roughness={0.5}
                    metalness={0.1}
                />
            </mesh>
            {isSelected && (
                <lineSegments>
                    <edgesGeometry args={[new THREE.BoxGeometry(scale.x, scale.y, scale.z)]} />
                    <lineBasicMaterial color="#ffff00" linewidth={2} />
                </lineSegments>
            )}
        </RigidBody>
    )
}

// Main ObjectManager component
const ObjectManager = () => {
    const objects = useGameStore((state) => state.objects)
    const selectedObjectId = useGameStore((state) => state.selectedObjectId)
    const setSelectedObject = useGameStore((state) => state.setSelectedObject)
    const deleteObject = useGameStore((state) => state.deleteObject)

    // Handle keyboard events for deletion
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObjectId) {
                // Prevent default backspace navigation
                e.preventDefault()
                deleteObject(selectedObjectId)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedObjectId, deleteObject])

    return (
        <group name="ObjectManager">
            {objects.map((obj) => (
                <Cube
                    key={obj.id}
                    id={obj.id}
                    position={obj.position}
                    rotation={obj.rotation}
                    scale={obj.scale}
                    isSelected={obj.id === selectedObjectId}
                    onSelect={setSelectedObject}
                />
            ))}
        </group>
    )
}

export default ObjectManager

