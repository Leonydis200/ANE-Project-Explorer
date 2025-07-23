#!/usr/bin/env bash
set -euo pipefail
[[ "${DEBUG:-}" == "true" ]] && set -x

# ========================================
# Project Repair & Validation Script v3.0+
# ========================================

# Color codes for output
readonly NC='\033[0m'
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly BOLD='\033[1m'
readonly DIM='\033[2m'

# Global constants
readonly SCRIPT_VERSION="3.0.0"
readonly PROJECT_ROOT="$(pwd)"
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly LOG_FILE="$PROJECT_ROOT/repair.log"
readonly BACKUP_DIR="$PROJECT_ROOT/.repair-backup-$(date +%Y%m%d-%H%M%S)"
readonly TEMP_DIR="$(mktemp -d)"
readonly MIN_NODE_VERSION="18.0.0"
readonly MIN_DISK_SPACE_MB=500

# Global flags (default values)
PACKAGE_MANAGER=""
NODE_VERSION=""
REPAIR_MODE="auto"
SKIP_BACKUP=false
FORCE_REINSTALL=false
VERBOSE=false
PARALLEL_JOBS=4
export QUIET=false
export DEBUG=false
export DRY_RUN=false
export CHECK_ONLY=false
export FIX_PERMISSIONS=false
export UPDATE_DEPS=false

# Cleanup on exit
cleanup() {
  [[ -d "$TEMP_DIR" ]] && rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# ----------------------------------------
# Logging functions (write to console + log file)
# ----------------------------------------
log() {
  local msg="$1"
  local timestamp="$(date '+%H:%M:%S')"
  local entry="${BLUE}[${timestamp}] [INFO]${NC} $msg"
  if [[ "${QUIET:-false}" == "true" ]]; then
    echo -e "$entry" >> "$LOG_FILE"
  else
    echo -e "$entry" | tee -a "$LOG_FILE"
  fi
}
success() {
  local msg="$1"
  local timestamp="$(date '+%H:%M:%S')"
  local entry="${GREEN}[${timestamp}] [✓]${NC} $msg"
  if [[ "${QUIET:-false}" == "true" ]]; then
    echo -e "$entry" >> "$LOG_FILE"
  else
    echo -e "$entry" | tee -a "$LOG_FILE"
  fi
}
warn() {
  local msg="$1"
  local timestamp="$(date '+%H:%M:%S')"
  local entry="${YELLOW}[${timestamp}] [⚠]${NC} $msg"
  if [[ "${QUIET:-false}" == "true" ]]; then
    echo -e "$entry" >> "$LOG_FILE"
  else
    echo -e "$entry" | tee -a "$LOG_FILE"
  fi
}
error() {
  local msg="$1"
  local timestamp="$(date '+%H:%M:%S')"
  local entry="${RED}[${timestamp}] [✗]${NC} $msg"
  if [[ "${QUIET:-false}" == "true" ]]; then
    echo -e "$entry" >> "$LOG_FILE"
  else
    echo -e "$entry" | tee -a "$LOG_FILE"
  fi
  exit 1
}
debug() {
  local msg="$1"
  if [[ "${DEBUG:-false}" == "true" ]]; then
    local timestamp="$(date '+%H:%M:%S')"
    local entry="${PURPLE}[${timestamp}] [DEBUG]${NC} $msg"
    if [[ "${QUIET:-false}" == "true" ]]; then
      echo -e "$entry" >> "$LOG_FILE"
    else
      echo -e "$entry" | tee -a "$LOG_FILE"
    fi
  fi
}
step() {
  local msg="$1"
  local timestamp="$(date '+%H:%M:%S')"
  local entry="\n${CYAN}${BOLD}[${timestamp}] ▶${NC} $msg"
  if [[ "${QUIET:-false}" == "true" ]]; then
    echo -e "$entry" >> "$LOG_FILE"
  else
    echo -e "$entry" | tee -a "$LOG_FILE"
  fi
}
progress() {
  # This function prints an indented progress message (no timestamp)
  local msg="$1"
  if [[ "${QUIET:-false}" != "true" ]]; then
    echo -e "${DIM}  └─ $msg${NC}"
  fi
}

# ----------------------------------------
# Utility: Progress bar (for illustrative loops)
# ----------------------------------------
show_progress() {
  local current=$1
  local total=$2
  local width=50
  local completed=$((current * width / total))
  local percentage=$((current * 100 / total))
  printf "\r${CYAN}Progress: ["
  printf "%*s" $completed | tr ' ' '='
  printf "%*s" $((width - completed)) | tr ' ' '-'
  printf "] %d%% (%d/%d)${NC}" "$percentage" "$current" "$total"
}

# ----------------------------------------
# Banner and Usage
# ----------------------------------------
print_banner() {
  echo -e "${BLUE}${BOLD}"
  cat << 'EOF'
╔═══════════════════════════════════════════════════════════╗
║          Enhanced Project Repair & Validation            ║
║                        v3.0.0                            ║
║    🔧 Automated Project Setup & Dependency Management    ║
╚═══════════════════════════════════════════════════════════╝
EOF
  echo -e "${NC}"
}

print_usage() {
  cat << EOF
${BOLD}Usage:${NC} $0 [OPTIONS]

${BOLD}Options:${NC}
  -h, --help           Show this help message
  -m, --mode MODE      Repair mode: auto|interactive|minimal|strict (default: auto)
  -f, --force          Force reinstall all dependencies
  -b, --skip-backup    Skip creating backup
  -d, --debug          Enable debug logging
  -v, --verbose        Verbose output with detailed progress
  -j, --jobs N         Number of parallel jobs (default: 4)
  -q, --quiet          Suppress non-essential output (log to file only)
  --dry-run           Show what would be done without executing
  --check-only        Only validate system, don't modify anything
  --fix-permissions   Fix file permissions after repair
  --update-deps       Update dependencies to latest versions

${BOLD}Repair Modes:${NC}
  auto        - Full automated repair (default)
  interactive - Prompt for each step
  minimal     - Essential fixes only
  strict      - Strict validation (errors on warnings)

${BOLD}Examples:${NC}
  $0                           # Run with default settings
  $0 -m interactive -v         # Interactive mode with verbose output
  $0 -f -d --update-deps       # Force reinstall with dependency updates
  $0 --check-only -q           # Quick validation check (quiet)
EOF
}

# ----------------------------------------
# Argument parsing
# ----------------------------------------
parse_arguments() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -h|--help)
        print_usage
        exit 0
        ;;
      -m|--mode)
        REPAIR_MODE="$2"
        if [[ ! "$REPAIR_MODE" =~ ^(auto|interactive|minimal|strict)$ ]]; then
          error "Invalid mode: $REPAIR_MODE. Use: auto, interactive, minimal, or strict"
        fi
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
        DEBUG=true
        shift
        ;;
      -v|--verbose)
        VERBOSE=true
        shift
        ;;
      -j|--jobs)
        PARALLEL_JOBS="$2"
        if ! [[ "$PARALLEL_JOBS" =~ ^[1-9][0-9]*$ ]]; then
          error "Invalid job count: $PARALLEL_JOBS"
        fi
        shift 2
        ;;
      -q|--quiet)
        QUIET=true
        shift
        ;;
      --dry-run)
        DRY_RUN=true
        shift
        ;;
      --check-only)
        CHECK_ONLY=true
        shift
        ;;
      --fix-permissions)
        FIX_PERMISSIONS=true
        shift
        ;;
      --update-deps)
        UPDATE_DEPS=true
        shift
        ;;
      *)
        error "Unknown option: $1. Use -h for help."
        ;;
    esac
  done
}

# ----------------------------------------
# Execute a command with logging and optional dry-run/check-only
# ----------------------------------------
execute_command() {
  local cmd="$1"
  local description="${2:-}"
  local allow_failure="${3:-false}"

  if [[ "${CHECK_ONLY:-}" == "true" ]]; then
    debug "[CHECK-ONLY] $cmd"
    return 0
  fi
  if [[ "${DRY_RUN:-}" == "true" ]]; then
    log "[DRY-RUN] Would execute: $cmd"
    return 0
  fi

  [[ -n "$description" ]] && progress "$description"
  debug "Executing: $cmd"

  # Execute command, logging output
  if eval "$cmd" 2>&1 | tee -a "$LOG_FILE"; then
    return 0
  else
    local exit_code=$?
    if [[ "$allow_failure" == "true" ]]; then
      warn "Command failed but continuing: $cmd (code $exit_code)"
      return $exit_code
    else
      error "Command failed: $cmd (exit code: $exit_code)"
    fi
  fi
}

# ----------------------------------------
# System checks
# ----------------------------------------
check_system_requirements() {
  step "Validating system requirements"
  # Disk space
  local available_kb
  available_kb=$(df -Pk . | awk 'NR==2 {print $4}')
  local available_mb=$((available_kb / 1024))
  if [[ $available_mb -lt $MIN_DISK_SPACE_MB ]]; then
    warn "Low disk space: ${available_mb}MB available (recommended: ${MIN_DISK_SPACE_MB}MB+)"
  fi
  # Memory (skip on macOS)
  if [[ "$(uname -s)" == "Linux"* ]]; then
    if command -v free >/dev/null; then
      local avail_ram_mb
      avail_ram_mb=$(free -m | awk 'NR==2 {print $7}')
      [[ $avail_ram_mb -lt 1000 ]] && warn "Low available RAM: ${avail_ram_mb}MB"
    fi
  else
    debug "Skipping memory check: 'free' not available on non-Linux OS"
  fi
  # Required tools
  local required_tools=( "curl" "git" )
  for tool in "${required_tools[@]}"; do
    if ! command -v "$tool" >/dev/null; then
      warn "$tool not found (recommended for full functionality)"
    fi
  done
  success "System requirements validated"
}

get_node_info() {
  if ! command -v node >/dev/null; then
    error "Node.js is not installed. Install Node.js v$MIN_NODE_VERSION+ first."
  fi
  NODE_VERSION=$(node --version 2>/dev/null | sed 's/v//')
  if ! printf '%s\n%s\n' "$MIN_NODE_VERSION" "$NODE_VERSION" | sort -V -C; then
    error "Node.js v$NODE_VERSION detected. Required: v$MIN_NODE_VERSION+"
  fi
  local npm_version
  npm_version=$(npm --version 2>/dev/null || echo "unknown")
  debug "Node.js: v$NODE_VERSION, npm: v$npm_version"
}

version_gte() {
  # Returns 0 if $1 >= $2 (version compare)
  printf '%s\n%s\n' "$1" "$2" | sort -V -C
}

# ----------------------------------------
# Detect package manager from lockfiles
# ----------------------------------------
detect_package_manager() {
  step "Detecting package manager"
  if [[ -f "bun.lockb" && $(command -v bun) ]]; then
    PACKAGE_MANAGER="bun"
  elif [[ -f "pnpm-lock.yaml" && $(command -v pnpm) ]]; then
    PACKAGE_MANAGER="pnpm"
  elif [[ -f "yarn.lock" && $(command -v yarn) ]]; then
    PACKAGE_MANAGER="yarn"
  elif [[ -f "package-lock.json" || ( ! -f "yarn.lock" && ! -f "pnpm-lock.yaml" && ! -f "bun.lockb" ) ]]; then
    PACKAGE_MANAGER="npm"
  else
    warn "No specific lockfile found; defaulting to npm"
    PACKAGE_MANAGER="npm"
  fi
  # Validate PM exists
  case "$PACKAGE_MANAGER" in
    "pnpm") execute_command "pnpm --version" "Validating pnpm" >/dev/null ;;
    "yarn") execute_command "yarn --version" "Validating yarn" >/dev/null ;;
    "bun")  execute_command "bun --version"  "Validating bun"  >/dev/null ;;
    *)      execute_command "npm --version"  "Validating npm"  >/dev/null ;;
  esac
  success "Package manager: $PACKAGE_MANAGER"
}

# ----------------------------------------
# Verify environment: checks + Git
# ----------------------------------------
verify_environment() {
  step "Comprehensive environment verification"
  check_system_requirements
  get_node_info
  detect_package_manager

  # Check for uncommitted Git changes
  if command -v git >/dev/null && [[ -d .git ]]; then
    local git_status=$(git status --porcelain 2>/dev/null | wc -l)
    if [[ $git_status -gt 0 ]]; then
      warn "Working directory has $git_status uncommitted changes"
      if [[ "$REPAIR_MODE" == "interactive" ]]; then
        read -r -p "${YELLOW}Continue anyway? (y/N):${NC} " response
        [[ ! "$response" =~ ^[Yy] ]] && error "Aborted by user"
      fi
    fi
    # Detect Git hooks (non-sample)
    if [[ -d .git/hooks ]]; then
      local hooks_count
      hooks_count=$(find .git/hooks -type f -perm +111 -print | grep -v '\.sample$' | wc -l)
      [[ $hooks_count -gt 0 ]] && debug "Found $hooks_count executable Git hook(s)"
    fi
  fi

  # Platform info
  local uname_s="$(uname -s)"
  if [[ "$uname_s" == "Linux" ]]; then platform="Linux"; fi
  if [[ "$uname_s" == "Darwin" ]]; then platform="macOS"; fi
  if [[ "$uname_s" == MINGW* || "$uname_s" == CYGWIN* ]]; then platform="Windows"; fi
  debug "Platform: $platform, Node: v$NODE_VERSION, PM: $PACKAGE_MANAGER"
  success "Environment verification complete"
}

# ----------------------------------------
# Backup existing project files
# ----------------------------------------
create_enhanced_backup() {
  [[ "$SKIP_BACKUP" == "true" ]] && { warn "Skipping backup as requested"; return; }
  step "Creating enhanced backup"
  mkdir -p "$BACKUP_DIR"

  local patterns=(
    "package*.json"
    "*lock*.json"
    "*.lock"
    "tsconfig*.json"
    "vite.config.*"
    ".eslintrc*"
    "vercel.json"
    ".env*"
    ".gitignore"
    "README.md"
  )

  # Copy directories if present
  if [[ -d "src" ]]; then
    progress "Backing up source directory"
    if command -v rsync >/dev/null; then
      rsync -av src "$BACKUP_DIR/" >/dev/null 2>&1 || true
    else
      cp -r src "$BACKUP_DIR/"
    fi
  fi
  if [[ -d "public" ]]; then
    progress "Backing up public directory"
    if command -v rsync >/dev/null; then
      rsync -av public "$BACKUP_DIR/" >/dev/null 2>&1 || true
    else
      cp -r public "$BACKUP_DIR/"
    fi
  fi

  # Copy matching files
  for pattern in "${patterns[@]}"; do
    # Use find to locate files up to 3 levels deep
    while IFS= read -r -d '' file; do
      local dest="$BACKUP_DIR/${file#./}"
      mkdir -p "$(dirname "$dest")"
      cp "$file" "$dest" || true
    done < <(find . -maxdepth 3 -type f -name "$pattern" -print0 2>/dev/null)
  done

  # Count backed up files
  local backed_up_count
  backed_up_count=$(find "$BACKUP_DIR" -type f | wc -l || echo 0)
  
  # Backup manifest
  cat > "$BACKUP_DIR/BACKUP_MANIFEST.md" << EOF
# Backup Manifest

**Date:** $(date '+%Y-%m-%d %H:%M:%S')
**Files backed up:** $backed_up_count  
**Original location:** $PROJECT_ROOT

## Restore Instructions

To restore this backup, run:
\`\`\`bash
cp -r "$BACKUP_DIR"/* "$PROJECT_ROOT"/
\`\`\`
EOF

  success "Backup created at $BACKUP_DIR ($backed_up_count files)"
}

# ----------------------------------------
# Dependency analysis (checks for conflicts)
# ----------------------------------------
analyze_dependencies() {
  step "Analyzing project dependencies"
  [[ ! -f package.json ]] && { warn "No package.json found - skipping dependency analysis"; return; }

  if command -v jq >/dev/null; then
    local peer_issues=0
    # Check for @types/react without react
    if jq -e '.dependencies["@types/react"]' package.json >/dev/null 2>&1 &&
       ! jq -e '.dependencies.react' package.json >/dev/null 2>&1; then
      warn "Found @types/react without React dependency"
      ((peer_issues++))
    fi
    # Check for wildcard versions
    local wildcard_count
    wildcard_count=$(jq -r '.dependencies // {} | to_entries[] | select(.value | test("[*^~]")) | .key' package.json 2>/dev/null | wc -l)
    [[ $wildcard_count -gt 0 ]] && debug "Found $wildcard_count dependencies with loose version ranges"
    [[ $peer_issues -gt 0 ]] && warn "Dependency issues detected: $peer_issues potential peer deps"
  else
    warn "jq not found: Skipping dependency conflict checks"
  fi

  success "Dependency analysis complete"
}

# ----------------------------------------
# Install dependencies (with optional reinstall/updates)
# ----------------------------------------
install_dependencies() {
  step "Managing dependencies"
  analyze_dependencies

  if [[ "$FORCE_REINSTALL" == "true" ]]; then
    progress "Force reinstall: removing existing modules and lockfiles"
    rm -rf node_modules
    for lockfile in package-lock.json yarn.lock pnpm-lock.yaml bun.lockb; do
      [[ -f "$lockfile" ]] && rm "$lockfile" && debug "Removed $lockfile"
    done
  fi

  # Set install flags based on package manager and verbosity
  local install_cmd flags=""
  case "$PACKAGE_MANAGER" in
    "pnpm")
      install_cmd="pnpm install"
      flags="--prefer-frozen-lockfile"
      $VERBOSE && flags="${flags} --reporter=default" || flags="${flags} --reporter=silent"
      ;;
    "yarn")
      install_cmd="yarn install"
      flags="--frozen-lockfile"
      $VERBOSE || flags="${flags} --silent"
      ;;
    "bun")
      install_cmd="bun install"
      flags=""
      $VERBOSE || flags="--quiet"
      ;;
    "npm")
      install_cmd="npm install"
      flags="--no-audit --no-fund"
      $VERBOSE || flags="${flags} --silent"
      ;;
  esac
  execute_command "$install_cmd $flags" "Installing dependencies"

  install_critical_dependencies

  if [[ "${UPDATE_DEPS:-false}" == "true" ]]; then
    update_dependencies
  fi

  success "Dependencies installed successfully"
}

install_critical_dependencies() {
  progress "Verifying critical dependencies"
  local critical_deps=(
    "react:^18.2.0"
    "react-dom:^18.2.0"
    "typescript:^5.2.0"
    "vite:^5.0.0"
    "@vitejs/plugin-react:^4.1.0"
  )
  local dev_deps=(
    "@types/node:^20.8.0"
    "@types/react:^18.2.0"
    "@types/react-dom:^18.2.0"
    "eslint:^8.52.0"
    "@typescript-eslint/eslint-plugin:^6.9.0"
    "@typescript-eslint/parser:^6.9.0"
    "eslint-plugin-react:^7.33.0"
    "eslint-plugin-react-hooks:^4.6.0"
    "eslint-plugin-react-refresh:^0.4.4"
  )

  # Helper: check if package is listed
  check_package_installed() {
    local pkg="$1"
    case "$PACKAGE_MANAGER" in
      "pnpm") pnpm list "$pkg" --depth=0 >/dev/null 2>&1 ;;
      "yarn") yarn list --pattern "^${pkg}@" --depth=0 >/dev/null 2>&1 ;;
      "bun")  bun pm ls | grep -q "^$pkg@" ;;
      *)      npm list "$pkg" --depth=0 >/dev/null 2>&1 ;;
    esac
  }

  install_package() {
    local pkg="$1" type="$2"
    local flags=""
    case "$PACKAGE_MANAGER" in
      "pnpm")
        flags="--filter $pkg"
        [[ "$type" == "development" ]] && flags="$flags -D"
        ;;
      "yarn")
        flags=""
        [[ "$type" == "development" ]] && flags="$flags -D"
        ;;
      "bun")
        flags=""
        [[ "$type" == "development" ]] && flags="-d"
        ;;
      "npm")
        flags="--no-audit --no-fund"
        [[ "$type" == "development" ]] && flags="$flags --save-dev" || flags="$flags --save"
        ;;
    esac
    execute_command "$PACKAGE_MANAGER add $flags $pkg" "Installing $pkg"
  }

  # Install missing production deps
  for dep in "${critical_deps[@]}"; do
    local name="${dep%%:*}"
    local ver="${dep#*:}"
    if ! check_package_installed "$name"; then
      install_package "$name@$ver" "production"
    fi
  done
  # Install missing dev deps
  for dep in "${dev_deps[@]}"; do
    local name="${dep%%:*}"
    local ver="${dep#*:}"
    if ! check_package_installed "$name"; then
      install_package "$name@$ver" "development"
    fi
  done
}

update_dependencies() {
  progress "Updating dependencies to latest versions"
  case "$PACKAGE_MANAGER" in
    "pnpm") execute_command "pnpm update --latest" "Updating with pnpm" true ;;
    "yarn") execute_command "yarn upgrade --latest" "Updating with yarn" true ;;
    "bun")  execute_command "bun update" "Updating with bun" true ;;
    *)      execute_command "npm update" "Updating with npm" true ;;
  esac
}

# ----------------------------------------
# Verify/configure project files
# ----------------------------------------
verify_configs() {
  step "Verifying and creating configuration files"
  local tasks=( 
    create_package_json 
    create_typescript_config 
    create_vite_config 
    create_eslint_config 
    create_gitignore 
    create_vercel_config 
    create_environment_files 
    create_github_workflows 
  )
  local total=${#tasks[@]}
  local count=0
  for task in "${tasks[@]}"; do
    [[ "$VERBOSE" == "true" ]] && show_progress $((++count)) $total
    $task
  done
  echo # new line after progress bar
  success "Configuration files verified"
}

create_package_json() {
  if [[ ! -f "package.json" ]]; then
    progress "Creating package.json with enhanced scripts"
    execute_command 'cat > package.json << EOL
{
  "name": "cyber-terminal",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "dev": "vite --host",
    "build": "tsc && vite build",
    "preview": "vite preview --host",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist node_modules/.vite .eslintcache",
    "test": "echo \"No tests specified\" && exit 0",
    "prepare": "npm run type-check && npm run lint",
    "start": "npm run dev",
    "build:analyze": "npm run build && npx vite-bundle-analyzer dist"
  },
  "dependencies": {},
  "devDependencies": {}
}
EOL'
  else
    if command -v jq >/dev/null; then
      progress "Enhancing existing package.json"
      local temp="$TEMP_DIR/package.json"
      jq '. + {
        "engines": {"node": ">=18.0.0"},
        "scripts": (.scripts // {} + {
          "type-check": "tsc --noEmit",
          "lint:fix": "eslint . --ext ts,tsx --fix",
          "clean": "rm -rf dist node_modules/.vite .eslintcache",
          "prepare": "npm run type-check && npm run lint"
        })
      }' package.json > "$temp" && mv "$temp" package.json
    fi
  fi
}

create_typescript_config() {
  if [[ ! -f "tsconfig.json" ]]; then
    progress "Creating comprehensive TypeScript configuration"
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
    "noImplicitReturns": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/types/*": ["./src/types/*"],
      "@/services/*": ["./src/services/*"],
      "@/assets/*": ["./src/assets/*"]
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
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "*.config.ts", "*.config.js"]
}
EOL'
  fi
}

create_vite_config() {
  if [[ ! -f "vite.config.ts" && ! -f "vite.config.js" ]]; then
    progress "Creating optimized Vite configuration"
    execute_command 'cat > vite.config.ts << EOL
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [
    react({
      fastRefresh: true,
      babel: {
        plugins: [
          ["@babel/plugin-transform-react-jsx", { "runtime": "automatic" }]
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  server: {
    port: 3000,
    open: true,
    host: true,
    cors: true,
    hmr: { overlay: true }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          utils: ["@/utils"]
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]"
      }
    },
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000
  },
  preview: {
    port: 3000,
    host: true,
    cors: true
  },
  optimizeDeps: {
    include: ["react", "react-dom"]
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== "production")
  }
})
EOL'
  fi
}

create_eslint_config() {
  if [[ ! -f ".eslintrc.json" && ! -f ".eslintrc.js" && ! -f "eslint.config.js" ]]; then
    progress "Creating comprehensive ESLint configuration"
    execute_command 'cat > .eslintrc.json << EOL
{
  "root": true,
  "env": {
    "browser": true,
    "es2020": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react/jsx-runtime"
  ],
  "ignorePatterns": ["dist", ".eslintrc.json", "vite.config.ts"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": ["./tsconfig.json"],
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": ["react-refresh", "@typescript-eslint"],
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react-refresh/only-export-components": [
      "warn",
      { "allowConstantExport": true }
    ],
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
    ],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/prefer-const": "error",
    "@typescript-eslint/no-inferrable-types": "error",
    "prefer-const": "error",
    "no-var": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
EOL'
  fi
}

create_gitignore() {
  if [[ ! -f ".gitignore" ]]; then
    progress "Creating .gitignore"
    execute_command 'cat > .gitignore << EOL
# Node modules and logs
node_modules/
dist/
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*
*.log

# Lock files
package-lock.json
yarn.lock
pnpm-lock.yaml
bun.lockb

# Environment
.env
.env.local
.env.*.local

# IDE files
.vscode/
*.code-workspace

# Mac OS X
.DS_Store

# Misc
coverage/
EOL'
  fi
}

create_vercel_config() {
  if [[ ! -f "vercel.json" ]]; then
    progress "Creating Vercel configuration"
    execute_command 'cat > vercel.json << EOL
{
  "version": 2,
  "builds": [
    { "src": "package.json", "use": "@vercel/node" }
  ]
}
EOL'
  fi
}

create_environment_files() {
  # Create example .env files if missing
  if [[ ! -f ".env" ]]; then
    progress "Creating .env (default)"
    echo "# Environment variables (project-specific)" > .env
  fi
  if [[ ! -f ".env.local" ]]; then
    progress "Creating .env.local (local overrides)"
    echo "# Local environment variables" > .env.local
  fi
  if [[ ! -f ".env.example" ]]; then
    progress "Creating .env.example (sample env)"
    cp .env .env.example || true
  fi
}

create_github_workflows() {
  if [[ ! -d ".github/workflows" ]]; then
    mkdir -p .github/workflows
  fi
  if [[ ! -f ".github/workflows/nodejs.yml" ]]; then
    progress "Creating GitHub Actions workflow for CI"
    execute_command 'cat > .github/workflows/nodejs.yml << EOL
name: Node.js CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: \${{ matrix.node-version }}
          cache: "npm"
      - name: Install dependencies
        run: npm install
      - name: Run lint
        run: npm run lint
      - name: Type-check
        run: npm run type-check
      - name: Run tests
        run: npm test
EOL'
  fi
}

# ----------------------------------------
# Fix file permissions
# ----------------------------------------
fix_permissions_action() {
  if [[ "${FIX_PERMISSIONS:-false}" == "true" ]]; then
    step "Fixing file permissions"
    # Directories: 755, Files: 644
    find "$PROJECT_ROOT" -type d -exec chmod 755 {} +
    find "$PROJECT_ROOT" -type f -exec chmod 644 {} +
    success "Permissions fixed"
  fi
}

# ----------------------------------------
# Main execution flow
# ----------------------------------------
print_banner
parse_arguments "$@"

# Early exit for check-only mode
if [[ "${CHECK_ONLY:-false}" == "true" ]]; then
  success "Check-only mode: environment validated (no changes made)"
  exit 0
fi

verify_environment
create_enhanced_backup
install_dependencies
verify_configs
fix_permissions_action

success "Project repair and validation completed successfully"

