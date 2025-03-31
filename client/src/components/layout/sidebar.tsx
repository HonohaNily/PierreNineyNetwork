import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NotificationDrawer } from "@/components/layout/notification-drawer";
import { useQuery } from "@tanstack/react-query";

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { toast } = useToast();
  
  // Récupérer les notifications non lues
  const { data } = useQuery<any>({
    queryKey: ['/api/notifications'],
    refetchInterval: 30000,
  });
  
  const notifications = data || [];
  const unreadCount = notifications.filter((notification: { read: boolean }) => !notification.read).length;
  
  const handleLogout = () => {
    // Supprimer les informations d'authentification
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    
    // Afficher un message de confirmation
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt sur Pierre Niney Network!",
    });
    
    // Rediriger vers la page de connexion
    setLocation("/login");
  };

  return (
    <>
      <NotificationDrawer 
        open={notificationOpen} 
        onOpenChange={setNotificationOpen} 
      />
      
      <aside className="hidden md:flex md:w-1/5 lg:w-1/6 bg-card border-r border-border flex-col p-4 sticky top-0 h-screen">
        <div className="flex flex-col h-full">
          <div className="mb-6">
            <h1 className="font-sans text-2xl font-bold text-[var(--niney-blue)]">
              <span className="font-bold">P</span>ierre Niney Network
            </h1>
          </div>
          
          <nav className="flex-1">
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <div className={`flex items-center p-2 rounded-lg cursor-pointer ${location === "/" ? "text-[var(--niney-blue)] font-semibold bg-muted active-tab" : "hover:bg-muted transition-colors"}`}>
                    <i className="fas fa-home mr-3"></i>
                    <span>Accueil</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/profile">
                  <div className={`flex items-center p-2 rounded-lg cursor-pointer ${location === "/profile" ? "text-[var(--niney-blue)] font-semibold bg-muted active-tab" : "hover:bg-muted transition-colors"}`}>
                    <i className="fas fa-user mr-3"></i>
                    <span>Profil</span>
                  </div>
                </Link>
              </li>
              <li>
                <div 
                  onClick={() => setNotificationOpen(true)}
                  className="flex items-center p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <div className="relative">
                    <Bell className="w-5 h-5 mr-3" />
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                  <span>Notifications</span>
                </div>
              </li>
              <li>
                <Link href="/settings">
                  <div className={`flex items-center p-2 rounded-lg cursor-pointer ${location === "/settings" ? "text-[var(--niney-blue)] font-semibold bg-muted active-tab" : "hover:bg-muted transition-colors"}`}>
                    <i className="fas fa-cog mr-3"></i>
                    <span>Paramètres</span>
                  </div>
                </Link>
              </li>
            </ul>
          </nav>
          
          {/* Menu Stories */}
          <div className="mt-6 border-t border-border pt-4">
            <h3 className="text-sm font-semibold mb-3">Stories</h3>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                <i className="fas fa-plus text-[var(--niney-blue)]"></i>
              </div>
              <div className="text-sm">Créer une story</div>
            </div>
          </div>
          
          {/* Logout Button */}
          <div className="mt-auto border-t border-border pt-4">
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="w-full text-sm border-[var(--niney-blue)] text-[var(--niney-blue)]"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
