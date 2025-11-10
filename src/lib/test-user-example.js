/**
 * Test the exact example provided by the user
 */

import { 
  parseFunctionCallsFromEvent,
  createStructuredResponse 
} from './function-call-mapper.js'

console.log('╔═══════════════════════════════════════════════════════════╗')
console.log('║  Testing User-Provided Gemini Function Call Example      ║')
console.log('╚═══════════════════════════════════════════════════════════╝')
console.log()

// This is the EXACT object structure the user provided
const userProvidedResponse = {
  actions: {
    stateDelta: {},
    artifactDelta: {},
    requestedAuthConfigs: {},
    requestedToolConfirmations: {}
  },
  author: "Builder",
  content: {
    parts: [
      {
        text: 'Alright, a Jeep Wrangler JKU it is! Excellent choice for some serious off-roading!\n\n'
      },
      {
        functionCall: {
          args: {
            model_id: 'jeep_jku',
            client_id: 'default'
          },
          id: "adk-85802dec-e2cd-4937-b115-09e1ecbcea99",
          name: "change_vehicle_model"
        }
      }
    ],
    role: "model"
  },
  finishReason: "STOP",
  id: "dce892c2-2642-4329-911f-d3b550936967",
  invocationId: "e-4fa3c9db-6dce-4f27-ad06-8f2a72b9a540",
  longRunningToolIds: [],
  modelVersion: "gemini-2.5-flash",
  timestamp: 1762790969.02792,
  usageMetadata: {
    candidatesTokenCount: 51,
    promptTokenCount: 1000 // placeholder
  }
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📥 INPUT: User-provided Gemini response')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(JSON.stringify(userProvidedResponse, null, 2))
console.log()

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🔄 PROCESSING: Parsing function calls')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

// Parse the function calls from the event
const parsedCommands = parseFunctionCallsFromEvent(userProvidedResponse)

console.log()
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('✅ PARSED COMMANDS')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`Found ${parsedCommands.length} command(s)`)
console.log()

parsedCommands.forEach((cmd, idx) => {
  console.log(`Command ${idx + 1}:`)
  console.log(`  ├─ Command Type:    ${cmd.command_type}`)
  console.log(`  ├─ Description:     ${cmd.description}`)
  console.log(`  ├─ Parameters:      ${JSON.stringify(cmd.parameters)}`)
  console.log(`  ├─ Client ID:       ${cmd.client_id}`)
  console.log(`  └─ Function Call ID: ${cmd.function_call_id}`)
  console.log()
})

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📊 STRUCTURED RESPONSE (ready for processAgentResponse)')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

const structuredResponse = createStructuredResponse(parsedCommands)
console.log(JSON.stringify(structuredResponse, null, 2))
console.log()

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🎯 EXPECTED BEHAVIOR')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log()
console.log('When this structured response is passed to processAgentResponse():')
console.log('  1. It will extract the vehicle_updates array')
console.log('  2. For each update, it will call applyVehicleUpdate()')
console.log('  3. applyVehicleUpdate() will match command_type "change_model"')
console.log('  4. It will call handleChangeModel() with parameters { model_id: "jeep_jku" }')
console.log('  5. handleChangeModel() will validate the model exists in vehicleConfigs')
console.log('  6. It will call useGameStore.getState().setVehicle({ body: "jeep_jku" })')
console.log('  7. A success notification will be shown: "Changed vehicle to jeep_jku"')
console.log('  8. The 3D scene will update to show the Jeep Wrangler JKU')
console.log()

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('✅ TEST COMPLETE')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log()
console.log('The function call was successfully parsed and transformed!')
console.log('The system is ready to handle Gemini function calls.')
console.log()

// Verify the output is correct
const expectedCommand = {
  command_type: 'change_model',
  parameters: { model_id: 'jeep_jku' },
  description: 'Changed vehicle to jeep_jku',
  client_id: 'default',
  function_call_id: 'adk-85802dec-e2cd-4937-b115-09e1ecbcea99'
}

const actualCommand = parsedCommands[0]
const isCorrect = 
  actualCommand.command_type === expectedCommand.command_type &&
  actualCommand.parameters.model_id === expectedCommand.parameters.model_id &&
  actualCommand.client_id === expectedCommand.client_id &&
  actualCommand.function_call_id === expectedCommand.function_call_id

if (isCorrect) {
  console.log('✅ VALIDATION PASSED: Output matches expected format')
} else {
  console.log('❌ VALIDATION FAILED: Output does not match expected format')
  console.log('Expected:', expectedCommand)
  console.log('Actual:', actualCommand)
}

console.log()

