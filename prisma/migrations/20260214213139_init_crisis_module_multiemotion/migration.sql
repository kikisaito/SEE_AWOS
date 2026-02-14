-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('TEXT', 'AUDIO');

-- CreateTable
CREATE TABLE "users" (
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "preferred_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "capsules" (
    "capsule_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_emotion_id" INTEGER NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "content_type" "ContentType" NOT NULL DEFAULT 'TEXT',
    "content_text" TEXT,
    "s3_key" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "capsules_pkey" PRIMARY KEY ("capsule_id")
);

-- CreateTable
CREATE TABLE "crisis_sessions" (
    "crisis_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "initial_emotion_id" INTEGER NOT NULL,
    "used_capsule_id" TEXT,
    "final_evaluation_id" INTEGER,
    "breathing_exercise_completed" BOOLEAN NOT NULL DEFAULT false,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "crisis_sessions_pkey" PRIMARY KEY ("crisis_id")
);

-- CreateTable
CREATE TABLE "user_victories" (
    "victory_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "victory_type_id" INTEGER NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_victories_pkey" PRIMARY KEY ("victory_id")
);

-- CreateTable
CREATE TABLE "emotions_catalog" (
    "emotion_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "emotions_catalog_pkey" PRIMARY KEY ("emotion_id")
);

-- CreateTable
CREATE TABLE "victory_types_catalog" (
    "victory_type_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "victory_types_catalog_pkey" PRIMARY KEY ("victory_type_id")
);

-- CreateTable
CREATE TABLE "evaluation_scales_catalog" (
    "evaluation_id" SERIAL NOT NULL,
    "description" VARCHAR(50) NOT NULL,

    CONSTRAINT "evaluation_scales_catalog_pkey" PRIMARY KEY ("evaluation_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "emotions_catalog_name_key" ON "emotions_catalog"("name");

-- CreateIndex
CREATE UNIQUE INDEX "victory_types_catalog_name_key" ON "victory_types_catalog"("name");

-- CreateIndex
CREATE UNIQUE INDEX "evaluation_scales_catalog_description_key" ON "evaluation_scales_catalog"("description");

-- AddForeignKey
ALTER TABLE "capsules" ADD CONSTRAINT "capsules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capsules" ADD CONSTRAINT "capsules_target_emotion_id_fkey" FOREIGN KEY ("target_emotion_id") REFERENCES "emotions_catalog"("emotion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crisis_sessions" ADD CONSTRAINT "crisis_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crisis_sessions" ADD CONSTRAINT "crisis_sessions_initial_emotion_id_fkey" FOREIGN KEY ("initial_emotion_id") REFERENCES "emotions_catalog"("emotion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crisis_sessions" ADD CONSTRAINT "crisis_sessions_used_capsule_id_fkey" FOREIGN KEY ("used_capsule_id") REFERENCES "capsules"("capsule_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crisis_sessions" ADD CONSTRAINT "crisis_sessions_final_evaluation_id_fkey" FOREIGN KEY ("final_evaluation_id") REFERENCES "evaluation_scales_catalog"("evaluation_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_victories" ADD CONSTRAINT "user_victories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_victories" ADD CONSTRAINT "user_victories_victory_type_id_fkey" FOREIGN KEY ("victory_type_id") REFERENCES "victory_types_catalog"("victory_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;
