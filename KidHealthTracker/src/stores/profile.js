import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'

const STORAGE_BUCKET = 'avatars'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null,
    loading: false,
    uploadingAvatar: false,
  }),
  actions: {
    async fetchProfile() {
      const auth = useAuthStore()
      if (!auth.user) return null
      this.loading = true
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', auth.user.id)
        .maybeSingle()
      if (!data) {
        const meta = auth.user.user_metadata || {}
        const { data: newProfile } = await supabase
          .from('profiles')
          .upsert({
            id: auth.user.id,
            first_name: meta.first_name || '',
            last_name: meta.last_name || '',
            child_name: '',
            child_birthday: null,
          })
          .select()
          .single()
        this.profile = newProfile
      } else {
        this.profile = data
      }
      this.loading = false
      return this.profile
    },
    async updateProfile(updates) {
      const auth = useAuthStore()
      if (!auth.user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: auth.user.id, ...updates })
        .select()
        .single()
      if (error) throw error
      this.profile = data
      return data
    },
    async uploadAvatar(file) {
      const auth = useAuthStore()
      if (!auth.user) throw new Error('Not authenticated')
      const userId = auth.user.id

      this.uploadingAvatar = true
      try {
        const filePath = `${userId}/avatar`

        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, file, {
            contentType: file.type,
            upsert: true,
          })
        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filePath)

        const publicUrl = urlData.publicUrl

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', userId)
        if (updateError) throw updateError

        this.profile = { ...this.profile, avatar_url: publicUrl }
        return publicUrl
      } finally {
        this.uploadingAvatar = false
      }
    },
  },
})
