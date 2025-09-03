import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'

export default function Logout() {
  const navigate = useNavigate()
  useEffect(() => {
    supabase.auth.signOut().finally(() => navigate('/auth', { replace: true }))
  }, [navigate])
  return null
}