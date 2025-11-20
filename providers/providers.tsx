"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import {useState} from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </QueryClientProvider>
  );
}
