import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Ocean themed Todo', () => {
  render(<App />);
  const title = screen.getByText(/Todo/i);
  expect(title).toBeInTheDocument();
});
