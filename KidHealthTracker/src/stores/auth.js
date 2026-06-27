import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    session: null,
    user: null,
    loading: true,
  }),
  actions: {
    async init() {
      const { data } = await supabase.auth.getSession()
      this.session = data.session
      this.user = data.session?.user ?? null
      this.loading = false
      supabase.auth.onAuthStateChange((_e, session) => {
        this.session = session
        this.user = session?.user ?? null
      })
    },
    async signIn(email, password) {
      return supabase.auth.signInWithPassword({ email, password })
    },
    async signUp(email, password, options = {}) {
      return supabase.auth.signUp({ email, password, options })
    },
    async signOut() {
      return supabase.auth.signOut()
    },
  },
})
