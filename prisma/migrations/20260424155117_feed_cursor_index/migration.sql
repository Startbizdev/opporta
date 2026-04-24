-- CreateIndex
CREATE INDEX "Post_status_score_createdAt_id_idx" ON "Post"("status", "score" DESC, "createdAt" DESC, "id" DESC);
