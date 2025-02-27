"use client"

import { useState, useEffect } from "react"
import { PresentationIcon, TrendingUp, Zap, ArrowRight, Clock, Edit, Copy, Trash } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

// Simulated AI-generated data
const aiSuggestions = [
  "Fintech solution for small businesses",
  "AI-powered healthcare diagnostics",
  "Sustainable supply chain platform",
  "Remote team collaboration tools",
  "Blockchain for food traceability",
]

const templates = [
  {
    id: 1,
    title: "Startup Pitch",
    description: "Perfect for early-stage startups seeking seed funding",
    slides: 12,
    category: "Funding",
  },
  {
    id: 2,
    title: "Product Launch",
    description: "Showcase your new product to potential customers",
    slides: 10,
    category: "Marketing",
  },
  {
    id: 3,
    title: "Investor Update",
    description: "Keep your investors informed about progress",
    slides: 8,
    category: "Investor Relations",
  },
]

const insights = [
  {
    title: "AI in Healthcare",
    description: "Growing 34% YoY with focus on diagnostics and personalized medicine",
    trend: "up",
  },
  {
    title: "Sustainable Tech",
    description: "Investors allocating 28% more to climate-focused startups",
    trend: "up",
  },
  {
    title: "Remote Work Tools",
    description: "Market stabilizing after pandemic surge, still growing at 12%",
    trend: "neutral",
  },
]

const MotionCard = motion(Card)

export function DashboardContent() {
  const [loading, setLoading] = useState(true)
  const [suggestion, setSuggestion] = useState("")

  useEffect(() => {
    // Simulate loading AI suggestions
    const timer = setTimeout(() => {
      setLoading(false)
      setSuggestion(aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)])
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="container py-6 space-y-8">
      {/* Welcome Banner */}
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-primary/10 via-primary/5 to-background dark:from-primary/20 dark:via-primary/10 dark:to-background/80 border-none shadow-lg"
      >
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">Welcome back, John</CardTitle>
          <CardDescription className="text-base md:text-lg">
            {loading ? (
              <Skeleton className="h-4 w-3/4" />
            ) : (
              <>
                Have you considered a pitch deck for <span className="font-medium text-primary">{suggestion}</span>?
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button size="lg" className="gap-2 group">
            <span>Create New Pitch Deck</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardFooter>
      </MotionCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Last Edited Deck */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="col-span-1 md:col-span-2 lg:col-span-1 overflow-hidden group"
        >
          <CardHeader className="pb-0">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Last Edited
              </CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative aspect-video bg-muted rounded-md overflow-hidden mb-4">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 flex items-end p-4">
                <h3 className="text-white font-medium">SaaS Platform Investor Pitch</h3>
              </div>
              <img
                src="/placeholder.svg?height=200&width=400"
                alt="Pitch deck preview"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge variant="outline">12 slides</Badge>
                <span className="text-sm text-muted-foreground">Edited 2 hours ago</span>
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                <PresentationIcon className="h-3.5 w-3.5" />
                <span>Present</span>
              </Button>
            </div>
          </CardContent>
        </MotionCard>

        {/* Recommended Templates */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="col-span-1 md:col-span-2 lg:col-span-1"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Recommended Templates
            </CardTitle>
            <CardDescription>AI-selected templates for your next pitch</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                  <PresentationIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium">{template.title}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {template.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{template.slides} slides</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0">
                  Use
                </Button>
              </div>
            ))}
          </CardContent>
        </MotionCard>

        {/* AI Insights */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="col-span-1 md:col-span-2 lg:col-span-1"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              AI Market Insights
            </CardTitle>
            <CardDescription>Trending startup ideas & industry insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium">{insight.title}</h4>
                  <TrendingUp className={`h-4 w-4 ${insight.trend === "up" ? "text-green-500" : "text-amber-500"}`} />
                </div>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Insights
            </Button>
          </CardFooter>
        </MotionCard>
      </div>

      {/* Quick Actions */}
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto flex-col py-6 gap-3">
              <PresentationIcon className="h-6 w-6" />
              <span>New Blank Deck</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-6 gap-3">
              <Zap className="h-6 w-6" />
              <span>AI Generate</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-6 gap-3">
              <Copy className="h-6 w-6" />
              <span>Duplicate Deck</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-6 gap-3">
              <Edit className="h-6 w-6" />
              <span>Edit Template</span>
            </Button>
          </div>
        </CardContent>
      </MotionCard>
    </div>
  )
}

