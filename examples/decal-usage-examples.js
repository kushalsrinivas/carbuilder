/**
 * Decal Feature Usage Examples
 * 
 * This file contains code examples for working with the vehicle decal system.
 */

import useGameStore from '../store/gameStore'

// ============================================================================
// Example 1: Adding a Decal Programmatically
// ============================================================================

export function example1_addDecal() {
  const addDecal = useGameStore.getState().addDecal
  
  // Add a decal with default settings
  addDecal({
    imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...',
    fileName: 'my-logo.png',
  })
  
  // Add a decal with custom settings
  addDecal({
    imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...',
    fileName: 'racing-stripe.png',
    position: { x: 0, y: 0.8, z: 0 },
    rotation: { x: -Math.PI / 2, y: 0, z: 0 },
    scale: { x: 0.5, y: 0.5, z: 0.5 },
    opacity: 0.8,
  })
}

// ============================================================================
// Example 2: Updating an Existing Decal
// ============================================================================

export function example2_updateDecal() {
  const updateDecal = useGameStore.getState().updateDecal
  const decals = useGameStore.getState().decals
  
  if (decals.length > 0) {
    const decalId = decals[0].id
    
    // Update scale
    updateDecal(decalId, {
      scale: { x: 0.8, y: 0.8, z: 0.8 }
    })
    
    // Update opacity
    updateDecal(decalId, {
      opacity: 0.5
    })
    
    // Update multiple properties
    updateDecal(decalId, {
      scale: { x: 1.0, y: 1.0, z: 1.0 },
      opacity: 1.0,
      rotation: { x: -Math.PI / 2, y: 0, z: Math.PI / 4 }
    })
  }
}

// ============================================================================
// Example 3: Working with Multiple Decals
// ============================================================================

export function example3_multipleDecals() {
  const addDecal = useGameStore.getState().addDecal
  const decals = useGameStore.getState().decals
  
  // Add multiple decals
  const decalImages = [
    { url: 'data:image/png;base64,...', name: 'logo-left.png' },
    { url: 'data:image/png;base64,...', name: 'logo-right.png' },
    { url: 'data:image/png;base64,...', name: 'hood-decal.png' },
  ]
  
  decalImages.forEach((img, index) => {
    addDecal({
      imageUrl: img.url,
      fileName: img.name,
      position: {
        x: index * 0.3,
        y: 0.5,
        z: 0.5
      }
    })
  })
  
  // Get all decals
  console.log('Total decals:', decals.length)
  
  // Find specific decal
  const logoDecal = decals.find(d => d.fileName.includes('logo'))
  console.log('Found logo decal:', logoDecal)
}

// ============================================================================
// Example 4: Deleting Decals
// ============================================================================

export function example4_deleteDecals() {
  const deleteDecal = useGameStore.getState().deleteDecal
  const clearDecals = useGameStore.getState().clearDecals
  const decals = useGameStore.getState().decals
  
  // Delete a specific decal
  if (decals.length > 0) {
    const firstDecalId = decals[0].id
    deleteDecal(firstDecalId)
  }
  
  // Delete all decals
  clearDecals()
  
  // Delete decals matching a condition
  const oldDecals = decals.filter(d => d.opacity < 0.5)
  oldDecals.forEach(decal => deleteDecal(decal.id))
}

// ============================================================================
// Example 5: Selection and Editing Workflow
// ============================================================================

export function example5_selectionWorkflow() {
  const setSelectedDecal = useGameStore.getState().setSelectedDecal
  const selectedDecalId = useGameStore.getState().selectedDecalId
  const decals = useGameStore.getState().decals
  
  // Select first decal
  if (decals.length > 0) {
    const firstDecalId = decals[0].id
    setSelectedDecal(firstDecalId)
    console.log('Selected decal:', firstDecalId)
  }
  
  // Check if any decal is selected
  if (selectedDecalId) {
    const selectedDecal = decals.find(d => d.id === selectedDecalId)
    console.log('Currently editing:', selectedDecal)
  }
  
  // Deselect
  setSelectedDecal(null)
}

// ============================================================================
// Example 6: Placement Mode
// ============================================================================

export function example6_placementMode() {
  const setPlacementMode = useGameStore.getState().setPlacementMode
  const placementMode = useGameStore.getState().placementMode
  
  // Enable placement mode
  setPlacementMode(true)
  console.log('Placement mode:', placementMode)
  
  // Disable placement mode
  setPlacementMode(false)
  
  // Toggle placement mode
  setPlacementMode(!placementMode)
}

// ============================================================================
// Example 7: File Upload Handling
// ============================================================================

export function example7_handleFileUpload(file) {
  // Validate file type
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
  if (!validTypes.includes(file.type)) {
    console.error('Invalid file type')
    return
  }
  
  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    console.error('File too large')
    return
  }
  
  // Read file as data URL
  const reader = new FileReader()
  reader.onload = (e) => {
    const imageUrl = e.target.result
    
    // Add decal
    useGameStore.getState().addDecal({
      imageUrl,
      fileName: file.name,
    })
    
    // Enable placement mode
    useGameStore.getState().setPlacementMode(true)
  }
  reader.readAsDataURL(file)
}

// ============================================================================
// Example 8: React Component Integration
// ============================================================================

export function Example8Component() {
  const decals = useGameStore((state) => state.decals)
  const selectedDecalId = useGameStore((state) => state.selectedDecalId)
  const addDecal = useGameStore((state) => state.addDecal)
  const updateDecal = useGameStore((state) => state.updateDecal)
  const deleteDecal = useGameStore((state) => state.deleteDecal)
  const setSelectedDecal = useGameStore((state) => state.setSelectedDecal)
  
  const handleAddDecal = (imageUrl) => {
    addDecal({ imageUrl, fileName: 'custom-decal.png' })
  }
  
  const handleUpdateOpacity = (decalId, newOpacity) => {
    updateDecal(decalId, { opacity: newOpacity })
  }
  
  const handleSelectDecal = (decalId) => {
    setSelectedDecal(decalId)
  }
  
  return (
    <div>
      <h2>Decals ({decals.length})</h2>
      {decals.map((decal) => (
        <div
          key={decal.id}
          onClick={() => handleSelectDecal(decal.id)}
          style={{
            border: selectedDecalId === decal.id ? '2px solid purple' : '1px solid gray'
          }}
        >
          <img src={decal.imageUrl} alt={decal.fileName} width="50" />
          <p>{decal.fileName}</p>
          <button onClick={() => deleteDecal(decal.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// Example 9: Vehicle Update Handler Integration
// ============================================================================

export function example9_vehicleUpdateCommands() {
  // These commands can be used with the vehicle update handler system
  
  const addDecalCommand = {
    command_type: 'add_decal',
    parameters: {
      image_url: 'data:image/png;base64,...',
      position: { x: 0, y: 0.5, z: 0.5 },
      rotation: { x: -Math.PI / 2, y: 0, z: 0 },
      scale: { x: 0.3, y: 0.3, z: 0.3 },
      opacity: 1
    },
    description: 'Add custom decal to vehicle hood'
  }
  
  const updateDecalCommand = {
    command_type: 'update_decal',
    parameters: {
      decal_id: 'decal_1234567890',
      scale: { x: 0.5, y: 0.5, z: 0.5 },
      opacity: 0.8
    },
    description: 'Resize and fade decal'
  }
  
  const deleteDecalCommand = {
    command_type: 'delete_decal',
    parameters: {
      decal_id: 'decal_1234567890'
    },
    description: 'Remove decal from vehicle'
  }
  
  const clearDecalsCommand = {
    command_type: 'clear_decals',
    parameters: {},
    description: 'Remove all decals'
  }
  
  return {
    addDecalCommand,
    updateDecalCommand,
    deleteDecalCommand,
    clearDecalsCommand
  }
}

// ============================================================================
// Example 10: Batch Operations
// ============================================================================

export function example10_batchOperations() {
  const updateDecal = useGameStore.getState().updateDecal
  const decals = useGameStore.getState().decals
  
  // Make all decals semi-transparent
  decals.forEach(decal => {
    updateDecal(decal.id, { opacity: 0.5 })
  })
  
  // Scale all decals by 1.5x
  decals.forEach(decal => {
    const currentScale = decal.scale.x
    updateDecal(decal.id, {
      scale: {
        x: currentScale * 1.5,
        y: currentScale * 1.5,
        z: currentScale * 1.5
      }
    })
  })
  
  // Rotate all decals
  decals.forEach(decal => {
    updateDecal(decal.id, {
      rotation: {
        ...decal.rotation,
        z: decal.rotation.z + Math.PI / 4
      }
    })
  })
}

// ============================================================================
// Example 11: Save/Load with Vehicle Configuration
// ============================================================================

export function example11_saveLoadConfiguration() {
  // Get current vehicle config including decals
  const currentVehicle = useGameStore.getState().currentVehicle
  const decals = useGameStore.getState().decals
  
  // Create complete configuration
  const configuration = {
    ...currentVehicle,
    decals: decals
  }
  
  // Save to localStorage
  localStorage.setItem('myVehicleWithDecals', JSON.stringify(configuration))
  console.log('Saved configuration with decals')
  
  // Load from localStorage
  const savedConfig = localStorage.getItem('myVehicleWithDecals')
  if (savedConfig) {
    const config = JSON.parse(savedConfig)
    
    // Restore vehicle
    useGameStore.getState().setVehicle(config)
    
    // Restore decals
    useGameStore.getState().clearDecals()
    config.decals?.forEach(decal => {
      useGameStore.getState().addDecal(decal)
    })
    
    console.log('Loaded configuration with decals')
  }
}

// ============================================================================
// Example 12: Utility Functions
// ============================================================================

export const decalUtils = {
  // Get decal by ID
  getDecalById: (decalId) => {
    const decals = useGameStore.getState().decals
    return decals.find(d => d.id === decalId)
  },
  
  // Get all decals
  getAllDecals: () => {
    return useGameStore.getState().decals
  },
  
  // Count decals
  countDecals: () => {
    return useGameStore.getState().decals.length
  },
  
  // Check if decal exists
  decalExists: (decalId) => {
    const decals = useGameStore.getState().decals
    return decals.some(d => d.id === decalId)
  },
  
  // Get selected decal
  getSelectedDecal: () => {
    const selectedId = useGameStore.getState().selectedDecalId
    const decals = useGameStore.getState().decals
    return decals.find(d => d.id === selectedId)
  },
  
  // Convert degrees to radians
  degreesToRadians: (degrees) => degrees * (Math.PI / 180),
  
  // Convert radians to degrees
  radiansToDegrees: (radians) => radians * (180 / Math.PI),
}

export default {
  example1_addDecal,
  example2_updateDecal,
  example3_multipleDecals,
  example4_deleteDecals,
  example5_selectionWorkflow,
  example6_placementMode,
  example7_handleFileUpload,
  Example8Component,
  example9_vehicleUpdateCommands,
  example10_batchOperations,
  example11_saveLoadConfiguration,
  decalUtils,
}

