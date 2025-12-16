import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from "@/hooks/useAuth"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DocumentHead } from "@/components/DocumentHead"
import { AnnouncementBar } from "@/components/AnnouncementBar"
import { CustomStylesInjector } from "@/components/CustomStylesInjector"

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import './index.css'

const queryClient = new QueryClient()

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
    const root = createRoot(rootElement)
    root.render(
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <TooltipProvider>
                    <DocumentHead />
                    <CustomStylesInjector />
                    <AnnouncementBar />
                    <Toaster />
                    <Sonner />
                    <RouterProvider router={router} />
                </TooltipProvider>
            </AuthProvider>
        </QueryClientProvider>
    )
}
