import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { api } from "../../utils/api";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, token, refresh } = useAuthStore();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [errors, setErrors] = useState({
    email: "",
    newPassword: "",
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
  });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

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

  const updateProfile = async () => {
    if (!validateEmail(form.email)) {
      setErrors((e) => ({
        ...e,
        email: "Enter a valid email address.",
      }));
      return;
    }

    try {
      const res = await api.put("/user/profile/update", {
        token,
        ...form,
      });

      if (res.status === 200) {
        toast.success("Profile updated!");
      } else {
        toast.error(res.data?.msg || "Something went wrong!");
      }

      refresh();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Update failed");
    }
  };

  const updatePassword = async () => {
    setErrors({ email: "", newPassword: "" });

    if (passwords.oldPassword === passwords.newPassword) {
      setErrors((e) => ({
        ...e,
        newPassword: "New password cannot be same as old password.",
      }));
      return;
    }

    if (!validatePassword(passwords.newPassword)) {
      setErrors((e) => ({
        ...e,
        newPassword:
          "Password must have 8+ chars, 1 uppercase, 1 lowercase, 1 number & 1 special symbol.",
      }));
      return;
    }

    try {
      const res = await api.put("/user/profile/password", {
        token,
        ...passwords,
      });

      if (res.status === 200) {
        toast.success("Password updated!");
        setPasswords({ oldPassword: "", newPassword: "" });
        setErrors({ email: "", newPassword: "" });
      } else {
        toast.error(res.data?.msg || "Something went wrong!");
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Password update failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow p-8 space-y-10">
        <h2 className="text-3xl font-bold text-primary text-center">
          Your Profile
        </h2>

        {/* PROFILE DETAILS */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Profile Details</h3>

          {/* NAME */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Full Name</label>
            <div className="relative">
              <User
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                className="w-full pl-10 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <input
                className={`w-full pl-10 py-3 border rounded-lg bg-background focus:outline-none ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-input focus:ring-primary"
                }`}
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });

                  if (!validateEmail(e.target.value)) {
                    setErrors((err) => ({
                      ...err,
                      email: "Enter a valid email address.",
                    }));
                  } else {
                    setErrors((err) => ({ ...err, email: "" }));
                  }
                }}
              />
            </div>

            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          <button
            onClick={updateProfile}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90"
          >
            Save Changes
          </button>
        </div>

        {/* PASSWORD UPDATE */}
        <div className="space-y-6 pt-4 border-t border-border">
          <h3 className="text-lg font-semibold">Change Password</h3>

          {/* OLD PASSWORD */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Old Password</label>
            <div className="relative">
              <Lock
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type={showPassword.old ? "text" : "password"}
                className="w-full pl-10 pr-10 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                value={passwords.oldPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, oldPassword: e.target.value })
                }
              />

              {showPassword.old ? (
                <EyeOff
                  size={20}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() =>
                    setShowPassword({ ...showPassword, old: false })
                  }
                />
              ) : (
                <Eye
                  size={20}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() =>
                    setShowPassword({ ...showPassword, old: true })
                  }
                />
              )}
            </div>
          </div>

          {/* NEW PASSWORD */}
          <div className="space-y-3">
            <label className="text-sm font-medium">New Password</label>
            <div className="relative">
              <Lock
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type={showPassword.new ? "text" : "password"}
                className={`w-full pl-10 pr-10 py-3 border rounded-lg bg-background focus:outline-none ${
                  errors.newPassword
                    ? "border-red-500 focus:ring-red-500"
                    : "border-input focus:ring-primary"
                }`}
                value={passwords.newPassword}
                onChange={(e) => {
                  const val = e.target.value;
                  setPasswords({ ...passwords, newPassword: val });

                  if (!validatePassword(val)) {
                    setErrors((err) => ({
                      ...err,
                      newPassword:
                        "Password must have 8+ chars, 1 uppercase, 1 lowercase, 1 number & 1 special symbol.",
                    }));
                  } else {
                    setErrors((err) => ({ ...err, newPassword: "" }));
                  }
                }}
              />

              {showPassword.new ? (
                <EyeOff
                  size={20}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() =>
                    setShowPassword({ ...showPassword, new: false })
                  }
                />
              ) : (
                <Eye
                  size={20}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() =>
                    setShowPassword({ ...showPassword, new: true })
                  }
                />
              )}
            </div>

            {errors.newPassword && (
              <p className="text-red-500 text-sm">{errors.newPassword}</p>
            )}
          </div>

          <button
            onClick={updatePassword}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}
