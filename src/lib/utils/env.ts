function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
}

export const env = {
  ecbUrl: process.env.ECB_URL ?? 'https://data.ecb.europa.eu/data/datasets/EXR/M.USD.EUR.SP00.A',
  exchangeRateUrl: process.env.EXCHANGERATE_HOST_URL ?? 'https://api.exchangerate.host/latest',
  restCountriesUrl: process.env.RESTCOUNTRIES_URL ?? 'https://restcountries.com/v3.1/all',
  openMeteoUrl: process.env.OPENMETEO_URL ?? 'https://api.open-meteo.com/v1/forecast',
  taricUrl: process.env.TARIC_URL ?? 'https://ec.europa.eu/taxation_customs/dds2/taric/taric_consultation.jsp?Lang=en',
  viesUrl: process.env.VIES_URL ?? 'https://ec.europa.eu/taxation_customs/vies/services/checkVatService',
  comtradePrimaryKey: process.env.COMTRADE_PRIMARY_KEY,
  comtradeSecondaryKey: process.env.COMTRADE_SECONDARY_KEY,
  nextAuthSecret: process.env.NEXTAUTH_SECRET,
  redisUrl: process.env.REDIS_URL,
  databaseUrl: process.env.DATABASE_URL ?? 'file:./db.sqlite',
  requireEnv
};
