"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Clock, FileText, Award, CheckCircle, XCircle, Network, Download, BookOpen } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Modal } from "@/components/ui/modal";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import toast from "react-hot-toast";
import { downloadMCQPDF, downloadSubjectivePDF } from "@/lib/pdf-generator";

interface SubjectiveResult {
  id: string;
  title: string;
  pdfName: string | null;
  pdfUrl: string;
  questions: {
    question: string;
    answer: string;
  }[];
  createdAt: string;
}

interface MCQResult {
  id: string;
  title: string;
  pdfName: string | null;
  pdfUrl: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  timeTaken: number;
  questions: {
    question: string;
    options: string[];
    correct_answer: string;
    selected_answer?: string;
    explanation?: string;
  }[];
  createdAt: string;
}

interface MindmapResult {
  id: string;
  title: string;
  pdfName: string | null;
  pdfUrl: string;
  mindmapUrl: string;
  createdAt: string;
}

interface ShortNotesResult {
  id: string;
  title: string;
  pdfName: string | null;
  pdfUrl: string;
  notesUrl: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  coins: number;
  createdAt?: string;
}

interface PaymentHistory {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  contactNumber?: string;
  createdAt: string;
  transactionId?: string;
  orderId?: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subjectiveResults, setSubjectiveResults] = useState<SubjectiveResult[]>([]);
  const [mcqResults, setMcqResults] = useState<MCQResult[]>([]);
  const [mindmapResults, setMindmapResults] = useState<MindmapResult[]>([]);
  const [shortNotesResults, setShortNotesResults] = useState<ShortNotesResult[]>([]);
  const [userData, setUserData] = useState<User | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [isLoadingSubjective, setIsLoadingSubjective] = useState(true);
  const [isLoadingMCQ, setIsLoadingMCQ] = useState(true);
  const [isLoadingMindmaps, setIsLoadingMindmaps] = useState(true);
  const [isLoadingShortNotes, setIsLoadingShortNotes] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [selectedSubjective, setSelectedSubjective] = useState<SubjectiveResult | null>(null);
  const [selectedMCQ, setSelectedMCQ] = useState<MCQResult | null>(null);
  const [isSubjectiveModalOpen, setIsSubjectiveModalOpen] = useState(false);
  const [isMCQModalOpen, setIsMCQModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
    }

    if (status === "authenticated") {
      fetchSubjectiveResults();
      fetchMCQResults();
      fetchMindmapResults();
      fetchShortNotesResults();
      fetchUserProfile();
    }
  }, [status, router]);

  const fetchSubjectiveResults = async () => {
    setIsLoadingSubjective(true);
    try {
      const response = await fetch("/api/subjective-results");
      if (!response.ok) {
        throw new Error("Failed to fetch subjective results");
      }
      const data = await response.json();
      setSubjectiveResults(data.results);
    } catch (error) {
      console.error("Error fetching subjective results:", error);
    } finally {
      setIsLoadingSubjective(false);
    }
  };

  const fetchMCQResults = async () => {
    setIsLoadingMCQ(true);
    try {
      const response = await fetch("/api/mcq-results");
      if (!response.ok) {
        throw new Error("Failed to fetch MCQ results");
      }
      const data = await response.json();
      setMcqResults(data.results);
    } catch (error) {
      console.error("Error fetching MCQ results:", error);
    } finally {
      setIsLoadingMCQ(false);
    }
  };

  const fetchMindmapResults = async () => {
    setIsLoadingMindmaps(true);
    try {
      const response = await fetch("/api/mindmap-results");
      if (!response.ok) throw new Error("Failed to fetch mindmap results");
      const data = await response.json();
      setMindmapResults(data.results ?? []);    // ensure array
    } catch (error) {
      console.error("Error fetching mindmap results:", error);
    } finally {
      setIsLoadingMindmaps(false);
    }
  };

  const fetchShortNotesResults = async () => {
    setIsLoadingShortNotes(true);
    try {
      const response = await fetch("/api/short-notes-results");
      if (!response.ok) {
        throw new Error("Failed to fetch short notes results");
      }
      const data = await response.json();
      setShortNotesResults(data.results);
    } catch (error) {
      console.error("Error fetching short notes results:", error);
    } finally {
      setIsLoadingShortNotes(false);
    }
  };

  const fetchUserProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const response = await fetch("/api/user-profile");
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }
      const data = await response.json();
      setUserData(data.user);
      setPaymentHistory(data.payments || []);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const viewSubjectiveResult = (result: SubjectiveResult) => {
    setSelectedSubjective(result);
    setIsSubjectiveModalOpen(true);
  };

  const viewMCQResult = (result: MCQResult) => {
    setSelectedMCQ(result);
    setIsMCQModalOpen(true);
  };

  const viewMindmapResult = (result: MindmapResult) => {
    if (!result.mindmapUrl) {
      toast.error("Mindmap data is unavailable");
      return;
    }
    
    // Use the direct S3 URL from the mindmap result
    router.push(
      `/view?url=${encodeURIComponent(result.mindmapUrl)}&title=${encodeURIComponent(
        result.title || "Mindmap"
      )}`
    );
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleDownloadMCQPDF = (result: MCQResult) => {
    try {
      const title = result.title || result.pdfName?.replace('.pdf', '') || 'MCQ Quiz';
      const mcqsForPDF = result.questions.map(q => ({
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation || ''
      }));

      downloadMCQPDF(title, mcqsForPDF);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF");
    }
  };

  const handleDownloadSubjectivePDF = (result: SubjectiveResult, withAnswers: boolean = false) => {
    try {
      const title = result.title || result.pdfName?.replace('.pdf', '') || 'Subjective Questions';
      const questionsForPDF = result.questions.map(q => ({
        question: q.question,
        answer: q.answer
      }));

      downloadSubjectivePDF(title, questionsForPDF, undefined, withAnswers);
      const type = withAnswers ? "with answers" : "questions only";
      toast.success(`PDF ${type} downloaded successfully!`);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF");
    }
  };

  const handleDownloadShortNotes = async (result: ShortNotesResult) => {
    try {
      const response = await fetch(result.notesUrl);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = result.pdfName?.replace('.pdf', '_short_notes.pdf') || 'short_notes.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Short notes downloaded successfully!");
    } catch (error) {
      console.error("Error downloading short notes:", error);
      toast.error("Failed to download short notes");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <Navbar />

      <main className="container mx-auto px-2 sm:px-4 py-8 sm:py-16">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent px-2 sm:px-0"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Your Dashboard
          </motion.h1>
          <motion.p
            className="text-gray-300 mb-6 sm:mb-8 px-2 sm:px-0 text-sm sm:text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            View your previously generated content, quiz results and account information
          </motion.p>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6 sm:mb-8 h-auto p-1 gap-1 sm:gap-0">
              <TabsTrigger value="profile" className="text-xs sm:text-sm px-1 sm:px-3 py-2">
                <span className="hidden sm:inline">Profile</span>
                <span className="sm:hidden">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="subjective" className="text-xs sm:text-sm px-1 sm:px-3 py-2">
                <span className="hidden sm:inline">Subjective</span>
                <span className="sm:hidden">Q&A</span>
              </TabsTrigger>
              <TabsTrigger value="mcq" className="text-xs sm:text-sm px-1 sm:px-3 py-2">
                <span className="hidden sm:inline">MCQ</span>
                <span className="sm:hidden">MCQ</span>
              </TabsTrigger>
              <TabsTrigger value="mindmaps" className="text-xs sm:text-sm px-1 sm:px-3 py-2">
                <span className="hidden sm:inline">Mindmaps</span>
                <span className="sm:hidden">Maps</span>
              </TabsTrigger>
              <TabsTrigger value="shortnotes" className="text-xs sm:text-sm px-1 sm:px-3 py-2">
                <span className="hidden sm:inline">Notes</span>
                <span className="sm:hidden">Notes</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="px-2 sm:px-0">
              {isLoadingProfile ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
                </div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-slate-800 border-slate-700 lg:col-span-1">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg sm:text-xl">Account Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-center mb-4 sm:mb-6">
                        <Avatar className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 border-2 border-blue-500">
                          <AvatarImage 
                            src={userData?.image || ''} 
                            alt={userData?.name || 'User'} 
                          />
                          <AvatarFallback 
                            className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl sm:text-2xl lg:text-3xl font-bold"
                          >
                            {userData?.name?.charAt(0)?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-400">Name</p>
                          <p className="font-medium text-sm sm:text-base truncate">{userData?.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Email</p>
                          <p className="font-medium text-sm sm:text-base truncate">{userData?.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Coins</p>
                          <p className="font-medium text-yellow-400 flex items-center text-sm sm:text-base">
                            <span className="text-lg sm:text-xl mr-1">🪙</span>
                            {userData?.coins || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Member Since</p>
                          <p className="font-medium text-sm sm:text-base">
                            {userData?.createdAt
                              ? new Date(userData.createdAt).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg sm:text-xl">Activity Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-slate-700/50 p-3 sm:p-4 rounded-lg text-center">
                          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-400">{subjectiveResults.length}</p>
                          <p className="text-xs sm:text-sm text-gray-300">Subjective Q&As</p>
                        </div>
                        <div className="bg-slate-700/50 p-3 sm:p-4 rounded-lg text-center">
                          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-400">{mcqResults.length}</p>
                          <p className="text-xs sm:text-sm text-gray-300">MCQ Quizzes</p>
                        </div>
                        <div className="bg-slate-700/50 p-3 sm:p-4 rounded-lg text-center">
                          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-400">{mindmapResults.length}</p>
                          <p className="text-xs sm:text-sm text-gray-300">Mindmaps</p>
                        </div>
                        <div className="bg-slate-700/50 p-3 sm:p-4 rounded-lg text-center">
                          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-400">{shortNotesResults.length}</p>
                          <p className="text-xs sm:text-sm text-gray-300">Short Notes</p>
                        </div>

                        {mcqResults.length > 0 && (
                          <div className="bg-slate-700/50 p-3 sm:p-4 rounded-lg text-center col-span-2">
                            <p className="text-xs sm:text-sm text-gray-300 mb-1">Average Score</p>
                            <div className="w-full bg-slate-600 h-3 sm:h-4 rounded-full">
                              <div
                                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 sm:h-4 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(
                                      0,
                                      mcqResults.reduce((acc, result) => acc + result.score, 0) /
                                        mcqResults.length
                                    )
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <p className="mt-1 font-medium text-sm sm:text-base">
                              {(
                                mcqResults.reduce((acc, result) => acc + result.score, 0) /
                                mcqResults.length
                              ).toFixed(1)}
                              %
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700 lg:col-span-3">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg sm:text-xl">Payment History</CardTitle>
                      <CardDescription className="text-gray-400 text-sm">
                        Recent transactions (showing last 10)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {paymentHistory.length > 0 ? (
                        <div className="overflow-x-auto -mx-2 sm:mx-0">
                          <div className="min-w-full inline-block align-middle">
                            <table className="w-full min-w-[500px]">
                              <thead>
                                <tr className="border-b border-slate-700">
                                  <th className="text-left p-2 text-xs sm:text-sm">Date</th>
                                  <th className="text-left p-2 text-xs sm:text-sm">Payment ID</th>
                                  <th className="text-left p-2 text-xs sm:text-sm">Amount</th>
                                  <th className="text-left p-2 text-xs sm:text-sm">Method</th>
                                  <th className="text-left p-2 text-xs sm:text-sm">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {paymentHistory.slice(0, 10).map((payment) => (
                                  <tr
                                    key={payment.id}
                                    className="border-b border-slate-700/50 hover:bg-slate-700/30"
                                  >
                                    <td className="p-2 text-xs sm:text-sm">
                                      {new Date(payment.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-2 font-mono text-xs">{payment.paymentId.slice(0, 8)}...</td>
                                    <td className="p-2 text-xs sm:text-sm">
                                      ₹{payment.amount / 100}
                                    </td>
                                    <td className="p-2 capitalize text-xs sm:text-sm">{payment.paymentMethod}</td>
                                    <td className="p-2">
                                      <span
                                        className={`px-1 sm:px-2 py-1 rounded-full text-xs font-medium ${
                                          payment.status === "captured" || 
                                          payment.status === "completed" || 
                                          payment.status === "succeeded"
                                            ? "bg-green-900/50 text-green-400 border border-green-600/30"
                                            : payment.status === "failed"
                                            ? "bg-red-900/50 text-red-400 border border-red-600/30"
                                            : payment.status === "pending"
                                            ? "bg-yellow-900/50 text-yellow-400 border border-yellow-600/30"
                                            : "bg-gray-900/50 text-gray-400 border border-gray-600/30"
                                        }`}
                                      >
                                        {payment.status === "captured" ? "✓" : 
                                         payment.status === "completed" ? "✓" :
                                         payment.status === "succeeded" ? "✓" :
                                         payment.status === "failed" ? "✗" :
                                         payment.status === "pending" ? "⏳" :
                                         payment.status.charAt(0).toUpperCase()}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {paymentHistory.length > 10 && (
                            <div className="text-center mt-4 pt-4 border-t border-slate-700">
                              <p className="text-xs sm:text-sm text-gray-400">
                                Showing 10 of {paymentHistory.length} transactions
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          <p className="text-sm">No payment history found</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="subjective" className="px-2 sm:px-0">
              {isLoadingSubjective ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
                </div>
              ) : subjectiveResults.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {subjectiveResults.map((result) => (
                    <Card
                      key={result.id}
                      className="bg-slate-800 border-slate-700 hover:bg-slate-800/80 transition-colors"
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <span className="truncate text-sm sm:text-base">{result.title}</span>
                          <span className="text-xs text-gray-400 flex items-center flex-shrink-0">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(result.createdAt), { addSuffix: true })}
                          </span>
                        </CardTitle>
                        <CardDescription className="text-gray-400 text-sm">
                          {result.questions.length} questions
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="py-3">
                        <p className="text-xs sm:text-sm text-gray-300 truncate">
                          <FileText className="h-3 w-3 sm:h-4 sm:w-4 inline mr-2" />
                          {result.pdfName || "Unnamed document"}
                        </p>
                      </CardContent>
                      <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between pt-3">
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadSubjectivePDF(result, false)}
                            className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/30 hover:bg-blue-500/20 flex-1 sm:flex-none text-xs sm:text-sm"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Questions
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadSubjectivePDF(result, true)}
                            className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 hover:bg-green-500/20 flex-1 sm:flex-none text-xs sm:text-sm"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            + Answers
                          </Button>
                        </div>
                        <Button
                          onClick={() => viewSubjectiveResult(result)}
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 w-full sm:w-auto text-xs sm:text-sm"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          View Q&A
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-slate-800 p-4 sm:p-6 rounded-full mb-4">
                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-medium mb-2">No subjective results yet</h3>
                  <p className="text-gray-400 mb-4 sm:mb-6 max-w-md text-sm sm:text-base px-4">
                    Generate subjective questions from your notes and they will appear here
                  </p>
                  <Button
                    onClick={() => router.push("/subjective-qa")}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-sm sm:text-base"
                  >
                    Generate Subjective Q&A
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="mcq" className="px-2 sm:px-0">
              {isLoadingMCQ ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
                </div>
              ) : mcqResults.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {mcqResults.map((result) => (
                    <Card
                      key={result.id}
                      className="bg-slate-800 border-slate-700 hover:bg-slate-800/80 transition-colors"
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <span className="truncate text-sm sm:text-base">{result.title || "MCQ Quiz"}</span>
                          <span className="text-xs text-gray-400 flex items-center flex-shrink-0">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(result.createdAt), { addSuffix: true })}
                          </span>
                        </CardTitle>
                        <CardDescription className="text-gray-400 text-sm">
                          Score: {result.score.toFixed(1)}% • {result.totalQuestions} questions
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="py-3">
                        <div className="flex flex-col space-y-2">
                          <p className="text-xs sm:text-sm text-gray-300 truncate">
                            <FileText className="h-3 w-3 sm:h-4 sm:w-4 inline mr-2" />
                            {result.pdfName || "Unnamed document"}
                          </p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="flex items-center text-green-400">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              <span className="truncate">{result.correctAnswers} correct</span>
                            </div>
                            <div className="flex items-center text-red-400">
                              <XCircle className="h-3 w-3 mr-1" />
                              <span className="truncate">{result.incorrectAnswers} wrong</span>
                            </div>
                            <div className="flex items-center text-blue-400">
                              <Clock className="h-3 w-3 mr-1" />
                              <span className="truncate">{formatTime(result.timeTaken)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between pt-3">
                        <Button
                          variant="outline"
                          onClick={() => handleDownloadMCQPDF(result)}
                          className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 hover:bg-green-500/20 w-full sm:w-auto text-xs sm:text-sm"
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Download PDF
                        </Button>
                        <Button
                          onClick={() => viewMCQResult(result)}
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 w-full sm:w-auto text-xs sm:text-sm"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          View Results
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-slate-800 p-4 sm:p-6 rounded-full mb-4">
                    <Award className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-medium mb-2">No MCQ results yet</h3>
                  <p className="text-gray-400 mb-4 sm:mb-6 max-w-md text-sm sm:text-base px-4">
                    Generate MCQ quizzes from your notes and complete them to see results here
                  </p>
                  <Button
                    onClick={() => router.push("/mcq-generator")}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-sm sm:text-base"
                  >
                    Generate MCQ Quiz
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="mindmaps" className="px-2 sm:px-0">
              {isLoadingMindmaps ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
                </div>
              ) : mindmapResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {mindmapResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-3 sm:p-4 bg-slate-800 rounded-lg border border-slate-700 flex flex-col"
                    >
                      <h3 className="text-sm sm:text-lg font-semibold text-white truncate mb-2">
                        {result.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Created: {new Date(result.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400 truncate mt-1">
                        Source: {result.pdfName || "Unnamed"}
                      </p>
                      <Button
                        onClick={() => viewMindmapResult(result)}
                        disabled={!result.mindmapUrl}
                        className={`mt-3 sm:mt-4 w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-xs sm:text-sm
                          ${!result.mindmapUrl ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        View Mindmap
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-slate-800 p-4 sm:p-6 rounded-full mb-4">
                    <Network className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-medium mb-2">No mindmaps yet</h3>
                  <p className="text-gray-400 mb-4 sm:mb-6 max-w-md text-sm sm:text-base px-4">
                    Generate mindmaps from your notes to visualize concepts and relationships
                  </p>
                  <Button
                    onClick={() => router.push("/flowchart-generator")}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-sm sm:text-base"
                  >
                    Generate Mindmap
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="shortnotes" className="px-2 sm:px-0">
              {isLoadingShortNotes ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
                </div>
              ) : shortNotesResults.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {shortNotesResults.map((result) => (
                    <Card
                      key={result.id}
                      className="bg-slate-800 border-slate-700 hover:bg-slate-800/80 transition-colors"
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <span className="truncate text-sm sm:text-base">{result.title}</span>
                          <span className="text-xs text-gray-400 flex items-center flex-shrink-0">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(result.createdAt), { addSuffix: true })}
                          </span>
                        </CardTitle>
                        <CardDescription className="text-gray-400 text-sm">
                          Condensed notes from your study material
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="py-3">
                        <p className="text-xs sm:text-sm text-gray-300 truncate">
                          <FileText className="h-3 w-3 sm:h-4 sm:w-4 inline mr-2" />
                          {result.pdfName || "Unnamed document"}
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-end pt-3">
                        <Button
                          onClick={() => handleDownloadShortNotes(result)}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 w-full sm:w-auto text-xs sm:text-sm"
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Download Notes
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-slate-800 p-4 sm:p-6 rounded-full mb-4">
                    <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-medium mb-2">No short notes yet</h3>
                  <p className="text-gray-400 mb-4 sm:mb-6 max-w-md text-sm sm:text-base px-4">
                    Generate concise short notes from your study materials and they will appear here
                  </p>
                  <Button
                    onClick={() => router.push("/short-notes-generator")}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-sm sm:text-base"
                  >
                    Generate Short Notes
                  </Button>
                </div>
              )}
            </TabsContent>

          </Tabs>
        </motion.div>
      </main>

      <Modal isOpen={isSubjectiveModalOpen} onClose={() => setIsSubjectiveModalOpen(false)}>
        {selectedSubjective && (
          <div className="p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              {selectedSubjective.title || "Subjective Q&A"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">
              Generated {formatDistanceToNow(new Date(selectedSubjective.createdAt), { addSuffix: true })}
            </p>

            <div className="space-y-4 sm:space-y-6 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-2">
              {selectedSubjective.questions.map((qa, index) => (
                <div key={index} className="border border-slate-700 rounded-lg p-3 sm:p-4">
                  <h3 className="text-sm sm:text-lg font-medium mb-2 text-blue-400">Question {index + 1}:</h3>
                  <p className="text-gray-300 p-2 sm:p-3 bg-slate-700/50 rounded-lg mb-3 sm:mb-4 text-sm sm:text-base">{qa.question}</p>

                  <h4 className="text-sm font-medium mb-2 text-indigo-400">Answer:</h4>
                  <p className="text-gray-300 p-2 sm:p-3 bg-indigo-900/20 rounded-lg border border-indigo-800/30 whitespace-pre-line text-sm sm:text-base">
                    {qa.answer}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:justify-between">
              <div className="flex gap-2 order-2 sm:order-1">
                <Button
                  variant="outline"
                  onClick={() => handleDownloadSubjectivePDF(selectedSubjective, false)}
                  className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/30 hover:bg-blue-500/20 flex-1 sm:flex-none text-xs sm:text-sm"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Questions Only
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownloadSubjectivePDF(selectedSubjective, true)}
                  className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 hover:bg-green-500/20 flex-1 sm:flex-none text-xs sm:text-sm"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  With Answers
                </Button>
              </div>
              <Button
                onClick={() => setIsSubjectiveModalOpen(false)}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 order-1 sm:order-2 text-xs sm:text-sm"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isMCQModalOpen} onClose={() => setIsMCQModalOpen(false)}>
        {selectedMCQ && (
          <div className="p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              {selectedMCQ.title || "MCQ Quiz Results"}
            </h2>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-slate-800 p-2 sm:p-3 rounded-lg">
                <p className="text-xs text-gray-400">Score</p>
                <p className="text-lg sm:text-xl font-bold">{selectedMCQ.score.toFixed(1)}%</p>
              </div>
              <div className="bg-slate-800 p-2 sm:p-3 rounded-lg">
                <p className="text-xs text-gray-400">Time</p>
                <p className="text-lg sm:text-xl font-bold">{formatTime(selectedMCQ.timeTaken)}</p>
              </div>
              <div className="bg-slate-800 p-2 sm:p-3 rounded-lg">
                <p className="text-xs text-gray-400">Correct</p>
                <p className="text-lg sm:text-xl font-bold text-green-400">{selectedMCQ.correctAnswers}</p>
              </div>
              <div className="bg-slate-800 p-2 sm:p-3 rounded-lg">
                <p className="text-xs text-gray-400">Incorrect</p>
                <p className="text-lg sm:text-xl font-bold text-red-400">{selectedMCQ.incorrectAnswers}</p>
              </div>
              <div className="bg-slate-800 p-2 sm:p-3 rounded-lg col-span-2 sm:col-span-1">
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-lg sm:text-xl font-bold">{selectedMCQ.totalQuestions}</p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-2">
              {selectedMCQ.questions.map((question, qIndex) => {
                const isCorrect = question.selected_answer === question.correct_answer;

                return (
                  <div
                    key={qIndex}
                    className={`border rounded-lg p-3 sm:p-4 ${
                      question.selected_answer
                        ? isCorrect
                          ? "border-green-600 bg-green-900/10"
                          : "border-red-600 bg-red-900/10"
                        : "border-slate-700"
                    }`}
                  >
                    <h3 className="text-sm sm:text-lg font-medium mb-3 flex items-start">
                      <span className="bg-slate-700 text-white p-1 rounded-md mr-2 text-xs sm:text-sm flex-shrink-0">
                        {qIndex + 1}
                      </span>
                      <span className="text-white text-sm sm:text-base">{question.question}</span>
                    </h3>

                    <div className="ml-6 sm:ml-7 space-y-2 mb-4">
                      {question.options.map((option, oIndex) => {
                        const optionLetter = String.fromCharCode(65 + oIndex); // A, B, C, D
                        const isSelected = question.selected_answer === optionLetter;
                        const isCorrectOption = question.correct_answer === optionLetter;

                        let optionClass = "p-2 rounded-md border border-slate-600";

                        if (isSelected && isCorrect) {
                          optionClass += " bg-green-900/20 border-green-500";
                        } else if (isSelected && !isCorrect) {
                          optionClass += " bg-red-900/20 border-red-500";
                        } else if (isCorrectOption) {
                          optionClass += " bg-green-900/20 border-green-500";
                        }

                        return (
                          <div key={oIndex} className={optionClass}>
                            <div className="flex items-start">
                              <span className="mr-2 font-medium text-sm">{optionLetter}.</span>
                              <span className="text-sm sm:text-base flex-1">{option}</span>
                              {isSelected && !isCorrect && (
                                <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 ml-auto flex-shrink-0" />
                              )}
                              {isCorrectOption && (
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 ml-auto flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {question.explanation && (
                      <div className="mt-4 p-2 sm:p-3 bg-slate-800 rounded-md border border-slate-700">
                        <p className="text-xs sm:text-sm font-medium text-blue-400 mb-1">Explanation:</p>
                        <p className="text-xs sm:text-sm text-gray-300">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:justify-between">
              <Button
                variant="outline"
                onClick={() => handleDownloadMCQPDF(selectedMCQ)}
                className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 hover:bg-green-500/20 order-2 sm:order-1 text-xs sm:text-sm"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Download PDF
              </Button>
              <Button
                onClick={() => setIsMCQModalOpen(false)}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 order-1 sm:order-2 text-xs sm:text-sm"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Footer />
    </div>
  );
}