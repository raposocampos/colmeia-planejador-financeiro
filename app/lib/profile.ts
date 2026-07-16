export interface AppUserProfile {
  id: string;
  name: string;
  email: string;
  emailConfirmed: boolean;
  providers: string[];
  createdAt: string;
  onboardingCompletedAt: string | null;
}
