import { Link, useNavigate } from "react-router-dom";
import { Sun, Moon, LogOut, CircleCheckBig } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import useTheme from "../../hooks/useTheme";

const Header = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
  <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center py-4">

        <Link
          to="/dashboard"
          className="text-xl font-bold text-primary tracking-wide flex items-center hover:text-green-400"
        >
          <CircleCheckBig size={32} strokeWidth={3} className="mx-2 text-green-400" />
          Task Planner Pro
        </Link>

        {user && (
          <div className="flex items-center space-x-4">

            <span className="hidden sm:block text-muted-foreground">
              Welcome, <span className="font-medium">{user.name}</span>
            </span>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-muted transition"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <button
              onClick={handleLogout}
              className="hidden sm:flex px-4 py-2 rounded-lg bg-destructive text-white hover:bg-destructive/80 transition items-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </button>

            <button
              onClick={handleLogout}
              className="sm:hidden p-2 rounded-full bg-destructive text-white hover:bg-destructive/80 transition"
            >
              <LogOut size={20} />
            </button>

          </div>
        )}
      </div>
    </div>
  </header>
);

};

export default Header;
