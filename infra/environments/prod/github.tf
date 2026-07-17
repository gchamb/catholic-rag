module "github_oidc" {
  source    = "../../modules/oidc-providers/github"
  role_name = "github-action-deploy"
  # This repo was created after 2026-07-15, so GitHub sends immutable owner/repo
  # IDs in the `sub` claim: repo:OWNER@<owner_id>/REPO@<repo_id>:environment:NAME.
  # Owner ID 70717055, Repo ID 1303453206 (from `gh api repos/gchamb/catholic-rag`).
  allowed_subjects = [
    "repo:gchamb@70717055/catholic-rag@1303453206:environment:prod"
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
