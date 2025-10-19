export interface FxRate {
  base: string;
  date: string;
  rates: Record<string, number>;
  source: 'ECB' | 'EXCHANGERATE_HOST';
}

export interface CountrySummary {
  code: string;
  name: string;
  region: string;
  capital?: string;
  languages: string[];
  currencies: { code: string; name: string; symbol?: string }[];
  vat?: number;
}

export interface TradeSeries {
  reporter: string;
  partner: string;
  flow: 'import' | 'export';
  period: string;
  hs: string;
  value: number;
  qty?: number;
}

export interface TradeResponse {
  series: TradeSeries[];
  totals: {
    value: number;
    qty?: number;
  };
}

export interface WeatherInfo {
  location: string;
  temperature: number;
  condition: string;
  windSpeed: number;
  updatedAt: string;
}
