"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Auth from "@/components/auth/Auth";

export default function LoginPage() {
  const { auth } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (auth) router.replace("/explore");
  }, [auth, router]);

  return <Auth mode="login" />;
}
