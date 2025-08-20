import { useEffect } from 'react';
import { 
  Users, 
  Building, 
  ShoppingBag, 
  TrendingUp,
  Award,
  Clock,
  DollarSign,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNucleusStore } from '@/store/nucleusStore';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    currentUser, 
    currentCompany,
    getUsersByCompany, 
    getCompanyApps, 
    getUserApps, 
    companies, 
    users,
    fetchUsers,
    fetchCompany,
    fetchApps,
    isLoading,
    apps // Added apps to destructuring
  } = useNucleusStore();
  
  // Normalize role for comparison - moved to top to avoid ReferenceError
  const userRole = currentUser?.role?.toLowerCase();
  
  // Fetch data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Loading dashboard data for user:', currentUser);
        console.log('📱 Apps before fetchApps:', apps.length, apps.map(a => a.name));
        console.log('👥 Users before fetchUsers:', users.length, users.map(u => u.name));
        
        if (currentUser?.companyId) {
          console.log('📊 Loading company data...');
          await Promise.all([
            // fetchUsers(), // Disabled until backend user API is ready
            fetchCompany(),
            fetchApps()
          ]);
        } else if (currentUser?.role === 'super_admin') {
          console.log('📊 Loading super admin data...');
          await Promise.all([
            // fetchUsers(), // Disabled until backend user API is ready
            fetchApps()
          ]);
        }
        
        console.log('✅ Dashboard data loaded successfully');
        console.log('📱 Apps after fetchApps:', apps.length, apps.map(a => a.name));
        console.log('👥 Users after fetchUsers:', users.length, users.map(u => u.name));
      } catch (error) {
        console.error('❌ Failed to load dashboard data:', error);
      }
    };

    if (currentUser) {
      loadData();
    }
  }, [currentUser, fetchUsers, fetchCompany, fetchApps]);
  
  if (!currentUser) return null;

  const getStatsCards = () => {
    if (userRole === 'super_admin') {
      return [
        {
          title: 'Total Companies',
          value: companies?.length || 0,
          description: 'Active companies',
          icon: Building,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10'
        },
        {
          title: 'Total Users',
          value: users?.filter(u => u?.isActive)?.length || 0,
          description: 'Across all companies',
          icon: Users,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10'
        },
        {
          title: 'Active Applications',
          value: apps?.length || 7,
          description: 'Available applications',
          icon: ShoppingBag,
          color: 'text-purple-500',
          bgColor: 'bg-purple-500/10'
        },
        {
          title: 'System Health',
          value: '99.9%',
          description: 'Uptime this month',
          icon: Activity,
          color: 'text-emerald-500',
          bgColor: 'bg-emerald-500/10'
        }
      ];
    }

    if (currentUser?.companyId) {
      const companyUsers = getUsersByCompany(currentUser.companyId);
      const companyApps = getCompanyApps(currentUser.companyId);
      const userApps = getUserApps(currentUser.id);

              if (userRole === 'owner' || userRole === 'admin') {
        return [
          {
            title: 'Team Members',
            value: companyUsers.length || 0,
            description: 'Active users',
            icon: Users,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10'
          },
          {
            title: 'Subscribed Apps',
            value: companyApps.length || 0,
            description: 'Active subscriptions',
            icon: ShoppingBag,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10'
          },
          {
            title: 'Monthly Cost',
            value: companyApps.length > 0 
              ? `$${companyApps.reduce((total, app) => total + parseInt(app.pricing.replace('$', '').replace('/month', '')), 0)}`
              : '$0',
            description: 'Total subscription cost',
            icon: DollarSign,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10'
          },
          {
            title: 'Productivity',
            value: '+24%',
            description: 'This month',
            icon: TrendingUp,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10'
          }
        ];
      }

      return [
        {
          title: 'My Applications',
          value: userApps.length || 0,
          description: 'Available to you',
          icon: ShoppingBag,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10'
        },
        {
          title: 'Tasks Completed',
          value: 47,
          description: 'This week',
          icon: Award,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10'
        },
        {
          title: 'Hours Logged',
          value: '38.5h',
          description: 'This week',
          icon: Clock,
          color: 'text-purple-500',
          bgColor: 'bg-purple-500/10'
        },
        {
          title: 'Performance',
          value: '+12%',
          description: 'Above average',
          icon: TrendingUp,
          color: 'text-emerald-500',
          bgColor: 'bg-emerald-500/10'
        }
      ];
    }

    return [];
  };

  const statsCards = getStatsCards();
      // Show Certify One as the subscribed app for owners/admins, or user's accessible apps for employees
      const recentApps = userRole === 'employee' 
        ? getUserApps(currentUser.id).slice(0, 3)
        : currentUser.companyId 
          ? apps.filter(app => app.id === 'certify-one').slice(0, 3) // Show only Certify One for owners/admins
          : [];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {currentUser.name}!
          </h1>
          <p className="text-muted-foreground">
            {userRole === 'super_admin' 
              ? 'Monitor and manage the entire Nucleus One ecosystem.'
              : userRole === 'owner'
              ? 'Manage your company and grow your business.'
              : userRole === 'admin'
              ? 'Coordinate your team and optimize workflows.'
              : 'Access your applications and stay productive.'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <Card key={stat.title} className="hover-scale animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {isLoading ? (
                    <div className="w-8 h-6 bg-muted animate-pulse rounded" />
                  ) : (
                    stat.value
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <Card className="animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <CardTitle className="text-lg">
                {userRole === 'employee' ? 'My Applications' : 'Recent Applications'}
              </CardTitle>
              <CardDescription>
                {userRole === 'employee' 
                  ? 'Applications available to you'
                  : 'Applications your company is subscribed to'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted animate-pulse rounded-lg" />
                        <div className="space-y-2">
                          <div className="w-24 h-4 bg-muted animate-pulse rounded" />
                          <div className="w-16 h-3 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                      <div className="w-16 h-8 bg-muted animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              ) : recentApps.length > 0 ? (
                recentApps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                        {app.icon === 'Award' && <Award className="w-5 h-5 text-white" />}
                        {app.icon === 'FolderOpen' && <FolderOpen className="w-5 h-5 text-white" />}
                        {app.icon === 'Clock' && <Clock className="w-5 h-5 text-white" />}
                        {app.icon === 'Users' && <Users className="w-5 h-5 text-white" />}
                        {app.icon === 'DollarSign' && <DollarSign className="w-5 h-5 text-white" />}
                        {app.icon === 'ShoppingCart' && <ShoppingBag className="w-5 h-5 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{app.name}</p>
                        <p className="text-sm text-muted-foreground">{app.category}</p>
                      </div>
                    </div>
                                         <Button size="sm" onClick={() => navigate(`/app/${app.id}`)}>
                       Open
                     </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No applications available</p>
                  {(currentUser.role === 'owner' || currentUser.role === 'admin') && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate('/dashboard/apps')}
                    >
                      Browse Applications
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="animate-scale-in" style={{ animationDelay: '0.5s' }}>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentUser.role === 'super_admin' && (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/dashboard/companies')}
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Manage Companies
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/dashboard/all-users')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    View All Users
                  </Button>
                </>
              )}
              
              {(currentUser.role === 'owner' || currentUser.role === 'admin') && (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/dashboard/users')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/dashboard/apps')}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Browse Apps
                  </Button>
                </>
              )}
              
              {currentUser.role === 'employee' && (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/dashboard/my-apps')}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    My Applications
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/dashboard/profile')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;