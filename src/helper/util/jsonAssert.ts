import { strict as assert } from "assert";

export function assertCurrentTypes(data: unknown): void {
  const d = data as any;
  assert.ok(d?.location?.name != null);
  assert.equal(typeof d?.location?.lat, "number");
  assert.equal(typeof d?.location?.lon, "number");
  assert.equal(typeof d?.current?.temp_c, "number");
  assert.equal(typeof d?.current?.condition?.text, "string");
}

export function assertForecastDays(data: unknown, expectedDays: number): void {
  const d = data as any;
  const days = d?.forecast?.forecastday;
  assert.ok(Array.isArray(days));
  assert.equal(days.length, expectedDays);
  const first = days[0];
  assert.equal(typeof first?.date, "string");
  assert.equal(typeof first?.day?.maxtemp_c, "number");
  assert.equal(typeof first?.day?.mintemp_c, "number");
}
