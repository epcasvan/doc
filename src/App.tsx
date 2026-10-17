import { useEffect, useState } from 'react'
import './App.css'
import {
  clearAccessAccount,
  hasAccessCookie,
  writeAccessAccount,
  type AccessAccount,
} from '@/access'
import { clearAccessPassword } from '@/fiches/password'
import { AccessPage } from '@/components/generator/AccessPage'
import { GeneratorPage } from '@/components/generator/GeneratorPage'
import { Landing } from '@/components/generator/Landing'
import { SavedFichesPage } from '@/components/generator/SavedFichesPage'
import { navigateTo, resolveRoute } from '@/components/generator/routing'

export default function App() {
  const [route, setRoute] = useState(resolveRoute)

  useEffect(() => {
    const sync = () => setRoute(resolveRoute())
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  const goAccess = () => {
    if (hasAccessCookie()) {
      navigateTo('/generateur')
      setRoute('generator')
      return
    }
    navigateTo('/acces')
    setRoute('access')
  }

  const openGenerator = (account: AccessAccount) => {
    writeAccessAccount(account)
    navigateTo('/generateur')
    setRoute('generator')
  }

  const showGenerator = () => {
    navigateTo('/generateur')
    setRoute('generator')
  }

  const showFiches = () => {
    navigateTo('/fiches')
    setRoute('fiches')
  }

  const logout = () => {
    clearAccessAccount()
    clearAccessPassword()
    navigateTo('/acces')
    setRoute('access')
  }

  if (route === 'fiches') {
    return <SavedFichesPage onOpenGenerator={showGenerator} onLogout={logout} />
  }
  if (route === 'generator') return <GeneratorPage onLogout={logout} onOpenFiches={showFiches} />
  if (route === 'access') return <AccessPage onSuccess={openGenerator} />
  return <Landing onCreate={goAccess} />
}
