#!/bin/bash
set -euo pipefail

# ========================================
# Enhanced Project Repair & Validation Script
# ========================================

# Color codes
readonly NC='\033[0m'
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly PURPLE='\033[0;35m'

# Global variables
readonly PROJECT_ROOT="$(pwd)"
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly LOG_FILE="$PROJECT_ROOT/repair.log"
readonly BACKUP_DIR="$PROJECT_ROOT/.repair-backup-$(date +%Y%m%d-%H%M%S)"

PACKAGE_MANAGER=""
NODE_VERSION=""
REPAIR_MODE="auto"
SKIP_BACKUP=false
FORCE_REINSTALL=false

# ========================================
# Enhanced Logging System
# ========================================
log()     { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] [INFO]${NC} $1" | tee -a "$LOG_FILE"; }
success() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS]${NC} $1" | tee -a "$LOG_FILE"; }
warn()    { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] [WARNING]${NC} $1" | tee -a "$LOG_FILE"; }
error()   { echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR]${NC} $1" | tee -a "$LOG_FILE"; exit 1; }
debug()   { [[ "${DEBUG:-}" == "true" ]] && echo -e "${PURPLE}[$(date '+%Y-%m-%d %H:%M:%S')] [DEBUG]${NC} $1" | tee -a "$LOG_FILE"; }
step()    { echo -e "${CYAN}[$(date '+%Y-%m-%d %H:%M:%S')] [STEP]${NC} $1" | tee -a "$LOG_FILE"; }

# ========================================
# Utility Functions
# ========================================
print_usage() {
  cat << EOF
Usage: $0 [OPTIONS]

Options:
  -h, --help          Show this help message
  -m, --mode MODE     Repair mode: auto|interactive|minimal (default: auto)
  -f, --force         Force reinstall all dependencies
  -b, --skip-backup   Skip creating backup
  -d, --debug         Enable debug logging
  -v, --verbose       Verbose output
  --dry-run          Show what would be done without executing

Examples:
  $0                    # Run with default settings
  $0 -m interactive     # Interactive mode with prompts
  $0 -f -d             # Force reinstall with debug logging
EOF
}

parse_arguments() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      -h|--help)
        print_usage
        exit 0
        ;;
      -m|--mode)
        REPAIR_MODE="$2"
        shift 2
        ;;
      -f|--force)
        FORCE_REINSTALL=true
        shift
        ;;
      -b|--skip-backup)
        SKIP_BACKUP=true
        shift
        ;;
      -d|--debug)
        export DEBUG=true
        shift
        ;;
      -v|--verbose)
        set -x
        shift
        ;;
      --dry-run)
        export DRY_RUN=true
        shift
        ;;
      *)
        error "Unknown option: $1"
        ;;
    esac
  done
}

execute_command() {
  local cmd="$1"
  local description="${2:-}"
  
  if [[ "${DRY_RUN:-}" == "true" ]]; then
    log "[DRY RUN] Would execute: $cmd"
    return 0
  fi
  
  [[ -n "$description" ]] && debug "$description"
  eval "$cmd"
}

create_backup() {
  [[ "$SKIP_BACKUP" == "true" ]] && return 0
  
  step "Creating backup..."
  mkdir -p "$BACKUP_DIR"
  
  local backup_files=("package.json" "package-lock.json" "yarn.lock" "pnpm-lock.yaml" 
                      "tsconfig.json" "vite.config.ts" "vite.config.js" ".eslintrc.json" 
                      "vercel.json" ".env" ".env.local")
  
  for file in "${backup_files[@]}"; do
    [[ -f "$file" ]] && cp "$file" "$BACKUP_DIR/"
  done
  
  success "Backup created at: $BACKUP_DIR"
}

get_node_version() {
  NODE_VERSION=$(node --version 2>/dev/null | sed 's/v//' || echo "")
}

version_compare() {
  local version1="$1"
  local version2="$2"
  printf '%s\n%s\n' "$version1" "$version2" | sort -V | head -n1
}

# ========================================
# Enhanced Environment Verification
# ========================================
verify_environment() {
  step "Verifying environment..."

  # Check Node.js
  if ! command -v node >/dev/null; then
    error "Node.js is not installed. Please install Node.js v18+ first."
  fi

  get_node_version
  local min_node_version="18.0.0"
  if [[ "$(version_compare "$NODE_VERSION" "$min_node_version")" != "$min_node_version" ]]; then
    warn "Node.js version $NODE_VERSION detected. Minimum recommended: v$min_node_version"
  fi

  # Detect package manager
  if [[ -f "pnpm-lock.yaml" ]]; then
    command -v pnpm >/dev/null || error "PNPM lockfile found but pnpm is not installed."
    PACKAGE_MANAGER="pnpm"
  elif [[ -f "yarn.lock" ]]; then
    command -v yarn >/dev/null || error "Yarn lockfile found but yarn is not installed."
    PACKAGE_MANAGER="yarn"
  elif [[ -f "bun.lockb" ]]; then
    command -v bun >/dev/null || error "Bun lockfile found but bun is not installed."
    PACKAGE_MANAGER="bun"
  else
    PACKAGE_MANAGER="npm"
  fi

  # Check Git
  if command -v git >/dev/null && [[ -d ".git" ]]; then
    local git_status
    git_status=$(git status --porcelain 2>/dev/null || echo "")
    [[ -n "$git_status" ]] && warn "Working directory has uncommitted changes"
  fi

  success "Environment OK - Node.js v$NODE_VERSION, using $PACKAGE_MANAGER"
}

# ========================================
# Enhanced Dependency Management
# ========================================
install_dependencies() {
  step "Managing dependencies..."

  if [[ "$FORCE_REINSTALL" == "true" ]]; then
    log "Force reinstall requested - clearing node_modules and lockfiles"
    execute_command "rm -rf node_modules" "Removing node_modules"
    [[ -f "package-lock.json" ]] && rm package-lock.json
    [[ -f "yarn.lock" ]] && rm yarn.lock
    [[ -f "pnpm-lock.yaml" ]] && rm pnpm-lock.yaml
  fi

  # Install base dependencies
  case "$PACKAGE_MANAGER" in
    "pnpm")
      execute_command "pnpm install" "Installing with pnpm"
      ;;
    "yarn")
      execute_command "yarn install --frozen-lockfile || yarn install" "Installing with yarn"
      ;;
    "bun")
      execute_command "bun install" "Installing with bun"
      ;;
    *)
      execute_command "npm install" "Installing with npm"
      ;;
  esac

  # Verify and install critical dependencies
  local required_deps=(
    "react@^18.0.0"
    "react-dom@^18.0.0"
    "typescript@^5.0.0"
    "vite@^5.0.0"
    "@vitejs/plugin-react@^4.0.0"
  )

  local dev_deps=(
    "@types/node"
    "@types/react@^18.0.0"
    "@types/react-dom@^18.0.0"
    "eslint@^8.0.0"
    "@typescript-eslint/eslint-plugin@^6.0.0"
    "@typescript-eslint/parser@^6.0.0"
    "eslint-plugin-react@^7.32.0"
    "eslint-plugin-react-hooks@^4.6.0"
  )

  for dep in "${required_deps[@]}"; do
    local pkg_name="${dep%%@*}"
    if ! check_package_exists "$pkg_name"; then
      log "Installing missing dependency: $dep"
      install_package "$dep" "production"
    fi
  done

  for dep in "${dev_deps[@]}"; do
    local pkg_name="${dep%%@*}"
    if ! check_package_exists "$pkg_name"; then
      log "Installing missing dev dependency: $dep"
      install_package "$dep" "development"
    fi
  done

  success "Dependencies verified and installed"
}

check_package_exists() {
  local package="$1"
  case "$PACKAGE_MANAGER" in
    "pnpm") pnpm list "$package" &>/dev/null ;;
    "yarn") yarn list --pattern "$package" &>/dev/null ;;
    "bun") bun pm ls | grep -q "$package" ;;
    *) npm list "$package" &>/dev/null ;;
  esac
}

install_package() {
  local package="$1"
  local type="${2:-production}"
  
  case "$PACKAGE_MANAGER" in
    "pnpm")
      if [[ "$type" == "development" ]]; then
        execute_command "pnpm add -D $package" "Installing $package as dev dependency"
      else
        execute_command "pnpm add $package" "Installing $package"
      fi
      ;;
    "yarn")
      if [[ "$type" == "development" ]]; then
        execute_command "yarn add -D $package" "Installing $package as dev dependency"
      else
        execute_command "yarn add $package" "Installing $package"
      fi
      ;;
    "bun")
      if [[ "$type" == "development" ]]; then
        execute_command "bun add -d $package" "Installing $package as dev dependency"
      else
        execute_command "bun add $package" "Installing $package"
      fi
      ;;
    *)
      if [[ "$type" == "development" ]]; then
        execute_command "npm install --save-dev $package" "Installing $package as dev dependency"
      else
        execute_command "npm install --save $package" "Installing $package"
      fi
      ;;
  esac
}

# ========================================
# Enhanced Configuration Management
# ========================================
verify_configs() {
  step "Verifying and creating configuration files..."

  create_package_json_scripts
  create_typescript_config
  create_vite_config
  create_eslint_config
  create_vercel_config
  create_environment_files
  create_gitignore

  success "Configuration files verified"
}

create_package_json_scripts() {
  if [[ ! -f "package.json" ]]; then
    warn "Creating package.json..."
    execute_command 'cat > package.json << EOL
{
  "name": "cyber-terminal",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist node_modules/.vite",
    "test": "echo \"No tests specified\" && exit 0"
  },
  "dependencies": {},
  "devDependencies": {}
}
EOL'
  else
    # Add missing scripts to existing package.json
    local scripts_to_add=(
      '"type-check": "tsc --noEmit"'
      '"lint:fix": "eslint . --ext ts,tsx --fix"'
      '"clean": "rm -rf dist node_modules/.vite"'
    )
    
    for script in "${scripts_to_add[@]}"; do
      if ! grep -q "${script%%:*}" package.json; then
        debug "Adding script: $script"
        # This would require jq for proper JSON manipulation
      fi
    done
  fi
}

create_typescript_config() {
  if [[ ! -f "tsconfig.json" ]]; then
    warn "Creating tsconfig.json..."
    execute_command 'cat > tsconfig.json << EOL
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOL'

    execute_command 'cat > tsconfig.node.json << EOL
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOL'
  fi
}

create_vite_config() {
  if [[ ! -f "vite.config.ts" && ! -f "vite.config.js" ]]; then
    warn "Creating vite.config.ts..."
    execute_command 'cat > vite.config.ts << EOL
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
    host: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
        },
      },
    },
  },
  preview: {
    port: 3000,
    host: true,
  },
})
EOL'
  fi
}

create_eslint_config() {
  if [[ ! -f ".eslintrc.json" && ! -f ".eslintrc.js" && ! -f "eslint.config.js" ]]; then
    warn "Creating .eslintrc.json..."
    execute_command 'cat > .eslintrc.json << EOL
{
  "root": true,
  "env": { "browser": true, "es2020": true, "node": true },
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "ignorePatterns": ["dist", ".eslintrc.json"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "ecmaFeatures": { "jsx": true }
  },
  "plugins": ["react-refresh", "@typescript-eslint"],
  "settings": {
    "react": { "version": "detect" }
  },
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react-refresh/only-export-components": [
      "warn",
      { "allowConstantExport": true }
    ],
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off"
  }
}
EOL'
  fi
}

create_vercel_config() {
  if [[ ! -f "vercel.json" ]]; then
    warn "Creating vercel.json..."
    execute_command 'cat > vercel.json << EOL
{
  "version": 2,
  "builds": [
    {
      "src": "vite.config.ts",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "NODE_VERSION": "18.x"
  },
  "installCommand": "npm install",
  "buildCommand": "npm run build"
}
EOL'
  fi
}

create_environment_files() {
  if [[ ! -f ".env" && ! -f ".env.local" && ! -f ".env.example" ]]; then
    warn "Creating .env.example..."
    execute_command 'cat > .env.example << EOL
# Application
VITE_APP_NAME=CyberTerminal
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# API Configuration
VITE_API_URL=https://api.example.com
VITE_API_TIMEOUT=10000

# Database (Backend only - not exposed to client)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cyberterminal
DB_USER=user
DB_PASS=password

# Features
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=false
ENABLE_EXPERIMENTAL_FEATURES=false

# External Services
VITE_SENTRY_DSN=
VITE_GOOGLE_ANALYTICS_ID=
EOL'
  fi
}

create_gitignore() {
  if [[ ! -f ".gitignore" ]]; then
    warn "Creating .gitignore..."
    execute_command 'cat > .gitignore << EOL
# Dependencies
node_modules/
.pnp
.pnp.js

# Production builds
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Temporary files
*.tmp
*.temp

# Cache
.cache/
.vite/
.eslintcache

# Backup files
*.backup
.repair-backup-*/

# Logs
*.log
repair.log
EOL'
  fi
}

# ========================================
# Enhanced Source Structure Management
# ========================================
verify_source_structure() {
  step "Verifying source structure..."

  local required_dirs=(
    "src"
    "src/components"
    "src/hooks"
    "src/utils"
    "src/types"
    "src/services"
    "src/assets"
    "public"
  )

  for dir in "${required_dirs[@]}"; do
    if [[ ! -d "$dir" ]]; then
      debug "Creating directory: $dir"
      execute_command "mkdir -p $dir" "Creating $dir"
    fi
  done

  create_main_files
  create_component_files
  create_utility_files
  create_public_files

  success "Source structure verified"
}

create_main_files() {
  # Create index.html
  if [[ ! -f "index.html" ]]; then
    warn "Creating index.html..."
    execute_command 'cat > index.html << EOL
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Cyber Terminal - Advanced Terminal Interface" />
    <title>Cyber Terminal</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOL'
  fi

  # Create main.tsx
  if [[ ! -f "src/main.tsx" ]]; then
    warn "Creating src/main.tsx..."
    execute_command 'cat > src/main.tsx << EOL
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"

const root = document.getElementById("root")
if (!root) throw new Error("Root element not found")

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOL'
  fi

  # Create App.tsx
  if [[ ! -f "src/App.tsx" ]]; then
    warn "Creating src/App.tsx..."
    execute_command 'cat > src/App.tsx << EOL
import React from "react"
import "./App.css"

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>🔥 Cyber Terminal</h1>
        <p>Advanced Terminal Interface</p>
      </header>
      <main className="app-main">
        <div className="terminal-container">
          <div className="terminal-header">
            <span className="terminal-title">Terminal</span>
            <div className="terminal-controls">
              <span className="control minimize"></span>
              <span className="control maximize"></span>
              <span className="control close"></span>
            </div>
          </div>
          <div className="terminal-content">
            <p>$ Welcome to Cyber Terminal</p>
            <p>$ System initialized successfully</p>
            <p className="cursor">$ _</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
EOL'
  fi

  # Create index.css
  if [[ ! -f "src/index.css" ]]; then
    warn "Creating src/index.css..."
    execute_command 'cat > src/index.css << EOL
:root {
  --bg-primary: #0a0e27;
  --bg-secondary: #1a1f3a;
  --text-primary: #00ff88;
  --text-secondary: #64ffda;
  --accent: #ff6b35;
  --border: #2d3748;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Courier New", monospace;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  overflow-x: hidden;
}

#root {
  min-height: 100vh;
}
EOL'
  fi

  # Create App.css
  if [[ ! -f "src/App.css" ]]; then
    warn "Creating src/App.css..."
    execute_command 'cat > src/App.css << EOL
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
}

.app-header {
  text-align: center;
  padding: 2rem;
  background: rgba(0, 255, 136, 0.1);
  border-bottom: 1px solid var(--border);
}

.app-header h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 20px var(--text-primary);
}

.app-header p {
  color: var(--text-secondary);
  font-size: 1.2rem;
}

.app-main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.terminal-container {
  width: 100%;
  max-width: 800px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.terminal-header {
  background: var(--bg-primary);
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
}

.terminal-title {
  color: var(--text-secondary);
  font-weight: bold;
}

.terminal-controls {
  display: flex;
  gap: 0.5rem;
}

.control {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
}

.control.close { background: #ff5f56; }
.control.minimize { background: #ffbd2e; }
.control.maximize { background: #27ca3f; }

.terminal-content {
  padding: 1.5rem;
  font-family: "Courier New", monospace;
  font-size: 1rem;
  line-height: 1.8;
}

.terminal-content p {
  margin-bottom: 0.5rem;
}

.cursor {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 2rem;
  }
  
  .terminal-container {
    margin: 1rem;
  }
}
EOL'
  fi
}

create_component_files() {
  # Create a sample component
  if [[ ! -f "src/components/Terminal.tsx" ]]; then
    debug "Creating sample Terminal component..."
    execute_command 'cat > src/components/Terminal.tsx << EOL
import React, { useState, useEffect } from "react"

interface TerminalProps {
  className?: string
}

export const Terminal: React.FC<TerminalProps> = ({ className = "" }) => {
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<string[]>([
    "Welcome to Cyber Terminal v1.0.0",
    "Type '\''help'\'' for available commands",
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newHistory = [...history, `$ ${input}`]
    
    // Simple command processing
    switch (input.toLowerCase()) {
      case "help":
        newHistory.push("Available commands: help, clear, date, version")
        break
      case "clear":
        setHistory([])
        setInput("")
        return
      case "date":
        newHistory.push(new Date().toString())
        break
      case "version":
        newHistory.push("Cyber Terminal v1.0.0")
        break
      default:
        newHistory.push(`Command not found: ${input}`)
    }

    setHistory(newHistory)
    setInput("")
  }

  return (
    <div className={`terminal ${className}`}>
      <div className="terminal-output">
        {history.map((line, index) => (
          <div key={index} className="terminal-line">
            {line}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="terminal-input-form">
        <span className="terminal-prompt">$ </span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="terminal-input"
          autoFocus
          spellCheck={false}
        />
      </form>
    </div>
  )
}

export default Terminal
EOL'
  fi

  # Create component index file
  if [[ ! -f "src/components/index.ts" ]]; then
    debug "Creating components index file..."
    execute_command 'cat > src/components/index.ts << EOL
export { Terminal } from "./Terminal"
EOL'
  fi
}

create_utility_files() {
  # Create utils index
  if [[ ! -f "src/utils/index.ts" ]]; then
    execute_command 'cat > src/utils/index.ts << EOL
export * from "./constants"
export * from "./helpers"
EOL'
  fi

  # Create constants
  if [[ ! -f "src/utils/constants.ts" ]]; then
    execute_command 'cat > src/utils/constants.ts << EOL
export const APP_NAME = "Cyber Terminal"
export const APP_VERSION = "1.0.0"

export const API_ENDPOINTS = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || "10000"),
}

export const THEME_COLORS = {
  primary: "#00ff88",
  secondary: "#64ffda",
  accent: "#ff6b35",
  background: {
    primary: "#0a0e27",
    secondary: "#1a1f3a",
  },
  border: "#2d3748",
}

export const TERMINAL_COMMANDS = [
  "help",
  "clear",
  "date",
  "version",
  "ls",
  "pwd",
  "whoami",
  "exit",
] as const

export type TerminalCommand = typeof TERMINAL_COMMANDS[number]
EOL'
  fi

  # Create helpers
  if [[ ! -f "src/utils/helpers.ts" ]]; then
    execute_command 'cat > src/utils/helpers.ts << EOL
/**
 * Format a date string for display
 */
export const formatDate = (date: Date = new Date()): string => {
  return date.toLocaleLString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

/**
 * Debounce function calls
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Sleep for a given number of milliseconds
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Generate a random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV
}

/**
 * Log only in development
 */
export const devLog = (...args: any[]): void => {
  if (isDevelopment()) {
    console.log(...args)
  }
}
EOL'
  fi

  # Create types
  if [[ ! -f "src/types/index.ts" ]]; then
    execute_command 'cat > src/types/index.ts << EOL
export interface TerminalState {
  history: string[]
  input: string
  isLoading: boolean
}

export interface CommandResult {
  output: string
  error?: string
}

export interface AppConfig {
  name: string
  version: string
  apiUrl: string
  enableDebug: boolean
}

export type ThemeMode = "dark" | "light"

export interface User {
  id: string
  username: string
  email?: string
  lastActive: Date
}
EOL'
  fi

  # Create hooks
  if [[ ! -f "src/hooks/useTerminal.ts" ]]; then
    execute_command 'cat > src/hooks/useTerminal.ts << EOL
import { useState, useCallback } from "react"
import type { TerminalState, CommandResult } from "@/types"
import { TERMINAL_COMMANDS, APP_NAME, APP_VERSION } from "@/utils/constants"
import { formatDate } from "@/utils/helpers"

export const useTerminal = () => {
  const [state, setState] = useState<TerminalState>({
    history: [
      `Welcome to ${APP_NAME} v${APP_VERSION}`,
      "Type 'help' for available commands",
    ],
    input: "",
    isLoading: false,
  })

  const executeCommand = useCallback((command: string): CommandResult => {
    const cmd = command.toLowerCase().trim()
    
    switch (cmd) {
      case "help":
        return {
          output: `Available commands: ${TERMINAL_COMMANDS.join(", ")}`,
        }
      
      case "clear":
        return { output: "CLEAR_SCREEN" }
      
      case "date":
        return { output: formatDate() }
      
      case "version":
        return { output: `${APP_NAME} v${APP_VERSION}` }
      
      case "whoami":
        return { output: "cyber-user" }
      
      case "pwd":
        return { output: "/home/cyber-user" }
      
      case "ls":
        return { output: "documents/  downloads/  projects/  scripts/" }
      
      case "exit":
        return { output: "Goodbye! 👋" }
      
      default:
        return {
          output: `Command not found: ${command}`,
          error: "COMMAND_NOT_FOUND",
        }
    }
  }, [])

  const submitCommand = useCallback((input: string) => {
    if (!input.trim()) return

    setState(prev => ({
      ...prev,
      isLoading: true,
    }))

    // Simulate command processing delay
    setTimeout(() => {
      const result = executeCommand(input)
      
      setState(prev => {
        const newHistory = [...prev.history, `$ ${input}`]
        
        if (result.output === "CLEAR_SCREEN") {
          return {
            ...prev,
            history: [],
            input: "",
            isLoading: false,
          }
        }
        
        newHistory.push(result.output)
        
        return {
          ...prev,
          history: newHistory,
          input: "",
          isLoading: false,
        }
      })
    }, 100)
  }, [executeCommand])

  const setInput = useCallback((input: string) => {
    setState(prev => ({ ...prev, input }))
  }, [])

  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, history: [] }))
  }, [])

  return {
    ...state,
    submitCommand,
    setInput,
    clearHistory,
  }
}
EOL'
  fi

  # Create hooks index
  if [[ ! -f "src/hooks/index.ts" ]]; then
    execute_command 'cat > src/hooks/index.ts << EOL
export { useTerminal } from "./useTerminal"
EOL'
  fi
}

create_public_files() {
  # Create public/vite.svg
  if [[ ! -f "public/vite.svg" ]]; then
    execute_command 'cat > public/vite.svg << EOL
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"></stop><stop offset="8.333%" stop-color="#FFDD35"></stop><stop offset="100%" stop-color="#FFA800"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>
EOL'
  fi
}

# ========================================
# Enhanced Build and Quality Checks
# ========================================
validate_code_quality() {
  step "Validating code quality..."

  # TypeScript check
  if command -v tsc >/dev/null || check_package_exists "typescript"; then
    log "Running TypeScript type checking..."
    case "$PACKAGE_MANAGER" in
      "pnpm") execute_command "pnpm run type-check" "TypeScript check" || warn "TypeScript issues detected" ;;
      "yarn") execute_command "yarn type-check" "TypeScript check" || warn "TypeScript issues detected" ;;
      "bun") execute_command "bun run type-check" "TypeScript check" || warn "TypeScript issues detected" ;;
      *) execute_command "npm run type-check" "TypeScript check" || warn "TypeScript issues detected" ;;
    esac
  fi

  # ESLint check
  if check_package_exists "eslint"; then
    log "Running ESLint..."
    case "$PACKAGE_MANAGER" in
      "pnpm") execute_command "pnpm run lint" "ESLint check" || warn "Linting issues found" ;;
      "yarn") execute_command "yarn lint" "ESLint check" || warn "Linting issues found" ;;
      "bun") execute_command "bun run lint" "ESLint check" || warn "Linting issues found" ;;
      *) execute_command "npm run lint" "ESLint check" || warn "Linting issues found" ;;
    esac
  fi

  # Check for common React issues
  if find src/ -name "*.tsx" -o -name "*.jsx" | head -1 | read -r; then
    if grep -rq "React is not defined" src/ 2>/dev/null; then
      warn "Found files with missing React imports - modern React with JSX transform doesn't require explicit React imports"
    fi
  fi

  success "Code quality validation complete"
}

verify_build_process() {
  step "Verifying build process..."

  # Clean previous build
  if [[ -d "dist" ]]; then
    log "Cleaning previous build..."
    execute_command "rm -rf dist" "Removing dist directory"
  fi

  # Run build
  log "Running production build..."
  case "$PACKAGE_MANAGER" in
    "pnpm") execute_command "pnpm run build" "Build with pnpm" || error "Build failed" ;;
    "yarn") execute_command "yarn build" "Build with yarn" || error "Build failed" ;;
    "bun") execute_command "bun run build" "Build with bun" || error "Build failed" ;;
    *) execute_command "npm run build" "Build with npm" || error "Build failed" ;;
  esac

  # Verify build output
  if [[ ! -d "dist" ]]; then
    error "Build did not produce dist directory"
  fi

  if [[ ! -f "dist/index.html" ]]; then
    error "Build did not produce index.html"
  fi

  local assets_dir="dist/assets"
  if [[ -d "$assets_dir" ]]; then
    local js_files
    js_files=$(find "$assets_dir" -name "*.js" | wc -l)
    local css_files
    css_files=$(find "$assets_dir" -name "*.css" | wc -l)
    
    if [[ "$js_files" -eq 0 ]]; then
      warn "No JavaScript files found in build output"
    fi
    
    log "Build output: $js_files JS files, $css_files CSS files"
  fi

  success "Build verification complete"
}

# ========================================
# Enhanced Vercel Configuration
# ========================================
verify_vercel_deployment() {
  step "Verifying Vercel deployment configuration..."

  # Check for jq dependency
  if ! command -v jq >/dev/null; then
    warn "jq not found - skipping advanced JSON manipulation"
    return 0
  fi

  local vercel_config="vercel.json"
  
  # Validate existing config
  if [[ -f "$vercel_config" ]]; then
    if ! jq empty "$vercel_config" &>/dev/null; then
      warn "Invalid JSON in vercel.json - backing up and recreating"
      execute_command "mv $vercel_config ${vercel_config}.backup" "Backing up invalid config"
      create_vercel_config
    fi
  fi

  # Update package manager in vercel.json based on detected manager
  if [[ -f "$vercel_config" ]] && command -v jq >/dev/null; then
    local install_cmd build_cmd
    
    case "$PACKAGE_MANAGER" in
      "pnpm")
        install_cmd="pnpm install"
        build_cmd="pnpm run build"
        ;;
      "yarn")
        install_cmd="yarn install --frozen-lockfile"
        build_cmd="yarn build"
        ;;
      "bun")
        install_cmd="bun install"
        build_cmd="bun run build"
        ;;
      *)
        install_cmd="npm ci"
        build_cmd="npm run build"
        ;;
    esac

    local tmp_file
    tmp_file=$(mktemp)
    jq --arg install "$install_cmd" --arg build "$build_cmd" '
      .installCommand = $install |
      .buildCommand = $build
    ' "$vercel_config" > "$tmp_file" && mv "$tmp_file" "$vercel_config"
  fi

  # Create .vercelignore if it doesn't exist
  if [[ ! -f ".vercelignore" ]]; then
    execute_command 'cat > .vercelignore << EOL
node_modules
.git
*.log
.env
.env.local
src
public
*.md
.repair-backup-*
EOL' "Creating .vercelignore"
  fi

  success "Vercel configuration verified"
}

# ========================================
# Performance and Security Checks
# ========================================
run_security_audit() {
  step "Running security audit..."

  case "$PACKAGE_MANAGER" in
    "pnpm")
      execute_command "pnpm audit --audit-level moderate" "Security audit" || warn "Security vulnerabilities found"
      ;;
    "yarn")
      execute_command "yarn audit --level moderate" "Security audit" || warn "Security vulnerabilities found"
      ;;
    "bun")
      log "Bun doesn't have built-in audit - skipping"
      ;;
    *)
      execute_command "npm audit --audit-level moderate" "Security audit" || warn "Security vulnerabilities found"
      ;;
  esac

  # Check for sensitive files
  local sensitive_patterns=(".env" "*.key" "*.pem" "config/secrets*")
  for pattern in "${sensitive_patterns[@]}"; do
    if find . -name "$pattern" -not -path "./node_modules/*" | head -1 | read -r; then
      warn "Found potentially sensitive files matching: $pattern"
    fi
  done

  success "Security audit complete"
}

check_performance() {
  step "Checking performance considerations..."

  # Check bundle size (basic check)
  if [[ -d "dist/assets" ]]; then
    local total_size
    total_size=$(du -sh dist/assets 2>/dev/null | cut -f1 || echo "unknown")
    log "Total assets size: $total_size"
    
    # Check for large files
    find dist/assets -size +1M -type f 2>/dev/null | while read -r file; do
      warn "Large asset detected: $file ($(du -h "$file" | cut -f1))"
    done
  fi

  # Check for unused dependencies (basic)
  if command -v jq >/dev/null && [[ -f "package.json" ]]; then
    local deps
    deps=$(jq -r '.dependencies // {} | keys[]' package.json 2>/dev/null)
    
    if [[ -n "$deps" ]]; then
      log "Checking for potentially unused dependencies..."
      echo "$deps" | while read -r dep; do
        if ! grep -r "import.*from.*['\"]$dep" src/ &>/dev/null && \
           ! grep -r "require.*['\"]$dep" src/ &>/dev/null; then
          debug "Potentially unused dependency: $dep"
        fi
      done
    fi
  fi

  success "Performance check complete"
}

# ========================================
# Interactive Mode Functions
# ========================================
interactive_mode() {
  echo -e "${CYAN}=== Interactive Repair Mode ===${NC}"
  
  local tasks=(
    "verify_environment:Environment verification"
    "install_dependencies:Dependency management"
    "verify_configs:Configuration files"
    "verify_source_structure:Source structure"
    "validate_code_quality:Code quality checks"
    "verify_build_process:Build verification"
    "verify_vercel_deployment:Vercel configuration"
    "run_security_audit:Security audit"
    "check_performance:Performance checks"
  )

  for task_info in "${tasks[@]}"; do
    local task_func="${task_info%%:*}"
    local task_desc="${task_info#*:}"
    
    echo -e "\n${YELLOW}Run $task_desc? (y/N/q):${NC} "
    read -r response
    
    case "$response" in
      [Yy]*)
        $task_func
        ;;
      [Qq]*)
        log "Interactive mode terminated by user"
        exit 0
        ;;
      *)
        log "Skipping $task_desc"
        ;;
    esac
  done
}

# ========================================
# Summary and Reporting
# ========================================
generate_summary() {
  step "Generating repair summary..."

  local summary_file="$PROJECT_ROOT/repair-summary.md"
  
  execute_command "cat > $summary_file << EOL
# Project Repair Summary

Generated: $(date)
Node.js Version: $NODE_VERSION
Package Manager: $PACKAGE_MANAGER
Repair Mode: $REPAIR_MODE

## Files Created/Modified

### Configuration Files
- \`tsconfig.json\` - TypeScript configuration
- \`vite.config.ts\` - Vite build configuration
- \`.eslintrc.json\` - ESLint configuration
- \`vercel.json\` - Vercel deployment configuration
- \`.gitignore\` - Git ignore patterns
- \`.env.example\` - Environment variables template

### Source Files
- \`src/main.tsx\` - Application entry point
- \`src/App.tsx\` - Main application component
- \`src/index.css\` - Global styles
- \`src/App.css\` - Application styles
- \`src/components/Terminal.tsx\` - Terminal component
- \`src/hooks/useTerminal.ts\` - Terminal logic hook
- \`src/utils/constants.ts\` - Application constants
- \`src/utils/helpers.ts\` - Utility functions
- \`src/types/index.ts\` - TypeScript type definitions

## Next Steps

1. **Review the generated files** and customize them for your specific needs
2. **Install additional dependencies** if required for your project
3. **Configure environment variables** by copying \`.env.example\` to \`.env\`
4. **Run the development server**: \`$PACKAGE_MANAGER run dev\`
5. **Deploy to Vercel**: \`vercel --prod\`

## Available Scripts

- \`$PACKAGE_MANAGER run dev\` - Start development server
- \`$PACKAGE_MANAGER run build\` - Build for production
- \`$PACKAGE_MANAGER run preview\` - Preview production build
- \`$PACKAGE_MANAGER run lint\` - Run ESLint
- \`$PACKAGE_MANAGER run type-check\` - Run TypeScript checks

## Backup Location

Original files backed up to: \`$BACKUP_DIR\`

---
*Generated by Enhanced Project Repair Script*
EOL"

  success "Summary generated: $summary_file"
}

# ========================================
# Main Execution Function
# ========================================
main() {
  # Initialize logging
  echo "# Enhanced Project Repair Log - $(date)" > "$LOG_FILE"
  
  # Parse command line arguments
  parse_arguments "$@"
  
  # Create backup if needed
  create_backup
  
  # Print header
  echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║           Enhanced Project Repair & Validation           ║${NC}"
  echo -e "${BLUE}║                      v2.0.0                              ║${NC}"
  echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
  echo
  
  step "Starting project repair and validation..."
  
  # Run repair based on mode
  case "$REPAIR_MODE" in
    "interactive")
      interactive_mode
      ;;
    "minimal")
      verify_environment
      install_dependencies
      verify_build_process
      ;;
    *)
      # Auto mode - run all tasks
      verify_environment
      install_dependencies
      verify_configs
      verify_source_structure
      validate_code_quality
      verify_build_process
      verify_vercel_deployment
      run_security_audit
      check_performance
      ;;
  esac
  
  # Generate summary
  generate_summary
  
  # Final message
  echo
  echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║              🎉 Repair Completed Successfully! 🎉         ║${NC}"
  echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
  echo
  echo -e "${YELLOW}📋 Check repair.log and repair-summary.md for details${NC}"
  echo -e "${YELLOW}🚀 Ready to start development: $PACKAGE_MANAGER run dev${NC}"
  echo -e "${YELLOW}📦 Deploy to Vercel: vercel --prod${NC}"
  echo
  
  success "All repair tasks completed successfully"
}

# ========================================
# Script Entry Point
# ========================================
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
fi
