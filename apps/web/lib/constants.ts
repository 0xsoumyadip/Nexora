export const APP_NAME = "Nexora";
export const routes = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  documents: "/documents",
  newDocument: "/documents/new",
  document: (id: string) => `/documents/${id}`,
};
