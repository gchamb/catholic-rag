module "github_oidc" {
  source    = "../../modules/oidc-providers/github"
  role_name = "github-action-deploy"
  # The workflow's `terraform-dev` job uses `environment: dev`, so the OIDC `sub`
  # claim is `repo:gchamb/catholic-rag:environment:dev` — not a branch ref.
  allowed_subjects = [
    "repo:gchamb/catholic-rag:environment:dev"
  ]
  allowed_github_actors = [
    "gchamb"
  ]
}

# Attach policies to the role
resource "aws_iam_role_policy_attachment" "github_policy_attachment" {
  role       = module.github_oidc.role.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}



