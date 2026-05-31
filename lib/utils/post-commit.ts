export async function safePostCommit(action: () => Promise<void> | void, label: string) {
  try {
    await action();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error(`Post-commit step failed: ${label}`, error);
    }
  }
}
