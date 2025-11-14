import { useRef, useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js'
import useGameStore from '../store/gameStore'

/**
 * DecalOverlay Component
 * Manages all decals using DecalGeometry and handles click-to-place interaction
 */
const DecalOverlay = () => {
  const { scene, camera } = useThree()
  const [vehicleMesh, setVehicleMesh] = useState(null)
  const decalMeshesRef = useRef(new Map()) // Map of decalId -> THREE.Mesh
  const texturesRef = useRef(new Map()) // Map of imageUrl -> THREE.Texture (for caching)
  const raycasterRef = useRef(new THREE.Raycaster())
  
  const decals = useGameStore((state) => state.decals)
  const placementMode = useGameStore((state) => state.placementMode)
  const setPlacementMode = useGameStore((state) => state.setPlacementMode)
  const updateDecal = useGameStore((state) => state.updateDecal)
  const selectedDecalId = useGameStore((state) => state.selectedDecalId)
  const setSelectedDecal = useGameStore((state) => state.setSelectedDecal)

  // Find vehicle mesh on mount and when scene changes
  useEffect(() => {
    const findVehicleMesh = () => {
      let foundMesh = null
      let candidateMeshes = []
      
      scene.traverse((object) => {
        if (object.isMesh && object.geometry.attributes.position) {
          const vertexCount = object.geometry.attributes.position.count
          
          // Look for meshes that are descendants of a 'Body' group
          let current = object.parent
          let isInBody = false
          let depth = 0
          
          while (current && depth < 10) {
            if (current.name === 'Body') {
              isInBody = true
              break
            }
            current = current.parent
            depth++
          }
          
          if (isInBody && vertexCount > 100) {
            candidateMeshes.push({
              mesh: object,
              name: object.name,
              parentName: object.parent?.name,
              vertices: vertexCount
            })
            
            // Prefer the largest mesh (main body)
            if (!foundMesh || vertexCount > foundMesh.geometry.attributes.position.count) {
              foundMesh = object
            }
          }
        }
      })
      
      console.log('🔍 Found candidate vehicle meshes:', candidateMeshes.length)
      if (candidateMeshes.length > 0) {
        console.log('Top 3 candidates:', candidateMeshes
          .sort((a, b) => b.vertices - a.vertices)
          .slice(0, 3)
          .map(m => ({ name: m.name, vertices: m.vertices, parent: m.parentName }))
        )
      }
      
      if (foundMesh) {
        console.log('✅ Found vehicle mesh for decals:', {
          name: foundMesh.name,
          parent: foundMesh.parent?.name,
          vertices: foundMesh.geometry.attributes.position.count,
          position: foundMesh.position,
          hasGeometry: !!foundMesh.geometry
        })
        setVehicleMesh(foundMesh)
      } else {
        console.warn('⚠️ Could not find vehicle mesh for decals')
        console.warn('Looked for meshes under "Body" group with >100 vertices')
      }
    }

    // Try to find mesh immediately
    findVehicleMesh()

    // Also try again after delays in case scene is still loading
    const timeout1 = setTimeout(findVehicleMesh, 1000)
    const timeout2 = setTimeout(findVehicleMesh, 2000)

    return () => {
      clearTimeout(timeout1)
      clearTimeout(timeout2)
    }
  }, [scene])

  // Load or get cached texture
  const getTexture = (imageUrl) => {
    return new Promise((resolve, reject) => {
      // Check cache first
      if (texturesRef.current.has(imageUrl)) {
        resolve(texturesRef.current.get(imageUrl))
        return
      }

      // Load new texture
      const loader = new THREE.TextureLoader()
      loader.load(
        imageUrl,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace
          texturesRef.current.set(imageUrl, texture)
          resolve(texture)
        },
        undefined,
        (error) => {
          console.error('❌ Error loading decal texture:', error)
          reject(error)
        }
      )
    })
  }

  // Create or update decal mesh using DecalGeometry
  const createOrUpdateDecalMesh = async (decal) => {
    if (!vehicleMesh) return

    try {
      const texture = await getTexture(decal.imageUrl)
      
      // Get existing mesh or create new one
      let decalMesh = decalMeshesRef.current.get(decal.id)
      
      const position = new THREE.Vector3(decal.position.x, decal.position.y, decal.position.z)
      const orientation = new THREE.Euler(decal.rotation.x, decal.rotation.y, decal.rotation.z)
      const size = new THREE.Vector3(decal.scale.x, decal.scale.y, decal.scale.z)

      if (!decalMesh) {
        // Create new decal mesh
        const geometry = new DecalGeometry(vehicleMesh, position, orientation, size)
        
        const material = new THREE.MeshStandardMaterial({
          map: texture,
          transparent: true,
          opacity: decal.opacity,
          depthTest: true,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -4,
          roughness: 0.6,
          metalness: 0,
        })

        decalMesh = new THREE.Mesh(geometry, material)
        decalMesh.renderOrder = decals.length // Give decals a fixed render order
        
        // Attach to vehicle mesh so it moves with the vehicle
        vehicleMesh.add(decalMesh)
        decalMeshesRef.current.set(decal.id, decalMesh)
        
        console.log('✅ Created new decal mesh:', decal.id)
      } else {
        // Update existing decal mesh
        const newGeometry = new DecalGeometry(vehicleMesh, position, orientation, size)
        decalMesh.geometry.dispose() // Clean up old geometry
        decalMesh.geometry = newGeometry
        
        // Update material properties
        decalMesh.material.opacity = decal.opacity
        decalMesh.material.map = texture
        decalMesh.material.needsUpdate = true
        
        console.log('✅ Updated decal mesh:', decal.id)
      }
    } catch (error) {
      console.error('❌ Failed to create/update decal mesh:', error)
    }
  }

  // Sync decals with Three.js scene
  useEffect(() => {
    if (!vehicleMesh) return

    // Create or update meshes for all decals
    decals.forEach((decal) => {
      createOrUpdateDecalMesh(decal)
    })

    // Remove meshes for decals that no longer exist
    const decalIds = new Set(decals.map(d => d.id))
    decalMeshesRef.current.forEach((mesh, id) => {
      if (!decalIds.has(id)) {
        // Remove from scene and cleanup
        vehicleMesh.remove(mesh)
        mesh.geometry.dispose()
        mesh.material.dispose()
        decalMeshesRef.current.delete(id)
        console.log('🗑️ Removed decal mesh:', id)
      }
    })
  }, [decals, vehicleMesh])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Dispose all decal meshes
      decalMeshesRef.current.forEach((mesh) => {
        if (mesh.parent) {
          mesh.parent.remove(mesh)
        }
        mesh.geometry.dispose()
        mesh.material.dispose()
      })
      decalMeshesRef.current.clear()
      
      // Dispose all textures
      texturesRef.current.forEach((texture) => {
        texture.dispose()
      })
      texturesRef.current.clear()
    }
  }, [])

  // Handle click on vehicle to place/reposition decal
  useEffect(() => {
    if (!vehicleMesh) return

    const handleClick = (event) => {
      // Only handle left clicks on the canvas
      if (event.button !== 0) return
      
      // Check if we should handle this click (placement mode or selected decal)
      if (!placementMode && !selectedDecalId) return

      // Get canvas element
      const canvas = event.target.closest('canvas')
      if (!canvas) return

      // Calculate normalized device coordinates (mouse position)
      const rect = canvas.getBoundingClientRect()
      const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1

      // Set up raycaster
      const raycaster = raycasterRef.current
      raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera)

      // Check intersection with vehicle mesh
      const intersects = raycaster.intersectObject(vehicleMesh, false)

      if (intersects.length > 0) {
        const intersection = intersects[0]
        const { point, face } = intersection

        if (!face) {
          console.warn('⚠️ No face data in intersection')
          return
        }

        // Calculate normal from face
        const normal = face.normal.clone()
        
        // Transform normal to world space
        const normalMatrix = new THREE.Matrix3().getNormalMatrix(vehicleMesh.matrixWorld)
        normal.applyMatrix3(normalMatrix).normalize()

        // Calculate rotation to align decal with surface normal
        // Create a helper to look at the point along the normal
        const position = point.clone()
        const orientation = new THREE.Euler()
        
        // Create a quaternion to orient the decal perpendicular to the surface
        const up = new THREE.Vector3(0, 0, 1) // Decal faces along Z axis
        const quaternion = new THREE.Quaternion()
        quaternion.setFromUnitVectors(up, normal)
        orientation.setFromQuaternion(quaternion)

        // Get the decal to update
        let targetDecalId = selectedDecalId
        
        if (placementMode && decals.length > 0) {
          // In placement mode, update the most recently added decal
          targetDecalId = decals[decals.length - 1].id
          setPlacementMode(false)
          setSelectedDecal(targetDecalId)
        }

        if (targetDecalId) {
          // Get current decal to preserve z rotation
          const currentDecal = decals.find(d => d.id === targetDecalId)
          const zRotation = currentDecal?.rotation?.z || 0

          // Update decal position and rotation
          updateDecal(targetDecalId, {
            position: {
              x: position.x,
              y: position.y,
              z: position.z
            },
            rotation: {
              x: orientation.x,
              y: orientation.y,
              z: zRotation // Preserve user's z rotation
            },
            normal: {
              x: normal.x,
              y: normal.y,
              z: normal.z
            }
          })

          console.log('🎯 Decal placed/moved:', {
            decalId: targetDecalId,
            position: { x: position.x.toFixed(2), y: position.y.toFixed(2), z: position.z.toFixed(2) },
            normal: { x: normal.x.toFixed(2), y: normal.y.toFixed(2), z: normal.z.toFixed(2) },
            rotation: { x: (orientation.x * 180 / Math.PI).toFixed(0) + '°', y: (orientation.y * 180 / Math.PI).toFixed(0) + '°', z: (zRotation * 180 / Math.PI).toFixed(0) + '°' }
          })
          
          useGameStore.getState().showNotification({
            message: 'Decal placed!',
            type: 'success',
            duration: 2000,
          })
        }
      } else {
        console.log('⚠️ No intersection with vehicle mesh')
      }
    }

    // Add event listener to canvas
    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.addEventListener('click', handleClick)
      return () => canvas.removeEventListener('click', handleClick)
    }
  }, [
    vehicleMesh,
    camera,
    placementMode,
    selectedDecalId,
    decals,
    setPlacementMode,
    updateDecal,
    setSelectedDecal
  ])

  // Change cursor when in placement mode
  useEffect(() => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      if (placementMode || selectedDecalId) {
        canvas.style.cursor = 'crosshair'
      } else {
        canvas.style.cursor = ''
      }
    }

    return () => {
      if (canvas) {
        canvas.style.cursor = ''
      }
    }
  }, [placementMode, selectedDecalId])

  // Debug: Log decals
  useEffect(() => {
    console.log('📊 Current decals:', decals.length, decals)
    console.log('🚗 Vehicle mesh found:', !!vehicleMesh)
  }, [decals, vehicleMesh])

  // This component doesn't render anything in the React tree
  // All decals are managed as Three.js meshes attached to the vehicle
  return null
}

export default DecalOverlay

