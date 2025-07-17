// src/components/CyberTerminal.tsx
import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface TerminalCommand {
  (output: string[], setOutput: React.Dispatch<React.SetStateAction<string[]>>): void;
}

const commandMap: Record<string, TerminalCommand> = {
  help: (out, setOut) => {
    setOut([
      ...out,
      'Available commands:',
      '  help    – Show this help',
      '  status  – Show system status',
      '  nodes   – List active nodes',
      '  clear   – Clear terminal output',
      '  scan    – Run diagnostic scan',
    ]);
  },
  status: (out, setOut) => {
    setOut([...out, 'System Status: ONLINE', 'Uptime: 99.97%', 'Threat Level: NOMINAL']);
  },
  nodes: (out, setOut) => {
    setOut([...out, 'Active Nodes:', '- Node 1: Active', '- Node 2: Active', '- Node 3: Inactive']);
  },
  clear: (_out, setOut) => {
    setOut([]);
  },
  scan: (out, setOut) => {
    setOut([...out, 'Initiating diagnostic scan...']);
    setTimeout(() => {
      setOut(prev => [...prev, 'Scan complete: No critical issues detected']);
    }, 1500);
  },
};

export default function CyberTerminal() {
  const [output, setOutput] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState<number | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight);
  }, [output]);

  const runCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const newOut = [...output, `ANE:~$ ${cmd}`];
    if (trimmed in commandMap) {
      commandMap[trimmed](newOut, setOutput);
    } else {
      setOutput([...newOut, `Command not found: ${cmd}`]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (input) {
        runCommand(input);
        setHistory(h => [...h, input]);
        setHistIdx(null);
        setInput('');
      }
    } else if (e.key === 'ArrowUp') {
      if (history.length === 0) return;
      const idx = histIdx === null ? history.length - 1 : Math.max(histIdx - 1, 0);
      setHistIdx(idx);
      setInput(history[idx]);
    } else if (e.key === 'ArrowDown') {
      if (history.length === 0 || histIdx === null) return;
      const next = histIdx + 1;
      if (next >= history.length) {
        setHistIdx(null);
        setInput('');
      } else {
        setHistIdx(next);
        setInput(history[next]);
      }
    }
  };

  return (
    <div
      ref={terminalRef}
      className="bg-black text-cyber-green font-mono p-4 h-64 overflow-auto"
      role="textbox"
      aria-live="polite"
      aria-label="Cyber terminal"
      tabIndex={0}
    >
      {output.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
      <div className="flex">
        <span className="mr-2">ANE:~$</span>
        <input
          className="bg-black flex-grow outline-none"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </div>
    </div>
  );
}
