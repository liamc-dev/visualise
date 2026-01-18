import { motion } from "framer-motion";
import { useSettingsStore } from "../../stores/useSettingsStore";

export default function CrtFxToggle() {
  const glowEnabled = useSettingsStore(s => s.glowEnabled);
  const toggleGlow = useSettingsStore(s => s.toggleGlow);

  
  return (
  
      <div className="flex flex-col items-center gap-1">
        {/* Label */}
        <span className="text-[0.55rem] tracking-widest text-tn-subtle uppercase">
          CRT FX
        </span>

        <div className="flex items-center gap-2 select-none">
        {/* Switch */}
        <button
          onClick={toggleGlow}
          className="
            relative w-9 h-3 rounded-full
            bg-[#121212] border border-tn-border/70
            shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]
            flex items-center px-1
            hover:brightness-110 transition
          "
        >
          {/* Track Glow */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: glowEnabled
                ? "0 0 12px rgba(255,120,40,0.7)"
                : "0 0 0px rgba(0,0,0,0)",
              borderColor: glowEnabled
                ? "rgba(255,140,60,0.9)"
                : "rgba(80,80,80,0.4)",
            }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Switch Handle */}
          <motion.div
            className="
              w-4 h-4 rounded-full z-10
              shadow-[0_0_6px_rgba(255,140,50,0.6)]
            "
            animate={{
              x: glowEnabled ? 18 : -4,
              background: glowEnabled
                ? "linear-gradient(to bottom, #ffcf9f, #ff9c3b)"
                : "linear-gradient(to bottom, #2a2a2a, #111)",
              boxShadow: glowEnabled
                ? "0 0 12px rgba(255,140,50,0.8)"
                : "0 0 3px rgba(0,0,0,0.5)",
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 22,
            }}
          />
        </button>
        </div>
      </div>
  );
}


