import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'

function getGuestLogs() {
  const guestId = localStorage.getItem('guest_id')
  if (!guestId) return { guestId: null, logs: {} }
  const all = JSON.parse(localStorage.getItem('guestLogs') || '{}')
  return { guestId, logs: all[guestId] || {} }
}

function saveGuestLogs(logs) {
  const guestId = localStorage.getItem('guest_id')
  if (!guestId) return
  const all = JSON.parse(localStorage.getItem('guestLogs') || '{}')
  all[guestId] = logs
  localStorage.setItem('guestLogs', JSON.stringify(all))
}

export const useLogsStore = defineStore('logs', {
  state: () => ({
    currentLog: null,
    monthLogs: {},
    isGuest: false,
  }),
  actions: {
    setGuestMode(enabled) {
      this.isGuest = enabled
    },
    async fetchForDate(date) {
      if (this.isGuest) {
        const { guestId, logs } = getGuestLogs()
        if (!guestId) return null
        this.currentLog = logs[date] ? { log_date: date, symptom: logs[date] } : null
        return this.currentLog
      }
      const auth = useAuthStore()
      if (!auth.user) return null
      const { data } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', auth.user.id)
        .eq('log_date', date)
        .maybeSingle()
      this.currentLog = data
      return data
    },
    async fetchMonth(year, month) {
      if (this.isGuest) {
        const { guestId, logs } = getGuestLogs()
        if (!guestId) return {}
        const prefix = `${year}-${String(month).padStart(2, '0')}`
        const map = {}
        Object.entries(logs).forEach(([date, symptom]) => {
          if (date.startsWith(prefix)) map[date] = symptom
        })
        this.monthLogs = map
        return map
      }
      const auth = useAuthStore()
      if (!auth.user) return
      const from = `${year}-${String(month).padStart(2, '0')}-01`
      const lastDay = new Date(year, month, 0).getDate()
      const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
      const { data } = await supabase
        .from('daily_logs')
        .select('log_date, symptom')
        .eq('user_id', auth.user.id)
        .gte('log_date', from)
        .lte('log_date', to)
      const map = {}
      if (data) {
        data.forEach((row) => {
          map[row.log_date] = row.symptom
        })
      }
      this.monthLogs = map
      return map
    },
    async getStreak() {
      let count = 0
      const today = new Date()
      today.setHours(12, 0, 0, 0)

      const savedMonthLogs = { ...this.monthLogs }

      let cursor = new Date(today)
      cursor.setHours(12, 0, 0, 0)

      while (true) {
        const dateStr = cursor.toISOString().split("T")[0]
        let hasLog = false

        if (this.isGuest) {
          const { guestId, logs } = getGuestLogs()
          if (guestId && logs[dateStr]) hasLog = true
        } else {
          const year = cursor.getFullYear()
          const month = cursor.getMonth() + 1
          const prefix = `${year}-${String(month).padStart(2, "0")}`
          const inCurrentMonth = Object.keys(this.monthLogs).some(k => k.startsWith(prefix))

          if (!inCurrentMonth) {
            await this.fetchMonth(year, month)
          }

          if (this.monthLogs[dateStr]) hasLog = true
        }

        if (!hasLog) break
        count++
        cursor.setDate(cursor.getDate() - 1)
        cursor.setHours(12, 0, 0, 0)
      }

      this.monthLogs = savedMonthLogs
      return count
    },

    async upsertLog(date, symptom) {
      const today = new Date().toISOString().split('T')[0]
      if (date > today) throw new Error('ไม่สามารถบันทึกวันในอนาคตได้')
      if (this.isGuest) {
        const { guestId, logs } = getGuestLogs()
        if (!guestId) throw new Error('Guest ID not found')
        logs[date] = symptom
        saveGuestLogs(logs)
        this.currentLog = { log_date: date, symptom }
        return
      }
      const auth = useAuthStore()
      if (!auth.user) throw new Error('Not authenticated')
      const { error } = await supabase.from('daily_logs').upsert(
        { user_id: auth.user.id, log_date: date, symptom },
        { onConflict: 'user_id,log_date' },
      )
      if (error) throw error
      this.currentLog = { user_id: auth.user.id, log_date: date, symptom }
    },
  },
})
