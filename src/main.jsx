import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

// StrictMode kullanılmıyor: çift bağlama, drei <Html> köklerini render sırasında söküyor
createRoot(document.getElementById('root')).render(<App />)
