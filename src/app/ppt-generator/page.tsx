"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AIVisualizationLoader } from "@/components/ui/ai-visualization-loader"
import { Presentation, Download, FileUp, CheckCircle2, FileText } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { CoinBalanceDisplay } from "@/components/ui/coin-balance-display"

export default function PPTGeneratorPage() {
  const { data: session } = useSession()
  const router = useRouter()

  // Form states
  const [topic, setTopic] = useState("")
  const [extraInfoSource, setExtraInfoSource] = useState("")
  const [slideCount, setSlideCount] = useState(10)
  const [language, setLanguage] = useState("en")
  const [aiImages, setAiImages] = useState(false)
  const [imageForEachSlide, setImageForEachSlide] = useState(true)
  const [googleImage, setGoogleImage] = useState(false)
  const [googleText, setGoogleText] = useState(false)
  const [presentationFor, setPresentationFor] = useState("students")
  
  // Result states
  const [isLoading, setIsLoading] = useState(false)
  const [pptUrl, setPptUrl] = useState("")
  const [pdfUrl, setPdfUrl] = useState("")
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<string>("generate")

  // Coin states
  const [userCoins, setUserCoins] = useState<number | null>(null)
  const [isCheckingCoins, setIsCheckingCoins] = useState(false)

  // Download states
  const [isDownloadingPPT, setIsDownloadingPPT] = useState(false)
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)

  // Fetch user coins when component mounts or session changes
  useEffect(() => {
    if (session?.user) {
      fetchUserCoins()
    }
  }, [session])

  // Redirect unauthenticated users after 10 seconds
  useEffect(() => {
    if (session !== undefined && !session?.user) {
      const timer = setTimeout(() => {
        router.push('/pricing')
      }, 10000) // 10 seconds

      return () => clearTimeout(timer)
    }
  }, [session, router])

  // Function to fetch user coins
  const fetchUserCoins = async () => {
    try {
      setIsCheckingCoins(true)
      const response = await fetch('/api/user-profile')
      if (response.ok) {
        const data = await response.json()
        setUserCoins(data.user?.coins || 0)
      }
    } catch (error) {
      console.error('Error fetching user coins:', error)
      toast.error('Failed to check coin balance')
    } finally {
      setIsCheckingCoins(false)
    }
  }

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic")
      return
    }

    // Check if user is authenticated
    if (!session?.user) {
      toast.error("Please sign in to generate presentations")
      return
    }

    // Check coins before proceeding
    if (userCoins === null) {
      toast.error("Unable to check coin balance. Please try again.")
      return
    }

    if (userCoins < 2) {
      toast.error("Insufficient coins! You need 2 coins to generate presentations.")
      return
    }

    setIsLoading(true)
    setError("")
    setPptUrl("")
    setPdfUrl("")

    try {
      const response = await fetch("/api/generate-ppt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          extraInfoSource: extraInfoSource.trim(),
          language,
          slideCount,
          aiImages,
          imageForEachSlide,
          googleImage,
          googleText,
          presentationFor: presentationFor.trim()
        })
      })

      if (!response.ok) {
        const data = await response.json()
        if (response.status === 402) {
          throw new Error(data.error || "Insufficient coins")
        }
        throw new Error(data.error || "Failed to generate presentation")
      }

      const data = await response.json()
      setPptUrl(data.ppt_url)
      setPdfUrl(data.pdf_url)
      
      toast.success("Presentation generated successfully!")
      
      // Refresh coins after successful generation
      await fetchUserCoins()
      
      // Switch to results tab
      setActiveTab("result")
    } catch (err: any) {
      setError(err.message || "An error occurred")
      toast.error(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (url: string, filename: string, type: 'PPT' | 'PDF') => {
    if (!url) {
      toast.error(`No ${type} to download`)
      return
    }

    const setDownloadState = type === 'PPT' ? setIsDownloadingPPT : setIsDownloadingPDF
    
    setDownloadState(true)
    try {
      // Create a temporary link and trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success(`${type} download started!`)
    } catch (error) {
      console.error(`Error downloading ${type}:`, error)
      toast.error(`Failed to download ${type}`)
    } finally {
      setDownloadState(false)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <Navbar />

      {/* AI Visualization Loader */}
      <AIVisualizationLoader
        isLoading={isLoading}
        message="AI is creating your presentation"
        variant="particles"
        theme="purple"
      />

      <main className="container mx-auto px-4 py-16">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            AI PPT Generator
          </motion.h1>
          <motion.p
            className="text-gray-300 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Instantly generate professional PowerPoint presentations from any topic. Our AI creates beautiful slides with content, images, and formatting.
          </motion.p>

          <motion.p className="text-gray-400 mb-8 italic">
            Note: You can view all your generated presentations in your dashboard.
          </motion.p>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="generate">Create Presentation</TabsTrigger>
              <TabsTrigger value="result" disabled={!pptUrl && !pdfUrl}>
                Results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate">
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <motion.div variants={itemVariants}>
                      <CardTitle className="flex items-center">
                        <Presentation className="h-5 w-5 mr-2 text-pink-400" />
                        Generate a Presentation
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Enter your topic and preferences to create a professional presentation
                      </CardDescription>
                    </motion.div>
                  </CardHeader>
                  <CardContent>
                    <motion.div className="space-y-6" variants={containerVariants}>
                      <motion.div variants={itemVariants} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Topic <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            placeholder="e.g. Artificial Intelligence in Healthcare"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Extra Information / Focus <span className="text-red-400">*</span></label>
                          <input
                            type="text"
                            className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            value={extraInfoSource}
                            onChange={e => setExtraInfoSource(e.target.value)}
                            placeholder="e.g. Focus more on examples and case studies"
                          />
                        </div>

                        {/* Coin Balance Display */}
                        {session?.user && topic.trim() && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.3 }}
                          >
                            <CoinBalanceDisplay
                              coins={userCoins}
                              requiredCoins={2}
                              isLoading={isCheckingCoins}
                            />
                          </motion.div>
                        )}

                        {error && (
                          <motion.div
                            className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <p className="text-red-400 text-sm">{error}</p>
                          </motion.div>
                        )}
                      </motion.div>
                    </motion.div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      onClick={handleGenerate}
                      disabled={!topic.trim() || isLoading || !session?.user || (session?.user && userCoins !== null && userCoins < 2)}
                      className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white"
                      size="lg"
                    >
                      <Presentation className="h-4 w-4 mr-2" />
                      {!session?.user ? "Sign In Required" : 
                       userCoins !== null && userCoins < 2 ? "Insufficient Coins (Need 2)" : 
                       "Generate Presentation"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="result">
              {(pptUrl || pdfUrl) ? (
                <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
                  <motion.div 
                    className="flex justify-between items-center"
                    variants={itemVariants}
                  >
                    <h2 className="text-2xl font-bold">Presentation Ready!</h2>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <CheckCircle2 className="h-5 w-5 mr-2 text-green-400" />
                          Your Presentation is Ready!
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          AI has successfully created your presentation on "{topic}"
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 border border-green-500/30 rounded-lg p-6 mb-6">
                          <div className="flex items-center mb-4">
                            <CheckCircle2 className="h-6 w-6 text-green-400 mr-3" />
                            <div>
                              <p className="text-green-400 font-medium">Presentation Generated Successfully!</p>
                              <p className="text-green-200 text-sm mt-1">
                                {slideCount} slides created • Topic: {topic}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pptUrl && (
                              <div className="bg-slate-700/50 p-4 rounded-lg border border-blue-500/30">
                                <div className="flex items-center mb-2">
                                  <Presentation className="h-5 w-5 text-blue-400 mr-2" />
                                  <span className="font-medium text-blue-400">PowerPoint File</span>
                                </div>
                                <p className="text-sm text-gray-300 mb-3">
                                  Editable PowerPoint presentation with all slides
                                </p>
                                <Button
                                  onClick={() => handleDownload(pptUrl, `${topic.replace(/[^a-zA-Z0-9]/g, '_')}.pptx`, 'PPT')}
                                  disabled={isDownloadingPPT}
                                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  {isDownloadingPPT ? "Downloading..." : "Download PPT"}
                                </Button>
                              </div>
                            )}

                            {pdfUrl && (
                              <div className="bg-slate-700/50 p-4 rounded-lg border border-red-500/30">
                                <div className="flex items-center mb-2">
                                  <FileText className="h-5 w-5 text-red-400 mr-2" />
                                  <span className="font-medium text-red-400">PDF File</span>
                                </div>
                                <p className="text-sm text-gray-300 mb-3">
                                  PDF version for easy sharing and viewing
                                </p>
                                <Button
                                  onClick={() => handleDownload(pdfUrl, `${topic.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`, 'PDF')}
                                  disabled={isDownloadingPDF}
                                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  {isDownloadingPDF ? "Downloading..." : "Download PDF"}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-center">
                          <Button
                            onClick={() => {
                              setActiveTab("generate")
                              // Reset form for new generation
                              setTopic("")
                              setExtraInfoSource("")
                              setPresentationFor("")
                              setPptUrl("")
                              setPdfUrl("")
                              setError("")
                            }}
                            variant="outline"
                            className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:bg-purple-500/20"
                          >
                            <Presentation className="h-4 w-4 mr-2" />
                            Create Another Presentation
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-gray-400">No presentation generated yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
