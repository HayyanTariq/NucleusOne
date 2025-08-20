import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-primary" />
      

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/90 text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            The Future of Application Management
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Nucleus One
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            Streamline your organization with our comprehensive suite of applications. 
            Manage users, control access, and scale your business with enterprise-grade solutions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-elegant px-8 py-6 text-lg font-semibold rounded-xl"
              onClick={() => navigate('/signup')}
            >
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-white border-2 text-white bg-white/20 font-bold hover:bg-white hover:scale-105 transition-all duration-300 px-8 py-6 text-lg font-semibold rounded-xl backdrop-blur-sm shadow-2xl group"
              onClick={() => navigate('/login')}
            >
              <span className="text-white group-hover:text-black font-bold text-lg drop-shadow-lg group-hover:drop-shadow-none transition-all duration-300">Sign In</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default Hero;