"use client";

import SpaceCard from "@/components/user/SpaceCard";
import { Space } from "@/data/types";
import { Bookmark } from "lucide-react";

interface SavedProps {
  saved: Space[];
  onSave: (id: number) => void;
  onOpen: (space: Space) => void;
}

export default function Saved({ saved, onSave, onOpen }: SavedProps) {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Your shortlist.</h1>
      </div>

      {saved.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <Bookmark size={20} />
          </div>
          <div className="empty-h">No saved spaces yet</div>
          <div className="empty-p">Tap the bookmark on any space card to save it for later.</div>
        </div>
      ) : (
        <div className="space-grid">
          {saved.map((s) => (
            <SpaceCard key={s.id} space={s} saved={true} onSave={onSave} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  );
}
