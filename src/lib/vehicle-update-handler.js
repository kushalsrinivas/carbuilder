/**
 * Vehicle Update Handler
 * Handles structured JSON output from the AI agent and applies changes to the vehicle state
 */

import useGameStore from '../../store/gameStore'
import vehicleConfigs from '../../vehicleConfigs'

/**
 * Apply a single vehicle update command to the game store
 * @param {Object} update - VehicleUpdateCommand object
 * @param {string} update.command_type - Type of command
 * @param {Object} update.parameters - Command parameters
 * @param {string} update.description - Human-readable description
 * @param {string} update.client_id - Client ID
 */
export function applyVehicleUpdate(update) {
  const { command_type, parameters, description } = update

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`🔧 [Vehicle Update] Applying: ${command_type}`)
  console.log(`📋 [Vehicle Update] Description: ${description}`)
  console.log(`📦 [Vehicle Update] Parameters:`, parameters)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    switch (command_type) {
      case 'change_model':
        handleChangeModel(parameters)
        break

      case 'change_color':
        handleChangeColor(parameters)
        break

      case 'adjust_lift':
        handleAdjustLift(parameters)
        break

      case 'change_rims':
        handleChangeRims(parameters)
        break

      case 'change_tires':
        handleChangeTires(parameters)
        break

      case 'change_wheel_setup':
        handleChangeWheelSetup(parameters)
        break

      case 'add_bumper':
        handleAddBumper(parameters)
        break

      case 'add_sliders':
        handleAddSliders(parameters)
        break

      case 'add_roof_rack':
        handleAddRoofRack(parameters)
        break

      case 'toggle_spare_tire':
        handleToggleSpareTire(parameters)
        break

      case 'reset_vehicle':
        handleResetVehicle()
        break

      default:
        console.warn(`[Vehicle Update] Unknown command type: ${command_type}`)
        return false
    }

    // Show notification for successful update
    if (description) {
      useGameStore.getState().showNotification({
        message: description,
        type: 'success',
        duration: 3000,
      })
    }

    return true
  } catch (error) {
    console.error(`[Vehicle Update] Error applying ${command_type}:`, error)
    useGameStore.getState().showNotification({
      message: `Failed to apply change: ${description}`,
      type: 'error',
      duration: 5000,
    })
    return false
  }
}

/**
 * Apply multiple vehicle updates sequentially
 * @param {Array} updates - Array of VehicleUpdateCommand objects
 * @returns {Promise<{success: number, failed: number}>}
 */
export async function applyVehicleUpdates(updates) {
  if (!Array.isArray(updates) || updates.length === 0) {
    return { success: 0, failed: 0 }
  }

  let successCount = 0
  let failedCount = 0

  for (const update of updates) {
    // Add small delay for visual feedback (optional)
    await new Promise((resolve) => setTimeout(resolve, 100))

    const success = applyVehicleUpdate(update)
    if (success) {
      successCount++
    } else {
      failedCount++
    }
  }

  return { success: successCount, failed: failedCount }
}

/**
 * Sync entire vehicle state from final_vehicle_state object
 * @param {Object} state - Complete vehicle configuration
 */
export function syncVehicleState(state) {
  if (!state || typeof state !== 'object') {
    console.warn('[Vehicle Update] Invalid state object')
    return false
  }

  console.log('[Vehicle Update] Syncing complete vehicle state:', state)

  try {
    useGameStore.getState().setVehicle(state)

    useGameStore.getState().showNotification({
      message: 'Vehicle configuration updated',
      type: 'success',
      duration: 2000,
    })

    return true
  } catch (error) {
    console.error('[Vehicle Update] Error syncing vehicle state:', error)
    return false
  }
}

/**
 * Process complete agent response
 * @param {Object} structuredResponse - The structured field from agent response
 * @returns {Promise<boolean>} Success status
 */
export async function processAgentResponse(structuredResponse) {
  console.log('╔════════════════════════════════════════════╗')
  console.log('║  🤖 PROCESSING AGENT RESPONSE              ║')
  console.log('╚════════════════════════════════════════════╝')
  
  if (!structuredResponse) {
    console.warn('⚠️ [Vehicle Update] No structured response provided')
    return false
  }

  console.log('📊 [Vehicle Update] Full structured response:', structuredResponse)

  const { vehicle_updates, final_vehicle_state, error } = structuredResponse

  console.log('🔍 [Vehicle Update] Extracted data:')
  console.log('   - vehicle_updates:', vehicle_updates)
  console.log('   - final_vehicle_state:', final_vehicle_state)
  console.log('   - error:', error)

  // Handle errors
  if (error) {
    console.error('❌ [Vehicle Update] Agent returned error:', error)
    useGameStore.getState().showNotification({
      message: error,
      type: 'error',
      duration: 5000,
    })
    return false
  }

  // Apply incremental updates if provided
  if (vehicle_updates && vehicle_updates.length > 0) {
    console.log(`✅ [Vehicle Update] Found ${vehicle_updates.length} updates to apply`)
    console.log('📋 [Vehicle Update] Updates:', JSON.stringify(vehicle_updates, null, 2))
    
    const result = await applyVehicleUpdates(vehicle_updates)
    console.log(`✅ [Vehicle Update] Result: ${result.success} succeeded, ${result.failed} failed`)

    // If there were failures and we have final state, use that as fallback
    if (result.failed > 0 && final_vehicle_state) {
      console.log('🔄 [Vehicle Update] Using final state due to failures')
      syncVehicleState(final_vehicle_state)
    }

    return result.failed === 0
  }

  // Fallback to syncing final state
  if (final_vehicle_state) {
    console.log('🔄 [Vehicle Update] No incremental updates, syncing final state')
    console.log('📊 [Vehicle Update] Final state:', final_vehicle_state)
    return syncVehicleState(final_vehicle_state)
  }

  console.warn('⚠️ [Vehicle Update] No updates or final state provided')
  console.log('📊 [Vehicle Update] Full response was:', structuredResponse)
  return false
}

// ============================================================================
// Command Handlers
// ============================================================================

function handleChangeModel(params) {
  console.log('🚗 [Handler] handleChangeModel called with:', params)
  const { model_id } = params

  // Validate model exists
  if (!vehicleConfigs.vehicles[model_id]) {
    console.error('❌ [Handler] Unknown vehicle model:', model_id)
    throw new Error(`Unknown vehicle model: ${model_id}`)
  }

  console.log('✅ [Handler] Changing model to:', model_id)
  useGameStore.getState().setVehicle({ body: model_id })
  console.log('✅ [Handler] Model changed successfully')
}

function handleChangeColor(params) {
  console.log('🎨 [Handler] handleChangeColor called with:', params)
  const { color, roughness } = params

  const updates = {}

  if (color !== undefined) {
    updates.color = color
    console.log('   Setting color:', color)
  }

  if (roughness !== undefined) {
    updates.roughness = roughness
    console.log('   Setting roughness:', roughness)
  }

  console.log('✅ [Handler] Applying color updates:', updates)
  useGameStore.getState().setVehicle(updates)
  
  // Log current state after update
  const currentState = useGameStore.getState().currentVehicle
  console.log('✅ [Handler] Current vehicle state after color change:', {
    color: currentState.color,
    roughness: currentState.roughness
  })
}

function handleAdjustLift(params) {
  console.log('📏 [Handler] handleAdjustLift called with:', params)
  const { lift_height } = params

  if (typeof lift_height !== 'number') {
    console.error('❌ [Handler] Invalid lift_height value:', lift_height)
    throw new Error('Invalid lift_height value')
  }

  console.log('✅ [Handler] Setting lift to:', lift_height)
  useGameStore.getState().setVehicle({ lift: lift_height })
  
  // Log current state after update
  const currentState = useGameStore.getState().currentVehicle
  console.log('✅ [Handler] Current lift after change:', currentState.lift)
}

function handleChangeRims(params) {
  const { rim_id, color, secondary_color } = params

  const updates = {}

  if (rim_id !== undefined) {
    // Validate rim exists
    if (!vehicleConfigs.wheels.rims[rim_id]) {
      console.warn(`Unknown rim: ${rim_id}, skipping`)
    } else {
      updates.rim = rim_id
    }
  }

  if (color !== undefined) {
    updates.rim_color = color
  }

  if (secondary_color !== undefined) {
    updates.rim_color_secondary = secondary_color
  }

  useGameStore.getState().setVehicle(updates)
}

function handleChangeTires(params) {
  const { tire_id, diameter } = params

  const updates = {}

  if (tire_id !== undefined) {
    // Validate tire exists
    if (!vehicleConfigs.wheels.tires[tire_id]) {
      console.warn(`Unknown tire: ${tire_id}, skipping`)
    } else {
      updates.tire = tire_id
    }
  }

  if (diameter !== undefined) {
    updates.tire_diameter = diameter
  }

  useGameStore.getState().setVehicle(updates)
}

function handleChangeWheelSetup(params) {
  const { rim_diameter, rim_width, tire_diameter } = params

  const updates = {}

  if (rim_diameter !== undefined) {
    updates.rim_diameter = rim_diameter
  }

  if (rim_width !== undefined) {
    updates.rim_width = rim_width
  }

  if (tire_diameter !== undefined) {
    updates.tire_diameter = tire_diameter
  }

  useGameStore.getState().setVehicle(updates)
}

function handleAddBumper(params) {
  const { bumper_type } = params

  useGameStore.getState().setVehicle((vehicle) => {
    if (!vehicle.addons) {
      vehicle.addons = {}
    }
    vehicle.addons.bumper_f = bumper_type
  })
}

function handleAddSliders(params) {
  const { slider_type } = params

  useGameStore.getState().setVehicle((vehicle) => {
    if (!vehicle.addons) {
      vehicle.addons = {}
    }
    vehicle.addons.sliders = slider_type
  })
}

function handleAddRoofRack(params) {
  const { rack_type } = params

  useGameStore.getState().setVehicle((vehicle) => {
    if (!vehicle.addons) {
      vehicle.addons = {}
    }
    vehicle.addons.rack = rack_type
  })
}

function handleToggleSpareTire(params) {
  const { enabled } = params

  useGameStore.getState().setVehicle({ spare: enabled })
}

function handleResetVehicle() {
  const currentBody = useGameStore.getState().currentVehicle.body
  const defaults = {
    ...vehicleConfigs.defaults,
    body: currentBody, // Keep current vehicle model
    addons: vehicleConfigs.vehicles[currentBody]?.default_addons || {},
  }

  useGameStore.getState().setVehicle(defaults)
}

// ============================================================================
// Verification Utilities
// ============================================================================

/**
 * Verify that current vehicle state matches expected state
 * @param {Object} expectedState - Expected vehicle configuration
 * @returns {boolean} True if states match
 */
export function verifyVehicleState(expectedState) {
  if (!expectedState) return true

  const currentState = useGameStore.getState().currentVehicle
  const mismatches = []

  // Check each field
  for (const [key, expectedValue] of Object.entries(expectedState)) {
    const currentValue = currentState[key]

    if (JSON.stringify(currentValue) !== JSON.stringify(expectedValue)) {
      mismatches.push({
        field: key,
        expected: expectedValue,
        actual: currentValue,
      })
    }
  }

  if (mismatches.length > 0) {
    console.warn('[Vehicle Update] State verification failed:', mismatches)
    return false
  }

  console.log('[Vehicle Update] State verification passed')
  return true
}

/**
 * Get list of changes between two states
 * @param {Object} oldState - Previous vehicle state
 * @param {Object} newState - New vehicle state
 * @returns {Array} List of changes
 */
export function getStateChanges(oldState, newState) {
  const changes = []

  if (!oldState || !newState) return changes

  for (const key of Object.keys(newState)) {
    if (JSON.stringify(oldState[key]) !== JSON.stringify(newState[key])) {
      changes.push({
        field: key,
        oldValue: oldState[key],
        newValue: newState[key],
      })
    }
  }

  return changes
}

