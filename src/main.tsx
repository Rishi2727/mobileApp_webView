import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { MyRouter } from './routes/routes.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MyRouter />
  </StrictMode>,
)
