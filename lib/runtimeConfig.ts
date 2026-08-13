// Config that arrives when the container starts (ECS task definition), not when
// the image is built.
//
// NEXT_PUBLIC_* cannot do this: `next build` inlines those values straight into
// the JS bundle, so they are frozen at image-build time and can never see a task
// definition's environment. Instead the root layout reads process.env on the
// server at request time and ships the result to the browser as window.__ENV.
//
// The payoff is one image promoted unchanged through dev -> staging -> prod,
// with only the task definition differing.

export interface RuntimeConfig {
  apiUrl: string;
  todoApiUrl: string;
}

declare global {
  interface Window {
    __ENV?: Partial<RuntimeConfig>;
  }
}

const DEFAULTS: RuntimeConfig = {
  apiUrl: 'http://localhost:5000/api',
  todoApiUrl: 'http://localhost:5001/api',
};

// Server side only. Called by the root layout after `await connection()`, which
// is what makes this read happen per request rather than during the build.
export const readServerRuntimeConfig = (): RuntimeConfig => ({
  apiUrl: process.env.API_URL || DEFAULTS.apiUrl,
  todoApiUrl: process.env.TODO_API_URL || DEFAULTS.todoApiUrl,
});

// `</script>` inside a value would otherwise close the tag early.
export const serializeRuntimeConfig = (config: RuntimeConfig): string =>
  `window.__ENV=${JSON.stringify(config).replace(/</g, '\\u003c')};`;

// Read lazily on every call rather than into a module-level const, so module
// import order can never race the inline script the layout renders.
export const getRuntimeConfig = (): RuntimeConfig => {
  if (typeof window === 'undefined') return readServerRuntimeConfig();

  return { ...DEFAULTS, ...window.__ENV };
};

export const getApiUrl = (): string => getRuntimeConfig().apiUrl;

export const getTodoApiUrl = (): string => getRuntimeConfig().todoApiUrl;
