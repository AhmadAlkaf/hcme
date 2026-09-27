import React from 'react';
import { getContactMessagesAction } from '@/actions/contacts.actions';
import { ServerPagination } from '@/components/ui/ServerPagination';
import { buildCorrectedPageHref, parsePaginationParams } from '@/lib/pagination-params';
import { redirect } from 'next/navigation';
import { MessageSquare, Mail, Phone, Calendar } from 'lucide-react';

// Force dynamic rendering to always fetch fresh messages
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ContactMessagesPage({ searchParams }: PageProps) {
  const { page, pageSize, search } = parsePaginationParams(await searchParams);

  // `serverListFetch` already retries an out-of-range page as page 1; redirecting
  // keeps the URL canonical so the link can be re-shared and the footer agrees.
  const result = await getContactMessagesAction({ page, pageSize, search });
  const messages = result?.items ?? [];
  const meta = result?.meta;

  if (meta) {
    const corrected = buildCorrectedPageHref({
      basePath: '/dashboard/contact-messages',
      requestedPage: page,
      meta,
      search,
    });
    if (corrected) redirect(corrected);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between bg-card p-6 rounded-3xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">رسائل التواصل</h1>
            <p className="text-sm text-muted-foreground">استعراض رسائل الزوار والعملاء من نموذج تواصل معنا</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-primary/10 text-primary rounded-full font-bold">
          {meta?.count ?? 0} رسالة
        </div>
      </div>

      <div className="grid gap-4">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={msg.id || index} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-4 border-b border-border/50">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{msg.subject}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {msg.email}</span>
                    <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> <span dir="ltr">{msg.phone}</span></span>
                    {msg.create_at && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(msg.create_at).toLocaleDateString('ar-EG')}</span>}
                  </div>
                </div>
                <div className="px-4 py-1.5 bg-slate-100 text-slate-800 rounded-full text-sm font-bold whitespace-nowrap">
                  المرسل: {msg.name_ar || msg.name_en}
                </div>
              </div>
              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {msg.message}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center gap-4">
            <MessageSquare className="w-12 h-12 opacity-20" />
            <p>لا توجد رسائل تواصل حالياً</p>
          </div>
        )}
      </div>

      {meta && meta.totalPages > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <ServerPagination
            meta={meta}
            basePath="/dashboard/contact-messages"
            idPrefix="contact-messages"
          />
        </div>
      )}
    </div>
  );
}
