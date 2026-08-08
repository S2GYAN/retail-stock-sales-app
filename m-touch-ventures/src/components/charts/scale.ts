/** "Nice" rounded step for axis grid lines, roughly `roughStep` in size. */
function niceStep(roughStep: number): number {
  if (roughStep <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual = roughStep / magnitude;
  let niceResidual: number;
  if (residual > 5) niceResidual = 10;
  else if (residual > 2) niceResidual = 5;
  else if (residual > 1) niceResidual = 2;
  else niceResidual = 1;
  return niceResidual * magnitude;
}

export interface AxisScale {
  min: number;
  max: number;
  ticks: number[];
}

/** Builds a y-axis scale (min/max/ticks) that comfortably contains all given values. */
export function buildAxisScale(values: number[], tickCount = 4): AxisScale {
  const finiteValues = values.filter((v) => Number.isFinite(v));
  let dataMin = finiteValues.length ? Math.min(...finiteValues) : 0;
  let dataMax = finiteValues.length ? Math.max(...finiteValues) : 1;

  // Always include zero in the visible range so bars/lines read against a baseline.
  dataMin = Math.min(dataMin, 0);
  dataMax = Math.max(dataMax, 0);

  if (dataMax === dataMin) {
    dataMax = dataMin + 1;
  }

  const step = niceStep((dataMax - dataMin) / tickCount);
  const min = Math.floor(dataMin / step) * step;
  const max = Math.ceil(dataMax / step) * step;

  const ticks: number[] = [];
  for (let t = min; t <= max + step / 2; t += step) {
    ticks.push(Math.round(t * 100) / 100);
  }

  return { min, max, ticks };
}

/** Compact axis label, e.g. 1240 -> "1.2k", 950 -> "950". */
export function compactNumber(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1000) {
    return `${sign}${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`;
  }
  return `${sign}${Math.round(abs)}`;
}
