import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SuggestionItemProps {
  name: string;
  username: string;
  bio: string;
  avatar: string;
}

export function SuggestionItem({ name, username, bio, avatar }: SuggestionItemProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  
  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
  };
  
  return (
    <li className="flex items-center">
      <div className="w-12 h-12 rounded-lg overflow-hidden mr-3">
        <img 
          src={avatar} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{name}</div>
        <div className="text-muted-foreground text-xs truncate">{bio}</div>
      </div>
      <Button
        onClick={toggleFollow}
        className={isFollowing 
          ? "bg-card text-[var(--niney-purple)] border border-[var(--niney-purple)] text-sm px-3 py-1 rounded-full transition-colors"
          : "bg-[var(--niney-purple)] text-white text-sm px-3 py-1 rounded-full hover:bg-opacity-90 transition-colors"
        }
      >
        {isFollowing ? "Suivi" : "Suivre"}
      </Button>
    </li>
  );
}
