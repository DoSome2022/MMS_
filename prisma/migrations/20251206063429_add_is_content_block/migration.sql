-- CreateTable
CREATE TABLE "A" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "desc" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "A_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DynamicModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DynamicModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DynamicField" (
    "id" TEXT NOT NULL,
    "dynamicModelId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" JSONB,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DynamicField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DynamicData" (
    "id" TEXT NOT NULL,
    "dynamicModelId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "parentId" TEXT,
    "isContentBlock" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DynamicData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "A_slug_key" ON "A"("slug");

-- AddForeignKey
ALTER TABLE "DynamicModel" ADD CONSTRAINT "DynamicModel_aId_fkey" FOREIGN KEY ("aId") REFERENCES "A"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DynamicField" ADD CONSTRAINT "DynamicField_dynamicModelId_fkey" FOREIGN KEY ("dynamicModelId") REFERENCES "DynamicModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DynamicData" ADD CONSTRAINT "DynamicData_dynamicModelId_fkey" FOREIGN KEY ("dynamicModelId") REFERENCES "DynamicModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DynamicData" ADD CONSTRAINT "DynamicData_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "DynamicData"("id") ON DELETE SET NULL ON UPDATE CASCADE;
