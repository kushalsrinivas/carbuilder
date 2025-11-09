/**
 * Test utilities for vehicle update handler
 * Use these in browser console to test the integration
 */

import { applyVehicleUpdate, syncVehicleState, processAgentResponse } from './vehicle-update-handler.js'

/**
 * Mock structured responses for testing
 */
export const mockResponses = {
  // Simple color change
  colorChange: {
    response_id: 'test-001',
    timestamp: new Date().toISOString(),
    client_id: 'test-user',
    human_readable_text: "I've changed your vehicle to red with a glossy finish",
    reasoning: null,
    tool_calls: [],
    vehicle_updates: [
      {
        command_type: 'change_color',
        parameters: {
          color: '#FF0000',
          roughness: 0.2,
        },
        description: 'Changed vehicle color to #FF0000 with glossy finish',
        client_id: 'test-user',
      },
    ],
    final_vehicle_state: null,
    error: null,
  },

  // Multiple updates
  multipleUpdates: {
    response_id: 'test-002',
    timestamp: new Date().toISOString(),
    client_id: 'test-user',
    human_readable_text: "I've made your vehicle red with a 3 inch lift and 35 inch tires",
    reasoning: null,
    tool_calls: [],
    vehicle_updates: [
      {
        command_type: 'change_color',
        parameters: { color: '#FF0000', roughness: 0.2 },
        description: 'Changed vehicle color to red',
        client_id: 'test-user',
      },
      {
        command_type: 'adjust_lift',
        parameters: { lift_height: 3.0 },
        description: 'Adjusted lift to 3.0 inches',
        client_id: 'test-user',
      },
      {
        command_type: 'change_tires',
        parameters: { tire_id: 'bfg_km3', diameter: 35 },
        description: 'Changed to BFGoodrich KM3 35" tires',
        client_id: 'test-user',
      },
    ],
    final_vehicle_state: null,
    error: null,
  },

  // Complete state sync
  completeState: {
    response_id: 'test-003',
    timestamp: new Date().toISOString(),
    client_id: 'test-user',
    human_readable_text: 'Vehicle configured',
    reasoning: null,
    tool_calls: [],
    vehicle_updates: [],
    final_vehicle_state: {
      body: 'toyota_4runner_5g',
      lift: 3.0,
      color: '#000000',
      roughness: 0.8,
      addons: {},
      wheel_offset: 0,
      rim: 'xd_grenade',
      rim_color: 'black',
      rim_color_secondary: 'black',
      rim_diameter: 17,
      rim_width: 10,
      tire: 'bfg_km3',
      tire_diameter: 35,
      spare: true,
    },
    error: null,
  },

  // Error response
  errorResponse: {
    response_id: 'test-004',
    timestamp: new Date().toISOString(),
    client_id: 'test-user',
    human_readable_text: 'Error occurred',
    reasoning: null,
    tool_calls: [],
    vehicle_updates: [],
    final_vehicle_state: null,
    error: 'Invalid vehicle model specified',
  },

  // Wheel setup change
  wheelSetup: {
    response_id: 'test-005',
    timestamp: new Date().toISOString(),
    client_id: 'test-user',
    human_readable_text: 'Changed wheel setup',
    reasoning: null,
    tool_calls: [],
    vehicle_updates: [
      {
        command_type: 'change_wheel_setup',
        parameters: {
          rim_diameter: 17,
          rim_width: 10,
          tire_diameter: 35,
        },
        description: 'Changed to 17x10 rims with 35" tires',
        client_id: 'test-user',
      },
    ],
    final_vehicle_state: null,
    error: null,
  },

  // Model change
  modelChange: {
    response_id: 'test-006',
    timestamp: new Date().toISOString(),
    client_id: 'test-user',
    human_readable_text: 'Changed to Jeep Wrangler',
    reasoning: null,
    tool_calls: [],
    vehicle_updates: [
      {
        command_type: 'change_model',
        parameters: { model_id: 'jeep_jku' },
        description: 'Changed vehicle to Jeep Wrangler JKU',
        client_id: 'test-user',
      },
    ],
    final_vehicle_state: null,
    error: null,
  },

  // Accessory changes (Toyota 4Runner 3G)
  accessories: {
    response_id: 'test-007',
    timestamp: new Date().toISOString(),
    client_id: 'test-user',
    human_readable_text: 'Added accessories',
    reasoning: null,
    tool_calls: [],
    vehicle_updates: [
      {
        command_type: 'change_model',
        parameters: { model_id: 'toyota_4runner_3g' },
        description: 'Changed to Toyota 4Runner 3G',
        client_id: 'test-user',
      },
      {
        command_type: 'add_bumper',
        parameters: { bumper_type: 'shrockworks' },
        description: 'Added Shrockworks bumper',
        client_id: 'test-user',
      },
      {
        command_type: 'add_sliders',
        parameters: { slider_type: 'steel' },
        description: 'Added steel sliders',
        client_id: 'test-user',
      },
      {
        command_type: 'add_roof_rack',
        parameters: { rack_type: 'whitson' },
        description: 'Added Whitson roof rack',
        client_id: 'test-user',
      },
    ],
    final_vehicle_state: null,
    error: null,
  },
}

/**
 * Test functions - call from browser console
 */
export const testFunctions = {
  // Test single color change
  async testColorChange() {
    console.log('🧪 Testing color change...')
    return await processAgentResponse(mockResponses.colorChange)
  },

  // Test multiple updates
  async testMultipleUpdates() {
    console.log('🧪 Testing multiple updates...')
    return await processAgentResponse(mockResponses.multipleUpdates)
  },

  // Test complete state sync
  async testCompleteState() {
    console.log('🧪 Testing complete state sync...')
    return await processAgentResponse(mockResponses.completeState)
  },

  // Test error handling
  async testError() {
    console.log('🧪 Testing error handling...')
    return await processAgentResponse(mockResponses.errorResponse)
  },

  // Test wheel setup
  async testWheelSetup() {
    console.log('🧪 Testing wheel setup...')
    return await processAgentResponse(mockResponses.wheelSetup)
  },

  // Test model change
  async testModelChange() {
    console.log('🧪 Testing model change...')
    return await processAgentResponse(mockResponses.modelChange)
  },

  // Test accessories
  async testAccessories() {
    console.log('🧪 Testing accessories...')
    return await processAgentResponse(mockResponses.accessories)
  },

  // Run all tests sequentially
  async runAllTests() {
    console.log('🧪 Running all tests...')
    const results = {}

    const tests = [
      ['colorChange', this.testColorChange],
      ['multipleUpdates', this.testMultipleUpdates],
      ['wheelSetup', this.testWheelSetup],
      ['modelChange', this.testModelChange],
      ['accessories', this.testAccessories],
      ['completeState', this.testCompleteState],
      ['error', this.testError],
    ]

    for (const [name, testFn] of tests) {
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Wait between tests
      try {
        const result = await testFn()
        results[name] = { success: result, error: null }
        console.log(`✅ ${name} passed`)
      } catch (error) {
        results[name] = { success: false, error: error.message }
        console.error(`❌ ${name} failed:`, error)
      }
    }

    console.log('🧪 Test results:', results)
    return results
  },
}

// Make available in browser console
if (typeof window !== 'undefined') {
  window.vehicleUpdateTests = testFunctions
  window.mockVehicleResponses = mockResponses

  console.log('🧪 Vehicle Update Tests loaded!')
  console.log('Available commands:')
  console.log('  window.vehicleUpdateTests.testColorChange()')
  console.log('  window.vehicleUpdateTests.testMultipleUpdates()')
  console.log('  window.vehicleUpdateTests.testWheelSetup()')
  console.log('  window.vehicleUpdateTests.testModelChange()')
  console.log('  window.vehicleUpdateTests.testAccessories()')
  console.log('  window.vehicleUpdateTests.testCompleteState()')
  console.log('  window.vehicleUpdateTests.testError()')
  console.log('  window.vehicleUpdateTests.runAllTests() - Run all tests')
}

export default testFunctions

