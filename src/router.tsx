import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

// Lazy load the home component
const Home = lazy(() => import('./Home'))

const rootRoute = createRootRoute({
  component: () => (
    <div>
      {/* This Suspense wraps all child routes */}
      <Suspense fallback={<div>Loading...</div>}>
        <Outlet />
      </Suspense>
    </div>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})

const routeTree = rootRoute.addChildren([indexRoute])
export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}