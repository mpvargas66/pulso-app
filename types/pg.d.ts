declare module 'pg' {
  export interface PoolConfig {
    connectionString?: string;
    ssl?: any;
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    password?: string;
  }

  export class Pool {
    constructor(config?: PoolConfig);
    connect(): Promise<any>;
    query<T = any>(text: string, values?: any[]): Promise<QueryResult<T>>;
    end(): Promise<void>;
    on(event: string, listener: (...args: any[]) => void): this;
  }

  export interface QueryResult<T = any> {
    rows: T[];
    command: string;
    rowCount: number | null;
  }
}
