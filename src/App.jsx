import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const Thing = ({ name }) => {
  return (
    <div>Hi, I'm {name}</div>
  )
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      Blah
      <Thing name={"David" + " Rees"} />
    </div>
  )
}

export default App
