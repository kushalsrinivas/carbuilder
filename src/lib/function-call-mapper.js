/**
 * Function Call Mapper
 * Maps Gemini function calls to vehicle update commands
 */

/**
 * Map function name to command type
 * @param {string} functionName - Gemini function name
 * @returns {string|null} Command type or null if not recognized
 */
export function mapFunctionNameToCommandType(functionName) {
  const mapping = {
    // Vehicle model
    'change_vehicle_model': 'change_model',
    'set_vehicle_model': 'change_model',
    'switch_vehicle': 'change_model',
    
    // Color and appearance
    'change_vehicle_color': 'change_color',
    'set_vehicle_color': 'change_color',
    'change_paint': 'change_color',
    'set_color': 'change_color',
    
    // Lift/suspension
    'adjust_lift': 'adjust_lift',
    'set_lift': 'adjust_lift',
    'change_lift': 'adjust_lift',
    'adjust_suspension': 'adjust_lift',
    
    // Rims
    'change_rims': 'change_rims',
    'set_rims': 'change_rims',
    'change_wheels': 'change_rims',
    
    // Tires
    'change_tires': 'change_tires',
    'set_tires': 'change_tires',
    
    // Wheel setup (combined)
    'change_wheel_setup': 'change_wheel_setup',
    'adjust_wheel_setup': 'change_wheel_setup',
    
    // Addons
    'add_bumper': 'add_bumper',
    'change_bumper': 'add_bumper',
    'set_bumper': 'add_bumper',
    
    'add_sliders': 'add_sliders',
    'change_sliders': 'add_sliders',
    'set_sliders': 'add_sliders',
    
    'add_roof_rack': 'add_roof_rack',
    'add_rack': 'add_roof_rack',
    'change_rack': 'add_roof_rack',
    'set_rack': 'add_roof_rack',
    
    // Spare tire
    'toggle_spare_tire': 'toggle_spare_tire',
    'set_spare_tire': 'toggle_spare_tire',
    'show_spare_tire': 'toggle_spare_tire',
    'hide_spare_tire': 'toggle_spare_tire',
    
    // Reset
    'reset_vehicle': 'reset_vehicle',
    'reset_to_defaults': 'reset_vehicle',
  }
  
  return mapping[functionName] || null
}

/**
 * Generate human-readable description from function call
 * @param {string} functionName - Function name
 * @param {Object} args - Function arguments
 * @returns {string} Description
 */
export function generateDescription(functionName, args) {
  const commandType = mapFunctionNameToCommandType(functionName)
  
  switch (commandType) {
    case 'change_model':
      return `Changed vehicle to ${args.model_id || 'new model'}`
    
    case 'change_color':
      if (args.color && args.roughness !== undefined) {
        return `Changed color to ${args.color} with roughness ${args.roughness}`
      } else if (args.color) {
        return `Changed color to ${args.color}`
      } else if (args.roughness !== undefined) {
        return `Changed paint roughness to ${args.roughness}`
      }
      return 'Changed vehicle appearance'
    
    case 'adjust_lift':
      return `Adjusted lift to ${args.lift_height || args.lift || 0} inches`
    
    case 'change_rims':
      return `Changed rims to ${args.rim_id || 'new rims'}`
    
    case 'change_tires':
      return `Changed tires to ${args.tire_id || 'new tires'}`
    
    case 'change_wheel_setup':
      return 'Updated wheel configuration'
    
    case 'add_bumper':
      return `Set bumper to ${args.bumper_type || args.type || 'custom'}`
    
    case 'add_sliders':
      return `Set sliders to ${args.slider_type || args.type || 'custom'}`
    
    case 'add_roof_rack':
      return `Set roof rack to ${args.rack_type || args.type || 'custom'}`
    
    case 'toggle_spare_tire':
      return args.enabled ? 'Enabled spare tire' : 'Disabled spare tire'
    
    case 'reset_vehicle':
      return 'Reset vehicle to defaults'
    
    default:
      return `Executed ${functionName}`
  }
}

/**
 * Transform function arguments to command parameters
 * @param {string} commandType - Command type
 * @param {Object} args - Function arguments
 * @returns {Object} Transformed parameters
 */
export function transformParameters(commandType, args) {
  switch (commandType) {
    case 'change_model':
      return {
        model_id: args.model_id
      }
    
    case 'change_color':
      return {
        color: args.color,
        roughness: args.roughness
      }
    
    case 'adjust_lift':
      return {
        lift_height: args.lift_height || args.lift || 0
      }
    
    case 'change_rims':
      return {
        rim_id: args.rim_id,
        color: args.color || args.rim_color,
        secondary_color: args.secondary_color || args.rim_color_secondary
      }
    
    case 'change_tires':
      return {
        tire_id: args.tire_id,
        diameter: args.diameter || args.tire_diameter
      }
    
    case 'change_wheel_setup':
      return {
        rim_diameter: args.rim_diameter,
        rim_width: args.rim_width,
        tire_diameter: args.tire_diameter
      }
    
    case 'add_bumper':
      return {
        bumper_type: args.bumper_type || args.type
      }
    
    case 'add_sliders':
      return {
        slider_type: args.slider_type || args.type
      }
    
    case 'add_roof_rack':
      return {
        rack_type: args.rack_type || args.type
      }
    
    case 'toggle_spare_tire':
      return {
        enabled: args.enabled !== undefined ? args.enabled : true
      }
    
    case 'reset_vehicle':
      return {}
    
    default:
      return args
  }
}

/**
 * Parse a Gemini function call into a vehicle update command
 * @param {Object} functionCall - Gemini function call object
 * @param {string} functionCall.name - Function name
 * @param {Object} functionCall.args - Function arguments
 * @param {string} functionCall.id - Function call ID
 * @returns {Object|null} VehicleUpdateCommand or null if not recognized
 */
export function parseFunctionCall(functionCall) {
  if (!functionCall || !functionCall.name) {
    console.warn('Invalid function call object:', functionCall)
    return null
  }
  
  const { name, args, id } = functionCall
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 [Function Call Mapper] Parsing function call')
  console.log('   Name:', name)
  console.log('   Args:', args)
  console.log('   ID:', id)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  // Map function name to command type
  const commandType = mapFunctionNameToCommandType(name)
  
  if (!commandType) {
    console.warn(`[Function Call Mapper] Unknown function: ${name}`)
    return null
  }
  
  console.log('✅ [Function Call Mapper] Mapped to command type:', commandType)
  
  // Transform parameters
  const parameters = transformParameters(commandType, args || {})
  console.log('📦 [Function Call Mapper] Transformed parameters:', parameters)
  
  // Generate description
  const description = generateDescription(name, args || {})
  console.log('📝 [Function Call Mapper] Generated description:', description)
  
  // Create vehicle update command
  const command = {
    command_type: commandType,
    parameters,
    description,
    client_id: args?.client_id || 'default',
    function_call_id: id
  }
  
  console.log('✅ [Function Call Mapper] Created command:', command)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  return command
}

/**
 * Parse multiple function calls from a message
 * @param {Object} message - Message object from AI
 * @returns {Array} Array of VehicleUpdateCommand objects
 */
export function parseFunctionCallsFromMessage(message) {
  const commands = []
  
  if (!message || !message.content) {
    return commands
  }
  
  const { content } = message
  
  // Check for parts array
  if (Array.isArray(content.parts)) {
    for (const part of content.parts) {
      if (part.functionCall) {
        const command = parseFunctionCall(part.functionCall)
        if (command) {
          commands.push(command)
        }
      }
    }
  }
  
  // Check for direct functionCall
  if (content.functionCall) {
    const command = parseFunctionCall(content.functionCall)
    if (command) {
      commands.push(command)
    }
  }
  
  return commands
}

/**
 * Parse function calls from SSE event data
 * @param {Object} eventData - Parsed SSE event data
 * @returns {Array} Array of VehicleUpdateCommand objects
 */
export function parseFunctionCallsFromEvent(eventData) {
  const commands = []
  
  if (!eventData) {
    return commands
  }
  
  console.log('🔍 [Function Call Mapper] Parsing event data:', eventData)
  
  // Check for direct functionCall
  if (eventData.functionCall) {
    console.log('📞 [Function Call Mapper] Found direct functionCall')
    const command = parseFunctionCall(eventData.functionCall)
    if (command) {
      commands.push(command)
    }
  }
  
  // Check for content.parts array
  if (eventData.content && Array.isArray(eventData.content.parts)) {
    console.log('📞 [Function Call Mapper] Checking content.parts')
    for (const part of eventData.content.parts) {
      if (part.functionCall) {
        console.log('📞 [Function Call Mapper] Found functionCall in part')
        const command = parseFunctionCall(part.functionCall)
        if (command) {
          commands.push(command)
        }
      }
    }
  }
  
  // Check for top-level parts array
  if (Array.isArray(eventData.parts)) {
    console.log('📞 [Function Call Mapper] Checking top-level parts')
    for (const part of eventData.parts) {
      if (part.functionCall) {
        console.log('📞 [Function Call Mapper] Found functionCall in part')
        const command = parseFunctionCall(part.functionCall)
        if (command) {
          commands.push(command)
        }
      }
    }
  }
  
  if (commands.length > 0) {
    console.log(`✅ [Function Call Mapper] Parsed ${commands.length} command(s)`)
  }
  
  return commands
}

/**
 * Create a structured response from function calls
 * @param {Array} commands - Array of VehicleUpdateCommand objects
 * @param {Object} finalState - Optional final vehicle state
 * @returns {Object} Structured response for processAgentResponse
 */
export function createStructuredResponse(commands, finalState = null) {
  return {
    vehicle_updates: commands,
    final_vehicle_state: finalState,
    error: null
  }
}

