import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TaskEdit from "./pages/TaskEdit";
import Header from "./components/Header";
import { useEffect, type ReactNode } from "react";
import Profile from "./pages/Profile";

function App() {
  const { user, checkAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  const PrivateRoute = (element: ReactNode, currentPath: string) =>
    user ? element : <Navigate to={`/login?redirect=${currentPath}`} />;

  const PublicRoute = (element: ReactNode) =>
    !user ? element : <Navigate to="/dashboard" />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {user && <Header />}
      <Routes>
        <Route
          path="/"
          element={<Navigate to={user ? "/dashboard" : "/login"} />}
        />
        <Route path="/login" element={PublicRoute(<Login />)} />
        <Route
          path="/dashboard"
          element={PrivateRoute(<Dashboard />, location.pathname)}
        />
        <Route
          path="/tasks/new"
          element={PrivateRoute(<TaskEdit />, location.pathname)}
        />
        <Route
          path="/tasks/:id"
          element={PrivateRoute(<TaskEdit />, location.pathname)}
        />
        <Route
          path="/profile"
          element={PrivateRoute(<Profile />, location.pathname)}
        />
      </Routes>
    </div>
  );
}

export default App;
