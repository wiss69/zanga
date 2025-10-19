export const cacheKeys = {
  fx: (base: string) => `fx:${base.toUpperCase()}`,
  countries: 'countries:all',
  trade: (hash: string) => `trade:${hash}`,
  taric: (code: string) => `taric:${code}`,
  weather: (location: string) => `weather:${location}`
};
