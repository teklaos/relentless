"use client";

import { useEffect } from "react";
import CreateListing from "@/components/host/CreateListing";
import { useHost } from "@/context/HostContext";

export default function NewListingPage() {
  const { beginCreate } = useHost();

  useEffect(() => {
    beginCreate();
  }, [beginCreate]);

  return <CreateListing />;
}
