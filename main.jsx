import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App'

import './assets/styles/global.css'

// Load test utilities and diagnostics in development
if (import.meta.env.DEV) {
    import('./src/lib/vehicle-update-test.js').then(module => {
        console.log('🧪 Vehicle update test utilities loaded')
        console.log('Run tests with: window.vehicleUpdateTests.runAllTests()')
    })
    
    import('./src/lib/connection-diagnostics.js').then(module => {
        console.log('🔧 Connection diagnostics loaded')
        console.log('Run diagnostics with: window.mcpDiagnostics.runFullDiagnostics()')
    })
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
