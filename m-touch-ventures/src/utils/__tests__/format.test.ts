import { formatGHS, formatPercentChange } from '../format';

describe('formatGHS', () => {
  it('always shows two decimal places', () => {
    expect(formatGHS(0)).toBe('GH₵ 0.00');
    expect(formatGHS(5)).toBe('GH₵ 5.00');
    expect(formatGHS(5.5)).toBe('GH₵ 5.50');
  });

  it('groups thousands with separators', () => {
    expect(formatGHS(1240.5)).toBe('GH₵ 1,240.50');
    expect(formatGHS(1000000)).toBe('GH₵ 1,000,000.00');
  });

  it('does not add a separator below one thousand', () => {
    expect(formatGHS(999.99)).toBe('GH₵ 999.99');
  });

  it('puts the minus sign ahead of the currency symbol', () => {
    expect(formatGHS(-1240.5)).toBe('-GH₵ 1,240.50');
  });

  it('rounds to the nearest pesewa', () => {
    expect(formatGHS(1.005)).toBe('GH₵ 1.01');
    expect(formatGHS(2.344)).toBe('GH₵ 2.34');
  });

  it('falls back to zero for non-finite input', () => {
    expect(formatGHS(NaN)).toBe('GH₵ 0.00');
    expect(formatGHS(Infinity)).toBe('GH₵ 0.00');
  });
});

describe('formatPercentChange', () => {
  it('signs increases and decreases', () => {
    expect(formatPercentChange(110, 100)).toBe('+10.0%');
    expect(formatPercentChange(90, 100)).toBe('-10.0%');
  });

  it('reports no change as zero', () => {
    expect(formatPercentChange(100, 100)).toBe('0.0%');
    expect(formatPercentChange(0, 0)).toBe('0.0%');
  });

  it('treats growth from a zero base as +100%', () => {
    expect(formatPercentChange(500, 0)).toBe('+100.0%');
  });

  it('keeps one decimal place', () => {
    expect(formatPercentChange(123.45, 100)).toBe('+23.5%');
  });
});
