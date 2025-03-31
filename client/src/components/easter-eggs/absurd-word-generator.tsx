import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Shuffle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ABSURD_QUOTES } from "@/lib/constants";

// Arrays of word parts for generating absurd words
const prefixes = [
  "Trala", "Burba", "Shimpa", "Bomba", "Liri", "Tung", "Krok", "Blip", "Zinga", "Whoop", 
  "Florp", "Glim", "Squee", "Blurp", "Thwip", "Zang", "Plink", "Splar", "Gurgle", "Fratz"
];

const middles = [
  "lelo", "loni", "zinni", "diro", "li", "tung", "odilo", "ble", "zam", "ribo", 
  "pizazz", "boop", "squish", "wonk", "zoop", "flap", "doodle", "noodle", "wizzle", "morf"
];

const suffixes = [
  "Tralala", "Luliloli", "Bananinni", "Crocodilo", "Larila", "sahur", "Zippity", "Doo", "Zaboing", "Splat", 
  "McFluff", "Zazz", "Zonk", "Kablooey", "Palooza", "Whizzle", "Boing", "Wigwam", "Kerplunk", "Wazoo"
];

export function AbsurdWordGenerator() {
  const [generatedName, setGeneratedName] = useState("");
  const [savedNames, setSavedNames] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("absurdSavedNames");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [randomQuote, setRandomQuote] = useState("");
  const { toast } = useToast();

  // Generate a random absurd name
  const generateName = () => {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const middle = middles[Math.floor(Math.random() * middles.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    const newName = `${prefix}${middle} ${suffix}`;
    setGeneratedName(newName);
    
    // Also generate a random quote
    const quoteIndex = Math.floor(Math.random() * ABSURD_QUOTES.length);
    setRandomQuote(ABSURD_QUOTES[quoteIndex]);
  };
  
  // Save the currently generated name
  const saveName = () => {
    if (!generatedName) return;
    
    const newSavedNames = [...savedNames, generatedName];
    setSavedNames(newSavedNames);
    
    try {
      localStorage.setItem("absurdSavedNames", JSON.stringify(newSavedNames));
    } catch {
      // Ignore storage errors
    }
    
    toast({
      title: "Nom sauvegardé!",
      description: `${generatedName} a été ajouté à votre collection.`,
    });
  };
  
  // Remove a saved name
  const removeName = (index: number) => {
    const newSavedNames = [...savedNames];
    newSavedNames.splice(index, 1);
    setSavedNames(newSavedNames);
    
    try {
      localStorage.setItem("absurdSavedNames", JSON.stringify(newSavedNames));
    } catch {
      // Ignore storage errors
    }
  };
  
  // Copy name to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copié!",
        description: "Le nom a été copié dans le presse-papier.",
      });
    }).catch(() => {
      toast({
        title: "Erreur",
        description: "Impossible de copier le texte.",
        variant: "destructive"
      });
    });
  };
  
  // Generate a name on first render
  useEffect(() => {
    generateName();
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Sparkles className="h-5 w-5 text-muted-foreground hover:text-absurd-amber" />
          <span className="sr-only">Générateur de noms absurdes</span>
          {savedNames.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-absurd-amber text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {savedNames.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0">
        <div className="p-6">
          <DialogTitle className="text-center mb-6 text-2xl text-absurd-amber">
            Générateur de Noms Absurdes
          </DialogTitle>
          
          <div className="bg-accent/20 p-4 mb-4 rounded-md">
            <div className="text-center mb-2">
              <h3 className="text-xl font-bold mb-4">{generatedName || "Cliquez sur Générer"}</h3>
              
              <div className="flex justify-center gap-2 mb-4">
                <Button 
                  onClick={generateName}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Shuffle className="h-4 w-4 mr-1" /> Générer
                </Button>
                
                <Button 
                  onClick={saveName} 
                  size="sm"
                  variant="outline"
                  disabled={!generatedName}
                >
                  Sauvegarder
                </Button>
                
                <Button
                  onClick={() => copyToClipboard(generatedName)}
                  size="sm"
                  variant="ghost"
                  disabled={!generatedName}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {randomQuote && (
              <div className="text-sm italic text-muted-foreground bg-background/50 p-2 rounded">
                "{randomQuote}"
              </div>
            )}
          </div>
          
          {savedNames.length > 0 && (
            <div>
              <h3 className="font-bold mb-2">Vos noms sauvegardés:</h3>
              <div className="max-h-[200px] overflow-y-auto">
                {savedNames.map((name, index) => (
                  <div key={index} className="flex justify-between items-center p-2 odd:bg-muted/20 rounded mb-1">
                    <span>{name}</span>
                    <div className="flex gap-1">
                      <Button 
                        onClick={() => copyToClipboard(name)} 
                        size="sm" 
                        variant="ghost"
                        className="h-7 w-7 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button 
                        onClick={() => removeName(index)} 
                        size="sm" 
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}