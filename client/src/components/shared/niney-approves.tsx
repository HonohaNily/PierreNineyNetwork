import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface NineyApprovesProps {
  className?: string;
}

export function NineyApproves({ className }: NineyApprovesProps) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    // Show Niney Approves animation randomly
    const intervalId = setInterval(() => {
      const shouldShow = Math.random() < 0.3; // 30% chance
      if (shouldShow) {
        setVisible(true);
        
        // Hide after 3 seconds
        setTimeout(() => {
          setVisible(false);
        }, 3000);
      }
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  if (!visible) return null;
  
  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      <div className="bg-white rounded-full shadow-lg p-3 flex items-center">
        <div className="w-8 h-8 rounded-full bg-[var(--niney-blue)] flex items-center justify-center text-white mr-2">
          <i className="fas fa-check"></i>
        </div>
        <div className="font-display text-[var(--niney-blue)]">Niney Approves!</div>
      </div>
    </div>
  );
}

export function NineyApprovesBadge() {
  return (
    <div className="absolute -top-2 -right-2 bg-[var(--status-green)] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center niney-approves" title="Niney Approves!">
      <i className="fas fa-check"></i>
    </div>
  );
}
