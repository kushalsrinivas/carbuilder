import { useState } from 'react'
import sceneHandlers from '../src/lib/scene-handlers.js'

/**
 * Handler Test UI Component
 * 
 * Visual interface for testing scene handlers in real-time.
 * Shows test execution, results, and current state.
 */
export default function HandlerTestUI() {
  const [isOpen, setIsOpen] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState([])
  const [currentTest, setCurrentTest] = useState(null)
  const [stats, setStats] = useState({ passed: 0, failed: 0, total: 0 })

  // Helper to add test result
  const addResult = (name, status, message, data = null) => {
    setTestResults(prev => [...prev, { name, status, message, data, timestamp: Date.now() }])
    setStats(prev => ({
      passed: prev.passed + (status === 'pass' ? 1 : 0),
      failed: prev.failed + (status === 'fail' ? 1 : 0),
      total: prev.total + 1
    }))
  }

  // Test cases
  const runTests = async () => {
    setIsRunning(true)
    setTestResults([])
    setStats({ passed: 0, failed: 0, total: 0 })

    try {
      // Test 1: Get Current Vehicle
      setCurrentTest('Getting current vehicle...')
      await sleep(100)
      const vehicle = sceneHandlers.getCurrentVehicle()
      if (vehicle && vehicle.body) {
        addResult('Get Current Vehicle', 'pass', `Found vehicle: ${vehicle.body}`, vehicle)
      } else {
        addResult('Get Current Vehicle', 'fail', 'No vehicle found')
      }

      // Test 2: Get Available Vehicles
      setCurrentTest('Getting available vehicles...')
      await sleep(100)
      const vehicles = sceneHandlers.getAvailableVehicles()
      if (vehicles && vehicles.length > 0) {
        addResult('Get Available Vehicles', 'pass', `Found ${vehicles.length} vehicles`, vehicles.slice(0, 3))
      } else {
        addResult('Get Available Vehicles', 'fail', 'No vehicles available')
      }

      // Test 3: Change Vehicle Color
      setCurrentTest('Changing vehicle color...')
      await sleep(100)
      const colorResult = sceneHandlers.setVehicleColor('#FF0000')
      if (colorResult.success) {
        addResult('Set Vehicle Color', 'pass', 'Color changed to red', colorResult.data)
      } else {
        addResult('Set Vehicle Color', 'fail', colorResult.error)
      }

      // Test 4: Invalid Color (should fail gracefully)
      setCurrentTest('Testing invalid color...')
      await sleep(100)
      const invalidColor = sceneHandlers.setVehicleColor('not-a-color')
      if (!invalidColor.success && invalidColor.error) {
        addResult('Invalid Color Handling', 'pass', 'Correctly rejected invalid color', invalidColor.error)
      } else {
        addResult('Invalid Color Handling', 'fail', 'Should have rejected invalid color')
      }

      // Test 5: Change Vehicle Lift
      setCurrentTest('Adjusting lift height...')
      await sleep(100)
      const liftResult = sceneHandlers.setVehicleLift(3)
      if (liftResult.success) {
        addResult('Set Vehicle Lift', 'pass', `Lift set to ${liftResult.data.liftInches}"`, liftResult.data)
      } else {
        addResult('Set Vehicle Lift', 'fail', liftResult.error)
      }

      // Test 6: Get Wheel Configuration
      setCurrentTest('Getting wheel configuration...')
      await sleep(100)
      const wheels = sceneHandlers.getWheelConfiguration()
      if (wheels && wheels.rim && wheels.tire) {
        addResult('Get Wheel Configuration', 'pass', `Rim: ${wheels.rim.name}, Tire: ${wheels.tire.name}`, wheels)
      } else {
        addResult('Get Wheel Configuration', 'fail', 'Invalid wheel configuration')
      }

      // Test 7: Change Rims
      setCurrentTest('Changing rims...')
      await sleep(100)
      const rims = sceneHandlers.getAvailableRims()
      if (rims.length > 0) {
        const rimResult = sceneHandlers.setRim(rims[0].id)
        if (rimResult.success) {
          addResult('Set Rim', 'pass', `Changed to ${rimResult.data.name}`, rimResult.data)
        } else {
          addResult('Set Rim', 'fail', rimResult.error)
        }
      }

      // Test 8: Batch Operations
      setCurrentTest('Testing batch operations...')
      await sleep(100)
      const batchUpdates = [
        { operation: 'setVehicleColor', params: '#00FF00' },
        { operation: 'setVehicleLift', params: 2 },
      ]
      const batchResult = sceneHandlers.applyBatchUpdates(batchUpdates)
      if (batchResult.success) {
        addResult('Batch Operations', 'pass', `${batchResult.successCount}/${batchResult.total} succeeded`, batchResult)
      } else {
        addResult('Batch Operations', 'fail', `Only ${batchResult.successCount}/${batchResult.total} succeeded`)
      }

      // Test 9: Validate Configuration
      setCurrentTest('Validating configuration...')
      await sleep(100)
      const validation = sceneHandlers.validateConfiguration({
        body: 'toyota_4runner_5g',
        color: '#FF0000',
        lift: 3
      })
      if (validation.valid) {
        addResult('Validate Configuration', 'pass', 'Valid configuration', validation)
      } else {
        addResult('Validate Configuration', 'fail', `Errors: ${validation.errors.join(', ')}`)
      }

      // Test 10: Export Configuration
      setCurrentTest('Exporting configuration...')
      await sleep(100)
      const exportResult = sceneHandlers.exportVehicleConfiguration()
      if (exportResult.success && exportResult.data) {
        addResult('Export Configuration', 'pass', 'Configuration exported', Object.keys(exportResult.data))
      } else {
        addResult('Export Configuration', 'fail', 'Export failed')
      }

      // Test 11: Get Scene State
      setCurrentTest('Getting complete scene state...')
      await sleep(100)
      const state = sceneHandlers.getSceneState()
      if (state && state.currentVehicle) {
        addResult('Get Scene State', 'pass', 'Scene state retrieved', Object.keys(state))
      } else {
        addResult('Get Scene State', 'fail', 'Invalid scene state')
      }

      // Test 12: Constants
      setCurrentTest('Checking constants...')
      await sleep(100)
      const hasConstants = sceneHandlers.VEHICLE_MODELS && 
                          sceneHandlers.RIM_MODELS && 
                          sceneHandlers.TIRE_MODELS &&
                          sceneHandlers.COLOR_PRESETS
      if (hasConstants) {
        addResult('Constants Available', 'pass', `${sceneHandlers.VEHICLE_MODELS.length} vehicles, ${sceneHandlers.RIM_MODELS.length} rims, ${sceneHandlers.TIRE_MODELS.length} tires`)
      } else {
        addResult('Constants Available', 'fail', 'Constants not available')
      }

    } catch (error) {
      addResult('Test Suite', 'fail', `Error: ${error.message}`)
    }

    setCurrentTest(null)
    setIsRunning(false)
  }

  const clearResults = () => {
    setTestResults([])
    setStats({ passed: 0, failed: 0, total: 0 })
  }

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg font-semibold transition-all z-50"
      >
        🧪 Test Handlers
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-white">Handler Test Suite</h2>
            <p className="text-gray-400 text-sm mt-1">Real-time testing of scene handlers</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 p-6 bg-gray-800/50">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-gray-400">Total Tests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{stats.passed}</div>
            <div className="text-xs text-gray-400">Passed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{stats.failed}</div>
            <div className="text-xs text-gray-400">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0}%
            </div>
            <div className="text-xs text-gray-400">Success Rate</div>
          </div>
        </div>

        {/* Current Test */}
        {currentTest && (
          <div className="px-6 py-3 bg-blue-900/30 border-y border-blue-800">
            <div className="flex items-center gap-2 text-blue-300">
              <div className="animate-spin">⚙️</div>
              <span>{currentTest}</span>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {testResults.length === 0 && !isRunning && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-3">🧪</div>
              <p>No tests run yet. Click "Run Tests" to start.</p>
            </div>
          )}

          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                result.status === 'pass'
                  ? 'bg-green-900/20 border-green-800'
                  : 'bg-red-900/20 border-red-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">
                      {result.status === 'pass' ? '✅' : '❌'}
                    </span>
                    <span className={`font-semibold ${
                      result.status === 'pass' ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {result.name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 ml-7">{result.message}</p>
                  {result.data && (
                    <details className="mt-2 ml-7">
                      <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                        View data
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-950 rounded text-xs text-gray-400 overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-800">
          <button
            onClick={runTests}
            disabled={isRunning}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              isRunning
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isRunning ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin">⚙️</div>
                Running Tests...
              </span>
            ) : (
              '▶️ Run Tests'
            )}
          </button>
          <button
            onClick={clearResults}
            disabled={isRunning}
            className="px-6 py-3 rounded-lg font-semibold bg-gray-700 hover:bg-gray-600 text-white transition-all disabled:opacity-50"
          >
            🗑️ Clear
          </button>
        </div>
      </div>
    </div>
  )
}

