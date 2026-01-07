import { createUploadthing, type FileRouter } from "uploadthing/next";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const f = createUploadthing();

export const fileRouter = {
  avatarUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      try {
        const session = await auth.api.getSession({ headers: req.headers });
        const userEmail = session?.user?.email || null;
        const userId = (session?.user as any)?.id || null;
        return { userEmail: userEmail || null, userId: userId || null };
      } catch {
        return { userEmail: null, userId: null };
      }
    })
    .onUploadComplete(async ({ file, metadata }) => {
      const imageUrl = file.url;
      const email = metadata.userEmail || undefined;
      if (!email) {
        return;
      }
      const normEmail = String(email).trim().toLowerCase();
      await prisma.user.update({
        where: { email: normEmail },
        data: { image: imageUrl }
      });
    })
} satisfies FileRouter;

export type OurFileRouter = typeof fileRouter;
