import { 
  Users, 
  Award, 
  UserCheck, 
  ShoppingCart, 
  Clock, 
  DollarSign, 
  FolderOpen,
  ArrowRight,
  Star,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useNucleusStore } from '@/store/nucleusStore';

const AppShowcase = () => {
  const navigate = useNavigate();
  const { apps } = useNucleusStore();

  console.log('🏠 Landing page apps:', apps.length, apps.map(a => a.name));

  const iconMap = {
    Users,
    Award,
    UserCheck,
    ShoppingCart,
    Clock,
    DollarSign,
    FolderOpen
  };

  const getIcon = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || Users;
  };

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full text-primary text-sm mb-6">
            <Zap className="w-4 h-4" />
            Complete Application Suite
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Powerful Applications
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover our comprehensive suite of enterprise applications designed to streamline 
            your business operations and boost productivity across all departments.
          </p>
        </div>

        {/* Apps grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {apps.map((app, index) => {
            const IconComponent = getIcon(app.icon);
            
            return (
              <Card 
                key={app.id}
                className="group hover-scale hover-glow bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8">
                  {/* App icon */}
                  <div className="mb-6 relative">
                    <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-elegant">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Floating badge */}
                    <Badge className="absolute -top-2 -right-2 bg-success text-success-foreground border-0 shadow-lg">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  </div>

                  {/* App info */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {app.name}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {app.description}
                      </p>
                    </div>

                    {/* Category and pricing */}
                    <div className="space-y-3">
                      <Badge variant="secondary" className="text-xs">
                        {app.category}
                      </Badge>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">
                          {app.pricing}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          per user
                        </span>
                      </div>
                    </div>

                    {/* Action button */}
                    <Button 
                      className="w-full group-hover:shadow-glow transition-all duration-300"
                      onClick={() => navigate('/signup')}
                    >
                      Get Started
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16 animate-fade-in">
          <div className="glass-effect rounded-3xl p-12 max-w-4xl mx-auto border border-primary/20">
            <h3 className="text-3xl font-bold mb-4 text-white dark:text-foreground">
              Ready to Transform Your Business?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of companies already using Nucleus One to streamline their operations 
              and accelerate growth.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="gradient-primary hover:scale-105 transition-all duration-300 shadow-elegant px-8 py-6 text-lg font-semibold rounded-xl"
                onClick={() => navigate('/signup')}
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="hover:scale-105 transition-all duration-300 px-8 py-6 text-lg font-semibold rounded-xl"
                onClick={() => navigate('/login')}
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppShowcase;