import { BlurAvatar } from "@/components/shared/blur-avatar";
import { formatTimeAgo } from "@/lib/utils";
import { useState } from "react";

interface PostCardProps {
  id: number;
  user: {
    id: number;
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  image?: string;
  video?: string;
  media_type?: string;
  createdAt: Date;
  reactions: {
    likes: number;
    dislikes: number;
  };
  comments: number;
}

interface ReactionCounts {
  likes: number;
  dislikes: number;
}

export function PostCard({ 
  user, 
  content, 
  image,
  video,
  media_type, 
  createdAt, 
  reactions, 
  comments
}: PostCardProps) {
  // Utiliser directement les réactions au nouveau format
  const initialReactions: ReactionCounts = {
    likes: reactions.likes || 0,
    dislikes: reactions.dislikes || 0
  };
  
  const [currentReactions, setCurrentReactions] = useState(initialReactions);
  // État pour suivre quelle réaction l'utilisateur a choisi
  const [userReaction, setUserReaction] = useState<'likes' | 'dislikes' | null>(null);
  
  const handleReaction = (type: 'likes' | 'dislikes') => {
    if (userReaction === type) {
      // Si l'utilisateur clique sur le même bouton, on annule sa réaction
      setCurrentReactions(prev => ({
        ...prev,
        [type]: Math.max(0, prev[type] - 1)
      }));
      setUserReaction(null);
    } else if (userReaction === null) {
      // Si l'utilisateur n'a pas encore réagi, on ajoute sa réaction
      setCurrentReactions(prev => ({
        ...prev,
        [type]: prev[type] + 1
      }));
      setUserReaction(type);
    } else {
      // Si l'utilisateur change de réaction, on retire l'ancienne et ajoute la nouvelle
      setCurrentReactions(prev => ({
        ...prev,
        [userReaction]: Math.max(0, prev[userReaction] - 1),
        [type]: prev[type] + 1
      }));
      setUserReaction(type);
    }
  };
  
  const totalReactions = currentReactions.likes + currentReactions.dislikes;
  
  // Déterminer le type de média à afficher
  const renderMedia = () => {
    if (media_type === "video" && video) {
      return (
        <div className="rounded-xl overflow-hidden">
          <video 
            src={video.startsWith("http") ? video : `/${video}`} 
            controls 
            className="w-full h-auto max-h-[400px]"
          />
        </div>
      );
    } else if ((media_type === "image" || !media_type) && image) {
      return (
        <div className="rounded-xl overflow-hidden">
          <BlurAvatar
            src={image}
            alt="Illustration du post"
            className="w-full h-auto object-contain max-h-[400px]"
          />
        </div>
      );
    }
    return null;
  };
  
  return (
    <article className="bg-card text-card-foreground rounded-xl shadow-md p-4 post-card border border-border">
      <div className="flex items-start mb-3">
        <BlurAvatar
          src={user.avatar}
          alt={`Avatar de ${user.name}`}
          className="w-10 h-10 rounded-full bg-muted overflow-hidden mr-3"
        />
        <div>
          <div className="font-semibold">{user.name}</div>
          <div className="text-muted-foreground text-sm">Il y a {formatTimeAgo(createdAt)}</div>
        </div>
        <div className="ml-auto">
          <button className="text-muted-foreground hover:text-foreground">
            <i className="fas fa-ellipsis-h"></i>
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="mb-3">{content}</p>
        {renderMedia()}
      </div>
      
      <div className="border-t border-b border-border py-2 mb-3">
        <div className="flex justify-between">
          <div className="flex space-x-2 items-center">
            {currentReactions.likes > 0 && (
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mr-1">
                <span className="text-xs">👍</span>
              </div>
            )}
            {currentReactions.dislikes > 0 && (
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center mr-1">
                <span className="text-xs">👎</span>
              </div>
            )}
            <span className="text-muted-foreground text-sm">{totalReactions} réactions</span>
          </div>
          <div className="text-muted-foreground text-sm">
            {comments} commentaires
          </div>
        </div>
      </div>
      
      <div className="flex justify-around">
        <button 
          className={`flex items-center py-2 px-6 rounded-lg transition-colors ${
            userReaction === 'likes' 
              ? 'bg-blue-500/20 border border-blue-500' 
              : 'hover:bg-muted border border-transparent hover:border-blue-500'
          }`}
          onClick={() => handleReaction('likes')}
        >
          <div className="relative">
            <BlurAvatar
              src="like.jpg"
              alt="J'aime"
              className="w-10 h-10 mr-3 rounded-full shadow-sm"
            />
            {currentReactions.likes > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {currentReactions.likes}
              </span>
            )}
          </div>
          <span className="font-medium">J'aime</span>
        </button>
        
        <button 
          className={`flex items-center py-2 px-6 rounded-lg transition-colors ${
            userReaction === 'dislikes' 
              ? 'bg-red-500/20 border border-red-500' 
              : 'hover:bg-muted border border-transparent hover:border-red-500'
          }`}
          onClick={() => handleReaction('dislikes')}
        >
          <div className="relative">
            <BlurAvatar
              src="dislike.jpg"
              alt="Je n'aime pas"
              className="w-10 h-10 mr-3 rounded-full shadow-sm"
            />
            {currentReactions.dislikes > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {currentReactions.dislikes}
              </span>
            )}
          </div>
          <span className="font-medium">Je n'aime pas</span>
        </button>
      </div>
    </article>
  );
}
