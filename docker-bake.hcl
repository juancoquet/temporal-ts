variable "IMAGE_PREFIX" {
  default = "temporal-ts"
}

variable "IMAGE_TAG" {
  default = "local"
}

variable "SOURCE_REPOSITORY" {
  default = "https://github.com/juancoquet/temporal-ts"
}

group "default" {
  targets = ["example-job", "example-plan", "example-process"]
}

target "worker-base" {
  context    = "."
  dockerfile = "src/orchestration/worker-base.Dockerfile"
}

target "_worker" {
  context = "."
  contexts = {
    worker-base = "target:worker-base"
  }
  labels = {
    "org.opencontainers.image.source" = SOURCE_REPOSITORY
  }
}

target "example-job" {
  inherits   = ["_worker"]
  dockerfile = "src/orchestration/workflows/example_job/Dockerfile"
  tags       = ["${IMAGE_PREFIX}/example-job:${IMAGE_TAG}"]
}

target "example-plan" {
  inherits   = ["_worker"]
  dockerfile = "src/orchestration/activities/example_plan/Dockerfile"
  tags       = ["${IMAGE_PREFIX}/example-plan:${IMAGE_TAG}"]
}

target "example-process" {
  inherits   = ["_worker"]
  dockerfile = "src/orchestration/activities/example_process/Dockerfile"
  tags       = ["${IMAGE_PREFIX}/example-process:${IMAGE_TAG}"]
}
