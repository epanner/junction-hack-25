import { CheckCircle2, Brain, Clock, TrendingDown } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface AIAssistantProps {
  showAnalyzing: boolean;
  targetSoC: number;
  departureTime: string;
}

export function AIAssistant({ showAnalyzing, targetSoC, departureTime }: AIAssistantProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <h3 className="text-white text-sm">AI Assistant</h3>
      </div>
      
      {/* Chat Messages - Mobile Optimized */}
      <div className="space-y-3 mb-4">
        {showAnalyzing && (
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl rounded-tl-sm p-3 transition-opacity duration-300">
            <p className="text-slate-200 text-xs">
              Analyzing your preferences and current energy prices...
            </p>
          </div>
        )}
        
        {/* Success Message - Enhanced */}
        <div className="relative bg-gradient-to-br from-emerald-900/40 via-green-900/30 to-teal-900/40 border border-green-500/40 rounded-2xl rounded-tl-sm p-4 backdrop-blur-sm overflow-hidden">
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent animate-shimmer"></div>
          
          <div className="relative flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-white text-xs leading-relaxed">
                <span className="text-green-400">Charging optimized successfully!</span>
              </p>
              <div className="space-y-1.5 bg-slate-900/40 rounded-lg p-2.5 border border-green-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-xs">Target Battery</span>
                  <span className="text-green-400 font-mono">{targetSoC}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-xs">Ready By</span>
                  <span className="text-blue-400 font-mono">{departureTime}</span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-700/50">
                  <span className="text-slate-300 text-xs">Cost Savings</span>
                  <div className="flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-green-400" />
                    <span className="text-green-400 font-mono">17%</span>
                  </div>
                </div>
              </div>
              <p className="text-slate-400 text-xs italic">
                vs. fast charging at current rates
              </p>
            </div>
          </div>
        </div>

        {/* Tip Message - Enhanced */}
        <div className="relative bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-fuchsia-900/40 border border-purple-500/40 rounded-2xl rounded-tl-sm p-4 backdrop-blur-sm overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/5 to-transparent"></div>
          
          <div className="relative flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-purple-300 text-xs">AI Insight</span>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs px-1.5 py-0">
                  Smart
                </Badge>
              </div>
              <p className="text-slate-200 text-xs leading-relaxed">
                We'll <span className="text-purple-300">intelligently delay</span> charging during peak hours to maximize your savings.
              </p>
              <div className="flex items-center gap-2 bg-slate-900/40 rounded-lg px-2.5 py-1.5 border border-purple-500/20">
                <Clock className="w-3 h-3 text-purple-400 flex-shrink-0" />
                <span className="text-xs text-slate-300">Peak window avoided:</span>
                <span className="text-purple-300 text-xs font-mono">11:45-12:15</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
