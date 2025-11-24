type InputData<T> = Omit<RequestInit & { data?: T }, "body">;

class APIClient {
    baseURL: string;
    options: RequestInit; 
    
    constructor(baseURL: string, options: RequestInit = {}) {
        this.baseURL = baseURL;
        this.options = { ...options,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Credentials': 'true',
                ...options.headers
            },
        };

        console.log("connecting simple chat client with config:", this.options);
    }
    
    async request<T>(endpoint: string, options: RequestInit = { }){
        const url = `${this.baseURL}${endpoint}`;
        const config = { ...this.options, ...options,
            headers: {
                ...this.options.headers, ...options.headers
            },
        };
        
        console.log(`making request to ${endpoint} with config:`, this.options);
        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json() as T;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
    
    get<T>(endpoint: string, config: Omit<RequestInit, "body"> = {}) {
        return this.request<T>(endpoint, { ...config });
    }
    
    post<T, R>(endpoint: string, config: InputData<T> = {}) {
        return this.request<R>(endpoint, { ...config,
            method: 'POST', body: config.data ? JSON.stringify(config.data) : undefined
        });
    }

    patch<T, R>(endpoint: string, config: InputData<T> = {}) {
        return this.request<R>(endpoint, {
            ...config,
            method: 'PATCH', body: config.data ? JSON.stringify(config.data) : undefined
        });
    }

    put<T, R>(endpoint: string, config: InputData<T> = {}) {
        return this.request<R>(endpoint, { ...config,
            method: 'PUT', body: config.data ? JSON.stringify(config.data) : undefined
        });
    }

    delete<T, R>(endpoint: string, config: InputData<T> = {}) {
        return this.request<R>(endpoint, { ...config,
            method: 'DELETE', body: config.data ? JSON.stringify(config.data) : undefined
        });
    }
}

export default APIClient;
