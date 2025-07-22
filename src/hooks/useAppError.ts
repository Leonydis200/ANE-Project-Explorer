import { useState } from 'react';

export const useAppError = () => {
  const [error, setError] = useState<Error | null>(null);
  return { error, setError };
};