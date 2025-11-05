-- AlterTable
ALTER TABLE "public"."Product"
    DROP COLUMN IF EXISTS "image_url",
    DROP COLUMN IF EXISTS "thumb_url";
