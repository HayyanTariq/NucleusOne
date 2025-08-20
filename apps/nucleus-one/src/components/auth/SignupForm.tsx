import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Building, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNucleusStore } from '@/store/nucleusStore';
import { useToast } from '@/hooks/use-toast';

const SignupForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signupCompany, isLoading } = useNucleusStore();
  
  const [formData, setFormData] = useState({
    companyName: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.ownerPassword !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords are identical.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🚀 Attempting company registration...');
      
      const success = await signupCompany({
        companyName: formData.companyName,
        ownerName: formData.ownerName,
        ownerEmail: formData.ownerEmail,
        ownerPassword: formData.ownerPassword
      });
      
      if (success) {
        toast({
          title: "Welcome to Nucleus One!",
          description: "Your company account has been created successfully.",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Signup failed",
          description: "Email already exists. Please try a different email.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Signup failed",
        description: `An error occurred during signup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 dark:bg-gradient-primary flex items-center justify-center p-6">
      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <Button 
          variant="ghost" 
          className="mb-6 text-white/90 hover:text-white hover:bg-white/20 dark:text-white/80 dark:hover:bg-white/10"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="bg-white/95 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/20 shadow-2xl animate-scale-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Create Your Company</CardTitle>
            <CardDescription className="text-gray-600 dark:text-white/70">
              Start your journey with Nucleus One
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-gray-700 dark:text-white/90">Company Name</Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Enter your company name"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="bg-white dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/50 focus:border-primary dark:focus:border-white/40"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName" className="text-gray-700 dark:text-white/90">Your Full Name</Label>
                <Input
                  id="ownerName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="bg-white dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/50 focus:border-primary dark:focus:border-white/40"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerEmail" className="text-gray-700 dark:text-white/90">Email Address</Label>
                <Input
                  id="ownerEmail"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                  className="bg-white dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/50 focus:border-primary dark:focus:border-white/40"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerPassword" className="text-gray-700 dark:text-white/90">Password</Label>
                <div className="relative">
                  <Input
                    id="ownerPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.ownerPassword}
                    onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })}
                    className="bg-white dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/50 focus:border-primary dark:focus:border-white/40 pr-12"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-gray-500 dark:text-white/60 hover:text-gray-700 dark:hover:text-white/80"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-white/90">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="bg-white dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/50 focus:border-primary dark:focus:border-white/40 pr-12"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-gray-500 dark:text-white/60 hover:text-gray-700 dark:hover:text-white/80"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-elegant"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    Creating your account...
                  </div>
                ) : (
                  <>
                    <Building className="w-4 h-4 mr-2" />
                    Create Company
                  </>
                )}
              </Button>
            </form>

            {/* Features list */}
            <div className="space-y-3 text-gray-600 dark:text-white/70 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                Complete application suite access
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                User management and role control
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                Enterprise-grade security
              </div>
            </div>

            <div className="text-center">
              <span className="text-gray-600 dark:text-white/60 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-primary dark:text-white hover:underline font-medium">
                  Sign in
                </Link>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupForm;