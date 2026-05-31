const baseUrl = process.env.PERF_BASE_URL ?? "http://127.0.0.1:3000";
const retryCount = Number.parseInt(process.env.PERF_RETRIES ?? (process.env.CI ? "0" : "1"), 10);
const concurrency = Math.max(1, Number.parseInt(process.env.PERF_CONCURRENCY ?? (process.env.CI ? "6" : "1"), 10));

const publicChecks = [
  { path: "/", maxMs: 5000, status: [200] },
  { path: "/api/health", maxMs: 5000, status: [200, 503] },
  { path: "/demo-barber", maxMs: 7000, status: [200] },
  { path: "/rezervacni-system-pro-barbery", maxMs: 5000, status: [200] },
  { path: "/jak-snizit-no-show", maxMs: 5000, status: [200] },
  { path: "/login", maxMs: 5000, status: [200] },
  { path: "/register", maxMs: 5000, status: [200] },
];

const protectedRedirectChecks = [
  "/dashboard",
  "/calendar",
  "/clients",
  "/services",
  "/staff",
  "/settings",
  "/booking-page",
  "/start",
].map((path) => ({ path, maxMs: 1500, status: [307, 308] }));

async function measure(check) {
  const startedAt = performance.now();
  try {
    const response = await fetch(new URL(check.path, baseUrl), {
      redirect: "manual",
    });
    const durationMs = Math.round(performance.now() - startedAt);

    return {
      ...check,
      durationMs,
      ok: check.status.includes(response.status) && durationMs <= check.maxMs,
      statusCode: response.status,
    };
  } catch (error) {
    const durationMs = Math.round(performance.now() - startedAt);

    return {
      ...check,
      durationMs,
      ok: false,
      statusCode: "ERR",
      errorCode: error?.cause?.code ?? error?.code ?? "fetch_failed",
    };
  }
}

async function measureAll(checksToMeasure) {
  const results = [];

  for (let index = 0; index < checksToMeasure.length; index += concurrency) {
    const batch = checksToMeasure.slice(index, index + concurrency);
    results.push(...(await Promise.all(batch.map(measure))));
  }

  return results;
}

const checks = [...publicChecks, ...protectedRedirectChecks];
const initialResults = await measureAll(checks);
const initialFailed = initialResults.filter((result) => !result.ok);
const retriedResults =
  initialFailed.length > 0 && retryCount > 0
    ? await measureAll(initialFailed)
    : [];
const retriedByPath = new Map(retriedResults.map((result) => [result.path, result]));
const results = initialResults.map((result) => retriedByPath.get(result.path) ?? result);

for (const result of results) {
  const label = result.ok ? "ok" : "fail";
  const retryLabel = retriedByPath.has(result.path) ? " retry" : "";
  const errorLabel = result.errorCode ? ` ${result.errorCode}` : "";
  console.log(`${label.padEnd(4)} ${result.path.padEnd(34)} ${String(result.statusCode).padEnd(3)} ${result.durationMs}ms <= ${result.maxMs}ms${retryLabel}${errorLabel}`);
}

const failed = results.filter((result) => !result.ok);

if (failed.length > 0) {
  console.error(`Performance smoke failed for ${failed.length} route(s).`);
  process.exit(1);
}
