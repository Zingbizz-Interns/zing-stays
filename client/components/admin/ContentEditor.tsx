'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';

const CONTENT_TYPES = [
  { value: 'area_guide', label: 'Area Guide' },
  { value: 'student_guide', label: 'Student Guide' },
  { value: 'comparison', label: 'Comparison' },
  { value: 'rent_advice', label: 'Rent Advice' },
  { value: 'locality_insight', label: 'Locality Insight' },
] as const;

interface City {
  id: number;
  name: string;
  slug: string;
}

interface Locality {
  id: number;
  name: string;
  slug: string;
  cityId: number;
}

interface ContentPageFull {
  id: number;
  slug: string;
  type: string;
  title: string;
  body: string;
  cityId: number | null;
  localityId: number | null;
  isPublished: boolean;
}

interface ContentEditorProps {
  mode: 'create' | 'edit';
  pageId?: number;
}

export default function ContentEditor({ mode, pageId }: ContentEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [type, setType] = useState<string>('area_guide');
  const [body, setBody] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [cityId, setCityId] = useState<number | null>(null);
  const [localityId, setLocalityId] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: citiesData } = useQuery({
    queryKey: ['cities'],
    queryFn: () => api.get<{ data: City[] }>('/cities').then((r) => r.data),
  });

  const { data: localitiesData } = useQuery({
    queryKey: ['localities', cityId],
    queryFn: () =>
      api.get<{ data: Locality[] }>(`/localities?cityId=${cityId}`).then((r) => r.data),
    enabled: !!cityId,
  });

  const handleTitleChange = useCallback(
    (val: string) => {
      setTitle(val);
      if (mode === 'create') {
        setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
      }
    },
    [mode],
  );

  const handleCityChange = useCallback((val: string) => {
    setCityId(val ? parseInt(val, 10) : null);
    setLocalityId(null);
  }, []);

  // Load existing page for edit mode using the admin endpoint (fetches by ID, incl. drafts)
  const { data: existing } = useQuery({
    queryKey: ['admin-content-page', pageId],
    queryFn: () => api.get<ContentPageFull>(`/content/admin/${pageId}`),
    enabled: mode === 'edit' && !!pageId,
  });

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setSlug(existing.slug);
      setType(existing.type);
      setBody(existing.body);
      setIsPublished(existing.isPublished);
      setCityId(existing.cityId);
      setLocalityId(existing.localityId);
    }
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: (payload: object) =>
      mode === 'create'
        ? api.post<ContentPageFull>('/content', payload)
        : api.put<ContentPageFull>(`/content/${pageId}`, payload),
    onSuccess: () => router.push('/admin/content'),
    onError: (e: unknown) => setError(e instanceof Error ? e.message : 'Save failed'),
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      saveMutation.mutate({ title, slug, type, body, isPublished, cityId, localityId });
    },
    [title, slug, type, body, isPublished, cityId, localityId, saveMutation],
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">{mode === 'create' ? 'New Page' : 'Edit Page'}</h1>
        <div className="flex gap-3">
          <Button onClick={() => setShowPreview((p) => !p)}>
            {showPreview ? 'Editor' : 'Preview'}
          </Button>
          <Button onClick={() => router.push('/admin/content')}>Cancel</Button>
        </div>
      </div>

      {showPreview ? (
        <div className="prose max-w-none rounded-xl border border-border p-6">
          <h1>{title}</h1>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{body}</pre>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              pattern="[a-z0-9-]+"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              {CONTENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                City <span className="text-gray-400">(optional)</span>
              </label>
              <select
                value={cityId ?? ''}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">— No city —</option>
                {citiesData?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Locality <span className="text-gray-400">(optional)</span>
              </label>
              <select
                value={localityId ?? ''}
                onChange={(e) => setLocalityId(e.target.value ? parseInt(e.target.value, 10) : null)}
                disabled={!cityId}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
              >
                <option value="">— No locality —</option>
                {localitiesData?.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Body <span className="text-gray-400">(Markdown)</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={20}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none"
              placeholder="# Heading&#10;&#10;Write your content here..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="isPublished" className="text-sm text-gray-700">Published</label>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
          )}

          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving…' : mode === 'create' ? 'Create Page' : 'Save Changes'}
          </Button>
        </form>
      )}
    </div>
  );
}
