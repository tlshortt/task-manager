import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the TaskDateGroup component', () => {
    render(<App />)
    expect(screen.getByText(/TODAY \(4\)/i)).toBeInTheDocument()
  })
})
