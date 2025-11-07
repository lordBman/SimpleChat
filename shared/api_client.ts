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
    }
    
    async request(endpoint: string, options: RequestInit = {}){
        const url = `${this.baseURL}${endpoint}`;
        const config = { ...this.options, ...options,
            headers: {
                ...this.options.headers, ...options.headers
            },
        };
        
        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
    
    get(endpoint: string, config: Omit<RequestInit, "body"> = {}) {
        return this.request(endpoint, { ...config });
    }
    
    post<T>(endpoint: string, config: InputData<T> = {}) {
        return this.request(endpoint, { ...config,
            method: 'POST', body: config.data ? JSON.stringify(config.data) : undefined
        });
    }

    patch<T>(endpoint: string, config: InputData<T> = {}) {
        return this.request(endpoint, {
            ...config,
            method: 'PATCH', body: config.data ? JSON.stringify(config.data) : undefined
        });
    }

    put<T>(endpoint: string, config: InputData<T> = {}) {
        return this.request(endpoint, { ...config,
            method: 'PUT', body: config.data ? JSON.stringify(config.data) : undefined
        });
    }

    delete<T>(endpoint: string, config: InputData<T> = {}) {
        return this.request(endpoint, { ...config,
            method: 'DELETE', body: config.data ? JSON.stringify(config.data) : undefined
        });
    }
}

export default APIClient;
