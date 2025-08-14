import React from "react";

export default function LoadingPage() {
    return (
        <div className="flex flex-col items-center justify-center pb-64 min-h-screen bg-white gap-6">
            <img
                src="/logo.png"
                alt="Logo"
                className="h-14 fadeIn"
            />

            <div className="w-36 h-0.5 rounded-full bg-gray-300 relative overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-0.5 rounded-full bg-orange-500 animate-gradient-x"
                    style={{ width: "50%" }}
                />
            </div>

            <style>{`
        @keyframes gradient-x {
          0% {
            transform: translateX(-50%);
            opacity: 0.4;
          }
          50% {
            transform: translateX(100%);
            opacity: 1;
          }
          100% {
            transform: translateX(200%);
            opacity: 0.4;
          }
        }
        .animate-gradient-x {
          animation: gradient-x 1.8s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
