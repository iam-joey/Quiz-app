import { Suspense } from "react";
import QuestionsView from "@/components/Questions/Questions";
import { getQuestionsRange } from "@/src/lib/actions";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 50;

export const dynamic = "force-dynamic";

export default async function QuestionsPage({
  params,
  searchParams,
}: {
  params: { topicid: string };
  searchParams: { page?: string };
}) {
  const currentPage = Number(searchParams.page) || 1;
  const response = await getQuestionsRange(
    params.topicid,
    ITEMS_PER_PAGE,
    currentPage
  );

  const totalPages = response.totalPages;

  return (
    <div className="container mx-auto p-4">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <QuestionsView
          initialQuestions={response.data || []}
          categoryId={params.topicid}
          initialTotalQuestions={response.total.toString()}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </Suspense>
      {response.total > ITEMS_PER_PAGE && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={`/topics/${params.topicid}?page=${currentPage - 1}`}
                aria-disabled={currentPage === 1}
                tabIndex={currentPage === 1 ? -1 : undefined}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href={`/topics/${params.topicid}?page=${i + 1}`}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext
                href={`/topics/${params.topicid}?page=${currentPage + 1}`}
                aria-disabled={currentPage === totalPages}
                tabIndex={currentPage === totalPages ? -1 : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
