import { User, Car, Zap, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/card';

interface DIDHandshakeProps {
  handshakeStep: number;
}

export function DIDHandshake({ handshakeStep }: DIDHandshakeProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-cyan-500/5 to-green-500/5 animate-pulse"></div>
      
      <div className="relative z-10">
        <div className="text-center mb-4">
          <h3 className="text-white text-sm mb-1">DID Handshake in Progress</h3>
          <p className="text-slate-400 text-xs">Establishing secure connection...</p>
        </div>

        {/* Three Nodes in Triangle */}
        <div className="relative h-56 flex items-center justify-center mb-8">
          {/* Driver Node (Top) */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
            <div className={`relative transition-all duration-500 ${handshakeStep >= 1 ? 'scale-110' : 'scale-100'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                handshakeStep >= 1 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50' 
                  : 'bg-slate-700'
              }`}>
                <User className={`w-8 h-8 ${handshakeStep >= 1 ? 'text-white' : 'text-slate-500'}`} />
              </div>
              {handshakeStep >= 1 && (
                <>
                  <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75"></div>
                  <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <span className="text-blue-400 text-xs">Driver DID</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Vehicle Node (Bottom Left) */}
          <div className="absolute bottom-0 left-4">
            <div className={`relative transition-all duration-500 ${handshakeStep >= 2 ? 'scale-110' : 'scale-100'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                handshakeStep >= 2 
                  ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/50' 
                  : 'bg-slate-700'
              }`}>
                <Car className={`w-8 h-8 ${handshakeStep >= 2 ? 'text-white' : 'text-slate-500'}`} />
              </div>
              {handshakeStep >= 2 && (
                <>
                  <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
                  <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <span className="text-green-400 text-xs">Vehicle DID</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Charger Node (Bottom Right) */}
          <div className="absolute bottom-0 right-4">
            <div className={`relative transition-all duration-500 ${handshakeStep >= 3 ? 'scale-110' : 'scale-100'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                handshakeStep >= 3 
                  ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/50' 
                  : 'bg-slate-700'
              }`}>
                <Zap className={`w-8 h-8 ${handshakeStep >= 3 ? 'text-white' : 'text-slate-500'}`} />
              </div>
              {handshakeStep >= 3 && (
                <>
                  <div className="absolute inset-0 rounded-full bg-cyan-500 animate-ping opacity-75"></div>
                  <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <span className="text-cyan-400 text-xs">Charger DID</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Connection Lines - Animated SVG */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
            {/* Driver to Vehicle */}
            {handshakeStep >= 1 && (
              <line
                x1="50%"
                y1="32"
                x2="25%"
                y2="75%"
                stroke="url(#gradient1)"
                strokeWidth="2"
                strokeDasharray="5,5"
                className="animate-dash"
              />
            )}
            
            {/* Vehicle to Charger */}
            {handshakeStep >= 2 && (
              <line
                x1="25%"
                y1="75%"
                x2="75%"
                y2="75%"
                stroke="url(#gradient2)"
                strokeWidth="2"
                strokeDasharray="5,5"
                className="animate-dash"
                style={{ animationDelay: '0.3s' }}
              />
            )}
            
            {/* Charger to Driver */}
            {handshakeStep >= 3 && (
              <line
                x1="75%"
                y1="75%"
                x2="50%"
                y2="32"
                stroke="url(#gradient3)"
                strokeWidth="2"
                strokeDasharray="5,5"
                className="animate-dash"
                style={{ animationDelay: '0.6s' }}
              />
            )}
            
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Status Messages */}
        <div className="space-y-2">
          <div className={`flex items-center gap-2 transition-opacity duration-300 ${handshakeStep >= 1 ? 'opacity-100' : 'opacity-30'}`}>
            <CheckCircle2 className={`w-3 h-3 ${handshakeStep >= 1 ? 'text-blue-400' : 'text-slate-600'}`} />
            <span className={`text-xs ${handshakeStep >= 1 ? 'text-blue-400' : 'text-slate-500'}`}>
              Driver authenticated
            </span>
          </div>
          <div className={`flex items-center gap-2 transition-opacity duration-300 ${handshakeStep >= 2 ? 'opacity-100' : 'opacity-30'}`}>
            <CheckCircle2 className={`w-3 h-3 ${handshakeStep >= 2 ? 'text-green-400' : 'text-slate-600'}`} />
            <span className={`text-xs ${handshakeStep >= 2 ? 'text-green-400' : 'text-slate-500'}`}>
              Vehicle connected
            </span>
          </div>
          <div className={`flex items-center gap-2 transition-opacity duration-300 ${handshakeStep >= 3 ? 'opacity-100' : 'opacity-30'}`}>
            <CheckCircle2 className={`w-3 h-3 ${handshakeStep >= 3 ? 'text-cyan-400' : 'text-slate-600'}`} />
            <span className={`text-xs ${handshakeStep >= 3 ? 'text-cyan-400' : 'text-slate-500'}`}>
              Charger synchronized
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
