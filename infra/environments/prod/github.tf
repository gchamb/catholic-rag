module "github_oidc" {
  source    = "../../modules/oidc-providers/github"
  role_name = "github-action-deploy"
  allowed_git_refs = [
    "repo:gchamb/catholic-rag:ref:refs/heads/production",
    "repo:gchamb/catholic-rag:pull-request"
  ]
  allowed_github_actors = [
    "gchamb"
  ]
}


# Admin for now, but it's alright for now.
resource "aws_iam_role_policy_attachment" "github_policy_attachment" {
  role       = module.github_oidc.role.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}
