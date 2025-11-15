import { useRef, useState, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Vector3, Raycaster, Plane, Matrix4 } from 'three'
import { useRapier } from '@react-three/rapier'

import useGameStore from '../store/gameStore'

const ObjectPlacementHandler = () => {
    const { camera, scene, gl } = useThree()
    const { world } = useRapier()
    
    const objectPlacementMode = useGameStore((state) => state.objectPlacementMode)
    const selectedObjectId = useGameStore((state) => state.selectedObjectId)
    const objects = useGameStore((state) => state.objects)
    const addObject = useGameStore((state) => state.addObject)
    const updateObject = useGameStore((state) => state.updateObject)
    const setSelectedObject = useGameStore((state) => state.setSelectedObject)
    
    const [ghostPosition, setGhostPosition] = useState(null)
    const [isDragging, setIsDragging] = useState(false)
    const [draggedObjectId, setDraggedObjectId] = useState(null)
    
    const raycaster = useRef(new Raycaster())
    const mouse = useRef(new Vector3())
    const dragPlane = useRef(new Plane())
    const dragOffset = useRef(new Vector3())
    const rigidBodyRef = useRef(null)
    const originalBodyType = useRef(null)

    // Get terrain meshes for raycasting
    const getTerrainMeshes = () => {
        const terrainObjects = scene.children.filter(
            (obj) => obj.name === 'TerrainManager' || obj.name.includes('Terrain')
        )
        const terrainMeshes = []
        terrainObjects.forEach((obj) => {
            obj.traverse((child) => {
                if (child.isMesh) {
                    terrainMeshes.push(child)
                }
            })
        })
        return terrainMeshes
    }

    // Get placed object meshes for raycasting
    const getObjectMeshes = () => {
        const objectManager = scene.children.find((obj) => obj.name === 'ObjectManager')
        if (!objectManager) return []
        
        const objectMeshes = []
        objectManager.traverse((child) => {
            if (child.isMesh && child.parent?.userData?.id) {
                objectMeshes.push(child)
            }
        })
        return objectMeshes
    }

    // Find rigid body by object id
    const findRigidBodyById = (id) => {
        const objectManager = scene.children.find((obj) => obj.name === 'ObjectManager')
        if (!objectManager) return null
        
        let foundBody = null
        objectManager.traverse((child) => {
            if (child.isObject3D && child.userData?.id === id) {
                foundBody = child
            }
        })
        return foundBody
    }

    // Handle mouse move for ghost preview and dragging
    const handleMouseMove = (event) => {
        // Calculate mouse position in normalized device coordinates
        const rect = gl.domElement.getBoundingClientRect()
        mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

        raycaster.current.setFromCamera(mouse.current, camera)

        if (isDragging && draggedObjectId) {
            // Dragging mode: raycast against the drag plane
            const intersection = new Vector3()
            raycaster.current.ray.intersectPlane(dragPlane.current, intersection)
            
            if (intersection) {
                intersection.sub(dragOffset.current)
                
                // Update the object position in the store
                updateObject(draggedObjectId, {
                    position: { x: intersection.x, y: intersection.y, z: intersection.z }
                })

                // Update rigid body position if it exists
                const body = findRigidBodyById(draggedObjectId)
                if (body) {
                    body.setTranslation({ x: intersection.x, y: intersection.y, z: intersection.z }, true)
                    body.setLinvel({ x: 0, y: 0, z: 0 }, true)
                    body.setAngvel({ x: 0, y: 0, z: 0 }, true)
                }
            }
        } else if (objectPlacementMode) {
            // Placement mode: raycast against terrain
            const terrainMeshes = getTerrainMeshes()
            const intersects = raycaster.current.intersectObjects(terrainMeshes, true)
            
            if (intersects.length > 0) {
                const point = intersects[0].point
                setGhostPosition({ x: point.x, y: point.y + 0.5, z: point.z })
            } else {
                setGhostPosition(null)
            }
        }
    }

    // Handle mouse down for placing or selecting objects
    const handleMouseDown = (event) => {
        // Ignore if clicking on UI elements
        if (event.target !== gl.domElement) return

        const rect = gl.domElement.getBoundingClientRect()
        mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

        raycaster.current.setFromCamera(mouse.current, camera)

        if (objectPlacementMode && ghostPosition) {
            // Place a new cube
            addObject({
                type: 'cube',
                position: ghostPosition,
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 }
            })
        } else if (selectedObjectId) {
            // Check if clicking on the selected object to start dragging
            const objectMeshes = getObjectMeshes()
            const intersects = raycaster.current.intersectObjects(objectMeshes, true)
            
            if (intersects.length > 0) {
                const clickedMesh = intersects[0].object
                const clickedObjectId = clickedMesh.parent?.userData?.id
                
                if (clickedObjectId === selectedObjectId) {
                    // Start dragging
                    const selectedObj = objects.find(obj => obj.id === selectedObjectId)
                    if (selectedObj) {
                        setIsDragging(true)
                        setDraggedObjectId(selectedObjectId)
                        
                        // Create drag plane perpendicular to camera
                        const planeNormal = new Vector3()
                        camera.getWorldDirection(planeNormal)
                        dragPlane.current.setFromNormalAndCoplanarPoint(
                            planeNormal,
                            new Vector3(selectedObj.position.x, selectedObj.position.y, selectedObj.position.z)
                        )
                        
                        // Calculate offset from object center to click point
                        const intersection = new Vector3()
                        raycaster.current.ray.intersectPlane(dragPlane.current, intersection)
                        dragOffset.current.set(
                            intersection.x - selectedObj.position.x,
                            intersection.y - selectedObj.position.y,
                            intersection.z - selectedObj.position.z
                        )

                        // Find and set rigid body to kinematic
                        const body = findRigidBodyById(selectedObjectId)
                        if (body) {
                            rigidBodyRef.current = body
                            originalBodyType.current = body.bodyType()
                            body.setBodyType(1, true) // 1 = kinematic
                        }
                    }
                }
            } else {
                // Clicked on empty space, deselect
                setSelectedObject(null)
            }
        } else {
            // Check if clicking to deselect
            const objectMeshes = getObjectMeshes()
            const intersects = raycaster.current.intersectObjects(objectMeshes, true)
            
            if (intersects.length === 0) {
                setSelectedObject(null)
            }
        }
    }

    // Handle mouse up to stop dragging
    const handleMouseUp = () => {
        if (isDragging && draggedObjectId) {
            setIsDragging(false)
            setDraggedObjectId(null)
            
            // Reset rigid body to dynamic
            if (rigidBodyRef.current) {
                rigidBodyRef.current.setBodyType(0, true) // 0 = dynamic
                rigidBodyRef.current = null
                originalBodyType.current = null
            }
        }
    }

    // Add event listeners
    useEffect(() => {
        const canvas = gl.domElement
        canvas.addEventListener('mousemove', handleMouseMove)
        canvas.addEventListener('mousedown', handleMouseDown)
        canvas.addEventListener('mouseup', handleMouseUp)
        
        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove)
            canvas.removeEventListener('mousedown', handleMouseDown)
            canvas.removeEventListener('mouseup', handleMouseUp)
        }
    }, [objectPlacementMode, ghostPosition, selectedObjectId, isDragging, draggedObjectId, objects])

    // Reset ghost position when placement mode is disabled
    useEffect(() => {
        if (!objectPlacementMode) {
            setGhostPosition(null)
        }
    }, [objectPlacementMode])

    // Render ghost cube in placement mode
    if (objectPlacementMode && ghostPosition) {
        return (
            <mesh position={[ghostPosition.x, ghostPosition.y, ghostPosition.z]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial 
                    color="#ff6b35" 
                    transparent 
                    opacity={0.5} 
                    wireframe={false}
                />
            </mesh>
        )
    }

    return null
}

export default ObjectPlacementHandler

