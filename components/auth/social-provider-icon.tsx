type SocialProvider = "apple" | "facebook" | "google";

type SocialProviderIconProps = {
  className?: string;
  provider: SocialProvider;
};

export function SocialProviderIcon({ className, provider }: SocialProviderIconProps) {
  if (provider === "google") {
    return (
      <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
        <path fill="#FBBC05" d="M5.84 14.11a6.62 6.62 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z" />
        <path fill="#EA4335" d="M12 5.36c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.56 10.56 0 0 0 12 1 11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.29 9.14 5.36 12 5.36Z" />
      </svg>
    );
  }

  if (provider === "facebook") {
    return (
      <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
        <path fill="currentColor" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.08 24 18.09 24 12.07Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
      <path fill="currentColor" d="M16.9 12.62c-.03-2.73 2.23-4.05 2.33-4.11-1.27-1.86-3.25-2.12-3.95-2.15-1.68-.17-3.28.99-4.13.99-.85 0-2.16-.96-3.55-.93-1.83.03-3.52 1.06-4.46 2.7-1.9 3.3-.49 8.19 1.37 10.86.9 1.31 1.98 2.79 3.4 2.73 1.36-.05 1.87-.88 3.51-.88s2.1.88 3.54.85c1.46-.03 2.39-1.34 3.29-2.65 1.04-1.52 1.47-2.99 1.49-3.07-.03-.01-2.85-1.09-2.84-4.34ZM14.18 4.59c.75-.91 1.26-2.17 1.12-3.43-1.08.04-2.39.72-3.17 1.63-.69.8-1.3 2.08-1.14 3.31 1.2.09 2.44-.61 3.19-1.51Z" />
    </svg>
  );
}
