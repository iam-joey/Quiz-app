-- AddForeignKey
ALTER TABLE "UserLearningHistory" ADD CONSTRAINT "UserLearningHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLearningTopicIdsDetails" ADD CONSTRAINT "UserLearningTopicIdsDetails_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
