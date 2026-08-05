import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import CalendarPage from "./pages/Calendar";
import Team from "./pages/Team";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                <Route path="/" element={<Login />} />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
    path="/projects"
    element={
        <ProtectedRoute>
            <Projects />
        </ProtectedRoute>
    }
/>

   <Route
    path="/tasks"
    element={
        <ProtectedRoute>
            <Tasks />
        </ProtectedRoute>
    }
/>

                <Route
                    path="/calendar"
                    element={
                        <ProtectedRoute>
                            <CalendarPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/team"
                    element={
                        <ProtectedRoute>
                            <Team />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/reports"
                    element={
                        <ProtectedRoute>
                            <Reports />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <Settings />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<NotFound />} />

            </Routes>

        </BrowserRouter>
    );
}

export default App;