"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import HostRegister from "@/components/shared/HostRegister";

export default function HostRegisterPage() {
  const { auth } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (auth) router.replace("/explore");
  }, [auth, router]);

  return <HostRegister />;
}
