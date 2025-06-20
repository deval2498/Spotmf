import { useState, useEffect } from "react";
import { RiShutDownLine } from "react-icons/ri";

export const ExpandingDisconnectButton = ({ disconnect }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    if (isExpanded) {
      // If already expanded, disconnect
      disconnect();
      setIsExpanded(false); // Close after disconnect
    } else {
      // If collapsed, expand first
      setIsExpanded(true);
    }
  };

  // Auto-collapse after 2 seconds if expanded and not used
  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 2000); // 2 seconds

      return () => clearTimeout(timer); // Cleanup timer on unmount or when isExpanded changes
    }
  }, [isExpanded]);

  return (
    <button
      className="relative flex items-center overflow-hidden rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 transition-all duration-300 ease-out"
      style={{
        width: isExpanded ? "120px" : "35px",
        height: "35px",
        justifyContent: isExpanded ? "flex-start" : "center",
        paddingLeft: isExpanded ? "12px" : "0",
        paddingRight: isExpanded ? "12px" : "0",
      }}
      onClick={handleClick}
      onBlur={() => setIsExpanded(false)}
    >
      {/* Icon - always visible, positioned with flexbox */}
      <RiShutDownLine
        className="text-red-500 transition-all duration-300 ease-out flex-shrink-0"
        style={{
          fontSize: "18px",
        }}
      />

      {/* Text - slides in with width animation */}
      <span
        className="text-red-500 font-medium text-sm whitespace-nowrap transition-all duration-300 ease-out overflow-hidden"
        style={{
          width: isExpanded ? "auto" : "0",
          opacity: isExpanded ? 1 : 0,
          marginLeft: isExpanded ? "8px" : "0",
        }}
      >
        Disconnect
      </span>
    </button>
  );
};
