'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';

interface AdminReview {
  id: number;
  rating: number;
  body: string;
  status: string;
  createdAt: string;
  userName: string;
  listingId: number;
  listingTitle: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
  );
}

const STATUS_FILTERS = ['pending', 'approved', 'rejected'] as const;

export default function AdminReviewsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('pending');

  const { data: reviews, isPending } = useQuery({
    queryKey: ['admin-reviews', statusFilter],
    queryFn: () => api.get<AdminReview[]>(`/reviews/admin?status=${statusFilter}`),
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/reviews/${id}`, { status }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
  });

  return (
    <div className="max-w-content mx-auto px-6 py-12">
      <h1 className="font-display text-3xl mb-6">Review Moderation</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              statusFilter === s
                ? 'bg-blue-600 text-white'
                : 'border border-border text-muted-foreground hover:border-accent hover:text-accent'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isPending && <p className="text-muted-foreground">Loading…</p>}

      {reviews && reviews.length === 0 && (
        <p className="text-muted-foreground">No {statusFilter} reviews.</p>
      )}

      {reviews && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-border bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Stars rating={review.rating} />
                    <span className="font-medium text-sm text-gray-700">{review.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Listing:{' '}
                    <a href={`/listings/${review.listingId}`} className="underline hover:text-accent" target="_blank" rel="noreferrer">
                      {review.listingTitle}
                    </a>
                  </p>
                  <p className="mt-2 text-sm text-gray-700 leading-relaxed">{review.body}</p>
                </div>

                {statusFilter === 'pending' && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button
                      size="sm"
                      disabled={patchMutation.isPending}
                      onClick={() => patchMutation.mutate({ id: review.id, status: 'approved' })}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      disabled={patchMutation.isPending}
                      onClick={() => patchMutation.mutate({ id: review.id, status: 'rejected' })}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
