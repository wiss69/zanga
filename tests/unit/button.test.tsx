import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Button } from '@/src/components/ui/button';

describe('Button', () => {
  it('renders with default variant', () => {
    const { getByText } = render(<Button>Action</Button>);
    expect(getByText('Action')).toBeInTheDocument();
  });
});
