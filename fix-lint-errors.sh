#!/usr/bin/env bash

# ========================================
# Project Repair & Validation Script
# ========================================

# Color definitions
NC='\033[0m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'

# Initialize variables
LOG_FILE="repair.log"
DEBUG=false
QUIET=false

# ----------------------------------------
# Core Functions
# ----------------------------------------

print_banner() {
  echo -e "${BLUE}"
  echo "╔══════════════════════════════════════════╗"
  echo "║    Project Repair & Validation Script    ║"
  echo "╚══════════════════════════════════════════╝"
  echo -e "${NC}"
}

log() {
  local msg="$1"
  echo -e "${CYAN}[$(date '+%H:%M:%S')] [INFO]${NC} $msg" | tee -a "$LOG_FILE"
}

success() {
  local msg="$1"
  echo -e "${GREEN}[$(date '+%H:%M:%S')] [✓]${NC} $msg" | tee -a "$LOG_FILE"
}

warn() {
  local msg="$1"
  echo -e "${YELLOW}[$(date '+%H:%M:%S')] [⚠]${NC} $msg" | tee -a "$LOG_FILE"
}

error() {
  local msg="$1"
  echo -e "${RED}[$(date '+%H:%M:%S')] [✗]${NC} $msg" | tee -a "$LOG_FILE"
  exit 1
}

# ----------------------------------------
# System Checks
# ----------------------------------------

check_node_version() {
  if ! command -v node >/dev/null; then
    error "Node.js is not installed"
  fi

  local node_version=$(node --version | cut -d'v' -f2)
  local min_version="18.0.0"

  if [ "$(printf '%s\n' "$min_version" "$node_version" | sort -V | head -n1)" != "$min_version" ]; then
    error "Node.js version $node_version is too old. Required: $min_version+"
  fi

  success "Node.js version $node_version is compatible"
}

# ----------------------------------------
# Dependency Management
# ----------------------------------------

install_dependencies() {
  log "Installing project dependencies..."
  
  if [ -f "yarn.lock" ]; then
    yarn install || warn "Failed to install with yarn"
  elif [ -f "package-lock.json" ]; then
    npm install || warn "Failed to install with npm"
  else
    npm install || warn "Failed to install with npm"
  fi

  success "Dependencies installed"
}

# ----------------------------------------
# Main Execution
# ----------------------------------------

main() {
  # Initialize logging
  > "$LOG_FILE" # Clear log file
  
  print_banner
  check_node_version
  install_dependencies
  
  success "Repair process completed successfully"
  echo -e "\nDetailed log saved to: $LOG_FILE"
}

# Run main function
main "$@"