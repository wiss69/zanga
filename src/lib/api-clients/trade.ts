export type TradeParams = {
  hs: string;
  reporter: string;
  partner?: string;
  flow: "import" | "export";
  period: string;
  page?: number;
};

export type TradeSeries = {
  reporter: string;
  partner: string;
  flow: "import" | "export";
  period: string;
  hs: string;
  value: number;
  qty: number | null;
  qtyUnit: string | null;
};

export type TradeSummary = {
  series: TradeSeries[];
  totals: { count: number; sum: number };
};

export async function getTrade(params: TradeParams) {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = new URL("/api/trade", base);
  Object.entries(params).forEach(([key, value]) => {
    if (value != null) {
      url.searchParams.set(key, String(value));
    }
  });
  const res = await fetch(url.toString(), { cache: "no-store" });
  const json = await res.json();
  if (!json?.ok) {
    throw new Error(json?.error || "TRADE_ERROR");
  }
  return json.data as TradeSummary;
}
