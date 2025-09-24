import './App.css'
import Home from './pages/Home'
import Footer from './component/Footer'

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-950 via-green-900 to-black text-white">
      {/* Main Content */}
      <div className="flex-grow">
        <Home />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App
