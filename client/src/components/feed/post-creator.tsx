import { BlurAvatar } from "@/components/shared/blur-avatar";
import { Button } from "@/components/ui/button";
import { generateRandomBlurredAvatar } from "@/lib/utils";
import { useState } from "react";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface PostCreatorProps {
  onPostCreated?: () => void;
}

export function PostCreator({ onPostCreated }: PostCreatorProps) {
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleCreatePost = async () => {
    if (!content.trim()) return;
    
    try {
      await apiRequest("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content })
      });
      
      setContent("");
      setIsExpanded(false);
      onPostCreated?.();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };
  
  return (
    <div className="bg-card text-card-foreground rounded-xl shadow-md p-4 mb-6 border border-border">
      <div className="flex space-x-4">
        <BlurAvatar
          src={generateRandomBlurredAvatar()}
          alt="Votre avatar flou"
          className="w-10 h-10 rounded-full bg-muted overflow-hidden"
        />
        <div className="flex-1">
          {isExpanded ? (
            <div className="space-y-3">
              <textarea
                className="bg-muted rounded-xl px-4 py-2 w-full min-h-[100px] text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--niney-purple)]"
                placeholder="Pierre Niney a dit..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setIsExpanded(false)}
                  className="text-muted-foreground"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleCreatePost}
                  className="bg-[var(--niney-purple)] text-white"
                  disabled={!content.trim()}
                >
                  Publier
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div 
                className="bg-muted rounded-full px-4 py-2 cursor-pointer hover:bg-neutral-light transition-colors"
                onClick={() => setIsExpanded(true)}
              >
                <span className="text-muted-foreground">Pierre Niney a dit...</span>
              </div>
              <div className="flex justify-between mt-3">
                <button className="flex items-center text-muted-foreground text-sm hover:text-foreground">
                  <i className="fas fa-image mr-2"></i>
                  <span>Photo</span>
                </button>
                <button className="flex items-center text-muted-foreground text-sm hover:text-foreground">
                  <i className="fas fa-film mr-2"></i>
                  <span>Vidéo</span>
                </button>
                <button className="flex items-center text-muted-foreground text-sm hover:text-foreground">
                  <i className="fas fa-quote-right mr-2"></i>
                  <span>Citation</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
