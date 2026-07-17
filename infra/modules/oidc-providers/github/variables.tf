
variable "role_name" {
  description = "The name of the role that the token will will assume"
  type        = string
}

variable "allowed_subjects" {
  type        = list(string)
  description = "The list of OIDC `sub` claims allowed to assume the role (e.g. repo:OWNER/REPO:environment:NAME or repo:OWNER/REPO:ref:refs/heads/BRANCH)"
}

variable "allowed_github_actors" {
  type = list(string)
  description = "The list of GitHub actors that are allowed to assume the role"
}  