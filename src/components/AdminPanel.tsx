import { useState } from 'react'
import { Eye, Filter, Search, CheckCircle, XCircle, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

interface AdminPanelProps {
  applications: Application[]
  onApplicationSelect: (application: Application) => void
  onStatusUpdate: (applicationId: string, status: 'approved' | 'rejected') => void
}

export function AdminPanel({ applications, onApplicationSelect, onStatusUpdate }: AdminPanelProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.discordUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (app.userEmail && app.userEmail.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingApps = applications.filter(app => app.status === 'pending')
  const approvedApps = applications.filter(app => app.status === 'approved')
  const rejectedApps = applications.filter(app => app.status === 'rejected')

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

  const QuickActions = ({ app }: { app: Application }) => (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onApplicationSelect(app)}
        className="text-blue-300 hover:text-white hover:bg-white/10"
      >
        <Eye className="w-4 h-4" />
      </Button>
      {app.status === 'pending' && (
        <>
          <Button
            size="sm"
            onClick={() => onStatusUpdate(app.id, 'approved')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onStatusUpdate(app.id, 'rejected')}
          >
            <XCircle className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-morphism border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-300" />
              <div>
                <p className="text-2xl font-bold text-white">{applications.length}</p>
                <p className="text-xs text-blue-100">Total Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-morphism border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold text-white">{pendingApps.length}</p>
                <p className="text-xs text-blue-100">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-morphism border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{approvedApps.length}</p>
                <p className="text-xs text-blue-100">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-morphism border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-white">{rejectedApps.length}</p>
                <p className="text-xs text-blue-100">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="glass-morphism border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-300" />
            Application Management
          </CardTitle>
          <CardDescription className="text-blue-100">
            Review and manage moderator applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
              <Input
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
            
            <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <TabsList className="grid w-full grid-cols-4 glass-morphism border-white/20">
                <TabsTrigger value="all" className="text-white data-[state=active]:bg-white/20">
                  All
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-white data-[state=active]:bg-white/20">
                  Pending ({pendingApps.length})
                </TabsTrigger>
                <TabsTrigger value="approved" className="text-white data-[state=active]:bg-white/20">
                  Approved
                </TabsTrigger>
                <TabsTrigger value="rejected" className="text-white data-[state=active]:bg-white/20">
                  Rejected
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Applications List */}
          <div className="space-y-3">
            {filteredApplications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-blue-100">No applications found matching your criteria.</p>
              </div>
            ) : (
              filteredApplications.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-white">{app.discordUsername}</h4>
                        <Badge variant={getStatusColor(app.status)} className="flex items-center gap-1">
                          {getStatusIcon(app.status)}
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-100">
                        <div>
                          <span className="text-white/70">Age:</span> {app.age}
                        </div>
                        <div>
                          <span className="text-white/70">Timezone:</span> {app.timezone}
                        </div>
                        <div>
                          <span className="text-white/70">Email:</span> {app.userEmail}
                        </div>
                        <div>
                          <span className="text-white/70">Submitted:</span> {new Date(app.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-blue-100 line-clamp-2">
                          <span className="text-white/70">Motivation:</span> {app.motivation}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <QuickActions app={app} />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}