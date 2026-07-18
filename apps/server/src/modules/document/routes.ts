import { Elysia } from "elysia";
import { DocumentController } from "./controller.js";
import { DocumentModel } from "./models.js";
import { handleError } from "../../utils/error.js";

const documentRoutes = new Elysia({ prefix: "/document" })
  .onError(handleError)
  .post(
    "/",
    async ({ body }) => DocumentController.uploadDocument(body.file),
    {
      body: DocumentModel.uploadDocumentBody
    },
  );

export default documentRoutes;
