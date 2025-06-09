"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import LoginVisual from "@/components/auth/login-visual";
import { loginAction } from "@/action/auth.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const router = useRouter();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear errors when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "", general: "" }));
    }
  };

  const isFormValid = () => {
    return (
      formData.email.trim().length > 0 &&
      validateEmail(formData.email) &&
      formData.password.trim().length > 0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({ email: "", password: "", general: "" });

    // Validate form
    const newErrors = { email: "", password: "", general: "" };

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      const response = await loginAction({
        email: formData.email,
        password: formData.password,
      });

      if (response.success) {
        toast.success("Sign in successful");
        router.push("/dashboard");
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general:
          error instanceof Error
            ? error.message
            : "An error occurred during sign in",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-gradient-to-br from-blue-500/5 to-white relative overflow-hidden">
        <div className="w-full max-w-md relative z-10">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-gray-900">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* General Error */}
                {errors.general && (
                  <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                    {errors.general}
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={`h-12 pl-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 ${
                        errors.email
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : ""
                      }`}
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className={`h-12 pl-12 pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 ${
                        errors.password
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : ""
                      }`}
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={!isFormValid() || isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Sign In
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-0">
              <div className="text-sm text-center text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Right Side - Visual Content (Hidden on mobile) */}
      <LoginVisual />
    </div>
  );
}
