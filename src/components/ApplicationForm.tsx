import { useState } from 'react'
import { Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { motion } from 'framer-motion'

interface Application {
  discordUsername: string
  age: number
  timezone: string
  experience: string
  motivation: string
  scenario: string
  status: 'pending' | 'approved' | 'rejected'
}

interface ApplicationFormProps {
  onSubmit: (application: Application) => void
  onCancel: () => void
}

export function ApplicationForm({ onSubmit, onCancel }: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    discordUsername: '',
    age: '',
    timezone: '',
    experience: '',
    motivation: '',
    scenario: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await onSubmit({
        ...formData,
        age: parseInt(formData.age),
        status: 'pending'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isValid = formData.discordUsername && 
                  formData.age && 
                  formData.timezone && 
                  formData.experience && 
                  formData.motivation && 
                  formData.scenario &&
                  parseInt(formData.age) >= 13

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="glass-morphism border-white/20 max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-2xl">Moderator Application</CardTitle>
              <CardDescription className="text-blue-100 mt-2">
                Tell us about yourself and why you'd make a great moderator
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onCancel}
              className="text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Discord Username *
                </label>
                <Input
                  placeholder="username#1234"
                  value={formData.discordUsername}
                  onChange={(e) => handleChange('discordUsername', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Age *
                </label>
                <Input
                  type="number"
                  placeholder="18"
                  min="13"
                  max="100"
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Timezone *
              </label>
              <Input
                placeholder="EST, PST, GMT, etc."
                value={formData.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Previous Moderation Experience *
              </label>
              <Textarea
                placeholder="Describe any previous moderation experience, community management roles, or relevant skills..."
                value={formData.experience}
                onChange={(e) => handleChange('experience', e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px]"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Why do you want to be a moderator? *
              </label>
              <Textarea
                placeholder="What motivates you to help moderate this community? What would you bring to the team?"
                value={formData.motivation}
                onChange={(e) => handleChange('motivation', e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px]"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Scenario Response *
              </label>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10 mb-2">
                <p className="text-sm text-blue-100">
                  <strong>Scenario:</strong> Two members are having a heated argument in a public channel. 
                  One member starts using inappropriate language and personal attacks. 
                  How would you handle this situation?
                </p>
              </div>
              <Textarea
                placeholder="Describe how you would handle this situation step by step..."
                value={formData.scenario}
                onChange={(e) => handleChange('scenario', e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[120px]"
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                variant="discord"
                size="lg"
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onCancel}
                disabled={isSubmitting}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}