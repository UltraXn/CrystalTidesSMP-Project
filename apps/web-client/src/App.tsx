import { lazy } from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import LazyWrapper from "./components/Utils/LazyWrapper"
import { SidebarProvider } from "./context/SidebarContext"
import RootLayout from "./components/Layout/RootLayout"

// Static Pages
import Home from "./pages/Home"

// Lazy Pages
const Login = lazy(() => import("./pages/Login"))
const Register = lazy(() => import("./pages/Register"))
const RegisterSuccess = lazy(() => import("./pages/RegisterSuccess"))
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"))
const Verify = lazy(() => import("./pages/Verify"))
const Maintenance = lazy(() => import("./pages/Maintenance"))
const NotFound = lazy(() => import("./pages/NotFound"))

const PublicProfile = lazy(() => import("./pages/PublicProfile"))
const Account = lazy(() => import("./pages/Account"))
const Gacha = lazy(() => import("./pages/Gacha"))
const AdminPanel = lazy(() => import("./pages/AdminPanel"))
const Map = lazy(() => import("./pages/Map"))
const Status = lazy(() => import("./pages/Status"))

// Forum Lazy
const Forum = lazy(() => import("./pages/Forum"))
const ForumCategory = lazy(() => import("./pages/ForumCategory"))
const ForumThread = lazy(() => import("./pages/ForumThread"))
const CreateThread = lazy(() => import("./pages/CreateThread"))

// Support Lazy
const Support = lazy(() => import("./pages/Support"))
const TicketDetail = lazy(() => import("./pages/TicketDetail"))
const PolicyPage = lazy(() => import("./pages/PolicyPage"))
const Wiki = lazy(() => import("./pages/Wiki"))

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        errorElement: <LazyWrapper><NotFound /></LazyWrapper>,
        children: [
            { index: true, element: <Home /> },
            
            { path: "u/:username", element: <LazyWrapper><PublicProfile /></LazyWrapper> },
            { path: "account", element: <LazyWrapper minHeight="80vh"><Account /></LazyWrapper> },
            { path: "login", element: <LazyWrapper><Login /></LazyWrapper> },
            { path: "forgot-password", element: <LazyWrapper><ForgotPassword /></LazyWrapper> },
            { path: "register", element: <LazyWrapper><Register /></LazyWrapper> },
            { path: "register/success", element: <LazyWrapper><RegisterSuccess /></LazyWrapper> },
            { path: "gacha", element: <LazyWrapper><Gacha /></LazyWrapper> },
            { path: "admin", element: <LazyWrapper minHeight="80vh"><AdminPanel /></LazyWrapper> },

            { path: "forum", element: <LazyWrapper><Forum /></LazyWrapper> },
            { path: "forum/create", element: <LazyWrapper><CreateThread /></LazyWrapper> },
            { path: "forum/:id", element: <LazyWrapper><ForumCategory /></LazyWrapper> },
            { path: "forum/thread/:type/:id", element: <LazyWrapper><ForumThread /></LazyWrapper> },
            { path: "map", element: <LazyWrapper><Map /></LazyWrapper> },
            { path: "status", element: <LazyWrapper><Status /></LazyWrapper> },
            
            { path: "support", element: <LazyWrapper><Support /></LazyWrapper> },
            { path: "support/:id", element: <LazyWrapper><TicketDetail /></LazyWrapper> },
            { path: "policies/:slug", element: <LazyWrapper><PolicyPage /></LazyWrapper> },
            { path: "wiki", element: <LazyWrapper><Wiki /></LazyWrapper> },
            { path: "wiki/:slug", element: <LazyWrapper><Wiki /></LazyWrapper> },

            { path: "verify", element: <LazyWrapper><Verify /></LazyWrapper> },
            { path: "maintenance", element: <LazyWrapper><Maintenance /></LazyWrapper> },
            { path: "*", element: <LazyWrapper><NotFound /></LazyWrapper> }
        ]
    }
])

export default function App() {
  return (
    <SidebarProvider>
        <RouterProvider router={router} />
    </SidebarProvider>
  )
}
