/**
 * ============================================================================
 * SCENE HANDLERS - TEST SUITE
 * ============================================================================
 * 
 * Comprehensive test suite for the Scene Handlers API.
 * Tests all query and mutation handlers with various scenarios.
 * 
 * Run with: bun test src/lib/scene-handlers.test.js
 * 
 * @module scene-handlers-test
 * @version 2.0.0
 */

// IMPORTANT: Import test setup FIRST to mock browser APIs
import './test-setup.js'

import { describe, test, expect, beforeEach, beforeAll } from 'bun:test'
import sceneHandlers from './scene-handlers.js'

// ============================================================================
// SETUP & HELPERS
// ============================================================================

/**
 * Clear localStorage before all tests
 */
beforeAll(() => {
  global.localStorage.clear()
})

/**
 * Reset to default state before each test
 */
beforeEach(() => {
  sceneHandlers.resetVehicleComplete()
})

/**
 * Helper to check if result is successful
 */
function expectSuccess(result) {
  expect(result.success).toBe(true)
  expect(result.data).toBeDefined()
  expect(result.error).toBeUndefined()
}

/**
 * Helper to check if result is failure
 */
function expectFailure(result, errorSubstring = null) {
  expect(result.success).toBe(false)
  expect(result.error).toBeDefined()
  if (errorSubstring) {
    expect(result.error.toLowerCase()).toContain(errorSubstring.toLowerCase())
  }
}

// ============================================================================
// QUERY HANDLERS TESTS
// ============================================================================

describe('Query Handlers', () => {
  describe('getSceneState', () => {
    test('returns complete scene state', () => {
      const state = sceneHandlers.getSceneState()
      
      expect(state).toBeDefined()
      expect(state).toHaveProperty('sceneLoaded')
      expect(state).toHaveProperty('physicsEnabled')
      expect(state).toHaveProperty('currentVehicle')
      expect(state).toHaveProperty('savedVehicles')
      expect(state).toHaveProperty('cameraAutoRotate')
    })
  })

  describe('getCurrentVehicle', () => {
    test('returns current vehicle configuration', () => {
      const vehicle = sceneHandlers.getCurrentVehicle()
      
      expect(vehicle).toBeDefined()
      expect(vehicle).toHaveProperty('body')
      expect(vehicle).toHaveProperty('color')
      expect(vehicle).toHaveProperty('lift')
      expect(vehicle).toHaveProperty('rim')
      expect(vehicle).toHaveProperty('tire')
    })

    test('returns default vehicle on fresh start', () => {
      const vehicle = sceneHandlers.getCurrentVehicle()
      
      expect(vehicle.body).toBe('toyota_4runner_5g')
      expect(vehicle.color).toBe('#B91818')
      expect(vehicle.lift).toBe(0)
    })
  })

  describe('getVehicleBody', () => {
    test('returns detailed body information', () => {
      const body = sceneHandlers.getVehicleBody()
      
      expect(body).toHaveProperty('id')
      expect(body).toHaveProperty('name')
      expect(body).toHaveProperty('make')
      expect(body).toHaveProperty('model')
      expect(body).toHaveProperty('wheelbase')
    })
  })

  describe('getWheelConfiguration', () => {
    test('returns complete wheel setup', () => {
      const wheels = sceneHandlers.getWheelConfiguration()
      
      expect(wheels).toHaveProperty('rim')
      expect(wheels).toHaveProperty('tire')
      expect(wheels.rim).toHaveProperty('id')
      expect(wheels.rim).toHaveProperty('diameter')
      expect(wheels.tire).toHaveProperty('id')
      expect(wheels.tire).toHaveProperty('diameter')
    })
  })

  describe('getAvailableVehicles', () => {
    test('returns array of available vehicles', () => {
      const vehicles = sceneHandlers.getAvailableVehicles()
      
      expect(Array.isArray(vehicles)).toBe(true)
      expect(vehicles.length).toBeGreaterThan(0)
      expect(vehicles[0]).toHaveProperty('id')
      expect(vehicles[0]).toHaveProperty('name')
      expect(vehicles[0]).toHaveProperty('make')
    })
  })

  describe('getAvailableRims', () => {
    test('returns array of available rims', () => {
      const rims = sceneHandlers.getAvailableRims()
      
      expect(Array.isArray(rims)).toBe(true)
      expect(rims.length).toBeGreaterThan(0)
      expect(rims[0]).toHaveProperty('id')
      expect(rims[0]).toHaveProperty('name')
    })
  })

  describe('getAvailableTires', () => {
    test('returns array of available tires', () => {
      const tires = sceneHandlers.getAvailableTires()
      
      expect(Array.isArray(tires)).toBe(true)
      expect(tires.length).toBeGreaterThan(0)
      expect(tires[0]).toHaveProperty('id')
      expect(tires[0]).toHaveProperty('name')
    })
  })
})

// ============================================================================
// MUTATION HANDLERS TESTS - Vehicle Body & Appearance
// ============================================================================

describe('Vehicle Body & Appearance Mutations', () => {
  describe('setVehicleBody', () => {
    test('successfully changes vehicle model', () => {
      const result = sceneHandlers.setVehicleBody('jeep_jku')
      expectSuccess(result)
      
      const vehicle = sceneHandlers.getCurrentVehicle()
      expect(vehicle.body).toBe('jeep_jku')
    })

    test('fails with invalid model ID', () => {
      const result = sceneHandlers.setVehicleBody('invalid_model')
      expectFailure(result, 'invalid')
      expect(result.availableModels).toBeDefined()
    })

    test('resets addons when changing model', () => {
      // Set a model with addons
      sceneHandlers.setVehicleBody('toyota_4runner_3g')
      
      // Change to different model
      sceneHandlers.setVehicleBody('jeep_jku')
      
      const vehicle = sceneHandlers.getCurrentVehicle()
      expect(vehicle.body).toBe('jeep_jku')
    })
  })

  describe('setVehicleColor', () => {
    test('successfully changes vehicle color', () => {
      const testColor = '#FF0000'
      const result = sceneHandlers.setVehicleColor(testColor)
      expectSuccess(result)
      
      const vehicle = sceneHandlers.getCurrentVehicle()
      expect(vehicle.color).toBe(testColor)
    })

    test('accepts uppercase hex colors', () => {
      const result = sceneHandlers.setVehicleColor('#ABCDEF')
      expectSuccess(result)
    })

    test('accepts lowercase hex colors', () => {
      const result = sceneHandlers.setVehicleColor('#abcdef')
      expectSuccess(result)
    })

    test('fails with invalid color format', () => {
      const invalidColors = ['red', 'FF0000', '#FFF', '#GGGGGG']
      
      invalidColors.forEach(color => {
        const result = sceneHandlers.setVehicleColor(color)
        expectFailure(result, 'invalid')
      })
    })
  })

  describe('setVehicleRoughness', () => {
    test('successfully changes roughness', () => {
      const result = sceneHandlers.setVehicleRoughness(0.5)
      expectSuccess(result)
      
      const vehicle = sceneHandlers.getCurrentVehicle()
      expect(vehicle.roughness).toBe(0.5)
    })

    test('accepts boundary values', () => {
      const result1 = sceneHandlers.setVehicleRoughness(0)
      expectSuccess(result1)
      
      const result2 = sceneHandlers.setVehicleRoughness(1)
      expectSuccess(result2)
    })

    test('fails with out-of-range values', () => {
      const result1 = sceneHandlers.setVehicleRoughness(-1)
      expectFailure(result1)
      
      const result2 = sceneHandlers.setVehicleRoughness(2)
      expectFailure(result2)
    })
  })

  describe('setVehicleAppearance', () => {
    test('successfully changes color and roughness', () => {
      const result = sceneHandlers.setVehicleAppearance({
        color: '#FF0000',
        roughness: 0.5
      })
      expectSuccess(result)
      
      const vehicle = sceneHandlers.getCurrentVehicle()
      expect(vehicle.color).toBe('#FF0000')
      expect(vehicle.roughness).toBe(0.5)
    })

    test('changes only color when roughness not provided', () => {
      const result = sceneHandlers.setVehicleAppearance({
        color: '#00FF00'
      })
      expectSuccess(result)
      
      const vehicle = sceneHandlers.getCurrentVehicle()
      expect(vehicle.color).toBe('#00FF00')
    })

    test('changes only roughness when color not provided', () => {
      const result = sceneHandlers.setVehicleAppearance({
        roughness: 0.7
      })
      expectSuccess(result)
      
      const vehicle = sceneHandlers.getCurrentVehicle()
      expect(vehicle.roughness).toBe(0.7)
    })
  })

  describe('setVehicleLift', () => {
    test('successfully changes lift height', () => {
      const result = sceneHandlers.setVehicleLift(3)
      expectSuccess(result)
      
      const vehicle = sceneHandlers.getCurrentVehicle()
      expect(vehicle.lift).toBe(3)
    })

    test('accepts boundary values', () => {
      const result1 = sceneHandlers.setVehicleLift(0)
      expectSuccess(result1)
      
      const result2 = sceneHandlers.setVehicleLift(6)
      expectSuccess(result2)
    })

    test('fails with out-of-range values', () => {
      const result1 = sceneHandlers.setVehicleLift(-1)
      expectFailure(result1)
      
      const result2 = sceneHandlers.setVehicleLift(999)
      expectFailure(result2)
    })
  })
})

// ============================================================================
// MUTATION HANDLERS TESTS - Wheels
// ============================================================================

describe('Wheel Mutations', () => {
  describe('setRim', () => {
    test('successfully changes rim model', () => {
      const result = sceneHandlers.setRim('xd_grenade')
      expectSuccess(result)
      
      const vehicle = sceneHandlers.getCurrentVehicle()
      expect(vehicle.rim).toBe('xd_grenade')
    })

    test('fails with invalid rim ID', () => {
      const result = sceneHandlers.setRim('invalid_rim')
      expectFailure(result)
      expect(result.availableRims).toBeDefined()
    })
  })

  describe('setRimColor', () => {
    test('successfully changes rim color', () => {
      const result = sceneHandlers.setRimColor('#121212')
      expectSuccess(result)
      
      const vehicle = sceneHandlers.getCurrentVehicle()
      expect(vehicle.rim_color).toBe('#121212')
    })

    test('accepts "silver" as color', () => {
      const result = sceneHandlers.setRimColor('silver')
      expectSuccess(result)
    })
  })

  describe('setRimDiameter', () => {
    test('successfully changes rim diameter', () => {
      const result = sceneHandlers.setRimDiameter(18)
      expectSuccess(result)
      
      const vehicle = sceneHandlers.getCurrentVehicle()
      expect(vehicle.rim_diameter).toBe(18)
    })

    test('fails with out-of-range diameter', () => {
      const result1 = sceneHandlers.setRimDiameter(10)
      expectFailure(result1)
      
      const result2 = sceneHandlers.setRimDiameter(25)
      expectFailure(result2)
    })
  })

  describe('setTire', () => {
    test('successfully changes tire model', () => {
      const result = sceneHandlers.setTire('bfg_km3')
      expectSuccess(result)
      
      const vehicle = sceneHandlers.getCurrentVehicle()
      expect(vehicle.tire).toBe('bfg_km3')
    })

    test('fails with invalid tire ID', () => {
      const result = sceneHandlers.setTire('invalid_tire')
      expectFailure(result)
      expect(result.availableTires).toBeDefined()
    })
  })

  describe('setTireDiameter', () => {
    test('successfully changes tire diameter', () => {
      const result = sceneHandlers.setTireDiameter(35)
      expectSuccess(result)
      
      const vehicle = sceneHandlers.getCurrentVehicle()
      expect(vehicle.tire_diameter).toBe(35)
    })

    test('fails with out-of-range diameter', () => {
      const result1 = sceneHandlers.setTireDiameter(20)
      expectFailure(result1)
      
      const result2 = sceneHandlers.setTireDiameter(50)
      expectFailure(result2)
    })
  })

  describe('setWheelConfiguration', () => {
    test('successfully changes complete wheel setup', () => {
      const config = {
        rim: 'xd_grenade',
        rim_diameter: 17,
        rim_width: 9,
        rim_color: '#121212',
        tire: 'bfg_km3',
        tire_diameter: 33
      }
      
      const result = sceneHandlers.setWheelConfiguration(config)
      expectSuccess(result)
      
      const vehicle = sceneHandlers.getCurrentVehicle()
      expect(vehicle.rim).toBe(config.rim)
      expect(vehicle.rim_diameter).toBe(config.rim_diameter)
      expect(vehicle.tire).toBe(config.tire)
    })

    test('validates all parameters', () => {
      const invalidConfig = {
        rim: 'invalid_rim',
        rim_diameter: 999,
        tire: 'invalid_tire'
      }
      
      const result = sceneHandlers.setWheelConfiguration(invalidConfig)
      expectFailure(result)
    })
  })
})

// ============================================================================
// MUTATION HANDLERS TESTS - Addons
// ============================================================================

describe('Addon Mutations', () => {
  beforeEach(() => {
    // Set to a vehicle with addons
    sceneHandlers.setVehicleBody('toyota_4runner_3g')
  })

  describe('setVehicleAddon', () => {
    test('successfully adds addon', () => {
      const result = sceneHandlers.setVehicleAddon('bumper_f', 'shrockworks')
      expectSuccess(result)
      
      const addons = sceneHandlers.getVehicleAddons()
      expect(addons.bumper_f).toBe('shrockworks')
    })

    test('fails with invalid addon type', () => {
      const result = sceneHandlers.setVehicleAddon('invalid_addon', 'value')
      expectFailure(result)
    })

    test('fails with invalid addon value', () => {
      const result = sceneHandlers.setVehicleAddon('bumper_f', 'invalid_value')
      expectFailure(result)
      expect(result.availableOptions).toBeDefined()
    })
  })

  describe('removeVehicleAddon', () => {
    test('successfully removes addon', () => {
      // Add addon first
      sceneHandlers.setVehicleAddon('bumper_f', 'shrockworks')
      
      // Remove it
      const result = sceneHandlers.removeVehicleAddon('bumper_f')
      expectSuccess(result)
      
      const addons = sceneHandlers.getVehicleAddons()
      expect(addons.bumper_f).toBeUndefined()
    })
  })

  describe('toggleSpareTire', () => {
    test('successfully enables spare tire', () => {
      const result = sceneHandlers.toggleSpareTire(true)
      expectSuccess(result)
      
      const vehicle = sceneHandlers.getCurrentVehicle()
      expect(vehicle.spare).toBe(true)
    })

    test('successfully disables spare tire', () => {
      const result = sceneHandlers.toggleSpareTire(false)
      expectSuccess(result)
      
      const vehicle = sceneHandlers.getCurrentVehicle()
      expect(vehicle.spare).toBe(false)
    })
  })
})

// ============================================================================
// CONFIGURATION TESTS
// ============================================================================

describe('Configuration Operations', () => {
  describe('resetVehicle', () => {
    test('resets to defaults while keeping model', () => {
      // Modify vehicle
      sceneHandlers.setVehicleColor('#FF0000')
      sceneHandlers.setVehicleLift(4)
      
      const beforeReset = sceneHandlers.getCurrentVehicle()
      const originalBody = beforeReset.body
      
      // Reset
      const result = sceneHandlers.resetVehicle()
      expectSuccess(result)
      
      const afterReset = sceneHandlers.getCurrentVehicle()
      expect(afterReset.body).toBe(originalBody)
      expect(afterReset.color).toBe('#B91818') // Default color
      expect(afterReset.lift).toBe(0) // Default lift
    })
  })

  describe('resetVehicleComplete', () => {
    test('resets to factory defaults including model', () => {
      // Change to different model
      sceneHandlers.setVehicleBody('jeep_jku')
      
      // Reset
      const result = sceneHandlers.resetVehicleComplete()
      expectSuccess(result)
      
      const vehicle = sceneHandlers.getCurrentVehicle()
      expect(vehicle.body).toBe('toyota_4runner_5g') // Default model
    })
  })

  describe('setVehicleConfiguration', () => {
    test('successfully applies complete configuration', () => {
      const config = {
        body: 'jeep_jku',
        color: '#FFD700',
        lift: 3,
        rim: 'xd_grenade',
        tire: 'bfg_km3'
      }
      
      const result = sceneHandlers.setVehicleConfiguration(config)
      expectSuccess(result)
      
      const vehicle = sceneHandlers.getCurrentVehicle()
      expect(vehicle.body).toBe(config.body)
      expect(vehicle.color).toBe(config.color)
      expect(vehicle.lift).toBe(config.lift)
    })

    test('fails with invalid configuration', () => {
      const invalidConfig = {
        body: 'invalid_model'
      }
      
      const result = sceneHandlers.setVehicleConfiguration(invalidConfig)
      expectFailure(result)
    })
  })
})

// ============================================================================
// SAVED VEHICLES TESTS
// ============================================================================

describe('Saved Vehicles', () => {
  describe('saveVehicle', () => {
    test('successfully saves vehicle', () => {
      const result = sceneHandlers.saveVehicle('Test Vehicle')
      expectSuccess(result)
      
      expect(result.data.id).toBeDefined()
      expect(result.data.name).toBe('Test Vehicle')
      expect(result.data.config).toBeDefined()
    })

    test('fails with empty name', () => {
      const result = sceneHandlers.saveVehicle('')
      expectFailure(result)
    })
  })

  describe('loadSavedVehicle', () => {
    test('successfully loads saved vehicle', () => {
      // Save first
      const saveResult = sceneHandlers.saveVehicle('Test Vehicle')
      const vehicleId = saveResult.data.id
      
      // Modify current vehicle
      sceneHandlers.setVehicleColor('#FF0000')
      
      // Load saved vehicle
      const loadResult = sceneHandlers.loadSavedVehicle(vehicleId)
      expectSuccess(loadResult)
    })

    test('fails with invalid vehicle ID', () => {
      const result = sceneHandlers.loadSavedVehicle('invalid_id')
      expectFailure(result)
    })
  })

  describe('getSavedVehicles', () => {
    test('returns all saved vehicles', () => {
      // Save some vehicles
      sceneHandlers.saveVehicle('Vehicle 1')
      sceneHandlers.saveVehicle('Vehicle 2')
      
      const saved = sceneHandlers.getSavedVehicles()
      expect(Object.keys(saved).length).toBeGreaterThanOrEqual(2)
    })
  })
})

// ============================================================================
// UTILITY TESTS
// ============================================================================

describe('Utilities', () => {
  describe('validateConfiguration', () => {
    test('validates correct configuration', () => {
      const config = {
        body: 'toyota_4runner_5g',
        color: '#FF0000',
        lift: 3
      }
      
      const validation = sceneHandlers.validateConfiguration(config)
      expect(validation.valid).toBe(true)
      expect(validation.errors.length).toBe(0)
    })

    test('detects invalid vehicle model', () => {
      const config = {
        body: 'invalid_model'
      }
      
      const validation = sceneHandlers.validateConfiguration(config)
      expect(validation.valid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
    })

    test('detects invalid color format', () => {
      const config = {
        color: 'not-a-color'
      }
      
      const validation = sceneHandlers.validateConfiguration(config)
      expect(validation.valid).toBe(false)
    })

    test('detects out-of-range values', () => {
      const config = {
        lift: 999,
        rim_diameter: 999,
        tire_diameter: 999
      }
      
      const validation = sceneHandlers.validateConfiguration(config)
      expect(validation.valid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
    })

    test('warns about tire/rim compatibility', () => {
      const config = {
        rim_diameter: 18,
        tire_diameter: 17 // Tire smaller than rim!
      }
      
      const validation = sceneHandlers.validateConfiguration(config)
      expect(validation.warnings.length).toBeGreaterThan(0)
    })
  })

  describe('exportVehicleConfiguration', () => {
    test('exports current configuration', () => {
      const result = sceneHandlers.exportVehicleConfiguration()
      expectSuccess(result)
      
      expect(result.data).toHaveProperty('body')
      expect(result.data).toHaveProperty('color')
      expect(result.data).toHaveProperty('lift')
    })
  })

  describe('importVehicleConfiguration', () => {
    test('imports valid configuration', () => {
      // Export first
      const exportResult = sceneHandlers.exportVehicleConfiguration()
      const config = exportResult.data
      
      // Modify
      sceneHandlers.setVehicleColor('#FF0000')
      
      // Import original
      const importResult = sceneHandlers.importVehicleConfiguration(config)
      expectSuccess(importResult)
    })
  })
})

// ============================================================================
// BATCH OPERATIONS TESTS
// ============================================================================

describe('Batch Operations', () => {
  describe('applyBatchUpdates', () => {
    test('successfully applies multiple updates', () => {
      const updates = [
        { operation: 'setVehicleBody', params: 'jeep_jku' },
        { operation: 'setVehicleColor', params: '#FF0000' },
        { operation: 'setVehicleLift', params: 3 }
      ]
      
      const result = sceneHandlers.applyBatchUpdates(updates)
      
      expect(result.success).toBe(true)
      expect(result.successCount).toBe(3)
      expect(result.failureCount).toBe(0)
    })

    test('reports partial success with some failures', () => {
      const updates = [
        { operation: 'setVehicleBody', params: 'jeep_jku' },
        { operation: 'setVehicleColor', params: 'invalid_color' },
        { operation: 'setVehicleLift', params: 3 }
      ]
      
      const result = sceneHandlers.applyBatchUpdates(updates)
      
      expect(result.success).toBe(false)
      expect(result.successCount).toBe(2)
      expect(result.failureCount).toBe(1)
    })

    test('fails with invalid updates array', () => {
      const result = sceneHandlers.applyBatchUpdates('not-an-array')
      expectFailure(result)
    })
  })
})

// ============================================================================
// CAMERA & SCENE TESTS
// ============================================================================

describe('Camera & Scene', () => {
  describe('setCameraAutoRotate', () => {
    test('enables auto-rotate', () => {
      const result = sceneHandlers.setCameraAutoRotate(true)
      expectSuccess(result)
      
      const camera = sceneHandlers.getCameraState()
      expect(camera.autoRotate).toBe(true)
    })

    test('disables auto-rotate', () => {
      const result = sceneHandlers.setCameraAutoRotate(false)
      expectSuccess(result)
      
      const camera = sceneHandlers.getCameraState()
      expect(camera.autoRotate).toBe(false)
    })
  })

  describe('setPhysicsEnabled', () => {
    test('enables physics', () => {
      const result = sceneHandlers.setPhysicsEnabled(true)
      expectSuccess(result)
      
      const physics = sceneHandlers.getPhysicsState()
      expect(physics.enabled).toBe(true)
    })
  })
})

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Integration Tests', () => {
  test('complete vehicle build workflow', () => {
    // 1. Select vehicle
    const modelResult = sceneHandlers.setVehicleBody('toyota_4runner_3g')
    expectSuccess(modelResult)
    
    // 2. Set appearance
    const appearanceResult = sceneHandlers.setVehicleAppearance({
      color: '#B91818',
      roughness: 0.3
    })
    expectSuccess(appearanceResult)
    
    // 3. Add lift
    const liftResult = sceneHandlers.setVehicleLift(3)
    expectSuccess(liftResult)
    
    // 4. Configure wheels
    const wheelsResult = sceneHandlers.setWheelConfiguration({
      rim: 'toyota_trd',
      rim_diameter: 17,
      tire: 'bfg_km3',
      tire_diameter: 33
    })
    expectSuccess(wheelsResult)
    
    // 5. Add accessories
    const bumperResult = sceneHandlers.setVehicleAddon('bumper_f', 'shrockworks')
    expectSuccess(bumperResult)
    
    // 6. Save vehicle
    const saveResult = sceneHandlers.saveVehicle('My Build')
    expectSuccess(saveResult)
    
    // 7. Verify final state
    const vehicle = sceneHandlers.getCurrentVehicle()
    expect(vehicle.body).toBe('toyota_4runner_3g')
    expect(vehicle.color).toBe('#B91818')
    expect(vehicle.lift).toBe(3)
    expect(vehicle.rim).toBe('toyota_trd')
    expect(vehicle.tire).toBe('bfg_km3')
  })

  test('export and import workflow', () => {
    // Build vehicle
    sceneHandlers.setVehicleBody('jeep_jku')
    sceneHandlers.setVehicleColor('#FFD700')
    sceneHandlers.setVehicleLift(4)
    
    // Export
    const exportResult = sceneHandlers.exportVehicleConfiguration()
    expectSuccess(exportResult)
    const config = exportResult.data
    
    // Reset
    sceneHandlers.resetVehicleComplete()
    
    // Import
    const importResult = sceneHandlers.importVehicleConfiguration(config)
    expectSuccess(importResult)
    
    // Verify
    const vehicle = sceneHandlers.getCurrentVehicle()
    expect(vehicle.body).toBe('jeep_jku')
    expect(vehicle.color).toBe('#FFD700')
    expect(vehicle.lift).toBe(4)
  })
})

// ============================================================================
// CONSTANTS TESTS
// ============================================================================

describe('Constants & Enums', () => {
  test('VEHICLE_MODELS contains valid models', () => {
    expect(Array.isArray(sceneHandlers.VEHICLE_MODELS)).toBe(true)
    expect(sceneHandlers.VEHICLE_MODELS.length).toBeGreaterThan(0)
  })

  test('RIM_MODELS contains valid rims', () => {
    expect(Array.isArray(sceneHandlers.RIM_MODELS)).toBe(true)
    expect(sceneHandlers.RIM_MODELS.length).toBeGreaterThan(0)
  })

  test('TIRE_MODELS contains valid tires', () => {
    expect(Array.isArray(sceneHandlers.TIRE_MODELS)).toBe(true)
    expect(sceneHandlers.TIRE_MODELS.length).toBeGreaterThan(0)
  })

  test('COLOR_PRESETS contains valid colors', () => {
    expect(typeof sceneHandlers.COLOR_PRESETS).toBe('object')
    expect(Object.keys(sceneHandlers.COLOR_PRESETS).length).toBeGreaterThan(0)
    
    // Check each color is valid hex
    Object.values(sceneHandlers.COLOR_PRESETS).forEach(color => {
      expect(color).toMatch(/^#[0-9A-F]{6}$/i)
    })
  })

  test('ranges have correct properties', () => {
    const ranges = [
      sceneHandlers.LIFT_RANGE,
      sceneHandlers.RIM_DIAMETER_RANGE,
      sceneHandlers.RIM_WIDTH_RANGE,
      sceneHandlers.TIRE_DIAMETER_RANGE,
      sceneHandlers.ROUGHNESS_RANGE
    ]
    
    ranges.forEach(range => {
      expect(range).toHaveProperty('MIN')
      expect(range).toHaveProperty('MAX')
      expect(range).toHaveProperty('DEFAULT')
      expect(range.MIN).toBeLessThanOrEqual(range.DEFAULT)
      expect(range.DEFAULT).toBeLessThanOrEqual(range.MAX)
    })
  })
})

