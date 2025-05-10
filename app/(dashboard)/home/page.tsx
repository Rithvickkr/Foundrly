"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardHome() {
  const [userName, setUserName] = useState("Rithvick");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: "AI", message: "Welcome! Need help with your pitch deck?" },
  ]);
  const [message, setMessage] = useState("");
  const router = useRouter();

  // Sample data
  const recentDecks = [
    { title: "AI Startup", lastEdited: "Feb 26, 2025", status: "User-edited" },
    { title: "FinTech Revolution", lastEdited: "Feb 25, 2025", status: "AI-generated" },
    { title: "HealthTech Vision", lastEdited: "Feb 24, 2025", status: "User-edited" },
  ];

  const insightsData = [
    { date: "Feb 20", value: 20 },
    { date: "Feb 21", value: 50 },
    { date: "Feb 22", value: 30 },
    { date: "Feb 23", value: 80 },
    { date: "Feb 24", value: 60 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Welcome back, {userName}! 🎉</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={() => router.push("/createpitchdeck")} className="bg-blue-600 hover:bg-blue-700">🚀 Create a New Pitch Deck</Button>
          <Button variant="outline">📂 View My Pitch Decks</Button>
        </CardContent>
      </Card>

      {/* Recent Pitch Decks */}
      <Card>
        <CardHeader>
          <CardTitle>📌 Recent Pitch Decks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Last Edited</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentDecks.map((deck, index) => (
                <TableRow key={index}>
                  <TableCell>{deck.title}</TableCell>
                  <TableCell>{deck.lastEdited}</TableCell>
                  <TableCell>{deck.status}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="ghost">Download</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* AI-Powered Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📈 AI-Powered Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={insightsData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-500 mt-2">
              AI suggests that **FinTech** startups are gaining traction this month. Want AI to optimize your slides?
            </p>
          </CardContent>
        </Card>

        {/* AI Progress Feed */}
        <Card>
          <CardHeader>
            <CardTitle>📢 AI Activity Feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>✅ AI generated 10 slides for **HealthTech Vision**</p>
            <p>✏️ You edited the **Problem Statement** of AI Startup</p>
            <p>📢 Your co-founder commented on **Revenue Model**</p>
          </CardContent>
        </Card>
      </div>

      {/* AI-Powered Tools */}
      <Card>
        <CardHeader>
          <CardTitle>🛠️ AI-Powered Tools</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button className="bg-purple-600 hover:bg-purple-700">📄 AI Slide Generator</Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">🚀 AI Deck Enhancer</Button>
          <Button className="bg-green-600 hover:bg-green-700">📊 Financial Projections</Button>
          <Button className="bg-red-600 hover:bg-red-700">📈 Competitor Research</Button>
        </CardContent>
      </Card>

      {/* AI Chat Assistant */}
      <div className="fixed bottom-6 right-6">
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setChatOpen(!chatOpen)}
        >
          {chatOpen ? "Close AI Chat" : "💬 Ask AI"}
        </Button>
        {chatOpen && (
          <Card className="absolute bottom-12 right-0 w-80 bg-white p-4 shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle>AI Assistant 🤖</CardTitle>
            </CardHeader>
            <CardContent className="h-48 overflow-y-auto space-y-2">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`p-2 rounded-lg ${msg.sender === "AI" ? "bg-gray-100" : "bg-blue-100"}`}>
                  <strong>{msg.sender}: </strong> {msg.message}
                </div>
              ))}
            </CardContent>
            <div className="flex gap-2 p-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask AI..."
              />
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  if (message.trim() !== "") {
                    setChatMessages([...chatMessages, { sender: "You", message }]);
                    setMessage("");
                  }
                }}
              >
                Send
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
