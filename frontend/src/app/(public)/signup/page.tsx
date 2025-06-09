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
import { Eye, EyeOff, CheckCircle2, XCircle, Zap } from "lucide-react";
import SignupVisual from "@/components/auth/signup-visual";
import { registerAction } from "@/action/auth.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ValidationState {
  minLength: boolean;
  hasAlphabet: boolean;
  hasNumber: boolean;
  isValidEmail: boolean;
}

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidation] = useState<ValidationState>({
    minLength: false,
    hasAlphabet: false,
    hasNumber: false,
    isValidEmail: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasAlphabet = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    setValidation((prev) => ({
      ...prev,
      minLength,
      hasAlphabet,
      hasNumber,
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "email") {
      setValidation((prev) => ({
        ...prev,
        isValidEmail: validateEmail(value),
      }));
    }

    if (field === "password") {
      validatePassword(value);
    }
  };

  const isFormValid = () => {
    return (
      formData.name.trim().length > 0 &&
      validation.isValidEmail &&
      validation.minLength &&
      validation.hasAlphabet &&
      validation.hasNumber
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsLoading(true);
    const response = await registerAction({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });
    setIsLoading(false);

    if (response.success) {
      toast.success("Sign up successful. Please login to continue");
      router.push("/signin");
    } else {
      toast.error(response.error);
    }
  };

  const ValidationItem = ({
    isValid,
    text,
  }: {
    isValid: boolean;
    text: string;
  }) => (
    <div
      className={`flex items-center gap-2 text-sm ${
        isValid ? "text-green-600" : "text-red-500"
      }`}
    >
      {isValid ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <XCircle className="h-4 w-4" />
      )}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual Content (Hidden on mobile) */}
      <SignupVisual />

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-gradient-to-br from-white to-blue-500/5 relative overflow-hidden">
        <div className="w-full max-w-md relative z-10">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-gray-900">
                Create Account
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Enter your information to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 ${
                      formData.email && !validation.isValidEmail
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : formData.email && validation.isValidEmail
                        ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                        : ""
                    }`}
                  />
                  {formData.email && !validation.isValidEmail && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
                      Please enter a valid email address
                    </p>
                  )}
                  {formData.email && validation.isValidEmail && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Valid email address
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-gray-700 font-medium"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className="h-12 pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
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

                  {/* Password Validation */}
                  {formData.password && (
                    <div className="space-y-2 p-4 bg-gray-50/80 rounded-lg border">
                      <p className="text-sm font-medium text-gray-700">
                        Password requirements:
                      </p>
                      <div className="space-y-1">
                        <ValidationItem
                          isValid={validation.minLength}
                          text="At least 8 characters"
                        />
                        <ValidationItem
                          isValid={validation.hasAlphabet}
                          text="At least 1 letter"
                        />
                        <ValidationItem
                          isValid={validation.hasNumber}
                          text="At least 1 number"
                        />
                      </div>
                    </div>
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
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Create Account
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-0">
              <div className="text-sm text-center text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Sign in
                </Link>
              </div>
              <div className="text-xs text-center text-gray-500">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="hover:underline text-blue-600">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="hover:underline text-blue-600">
                  Privacy Policy
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
