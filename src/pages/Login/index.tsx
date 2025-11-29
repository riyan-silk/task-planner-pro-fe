import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (password: string) => {
    const rules = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    return Object.values(rules).every(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin) {
      if (!validatePassword(formData.password)) {
        setPasswordError(
          "Password must have 8+ chars, 1 uppercase, 1 lowercase, 1 number & 1 special symbol."
        );
        return;
      }
    }

    setPasswordError("");

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
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={20}
                />
                <input
                  type="text"
                  required
                  className="pl-10 w-full py-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={20}
              />
              <input
                type="email"
                required
                className="pl-10 w-full py-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={20}
              />

              <input
                type={showPassword ? "text" : "password"}
                required
                className={`pl-10 pr-10 w-full py-3 border rounded-lg bg-background text-foreground focus:outline-none ${
                  passwordError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-input focus:ring-primary"
                }`}
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, password: val });

                  if (!isLogin) {
                    if (!validatePassword(val)) {
                      setPasswordError(
                        "Password must have 8+ chars, 1 uppercase, 1 lowercase, 1 number & 1 special symbol."
                      );
                    } else {
                      setPasswordError("");
                    }
                  }
                }}
              />

              {showPassword ? (
                <EyeOff
                  size={20}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <Eye
                  size={20}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground"
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>

            {passwordError && (
              <p className="text-red-500 text-sm">{passwordError}</p>
            )}
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
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setPasswordError("");
              }}
              className="text-primary font-medium hover:underline ml-1"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
