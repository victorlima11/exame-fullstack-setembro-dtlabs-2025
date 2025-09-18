import { Header } from "@/components/header/Header";
import React from "react";

interface PageLayoutProps {
  pageTitle: string;
  children: React.ReactNode;
}

export function PageLayout({ pageTitle, children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header currentPage={pageTitle} />
      <div className="container mx-auto px-4 py-8 space-y-8">
        {children}
      </div>
    </div>
  );
}
