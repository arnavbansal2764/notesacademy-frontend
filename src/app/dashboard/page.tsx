"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Clock, FileText } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Modal } from "@/components/ui/modal";
import { formatDistanceToNow } from "date-fns";

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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [results, setResults] = useState<SubjectiveResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<SubjectiveResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("subjective");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }

    if (status === "authenticated") {
      fetchResults();
    }
  }, [status, router]);

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/subjective-results");
      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const viewResult = (result: SubjectiveResult) => {
    setSelectedResult(result);
    setIsModalOpen(true);
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

      <main className="container mx-auto px-4 py-16">
        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Your Dashboard
          </motion.h1>
          <motion.p
            className="text-gray-300 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            View your previously generated content and quiz results
          </motion.p>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="subjective">Subjective Q&As</TabsTrigger>
              <TabsTrigger value="mcq">MCQ Results</TabsTrigger>
              <TabsTrigger value="mindmaps">Mindmaps</TabsTrigger>
            </TabsList>

            <TabsContent value="subjective">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
                </div>
              ) : results.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {results.map((result) => (
                    <Card key={result.id} className="bg-slate-800 border-slate-700 hover:bg-slate-800/80 transition-colors">
                      <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                          <span className="truncate">{result.title}</span>
                          <span className="text-sm font-normal text-gray-400 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(result.createdAt), { addSuffix: true })}
                          </span>
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          {result.questions.length} questions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-300 truncate">
                          <FileText className="h-4 w-4 inline mr-2" />
                          {result.pdfName || "Unnamed document"}
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-end">
                        <Button
                          onClick={() => viewResult(result)}
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Q&A
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-slate-800 p-6 rounded-full mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No subjective results yet</h3>
                  <p className="text-gray-400 mb-6 max-w-md">
                    Generate subjective questions from your notes and they will appear here
                  </p>
                  <Button
                    onClick={() => router.push("/subjective-qa")}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                  >
                    Generate Subjective Q&A
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="mcq">
              {/* This will be implemented separately for MCQ results */}
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-slate-800 p-6 rounded-full mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">MCQ Results</h3>
                <p className="text-gray-400 mb-6 max-w-md">
                  This section will display your MCQ quiz results once implemented
                </p>
              </div>
            </TabsContent>

            <TabsContent value="mindmaps">
              {/* This will be implemented separately for mindmaps */}
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-slate-800 p-6 rounded-full mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">Mindmaps</h3>
                <p className="text-gray-400 mb-6 max-w-md">
                  This section will display your generated mindmaps once implemented
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      {/* Detail Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedResult && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              {selectedResult.title}
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Generated {formatDistanceToNow(new Date(selectedResult.createdAt), { addSuffix: true })}
            </p>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {selectedResult.questions.map((qa, index) => (
                <div key={index} className="border border-slate-700 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2 text-blue-400">Question {index + 1}:</h3>
                  <p className="text-gray-300 p-3 bg-slate-700/50 rounded-lg mb-4">{qa.question}</p>
                  
                  <h4 className="text-md font-medium mb-2 text-indigo-400">Answer:</h4>
                  <p className="text-gray-300 p-3 bg-indigo-900/20 rounded-lg border border-indigo-800/30 whitespace-pre-line">
                    {qa.answer}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setIsModalOpen(false)}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
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