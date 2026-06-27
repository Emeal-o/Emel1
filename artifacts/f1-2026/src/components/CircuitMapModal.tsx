import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { CIRCUIT_MAPS } from "../data/circuitMaps";

interface CircuitMapModalProps {
  circuitName: string;
  open: boolean;
  onClose: () => void;
}

export default function CircuitMapModal({ circuitName, open, onClose }: CircuitMapModalProps) {
  const path = CIRCUIT_MAPS[circuitName];

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-sm bg-[#0f0f17] border border-white/10 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.7)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-5 rounded-full bg-[#e10600]" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#e10600]">
                      Circuit Map
                    </span>
                    <span className="text-sm font-bold text-white leading-tight truncate max-w-[210px]">
                      {circuitName}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close circuit map"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* SVG Map area */}
              <div className="p-5">
                <div className="bg-[#0a0a12] rounded-xl border border-white/6 p-4 flex items-center justify-center aspect-square">
                  {path ? (
                    <svg
                      viewBox="0 0 300 300"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full"
                      role="img"
                      aria-label={`${circuitName} circuit layout`}
                    >
                      <path
                        d={path}
                        fill="none"
                        stroke="white"
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.92"
                      />
                      {/* Red accent dot — start/finish line marker */}
                      <StartFinishMarker pathData={path} />
                    </svg>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-white/30">
                      <span className="text-4xl">🏎</span>
                      <span className="text-xs font-mono">Map not available</span>
                    </div>
                  )}
                </div>

                {/* Footer label */}
                <div className="mt-3 flex items-center justify-center gap-2">
                  <div className="w-3 h-[3px] rounded-full bg-[#e10600]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">
                    Simplified layout · not to scale
                  </span>
                  <div className="w-3 h-[3px] rounded-full bg-[#e10600]" />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Renders a small red dot near the start of the path as a start/finish marker
function StartFinishMarker({ pathData }: { pathData: string }) {
  // Extract the first M x,y coordinate from the path string
  const match = pathData.match(/M\s*([\d.]+)[,\s]+([\d.]+)/);
  if (!match) return null;
  const x = parseFloat(match[1]);
  const y = parseFloat(match[2]);
  return (
    <>
      <circle cx={x} cy={y} r={7} fill="#e10600" opacity={0.9} />
      <circle cx={x} cy={y} r={4} fill="white" opacity={0.95} />
    </>
  );
}
