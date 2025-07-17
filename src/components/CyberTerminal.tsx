// src/components/CyberTerminal.tsx
import React, {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  ReactNode,
} from 'react';
import parseArgs from 'minimist';

// --- Helper: parse a line with <color>text</color> and #NODE#Name#/NODE# markers
function parseLine(line: string, onNodeClick: (name: string) => void): ReactNode[] {
  const elements: ReactNode[] = [];
  let lastIndex = 0;

  // Combined regex for color tags and node markers
  const regex = /<(?<col>green|red|yellow|blue)>(?<text>.*?)<\/\k<col>>|#NODE#(?<node>[\w-]+)#\/NODE#/g;
  let match;

  while ((match = regex.exec(line)) !== null) {
    const { index } = match;
    // push preceding text
    if (index > lastIndex) {
      elements.push(line.slice(lastIndex, index));
    }
    if (match.groups?.col) {
      const color = match.groups.col;
      const text = match.groups.text;
      elements.push(
        <span
          key={index}
          className={{
            green: 'text-green-400',
            red: 'text-red-400',
            yellow: 'text-yellow-300',
            blue: 'text-blue-400',
          }[color]}
        >
          {text}
        </span>
      );
    } else if (match.groups?.node) {
      const nodeName = match.groups.node;
      elements.push(
        <button
          key={index}
          className="text-cyber-green underline ml-1"
          onClick={() => onNodeClick(nodeName)}
        >
          {nodeName}
        </button>
      );
    }
    lastIndex = regex.lastIndex;
  }

  // remaining text
  if (lastIndex < line.length) {
    elements.push(line.slice(lastIndex));
  }
  return elements;
}

// --- Commands & Handlers ---
type ParsedArgs = { _: string[]; [key: string]: any };
type Handler = (
  args: ParsedArgs,
  out: string[],
  setOut: React.Dispatch<React.SetStateAction<string[]>>
) => void;

const handlers: Record<string, Handler> = {
  help: (_args, out, setOut) =>
    setOut([
      ...out,
      '<green>Available commands:</green>',
      '  help          – Show this help',
      '  status        – Show <green>system status</green>',
      '  nodes         – List nodes (clickable!)',
      '  clear         – Clear output',
      '  scan          – Run <yellow>scan</yellow>',
    ]),

  status: (_args, out, setOut) =>
    setOut([
      ...out,
      '<green>System Status:</green> <blue>ONLINE</blue>',
      'Uptime: <blue>99.97%</blue>',
      'Threat Level: <yellow>NOMINAL</yellow>',
    ]),

  nodes: (_args, out, setOut) => {
    setOut([...out, 'Nodes:']);
    ['Core-01', 'Core-02', 'Edge-01'].forEach(n =>
      setOut(prev => [...prev, `  #NODE#${n}#/NODE#`])
    );
  },

  clear: (_args, _out, setOut) => setOut([]),

  scan: (_args, out, setOut) => {
    setOut([...out, 'Initiating <yellow>scan</yellow>...']);
    let pct = 0;
    const iv = setInterval(() => {
      pct += 25;
      setOut(prev => [...prev, `<blue>Progress:</blue> ${pct}%`]);
      if (pct >= 100) {
        clearInterval(iv);
        setOut(prev => [...prev, '<green>Scan complete.</green>']);
      }
    }, 400);
  },
};

const aliasMap: Record<string, string> = {
  h: 'help',
  s: 'status',
  n: 'nodes',
  c: 'clear',
  sc: 'scan',
};

export default function CyberTerminal() {
  const [output, setOutput] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight);
  }, [output]);

  const handleNodeClick = (nodeName: string) => {
    alert(`Drilling into node ${nodeName}...`);
    // Implement drill-down logic here
  };

  const run = (line: string) => {
    const parts = line.trim().split(/\s+/);
    if (!parts[0]) return;
    const raw = parts[0].toLowerCase();
    const cmd = aliasMap[raw] || raw;
    const handler = handlers[cmd];
    const args = parseArgs(parts.slice(1));
    setOutput(prev => [...prev, `ANE:~$ ${line}`]);
    if (handler) handler(args, output, setOutput);
    else setOutput(prev => [...prev, `<red>Unknown command:</red> ${raw}`]);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(input);
      setInput('');
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
        <div key={i}>{parseLine(line, handleNodeClick)}</div>
      ))}

      <div className="flex mt-2">
        <span className="mr-2">ANE:~$</span>
        <input
          className="bg-black flex-grow outline-none"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
        />
      </div>
    </div>
  );
}
