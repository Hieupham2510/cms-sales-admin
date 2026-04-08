export type AppRole = "admin" | "manager" | "staff";

export type AuthStore = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
};

export type AuthContext = {
  userId: string;
  profileId: string;
  username: string;
  fullName: string | null;
  email: string;
  role: AppRole;
  activeStoreId: string | null;
  allowedStores: AuthStore[];
};
