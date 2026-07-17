
variable "role_name" {
  description = "The name of the role that the token will will assume"
  type        = string
}

variable "allowed_git_refs" {
  type = list(string)
}
