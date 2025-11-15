"use client"

import { Zap, Shield, Brain, ArrowRight, CheckCircle2, Battery, TrendingUp } from "lucide-react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Badge } from "./ui/badge"

interface LandingPageProps {
  onEnterApp: () => void
}

export function LandingPage({ onEnterApp }: LandingPageProps) {
  return (
    <div className="w-full min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background with CSS */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-900/50 to-black"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 lg:p-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-green-400 p-2 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xl">ChargeID</span>
            </div>
            <Button
              onClick={onEnterApp}
              variant="outline"
              className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-600 backdrop-blur-sm"
            >
              Launch App
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center px-6 lg:px-8 py-20">
          <div className="max-w-6xl mx-auto text-center space-y-8">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-4 py-1 animate-fade-in">
              Decentralized Identity Meets Smart Charging
            </Badge>
            
            <h1 className="text-white text-5xl lg:text-7xl max-w-4xl mx-auto leading-tight animate-fade-in-up">
              AI-Optimized EV Charging with <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent animate-gradient">Decentralized Identity</span>
            </h1>
            
            <p className="text-slate-300 text-xl max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              ChargeID revolutionizes electric vehicle charging through secure DID authentication, intelligent AI optimization, and real-time energy management.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-fade-in-up animation-delay-400">
              <Button
                onClick={onEnterApp}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white px-8 shadow-lg shadow-blue-500/50"
              >
                <Zap className="w-5 h-5 mr-2" />
                Get Started
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-6 lg:px-8 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6 hover:bg-white/10 transition-all group animate-fade-in-up animation-delay-600">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-white mb-2">Decentralized Identity</h3>
                <p className="text-slate-400 text-sm">
                  Secure peer-to-peer authentication using DIDs for drivers, vehicles, and charging stations. Complete privacy and control over your data.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Driver DID Verification
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Vehicle DID Authentication
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Charger DID Handshake
                  </div>
                </div>
              </Card>

              {/* Feature 2 */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6 hover:bg-white/10 transition-all group animate-fade-in-up animation-delay-800">
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-white mb-2">AI-Powered Optimization</h3>
                <p className="text-slate-400 text-sm">
                  Intelligent charging plans that balance cost, speed, and grid constraints. Save money while meeting your departure deadlines.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Cost-Optimized Scheduling
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Real-Time Tariff Analysis
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Predictive Load Management
                  </div>
                </div>
              </Card>

              {/* Feature 3 */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6 hover:bg-white/10 transition-all group animate-fade-in-up animation-delay-1000">
                <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-white mb-2">Fleet Management</h3>
                <p className="text-slate-400 text-sm">
                  Operator dashboard with real-time insights, capacity planning, and site-wide energy optimization for maximum efficiency.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Live Session Monitoring
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Dynamic Load Balancing
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Cost Savings Analytics
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-6 lg:px-8 pb-20">
          <div className="max-w-6xl mx-auto">
            <Card className="bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-green-500/10 backdrop-blur-sm border-white/10 p-8 animate-fade-in-up animation-delay-1200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl text-white mb-2">18%</div>
                  <div className="text-slate-400 text-sm">Cost Savings</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl text-white mb-2">100%</div>
                  <div className="text-slate-400 text-sm">DID Secured</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl text-white mb-2">24/7</div>
                  <div className="text-slate-400 text-sm">AI Optimization</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl text-white mb-2">&lt;50kW</div>
                  <div className="text-slate-400 text-sm">Site Limit Managed</div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 lg:px-8 pb-20">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up animation-delay-1400">
            <h2 className="text-white text-4xl mb-4">
              Ready to Transform Your EV Charging Experience?
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              Join the future of smart, secure, and sustainable electric vehicle charging.
            </p>
            <Button
              onClick={onEnterApp}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white px-12 shadow-lg shadow-blue-500/50"
            >
              <Battery className="w-5 h-5 mr-2" />
              Launch ChargeID
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 lg:px-8 py-8 border-t border-white/10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-green-400 p-2 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white">ChargeID</div>
                <div className="text-slate-500 text-xs">AI-Optimized Charging with Decentralized Identity</div>
              </div>
            </div>
            <div className="text-slate-500 text-sm">
              © 2025 ChargeID. Powered by DID and AI.
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}