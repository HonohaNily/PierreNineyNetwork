import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp } from "lucide-react";
import { useNineyMode } from "@/hooks/use-niney-mode";

export function NineyClickGame() {
  const [isOpen, setIsOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [clicksPerSecond, setClicksPerSecond] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bestCPS, setBestCPS] = useState(() => {
    try {
      const saved = localStorage.getItem("nineyClickBestCPS");
      return saved ? parseFloat(saved) : 0;
    } catch {
      return 0;
    }
  });
  
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();
  const { setNineyMode, setNineyCounter } = useNineyMode();
  
  // Start game
  const startGame = () => {
    setIsPlaying(true);
    setClickCount(0);
    setClicksPerSecond(0);
    setTimeLeft(10);
    
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // End game
  const endGame = () => {
    setIsPlaying(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    const finalCPS = clickCount / 10;
    setClicksPerSecond(finalCPS);
    
    // Check if best score
    if (finalCPS > bestCPS) {
      setBestCPS(finalCPS);
      try {
        localStorage.setItem("nineyClickBestCPS", finalCPS.toString());
      } catch {
        // Ignore storage errors
      }
      
      toast({
        title: "Nouveau record!",
        description: `${finalCPS.toFixed(1)} clics par seconde!`,
      });
      
      // If really good, activate Niney mode as reward
      if (finalCPS > 5) {
        setNineyMode(true);
        setNineyCounter(prev => prev + 1);
        toast({
          title: "Mode Niney activé!",
          description: "Votre rapidité a impressionné Pierre Niney!",
        });
      }
    }
  };
  
  // Handle click during game
  const handleClick = () => {
    if (isPlaying) {
      setClickCount(prev => prev + 1);
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button 
          className="p-1 rounded hover:bg-muted/50 transition-colors relative"
          onClick={() => setIsOpen(true)}
        >
          <ThumbsUp className="h-4 w-4 text-muted-foreground hover:text-primary transition-all" />
          <span className="sr-only">Test de vitesse Niney</span>
          {bestCPS > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-xs rounded-full w-4 h-4 flex items-center justify-center text-white">
              !
            </span>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0">
        <div className="p-6">
          <DialogTitle className="text-center mb-6 text-2xl text-primary">
            Niney Speed Click!
          </DialogTitle>
          
          <div className="bg-primary/10 p-4 mb-4 rounded-md text-center">
            <div className="flex justify-between mb-4">
              <div className="font-bold">Clics: <span className="text-primary">{clickCount}</span></div>
              <div className="font-bold">Temps: <span className={timeLeft < 5 ? "text-destructive" : "text-primary"}>{timeLeft}s</span></div>
              <div className="font-bold">
                Record: <span className="text-primary">{bestCPS.toFixed(1)}</span> CPS
              </div>
            </div>
            
            {!isPlaying && (
              <Button 
                onClick={startGame} 
                className="bg-primary hover:bg-primary/90 text-white font-bold"
              >
                {clickCount > 0 ? "Recommencer" : "Démarrer"}
              </Button>
            )}
          </div>
          
          <div className="flex flex-col items-center">
            {isPlaying ? (
              <button
                onClick={handleClick}
                className="w-40 h-40 rounded-full flex items-center justify-center bg-primary hover:bg-primary/90 
                  text-white text-xl font-bold transition-transform active:scale-95 cursor-pointer"
              >
                CLIQUEZ!
              </button>
            ) : clickCount > 0 ? (
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  <span className="text-primary">{clicksPerSecond.toFixed(1)}</span> CPS
                </div>
                <p className="mb-4">Clics par seconde</p>
                
                {clicksPerSecond >= 5 && (
                  <Badge className="mb-4 px-3 py-1 bg-primary text-white">
                    Mode Niney débloqué!
                  </Badge>
                )}
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="mb-3">Cliquez le plus rapidement possible pendant 10 secondes pour tester votre vitesse!</p>
                <p className="text-sm text-muted-foreground italic">
                  Si vous cliquez assez vite, vous pourriez activer le mode Niney...
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}