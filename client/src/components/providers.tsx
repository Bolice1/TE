"use client";

import React, { useState } from "react";
import {
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import {
  PersistQueryClientProvider,
} from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { ToastContainer, useToast } from "./ui/toast";

const createQueryClient = (onError: (message: string) => void) =>
  new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if (error instanceof Error) {
          onError(error.message);
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        if (error instanceof Error) {
          onError(error.message);
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 30 * 60_000,
        retry: (failureCount, error) => {
          const status = typeof error === "object" && error && "status" in error
            ? Number((error as { status?: unknown }).status)
            : null;

          if (status !== null && status >= 400 && status < 500 && status !== 408 && status !== 429) {
            return false;
          }

          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: false,
        placeholderData: (previousData: unknown) => previousData,
        networkMode: "online",
      },
      mutations: {
        retry: 0,
        networkMode: "online",
      },
    },
  });

function QueryProvider({ children }: { children: React.ReactNode }) {
  const { error } = useToast();
  const [queryClient] = useState(() => createQueryClient((message) => error(message)));
  const [persister] = useState(() =>
    createSyncStoragePersister({
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      key: "te-react-query-cache",
      throttleTime: 1_000,
      serialize: (data) => JSON.stringify(data),
      deserialize: (data) => JSON.parse(data),
    })
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        buster: "te-cache-v2",
        maxAge: 24 * 60 * 60 * 1000,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => query.state.status === "success",
        },
      }}
      onSuccess={() => {
        queryClient.resumePausedMutations().catch(() => undefined);
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <QueryProvider>{children}</QueryProvider>
      <ToastContainer />
    </>
  );
}
