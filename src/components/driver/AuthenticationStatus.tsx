import { CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

export function AuthenticationStatus() {
  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="w-4 h-4 text-green-400" />
        <h3 className="text-white text-sm">Authentication</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
          Driver ✓
        </Badge>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
          Vehicle ✓
        </Badge>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
          Charger ✓
        </Badge>
      </div>
    </Card>
  );
}
