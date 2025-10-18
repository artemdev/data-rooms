import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import App from './App.tsx'
import DataRoom from './components/DataRoom'
import { Toaster } from './components/ui/sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import './index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/rooms/:id" element={<DataRoom />} />
                </Routes>
                <Toaster richColors />
            </QueryClientProvider>
        </BrowserRouter>
    </StrictMode>
)
