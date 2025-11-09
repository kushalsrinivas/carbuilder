/**
 * ============================================================================
 * SCENE HANDLERS - Comprehensive Scene Interaction Library
 * ============================================================================
 * 
 * This module provides a complete set of handler functions for interacting
 * with the 3D vehicle builder scene. Designed for MCP server integration.
 * 
 * @module scene-handlers
 * @version 2.0.0
 * @author BIBev Builder
 */

import useGameStore from '../../store/gameStore'
import vehicleConfigs from '../../vehicleConfigs'

// ============================================================================
// CONSTANTS & ENUMS
// ============================================================================

export const VEHICLE_MODELS = Object.keys(vehicleConfigs.vehicles)
export const RIM_MODELS = Object.keys(vehicleConfigs.wheels.rims)
export const TIRE_MODELS = Object.keys(vehicleConfigs.wheels.tires)

export const COLOR_PRESETS = {
  RED: '#B91818',
  BLUE: '#1890B9',
  GREEN: '#18B95B',
  BLACK: '#121212',
  WHITE: '#FFFFFF',
  SILVER: '#C0C0C0',
  YELLOW: '#FFD700',
  ORANGE: '#FF8C00',
  PURPLE: '#8B00FF',
  BROWN: '#8B4513',
}

export const LIFT_RANGE = {
  MIN: 0,
  MAX: 6,
  DEFAULT: 0,
}

export const RIM_DIAMETER_RANGE = {
  MIN: 15,
  MAX: 20,
  DEFAULT: 17,
}

export const RIM_WIDTH_RANGE = {
  MIN: 7,
  MAX: 12,
  DEFAULT: 10,
}

export const TIRE_DIAMETER_RANGE = {
  MIN: 28,
  MAX: 40,
  DEFAULT: 32,
}

export const ROUGHNESS_RANGE = {
  MIN: 0,
  MAX: 1,
  DEFAULT: 0,
}

// ============================================================================
// QUERY HANDLERS - Read Scene State
// ============================================================================

/**
 * Get complete scene state
 * @returns {Object} Complete scene configuration
 */
export function getSceneState() {
  const state = useGameStore.getState()
  
  return {
    sceneLoaded: state.sceneLoaded,
    physicsEnabled: state.physicsEnabled,
    performanceDegraded: state.performanceDegraded,
    currentVehicle: state.currentVehicle,
    savedVehicles: state.savedVehicles,
    cameraAutoRotate: state.cameraAutoRotate,
    notification: state.notification,
  }
}

/**
 * Get current vehicle configuration
 * @returns {Object} Current vehicle state
 */
export function getCurrentVehicle() {
  return useGameStore.getState().currentVehicle
}

/**
 * Get vehicle body/model information
 * @returns {Object} Vehicle body configuration
 */
export function getVehicleBody() {
  const vehicle = getCurrentVehicle()
  const bodyId = vehicle.body
  const config = vehicleConfigs.vehicles[bodyId]
  
  return {
    id: bodyId,
    name: config?.name || 'Unknown',
    make: config?.make || 'Unknown',
    model: config?.model || '',
    wheelOffset: config?.wheel_offset || 0,
    wheelbase: config?.wheelbase || 0,
    defaultAddons: config?.default_addons || {},
    availableAddons: config?.addons || {},
  }
}

/**
 * Get vehicle appearance properties
 * @returns {Object} Color and material properties
 */
export function getVehicleAppearance() {
  const vehicle = getCurrentVehicle()
  
  return {
    color: vehicle.color,
    roughness: vehicle.roughness,
  }
}

/**
 * Get vehicle suspension configuration
 * @returns {Object} Lift and suspension settings
 */
export function getVehicleSuspension() {
  const vehicle = getCurrentVehicle()
  
  return {
    lift: vehicle.lift,
    liftInches: vehicle.lift,
    liftMeters: (vehicle.lift * 2.54) / 100,
  }
}

/**
 * Get wheel configuration
 * @returns {Object} Complete wheel setup
 */
export function getWheelConfiguration() {
  const vehicle = getCurrentVehicle()
  
  return {
    rim: {
      id: vehicle.rim,
      name: vehicleConfigs.wheels.rims[vehicle.rim]?.name || 'Unknown',
      make: vehicleConfigs.wheels.rims[vehicle.rim]?.make || 'Unknown',
      diameter: vehicle.rim_diameter,
      width: vehicle.rim_width,
      color: vehicle.rim_color,
      colorSecondary: vehicle.rim_color_secondary,
    },
    tire: {
      id: vehicle.tire,
      name: vehicleConfigs.wheels.tires[vehicle.tire]?.name || 'Unknown',
      make: vehicleConfigs.wheels.tires[vehicle.tire]?.make || 'Unknown',
      diameter: vehicle.tire_diameter,
    },
    offset: vehicle.wheel_offset,
  }
}

/**
 * Get vehicle addons configuration
 * @returns {Object} Current addons
 */
export function getVehicleAddons() {
  const vehicle = getCurrentVehicle()
  
  return vehicle.addons || {}
}

/**
 * Get spare tire configuration
 * @returns {Object} Spare tire state
 */
export function getSpareTire() {
  const vehicle = getCurrentVehicle()
  
  return {
    enabled: vehicle.spare || false,
  }
}

/**
 * Get available vehicle models
 * @returns {Array} List of available vehicle models
 */
export function getAvailableVehicles() {
  return Object.entries(vehicleConfigs.vehicles).map(([id, config]) => ({
    id,
    name: config.name,
    make: config.make,
    hasAddons: Object.keys(config.addons || {}).length > 0,
  }))
}

/**
 * Get available rims
 * @returns {Array} List of available rim models
 */
export function getAvailableRims() {
  return Object.entries(vehicleConfigs.wheels.rims).map(([id, config]) => ({
    id,
    name: config.name,
    make: config.make,
  }))
}

/**
 * Get available tires
 * @returns {Array} List of available tire models
 */
export function getAvailableTires() {
  return Object.entries(vehicleConfigs.wheels.tires).map(([id, config]) => ({
    id,
    name: config.name,
    make: config.make,
  }))
}

/**
 * Get all saved vehicles
 * @returns {Object} Saved vehicles with metadata
 */
export function getSavedVehicles() {
  const savedVehicles = useGameStore.getState().savedVehicles
  const result = {}
  
  for (const [id, data] of Object.entries(savedVehicles)) {
    if (id !== 'current' && data?.config) {
      result[id] = {
        id,
        name: data.name || 'Unnamed Vehicle',
        config: data.config,
        timestamp: data.timestamp || null,
      }
    }
  }
  
  return result
}

/**
 * Get current saved vehicle ID
 * @returns {string|null} Current vehicle ID or null
 */
export function getCurrentSavedVehicleId() {
  return useGameStore.getState().savedVehicles.current || null
}

/**
 * Get camera state
 * @returns {Object} Camera configuration
 */
export function getCameraState() {
  const state = useGameStore.getState()
  
  return {
    target: {
      x: state.cameraTarget.x,
      y: state.cameraTarget.y,
      z: state.cameraTarget.z,
    },
    autoRotate: state.cameraAutoRotate,
  }
}

/**
 * Get physics state
 * @returns {Object} Physics configuration
 */
export function getPhysicsState() {
  const state = useGameStore.getState()
  
  return {
    enabled: state.physicsEnabled,
    sceneLoaded: state.sceneLoaded,
  }
}

// ============================================================================
// MUTATION HANDLERS - Modify Scene State
// ============================================================================

/**
 * Set vehicle body/model
 * @param {string} modelId - Vehicle model ID
 * @returns {Object} Result with success status
 */
export function setVehicleBody(modelId) {
  try {
    if (!vehicleConfigs.vehicles[modelId]) {
      return {
        success: false,
        error: `Invalid vehicle model: ${modelId}`,
        availableModels: VEHICLE_MODELS,
      }
    }
    
    useGameStore.getState().setVehicle({ body: modelId })
    
    return {
      success: true,
      data: getVehicleBody(),
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Set vehicle color
 * @param {string} color - Hex color code
 * @returns {Object} Result with success status
 */
export function setVehicleColor(color) {
  try {
    // Validate hex color
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      return {
        success: false,
        error: `Invalid color format: ${color}. Use hex format like #FF0000`,
      }
    }
    
    useGameStore.getState().setVehicle({ color })
    
    return {
      success: true,
      data: { color },
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Set vehicle paint roughness
 * @param {number} roughness - Roughness value (0-1)
 * @returns {Object} Result with success status
 */
export function setVehicleRoughness(roughness) {
  try {
    const value = parseFloat(roughness)
    
    if (isNaN(value) || value < ROUGHNESS_RANGE.MIN || value > ROUGHNESS_RANGE.MAX) {
      return {
        success: false,
        error: `Invalid roughness: ${roughness}. Must be between ${ROUGHNESS_RANGE.MIN} and ${ROUGHNESS_RANGE.MAX}`,
      }
    }
    
    useGameStore.getState().setVehicle({ roughness: value })
    
    return {
      success: true,
      data: { roughness: value },
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Set vehicle appearance (color and roughness)
 * @param {Object} params - Appearance parameters
 * @param {string} params.color - Hex color code
 * @param {number} params.roughness - Roughness value (0-1)
 * @returns {Object} Result with success status
 */
export function setVehicleAppearance({ color, roughness }) {
  const updates = {}
  const errors = []
  
  if (color !== undefined) {
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      errors.push(`Invalid color format: ${color}`)
    } else {
      updates.color = color
    }
  }
  
  if (roughness !== undefined) {
    const value = parseFloat(roughness)
    if (isNaN(value) || value < ROUGHNESS_RANGE.MIN || value > ROUGHNESS_RANGE.MAX) {
      errors.push(`Invalid roughness: ${roughness}`)
    } else {
      updates.roughness = value
    }
  }
  
  if (errors.length > 0) {
    return {
      success: false,
      error: errors.join(', '),
    }
  }
  
  if (Object.keys(updates).length === 0) {
    return {
      success: false,
      error: 'No valid appearance parameters provided',
    }
  }
  
  try {
    useGameStore.getState().setVehicle(updates)
    
    return {
      success: true,
      data: updates,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Set vehicle lift height
 * @param {number} liftInches - Lift height in inches
 * @returns {Object} Result with success status
 */
export function setVehicleLift(liftInches) {
  try {
    const value = parseFloat(liftInches)
    
    if (isNaN(value) || value < LIFT_RANGE.MIN || value > LIFT_RANGE.MAX) {
      return {
        success: false,
        error: `Invalid lift height: ${liftInches}. Must be between ${LIFT_RANGE.MIN} and ${LIFT_RANGE.MAX} inches`,
      }
    }
    
    useGameStore.getState().setVehicle({ lift: value })
    
    return {
      success: true,
      data: {
        liftInches: value,
        liftMeters: (value * 2.54) / 100,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Set rim model
 * @param {string} rimId - Rim model ID
 * @returns {Object} Result with success status
 */
export function setRim(rimId) {
  try {
    if (!vehicleConfigs.wheels.rims[rimId]) {
      return {
        success: false,
        error: `Invalid rim model: ${rimId}`,
        availableRims: RIM_MODELS,
      }
    }
    
    useGameStore.getState().setVehicle({ rim: rimId })
    
    return {
      success: true,
      data: {
        id: rimId,
        name: vehicleConfigs.wheels.rims[rimId].name,
        make: vehicleConfigs.wheels.rims[rimId].make,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Set rim color
 * @param {string} color - Hex color code
 * @returns {Object} Result with success status
 */
export function setRimColor(color) {
  try {
    if (!/^#[0-9A-F]{6}$/i.test(color) && color !== 'silver') {
      return {
        success: false,
        error: `Invalid color format: ${color}. Use hex format like #FF0000 or 'silver'`,
      }
    }
    
    useGameStore.getState().setVehicle({ rim_color: color })
    
    return {
      success: true,
      data: { color },
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Set rim secondary color
 * @param {string} color - Hex color code
 * @returns {Object} Result with success status
 */
export function setRimColorSecondary(color) {
  try {
    if (!/^#[0-9A-F]{6}$/i.test(color) && color !== 'silver') {
      return {
        success: false,
        error: `Invalid color format: ${color}. Use hex format like #FF0000 or 'silver'`,
      }
    }
    
    useGameStore.getState().setVehicle({ rim_color_secondary: color })
    
    return {
      success: true,
      data: { color },
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Set rim diameter
 * @param {number} diameter - Rim diameter in inches
 * @returns {Object} Result with success status
 */
export function setRimDiameter(diameter) {
  try {
    const value = parseInt(diameter)
    
    if (isNaN(value) || value < RIM_DIAMETER_RANGE.MIN || value > RIM_DIAMETER_RANGE.MAX) {
      return {
        success: false,
        error: `Invalid rim diameter: ${diameter}. Must be between ${RIM_DIAMETER_RANGE.MIN} and ${RIM_DIAMETER_RANGE.MAX} inches`,
      }
    }
    
    useGameStore.getState().setVehicle({ rim_diameter: value })
    
    return {
      success: true,
      data: { diameter: value },
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Set rim width
 * @param {number} width - Rim width in inches
 * @returns {Object} Result with success status
 */
export function setRimWidth(width) {
  try {
    const value = parseFloat(width)
    
    if (isNaN(value) || value < RIM_WIDTH_RANGE.MIN || value > RIM_WIDTH_RANGE.MAX) {
      return {
        success: false,
        error: `Invalid rim width: ${width}. Must be between ${RIM_WIDTH_RANGE.MIN} and ${RIM_WIDTH_RANGE.MAX} inches`,
      }
    }
    
    useGameStore.getState().setVehicle({ rim_width: value })
    
    return {
      success: true,
      data: { width: value },
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Set tire model
 * @param {string} tireId - Tire model ID
 * @returns {Object} Result with success status
 */
export function setTire(tireId) {
  try {
    if (!vehicleConfigs.wheels.tires[tireId]) {
      return {
        success: false,
        error: `Invalid tire model: ${tireId}`,
        availableTires: TIRE_MODELS,
      }
    }
    
    useGameStore.getState().setVehicle({ tire: tireId })
    
    return {
      success: true,
      data: {
        id: tireId,
        name: vehicleConfigs.wheels.tires[tireId].name,
        make: vehicleConfigs.wheels.tires[tireId].make,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Set tire diameter
 * @param {number} diameter - Tire diameter in inches
 * @returns {Object} Result with success status
 */
export function setTireDiameter(diameter) {
  try {
    const value = parseInt(diameter)
    
    if (isNaN(value) || value < TIRE_DIAMETER_RANGE.MIN || value > TIRE_DIAMETER_RANGE.MAX) {
      return {
        success: false,
        error: `Invalid tire diameter: ${diameter}. Must be between ${TIRE_DIAMETER_RANGE.MIN} and ${TIRE_DIAMETER_RANGE.MAX} inches`,
      }
    }
    
    useGameStore.getState().setVehicle({ tire_diameter: value })
    
    return {
      success: true,
      data: { diameter: value },
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Set complete wheel configuration
 * @param {Object} params - Wheel parameters
 * @returns {Object} Result with success status
 */
export function setWheelConfiguration(params) {
  const {
    rim,
    rim_diameter,
    rim_width,
    rim_color,
    rim_color_secondary,
    tire,
    tire_diameter,
    wheel_offset,
  } = params
  
  const updates = {}
  const errors = []
  
  // Validate and add rim
  if (rim !== undefined) {
    if (!vehicleConfigs.wheels.rims[rim]) {
      errors.push(`Invalid rim: ${rim}`)
    } else {
      updates.rim = rim
    }
  }
  
  // Validate and add rim diameter
  if (rim_diameter !== undefined) {
    const value = parseInt(rim_diameter)
    if (isNaN(value) || value < RIM_DIAMETER_RANGE.MIN || value > RIM_DIAMETER_RANGE.MAX) {
      errors.push(`Invalid rim diameter: ${rim_diameter}`)
    } else {
      updates.rim_diameter = value
    }
  }
  
  // Validate and add rim width
  if (rim_width !== undefined) {
    const value = parseFloat(rim_width)
    if (isNaN(value) || value < RIM_WIDTH_RANGE.MIN || value > RIM_WIDTH_RANGE.MAX) {
      errors.push(`Invalid rim width: ${rim_width}`)
    } else {
      updates.rim_width = value
    }
  }
  
  // Validate and add rim colors
  if (rim_color !== undefined) {
    if (!/^#[0-9A-F]{6}$/i.test(rim_color) && rim_color !== 'silver') {
      errors.push(`Invalid rim color: ${rim_color}`)
    } else {
      updates.rim_color = rim_color
    }
  }
  
  if (rim_color_secondary !== undefined) {
    if (!/^#[0-9A-F]{6}$/i.test(rim_color_secondary) && rim_color_secondary !== 'silver') {
      errors.push(`Invalid rim secondary color: ${rim_color_secondary}`)
    } else {
      updates.rim_color_secondary = rim_color_secondary
    }
  }
  
  // Validate and add tire
  if (tire !== undefined) {
    if (!vehicleConfigs.wheels.tires[tire]) {
      errors.push(`Invalid tire: ${tire}`)
    } else {
      updates.tire = tire
    }
  }
  
  // Validate and add tire diameter
  if (tire_diameter !== undefined) {
    const value = parseInt(tire_diameter)
    if (isNaN(value) || value < TIRE_DIAMETER_RANGE.MIN || value > TIRE_DIAMETER_RANGE.MAX) {
      errors.push(`Invalid tire diameter: ${tire_diameter}`)
    } else {
      updates.tire_diameter = value
    }
  }
  
  // Validate and add wheel offset
  if (wheel_offset !== undefined) {
    const value = parseFloat(wheel_offset)
    if (!isNaN(value)) {
      updates.wheel_offset = value
    }
  }
  
  if (errors.length > 0) {
    return {
      success: false,
      error: errors.join(', '),
    }
  }
  
  if (Object.keys(updates).length === 0) {
    return {
      success: false,
      error: 'No valid wheel parameters provided',
    }
  }
  
  try {
    useGameStore.getState().setVehicle(updates)
    
    return {
      success: true,
      data: updates,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Set vehicle addon
 * @param {string} addonType - Addon type (bumper_f, sliders, rack)
 * @param {string} addonValue - Addon value/option
 * @returns {Object} Result with success status
 */
export function setVehicleAddon(addonType, addonValue) {
  try {
    const currentVehicle = getCurrentVehicle()
    const bodyId = currentVehicle.body
    const vehicleConfig = vehicleConfigs.vehicles[bodyId]
    
    // Check if vehicle supports addons
    if (!vehicleConfig.addons || !vehicleConfig.addons[addonType]) {
      return {
        success: false,
        error: `Vehicle does not support addon type: ${addonType}`,
        availableAddons: Object.keys(vehicleConfig.addons || {}),
      }
    }
    
    // Check if addon value is valid
    const addonConfig = vehicleConfig.addons[addonType]
    if (!addonConfig.options[addonValue]) {
      return {
        success: false,
        error: `Invalid addon value: ${addonValue} for type: ${addonType}`,
        availableOptions: Object.keys(addonConfig.options),
      }
    }
    
    useGameStore.getState().setVehicle((vehicle) => {
      if (!vehicle.addons) {
        vehicle.addons = {}
      }
      vehicle.addons[addonType] = addonValue
    })
    
    return {
      success: true,
      data: {
        type: addonType,
        value: addonValue,
        name: addonConfig.options[addonValue].name,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Remove vehicle addon
 * @param {string} addonType - Addon type to remove
 * @returns {Object} Result with success status
 */
export function removeVehicleAddon(addonType) {
  try {
    useGameStore.getState().setVehicle((vehicle) => {
      if (vehicle.addons && vehicle.addons[addonType]) {
        delete vehicle.addons[addonType]
      }
    })
    
    return {
      success: true,
      data: { removed: addonType },
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Toggle spare tire
 * @param {boolean} enabled - Whether spare tire should be enabled
 * @returns {Object} Result with success status
 */
export function toggleSpareTire(enabled) {
  try {
    const value = Boolean(enabled)
    
    useGameStore.getState().setVehicle({ spare: value })
    
    return {
      success: true,
      data: { enabled: value },
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Reset vehicle to defaults (keeping current model)
 * @returns {Object} Result with success status
 */
export function resetVehicle() {
  try {
    const currentBody = getCurrentVehicle().body
    const defaults = {
      ...vehicleConfigs.defaults,
      body: currentBody,
      addons: vehicleConfigs.vehicles[currentBody]?.default_addons || {},
    }
    
    useGameStore.getState().setVehicle(defaults)
    
    return {
      success: true,
      data: defaults,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Reset vehicle to factory defaults (including model)
 * @returns {Object} Result with success status
 */
export function resetVehicleComplete() {
  try {
    const defaults = {
      ...vehicleConfigs.defaults,
      addons: vehicleConfigs.vehicles[vehicleConfigs.defaults.body]?.default_addons || {},
    }
    
    useGameStore.getState().setVehicle(defaults)
    
    return {
      success: true,
      data: defaults,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Set complete vehicle configuration
 * @param {Object} config - Complete vehicle configuration object
 * @returns {Object} Result with success status
 */
export function setVehicleConfiguration(config) {
  try {
    if (!config || typeof config !== 'object') {
      return {
        success: false,
        error: 'Invalid configuration object',
      }
    }
    
    // Validate body if provided
    if (config.body && !vehicleConfigs.vehicles[config.body]) {
      return {
        success: false,
        error: `Invalid vehicle model: ${config.body}`,
      }
    }
    
    useGameStore.getState().setVehicle(config)
    
    return {
      success: true,
      data: getCurrentVehicle(),
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

// ============================================================================
// SAVED VEHICLES HANDLERS
// ============================================================================

/**
 * Save current vehicle with a name
 * @param {string} name - Name for the saved vehicle
 * @returns {Object} Result with success status and vehicle ID
 */
export function saveVehicle(name) {
  try {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return {
        success: false,
        error: 'Vehicle name is required',
      }
    }
    
    const currentVehicle = getCurrentVehicle()
    const vehicleId = `vehicle_${Date.now()}`
    
    useGameStore.getState().setSavedVehicles((vehicles) => ({
      ...vehicles,
      [vehicleId]: {
        name: name.trim(),
        config: currentVehicle,
        timestamp: Date.now(),
      },
      current: vehicleId,
    }))
    
    return {
      success: true,
      data: {
        id: vehicleId,
        name: name.trim(),
        config: currentVehicle,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Load a saved vehicle
 * @param {string} vehicleId - ID of the saved vehicle
 * @returns {Object} Result with success status
 */
export function loadSavedVehicle(vehicleId) {
  try {
    const savedVehicles = useGameStore.getState().savedVehicles
    
    if (!savedVehicles[vehicleId]) {
      return {
        success: false,
        error: `Saved vehicle not found: ${vehicleId}`,
        availableVehicles: Object.keys(savedVehicles).filter(k => k !== 'current'),
      }
    }
    
    useGameStore.getState().setSavedVehicles((vehicles) => ({
      ...vehicles,
      current: vehicleId,
    }))
    
    return {
      success: true,
      data: savedVehicles[vehicleId],
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Delete a saved vehicle
 * @param {string} vehicleId - ID of the vehicle to delete
 * @returns {Object} Result with success status
 */
export function deleteSavedVehicle(vehicleId) {
  try {
    const savedVehicles = useGameStore.getState().savedVehicles
    
    if (!savedVehicles[vehicleId]) {
      return {
        success: false,
        error: `Saved vehicle not found: ${vehicleId}`,
      }
    }
    
    useGameStore.getState().deleteSavedVehicle(vehicleId)
    
    return {
      success: true,
      data: { deleted: vehicleId },
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Update saved vehicle name
 * @param {string} vehicleId - ID of the vehicle
 * @param {string} newName - New name for the vehicle
 * @returns {Object} Result with success status
 */
export function updateSavedVehicleName(vehicleId, newName) {
  try {
    const savedVehicles = useGameStore.getState().savedVehicles
    
    if (!savedVehicles[vehicleId]) {
      return {
        success: false,
        error: `Saved vehicle not found: ${vehicleId}`,
      }
    }
    
    if (!newName || typeof newName !== 'string' || newName.trim().length === 0) {
      return {
        success: false,
        error: 'Vehicle name is required',
      }
    }
    
    useGameStore.getState().setSavedVehicles((vehicles) => ({
      ...vehicles,
      [vehicleId]: {
        ...vehicles[vehicleId],
        name: newName.trim(),
      },
    }))
    
    return {
      success: true,
      data: {
        id: vehicleId,
        name: newName.trim(),
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

// ============================================================================
// CAMERA HANDLERS
// ============================================================================

/**
 * Set camera target position
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} z - Z coordinate
 * @returns {Object} Result with success status
 */
export function setCameraTarget(x, y, z) {
  try {
    const xVal = parseFloat(x)
    const yVal = parseFloat(y)
    const zVal = parseFloat(z)
    
    if (isNaN(xVal) || isNaN(yVal) || isNaN(zVal)) {
      return {
        success: false,
        error: 'Invalid coordinates',
      }
    }
    
    useGameStore.getState().setCameraTarget(xVal, yVal, zVal)
    
    return {
      success: true,
      data: { x: xVal, y: yVal, z: zVal },
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Toggle camera auto-rotate
 * @param {boolean} enabled - Whether auto-rotate should be enabled
 * @returns {Object} Result with success status
 */
export function setCameraAutoRotate(enabled) {
  try {
    const value = Boolean(enabled)
    
    useGameStore.getState().setCameraAutoRotate(value)
    
    return {
      success: true,
      data: { enabled: value },
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

// ============================================================================
// PHYSICS & SCENE HANDLERS
// ============================================================================

/**
 * Enable/disable physics simulation
 * @param {boolean} enabled - Whether physics should be enabled
 * @returns {Object} Result with success status
 */
export function setPhysicsEnabled(enabled) {
  try {
    const value = Boolean(enabled)
    
    useGameStore.getState().setPhysicsEnabled(value)
    
    return {
      success: true,
      data: { enabled: value },
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Get scene loading status
 * @returns {Object} Scene loading state
 */
export function getSceneLoadingStatus() {
  const state = useGameStore.getState()
  
  return {
    loaded: state.sceneLoaded,
    degraded: state.performanceDegraded,
  }
}

// ============================================================================
// NOTIFICATION HANDLERS
// ============================================================================

/**
 * Show a notification
 * @param {Object} params - Notification parameters
 * @param {string} params.message - Notification message
 * @param {string} params.type - Notification type (success, error, info, warning)
 * @param {number} params.duration - Duration in milliseconds
 * @returns {Object} Result with success status
 */
export function showNotification({ message, type = 'info', duration = 3000 }) {
  try {
    if (!message || typeof message !== 'string') {
      return {
        success: false,
        error: 'Message is required',
      }
    }
    
    useGameStore.getState().showNotification({
      message,
      type,
      duration,
    })
    
    return {
      success: true,
      data: { message, type, duration },
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Hide current notification
 * @returns {Object} Result with success status
 */
export function hideNotification() {
  try {
    useGameStore.getState().hideNotification()
    
    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

// ============================================================================
// UTILITY HANDLERS
// ============================================================================

/**
 * Generate shareable URL for current vehicle
 * @returns {Object} Result with URL
 */
export function generateShareableUrl() {
  try {
    const currentVehicle = getCurrentVehicle()
    const jsonString = JSON.stringify(currentVehicle)
    const encodedConfig = encodeURIComponent(jsonString)
    const baseUrl = window.location.origin + window.location.pathname
    const shareUrl = `${baseUrl}?config=${encodedConfig}`
    
    return {
      success: true,
      data: {
        url: shareUrl,
        config: currentVehicle,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Load vehicle from URL parameters
 * @returns {Object} Result with success status
 */
export function loadVehicleFromUrl() {
  try {
    const loaded = useGameStore.getState().loadVehicleFromUrl()
    
    if (!loaded) {
      return {
        success: false,
        error: 'No vehicle configuration found in URL',
      }
    }
    
    return {
      success: true,
      data: getCurrentVehicle(),
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Export current vehicle configuration as JSON
 * @returns {Object} Vehicle configuration object
 */
export function exportVehicleConfiguration() {
  return {
    success: true,
    data: getCurrentVehicle(),
  }
}

/**
 * Import vehicle configuration from JSON
 * @param {Object} config - Vehicle configuration object
 * @returns {Object} Result with success status
 */
export function importVehicleConfiguration(config) {
  return setVehicleConfiguration(config)
}

/**
 * Get configuration validation status
 * @param {Object} config - Configuration to validate
 * @returns {Object} Validation result
 */
export function validateConfiguration(config) {
  const errors = []
  const warnings = []
  
  if (!config || typeof config !== 'object') {
    errors.push('Configuration must be an object')
    return { valid: false, errors, warnings }
  }
  
  // Validate body
  if (config.body && !vehicleConfigs.vehicles[config.body]) {
    errors.push(`Invalid vehicle model: ${config.body}`)
  }
  
  // Validate color
  if (config.color && !/^#[0-9A-F]{6}$/i.test(config.color)) {
    errors.push(`Invalid color format: ${config.color}`)
  }
  
  // Validate roughness
  if (config.roughness !== undefined) {
    const value = parseFloat(config.roughness)
    if (isNaN(value) || value < 0 || value > 1) {
      errors.push(`Invalid roughness: ${config.roughness}`)
    }
  }
  
  // Validate lift
  if (config.lift !== undefined) {
    const value = parseFloat(config.lift)
    if (isNaN(value) || value < LIFT_RANGE.MIN || value > LIFT_RANGE.MAX) {
      errors.push(`Invalid lift: ${config.lift}`)
    }
  }
  
  // Validate rim
  if (config.rim && !vehicleConfigs.wheels.rims[config.rim]) {
    errors.push(`Invalid rim model: ${config.rim}`)
  }
  
  // Validate tire
  if (config.tire && !vehicleConfigs.wheels.tires[config.tire]) {
    errors.push(`Invalid tire model: ${config.tire}`)
  }
  
  // Validate rim diameter
  if (config.rim_diameter !== undefined) {
    const value = parseInt(config.rim_diameter)
    if (isNaN(value) || value < RIM_DIAMETER_RANGE.MIN || value > RIM_DIAMETER_RANGE.MAX) {
      errors.push(`Invalid rim diameter: ${config.rim_diameter}`)
    }
  }
  
  // Validate tire diameter
  if (config.tire_diameter !== undefined) {
    const value = parseInt(config.tire_diameter)
    if (isNaN(value) || value < TIRE_DIAMETER_RANGE.MIN || value > TIRE_DIAMETER_RANGE.MAX) {
      errors.push(`Invalid tire diameter: ${config.tire_diameter}`)
    }
  }
  
  // Check tire/rim compatibility
  if (config.tire_diameter !== undefined && config.rim_diameter !== undefined) {
    if (config.tire_diameter <= config.rim_diameter) {
      warnings.push('Tire diameter should be larger than rim diameter')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Apply multiple updates in a batch
 * @param {Array} updates - Array of update operations
 * @returns {Object} Batch operation results
 */
export function applyBatchUpdates(updates) {
  if (!Array.isArray(updates)) {
    return {
      success: false,
      error: 'Updates must be an array',
    }
  }
  
  const results = []
  let successCount = 0
  let failureCount = 0
  
  for (const update of updates) {
    try {
      const { operation, params } = update
      
      let result
      
      switch (operation) {
        case 'setVehicleBody':
          result = setVehicleBody(params)
          break
        case 'setVehicleColor':
          result = setVehicleColor(params)
          break
        case 'setVehicleLift':
          result = setVehicleLift(params)
          break
        case 'setRim':
          result = setRim(params)
          break
        case 'setTire':
          result = setTire(params)
          break
        case 'setVehicleAddon':
          result = setVehicleAddon(params.type, params.value)
          break
        case 'toggleSpareTire':
          result = toggleSpareTire(params)
          break
        default:
          result = {
            success: false,
            error: `Unknown operation: ${operation}`,
          }
      }
      
      results.push({ operation, result })
      
      if (result.success) {
        successCount++
      } else {
        failureCount++
      }
    } catch (error) {
      results.push({
        operation: update.operation,
        result: {
          success: false,
          error: error.message,
        },
      })
      failureCount++
    }
  }
  
  return {
    success: failureCount === 0,
    total: updates.length,
    successCount,
    failureCount,
    results,
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Query handlers
  getSceneState,
  getCurrentVehicle,
  getVehicleBody,
  getVehicleAppearance,
  getVehicleSuspension,
  getWheelConfiguration,
  getVehicleAddons,
  getSpareTire,
  getAvailableVehicles,
  getAvailableRims,
  getAvailableTires,
  getSavedVehicles,
  getCurrentSavedVehicleId,
  getCameraState,
  getPhysicsState,
  
  // Mutation handlers
  setVehicleBody,
  setVehicleColor,
  setVehicleRoughness,
  setVehicleAppearance,
  setVehicleLift,
  setRim,
  setRimColor,
  setRimColorSecondary,
  setRimDiameter,
  setRimWidth,
  setTire,
  setTireDiameter,
  setWheelConfiguration,
  setVehicleAddon,
  removeVehicleAddon,
  toggleSpareTire,
  resetVehicle,
  resetVehicleComplete,
  setVehicleConfiguration,
  
  // Saved vehicles
  saveVehicle,
  loadSavedVehicle,
  deleteSavedVehicle,
  updateSavedVehicleName,
  
  // Camera
  setCameraTarget,
  setCameraAutoRotate,
  
  // Physics & scene
  setPhysicsEnabled,
  getSceneLoadingStatus,
  
  // Notifications
  showNotification,
  hideNotification,
  
  // Utilities
  generateShareableUrl,
  loadVehicleFromUrl,
  exportVehicleConfiguration,
  importVehicleConfiguration,
  validateConfiguration,
  applyBatchUpdates,
  
  // Constants
  VEHICLE_MODELS,
  RIM_MODELS,
  TIRE_MODELS,
  COLOR_PRESETS,
  LIFT_RANGE,
  RIM_DIAMETER_RANGE,
  RIM_WIDTH_RANGE,
  TIRE_DIAMETER_RANGE,
  ROUGHNESS_RANGE,
}

