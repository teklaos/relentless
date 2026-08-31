import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Mic,
  Camera,
  Music,
  Headphones,
  Maximize2,
  Volume2,
  Wifi,
  Wind,
  Car,
  Shield,
  Flower2,
  Palette,
  Presentation,
  Projector,
  Sun,
  Flame,
  Coffee,
  Tv,
  PencilRuler,
  Drum,
  Clapperboard,
  Lock,
  Cctv,
  Check
} from "lucide-react";

export const CAT_ICON_COMPONENT: Record<number, LucideIcon> = {
  1: Activity,
  2: Mic,
  3: Headphones,
  4: Camera,
  5: Flower2,
  6: Music,
  7: Presentation,
  8: Palette
};

export const CAT_ICON_FALLBACK: LucideIcon = Activity;

export const AMEN_ICON_COMPONENT: Record<string, LucideIcon> = {
  "Wi-Fi": Wifi,
  "Air Conditioning": Wind,
  Parking: Car,
  Mirror: Maximize2,
  "Sound System": Volume2,
  Projector: Projector,
  Soundproofing: Shield,
  "Natural Light": Sun,
  Piano: Music,
  Heating: Flame,
  "Coffee Machine": Coffee,
  "Smart TV": Tv,
  Whiteboard: PencilRuler,
  "Drum Kit": Drum,
  "Green Screen": Clapperboard,
  Lockers: Lock,
  "Security Cameras": Cctv,
  _fallback: Check
};
