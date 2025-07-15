// src/components/CyberTerminal.tsx
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
// Removed react-use-audio because it's causing issues; see note below.
// import { useSound } from "react-use-audio";
import "../styles/cyber.css";
import "tailwindcss/tailwind.css";

// Example icon import from lucide-react, replace or remove if unused
import { Terminal } from "lucide-react";

export const CyberTerminal = () => {
  const [commands, setCommands] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);

  // Sound hooks removed because react-use-audio isn't installed properly.
  // You can add audio later with another library or workaround.

  const processCommand = (cmd: string) => {
    const newCommands = [...commands, `ANE:~$ ${cmd}`];

    switch (cmd.toLowerCase()) {
      case "help":
        newCommands.push(
          "Available commands:",
          "  status - Show system status",
          "  nodes - List active nodes",
          "  clear - Clear terminal",
          "  scan - Run diagnostic scan"
        );
        break;
      case "status":
        newCommands.push("System Status: ONLINE", "Uptime: 99.97%", "Threat Level: NOMINAL");
        break;
      case "nodes":
        newCommands.push("Active Nodes (42):", "  Core-01 to Core-42: Operational");
        break;
      case "scan":
        newCommands.push("Initiating diagnostic scan...");
        setTimeout(() => {
          setCommands((prev) => [...prev, "Scan complete: No critical issues detected"]);
        }, 1500);
        break;
      case "clear":
        return setCommands([]);
      default:
        newCommands.push(`Command not found: ${cmd}`);
    }

    setCommands(newCommands);
  };

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [commands]);

  return (
    <motion.div
      className="bg-black bg-opacity-70 border border-cyber-green rounded p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center mb-2 text-cyber-green">
        <Terminal className="mr-2" />
        <span>ANE Cyber Terminal</span>
      </div>
      <div
        ref={outputRef}
        className="font-mono text-cyber-green h-48 overflow-y-auto mb-2"
      >
        {commands.map((cmd, i) => (
          <div key={i}>{cmd}</div>
        ))}
      </div>
      <div className="flex items-center">
        <span className="text-cyber-green mr-2">ANE:~$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              processCommand(input);
              setInput("");
            }
          }}
          className="bg-transparent border-b border-cyber-green text-cyber-green flex-grow outline-none font-mono"
          autoFocus
        />
      </div>
    </motion.div>
  );
};
