import { BlurAvatar } from "@/components/shared/blur-avatar";
import { SuggestionItem } from "@/components/feed/suggestion-item";
import { Button } from "@/components/ui/button";
import { FICTIONAL_USERS, TRENDING_QUOTES } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { generateRandomBlurredAvatar } from "@/lib/utils";

export function RightSidebar() {
  const { data: suggestions = [] } = useQuery({
    queryKey: ['/api/suggestions'],
  });

  return (
    <aside className="hidden md:block md:w-2/5 lg:w-1/4 p-4 sticky top-0 h-screen overflow-y-auto">
      {/* User Stats */}
      <div className="bg-card text-card-foreground rounded-xl shadow-md p-4 mb-6 border border-border">
        <div className="flex items-center mb-4">
          <BlurAvatar 
            src={generateRandomBlurredAvatar()}
            alt="Votre avatar flou"
            className="w-16 h-16 rounded-full bg-muted mr-4"
          />
          <div>
            <div className="font-semibold text-lg">Votre Niney</div>
            <div className="text-muted-foreground">@votreNiney</div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center mb-2">
          <div className="bg-muted p-2 rounded-lg">
            <div className="text-[var(--niney-purple)] font-bold">73%</div>
            <div className="text-xs text-muted-foreground">Potentiel Niney</div>
          </div>
          <div className="bg-muted p-2 rounded-lg">
            <div className="text-[var(--niney-purple)] font-bold">12h</div>
            <div className="text-xs text-muted-foreground">Sous l'œil de Niney</div>
          </div>
          <div className="bg-muted p-2 rounded-lg">
            <div className="text-[var(--niney-purple)] font-bold">83</div>
            <div className="text-xs text-muted-foreground">Citations absurdes</div>
          </div>
        </div>
        
        <div className="text-center mt-4">
          <Button className="bg-[var(--niney-purple)] hover:bg-opacity-90 text-white px-4 py-2 rounded-lg w-full transition-colors">
            Complétez votre profil
          </Button>
        </div>
      </div>
      
      {/* Trending Quotes */}
      <div className="bg-card text-card-foreground rounded-xl shadow-md p-4 mb-6 border border-border">
        <h3 className="font-display text-lg font-semibold mb-3">Citations en vogue</h3>
        <ul className="space-y-3">
          {TRENDING_QUOTES.map((quote) => (
            <li key={quote.id} className="flex space-x-2">
              <span className="text-[var(--niney-purple)]">{quote.rank}</span>
              <p className="text-sm">{quote.quote}</p>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Suggestions to Follow */}
      <div className="bg-card text-card-foreground rounded-xl shadow-md p-4 border border-border">
        <h3 className="font-display text-lg font-semibold mb-3">Suggestions à suivre</h3>
        <ul className="space-y-4">
          {FICTIONAL_USERS.map((user) => (
            <SuggestionItem 
              key={user.id}
              name={user.name}
              username={user.username}
              bio={user.bio}
              avatar={user.avatar}
            />
          ))}
        </ul>
        
        <div className="mt-3 text-center">
          <a href="#" className="text-[var(--niney-purple)] text-sm font-medium hover:underline">Voir plus</a>
        </div>
      </div>
    </aside>
  );
}
