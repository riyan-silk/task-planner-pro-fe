import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { Mail, Lock, User } from "lucide-react";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) await login(formData.email, formData.password);
      else await register(formData.name, formData.email, formData.password);
      navigate("/dashboard");
    } catch {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="w-full max-w-lg bg-card border border-border shadow-md rounded-2xl p-8 space-y-8">
        <h2 className="text-center text-3xl font-bold text-primary">
          {isLogin ? "Welcome Back 👋" : "Create Account"}
        </h2>
        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? "Sign in to continue your tasks" : "Let’s get started!"}
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="text"
                  required
                  className="pl-10 w-full py-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="email"
                required
                className="pl-10 w-full py-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="password"
                required
                className="pl-10 w-full py-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary font-medium hover:underline ml-1">
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
