import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowLeft, Check, X } from "lucide-react";
import { Link } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoveryMode(true);
      } else if (event === "SIGNED_IN" && !isRecoveryMode) {
        // User is signed in but not in recovery mode, redirect to home
        navigate("/");
      }
    });

    // Check if we're already in a recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // If there's a hash with type=recovery, we're in recovery mode
      const hash = window.location.hash;
      if (hash && hash.includes("type=recovery")) {
        setIsRecoveryMode(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, isRecoveryMode]);

  // Password strength checks
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const isPasswordStrong = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordStrong) {
      toast({
        title: "Weak Password",
        description: "Please meet all password requirements",
        variant: "destructive",
      });
      return;
    }

    if (!passwordsMatch) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords are the same",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password Updated!",
        description: "Your password has been successfully reset. Redirecting to login...",
      });
      
      // Sign out and redirect to auth page
      await supabase.auth.signOut();
      setTimeout(() => navigate("/auth"), 2000);
    }

    setLoading(false);
  };

  const PasswordCheck = ({ passed, label }: { passed: boolean; label: string }) => (
    <div className={`flex items-center gap-2 text-sm ${passed ? "text-green-600" : "text-muted-foreground"}`}>
      {passed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      {label}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link 
          to="/auth" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <Card className="shadow-elegant border-border/50">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="font-heading text-2xl">Reset Password</CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password strength requirements */}
              <div className="space-y-2 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Password Requirements:</p>
                <PasswordCheck passed={passwordChecks.length} label="At least 8 characters" />
                <PasswordCheck passed={passwordChecks.uppercase} label="One uppercase letter" />
                <PasswordCheck passed={passwordChecks.lowercase} label="One lowercase letter" />
                <PasswordCheck passed={passwordChecks.number} label="One number" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pl-10 pr-10 ${confirmPassword && !passwordsMatch ? "border-destructive" : ""}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-sm text-destructive">Passwords do not match</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary" 
                disabled={loading || !isPasswordStrong || !passwordsMatch}
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
