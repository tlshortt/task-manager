import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the MainLayout component', () => {
    render(<App />)
    // Check that the main structure is rendered
    expect(screen.getByText('Tasks')).toBeInTheDocument()
  })
})
