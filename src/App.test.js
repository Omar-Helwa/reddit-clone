import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Home page', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /home/i })).toBeInTheDocument();
});
