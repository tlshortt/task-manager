import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the starter text', () => {
    render(<App />)
    expect(screen.getByText('hello world')).toBeInTheDocument()
  })
})