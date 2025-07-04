import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { shallow } from "zustand/shallow";

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, loading, error } = useAuthStore(
    (state) => ({
      signUp: state.signUp,
      loading: state.loading,
      error: state.error,
    }),
    shallow
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    const result = await signUp(
      formData.email.trim(),
      formData.password,
      formData.name
    );

    if (result.success) {
      navigate("/onboarding");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const passwordsMatch = formData.password === formData.confirmPassword;
  const showPasswordError = formData.confirmPassword && !passwordsMatch;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-sage-green-light via-warm-off-white to-sage-green dark:from-deep-charcoal dark:via-charcoal-light dark:to-deep-charcoal px-6 py-8"
    >
      <div className="max-w-md mx-auto">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-charcoal-muted dark:text-gray-300 hover:text-deep-charcoal dark:hover:text-gray-100 mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to home
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-warm-off-white dark:bg-charcoal-light rounded-2xl shadow-strong dark:shadow-[0_20px_50px_rgba(34,51,59,0.4)] p-8 border border-sage-green/20 dark:border-charcoal-muted"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-deep-charcoal dark:text-warm-off-white mb-2">
              Create Your Family Hub
            </h1>
            <p className="text-charcoal-muted dark:text-gray-300">
              Start bringing your household together in just a few minutes
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-deep-charcoal dark:text-warm-off-white mb-2 block">
                Your Name
              </label>
              <div className="relative">
                <User
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-muted dark:text-gray-400"
                />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="border border-sage-green/30 dark:border-charcoal-muted rounded-lg px-4 py-3 pl-10 w-full bg-white dark:bg-deep-charcoal text-deep-charcoal dark:text-warm-off-white focus:ring-2 focus:ring-sage-green focus:border-sage-green transition-colors"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-deep-charcoal dark:text-warm-off-white mb-2 block">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-muted dark:text-gray-400"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="border border-sage-green/30 dark:border-charcoal-muted rounded-lg px-4 py-3 pl-10 w-full bg-white dark:bg-deep-charcoal text-deep-charcoal dark:text-warm-off-white focus:ring-2 focus:ring-sage-green focus:border-sage-green transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-deep-charcoal dark:text-warm-off-white mb-2 block">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-muted dark:text-gray-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="border border-sage-green/30 dark:border-charcoal-muted rounded-lg px-4 py-3 pl-10 pr-10 w-full bg-white dark:bg-deep-charcoal text-deep-charcoal dark:text-warm-off-white focus:ring-2 focus:ring-sage-green focus:border-sage-green transition-colors"
                  placeholder="Create a secure password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal-muted dark:text-gray-400 hover:text-deep-charcoal dark:hover:text-warm-off-white"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-deep-charcoal dark:text-warm-off-white mb-2 block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-muted dark:text-gray-400"
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`border rounded-lg px-4 py-3 pl-10 pr-10 w-full bg-white dark:bg-deep-charcoal text-deep-charcoal dark:text-warm-off-white focus:ring-2 focus:ring-sage-green focus:border-sage-green transition-colors ${
                    showPasswordError
                      ? "border-red-300 dark:border-red-600"
                      : "border-sage-green/30 dark:border-charcoal-muted"
                  }`}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal-muted dark:text-gray-400 hover:text-deep-charcoal dark:hover:text-warm-off-white"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {showPasswordError && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || showPasswordError || !passwordsMatch}
              className="w-full bg-sage-green hover:bg-sage-green-hover text-deep-charcoal px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-deep-charcoal border-t-transparent rounded-full animate-spin" />
                  Creating your account...
                </div>
              ) : (
                "Create Account"
              )}
            </motion.button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-charcoal-muted dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-deep-charcoal hover:text-sage-green-hover font-medium transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>

          <p className="text-center text-sm text-charcoal-muted dark:text-gray-400 mt-4">
            By creating an account, you agree to our Terms of Service and
            Privacy Policy
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SignupPage;
