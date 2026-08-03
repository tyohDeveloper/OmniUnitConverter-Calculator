type TestIdProps = { 'data-testid': string };

/**
 * Emit a data-testid attribute in every environment.
 *
 * Council-05: previously this helper stripped its output in production
 * so IDs never reached the shipped single-file artifact. That broke the
 * stated standard "every UI object should have a unique identifier for
 * UI testing" (architecture-standards §4.1, §4.4). The bundle-size cost
 * for the current ~80 IDs is < 500 B post-gzip against a 460 kB
 * baseline — well within the §13.2 runtime budget.
 */
export const testId = (id: string): TestIdProps => ({ 'data-testid': id });

export const devOnly = <T>(value: T): T | undefined => {
  if (import.meta.env.DEV) {
    return value;
  }
  return undefined;
};
