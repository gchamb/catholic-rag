
variable "role_name" {
  description = "The name of the role that the token will will assume"
  type        = string
}

variable "allowed_git_refs" {
  type = list(string)
  description = "The list of Git refs that are allowed to assume the role"
}

variable "allowed_github_actors" {
  type = list(string)
  description = "The list of GitHub actors that are allowed to assume the role"
}