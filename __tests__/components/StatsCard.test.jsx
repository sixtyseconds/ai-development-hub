import React from 'react';
import { render, screen } from '@testing-library/react';
import StatsCard from '@/components/StatsCard';
import { FiUsers } from 'react-icons/fi';

describe('StatsCard Component', () => {
  const defaultProps = {
    title: 'Test Card',
    value: 42,
    icon: <FiUsers data-testid="test-icon" />,
    bgColor: 'bg-primary/10',
    textColor: 'text-primary',
  };

  test('renders with required props', () => {
    render(<StatsCard {...defaultProps} />);
    
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  test('renders with trend data', () => {
    const props = {
      ...defaultProps,
      trend: { value: '5 more than yesterday', isUp: true },
    };
    
    render(<StatsCard {...props} />);
    
    expect(screen.getByText('5 more than yesterday')).toBeInTheDocument();
    expect(screen.getByText('↑')).toBeInTheDocument();
  });

  test('renders with down trend', () => {
    const props = {
      ...defaultProps,
      trend: { value: '3 less than yesterday', isUp: false },
    };
    
    render(<StatsCard {...props} />);
    
    expect(screen.getByText('3 less than yesterday')).toBeInTheDocument();
    expect(screen.getByText('↓')).toBeInTheDocument();
  });

  test('renders loading state correctly', () => {
    const props = {
      ...defaultProps,
      isLoading: true,
    };
    
    render(<StatsCard {...props} />);
    
    // Should show loading skeletons instead of actual data
    const loadingElements = screen.getAllByRole('generic', { name: '' }).filter(
      el => el.classList.contains('animate-pulse')
    );
    expect(loadingElements.length).toBeGreaterThan(0);
    expect(screen.queryByText('42')).not.toBeInTheDocument();
  });
}); 