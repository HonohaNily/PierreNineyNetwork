import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bug, BugPlay } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CrocodilePosition {
  left: number;
  top: number;
  visible: boolean;
  id: number;
}

export function CrocodileWhackGame() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [crocodiles, setCrocodiles] = useState<CrocodilePosition[]>([]);
  const [highScore, setHighScore] = useState(() => {
    // Try to get high score from localStorage
    try {
      const saved = localStorage.getItem("crocodileWhackHighScore");
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const crocodileTimerRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Start game
  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(30);
    setCrocodiles([]);
    
    // Start countdown
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Start spawning crocodiles
    spawnCrocodiles();
  };
  
  // End game
  const endGame = () => {
    setIsPlaying(false);
    
    // Clear timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (crocodileTimerRef.current) {
      clearInterval(crocodileTimerRef.current);
      crocodileTimerRef.current = null;
    }
    
    // Check if high score
    if (score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem("crocodileWhackHighScore", score.toString());
      } catch {
        // Ignore storage errors
      }
      toast({
        title: "Nouveau record!",
        description: `Vous avez établi un nouveau record : ${score} insectes!`,
      });
    }
  };
  
  // Spawn crocodiles periodically
  const spawnCrocodiles = () => {
    if (crocodileTimerRef.current) {
      clearInterval(crocodileTimerRef.current);
    }
    
    crocodileTimerRef.current = window.setInterval(() => {
      if (gameAreaRef.current) {
        const gameArea = gameAreaRef.current;
        const maxWidth = gameArea.offsetWidth - 50;
        const maxHeight = gameArea.offsetHeight - 50;
        
        // Add a new crocodile at random position
        setCrocodiles(prev => {
          const newCrocodiles = [...prev];
          
          // Limit max crocodiles on screen
          if (newCrocodiles.length > 5) {
            newCrocodiles.shift(); // Remove oldest
          }
          
          // Add new one
          newCrocodiles.push({
            left: Math.random() * maxWidth,
            top: Math.random() * maxHeight,
            visible: true,
            id: Date.now()
          });
          
          return newCrocodiles;
        });
      }
    }, 800); // Spawn every 800ms
  };
  
  // Click handler for whacking a crocodile
  const whackCrocodile = (id: number) => {
    if (!isPlaying) return;
    
    setCrocodiles(prev => prev.filter(croc => croc.id !== id));
    setScore(prev => prev + 1);
    
    // Add time bonus
    if (score % 5 === 0) {
      setTimeLeft(prev => prev + 2);
      toast({
        title: "Bonus de temps!",
        description: "+2 secondes",
      });
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (crocodileTimerRef.current) clearInterval(crocodileTimerRef.current);
    };
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bug className="h-5 w-5 text-muted-foreground hover:text-primary" />
          <span className="sr-only">Jeu de l'Insecte</span>
          {highScore > 0 && (
            <span className="absolute -top-2 -right-2 bg-absurd-amber text-xs rounded-full w-4 h-4 flex items-center justify-center">
              !
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] p-0">
        <div className="p-6">
          <DialogTitle className="text-center mb-6 text-2xl text-absurd-amber">
            Whack-a-Bug!
          </DialogTitle>
          
          <div className="bg-accent/20 p-4 mb-4 rounded-md text-center">
            <div className="flex justify-between mb-4">
              <div className="font-bold">Score: <span className="text-absurd-amber">{score}</span></div>
              <div className="font-bold">Temps: <span className={timeLeft < 10 ? "text-destructive" : "text-absurd-amber"}>{timeLeft}s</span></div>
              <div className="font-bold">Record: <span className="text-primary">{highScore}</span></div>
            </div>
            
            {!isPlaying && (
              <Button 
                onClick={startGame} 
                className="bg-absurd-amber hover:bg-absurd-amber/90 text-black font-bold"
              >
                {score > 0 ? "Rejouer" : "Commencer"}
              </Button>
            )}
          </div>
          
          <div 
            ref={gameAreaRef} 
            className="relative h-[300px] border-2 border-dashed border-muted rounded-lg overflow-hidden"
            style={{ backgroundColor: isPlaying ? "hsl(var(--muted))" : "transparent" }}
          >
            {!isPlaying && score === 0 && (
              <div className="h-full flex items-center justify-center flex-col p-4">
                <p className="text-center mb-2">Cliquez sur les insectes qui apparaissent aussi vite que possible!</p>
                <p className="text-xs text-muted-foreground italic text-center">
                  C'est absurde, mais ces insectes sont en réalité des acteurs en costume. Aucun insecte n'a été blessé.
                </p>
              </div>
            )}
            
            {crocodiles.map(croc => (
              <button
                key={croc.id}
                onClick={() => whackCrocodile(croc.id)}
                className="absolute w-12 h-12 flex items-center justify-center bg-transparent cursor-pointer transition-transform hover:scale-125"
                style={{ 
                  left: `${croc.left}px`, 
                  top: `${croc.top}px`,
                  animation: 'crocodile-pop 0.8s ease-out'
                }}
              >
                <BugPlay className="h-10 w-10 text-absurd-amber" />
              </button>
            ))}
            
            {!isPlaying && score > 0 && (
              <div className="absolute inset-0 flex items-center justify-center flex-col bg-black/50">
                <h3 className="text-2xl font-bold mb-2">Jeu terminé!</h3>
                <p className="mb-4">Score final: <span className="text-absurd-amber font-bold text-xl">{score}</span></p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}