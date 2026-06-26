"use client";

import { useApp } from "@/context/AppContext";
import Saved from "@/components/pages/Saved";

export default function SavedPage() {
  const { savedSpaces, onSave, onOpen } = useApp();
  return <Saved saved={savedSpaces} onSave={onSave} onOpen={onOpen} />;
}
