-- DropIndex
DROP INDEX "UserLearningTopicIdsDetails_id_idx";

-- CreateIndex
CREATE INDEX "UserLearningHistory_userId_idx" ON "UserLearningHistory"("userId");

-- CreateIndex
CREATE INDEX "UserLearningTopicIdsDetails_id_topicId_userId_idx" ON "UserLearningTopicIdsDetails"("id", "topicId", "userId");
