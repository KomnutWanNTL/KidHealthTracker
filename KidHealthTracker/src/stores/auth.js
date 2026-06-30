import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import { useLogsStore } from './logs'
import { useToast } from '@/composables/useToast'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    session: null,
    user: null,
    loading: true,
    isGuest: false,
    guestId: null,
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
        if (session?.user) {
          this.checkAndMigrateGuestData()
        }
      })
    },
    async enterGuestMode() {
      if (this.isGuest) return
      let guestId = localStorage.getItem('guest_id')
      if (!guestId) {
        guestId = crypto.randomUUID()
        localStorage.setItem('guest_id', guestId)
      }
      this.isGuest = true
      this.guestId = guestId
      this.loading = false
      useLogsStore().setGuestMode(true)
      const { info } = useToast()
      info('🔒 ข้อมูลจะถูกบันทึกในเครื่องนี้เท่านั้น หากล้างข้อมูลใน browser จะสูญหาย')
    },
    exitGuestMode() {
      this.isGuest = false
      this.guestId = null
      useLogsStore().setGuestMode(false)
    },
    async migrateGuestData() {
      const guestLogs = JSON.parse(localStorage.getItem('guestLogs') || '{}')
      const guestId = localStorage.getItem('guest_id')
      const userLogs = guestLogs[guestId]
      if (!userLogs || Object.keys(userLogs).length === 0) return 0
      const entries = Object.entries(userLogs)
      let migrated = 0
      let hasError = false
      for (const [date, symptom] of entries) {
        try {
          await supabase.from('daily_logs').upsert(
            { user_id: this.user.id, log_date: date, symptom },
            { onConflict: 'user_id,log_date' },
          )
          migrated++
        } catch (e) {
          hasError = true
          console.error('Migration failed for', date, e)
        }
      }
      if (!hasError) {
        localStorage.removeItem('guestLogs')
        localStorage.removeItem('guest_id')
      }
      return migrated
    },
    async checkAndMigrateGuestData() {
      const guestLogs = JSON.parse(localStorage.getItem('guestLogs') || '{}')
      const guestId = localStorage.getItem('guest_id')
      const hasGuestData = guestId && guestLogs[guestId] && Object.keys(guestLogs[guestId]).length > 0
      if (!hasGuestData) return
      this.isGuest = true
      useLogsStore().setGuestMode(true)
      try {
        const count = await this.migrateGuestData()
        if (count > 0) {
          const { success } = useToast()
          success(`นำเข้าข้อมูลที่ทดลองใช้เรียบร้อย ✓ (${count} รายการ)`)
        }
      } catch (e) {
        console.error('Migration failed:', e)
      }
      this.exitGuestMode()
    },
    async signIn(email, password) {
      return supabase.auth.signInWithPassword({ email, password })
    },
    async signUp(email, password, options = {}) {
      return supabase.auth.signUp({ email, password, options })
    },
    async signOut() {
      if (this.isGuest) {
        this.exitGuestMode()
        return
      }
      return supabase.auth.signOut()
    },
  },
})
