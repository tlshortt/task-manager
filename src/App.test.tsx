import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the task manager heading', () => {
    render(<App />)
    expect(screen.getByText('Task Manager')).toBeInTheDocument()
  })
})
