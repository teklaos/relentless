"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import Explore from "@/components/user/Explore";
import { Space, Category } from "@/data/types";
import { fetchSpaces, fetchCategories } from "@/lib/api";

export default function ExplorePage() {
  const { savedIds, onSave, onOpen } = useApp();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([fetchSpaces(), fetchCategories()])
      .then(([spaceData, categoryData]) => {
        if (active) {
          setSpaces(spaceData);
          setCategories(categoryData);
          setError(null);
        }
      })
      .catch((e) => {
        if (active) {
          setError(e.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Explore
      spaces={spaces}
      categories={categories}
      loading={loading}
      error={error}
      savedIds={savedIds}
      onSave={onSave}
      onOpen={onOpen}
      initialFilter={null}
    />
  );
}
