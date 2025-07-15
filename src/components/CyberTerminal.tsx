import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import useSound from 'react-use-audio';
import React from 'react'

export const CyberTerminal = () => {
  const [commands, setCommands] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const outputRef = useRef<HTMLDivElement>(null);
  const [playKeySound] = useSound('/sounds/terminal.wav', { volume: 0.2 });
  const [playEnterSound] = useSound('/sounds/click.wav', { volume: 0.3 });

  const processCommand = (cmd: string) => {
    const newCommands = [...commands, `ANE:~$ ${cmd}`];

    switch (cmd.toLowerCase()) {
      case 'help':
        newCommands.push(
          'Available commands:',
          '  status - Show system status',
          '  nodes - List active nodes',
          '  clear - Clear terminal',
          '  scan - Run diagnostic scan'
        );
        break;
      case 'status':
        newCommands.push('System Status: ONLINE', 'Uptime: 99.97%', 'Threat Level: NOMINAL');
        break;
      case 'nodes':
        newCommands.push('Active Nodes (42):', '  Core-01 to Core-42: Operational');
        break;
      case 'scan':
        newCommands.push('Initiating diagnostic scan...');
        setCommands(newCommands);
        setTimeout(() => {
          setCommands(prev => [...prev, 'Scan complete: No critical issues detected']);
        }, 1500);
        return;
      case 'clear':
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
          onChange={(e) => {
            setInput(e.target.value);
            playKeySound();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              playEnterSound();
              processCommand(input);
              setInput('');
            }
          }}
          className="bg-transparent border-b border-cyber-green text-cyber-green flex-grow outline-none font-mono"
          autoFocus
        />
      </div>
    </motion.div>
  );
};