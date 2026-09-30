import { CurrencyInrPipe } from './currency-inr.pipe';

describe('CurrencyInrPipe', () => {
  const pipe = new CurrencyInrPipe();

  it('transforms null, undefined or NaN to ₹0', () => {
    expect(pipe.transform(null)).toBe('₹0');
    expect(pipe.transform(undefined)).toBe('₹0');
    expect(pipe.transform('invalid')).toBe('₹0');
  });

  it('formats positive numbers in INR currency format', () => {
    const formatted = pipe.transform(150000);
    expect(formatted).toContain('1,50,000');
    expect(formatted).toContain('₹');
  });

  it('formats 0 as ₹0', () => {
    const formatted = pipe.transform(0);
    expect(formatted).toContain('0');
    expect(formatted).toContain('₹');
  });
});
