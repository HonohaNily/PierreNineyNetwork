import { Link, useLocation } from "wouter";
import { PopoverTrigger, Popover, PopoverContent } from "@/components/ui/popover";
import { Bell, Sparkles, LogOut } from "lucide-react";
import { CrocodileWhackGame, NineyClickGame, AbsurdWordGenerator } from "@/components/easter-eggs";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { NotificationDrawer } from "./notification-drawer";

export function MobileNavigation() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Récupérer le nombre de notifications non lues
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        const notifications = await res.json();
        const unread = notifications.filter((notification: any) => !notification.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Erreur lors de la récupération des notifications:', error);
      }
    };
    
    fetchNotifications();
    // Récupérer les notifications toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
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
      <NotificationDrawer open={notificationOpen} onOpenChange={setNotificationOpen} />
      
      <nav className="md:hidden bg-card border-t border-border fixed bottom-0 w-full">
        <div className="flex justify-around py-2">
          <Link href="/">
            <div className={`flex flex-col items-center p-2 ${location === "/" ? "text-[var(--niney-blue)]" : "text-muted-foreground"}`}>
              <i className="fas fa-home text-xl"></i>
              <span className="text-xs mt-1">Accueil</span>
            </div>
          </Link>
          
          {/* Easter Eggs Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex flex-col items-center p-2 text-muted-foreground">
                <Sparkles className="h-5 w-5" />
                <span className="text-xs mt-1">Absurde</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3 bg-card">
              <div className="flex items-center space-x-3 easter-egg-triggers">
                <CrocodileWhackGame />
                <NineyClickGame />
                <AbsurdWordGenerator />
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Bouton notifications */}
          <button
            onClick={() => setNotificationOpen(true)}
            className="flex flex-col items-center p-2 text-muted-foreground relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
            <span className="text-xs mt-1">Notifs</span>
          </button>
          
          <Link href="/profile">
            <div className={`flex flex-col items-center p-2 ${location === "/profile" ? "text-[var(--niney-blue)]" : "text-muted-foreground"}`}>
              <i className="fas fa-user text-xl"></i>
              <span className="text-xs mt-1">Profil</span>
            </div>
          </Link>
          
          {/* Bouton réglages */}
          <Link href="/settings">
            <div className={`flex flex-col items-center p-2 ${location === "/settings" ? "text-[var(--niney-blue)]" : "text-muted-foreground"}`}>
              <i className="fas fa-cog text-xl"></i>
              <span className="text-xs mt-1">Réglages</span>
            </div>
          </Link>
        </div>
      </nav>
    </>
  );
}
