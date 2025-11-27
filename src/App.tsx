import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TaskEdit from "./pages/TaskEdit";
import Header from "./components/Header";
import { useEffect } from "react";

function App() {
  const { user, checkAuth } = useAuthStore();

  useEffect(() => {
  checkAuth();
}, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {user && <Header />}
      <Routes>
        <Route
          path="/"
          element={
            user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/tasks/new"
          element={user ? <TaskEdit /> : <Navigate to="/login" />}
        />
        <Route
          path="/tasks/:id"
          element={user ? <TaskEdit /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
}

export default App;
