"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import CreateListing from "@/components/host/CreateListing";
import { useHost } from "@/context/HostContext";

export default function EditListingPage() {
  const params = useParams<{ id: string }>();
  const { beginEdit } = useHost();
  const id = Number(params.id);

  useEffect(() => {
    if (!Number.isNaN(id)) beginEdit(id);
  }, [id, beginEdit]);

  return <CreateListing />;
}
