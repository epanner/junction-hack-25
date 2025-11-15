import { User, Shield, CheckCircle2, ChevronRight, LogOut, Settings, Zap } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export function ProfilePage() {
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 pb-20">
      {/* Header */}
      <div className="bg-slate-900/95 backdrop-blur-sm px-5 pt-10 pb-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-green-400 p-1.5 rounded-lg">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white">ChargeID</span>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-gradient-to-br from-blue-600/20 to-green-600/20 px-5 pt-8 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-400 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-white text-xl mb-1">John Driver</h2>
            <p className="text-slate-400 text-sm">john.driver@email.com</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 space-y-4">
        {/* DID Authentication Status */}
        <Card className="bg-slate-800/50 border-slate-700 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white text-sm mb-1">DID Authentication</h3>
              <p className="text-slate-400 text-xs">Decentralized Identity Verified</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs">Driver DID</span>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                Verified
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs">Wallet Connected</span>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                Active
              </Badge>
            </div>
          </div>
        </Card>

        {/* Account Info */}
        <Card className="bg-slate-800/50 border-slate-700 p-4">
          <h3 className="text-white text-sm mb-3">Account Information</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400 text-sm">Member Since</span>
              <span className="text-white text-sm">Jan 2024</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-slate-700">
              <span className="text-slate-400 text-sm">Total Sessions</span>
              <span className="text-white text-sm">47</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-slate-700">
              <span className="text-slate-400 text-sm">Total Charged</span>
              <span className="text-white text-sm">1,240 kWh</span>
            </div>
          </div>
        </Card>

        {/* Settings & Actions */}
        <Card className="bg-slate-800/50 border-slate-700 p-4">
          <h3 className="text-white text-sm mb-3">Settings & Actions</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between py-3 px-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-slate-400" />
                <span className="text-white text-sm">Account Settings</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
            
            <button className="w-full flex items-center justify-between py-3 px-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-slate-400" />
                <span className="text-white text-sm">Privacy & Security</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </Card>

        {/* Logout Button */}
        <Button 
          variant="outline"
          className="w-full border-red-500/30 bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-red-300"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}