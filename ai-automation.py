#!/usr/bin/env python3
import os
import sys
import subprocess
import json
from datetime import datetime

# Configuration
REPO_URL = "https://github.com/Leonydis200/ANE-Project-Explorer-main/"
INSTALL_DIR = "./ANE-Project-Explorer"
BRANCH = "main"
USE_YARN = False  # Set to True if you prefer yarn over npm
PROBLEMATIC_PACKAGE = "vite-plugin-checker"

def log(level, message):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{level}] {timestamp} {message}")

def run_command(cmd, cwd=None):
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd, check=True,
                              stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                              text=True)
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        log("ERROR", f"Command failed: {cmd}\nError: {e.stderr}")
        return False, e.stderr

def check_system():
    log("INFO", "Running system checks")
    required_commands = ['git', 'node']
    if USE_YARN:
        required_commands.append('yarn')
    else:
        required_commands.append('npm')
    
    for cmd in required_commands:
        if not run_command(f"command -v {cmd}")[0]:
            log("ERROR", f"Missing dependency: {cmd}")
            return False
    log("SUCCESS", "System checks passed")
    return True

def manage_repo():
    log("INFO", "Managing repository")
    if not os.path.exists(INSTALL_DIR):
        success, _ = run_command(f"git clone -b {BRANCH} {REPO_URL} {INSTALL_DIR}")
        if not success:
            return False
    else:
        success, _ = run_command("git reset --hard HEAD && git clean -fd", INSTALL_DIR)
        success, _ = run_command(f"git pull origin {BRANCH}", INSTALL_DIR)
        if not success:
            return False
    
    if not os.path.exists(os.path.join(INSTALL_DIR, "package.json")):
        log("ERROR", "No package.json found - not a Node.js project")
        return False
    
    log("SUCCESS", "Repository ready")
    return True

def check_package_versions():
    log("INFO", f"Checking available versions for {PROBLEMATIC_PACKAGE}")
    success, output = run_command(f"npm view {PROBLEMATIC_PACKAGE} versions --json")
    if not success:
        return False
    
    try:
        versions = json.loads(output)
        latest_version = versions[-1]
        log("INFO", f"Available versions: {', '.join(versions[-5:])} (latest: {latest_version})")
        return latest_version
    except json.JSONDecodeError:
        log("ERROR", "Could not parse version information")
        return False

def modify_package_json(latest_version):
    package_path = os.path.join(INSTALL_DIR, "package.json")
    try:
        with open(package_path, 'r') as f:
            package_data = json.load(f)
        
        # Check dependencies
        for dep_type in ['dependencies', 'devDependencies']:
            if dep_type in package_data and PROBLEMATIC_PACKAGE in package_data[dep_type]:
                current_version = package_data[dep_type][PROBLEMATIC_PACKAGE]
                if current_version.startswith('^'):
                    new_version = f"^{latest_version}"
                elif current_version.startswith('~'):
                    new_version = f"~{latest_version}"
                else:
                    new_version = latest_version
                
                package_data[dep_type][PROBLEMATIC_PACKAGE] = new_version
                log("INFO", f"Updating {PROBLEMATIC_PACKAGE} from {current_version} to {new_version}")
        
        with open(package_path, 'w') as f:
            json.dump(package_data, f, indent=2)
        
        return True
    except Exception as e:
        log("ERROR", f"Failed to modify package.json: {str(e)}")
        return False

def install_dependencies():
    log("INFO", "Installing dependencies")
    
    # First check if we have the problematic package
    package_path = os.path.join(INSTALL_DIR, "package.json")
    with open(package_path, 'r') as f:
        package_data = json.load(f)
    
    has_problematic = any(
        PROBLEMATIC_PACKAGE in package_data.get(dep_type, {})
        for dep_type in ['dependencies', 'devDependencies']
    )
    
    if has_problematic:
        latest_version = check_package_versions()
        if latest_version:
            if not modify_package_json(latest_version):
                log("WARN", "Could not update package.json, trying anyway")
    
    # Try regular install first
    if USE_YARN:
        success, _ = run_command("yarn install", INSTALL_DIR)
    else:
        success, _ = run_command("npm install", INSTALL_DIR)
    
    if success:
        log("SUCCESS", "Dependencies installed")
        return True
    
    # If failed, try alternative approaches
    log("WARN", "First install attempt failed, trying alternative methods")
    
    # Method 1: Install with legacy peer deps
    if not USE_YARN:
        success, _ = run_command("npm install --legacy-peer-deps", INSTALL_DIR)
        if success:
            log("SUCCESS", "Dependencies installed (with legacy peer deps)")
            return True
    
    # Method 2: Try to remove node_modules and lock files
    log("WARN", "Trying clean install")
    run_command("rm -rf node_modules package-lock.json yarn.lock", INSTALL_DIR)
    if USE_YARN:
        success, _ = run_command("yarn install", INSTALL_DIR)
    else:
        success, _ = run_command("npm install", INSTALL_DIR)
    
    if success:
        log("SUCCESS", "Dependencies installed after clean")
        return True
    
    # Final attempt: Skip the problematic package
    if has_problematic:
        log("WARN", f"Trying to install without {PROBLEMATIC_PACKAGE}")
        if modify_package_json("0.0.0"):
            if USE_YARN:
                success, _ = run_command("yarn install", INSTALL_DIR)
            else:
                success, _ = run_command("npm install", INSTALL_DIR)
            
            if success:
                log("SUCCESS", f"Dependencies installed (without {PROBLEMATIC_PACKAGE})")
                return True
    
    log("ERROR", "All dependency installation attempts failed")
    return False

def build_application():
    log("INFO", "Building application")
    
    package_json = os.path.join(INSTALL_DIR, "package.json")
    with open(package_json) as f:
        content = f.read()
    
    build_scripts = []
    if '"build"' in content:
        build_scripts.append("build")
    if '"compile"' in content:
        build_scripts.append("compile")
    
    if not build_scripts:
        log("WARN", "No build scripts found in package.json, skipping build")
        return True
    
    for script in build_scripts:
        if USE_YARN:
            success, _ = run_command(f"yarn run {script}", INSTALL_DIR)
        else:
            success, _ = run_command(f"npm run {script}", INSTALL_DIR)
        
        if success:
            log("SUCCESS", f"Application built with '{script}' script")
            return True
    
    log("ERROR", "All build attempts failed")
    return False

def run_application():
    log("INFO", "Starting application")
    
    package_json = os.path.join(INSTALL_DIR, "package.json")
    with open(package_json) as f:
        content = f.read()
    
    run_scripts = []
    if '"start"' in content:
        run_scripts.append("start")
    if '"dev"' in content:
        run_scripts.append("dev")
    if '"serve"' in content:
        run_scripts.append("serve")
    
    if not run_scripts:
        log("ERROR", "No recognized run scripts found in package.json")
        return False
    
    for script in run_scripts:
        if USE_YARN:
            success, output = run_command(f"yarn run {script}", INSTALL_DIR)
        else:
            success, output = run_command(f"npm run {script}", INSTALL_DIR)
        
        if success:
            log("SUCCESS", f"Application running with '{script}' script")
            return True
    
    log("ERROR", "All run attempts failed")
    return False

def main():
    if not check_system():
        sys.exit(1)
    if not manage_repo():
        sys.exit(1)
    if not install_dependencies():
        sys.exit(1)
    if not build_application():
        sys.exit(1)
    if not run_application():
        sys.exit(1)

if __name__ == "__main__":
    main()
