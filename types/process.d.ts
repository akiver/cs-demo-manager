declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LOG_DATABASE_QUERIES: boolean;
      PROCESS_NAME: string;
      STEAM_API_KEYS: string;
      FACEIT_API_KEY: string;
      VITE_DEV_SERVER_URL: string;
    }
  }
}

export {};
