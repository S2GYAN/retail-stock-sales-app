import React, { useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Svg, { Circle, G, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { colors } from '../../theme/theme';
import { buildAxisScale, compactNumber } from './scale';

export interface ChartSeries {
  key: string;
  color: string;
  values: number[];
}

interface TimeSeriesChartProps {
  mode: 'line' | 'bar';
  series: ChartSeries[];
  xLabels: string[];
  height?: number;
}

const PADDING_LEFT = 40;
const PADDING_RIGHT = 8;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 24;
const MAX_X_LABELS = 6;

export default function TimeSeriesChart({ mode, series, xLabels, height = 180 }: TimeSeriesChartProps) {
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const count = xLabels.length;
  const allValues = series.flatMap((s) => s.values);
  const scale = buildAxisScale(allValues);

  const innerWidth = Math.max(width - PADDING_LEFT - PADDING_RIGHT, 1);
  const innerHeight = height - PADDING_TOP - PADDING_BOTTOM;

  const xForIndex = (i: number) => {
    if (count <= 1) return PADDING_LEFT + innerWidth / 2;
    return PADDING_LEFT + (innerWidth * i) / (count - 1);
  };

  const yForValue = (v: number) => {
    const range = scale.max - scale.min || 1;
    return PADDING_TOP + innerHeight - ((v - scale.min) / range) * innerHeight;
  };

  const labelStep = Math.max(1, Math.ceil(count / MAX_X_LABELS));

  const groupWidth = count > 0 ? innerWidth / count : innerWidth;
  const barGap = 3;
  const barWidth =
    mode === 'bar' && series.length > 0
      ? Math.max(2, (groupWidth - barGap * (series.length + 1)) / series.length)
      : 0;

  return (
    <View onLayout={onLayout}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          {/* Grid lines + y-axis labels */}
          {scale.ticks.map((tick) => {
            const y = yForValue(tick);
            return (
              <G key={tick}>
                <Line
                  x1={PADDING_LEFT}
                  x2={width - PADDING_RIGHT}
                  y1={y}
                  y2={y}
                  stroke={colors.divider}
                  strokeWidth={1}
                />
                <SvgText
                  x={PADDING_LEFT - 6}
                  y={y + 3}
                  fontSize={9}
                  fill={colors.textMuted}
                  textAnchor="end"
                >
                  {compactNumber(tick)}
                </SvgText>
              </G>
            );
          })}

          {/* Zero baseline, emphasized */}
          <Line
            x1={PADDING_LEFT}
            x2={width - PADDING_RIGHT}
            y1={yForValue(0)}
            y2={yForValue(0)}
            stroke={colors.border}
            strokeWidth={1}
          />

          {/* Bars */}
          {mode === 'bar' &&
            series.map((s, sIndex) => (
              <G key={s.key}>
                {s.values.map((v, i) => {
                  const groupStart = PADDING_LEFT + groupWidth * i;
                  const x = groupStart + barGap + sIndex * (barWidth + barGap);
                  const yZero = yForValue(0);
                  const y = yForValue(v);
                  const barY = Math.min(y, yZero);
                  const barHeight = Math.max(Math.abs(yZero - y), 1);
                  return (
                    <Rect
                      key={i}
                      x={x}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      fill={s.color}
                      rx={1.5}
                    />
                  );
                })}
              </G>
            ))}

          {/* Lines */}
          {mode === 'line' &&
            series.map((s) => {
              const points = s.values
                .map((v, i) => `${xForIndex(i)},${yForValue(v)}`)
                .join(' ');
              return (
                <G key={s.key}>
                  <Polyline points={points} fill="none" stroke={s.color} strokeWidth={2} />
                  {count <= 14 &&
                    s.values.map((v, i) => (
                      <Circle key={i} cx={xForIndex(i)} cy={yForValue(v)} r={2.5} fill={s.color} />
                    ))}
                </G>
              );
            })}

          {/* X-axis labels (thinned) */}
          {xLabels.map((label, i) => {
            if (i % labelStep !== 0 && i !== count - 1) return null;
            const x =
              mode === 'bar' ? PADDING_LEFT + groupWidth * i + groupWidth / 2 : xForIndex(i);
            return (
              <SvgText
                key={i}
                x={x}
                y={height - 6}
                fontSize={9}
                fill={colors.textMuted}
                textAnchor="middle"
              >
                {label}
              </SvgText>
            );
          })}
        </Svg>
      ) : (
        <View style={{ height }} />
      )}
    </View>
  );
}
