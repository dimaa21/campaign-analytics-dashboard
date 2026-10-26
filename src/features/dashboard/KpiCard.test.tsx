import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KpiCard } from './KpiCard';

describe('KpiCard', () => {
  it('shows the metric and a negative change', () => {
    render(<KpiCard label="Revenue" value="$80.00" delta={-0.2} />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$80.00')).toBeInTheDocument();
    expect(screen.getByText('-20.0%')).toBeInTheDocument();
  });

  it('prefixes an increase with a plus sign', () => {
    render(<KpiCard label="Clicks" value="1,200" delta={0.125} />);
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
  });
});
