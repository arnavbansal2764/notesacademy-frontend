"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Download, ChevronLeft, Clock, FileText, Share2, BrainCircuit, BookOpen, Lightbulb, Sparkles, Layers, MessageCircle, BookmarkIcon, PenLine } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { MindMap, MindMapData } from "@/components/mindmap/mindmap";

// Define types
interface MindmapNode {
  id?: string;
  text: string;
  children: MindmapNode[];
  nodeSvgShape?: {
    shape: string;
    shapeProps: {
      r: number;
      fill: string;
      strokeWidth: number;
    };
  };
}

interface MindmapResult {
  id: string;
  title: string;
  pdfName: string | null;
  pdfUrl: string;
  nodeCount: number;
  mindmapData: MindMapData;
  createdAt: string;
}

export default function MindmapViewerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const mindmapId = params.id as string;

  const [mindmap, setMindmap] = useState<MindmapResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mindmapContainerRef = useRef<HTMLDivElement>(null);
  const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (!mindmapId) {
      setError("Invalid mindmap ID");
      setIsLoading(false);
      return;
    }

    const fetchMindmap = async () => {
      try {
        // Updated to use POST method with ID in the request body
        const response = await fetch(`/api/mindmap-results/${mindmapId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: mindmapId }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch mindmap");
        }

        const data = await response.json();
        setMindmap(data.mindmap);
      } catch (err) {
        console.error("Error fetching mindmap:", err);
        setError("Failed to load mindmap. It might not exist or you don't have permission to view it.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMindmap();
  }, [mindmapId, router, status]);

  const countNodes = (node: MindmapNode): number => {
    if (!node) return 0;

    let count = 1; // Count the current node

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        count += countNodes(child);
      }
    }

    return count;
  };

  const expandAllForExport = () => {
    // Store current expansion state
    const currentExpandedState = { ...expandedNodes };

    // Expand all nodes
    const allExpanded: { [key: string]: boolean } = {};
    const expandAll = (node: any) => {
      if (!node) return;
      if (node.id) allExpanded[node.id] = true;
      if (node.children && node.children.length > 0) {
        node.children.forEach(expandAll);
      }
    };

    if (mindmap && mindmap.mindmapData && mindmap.mindmapData.root) {
      expandAll(mindmap.mindmapData.root);
      // Update the state
      setExpandedNodes(allExpanded);
    }

    // Return the stored state for restoration later
    return currentExpandedState;
  };

  const downloadAsPDF = async () => {
    if (!mindmap || !mindmapContainerRef.current) return;

    try {
      const originalState = expandAllForExport();

      // Wait for DOM to update after expanding nodes
      await new Promise((resolve) => setTimeout(resolve, 1000));

      mindmapContainerRef.current.classList.add("exporting");

      const canvas = await html2canvas(mindmapContainerRef.current, {
        scale: 2,
        backgroundColor: "#0f172a",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF("landscape", "mm", "a4");
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      if (mindmap) {
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(`Generated from: ${mindmap.pdfName || "Unknown source"}`, 10, pdf.internal.pageSize.height - 10);
        pdf.text(`Date: ${new Date().toLocaleDateString()}`, 10, pdf.internal.pageSize.height - 6);
      }

      pdf.save(`mindmap-${mindmap?.title || "visualization"}.pdf`);

      // Restore original expansion state
      setTimeout(() => setExpandedNodes(originalState), 500);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      if (mindmapContainerRef.current) {
        mindmapContainerRef.current.classList.remove("exporting");
      }
    }
  };

  const shareMindmap = async () => {
    if (!mindmap) return;

    try {
      const shareUrl = `${window.location.origin}/flowchart-generator/view/${mindmapId}`;

      if (navigator.share) {
        await navigator.share({
          title: mindmap.title || "Mindmap Visualization",
          text: "Check out this mindmap visualization",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading mindmap...</p>
        </div>
      </div>
    );
  }

  if (error || !mindmap) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <Navbar />

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-lg mx-auto bg-slate-800 rounded-lg p-6 border border-slate-700 text-center">
            <h2 className="text-xl font-medium mb-4">Error Loading Mindmap</h2>
            <p className="text-gray-300 mb-6">{error || "Mindmap could not be found"}</p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          className="flex items-center mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="hover:bg-slate-800"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Button>
        </motion.div>

        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            {mindmap.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {formatDistanceToNow(new Date(mindmap.createdAt), { addSuffix: true })}
            </div>
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              {mindmap.pdfName || "Unnamed document"}
            </div>
          </div>
        </motion.div>

        <Card className="bg-slate-800 border-slate-700 mb-10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Mindmap Visualization</CardTitle>
              <CardDescription className="text-gray-400">
                Nodes: {countNodes(mindmap.mindmapData.root)} • Interactive tree visualization
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={downloadAsPDF} className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export as PDF
              </Button>
              <Button variant="outline" size="sm" onClick={shareMindmap} className="flex items-center">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div ref={mindmapContainerRef} className="mindmap-container w-full h-[70vh]">
              {mindmap && mindmap.mindmapData && (
                <MindMap 
                  data={mindmap.mindmapData} 
                  theme="blue" 
                  expanded={false} 
                />
              )}
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Visualization Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span>Type</span>
                    </div>
                    <span className="text-sm text-gray-300">Mindmap</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span>Nodes</span>
                    </div>
                    <span className="text-sm text-gray-300">{countNodes(mindmap.mindmapData.root)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* User Guide Section */}
        <Card className="bg-slate-800 border-slate-700 mb-10">
          <CardHeader>
            <CardTitle>How to Use This Mindmap</CardTitle>
            <CardDescription className="text-gray-400">
              Tips for navigating and using your mindmap visualization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Explore Concepts</h3>
                  <p className="text-sm text-gray-300">Click on nodes to expand or collapse branches and explore concepts in depth.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Download className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Export Your Work</h3>
                  <p className="text-sm text-gray-300">Download as PDF to save the mindmap for offline reference or printing.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Share2 className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Share with Others</h3>
                  <p className="text-sm text-gray-300">Share the mindmap link with friends or colleagues for collaborative learning.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <BrainCircuit className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Understand Connections</h3>
                  <p className="text-sm text-gray-300">See how concepts connect to better understand complex relationships in the material.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}