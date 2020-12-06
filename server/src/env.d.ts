declare namespace NodeJS {
  export interface ProcessEnv {
    DATABASE_URL: string;
    REDIS_URL: string;
    PORT: string;
    REDIS_SECRET: string;
    CORS_ORIGIN: string;
  }
}
