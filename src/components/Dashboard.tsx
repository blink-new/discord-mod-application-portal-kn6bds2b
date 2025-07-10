import { useState, useEffect } from 'react'
import { Shield, LogOut, Plus, CheckCircle, Clock, XCircle, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { blink } from '@/blink/client'
import { ApplicationForm } from './ApplicationForm'
import { ApplicationView } from './ApplicationView'
import { AdminPanel } from './AdminPanel'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  displayName?: string
}

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
  userEmail: string
}

interface DashboardProps {
  user: User
}

export function Dashboard({ user }: DashboardProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [userApplication, setUserApplication] = useState<Application | null>(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  // Admin emails - in real app this would be in database
  const adminEmails = ['admin@example.com', 'moderator@example.com', user.email]

  useEffect(() => {
    setIsAdmin(adminEmails.includes(user.email))
    loadApplications()
  }, [user.email])

  const loadApplications = async () => {
    try {
      setLoading(true)
      
      // Ensure the applications table exists
      try {
        await blink.db.applications.list({ limit: 1 })
      } catch (error) {
        console.log('Creating applications table...')
        // If table doesn't exist, create a dummy record to initialize it
        try {
          await blink.db.applications.create({
            id: 'init',
            userId: 'init',
            discordUsername: 'init',
            age: 18,
            timezone: 'UTC',
            experience: 'init',
            motivation: 'init',
            scenario: 'init',
            status: 'pending',
            createdAt: new Date().toISOString(),
            userEmail: 'init@example.com'
          })
          // Remove the dummy record
          await blink.db.applications.delete('init')
        } catch (createError) {
          console.error('Error creating table:', createError)
        }
      }
      
      // Load user's own application
      const userApps = await blink.db.applications.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        limit: 1
      })
      
      if (userApps.length > 0) {
        setUserApplication(userApps[0])
      }

      // Load all applications if admin
      if (adminEmails.includes(user.email)) {
        const allApps = await blink.db.applications.list({
          orderBy: { createdAt: 'desc' },
          limit: 100
        })
        setApplications(allApps)
      }
    } catch (error) {
      console.error('Error loading applications:', error)
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    blink.auth.logout()
  }

  const handleApplicationSubmit = async (applicationData: Omit<Application, 'id' | 'userId' | 'createdAt' | 'userEmail'>) => {
    try {
      const newApplication = await blink.db.applications.create({
        ...applicationData,
        userId: user.id,
        userEmail: user.email,
        createdAt: new Date().toISOString(),
      })
      
      setUserApplication(newApplication)
      setShowApplicationForm(false)
      toast.success('Application submitted successfully!')
      await loadApplications()
    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error('Failed to submit application')
    }
  }

  const handleStatusUpdate = async (applicationId: string, newStatus: 'approved' | 'rejected') => {
    try {
      await blink.db.applications.update(applicationId, { status: newStatus })
      toast.success(`Application ${newStatus}!`)
      await loadApplications()
      setSelectedApplication(null)
    } catch (error) {
      console.error('Error updating application:', error)
      toast.error('Failed to update application')
    }
  }

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

  const pendingCount = applications.filter(app => app.status === 'pending').length
  const approvedCount = applications.filter(app => app.status === 'approved').length
  const totalCount = applications.length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-lg font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism border-b border-white/20 backdrop-blur-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-white" />
              <h1 className="text-xl font-bold text-white">Moderator Portal</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-white text-sm">
                <span className="opacity-80">Welcome, </span>
                <span className="font-medium">{user.displayName || user.email}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 glass-morphism border-white/20">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/20">
              Overview
            </TabsTrigger>
            <TabsTrigger value="application" className="text-white data-[state=active]:bg-white/20">
              My Application
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="text-white data-[state=active]:bg-white/20">
                Admin Panel ({pendingCount})
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              <Card className="glass-morphism border-white/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-300" />
                    Application Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userApplication ? (
                    <div className="space-y-2">
                      <Badge variant={getStatusColor(userApplication.status)} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(userApplication.status)}
                        {userApplication.status.charAt(0).toUpperCase() + userApplication.status.slice(1)}
                      </Badge>
                      <p className="text-sm text-blue-100">
                        Submitted {new Date(userApplication.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-blue-100">No application submitted yet</p>
                  )}
                </CardContent>
              </Card>

              {isAdmin && (
                <>
                  <Card className="glass-morphism border-white/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white">Pending Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white">{pendingCount}</div>
                      <p className="text-sm text-blue-100">Applications awaiting review</p>
                    </CardContent>
                  </Card>

                  <Card className="glass-morphism border-white/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white">Total Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white">{totalCount}</div>
                      <p className="text-sm text-blue-100">{approvedCount} approved</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass-morphism border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">What We're Looking For</CardTitle>
                  <CardDescription className="text-blue-100">
                    Key qualities and skills we value in our moderators
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-white">Experience & Skills</h4>
                    <ul className="space-y-2 text-sm text-blue-100">
                      <li>• Previous moderation experience</li>
                      <li>• Understanding of Discord features</li>
                      <li>• Conflict resolution skills</li>
                      <li>• Active community participation</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-white">Personal Qualities</h4>
                    <ul className="space-y-2 text-sm text-blue-100">
                      <li>• Patience and empathy</li>
                      <li>• Fair and unbiased judgment</li>
                      <li>• Strong communication skills</li>
                      <li>• Commitment to community values</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Application Tab */}
          <TabsContent value="application" className="space-y-6">
            {userApplication ? (
              <ApplicationView 
                application={userApplication} 
                canEdit={false}
                onStatusUpdate={isAdmin ? handleStatusUpdate : undefined}
              />
            ) : showApplicationForm ? (
              <ApplicationForm 
                onSubmit={handleApplicationSubmit}
                onCancel={() => setShowApplicationForm(false)}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="glass-morphism border-white/20">
                  <CardHeader className="text-center">
                    <CardTitle className="text-white text-2xl">Start Your Application</CardTitle>
                    <CardDescription className="text-blue-100 text-lg">
                      Ready to join our moderation team? Submit your application now.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button 
                      onClick={() => setShowApplicationForm(true)}
                      variant="discord"
                      size="lg"
                      className="text-lg px-8 py-4"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Submit Application
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* Admin Panel Tab */}
          {isAdmin && (
            <TabsContent value="admin" className="space-y-6">
              <AdminPanel 
                applications={applications}
                onApplicationSelect={setSelectedApplication}
                onStatusUpdate={handleStatusUpdate}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Application Details</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
              <ApplicationView 
                application={selectedApplication}
                canEdit={true}
                onStatusUpdate={handleStatusUpdate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}