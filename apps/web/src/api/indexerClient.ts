const indexerUrl = process.env.NEXT_PUBLIC_INDEXER_URL ?? "http://localhost:42069";

export type IndexerSummary = {
  recentMatches: unknown[];
  recentContests: unknown[];
  treasury: unknown | null;
};

export async function indexerGraphql<TData>(
  query: string,
  variables?: Record<string, unknown>,
  init?: RequestInit
): Promise<TData> {
  const response = await fetch(`${indexerUrl}/graphql`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...init?.headers
    },
    body: JSON.stringify({ query, variables }),
    ...init
  });

  if (!response.ok) {
    throw new Error(`Indexer GraphQL request failed with ${response.status}`);
  }

  const payload = (await response.json()) as { data?: TData; errors?: unknown[] };
  if (payload.errors?.length) {
    throw new Error("Indexer GraphQL returned errors");
  }

  if (!payload.data) {
    throw new Error("Indexer GraphQL returned no data");
  }

  return payload.data;
}

export async function getIndexerSummary(init?: RequestInit): Promise<IndexerSummary> {
  const response = await fetch(`${indexerUrl}/summary`, init);
  if (!response.ok) {
    throw new Error(`Indexer summary request failed with ${response.status}`);
  }
  return (await response.json()) as IndexerSummary;
}
