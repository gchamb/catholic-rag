import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3, DOCUMENT_BUCKET_NAME } from "../s3/client.js";
import { db, documentTable } from "db";
import { status } from "elysia";


export abstract class DocumentController {
  static async uploadDocument(file: File) {
    const key = `documents/${crypto.randomUUID()}`

    await db.insert(documentTable).values({
      fileKey: key,
      // default value for status is awaiting_approval
    });

    await s3.send(
      new PutObjectCommand({
        Bucket: DOCUMENT_BUCKET_NAME,
        Key: key,
        Body: new Uint8Array(await file.arrayBuffer()),
        ContentType: file.type || "application/octet-stream",
      }),
    );

    return status("OK")
  }
}


