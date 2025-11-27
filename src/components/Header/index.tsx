import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Sun, Moon, LogOut, CircleCheckBig } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import useTheme from "../../hooks/useTheme";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
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

          <div className="flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition"
            >
              <Menu size={22} />
            </button>

            <Link
              to="/dashboard"
              className="text-xl font-bold text-primary ml-3 tracking-wide flex items-center hover:text-green-400"
            >
              <CircleCheckBig size={32} strokeWidth={3} className="mx-2 text-green-400" />
              Task Planner Pro
            </Link>
          </div>

          

          {user && (
            <div className="hidden md:flex items-center space-x-4">

              <span className="hidden md:block text-muted-foreground">
                Welcome, <span className="font-medium">{user.name}</span>
              </span>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-muted transition"
              >
                {theme === "light" ? (
                  <Moon size={20} />
                ) : (
                  <Sun size={20} />
                )}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-destructive text-white hover:bg-destructive/80 transition flex items-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-card border-t border-border p-4 space-y-4 animate-in fade-in slide-in-from-top duration-200">
            <span className="block text-muted-foreground">
              Welcome, <span className="font-medium">{user?.name}</span>
            </span>

            <button
              onClick={toggleTheme}
              className="w-full p-3 rounded-lg bg-muted hover:bg-muted/70 transition"
            >
              {theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            </button>

            <button
              onClick={handleLogout}
              className="w-full p-3 rounded-lg bg-destructive text-white hover:bg-destructive/90 transition"
            >
              Logout
            </button>
          </div>
        )}

      </div>
    </header>
  );
};

export default Header;
