import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import App from './App.tsx'
import DataRoom from './components/DataRoom'
import { Toaster } from './components/ui/sonner'
import './index.css'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/rooms/:id" element={<DataRoom />} />
            </Routes>
            <Toaster richColors />
        </BrowserRouter>
    </StrictMode>
)
