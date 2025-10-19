interface LogFields {
  method: string;
  path: string;
  ms: number;
  status: number;
  code?: string;
  upstream?: string;
}

export function logApi(fields: LogFields) {
  const payload = {
    ts: new Date().toISOString(),
    ...fields
  };
  console.log(JSON.stringify(payload));
}
