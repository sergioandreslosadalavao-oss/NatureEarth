import { Navigate, Route, Routes } from 'react-router-dom'
import GlobeScreen from './pages/GlobeScreen'
import SpeciesDetailPage from './pages/SpeciesDetailPage'

/**
 * Rutas de Nature Earth.
 *
 * El SRS v3.0 define UNA sola pantalla principal: el globo 3D. La ficha
 * ampliada es la única vista separada y se alcanza desde el detalle del
 * globo; cualquier ruta desconocida vuelve al globo.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<GlobeScreen />} />
      <Route path="/especies/:id" element={<SpeciesDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
