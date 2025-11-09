/**
 * ============================================================================
 * SCENE TYPES & SCHEMAS
 * ============================================================================
 * 
 * Type definitions and validation schemas for the vehicle builder scene.
 * These schemas can be used for validation in the MCP server.
 * 
 * @module scene-types
 * @version 2.0.0
 */

// ============================================================================
// TYPE DEFINITIONS (JSDoc)
// ============================================================================

/**
 * @typedef {Object} VehicleConfiguration
 * @property {string} body - Vehicle model ID
 * @property {number} lift - Lift height in inches (0-6)
 * @property {string} color - Vehicle color (hex format)
 * @property {number} roughness - Paint roughness (0-1)
 * @property {Object} addons - Vehicle addons configuration
 * @property {number} wheel_offset - Wheel offset adjustment
 * @property {string} rim - Rim model ID
 * @property {string} rim_color - Rim color (hex or 'silver')
 * @property {string} rim_color_secondary - Rim secondary color (hex or 'silver')
 * @property {number} rim_diameter - Rim diameter in inches (15-20)
 * @property {number} rim_width - Rim width in inches (7-12)
 * @property {string} tire - Tire model ID
 * @property {number} tire_diameter - Tire diameter in inches (28-40)
 * @property {boolean} spare - Whether spare tire is enabled
 */

/**
 * @typedef {Object} VehicleBodyInfo
 * @property {string} id - Vehicle body ID
 * @property {string} name - Full vehicle name
 * @property {string} make - Vehicle manufacturer
 * @property {string} model - Path to 3D model file
 * @property {number} wheelOffset - Default wheel offset
 * @property {number} wheelbase - Vehicle wheelbase in meters
 * @property {Object} defaultAddons - Default addon configuration
 * @property {Object} availableAddons - Available addons for this vehicle
 */

/**
 * @typedef {Object} WheelConfiguration
 * @property {RimConfiguration} rim - Rim configuration
 * @property {TireConfiguration} tire - Tire configuration
 * @property {number} offset - Wheel offset
 */

/**
 * @typedef {Object} RimConfiguration
 * @property {string} id - Rim model ID
 * @property {string} name - Rim name
 * @property {string} make - Rim manufacturer
 * @property {number} diameter - Rim diameter in inches
 * @property {number} width - Rim width in inches
 * @property {string} color - Primary color
 * @property {string} colorSecondary - Secondary color
 */

/**
 * @typedef {Object} TireConfiguration
 * @property {string} id - Tire model ID
 * @property {string} name - Tire name
 * @property {string} make - Tire manufacturer
 * @property {number} diameter - Tire diameter in inches
 */

/**
 * @typedef {Object} CameraState
 * @property {Vector3} target - Camera target position
 * @property {boolean} autoRotate - Auto-rotate enabled
 */

/**
 * @typedef {Object} Vector3
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} z - Z coordinate
 */

/**
 * @typedef {Object} PhysicsState
 * @property {boolean} enabled - Physics enabled
 * @property {boolean} sceneLoaded - Scene loaded status
 */

/**
 * @typedef {Object} NotificationData
 * @property {string} message - Notification message
 * @property {string} type - Notification type (success, error, info, warning)
 * @property {number} duration - Display duration in milliseconds
 */

/**
 * @typedef {Object} SavedVehicleData
 * @property {string} id - Vehicle ID
 * @property {string} name - Vehicle name
 * @property {VehicleConfiguration} config - Vehicle configuration
 * @property {number} timestamp - Save timestamp
 */

/**
 * @typedef {Object} HandlerResult
 * @property {boolean} success - Operation success status
 * @property {*} [data] - Result data (if successful)
 * @property {string} [error] - Error message (if failed)
 */

// ============================================================================
// JSON SCHEMAS
// ============================================================================

export const schemas = {
  vehicleConfiguration: {
    type: 'object',
    properties: {
      body: {
        type: 'string',
        description: 'Vehicle model ID',
      },
      lift: {
        type: 'number',
        minimum: 0,
        maximum: 6,
        description: 'Lift height in inches',
      },
      color: {
        type: 'string',
        pattern: '^#[0-9A-F]{6}$',
        description: 'Vehicle color in hex format',
      },
      roughness: {
        type: 'number',
        minimum: 0,
        maximum: 1,
        description: 'Paint roughness value',
      },
      addons: {
        type: 'object',
        description: 'Vehicle addons configuration',
      },
      wheel_offset: {
        type: 'number',
        description: 'Wheel offset adjustment',
      },
      rim: {
        type: 'string',
        description: 'Rim model ID',
      },
      rim_color: {
        type: 'string',
        description: 'Rim primary color',
      },
      rim_color_secondary: {
        type: 'string',
        description: 'Rim secondary color',
      },
      rim_diameter: {
        type: 'integer',
        minimum: 15,
        maximum: 20,
        description: 'Rim diameter in inches',
      },
      rim_width: {
        type: 'number',
        minimum: 7,
        maximum: 12,
        description: 'Rim width in inches',
      },
      tire: {
        type: 'string',
        description: 'Tire model ID',
      },
      tire_diameter: {
        type: 'integer',
        minimum: 28,
        maximum: 40,
        description: 'Tire diameter in inches',
      },
      spare: {
        type: 'boolean',
        description: 'Spare tire enabled',
      },
    },
  },

  wheelConfiguration: {
    type: 'object',
    properties: {
      rim: { type: 'string' },
      rim_diameter: { type: 'integer', minimum: 15, maximum: 20 },
      rim_width: { type: 'number', minimum: 7, maximum: 12 },
      rim_color: { type: 'string' },
      rim_color_secondary: { type: 'string' },
      tire: { type: 'string' },
      tire_diameter: { type: 'integer', minimum: 28, maximum: 40 },
      wheel_offset: { type: 'number' },
    },
  },

  appearance: {
    type: 'object',
    properties: {
      color: {
        type: 'string',
        pattern: '^#[0-9A-F]{6}$',
      },
      roughness: {
        type: 'number',
        minimum: 0,
        maximum: 1,
      },
    },
  },

  notification: {
    type: 'object',
    required: ['message'],
    properties: {
      message: { type: 'string' },
      type: {
        type: 'string',
        enum: ['success', 'error', 'info', 'warning'],
      },
      duration: {
        type: 'integer',
        minimum: 0,
      },
    },
  },

  cameraTarget: {
    type: 'object',
    required: ['x', 'y', 'z'],
    properties: {
      x: { type: 'number' },
      y: { type: 'number' },
      z: { type: 'number' },
    },
  },

  savedVehicle: {
    type: 'object',
    required: ['name'],
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
      },
    },
  },

  batchUpdate: {
    type: 'array',
    items: {
      type: 'object',
      required: ['operation', 'params'],
      properties: {
        operation: { type: 'string' },
        params: {},
      },
    },
  },
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate hex color format
 * @param {string} color - Color string to validate
 * @returns {boolean} True if valid
 */
export function isValidHexColor(color) {
  return /^#[0-9A-F]{6}$/i.test(color)
}

/**
 * Validate number range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} True if valid
 */
export function isInRange(value, min, max) {
  return typeof value === 'number' && !isNaN(value) && value >= min && value <= max
}

/**
 * Validate vehicle model ID
 * @param {string} modelId - Model ID to validate
 * @param {Array} availableModels - Array of available model IDs
 * @returns {boolean} True if valid
 */
export function isValidModel(modelId, availableModels) {
  return typeof modelId === 'string' && availableModels.includes(modelId)
}

/**
 * Sanitize string input
 * @param {string} input - String to sanitize
 * @param {number} maxLength - Maximum length
 * @returns {string} Sanitized string
 */
export function sanitizeString(input, maxLength = 100) {
  if (typeof input !== 'string') return ''
  return input.trim().slice(0, maxLength)
}

// ============================================================================
// PARAMETER BUILDERS
// ============================================================================

/**
 * Build vehicle configuration object with defaults
 * @param {Object} params - Partial configuration
 * @returns {VehicleConfiguration} Complete configuration
 */
export function buildVehicleConfig(params = {}) {
  return {
    body: params.body || 'toyota_4runner_5g',
    lift: params.lift !== undefined ? params.lift : 0,
    color: params.color || '#B91818',
    roughness: params.roughness !== undefined ? params.roughness : 0,
    addons: params.addons || {},
    wheel_offset: params.wheel_offset !== undefined ? params.wheel_offset : 0,
    rim: params.rim || 'toyota_4runner_5thgen',
    rim_color: params.rim_color || 'silver',
    rim_color_secondary: params.rim_color_secondary || 'silver',
    rim_diameter: params.rim_diameter || 17,
    rim_width: params.rim_width || 10,
    tire: params.tire || 'bfg_at',
    tire_diameter: params.tire_diameter || 32,
    spare: params.spare !== undefined ? params.spare : true,
  }
}

/**
 * Build wheel configuration object
 * @param {Object} params - Wheel parameters
 * @returns {Object} Wheel configuration
 */
export function buildWheelConfig(params = {}) {
  return {
    rim: params.rim,
    rim_diameter: params.rim_diameter,
    rim_width: params.rim_width,
    rim_color: params.rim_color,
    rim_color_secondary: params.rim_color_secondary,
    tire: params.tire,
    tire_diameter: params.tire_diameter,
    wheel_offset: params.wheel_offset,
  }
}

/**
 * Build appearance configuration object
 * @param {Object} params - Appearance parameters
 * @returns {Object} Appearance configuration
 */
export function buildAppearanceConfig(params = {}) {
  return {
    color: params.color,
    roughness: params.roughness,
  }
}

// ============================================================================
// RESPONSE FORMATTERS
// ============================================================================

/**
 * Format success response
 * @param {*} data - Response data
 * @param {string} message - Optional message
 * @returns {HandlerResult} Formatted response
 */
export function successResponse(data, message = null) {
  return {
    success: true,
    data,
    ...(message && { message }),
  }
}

/**
 * Format error response
 * @param {string} error - Error message
 * @param {*} details - Optional error details
 * @returns {HandlerResult} Formatted response
 */
export function errorResponse(error, details = null) {
  return {
    success: false,
    error,
    ...(details && { details }),
  }
}

/**
 * Format validation error response
 * @param {Array} errors - Array of validation errors
 * @returns {HandlerResult} Formatted response
 */
export function validationErrorResponse(errors) {
  return {
    success: false,
    error: 'Validation failed',
    validationErrors: errors,
  }
}

// ============================================================================
// CONSTANTS EXPORT
// ============================================================================

export const VEHICLE_PARTS = {
  BODY: 'body',
  WHEELS: 'wheels',
  RIM: 'rim',
  TIRE: 'tire',
  ADDONS: 'addons',
  SUSPENSION: 'suspension',
  APPEARANCE: 'appearance',
}

export const ADDON_TYPES = {
  BUMPER_FRONT: 'bumper_f',
  SLIDERS: 'sliders',
  ROOF_RACK: 'rack',
}

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
}

export const OPERATION_TYPES = {
  // Vehicle operations
  SET_VEHICLE_BODY: 'setVehicleBody',
  SET_VEHICLE_COLOR: 'setVehicleColor',
  SET_VEHICLE_ROUGHNESS: 'setVehicleRoughness',
  SET_VEHICLE_APPEARANCE: 'setVehicleAppearance',
  SET_VEHICLE_LIFT: 'setVehicleLift',
  SET_VEHICLE_ADDON: 'setVehicleAddon',
  REMOVE_VEHICLE_ADDON: 'removeVehicleAddon',
  TOGGLE_SPARE_TIRE: 'toggleSpareTire',
  
  // Wheel operations
  SET_RIM: 'setRim',
  SET_RIM_COLOR: 'setRimColor',
  SET_RIM_COLOR_SECONDARY: 'setRimColorSecondary',
  SET_RIM_DIAMETER: 'setRimDiameter',
  SET_RIM_WIDTH: 'setRimWidth',
  SET_TIRE: 'setTire',
  SET_TIRE_DIAMETER: 'setTireDiameter',
  SET_WHEEL_CONFIGURATION: 'setWheelConfiguration',
  
  // Configuration operations
  RESET_VEHICLE: 'resetVehicle',
  RESET_VEHICLE_COMPLETE: 'resetVehicleComplete',
  SET_VEHICLE_CONFIGURATION: 'setVehicleConfiguration',
  
  // Saved vehicles operations
  SAVE_VEHICLE: 'saveVehicle',
  LOAD_SAVED_VEHICLE: 'loadSavedVehicle',
  DELETE_SAVED_VEHICLE: 'deleteSavedVehicle',
  UPDATE_SAVED_VEHICLE_NAME: 'updateSavedVehicleName',
  
  // Camera operations
  SET_CAMERA_TARGET: 'setCameraTarget',
  SET_CAMERA_AUTO_ROTATE: 'setCameraAutoRotate',
  
  // Scene operations
  SET_PHYSICS_ENABLED: 'setPhysicsEnabled',
  SHOW_NOTIFICATION: 'showNotification',
  HIDE_NOTIFICATION: 'hideNotification',
}

export default {
  schemas,
  isValidHexColor,
  isInRange,
  isValidModel,
  sanitizeString,
  buildVehicleConfig,
  buildWheelConfig,
  buildAppearanceConfig,
  successResponse,
  errorResponse,
  validationErrorResponse,
  VEHICLE_PARTS,
  ADDON_TYPES,
  NOTIFICATION_TYPES,
  OPERATION_TYPES,
}

