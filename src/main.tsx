import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import { MyRouter } from './routes/routes.tsx'
import RootLayout from './components/layout/RootLayout.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootLayout>
      <MyRouter />
    </RootLayout>
  </StrictMode>,
)
