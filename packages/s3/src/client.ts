import { S3Client } from "@aws-sdk/client-s3";


let s3: S3Client;

if (!process.env.DOCUMENT_BUCKET_NAME) {
  throw new Error("DOCUMENT_BUCKET_NAME is not set");
}

if (process.env.NODE_ENV === "local") {
  s3 = new S3Client({
    profile: "catholic-rag-dev",
  });
} else {
  // Railway doesn't do OIDC federated creds
  if (!process.env.AWS_ACCESS_KEY_ID) {
    throw new Error("AWS_ACCESS_KEY_ID is not set");
  }
  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS_SECRET_ACCESS_KEY is not set");
  }

  s3 = new S3Client()
}

const DOCUMENT_BUCKET_NAME = process.env.DOCUMENT_BUCKET_NAME;

export { s3, DOCUMENT_BUCKET_NAME }
