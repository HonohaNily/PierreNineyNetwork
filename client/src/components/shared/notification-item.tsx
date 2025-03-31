import { formatTimeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Heart, MessageCircle, UserPlus, AtSign } from "lucide-react";

export interface NotificationProps {
  id: number;
  userId: number;
  senderId?: number;
  senderName?: string;
  senderAvatar?: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'system';
  content: string;
  postId?: number;
  read: boolean;
  createdAt: Date;
  onMarkAsRead?: (id: number) => void;
}

const getNotificationIcon = (type: NotificationProps['type']) => {
  switch (type) {
    case 'like':
      return <Heart className="h-4 w-4 text-rose-500" />;
    case 'comment':
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case 'follow':
      return <UserPlus className="h-4 w-4 text-green-500" />;
    case 'mention':
      return <AtSign className="h-4 w-4 text-yellow-500" />;
    case 'system':
    default:
      return <Bell className="h-4 w-4 text-slate-500" />;
  }
};

export function NotificationItem({
  id,
  senderName,
  senderAvatar,
  type,
  content,
  read,
  createdAt,
  onMarkAsRead
}: NotificationProps) {
  const handleClick = () => {
    if (!read && onMarkAsRead) {
      onMarkAsRead(id);
    }
  };

  return (
    <div 
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg transition-colors hover:bg-muted cursor-pointer",
        !read && "bg-muted/50"
      )}
      onClick={handleClick}
    >
      <div className="flex-shrink-0">
        {senderAvatar ? (
          <Avatar className="h-9 w-9">
            <AvatarImage src={senderAvatar} alt={senderName || 'Utilisateur'} />
            <AvatarFallback>{senderName?.[0] || 'U'}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-9 h-9 bg-muted rounded-full flex items-center justify-center">
            {getNotificationIcon(type)}
          </div>
        )}
      </div>
      
      <div className="flex-1 space-y-1">
        <p className="text-sm leading-tight">
          {senderName && <span className="font-medium">{senderName}</span>}{' '}
          {content}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatTimeAgo(new Date(createdAt))}
        </p>
      </div>
      
      {!read && (
        <div className="w-2 h-2 bg-[var(--niney-blue)] rounded-full flex-shrink-0 mt-2" />
      )}
    </div>
  );
}

export function NotificationList({ 
  notifications,
  onMarkAsRead
}: { 
  notifications: NotificationProps[];
  onMarkAsRead?: (id: number) => void;
}) {
  return (
    <div className="space-y-1">
      {notifications.map((notification) => (
        <NotificationItem 
          key={notification.id} 
          {...notification} 
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
}