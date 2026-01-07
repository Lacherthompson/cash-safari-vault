declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type GAEventParams = {
  [key: string]: string | number | boolean | undefined;
};

export const trackEvent = (
  eventName: string,
  params?: GAEventParams
) => {
  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
};

// Vault Events
export const trackVaultCreated = (goalAmount: number, vaultName: string) => {
  trackEvent('vault_created', {
    goal_amount: goalAmount,
    vault_name: vaultName,
  });
};

// Savings Events
export const trackAmountChecked = (amount: number, vaultId: string) => {
  trackEvent('amount_checked', {
    amount,
    vault_id: vaultId,
  });
};

export const trackAmountUnchecked = (amount: number, vaultId: string) => {
  trackEvent('amount_unchecked', {
    amount,
    vault_id: vaultId,
  });
};

// Goal Events
export const trackGoalCompleted = (goalAmount: number, vaultName: string) => {
  trackEvent('goal_completed', {
    goal_amount: goalAmount,
    vault_name: vaultName,
  });
};
