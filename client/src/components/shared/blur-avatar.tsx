import { cn } from "@/lib/utils";

// Import dynamique des images des assets
import Abdos from "@assets/Abdos.png";
import ENILV from "@assets/ENILV.jpg";
import Fave from "@assets/Favé.png";
import Seduire from "@assets/Séduire.png";
import Design from "@assets/design.jpeg";
import Like from "@assets/like.jpg";
import Dislike from "@assets/dislike.jpg";
import Image1 from "@assets/image_1743428476401.png";
import Image2 from "@assets/image_1743428505477.png";
import Image3 from "@assets/image_1743447513390.png";

// Mapping des noms de fichiers aux imports
const assetMap: Record<string, string> = {
  "Abdos.png": Abdos,
  "ENILV.jpg": ENILV,
  "Favé.png": Fave,
  "Séduire.png": Seduire,
  "design.jpeg": Design,
  "like.jpg": Like,
  "dislike.jpg": Dislike,
  "image_1743428476401.png": Image1,
  "image_1743428505477.png": Image2,
  "image_1743447513390.png": Image3
};

interface BlurAvatarProps {
  src: string;
  alt: string;
  className?: string;
}

export function BlurAvatar({ src, alt, className }: BlurAvatarProps) {
  // Déterminer la source de l'image
  let imageSrc = src;
  
  // Si c'est une image des assets
  if (assetMap[src]) {
    imageSrc = assetMap[src];
  } else if (!src.startsWith("http") && !src.startsWith("/")) {
    // Si c'est un chemin relatif sans / au début
    imageSrc = `/${src}`;
  }
  
  return (
    <div className={cn("overflow-hidden", className)}>
      <img src={imageSrc} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
}
