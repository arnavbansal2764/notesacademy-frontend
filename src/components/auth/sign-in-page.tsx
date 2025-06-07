"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import SetPasswordForm from "./set-password"
import toast from "react-hot-toast"

const backgroundVariants = {
  initial: {
    backgroundPosition: "0% 50%",
  },
  animate: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    transition: {
      duration: 10,
      ease: "linear",
      repeat: Number.POSITIVE_INFINITY,
    },
  },
}

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      yoyo: Number.POSITIVE_INFINITY,
    },
  },
  tap: {
    scale: 0.95,
  },
}

// Define authentication steps
enum AuthStep {
  EMAIL_CHECK,
  PASSWORD_ENTRY,
  PASSWORD_SETUP
}

export default function SignInForm() {
  const [authStep, setAuthStep] = useState(AuthStep.EMAIL_CHECK);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Show error message if directed from failed login
  

  const verifyEmailExists = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // User doesn't exist, redirect to pricing
        router.push(`/pricing?reason=account_required&email=${encodeURIComponent(email)}`);
        return;
      }
      
      if (data.needsPasswordSetup) {
        // User exists but needs password setup
        setAuthStep(AuthStep.PASSWORD_SETUP);
      } else {
        // User exists and has password
        setAuthStep(AuthStep.PASSWORD_ENTRY);
      }
    } catch (error) {
      console.error("Email verification error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyEmailExists();
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid password");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Store the email in sessionStorage for reference after Google redirect
    if (email) {
      sessionStorage.setItem("lastAttemptedEmail", email);
    }
    
    try {
      // The redirect URL will be handled by the signIn callback
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Google sign in error:", error);
    }
  };
  
  const handlePasswordSet = () => {
    setAuthStep(AuthStep.PASSWORD_ENTRY);
    toast.success("Password set successfully. You can now sign in with your password.");
  };
  
  const goBackToEmailStep = () => {
    setAuthStep(AuthStep.EMAIL_CHECK);
    setPassword("");
  };

  // Password setup step
  if (authStep === AuthStep.PASSWORD_SETUP) {
    return <SetPasswordForm email={email} onPasswordSet={handlePasswordSet} onCancel={goBackToEmailStep} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md relative"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 opacity-30 rounded-lg filter blur-xl"
        variants={backgroundVariants}
        initial="initial"
        animate="animate"
      />
      <Card className="w-full backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 shadow-xl border-0">
        <CardHeader>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <CardTitle className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              {authStep === AuthStep.EMAIL_CHECK ? "Welcome" : "Sign In"}
            </CardTitle>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <CardDescription className="text-center text-gray-600 dark:text-gray-300">
              {authStep === AuthStep.EMAIL_CHECK 
                ? "Enter your email to continue" 
                : `Welcome back, ${email}`}
            </CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-6">
          {authStep === AuthStep.EMAIL_CHECK ? (
            <>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@example.com" 
                    required 
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      className="w-5 h-5 border-t-2 border-white border-solid rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    />
                  ) : (
                    "Continue with Email"
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                    Or
                  </span>
                </div>
              </div>

              <motion.div variants={buttonVariants}>
                <Button
                  variant="outline"
                  className="w-full h-12 font-medium border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-300"
                  onClick={handleGoogleSignIn}
                  type="button"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </motion.div>
            </>
          ) : (
            <>
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    placeholder="Enter your password"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        className="w-5 h-5 border-t-2 border-white border-solid rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                        }}
                      />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={goBackToEmailStep}
                  >
                    Use a different email
                  </Button>
                </div>
              </form>
            </>
          )}
        </CardContent>
        <CardFooter>
          <motion.p
            className="text-sm text-center w-full text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            By signing in, you agree to our{" "}
            <a href="#" className="underline hover:text-purple-600 transition-colors duration-300">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-purple-600 transition-colors duration-300">
              Privacy Policy
            </a>.
          </motion.p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

