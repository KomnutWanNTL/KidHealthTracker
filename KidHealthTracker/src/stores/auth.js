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
      if (data.session) {
        const { data: userData, error } = await supabase.auth.getUser()
        if (error || !userData?.user) {
          await supabase.auth.signOut()
          this.session = null
          this.user = null
        } else {
          this.session = data.session
          this.user = userData.user
        }
      } else {
        this.session = null
        this.user = null
      }
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
