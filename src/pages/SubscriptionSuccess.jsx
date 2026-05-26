import React from 'react';
import { CheckCircle2, ArrowRight, PartyPopper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Abstract Background Shapes for Attraction */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-green-100 rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="w-full max-w-sm bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/50 overflow-hidden relative z-10 animate-success-entrance">
        
        <div className="p-10 text-center flex flex-col items-center">
          <div className="mb-8 relative">
            {/* Particle Effects */}
            <div className="absolute inset-0 flex items-center justify-center scale-150">
              <div className="w-2 h-2 bg-green-400 rounded-full absolute -top-4 animate-ping"></div>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full absolute -bottom-4 -left-4 animate-ping" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full absolute -right-4 animate-ping" style={{ animationDelay: '0.8s' }}></div>
            </div>
            
            {/* Pulsing Aura */}
            <div className="absolute inset-0 bg-green-200 rounded-full blur-2xl opacity-40 animate-success-glow"></div>
            
            <div className="relative bg-white rounded-full p-1 shadow-sm">
              <CheckCircle2 className="w-16 h-16 text-[#22c55e] stroke-[1.25px] animate-success-pop" />
            </div>
          </div>
          
          <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
            Subscription Successful!
          </h1>
          
          <p className="text-slate-500 text-[14px] leading-relaxed mb-10 px-2 font-medium">
            Success! Your account has been upgraded. Start growing your business today.
          </p>

          <button 
            onClick={() => navigate('/dashboard')}
            className="w-fit inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-white text-sm font-bold py-3 px-8 rounded-2xl transition-all shadow-lg shadow-green-200/50 hover:shadow-green-300/50 active:scale-[0.95] group"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="bg-slate-50/50 py-4 border-t border-slate-100/50">
          <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            <PartyPopper size={10} className="text-green-400" />
            SaleGrowy Official
          </div>
        </div>
      </div>

      <style>{`
        @keyframes success-entrance {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes success-pop {
          0% { transform: scale(0.5); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes success-glow {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.5; }
        }
        .animate-success-entrance {
          animation: success-entrance 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .animate-success-pop {
          animation: success-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-success-glow {
          animation: success-glow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SubscriptionSuccess;
