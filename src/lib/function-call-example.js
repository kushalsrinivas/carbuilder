/**
 * Example: Parsing Gemini Function Calls
 * This demonstrates how to parse the function call format you showed
 */

import { 
  parseFunctionCall, 
  parseFunctionCallsFromEvent,
  createStructuredResponse 
} from './function-call-mapper.js'

// Example 1: The exact function call you provided
const geminiResponse = {
  author: "Builder",
  content: {
    parts: [
      {
        text: 'Alright, a Jeep Wrangler JKU it is! Excellent choice for some serious off-roading!\n\n'
      },
      {
        functionCall: {
          name: "change_vehicle_model",
          args: {
            model_id: 'jeep_jku',
            client_id: 'default'
          },
          id: "adk-85802dec-e2cd-4937-b115-09e1ecbcea99"
        }
      }
    ],
    role: "model"
  },
  finishReason: "STOP",
  id: "dce892c2-2642-4329-911f-d3b550936967"
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('EXAMPLE 1: Parsing Your Gemini Response')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('Input:', JSON.stringify(geminiResponse, null, 2))

// Parse the function calls
const commands1 = parseFunctionCallsFromEvent(geminiResponse)
console.log('\n✅ Parsed Commands:', commands1)

// Create structured response
const structured1 = createStructuredResponse(commands1)
console.log('\n📊 Structured Response:', structured1)

// Example 2: Direct function call
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('EXAMPLE 2: Direct Function Call')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

const directFunctionCall = {
  name: "change_vehicle_color",
  args: {
    color: "#FF0000",
    roughness: 0.5
  },
  id: "call-123"
}

const command2 = parseFunctionCall(directFunctionCall)
console.log('✅ Parsed Command:', command2)

// Example 3: Multiple function calls
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('EXAMPLE 3: Multiple Function Calls')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

const multipleCallsEvent = {
  content: {
    parts: [
      {
        text: "I'll make your vehicle red and lift it 3 inches."
      },
      {
        functionCall: {
          name: "change_vehicle_color",
          args: { color: "#FF0000" },
          id: "call-1"
        }
      },
      {
        functionCall: {
          name: "adjust_lift",
          args: { lift_height: 3 },
          id: "call-2"
        }
      }
    ]
  }
}

const commands3 = parseFunctionCallsFromEvent(multipleCallsEvent)
console.log('✅ Parsed Commands:', commands3)

const structured3 = createStructuredResponse(commands3)
console.log('📊 Structured Response:', structured3)

// Example 4: All supported function types
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('EXAMPLE 4: All Supported Function Types')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

const allFunctionTypes = [
  { name: "change_vehicle_model", args: { model_id: "jeep_jku" }, id: "1" },
  { name: "change_vehicle_color", args: { color: "#FF0000", roughness: 0.3 }, id: "2" },
  { name: "adjust_lift", args: { lift_height: 4 }, id: "3" },
  { name: "change_rims", args: { rim_id: "xd_grenade" }, id: "4" },
  { name: "change_tires", args: { tire_id: "bfg_km3", diameter: 35 }, id: "5" },
  { name: "toggle_spare_tire", args: { enabled: true }, id: "6" },
  { name: "add_bumper", args: { bumper_type: "shrockworks" }, id: "7" },
]

allFunctionTypes.forEach((fc, idx) => {
  const cmd = parseFunctionCall(fc)
  console.log(`\n${idx + 1}. ${fc.name}:`)
  console.log('   Command Type:', cmd.command_type)
  console.log('   Description:', cmd.description)
  console.log('   Parameters:', cmd.parameters)
})

export {
  geminiResponse,
  directFunctionCall,
  multipleCallsEvent,
  allFunctionTypes
}

