import type { Context } from 'react';
import { createContext as createReactContext, useContext as useReactContext } from 'react';

interface CreateContextOptions<T> {
  strict?: boolean;
  hookName?: string;
  providerName?: string;
  errorMessage?: string;
  name?: string;
  defaultValue?: T;
}

type CreateContextReturn<T> = [React.Provider<T>, () => T, Context<T>];

export function getErrorMessage(hook: string, provider: string) {
  return `${hook}는 반드시 ${provider} 안에서 사용되어야 합니다.`;
}

export function createContext<T>(options: CreateContextOptions<T> = {}) {
  const { name, strict = true, hookName = 'useContext', providerName = 'Provider', errorMessage, defaultValue } = options;

  const Context = createReactContext<T | undefined>(defaultValue);
  Context.displayName = name;

  function useContext() {
    const context = useReactContext(Context);

    if (!context && strict) {
      const error = new Error(errorMessage ?? getErrorMessage(hookName, providerName));
      error.name = 'ContextError';
      if (Error.captureStackTrace) {
        Error.captureStackTrace(error, useContext);
      }
      throw error;
    }

    return context;
  }

  return [Context.Provider, useContext, Context] as CreateContextReturn<T>;
}
