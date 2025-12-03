import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TaskEdit from "./pages/TaskEdit";
import Header from "./components/Header";
import { useEffect, type ReactNode } from "react";

function App() {
  const { user, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  const PrivateRoute = (element: ReactNode) =>
    user ? element : <Navigate to="/login" />;

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
        <Route path="/dashboard" element={PrivateRoute(<Dashboard />)} />
        <Route path="/tasks/new" element={PrivateRoute(<TaskEdit />)} />
        <Route path="/tasks/:id" element={PrivateRoute(<TaskEdit />)} />
      </Routes>
    </div>
  );
}

export default App;
