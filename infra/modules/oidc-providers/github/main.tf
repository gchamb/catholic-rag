locals {
  sts = "sts.amazonaws.com"
}

# 1. The OIDC identity provider — tells AWS to trust GitHub's OIDC issuer
resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = [local.sts]
}

# 2. The IAM role that GitHub Actions will assume
resource "aws_iam_role" "github_actions_deploy" {
  name               = var.role_name
  assume_role_policy = data.aws_iam_policy_document.github_actions_trust.json
}

# 3. The trust policy
data "aws_iam_policy_document" "github_actions_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = [local.sts]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = var.allowed_git_refs
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:actor"
      values   = var.allowed_github_actors
    }
  }
}

