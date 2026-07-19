"use client";

import { useApp } from "@/context/AppContext";
import Saved from "@/components/user/Saved";

export default function SavedPage() {
  const { savedSpaces, onSave, onOpen } = useApp();
  return <Saved saved={savedSpaces} onSave={onSave} onOpen={onOpen} />;
}
