"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"

type SetPasswordProps = {
  email: string;
  onPasswordSet: () => void;
  onCancel: () => void;
}

export default function SetPasswordForm({ email, onPasswordSet, onCancel }: SetPasswordProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password strength
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to set password");
      }
      
      toast.success("Password set successfully");
      onPasswordSet();
    } catch (error) {
      console.error("Error setting password:", error);
      toast.error(error instanceof Error ? error.message : "Failed to set password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md relative"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 opacity-30 rounded-lg filter blur-xl"
      />
      <Card className="w-full backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Set Your Password
          </CardTitle>
          <CardDescription>
            Create a password for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetPassword} className="space-y-4">
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
              <Label htmlFor="password">New Password</Label>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="Choose a strong password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                placeholder="Confirm your password"
              />
            </div>
            <div className="flex space-x-2 pt-2">
              <Button 
                type="submit" 
                className="flex-1" 
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
                  "Set Password"
                )}
              </Button>
              <Button 
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Back
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}