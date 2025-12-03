-- CreateTable
CREATE TABLE "pencils" (
    "id" SERIAL NOT NULL,
    "startX" INTEGER NOT NULL,
    "startY" INTEGER NOT NULL,
    "mouseX" INTEGER NOT NULL,
    "mouseY" INTEGER NOT NULL,

    CONSTRAINT "pencils_pkey" PRIMARY KEY ("id")
);
