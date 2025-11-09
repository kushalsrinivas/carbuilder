/**
 * ============================================================================
 * SCENE HANDLERS - USAGE EXAMPLES
 * ============================================================================
 * 
 * Comprehensive examples demonstrating all capabilities of the Scene Handlers API.
 * These examples can be run directly in the browser console or used as
 * reference for MCP server implementation.
 * 
 * @module scene-handlers-examples
 * @version 2.0.0
 */

import sceneHandlers from './scene-handlers.js'

// ============================================================================
// EXAMPLE 1: Query Current State
// ============================================================================

export function example1_queryState() {
  console.log('=== EXAMPLE 1: Query Current State ===\n')
  
  // Get complete scene state
  const sceneState = sceneHandlers.getSceneState()
  console.log('Scene State:', sceneState)
  console.log(`Scene loaded: ${sceneState.sceneLoaded}`)
  console.log(`Physics enabled: ${sceneState.physicsEnabled}\n`)
  
  // Get current vehicle
  const vehicle = sceneHandlers.getCurrentVehicle()
  console.log('Current Vehicle:', vehicle)
  console.log(`Model: ${vehicle.body}`)
  console.log(`Color: ${vehicle.color}`)
  console.log(`Lift: ${vehicle.lift}"\n`)
  
  // Get vehicle body details
  const body = sceneHandlers.getVehicleBody()
  console.log('Vehicle Body Details:')
  console.log(`Name: ${body.name}`)
  console.log(`Make: ${body.make}`)
  console.log(`Wheelbase: ${body.wheelbase}m\n`)
}

// ============================================================================
// EXAMPLE 2: Build a Custom Vehicle
// ============================================================================

export function example2_buildCustomVehicle() {
  console.log('=== EXAMPLE 2: Build Custom Vehicle ===\n')
  
  // Step 1: Select vehicle model
  console.log('Step 1: Selecting Toyota 4Runner 3rd Gen...')
  const modelResult = sceneHandlers.setVehicleBody('toyota_4runner_3g')
  if (modelResult.success) {
    console.log(`✅ Changed to: ${modelResult.data.name}\n`)
  }
  
  // Step 2: Set appearance
  console.log('Step 2: Setting appearance (red with matte finish)...')
  const appearanceResult = sceneHandlers.setVehicleAppearance({
    color: '#B91818',
    roughness: 0.4
  })
  if (appearanceResult.success) {
    console.log('✅ Appearance updated\n')
  }
  
  // Step 3: Add lift
  console.log('Step 3: Adding 3 inch lift...')
  const liftResult = sceneHandlers.setVehicleLift(3)
  if (liftResult.success) {
    console.log(`✅ Lift set to ${liftResult.data.liftInches}"\n`)
  }
  
  // Step 4: Configure wheels
  console.log('Step 4: Configuring wheels...')
  const wheelsResult = sceneHandlers.setWheelConfiguration({
    rim: 'toyota_trd',
    rim_diameter: 17,
    rim_width: 9,
    rim_color: '#121212',
    tire: 'bfg_km3',
    tire_diameter: 33
  })
  if (wheelsResult.success) {
    console.log('✅ Wheels configured\n')
  }
  
  // Step 5: Add accessories
  console.log('Step 5: Adding accessories...')
  sceneHandlers.setVehicleAddon('bumper_f', 'shrockworks')
  sceneHandlers.setVehicleAddon('sliders', 'steel')
  sceneHandlers.setVehicleAddon('rack', 'whitson')
  console.log('✅ Accessories added\n')
  
  // Step 6: Show spare tire
  sceneHandlers.toggleSpareTire(true)
  console.log('✅ Spare tire mounted\n')
  
  console.log('🎉 Custom vehicle build complete!')
  
  // Display final configuration
  const finalVehicle = sceneHandlers.getCurrentVehicle()
  console.log('\nFinal Configuration:', finalVehicle)
}

// ============================================================================
// EXAMPLE 3: Compare Vehicle Models
// ============================================================================

export function example3_compareVehicles() {
  console.log('=== EXAMPLE 3: Compare Vehicle Models ===\n')
  
  const vehicles = sceneHandlers.getAvailableVehicles()
  
  console.log(`Found ${vehicles.length} available vehicles:\n`)
  
  vehicles.forEach((vehicle, index) => {
    console.log(`${index + 1}. ${vehicle.make} ${vehicle.name}`)
    console.log(`   ID: ${vehicle.id}`)
    console.log(`   Has addons: ${vehicle.hasAddons ? 'Yes' : 'No'}`)
    
    // Load vehicle and get details
    sceneHandlers.setVehicleBody(vehicle.id)
    const details = sceneHandlers.getVehicleBody()
    console.log(`   Wheelbase: ${details.wheelbase}m`)
    console.log(`   Available addons: ${Object.keys(details.availableAddons).join(', ') || 'None'}`)
    console.log()
  })
}

// ============================================================================
// EXAMPLE 4: Wheel and Tire Combinations
// ============================================================================

export function example4_wheelCombinations() {
  console.log('=== EXAMPLE 4: Wheel & Tire Combinations ===\n')
  
  const rims = sceneHandlers.getAvailableRims()
  const tires = sceneHandlers.getAvailableTires()
  
  console.log('Available Rims:')
  rims.forEach((rim, i) => {
    console.log(`  ${i + 1}. ${rim.make} ${rim.name} (${rim.id})`)
  })
  console.log()
  
  console.log('Available Tires:')
  tires.forEach((tire, i) => {
    console.log(`  ${i + 1}. ${tire.make} ${tire.name} (${tire.id})`)
  })
  console.log()
  
  // Try some popular combinations
  const combinations = [
    {
      name: 'Street Setup',
      rim: 'toyota_trd',
      rim_diameter: 17,
      tire: 'bfg_at',
      tire_diameter: 31
    },
    {
      name: 'Off-Road Setup',
      rim: 'xd_grenade',
      rim_diameter: 17,
      tire: 'bfg_km3',
      tire_diameter: 35
    },
    {
      name: 'Rock Crawler',
      rim: 'level_8_strike_6',
      rim_diameter: 17,
      tire: 'maxxis_trepador',
      tire_diameter: 37
    }
  ]
  
  console.log('Testing popular combinations:\n')
  
  combinations.forEach((combo, i) => {
    console.log(`${i + 1}. ${combo.name}`)
    const result = sceneHandlers.setWheelConfiguration(combo)
    if (result.success) {
      const wheels = sceneHandlers.getWheelConfiguration()
      console.log(`   ✅ ${wheels.rim.make} ${wheels.rim.name} ${wheels.rim.diameter}x${wheels.rim.width}"`)
      console.log(`   ✅ ${wheels.tire.make} ${wheels.tire.name} ${wheels.tire.diameter}"`)
    }
    console.log()
  })
}

// ============================================================================
// EXAMPLE 5: Save and Load Vehicles
// ============================================================================

export function example5_saveAndLoad() {
  console.log('=== EXAMPLE 5: Save and Load Vehicles ===\n')
  
  // Build vehicle 1: Street 4Runner
  console.log('Building Vehicle 1: Street 4Runner')
  sceneHandlers.setVehicleBody('toyota_4runner_5g')
  sceneHandlers.setVehicleColor('#1890B9')
  sceneHandlers.setVehicleLift(0)
  sceneHandlers.setWheelConfiguration({
    rim: 'toyota_4runner_5thgen',
    rim_diameter: 17,
    tire: 'bfg_at',
    tire_diameter: 31
  })
  
  const save1 = sceneHandlers.saveVehicle('Street 4Runner')
  console.log(`✅ Saved as: ${save1.data.name} (${save1.data.id})\n`)
  
  // Build vehicle 2: Off-Road Jeep
  console.log('Building Vehicle 2: Off-Road Jeep')
  sceneHandlers.setVehicleBody('jeep_jku')
  sceneHandlers.setVehicleColor('#FFD700')
  sceneHandlers.setVehicleLift(4)
  sceneHandlers.setWheelConfiguration({
    rim: 'xd_grenade',
    rim_diameter: 17,
    tire: 'bfg_km3',
    tire_diameter: 35
  })
  
  const save2 = sceneHandlers.saveVehicle('Off-Road Jeep')
  console.log(`✅ Saved as: ${save2.data.name} (${save2.data.id})\n`)
  
  // List all saved vehicles
  const saved = sceneHandlers.getSavedVehicles()
  console.log('All Saved Vehicles:')
  Object.values(saved).forEach((vehicle, i) => {
    console.log(`  ${i + 1}. ${vehicle.name}`)
    console.log(`     ID: ${vehicle.id}`)
    console.log(`     Model: ${vehicle.config.body}`)
    console.log(`     Color: ${vehicle.config.color}`)
  })
  console.log()
  
  // Load first vehicle
  console.log(`Loading: ${save1.data.name}`)
  const load1 = sceneHandlers.loadSavedVehicle(save1.data.id)
  if (load1.success) {
    console.log('✅ Loaded successfully')
    const current = sceneHandlers.getCurrentVehicle()
    console.log(`   Current vehicle: ${current.body} in ${current.color}`)
  }
}

// ============================================================================
// EXAMPLE 6: Batch Operations
// ============================================================================

export function example6_batchOperations() {
  console.log('=== EXAMPLE 6: Batch Operations ===\n')
  
  // Define a complete build as batch operations
  const updates = [
    { operation: 'setVehicleBody', params: 'toyota_4runner_3g' },
    { operation: 'setVehicleColor', params: '#FF0000' },
    { operation: 'setVehicleRoughness', params: 0.3 },
    { operation: 'setVehicleLift', params: 3 },
    { operation: 'setRim', params: 'toyota_trd' },
    { operation: 'setRimDiameter', params: 17 },
    { operation: 'setRimColor', params: '#121212' },
    { operation: 'setTire', params: 'bfg_km3' },
    { operation: 'setTireDiameter', params: 33 },
    { operation: 'setVehicleAddon', params: { type: 'bumper_f', value: 'shrockworks' } },
    { operation: 'setVehicleAddon', params: { type: 'sliders', value: 'steel' } },
    { operation: 'toggleSpareTire', params: true },
  ]
  
  console.log(`Applying ${updates.length} updates in batch...`)
  
  const result = sceneHandlers.applyBatchUpdates(updates)
  
  console.log(`\n✅ Batch Complete: ${result.successCount}/${result.total} succeeded`)
  
  if (result.failureCount > 0) {
    console.log('\n❌ Failures:')
    result.results.forEach((r, i) => {
      if (!r.result.success) {
        console.log(`   ${i + 1}. ${r.operation}: ${r.result.error}`)
      }
    })
  }
  
  const finalVehicle = sceneHandlers.getCurrentVehicle()
  console.log('\nFinal Vehicle Configuration:', finalVehicle)
}

// ============================================================================
// EXAMPLE 7: Validation and Error Handling
// ============================================================================

export function example7_validation() {
  console.log('=== EXAMPLE 7: Validation & Error Handling ===\n')
  
  // Test 1: Invalid vehicle model
  console.log('Test 1: Invalid vehicle model')
  const invalidModel = sceneHandlers.setVehicleBody('invalid_model')
  if (!invalidModel.success) {
    console.log(`❌ Error: ${invalidModel.error}`)
    console.log(`Available models: ${invalidModel.availableModels.slice(0, 3).join(', ')}...\n`)
  }
  
  // Test 2: Invalid color format
  console.log('Test 2: Invalid color format')
  const invalidColor = sceneHandlers.setVehicleColor('red')
  if (!invalidColor.success) {
    console.log(`❌ Error: ${invalidColor.error}\n`)
  }
  
  // Test 3: Out of range lift
  console.log('Test 3: Out of range lift')
  const invalidLift = sceneHandlers.setVehicleLift(999)
  if (!invalidLift.success) {
    console.log(`❌ Error: ${invalidLift.error}\n`)
  }
  
  // Test 4: Validate configuration
  console.log('Test 4: Validate configuration object')
  const config = {
    body: 'invalid_model',
    color: 'not-a-hex',
    lift: 999,
    tire_diameter: 30,
    rim_diameter: 18
  }
  
  const validation = sceneHandlers.validateConfiguration(config)
  console.log(`Valid: ${validation.valid}`)
  
  if (!validation.valid) {
    console.log('Errors:')
    validation.errors.forEach(err => console.log(`  - ${err}`))
  }
  
  if (validation.warnings.length > 0) {
    console.log('Warnings:')
    validation.warnings.forEach(warn => console.log(`  - ${warn}`))
  }
}

// ============================================================================
// EXAMPLE 8: Export and Import
// ============================================================================

export function example8_exportImport() {
  console.log('=== EXAMPLE 8: Export and Import ===\n')
  
  // Build a vehicle
  console.log('Building vehicle...')
  sceneHandlers.setVehicleBody('toyota_4runner_5g')
  sceneHandlers.setVehicleColor('#FFD700')
  sceneHandlers.setVehicleLift(2)
  console.log('✅ Vehicle built\n')
  
  // Export configuration
  console.log('Exporting configuration...')
  const exportResult = sceneHandlers.exportVehicleConfiguration()
  const configJson = JSON.stringify(exportResult.data, null, 2)
  console.log('Exported JSON:')
  console.log(configJson)
  console.log()
  
  // Modify and reset
  console.log('Modifying vehicle...')
  sceneHandlers.setVehicleColor('#FF0000')
  sceneHandlers.setVehicleLift(4)
  console.log('✅ Vehicle modified\n')
  
  // Import original configuration
  console.log('Importing original configuration...')
  const importResult = sceneHandlers.importVehicleConfiguration(exportResult.data)
  if (importResult.success) {
    console.log('✅ Configuration restored')
    const restored = sceneHandlers.getCurrentVehicle()
    console.log(`   Color: ${restored.color}`)
    console.log(`   Lift: ${restored.lift}"`)
  }
}

// ============================================================================
// EXAMPLE 9: Generate Shareable URL
// ============================================================================

export function example9_shareableUrl() {
  console.log('=== EXAMPLE 9: Shareable URL ===\n')
  
  // Build a custom vehicle
  console.log('Building shareable vehicle...')
  sceneHandlers.setVehicleBody('jeep_jku')
  sceneHandlers.setVehicleColor('#FFD700')
  sceneHandlers.setVehicleLift(4)
  sceneHandlers.setWheelConfiguration({
    rim: 'xd_grenade',
    rim_diameter: 17,
    tire: 'bfg_km3',
    tire_diameter: 35
  })
  console.log('✅ Vehicle built\n')
  
  // Generate shareable URL
  const urlResult = sceneHandlers.generateShareableUrl()
  if (urlResult.success) {
    console.log('Shareable URL generated:')
    console.log(urlResult.data.url)
    console.log()
    console.log('Copy this URL to share your build!')
    
    // In browser, you could:
    // navigator.clipboard.writeText(urlResult.data.url)
  }
}

// ============================================================================
// EXAMPLE 10: Camera and Scene Control
// ============================================================================

export function example10_cameraControl() {
  console.log('=== EXAMPLE 10: Camera and Scene Control ===\n')
  
  // Get current camera state
  const camera = sceneHandlers.getCameraState()
  console.log('Current Camera State:')
  console.log(`  Target: (${camera.target.x}, ${camera.target.y}, ${camera.target.z})`)
  console.log(`  Auto-rotate: ${camera.autoRotate}\n`)
  
  // Enable auto-rotate
  console.log('Enabling camera auto-rotate...')
  sceneHandlers.setCameraAutoRotate(true)
  console.log('✅ Auto-rotate enabled\n')
  
  // Check physics state
  const physics = sceneHandlers.getPhysicsState()
  console.log('Physics State:')
  console.log(`  Enabled: ${physics.enabled}`)
  console.log(`  Scene loaded: ${physics.sceneLoaded}\n`)
  
  // Enable physics
  console.log('Enabling physics...')
  sceneHandlers.setPhysicsEnabled(true)
  console.log('✅ Physics enabled')
  console.log('   (Vehicle can now be driven with WASD keys)')
}

// ============================================================================
// EXAMPLE 11: Build Presets
// ============================================================================

export function example11_buildPresets() {
  console.log('=== EXAMPLE 11: Build Presets ===\n')
  
  const presets = {
    daily_driver: {
      name: 'Daily Driver',
      config: {
        body: 'toyota_4runner_5g',
        color: '#121212',
        roughness: 0.1,
        lift: 0,
        rim: 'toyota_4runner_5thgen',
        rim_diameter: 17,
        tire: 'bfg_at',
        tire_diameter: 31,
        spare: true
      }
    },
    weekend_warrior: {
      name: 'Weekend Warrior',
      config: {
        body: 'toyota_4runner_5g',
        color: '#B91818',
        roughness: 0.3,
        lift: 2,
        rim: 'toyota_trd',
        rim_diameter: 17,
        tire: 'bfg_km3',
        tire_diameter: 33,
        spare: true
      }
    },
    rock_crawler: {
      name: 'Rock Crawler',
      config: {
        body: 'jeep_jku',
        color: '#FFD700',
        roughness: 0.6,
        lift: 4,
        rim: 'level_8_strike_6',
        rim_diameter: 17,
        tire: 'maxxis_trepador',
        tire_diameter: 37,
        spare: true
      }
    },
    overlander: {
      name: 'Overlander',
      config: {
        body: 'toyota_4runner_3g',
        color: '#18B95B',
        roughness: 0.4,
        lift: 3,
        rim: 'xd_machete',
        rim_diameter: 17,
        tire: 'bfg_km3',
        tire_diameter: 33,
        spare: true,
        addons: {
          bumper_f: 'shrockworks',
          sliders: 'steel',
          rack: 'whitson'
        }
      }
    }
  }
  
  console.log('Available Presets:')
  Object.keys(presets).forEach((key, i) => {
    console.log(`  ${i + 1}. ${presets[key].name}`)
  })
  console.log()
  
  // Apply each preset
  Object.entries(presets).forEach(([key, preset]) => {
    console.log(`Applying ${preset.name}...`)
    const result = sceneHandlers.setVehicleConfiguration(preset.config)
    if (result.success) {
      const vehicle = sceneHandlers.getCurrentVehicle()
      console.log(`✅ ${preset.name} applied`)
      console.log(`   Model: ${vehicle.body}`)
      console.log(`   Color: ${vehicle.color}`)
      console.log(`   Lift: ${vehicle.lift}"`)
      console.log()
    }
  })
}

// ============================================================================
// EXAMPLE 12: Interactive Builder
// ============================================================================

export function example12_interactiveBuilder() {
  console.log('=== EXAMPLE 12: Interactive Builder ===\n')
  
  console.log('Starting interactive build session...\n')
  
  // Step 1: Choose base vehicle
  const vehicles = sceneHandlers.getAvailableVehicles()
  console.log('Step 1: Choose your vehicle')
  vehicles.forEach((v, i) => {
    console.log(`  ${i + 1}. ${v.make} ${v.name}`)
  })
  
  // For demo, choose first one
  const selectedVehicle = vehicles[0]
  console.log(`\n✅ Selected: ${selectedVehicle.name}\n`)
  sceneHandlers.setVehicleBody(selectedVehicle.id)
  
  // Step 2: Choose color
  console.log('Step 2: Choose color')
  const colors = Object.entries(sceneHandlers.COLOR_PRESETS)
  colors.forEach(([name, hex], i) => {
    console.log(`  ${i + 1}. ${name} (${hex})`)
  })
  
  // For demo, choose red
  console.log('\n✅ Selected: RED\n')
  sceneHandlers.setVehicleColor(sceneHandlers.COLOR_PRESETS.RED)
  
  // Step 3: Choose lift
  console.log('Step 3: Choose lift height')
  console.log(`  Range: ${sceneHandlers.LIFT_RANGE.MIN}-${sceneHandlers.LIFT_RANGE.MAX} inches`)
  
  // For demo, choose 3
  const liftHeight = 3
  console.log(`\n✅ Selected: ${liftHeight}"\n`)
  sceneHandlers.setVehicleLift(liftHeight)
  
  // Step 4: Choose wheels
  console.log('Step 4: Choose wheels')
  const rims = sceneHandlers.getAvailableRims()
  console.log('Rims:')
  rims.slice(0, 5).forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.make} ${r.name}`)
  })
  
  const tires = sceneHandlers.getAvailableTires()
  console.log('\nTires:')
  tires.slice(0, 5).forEach((t, i) => {
    console.log(`  ${i + 1}. ${t.make} ${t.name}`)
  })
  
  // For demo, choose first of each
  console.log(`\n✅ Selected: ${rims[0].name} with ${tires[0].name}\n`)
  sceneHandlers.setWheelConfiguration({
    rim: rims[0].id,
    rim_diameter: 17,
    tire: tires[0].id,
    tire_diameter: 33
  })
  
  // Final summary
  console.log('🎉 Build Complete!\n')
  const finalVehicle = sceneHandlers.getCurrentVehicle()
  const body = sceneHandlers.getVehicleBody()
  const wheels = sceneHandlers.getWheelConfiguration()
  
  console.log('Your Custom Build:')
  console.log(`  Vehicle: ${body.name}`)
  console.log(`  Color: ${finalVehicle.color}`)
  console.log(`  Lift: ${finalVehicle.lift}"`)
  console.log(`  Rims: ${wheels.rim.make} ${wheels.rim.name}`)
  console.log(`  Tires: ${wheels.tire.make} ${wheels.tire.name}`)
  console.log()
  
  // Offer to save
  console.log('Save this build? (Call sceneHandlers.saveVehicle("My Build"))')
}

// ============================================================================
// RUN ALL EXAMPLES
// ============================================================================

export function runAllExamples() {
  console.log('\n')
  console.log('╔═══════════════════════════════════════════════════════════╗')
  console.log('║  SCENE HANDLERS - COMPREHENSIVE EXAMPLES                  ║')
  console.log('╚═══════════════════════════════════════════════════════════╝')
  console.log('\n')
  
  const examples = [
    example1_queryState,
    example2_buildCustomVehicle,
    example3_compareVehicles,
    example4_wheelCombinations,
    example5_saveAndLoad,
    example6_batchOperations,
    example7_validation,
    example8_exportImport,
    example9_shareableUrl,
    example10_cameraControl,
    example11_buildPresets,
    example12_interactiveBuilder
  ]
  
  examples.forEach((example, i) => {
    if (i > 0) console.log('\n' + '='.repeat(60) + '\n')
    example()
  })
  
  console.log('\n')
  console.log('╔═══════════════════════════════════════════════════════════╗')
  console.log('║  ALL EXAMPLES COMPLETED                                   ║')
  console.log('╚═══════════════════════════════════════════════════════════╝')
  console.log('\n')
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  example1_queryState,
  example2_buildCustomVehicle,
  example3_compareVehicles,
  example4_wheelCombinations,
  example5_saveAndLoad,
  example6_batchOperations,
  example7_validation,
  example8_exportImport,
  example9_shareableUrl,
  example10_cameraControl,
  example11_buildPresets,
  example12_interactiveBuilder,
  runAllExamples
}

// ============================================================================
// BROWSER CONSOLE USAGE
// ============================================================================

// Make examples available globally in browser
if (typeof window !== 'undefined') {
  window.sceneHandlerExamples = {
    example1_queryState,
    example2_buildCustomVehicle,
    example3_compareVehicles,
    example4_wheelCombinations,
    example5_saveAndLoad,
    example6_batchOperations,
    example7_validation,
    example8_exportImport,
    example9_shareableUrl,
    example10_cameraControl,
    example11_buildPresets,
    example12_interactiveBuilder,
    runAllExamples
  }
  
  console.log('Scene Handler Examples loaded!')
  console.log('Run examples with:')
  console.log('  window.sceneHandlerExamples.runAllExamples()')
  console.log('Or individual examples like:')
  console.log('  window.sceneHandlerExamples.example2_buildCustomVehicle()')
}

