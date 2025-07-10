import { CheckCircle, XCircle, Clock, User, Calendar, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

interface Application {
  id: string
  userId: string
  discordUsername: string
  age: number
  timezone: string
  experience: string
  motivation: string
  scenario: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  userEmail?: string
}

interface ApplicationViewProps {
  application: Application
  canEdit: boolean
  onStatusUpdate?: (applicationId: string, status: 'approved' | 'rejected') => void
}

export function ApplicationView({ application, canEdit, onStatusUpdate }: ApplicationViewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success'
      case 'rejected': return 'destructive'
      default: return 'pending'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="glass-morphism border-white/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-300" />
                {application.discordUsername}
              </CardTitle>
              <CardDescription className="text-blue-100 mt-1">
                Application submitted on {new Date(application.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge variant={getStatusColor(application.status)} className="flex items-center gap-1">
              {getStatusIcon(application.status)}
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-white flex items-center gap-1">
                <User className="w-4 h-4 text-blue-300" />
                Age
              </h4>
              <p className="text-blue-100">{application.age} years old</p>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-white flex items-center gap-1">
                <Globe className="w-4 h-4 text-blue-300" />
                Timezone
              </h4>
              <p className="text-blue-100">{application.timezone}</p>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-white flex items-center gap-1">
                <Calendar className="w-4 h-4 text-blue-300" />
                Status
              </h4>
              <Badge variant={getStatusColor(application.status)} className="flex items-center gap-1 w-fit">
                {getStatusIcon(application.status)}
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Experience Section */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-white">Previous Experience</h4>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-blue-100 whitespace-pre-wrap">{application.experience}</p>
            </div>
          </div>

          {/* Motivation Section */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-white">Motivation</h4>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-blue-100 whitespace-pre-wrap">{application.motivation}</p>
            </div>
          </div>

          {/* Scenario Response Section */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-white">Scenario Response</h4>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10 mb-3">
              <p className="text-sm text-blue-200">
                <strong>Scenario:</strong> Two members are having a heated argument in a public channel. 
                One member starts using inappropriate language and personal attacks. 
                How would you handle this situation?
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-blue-100 whitespace-pre-wrap">{application.scenario}</p>
            </div>
          </div>

          {/* Admin Actions */}
          {canEdit && onStatusUpdate && application.status === 'pending' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 pt-4 border-t border-white/20"
            >
              <Button
                onClick={() => onStatusUpdate(application.id, 'approved')}
                variant="default"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              
              <Button
                onClick={() => onStatusUpdate(application.id, 'rejected')}
                variant="destructive"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </motion.div>
          )}

          {application.status !== 'pending' && (
            <div className="pt-4 border-t border-white/20">
              <p className="text-sm text-blue-200">
                This application has been{' '}
                <span className={`font-semibold ${
                  application.status === 'approved' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {application.status}
                </span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}