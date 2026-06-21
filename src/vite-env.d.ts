/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_PROXY_TARGET?: string;
  readonly VITE_HELPLINE_NUMBER?: string;
  readonly VITE_GRIEVANCE_OFFICER_NAME?: string;
  readonly VITE_GRIEVANCE_OFFICER_DESIGNATION?: string;
  readonly VITE_GRIEVANCE_OFFICER_EMAIL?: string;
  readonly VITE_GRIEVANCE_OFFICER_PHONE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
