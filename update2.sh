import argparse
import subprocess
import logging
import sys
import urllib.request
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

INSTALL_DIR = Path("ANE-Project-Explorer")
REPO_URL = "https://github.com/Leonydis200/ANE-Project-Explorer-main.git"
BRANCH = "main"

MODEL_URL = "https://huggingface.co/TheBloke/Llama-2-7B-GGUF/resolve/main/llama-2-7b.Q4_K_M.gguf"
MODEL_PATH = INSTALL_DIR / "models" / "llama-2-7b.Q4_K_M.gguf"

def run(cmd, cwd=None):
    logger.info(f"Running command: {' '.join(cmd)}")
    subprocess.run(cmd, cwd=cwd, check=True)

def manage_repo():
    if INSTALL_DIR.exists():
        logger.info("Repository exists; pulling latest changes")
        run(["git", "reset", "--hard", "HEAD"], cwd=INSTALL_DIR)
        run(["git", "clean", "-fd"], cwd=INSTALL_DIR)
        run(["git", "pull", "origin", BRANCH], cwd=INSTALL_DIR)
    else:
        logger.info("Cloning repository")
        run(["git", "clone", "-b", BRANCH, REPO_URL, str(INSTALL_DIR)])

def install_dependencies():
    logger.info("Installing npm dependencies")
    run(["npm", "install"], cwd=INSTALL_DIR)

def run_dev_server():
    logger.info("Starting dev server (npm run dev)")
    run(["npm", "run", "dev"], cwd=INSTALL_DIR)

def build_production():
    logger.info("Building production bundle (npm run build)")
    run(["npm", "run", "build"], cwd=INSTALL_DIR)

def download_model():
    logger.info(f"Downloading model from {MODEL_URL}")
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    try:
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
        logger.info(f"Model downloaded to {MODEL_PATH}")
    except Exception as e:
        logger.error(f"Failed to download model: {e}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="AI Automation Script for ANE-Project-Explorer")
    parser.add_argument("--dev", action="store_true", help="Run dev server instead of production build")
    parser.add_argument("--download-model", action="store_true", help="Download AI model")
    args = parser.parse_args()

    try:
        logger.info("Starting automation script")
        manage_repo()
        install_dependencies()

        if args.download_model:
            download_model()

        if args.dev:
            run_dev_server()
        else:
            build_production()

        logger.info("Automation completed successfully")
    except subprocess.CalledProcessError as e:
        logger.error(f"Command failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
