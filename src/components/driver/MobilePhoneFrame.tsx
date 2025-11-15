interface MobilePhoneFrameProps {
  children: React.ReactNode;
}

export function MobilePhoneFrame({ children }: MobilePhoneFrameProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Phone Frame */}
      <div className="relative w-full max-w-[400px] h-[844px] bg-slate-950 rounded-[3rem] shadow-2xl border-8 border-slate-800 overflow-hidden">
        {/* Phone Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-slate-950 rounded-b-3xl z-50"></div>
        
        {/* Phone Screen Content */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950">
          {children}
        </div>
      </div>
    </div>
  );
}