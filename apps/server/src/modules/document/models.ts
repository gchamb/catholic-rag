import { t } from 'elysia';

export const DocumentModel = {
  uploadDocumentBody: t.Object({
    file: t.File({ maxSize: '5m', type: "application/pdf" }),
  }),
}
