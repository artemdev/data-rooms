import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { Toaster } from './components/ui/sonner'
import { Spinner } from './components/ui/spinner'

import './index.css'

const App = lazy(() => import('./App.tsx'))
const DataRoom = lazy(() => import('./pages/DataRoom/index.tsx'))

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <Suspense
                fallback={
                    <div className="min-h-screen h-screen w-screen bg-gray-800 flex items-center justify-center">
                        <Spinner
                            variant="circle"
                            className="size-16 text-white"
                        />
                    </div>
                }
            >
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/rooms/:id" element={<DataRoom />} />
                </Routes>
            </Suspense>
            <Toaster richColors />
        </BrowserRouter>
    </StrictMode>
)
