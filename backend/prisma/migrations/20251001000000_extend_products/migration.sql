-- CreateTable
CREATE TABLE "public"."Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "public"."Category"("name");
CREATE UNIQUE INDEX "Category_slug_key" ON "public"."Category"("slug");

-- AlterTable
ALTER TABLE "public"."Product"
    ADD COLUMN "brand" TEXT,
    ADD COLUMN "color" TEXT,
    ADD COLUMN "description" TEXT NOT NULL DEFAULT '',
    ADD COLUMN "categoryId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Product"
    ADD CONSTRAINT "Product_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
