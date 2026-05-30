import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Mic,
  Camera,
  Target,
  Music,
  Headphones,
  Maximize2,
  Ruler,
  Volume2,
  Wifi,
  Wind,
  Car,
  Shield,
  Lightbulb,
  Truck,
  Lock,
  Check,
} from "lucide-react";

export const CAT_ICON_COMPONENT: Record<number, LucideIcon> = {
  1: Activity,
  2: Mic,
  3: Camera,
  4: Target,
  5: Music,
  6: Headphones,
};

export const CAT_ICON_FALLBACK: LucideIcon = Activity;

export const AMEN_ICON_COMPONENT: Record<string, LucideIcon> = {
  Mirrors: Maximize2,
  "Sprung Floor": Ruler,
  "Hardwood Floor": Ruler,
  "Sound System": Volume2,
  Piano: Music,
  "Wi-Fi": Wifi,
  "Air Conditioning": Wind,
  Parking: Car,
  Soundproofing: Shield,
  Cyclorama: Camera,
  "Pro Lighting": Lightbulb,
  Stage: Mic,
  Backline: Music,
  "Loading Dock": Truck,
  Lockers: Lock,
  _fallback: Check,
};
