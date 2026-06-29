import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'

export const useLogsStore = defineStore('logs', {
  state: () => ({
    currentLog: null,
    monthLogs: {},
  }),
  actions: {
    async fetchForDate(date) {
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
    async upsertLog(date, symptom) {
      const auth = useAuthStore()
      if (!auth.user) throw new Error('Not authenticated')
      const today = new Date().toISOString().split('T')[0]
      if (date > today) throw new Error('ไม่สามารถบันทึกวันในอนาคตได้')
      const { error } = await supabase.from('daily_logs').upsert(
        { user_id: auth.user.id, log_date: date, symptom },
        { onConflict: 'user_id,log_date' },
      )
      if (error) throw error
      this.currentLog = { user_id: auth.user.id, log_date: date, symptom }
    },
  },
})
