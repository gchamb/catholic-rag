module "github_oidc" {
  source    = "../../modules/oidc-providers/github"
  role_name = "github-action-deploy"
  # The workflow's `terraform-prod` job uses `environment: prod`, so the OIDC `sub`
  # claim is `repo:gchamb/catholic-rag:environment:prod` — not a branch ref.
  allowed_subjects = [
    "repo:gchamb/catholic-rag:environment:prod"
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
