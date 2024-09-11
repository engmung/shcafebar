import fs from "fs/promises";
import mime from "mime";

export async function resolveStaticFile(filePath, event) {
  try {
    const stats = await fs.stat(filePath);
    if (stats.isFile()) {
      const content = await fs.readFile(filePath);
      const contentType = mime.getType(filePath) || "application/octet-stream";

      return new Response(content, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  } catch (error) {
    console.error("Error serving static file:", error);
  }

  return new Response("Not found", { status: 404 });
}
