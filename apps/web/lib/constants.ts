export const APP_NAME = "Docly";
export const CURRENT_USER_ID = "user_alex";
export const routes = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  documents: "/documents",
  newDocument: "/documents/new",
  document: (id: string) => `/documents/${id}`,
};
