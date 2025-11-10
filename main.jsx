import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App'

import './assets/styles/global.css'

// Load test utilities in development
if (import.meta.env.DEV) {
    import('./src/lib/vehicle-update-test.js').then(module => {
        console.log('🧪 Vehicle update test utilities loaded')
        console.log('Run tests with: window.vehicleUpdateTests.runAllTests()')
    })
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
