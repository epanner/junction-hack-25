import { Zap, Menu, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';

interface MobileHeaderProps {
  onBack: () => void;
  showBackButton: boolean;
}

export function MobileHeader({ onBack, showBackButton }: MobileHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 pt-4">
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-slate-400 hover:text-white p-2"
        onClick={onBack}
        disabled={!showBackButton}
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-br from-blue-500 to-green-400 p-1.5 rounded-lg">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="text-white">ChargeID</span>
      </div>
      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white p-2">
        <Menu className="w-5 h-5" />
      </Button>
    </div>
  );
}
