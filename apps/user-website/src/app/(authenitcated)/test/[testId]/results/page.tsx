"use client";

import { useParams, useSearchParams } from "next/navigation";
import TestResults, {
  TestResultsProps,
} from "@/src/components/TestResults/page";

export default function TestResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const testResultsProps: TestResultsProps = {
    testId: params.testId as string,
    testType: searchParams.get("testType") as string,
  };
  return <TestResults {...testResultsProps} />;
}
