import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface GameContextType {
  showKO: boolean
  triggerKO: () => void
  dismissKO: () => void
}

const GameContext = createContext<GameContextType | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [showKO, setShowKO] = useState(false)

  const triggerKO = useCallback(() => {
    setShowKO(true)
    setTimeout(() => setShowKO(false), 3000)
  }, [])

  const dismissKO = useCallback(() => setShowKO(false), [])

  return (
    <GameContext.Provider value={{ showKO, triggerKO, dismissKO }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGameContext(): GameContextType {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGameContext must be used within <GameProvider>')
  return ctx
}
