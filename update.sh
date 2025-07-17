# ------------------ DEFAULTS (to avoid unbound variable errors) ------------------
DOCKER_IMAGE_TAG=${DOCKER_IMAGE_TAG:-"myrepo/myapp:latest"}
LOG_DIR=${LOG_DIR:-"./logs"}

mkdir -p "$LOG_DIR"

# ------------------------ DOCKERHUB / GITLAB PUSH ------------------------
DOCKERHUB_PUSH=${DOCKERHUB_PUSH:-1}
DOCKERHUB_USER=${DOCKERHUB_USER:-"yourdockeruser"}
DOCKERHUB_PASS=${DOCKERHUB_PASS:-""}

GITLAB_REGISTRY=${GITLAB_REGISTRY:-"registry.gitlab.com/yourgroup/yourproject"}
GITLAB_TOKEN=${GITLAB_TOKEN:-""}

push_dockerhub() {
  [ "$DOCKERHUB_PUSH" -ne 1 ] && return
  echo "$DOCKERHUB_PASS" | docker login -u "$DOCKERHUB_USER" --password-stdin
  docker tag "$DOCKER_IMAGE_TAG" "$DOCKERHUB_USER/${DOCKER_IMAGE_TAG#*/}"
  docker push "$DOCKERHUB_USER/${DOCKER_IMAGE_TAG#*/}"
}

push_gitlab_registry() {
  [ -z "$GITLAB_TOKEN" ] && return
  docker login "$GITLAB_REGISTRY" -u gitlab-ci-token -p "$GITLAB_TOKEN"
  docker tag "$DOCKER_IMAGE_TAG" "$GITLAB_REGISTRY:${DOCKER_IMAGE_TAG##*:}"
  docker push "$GITLAB_REGISTRY:${DOCKER_IMAGE_TAG##*:}"
}

# ------------------------ PERFORMANCE BENCHMARKING ------------------------
run_benchmarks() {
  if [ -f "benchmark.sh" ]; then
    log "Running performance benchmarks"
    bash benchmark.sh || log "Benchmarks failed"
  else
    log "No benchmark.sh found, skipping"
  fi
}

# ------------------------ PER-PROJECT CONFIG LOADER ------------------------
load_custom_config() {
  if [ -f ".autofixrc" ]; then
    log "Loading project-specific config: .autofixrc"
    source .autofixrc
  fi
}

# ------------------------ UPDATE MAIN LOOP ------------------------
for P in "${PROJECT_DIRS[@]}"; do
  log "Processing project: $P"
  cd "$START_DIR/$P" || { log "Cannot cd to $START_DIR/$P, skipping"; continue; }
  repo_name=$(basename "$(git rev-parse --show-toplevel 2>/dev/null || echo "$PWD")")

  if ! git rev-parse --is-inside-work-tree &>/dev/null; then
    log "Not a Git repo, skipping"
    continue
  fi

  TS=$(date +%Y%m%d_%H%M%S)
  git stash push -u -m "auto_fix_stash_$TS" || true
  ORIGINAL_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  TEMP_BRANCH="auto-fix-${repo_name}"
  git branch -f "$TEMP_BRANCH" HEAD

  load_custom_config

  for ((i=1;i<=MAX_ATTEMPTS;i++)); do
    log "Attempt #$i for $P"
    git checkout -f "$TEMP_BRANCH"

    for s in $FIX_SCRIPT_PATTERN; do
      [ -f "$s" ] && { log "Local fix: $s"; bash "$s"; }
    done

    fetch_remote_fixes || log "Remote fixes failed"
    log "Running cloud CLI: $CLOUD_CLI_CMD"
    $CLOUD_CLI $CLOUD_CLI_CMD || log "Cloud CLI step failed"

    for cmd in "${CHECK_COMMANDS[@]}"; do
      log "Verify: $cmd"
      if ! eval "$cmd"; then
        log "Check failed: $cmd, retrying..."
        continue 2  # retry attempts
      fi
    done

    run_benchmarks

    log "Docker build"
    docker build -f "$DOCKERFILE" -t "$DOCKER_IMAGE_TAG" .

    log "Docker run test"
    docker run --rm "$DOCKER_IMAGE_TAG" sh -c 'echo Docker OK'

    push_dockerhub
    push_gitlab_registry

    if [ -n "$KUBE_CONTEXT" ]; then
      log "Switch K8s context to $KUBE_CONTEXT"
      kubectl config use-context "$KUBE_CONTEXT"
    fi
    log "Helm lint of $HELM_CHART"
    helm lint "$HELM_CHART"
    log "Helm upgrade dry-run"
    helm upgrade --install "$HELM_RELEASE" "$HELM_CHART" --dry-run

    log "Success for $P"
    git checkout "$ORIGINAL_BRANCH"
    git merge --ff-only "$TEMP_BRANCH"
    git branch -D "$TEMP_BRANCH"
    notify_slack "✅ Auto-fix succeeded for $P"
    notify_email "Success for $P"
    break
  done

  if [ $i -gt $MAX_ATTEMPTS ]; then
    log "Failed $MAX_ATTEMPTS attempts for $P"
    git checkout "$ORIGINAL_BRANCH"
    notify_slack "❌ Auto-fix failed for $P"
    notify_email "Failure for $P"
  fi

  git stash pop --index || true
  cd "$START_DIR"
done
