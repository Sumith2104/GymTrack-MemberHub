import 'server-only';

export class FluxClient {
    private apiUrl: string;
    private apiKey: string | undefined;
    private projectId: string | undefined;

    constructor() {
        let rawUrl = process.env.NEXT_PUBLIC_FLUX_API_URL || process.env.FLUXBASE_BASE_URL || process.env.FLUX_API_URL || 'https://fluxbasedb.me';
        // Remove www. from fluxbasedb.me domain to prevent 301 redirect which turns POST into GET (405 Method Not Allowed)
        rawUrl = rawUrl.replace('://www.fluxbasedb.me', '://fluxbasedb.me');
        const cleanUrl = rawUrl.replace(/\/$/, '');
        this.apiUrl = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;

        this.apiKey = process.env.FLUXBASE_API_KEY || process.env.FLUX_API_KEY;
        this.projectId = process.env.FLUXBASE_PROJECT_ID || process.env.FLUX_PROJECT_ID;

        if (!this.apiKey) {
            console.warn("⚠️ FLUXBASE_API_KEY is missing from environment variables.");
        }
        if (!this.projectId) {
            console.warn("⚠️ FLUXBASE_PROJECT_ID is missing from environment variables.");
        }
    }

    private async executeFetch(query: string, params: any[] = []) {
        const endpoint = `${this.apiUrl}/execute-sql`;
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                query: query,
                projectId: this.projectId,
                params: params
            }),
            cache: 'no-store'
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Fluxbase API Error (${res.status}): ${errText}`);
        }

        const data = await res.json();

        // Check if Fluxbase returned an application-level SQL error
        if (data.success === false || data.error) {
            const msg = data.error?.message || data.error || 'SQL query execution failed';
            throw new Error(`Fluxbase SQL Error: ${msg}`);
        }

        // Standardize return format
        if (data.result && Array.isArray(data.result.rows)) {
            return data.result;
        }

        if (data.rows) {
            return data;
        }

        return { rows: [], columns: [] };
    }

    /**
     * Executes a SQL query against the Hosted Fluxbase API.
     * @param query The SQL query to execute
     * @param scope Optional scope string (ignored in single-project hosted mode)
     */
    public async sql(query: string, scope?: string) {
        if (!this.apiKey || !this.projectId) {
            throw new Error("Fluxbase credentials missing. Check .env file.");
        }

        try {
            const isSelect = query.trim().toUpperCase().startsWith('SELECT');

            if (isSelect) {
                // Using dynamic require to prevent client-side bundle issues if imported incorrectly
                const { unstable_cache } = require('next/cache');

                // Cache SELECT queries for 30 seconds to massively improve performance
                const cachedQuery = unstable_cache(
                    async () => this.executeFetch(query),
                    // Cache key relies on the exact query and project ID
                    ['flux-query', this.projectId, query],
                    { revalidate: 30 }
                );

                return await cachedQuery();
            }

            // Mutations (INSERT, UPDATE, DELETE) bypass the cache completely
            return await this.executeFetch(query);

        } catch (error) {
            console.error("FluxClient Request Failed:", error);
            throw error;
        }
    }
}

export const flux = new FluxClient();
