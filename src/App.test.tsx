import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the MainLayout component', () => {
    render(<App />)
    expect(screen.getByRole('tablist', { name: 'Task filters' })).toBeInTheDocument()
  })
})
