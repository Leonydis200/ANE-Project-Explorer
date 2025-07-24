#!/bin/bash
set -euo pipefail

# ========================================
# Enhanced Project Repair & Validation Script v3.0
# ========================================

# Color codes and styling
readonly NC='\033[0m'
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
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

# Global variables
PACKAGE_MANAGER=""
NODE_VERSION=""
REPAIR_MODE="auto"
SKIP_BACKUP=false
FORCE_REINSTALL=false
VERBOSE=false
PARALLEL_JOBS=4

# Trap to cleanup on exit
trap cleanup EXIT

cleanup() {
  [[ -d "$TEMP_DIR" ]] && rm -rf "$TEMP_DIR"
}

# ========================================
# Enhanced Logging System with Structured Output
# ========================================
log()     { echo -e "${BLUE}[$(date '+%H:%M:%S')] [INFO]${NC} $1" | tee -a "$LOG_FILE"; }
success() { echo -e "${GREEN}[$(date '+%H:%M:%S')] [✓]${NC} $1" | tee -a "$LOG_FILE"; }
warn()    { echo -e "${YELLOW}[$(date '+%H:%M:%S')] [⚠]${NC} $1" | tee -a "$LOG_FILE"; }
error()   { echo -e "${RED}[$(date '+%H:%M:%S')] [✗]${NC} $1" | tee -a "$LOG_FILE"; exit 1; }
debug()   { [[ "${DEBUG:-}" == "true" ]] && echo -e "${PURPLE}[$(date '+%H:%M:%S')] [DEBUG]${NC} $1" | tee -a "$LOG_FILE"; }
step()    { echo -e "\n${CYAN}${BOLD}[$(date '+%H:%M:%S')] ▶ $1${NC}" | tee -a "$LOG_FILE"; }
progress() { echo -e "${DIM}  └─ $1${NC}"; }

# Progress bar function
show_progress() {
  local current=$1
  local total=$2
  local width=50
  local percentage=$((current * 100 / total))
  local completed=$((current * width / total))
  
  printf "\r${CYAN}Progress: ["
  printf "%*s" $completed | tr ' ' '='
  printf "%*s" $((width - completed)) | tr ' ' '-'
  printf "] %d%% (%d/%d)${NC}" $percentage $current $total
}

# ========================================
# Enhanced Utility Functions
# ========================================
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
  -q, --quiet          Suppress non-essential output
  --dry-run           Show what would be done without executing
  --check-only        Only validate, don't modify anything
  --fix-permissions   Fix file permissions after repair
  --update-deps       Update dependencies to latest versions

${BOLD}Repair Modes:${NC}
  auto        - Full automated repair (recommended)
  interactive - Prompt for each step
  minimal     - Essential fixes only
  strict      - Strict validation with enhanced checks

${BOLD}Examples:${NC}
  $0                          # Run with default settings
  $0 -m interactive -v        # Interactive mode with verbose output
  $0 -f -d --update-deps      # Force reinstall with dependency updates
  $0 --check-only -q          # Quick validation check
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
        export DEBUG=true
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
        export QUIET=true
        shift
        ;;
      --dry-run)
        export DRY_RUN=true
        shift
        ;;
      --check-only)
        export CHECK_ONLY=true
        shift
        ;;
      --fix-permissions)
        export FIX_PERMISSIONS=true
        shift
        ;;
      --update-deps)
        export UPDATE_DEPS=true
        shift
        ;;
      *)
        error "Unknown option: $1. Use -h for help."
        ;;
    esac
  done
}

execute_command() {
  local cmd="$1"
  local description="${2:-}"
  local allow_failure="${3:-false}"
  
  if [[ "${CHECK_ONLY:-}" == "true" ]]; then
    debug "[CHECK ONLY] Would execute: $cmd"
    return 0
  fi
  
  if [[ "${DRY_RUN:-}" == "true" ]]; then
    log "[DRY RUN] Would execute: $cmd"
    return 0
  fi
  
  [[ -n "$description" ]] && progress "$description"
  
  if [[ "$VERBOSE" == "true" ]]; then
    debug "Executing: $cmd"
  fi
  
  if eval "$cmd" 2>&1 | tee -a "$LOG_FILE" >/dev/null; then
    return 0
  else
    local exit_code=$?
    if [[ "$allow_failure" == "true" ]]; then
      warn "Command failed but continuing: $cmd"
      return $exit_code
    else
      error "Command failed: $cmd (exit code: $exit_code)"
    fi
  fi
}

# System validation functions
check_system_requirements() {
  step "Validating system requirements"
  
  # Check available disk space
  local available_mb
  available_mb=$(df . | awk 'NR==2 {print int($4/1024)}')
  if [[ $available_mb -lt $MIN_DISK_SPACE_MB ]]; then
    warn "Low disk space: ${available_mb}MB available (recommended: ${MIN_DISK_SPACE_MB}MB+)"
  fi
  
  # Check memory
  if command -v free >/dev/null; then
    local available_ram_mb
    available_ram_mb=$(free -m | awk 'NR==2{print $7}')
    [[ $available_ram_mb -lt 1000 ]] && warn "Low available RAM: ${available_ram_mb}MB"
  fi
  
  # Check for required tools
  local required_tools=("curl" "git")
  for tool in "${required_tools[@]}"; do
    if ! command -v "$tool" >/dev/null; then
      warn "$tool not found (recommended for full functionality)"
    fi
  done
  
  success "System requirements validated"
}

create_enhanced_backup() {
  [[ "$SKIP_BACKUP" == "true" ]] && return 0
  
  step "Creating enhanced backup"
  mkdir -p "$BACKUP_DIR"
  
  # Comprehensive backup list
  local backup_patterns=(
    "package*.json"
    "*lock*.json"
    "*.lock"
    "tsconfig*.json"
    "vite.config.*"
    ".eslintrc*"
    "vercel.json"
    ".env*"
    "src/**"
    "public/**"
    ".gitignore"
    "README.md"
  )
  
  local backed_up=0
  for pattern in "${backup_patterns[@]}"; do
    if find . -maxdepth 3 -name "$pattern" -type f 2>/dev/null | head -1 | read -r; then
      # Use rsync for better backup handling
      if command -v rsync >/dev/null; then
        rsync -av --include="$pattern" --exclude="*" . "$BACKUP_DIR/" >/dev/null 2>&1 || true
      else
        find . -maxdepth 3 -name "$pattern" -type f -exec cp --parents {} "$BACKUP_DIR/" \; 2>/dev/null || true
      fi
      ((backed_up++))
    fi
  done
  
  # Create backup manifest
  cat > "$BACKUP_DIR/BACKUP_MANIFEST.md" << EOF
# Backup Manifest

Created: $(date)
Files backed up: $backed_up
Original location: $PROJECT_ROOT

## Restore Instructions

To restore this backup:
\`\`\`bash
cp -r $BACKUP_DIR/* $PROJECT_ROOT/
\`\`\`

EOF
  
  success "Backup created: $BACKUP_DIR ($backed_up files)"
}

get_node_info() {
  if ! command -v node >/dev/null; then
    error "Node.js is not installed. Install Node.js v$MIN_NODE_VERSION+ first."
  fi
  
  NODE_VERSION=$(node --version 2>/dev/null | sed 's/v//' || echo "")
  
  # Enhanced version comparison
  if ! version_gte "$NODE_VERSION" "$MIN_NODE_VERSION"; then
    error "Node.js v$NODE_VERSION detected. Required: v$MIN_NODE_VERSION+"
  fi
  
  # Get additional Node.js info
  local npm_version
  npm_version=$(npm --version 2>/dev/null || echo "unknown")
  debug "Node.js: v$NODE_VERSION, npm: v$npm_version"
}

version_gte() {
  printf '%s\n%s\n' "$2" "$1" | sort -V -C
}

# ========================================
# Enhanced Package Manager Detection
# ========================================
detect_package_manager() {
  step "Detecting package manager"
  
  # Priority-based detection
  if [[ -f "bun.lockb" ]] && command -v bun >/dev/null; then
    PACKAGE_MANAGER="bun"
  elif [[ -f "pnpm-lock.yaml" ]] && command -v pnpm >/dev/null; then
    PACKAGE_MANAGER="pnpm"
  elif [[ -f "yarn.lock" ]] && command -v yarn >/dev/null; then
    PACKAGE_MANAGER="yarn"
  elif [[ -f "package-lock.json" ]] || [[ ! -f "yarn.lock" && ! -f "pnpm-lock.yaml" && ! -f "bun.lockb" ]]; then
    PACKAGE_MANAGER="npm"
  else
    warn "No package manager detected, defaulting to npm"
    PACKAGE_MANAGER="npm"
  fi
  
  # Validate package manager works
  case "$PACKAGE_MANAGER" in
    "pnpm") execute_command "pnpm --version" "Validating pnpm" >/dev/null ;;
    "yarn") execute_command "yarn --version" "Validating yarn" >/dev/null ;;
    "bun") execute_command "bun --version" "Validating bun" >/dev/null ;;
    *) execute_command "npm --version" "Validating npm" >/dev/null ;;
  esac
  
  success "Package manager: $PACKAGE_MANAGER"
}

# ========================================
# Enhanced Environment Verification
# ========================================
verify_environment() {
  step "Comprehensive environment verification"

  check_system_requirements
  get_node_info
  detect_package_manager
  
  # Check Git repository status
  if command -v git >/dev/null && [[ -d ".git" ]]; then
    local git_status
    git_status=$(git status --porcelain 2>/dev/null | wc -l)
    if [[ $git_status -gt 0 ]]; then
      warn "Working directory has $git_status uncommitted changes"
      if [[ "${REPAIR_MODE}" == "interactive" ]]; then
        echo -e "${YELLOW}Continue anyway? (y/N):${NC} "
        read -r response
        [[ ! "$response" =~ ^[Yy] ]] && error "Aborted by user"
      fi
    fi
    
    # Check for Git hooks
    if [[ -d ".git/hooks" ]]; then
      local hooks_count
      hooks_count=$(find .git/hooks -name "*.sample" -prune -o -type f -executable -print | wc -l)
      [[ $hooks_count -gt 0 ]] && debug "Found $hooks_count Git hooks"
    fi
  fi

  # Enhanced platform detection
  local platform
  case "$(uname -s)" in
    Linux*) platform="Linux" ;;
    Darwin*) platform="macOS" ;;
    MINGW*|CYGWIN*) platform="Windows" ;;
    *) platform="Unknown" ;;
  esac
  
  debug "Platform: $platform, Node: v$NODE_VERSION, PM: $PACKAGE_MANAGER"
  success "Environment verification complete"
}

# ========================================
# Advanced Dependency Management
# ========================================
analyze_dependencies() {
  step "Analyzing project dependencies"
  
  if [[ ! -f "package.json" ]]; then
    warn "No package.json found - will create one"
    return 0
  fi
  
  # Check for dependency conflicts
  if command -v jq >/dev/null; then
    local peer_deps_issues=0
    
    # Check for common peer dependency issues
    if jq -e '.dependencies."@types/react"' package.json >/dev/null 2>&1; then
      if ! jq -e '.dependencies.react' package.json >/dev/null 2>&1; then
        warn "Found @types/react without React dependency"
        ((peer_deps_issues++))
      fi
    fi
    
    # Check version ranges
    local deps_with_wildcards
    deps_with_wildcards=$(jq -r '.dependencies // {} | to_entries[] | select(.value | test("[*^~]")) | .key' package.json 2>/dev/null | wc -l)
    [[ $deps_with_wildcards -gt 0 ]] && debug "Found $deps_with_wildcards dependencies with version ranges"
    
    [[ $peer_deps_issues -gt 0 ]] && warn "Found $peer_deps_issues potential dependency issues"
  fi
  
  success "Dependency analysis complete"
}

install_dependencies() {
  step "Managing dependencies"
  analyze_dependencies

  if [[ "$FORCE_REINSTALL" == "true" ]]; then
    progress "Force reinstall requested - cleaning existing installations"
    execute_command "rm -rf node_modules" "Removing node_modules"
    
    # Remove all lockfiles for clean slate
    for lockfile in package-lock.json yarn.lock pnpm-lock.yaml bun.lockb; do
      [[ -f "$lockfile" ]] && rm "$lockfile" && debug "Removed $lockfile"
    done
  fi

  # Set package manager specific flags for better performance
  local install_flags=""
  case "$PACKAGE_MANAGER" in
    "pnpm")
      install_flags="--prefer-frozen-lockfile --reporter=silent"
      [[ "$VERBOSE" == "true" ]] && install_flags="--prefer-frozen-lockfile"
      ;;
    "yarn")
      install_flags="--frozen-lockfile --silent"
      [[ "$VERBOSE" == "true" ]] && install_flags="--frozen-lockfile"
      ;;
    "bun")
      install_flags="--silent"
      [[ "$VERBOSE" == "true" ]] && install_flags=""
      ;;
    "npm")
      install_flags="--no-audit --no-fund --silent"
      [[ "$VERBOSE" == "true" ]] && install_flags="--no-audit --no-fund"
      ;;
  esac

  execute_command "$PACKAGE_MANAGER install $install_flags" "Installing dependencies"

  # Install critical dependencies if missing
  install_critical_dependencies
  
  # Update dependencies if requested
  if [[ "${UPDATE_DEPS:-}" == "true" ]]; then
    update_dependencies
  fi

  success "Dependencies installed successfully"
}

install_critical_dependencies() {
  progress "Verifying critical dependencies"
  
  # Define critical dependencies with versions
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

  # Check and install missing production dependencies
  for dep_spec in "${critical_deps[@]}"; do
    local pkg_name="${dep_spec%%:*}"
    local version="${dep_spec#*:}"
    
    if ! check_package_installed "$pkg_name"; then
      progress "Installing missing dependency: $pkg_name"
      install_package "$pkg_name@$version" "production"
    fi
  done

  # Check and install missing dev dependencies
  for dep_spec in "${dev_deps[@]}"; do
    local pkg_name="${dep_spec%%:*}"
    local version="${dep_spec#*:}"
    
    if ! check_package_installed "$pkg_name"; then
      progress "Installing missing dev dependency: $pkg_name"
      install_package "$pkg_name@$version" "development"
    fi
  done
}

check_package_installed() {
  local package="$1"
  case "$PACKAGE_MANAGER" in
    "pnpm") pnpm list "$package" --depth=0 >/dev/null 2>&1 ;;
    "yarn") yarn list --pattern "$package" --depth=0 >/dev/null 2>&1 ;;
    "bun") bun pm ls | grep -q "^$package@" ;;
    *) npm list "$package" --depth=0 >/dev/null 2>&1 ;;
  esac
}

install_package() {
  local package="$1"
  local type="${2:-production}"
  
  local flags=""
  case "$PACKAGE_MANAGER" in
    "pnpm")
      flags="--silent"
      [[ "$type" == "development" ]] && flags="$flags -D"
      ;;
    "yarn")
      flags="--silent"
      [[ "$type" == "development" ]] && flags="$flags -D"
      ;;
    "bun")
      flags=""
      [[ "$type" == "development" ]] && flags="-d"
      ;;
    "npm")
      flags="--no-audit --no-fund --silent"
      [[ "$type" == "development" ]] && flags="$flags --save-dev" || flags="$flags --save"
      ;;
  esac

  execute_command "$PACKAGE_MANAGER add $flags $package" "Installing $package"
}

update_dependencies() {
  progress "Updating dependencies to latest versions"
  
  case "$PACKAGE_MANAGER" in
    "pnpm") execute_command "pnpm update --latest" "Updating with pnpm" true ;;
    "yarn") execute_command "yarn upgrade --latest" "Updating with yarn" true ;;
    "bun") execute_command "bun update" "Updating with bun" true ;;
    *) execute_command "npm update" "Updating with npm" true ;;
  esac
}

# ========================================
# Enhanced Configuration Management
# ========================================
verify_configs() {
  step "Verifying and creating configuration files"

  local config_tasks=(
    "create_package_json"
    "create_typescript_config"
    "create_vite_config"
    "create_eslint_config"
    "create_vercel_config"
    "create_environment_files"
    "create_gitignore"
    "create_github_workflows"
  )

  local completed=0
  local total=${#config_tasks[@]}

  for task in "${config_tasks[@]}"; do
    [[ "$VERBOSE" == "true" ]] && show_progress $((++completed)) $total
    $task
  done

  echo # New line after progress bar
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
    # Enhance existing package.json
    if command -v jq >/dev/null; then
      progress "Enhancing existing package.json"
      local temp_file="$TEMP_DIR/package.json"
      jq '. + {
        "engines": {"node": ">=18.0.0"},
        "scripts": (.scripts // {} | . + {
          "type-check": "tsc --noEmit",
          "lint:fix": "eslint . --ext ts,tsx --fix",
          "clean": "rm -rf dist node_modules/.vite .eslintcache",
          "prepare": "npm run type-check && npm run lint"
        })
      }' package.json > "$temp_file" && mv "$temp_file" package.json
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
          ["@babel/plugin-transform-react-jsx", { runtime: "automatic" }]
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
    host: true,
    cors: true,
    hmr: {
      overlay: true
    }
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
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-debugger": "error",
    "no-duplicate-imports": "error",
    "no-unused-expressions": "error",
    "eqeqeq": ["error", "always"],
    "curly": ["error", "all"]
  }
}
EOL'
  fi
}

create_vercel_config() {
  if [[ ! -f "vercel.json" ]]; then
    progress "Creating optimized Vercel configuration"
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
      "src": "/assets/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/service-worker.js",
      "headers": [
        {
          "key": "cache-control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ],
  "env": {
    "NODE_VERSION": "18.x"
  },
  "installCommand": "INSTALL_COMMAND_PLACEHOLDER",
  "buildCommand": "BUILD_COMMAND_PLACEHOLDER",
  "outputDirectory": "dist"
}
EOL'
    
    # Update commands based on detected package manager
    update_vercel_commands
  fi
}

update_vercel_commands() {
  if [[ -f "vercel.json" ]] && command -v jq >/dev/null; then
    local install_cmd build_cmd
    
    case "$PACKAGE_MANAGER" in
      "pnpm")
        install_cmd="pnpm install --frozen-lockfile"
        build_cmd="pnpm run build"
        ;;
      "yarn")
        install_cmd="yarn install --frozen-lockfile"
        build_cmd="yarn build"
        ;;
      "bun")
        install_cmd="bun install --frozen-lockfile"
        build_cmd="bun run build"
        ;;
      *)
        install_cmd="npm ci"
        build_cmd="npm run build"
        ;;
    esac

    local temp_file="$TEMP_DIR/vercel.json"
    jq --arg install "$install_cmd" --arg build "$build_cmd" '
      .installCommand = $install |
      .buildCommand = $build
    ' vercel.json > "$temp_file" && mv "$temp_file" vercel.json
  else
    # Fallback for systems without jq
    sed -i.bak "s/INSTALL_COMMAND_PLACEHOLDER/$PACKAGE_MANAGER install/" vercel.json 2>/dev/null || true
    sed -i.bak "s/BUILD_COMMAND_PLACEHOLDER/$PACKAGE_MANAGER run build/" vercel.json 2>/dev/null || true
    [[ -f "vercel.json.bak" ]] && rm "vercel.json.bak"
  fi
}

create_environment_files() {
  if [[ ! -f ".env" && ! -f ".env.local" && ! -f ".env.example" ]]; then
    progress "Creating comprehensive environment configuration"
    execute_command 'cat > .env.example << EOL
# ===========================================
# Application Configuration
# ===========================================
VITE_APP_NAME=CyberTerminal
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
VITE_APP_TITLE="Cyber Terminal - Advanced Interface"

# ===========================================
# API Configuration
# ===========================================
VITE_API_URL=https://api.example.com
VITE_API_TIMEOUT=10000
VITE_API_RETRY_ATTEMPTS=3
VITE_API_RETRY_DELAY=1000

# ===========================================
# Feature Flags
# ===========================================
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PWA=false
VITE_ENABLE_EXPERIMENTAL_FEATURES=false

# ===========================================
# External Services
# ===========================================
VITE_SENTRY_DSN=
VITE_GOOGLE_ANALYTICS_ID=
VITE_POSTHOG_KEY=
VITE_MIXPANEL_TOKEN=

# ===========================================
# Database (Backend only - not exposed to client)
# ===========================================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cyberterminal
DB_USER=user
DB_PASS=password
DB_SSL=false

# ===========================================
# Security & Auth
# ===========================================
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=24h
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000

# ===========================================
# Performance & Monitoring
# ===========================================
VITE_PERFORMANCE_MONITORING=false
VITE_ERROR_REPORTING=false
LOG_LEVEL=info

# ===========================================
# Development Tools
# ===========================================
VITE_MOCK_API=false
VITE_DEV_TOOLS=true
EOL'

    # Create .env.development for local development
    execute_command 'cat > .env.development << EOL
# Development Environment
VITE_APP_ENV=development
VITE_ENABLE_DEBUG=true
VITE_DEV_TOOLS=true
VITE_MOCK_API=true
LOG_LEVEL=debug
EOL'
  fi
}

create_gitignore() {
  if [[ ! -f ".gitignore" ]]; then
    progress "Creating comprehensive .gitignore"
    execute_command 'cat > .gitignore << EOL
# ===========================================
# Dependencies
# ===========================================
node_modules/
.pnp
.pnp.js
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz

# ===========================================
# Production builds
# ===========================================
dist/
build/
out/
.next/
.nuxt/
.vuepress/dist

# ===========================================
# Environment variables
# ===========================================
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.*.local

# ===========================================
# Logs
# ===========================================
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# ===========================================
# Runtime data
# ===========================================
pids
*.pid
*.seed
*.pid.lock

# ===========================================
# Coverage and testing
# ===========================================
coverage/
*.lcov
.nyc_output
test-results/
playwright-report/

# ===========================================
# Editor directories and files
# ===========================================
.vscode/
.idea/
*.swp
*.swo
*~
.history/
.ionide/

# ===========================================
# OS generated files
# ===========================================
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
desktop.ini

# ===========================================
# Temporary files
# ===========================================
*.tmp
*.temp
.temp/
tmp/

# ===========================================
# Cache directories
# ===========================================
.cache/
.vite/
.eslintcache
.parcel-cache/
.next/cache/
.nuxt/cache/

# ===========================================
# Package manager files
# ===========================================
.pnpm-store/
.pnpm-debug.log*

# ===========================================
# Backup files
# ===========================================
*.backup
*.bak
.repair-backup-*/

# ===========================================
# Logs and reports
# ===========================================
*.log
repair.log
repair-summary.md
.vercel

# ===========================================
# TypeScript
# ===========================================
*.tsbuildinfo

# ===========================================
# Storybook
# ===========================================
.storybook-out
storybook-static/

# ===========================================
# Capacitor
# ===========================================
.capacitor/
android/
ios/

# ===========================================
# Tauri
# ===========================================
src-tauri/target/
EOL'
  fi
}

create_github_workflows() {
  if [[ -d ".git" ]] && [[ ! -d ".github/workflows" ]]; then
    progress "Creating GitHub Actions workflows"
    mkdir -p .github/workflows
    
    execute_command 'cat > .github/workflows/ci.yml << EOL
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: npm
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run linting
      run: npm run lint
    
    - name: Build project
      run: npm run build
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: dist-${{ matrix.node-version }}
        path: dist/

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == refs/heads/main
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: --prod
EOL'
  fi
}

# ========================================
# Enhanced Source Structure Management
# ========================================
verify_source_structure() {
  step "Creating comprehensive source structure"

  local required_dirs=(
    "src"
    "src/components"
    "src/components/ui"
    "src/hooks"
    "src/utils"
    "src/types"
    "src/services"
    "src/assets"
    "src/assets/icons"
    "src/assets/images"
    "src/styles"
    "src/contexts"
    "src/store"
    "public"
    "docs"
  )

  progress "Creating directory structure"
  for dir in "${required_dirs[@]}"; do
    if [[ ! -d "$dir" ]]; then
      execute_command "mkdir -p $dir" "Creating $dir"
    fi
  done

  create_main_files
  create_component_files
  create_utility_files
  create_public_files
  create_documentation

  success "Source structure created successfully"
}

create_main_files() {
  progress "Creating main application files"
  
  # Enhanced index.html
  if [[ ! -f "index.html" ]]; then
    execute_command 'cat > index.html << EOL
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Cyber Terminal - Advanced Terminal Interface with Modern UI" />
    <meta name="keywords" content="terminal, console, developer tools, cyber, tech" />
    <meta name="author" content="Cyber Terminal Team" />
    <meta name="theme-color" content="#00ff88" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://cyber-terminal.vercel.app/" />
    <meta property="og:title" content="Cyber Terminal" />
    <meta property="og:description" content="Advanced Terminal Interface with Modern UI" />
    <meta property="og:image" content="/og-image.png" />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://cyber-terminal.vercel.app/" />
    <meta property="twitter:title" content="Cyber Terminal" />
    <meta property="twitter:description" content="Advanced Terminal Interface with Modern UI" />
    <meta property="twitter:image" content="/og-image.png" />
    
    <title>Cyber Terminal</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOL'
  fi

  # Enhanced main.tsx with error boundary
  if [[ ! -f "src/main.tsx" ]]; then
    execute_command 'cat > src/main.tsx << EOL
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import ErrorBoundary from "./components/ErrorBoundary"
import "./styles/index.css"

const root = document.getElementById("root")
if (!root) {
  throw new Error("Root element not found. Please check your index.html file.")
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
EOL'
  fi

  # Enhanced App.tsx with routing and context
  if [[ ! -f "src/App.tsx" ]]; then
    execute_command 'cat > src/App.tsx << EOL
import React, { Suspense } from "react"
import { TerminalProvider } from "./contexts/TerminalContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import Terminal from "./components/Terminal"
import Header from "./components/Header"
import LoadingSpinner from "./components/ui/LoadingSpinner"
import "./styles/App.css"

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <TerminalProvider>
        <div className="app">
          <Header />
          <main className="app-main">
            <Suspense fallback={<LoadingSpinner />}>
              <Terminal />
            </Suspense>
          </main>
        </div>
      </TerminalProvider>
    </ThemeProvider>
  )
}

export default App
EOL'
  fi

  # Create enhanced CSS files
  create_css_files
}

create_css_files() {
  # Modern CSS with CSS custom properties and advanced features
  if [[ ! -f "src/styles/index.css" ]]; then
    execute_command 'cat > src/styles/index.css << EOL
/* ===========================================
   CSS Reset and Base Styles
   ========================================== */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  /* Color Palette */
  --color-primary: #00ff88;
  --color-secondary: #64ffda;
  --color-accent: #ff6b35;
  --color-warning: #ffd700;
  --color-error: #ff4757;
  --color-success: #2ed573;

  /* Background Colors */
  --bg-primary: #0a0e27;
  --bg-secondary: #1a1f3a;
  --bg-tertiary: #252b4d;
  --bg-glass: rgba(26, 31, 58, 0.8);
  
  /* Text Colors */
  --text-primary: #ffffff;
  --text-secondary: #b4b8cd;
  --text-muted: #6b7280;
  --text-accent: var(--color-primary);
  
  /* Border and Shadow */
  --border-color: #2d3748;
  --border-radius: 8px;
  --border-radius-lg: 12px;
  --box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --box-shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  /* Typography */
  --font-family-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-family-mono: "JetBrains Mono", "Fira Code", Consolas, "Courier New", monospace;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  
  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  
  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 300ms ease-in-out;
  --transition-slow: 500ms ease-in-out;
  
  /* Z-index Scale */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal: 1040;
  --z-popover: 1050;
  --z-tooltip: 1060;
}

/* Dark theme variables (default) */
[data-theme="dark"] {
  --bg-primary: #0a0e27;
  --bg-secondary: #1a1f3a;
  --text-primary: #ffffff;
}

/* Light theme variables */
[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #1a202c;
  --border-color: #e2e8f0;
}

html {
  font-family: var(--font-family-sans);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-family-mono);
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  color: var(--text-primary);
  line-height: 1.6;
  overflow-x: hidden;
  min-height: 100vh;
}

#root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-secondary);
}

/* Focus and Accessibility */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Print styles */
@media print {
  * {
    background: transparent !important;
    color: black !important;
    box-shadow: none !important;
  }
}
EOL'
  fi

  # Enhanced App.css with modern layout
  if [[ ! -f "src/styles/App.css" ]]; then
    execute_command 'cat > src/styles/App.css << EOL
/* ===========================================
   Application Layout
   ========================================== */
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(
    135deg,
    var(--bg-primary) 0%,
    var(--bg-secondary) 50%,
    var(--bg-tertiary) 100%
  );
  position: relative;
}

.app::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at 20% 80%,
    rgba(0, 255, 136, 0.1) 0%,
    transparent 50%
  ),
  radial-gradient(
    circle at 80% 20%,
    rgba(255, 107, 53, 0.1) 0%,
    transparent 50%
  );
  pointer-events: none;
  z-index: -1;
}

.app-header {
  background: var(--bg-glass);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  padding: var(--space-4) var(--space-6);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-6);
  gap: var(--space-6);
}

/* ===========================================
   Terminal Container
   ========================================== */
.terminal-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background: var(--bg-glass);
  backdrop-filter: blur(15px);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--box-shadow-lg);
  transition: all var(--transition-base);
}

.terminal-container:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 255, 136, 0.1);
  border-color: var(--color-primary);
}

.terminal-header {
  background: var(--bg-secondary);
  padding: var(--space-3) var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

.terminal-title {
  color: var(--color-secondary);
  font-weight: 600;
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.terminal-controls {
  display: flex;
  gap: var(--space-2);
}

.control {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
}

.control:hover {
  transform: scale(1.1);
}

.control.close {
  background: #ff5f56;
}

.control.minimize {
  background: #ffbd2e;
}

.control.maximize {
  background: #27ca3f;
}

.terminal-content {
  padding: var(--space-6);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-base);
  line-height: 1.8;
  min-height: 400px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.terminal-line {
  margin-bottom: var(--space-2);
  padding: var(--space-1) 0;
  border-radius: var(--space-1);
  transition: background-color var(--transition-fast);
}

.terminal-line:hover {
  background: rgba(0, 255, 136, 0.05);
}

.terminal-prompt {
  color: var(--color-primary);
  user-select: none;
}

.terminal-input-form {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-4);
  padding: var(--space-3);
  background: var(--bg-tertiary);
  border-radius: var(--border-radius);
  border: 1px solid transparent;
  transition: all var(--transition-fast);
}

.terminal-input-form:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
}

.terminal-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-family: inherit;
  font-size: inherit;
  outline: none;
  caret-color: var(--color-primary);
}

.terminal-input::placeholder {
  color: var(--text-muted);
}

/* ===========================================
   Animations
   ========================================== */
.cursor {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-up {
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===========================================
   Responsive Design
   ========================================== */
@media (max-width: 768px) {
  .app-header {
    padding: var(--space-3) var(--space-4);
  }
  
  .app-main {
    padding: var(--space-4);
    gap: var(--space-4);
  }
  
  .terminal-container {
    border-radius: var(--border-radius);
  }
  
  .terminal-content {
    padding: var(--space-4);
    font-size: var(--font-size-sm);
    min-height: 300px;
  }
}

@media (max-width: 480px) {
  .terminal-header {
    padding: var(--space-2) var(--space-3);
  }
  
  .terminal-title {
    font-size: var(--font-size-xs);
  }
  
  .control {
    width: 10px;
    height: 10px;
  }
}

/* ===========================================
   High Contrast Mode
   ========================================== */
@media (prefers-contrast: high) {
  .terminal-container {
    border-width: 2px;
  }
  
  .terminal-line:hover {
    background: rgba(0, 255, 136, 0.2);
  }
}
EOL'
  fi
}

create_component_files() {
  progress "Creating enhanced component files"
  
  # Create Error Boundary
  if [[ ! -f "src/components/ErrorBoundary.tsx" ]]; then
    execute_command 'cat > src/components/ErrorBoundary.tsx << EOL
import React, { Component, ErrorInfo, ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <h1>🚨 Something went wrong</h1>
            <p>An unexpected error occurred. Please refresh the page.</p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="error-details">
                <summary>Error Details</summary>
                <pre>{this.state.error.stack}</pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="error-refresh-button"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
EOL'
  fi

  # Create Loading Spinner component
  if [[ ! -f "src/components/ui/LoadingSpinner.tsx" ]]; then
    execute_command 'cat > src/components/ui/LoadingSpinner.tsx << EOL
import React from "react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className = ""
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  }

  return (
    <div className={`loading-spinner ${className}`}>
      <div className={`spinner ${sizeClasses[size]}`}>
        <div className="spinner-circle"></div>
      </div>
    </div>
  )
}

export default LoadingSpinner
EOL'
  fi

  # Create enhanced Terminal component
  if [[ ! -f "src/components/Terminal.tsx" ]]; then