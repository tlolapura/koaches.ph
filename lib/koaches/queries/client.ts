import { QueryCache, QueryClient } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      // Failed fetches otherwise render as empty data. Broadcast so the
      // portal toast provider can tell the user something didn't load.
      onError: () => {
        if (typeof window === "undefined") return;
        window.dispatchEvent(new CustomEvent("koaches-query-error"));
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 10 * 60_000,
        refetchOnWindowFocus: false,
        retry: 0,
      },
      mutations: { retry: 0 },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
