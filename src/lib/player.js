export const getPlayer = () => {
  const player = localStorage.getItem('player')
  return player ? JSON.parse(player) : null
}

export const setPlayer = (playerData) => {
  localStorage.setItem('player', JSON.stringify(playerData))
}

export const clearPlayer = () => {
  localStorage.removeItem('player')
}

export const isPlayerLoggedIn = () => {
  return getPlayer() !== null
}
