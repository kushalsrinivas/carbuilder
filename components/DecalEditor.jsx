import { useState, useEffect } from 'react'
import useGameStore from '../store/gameStore'

const DecalEditor = () => {
  const selectedDecalId = useGameStore((state) => state.selectedDecalId)
  const decals = useGameStore((state) => state.decals)
  const updateDecal = useGameStore((state) => state.updateDecal)
  const setSelectedDecal = useGameStore((state) => state.setSelectedDecal)
  
  const selectedDecal = decals.find(d => d.id === selectedDecalId)
  
  const [localValues, setLocalValues] = useState({
    scale: 0.3,
    opacity: 1,
    rotationZ: 0,
  })

  // Update local values when selected decal changes
  useEffect(() => {
    if (selectedDecal) {
      setLocalValues({
        scale: selectedDecal.scale?.x || 0.3,
        opacity: selectedDecal.opacity || 1,
        rotationZ: (selectedDecal.rotation?.z || 0) * (180 / Math.PI), // Convert to degrees
      })
    }
  }, [selectedDecal])

  if (!selectedDecal) return null

  // Handle scale change
  const handleScaleChange = (value) => {
    const scale = parseFloat(value)
    setLocalValues(prev => ({ ...prev, scale }))
    updateDecal(selectedDecalId, {
      scale: { x: scale, y: scale, z: scale }
    })
  }

  // Handle opacity change
  const handleOpacityChange = (value) => {
    const opacity = parseFloat(value)
    setLocalValues(prev => ({ ...prev, opacity }))
    updateDecal(selectedDecalId, { opacity })
  }

  // Handle rotation change
  const handleRotationChange = (value) => {
    const degrees = parseFloat(value)
    setLocalValues(prev => ({ ...prev, rotationZ: degrees }))
    const radians = degrees * (Math.PI / 180)
    updateDecal(selectedDecalId, {
      rotation: { ...selectedDecal.rotation, z: radians }
    })
  }

  // Handle close
  const handleClose = () => {
    setSelectedDecal(null)
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-3 flex justify-between items-center">
        <h3 className="text-white font-bold flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Decal
        </h3>
        <button
          onClick={handleClose}
          className="text-white hover:bg-white/20 rounded p-1 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Preview */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="w-16 h-16 rounded overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
            <img
              src={selectedDecal.imageUrl}
              alt="Decal preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
              {selectedDecal.fileName || `Decal ${selectedDecal.id.slice(-4)}`}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ID: {selectedDecal.id.slice(-8)}
            </p>
          </div>
        </div>

        {/* Scale Control */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Size
            </label>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {localValues.scale.toFixed(2)}x
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.5"
            step="0.05"
            value={localValues.scale}
            onChange={(e) => handleScaleChange(e.target.value)}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Small</span>
            <span>Large</span>
          </div>
        </div>

        {/* Opacity Control */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Opacity
            </label>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {Math.round(localValues.opacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={localValues.opacity}
            onChange={(e) => handleOpacityChange(e.target.value)}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Transparent</span>
            <span>Solid</span>
          </div>
        </div>

        {/* Rotation Control */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Rotation
            </label>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {Math.round(localValues.rotationZ)}°
            </span>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            step="5"
            value={localValues.rotationZ}
            onChange={(e) => handleRotationChange(e.target.value)}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>-180°</span>
            <span>0°</span>
            <span>180°</span>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            💡 <strong>Tip:</strong> Click on the vehicle to reposition the decal
          </p>
        </div>
      </div>
    </div>
  )
}

export default DecalEditor

