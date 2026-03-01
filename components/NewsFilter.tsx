'use client';

import {useState} from 'react';
import Image from 'next/image';

interface Article {
  title: string;
  date: string;
  categories: string[];
  excerpt: string;
  slug: string;
  image?: string;
  externalUrl?: string;
}

interface NewsFilterProps {
  articles: Article[];
  allLabel: string;
  readMoreLabel: string;
  noArticlesLabel: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export function NewsFilter({
  articles,
  allLabel,
  readMoreLabel,
  noArticlesLabel,
}: NewsFilterProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [page, setPage] = useState(0);
  const ARTICLES_PER_PAGE = 4;

  const categories = ['all', ...Array.from(new Set(articles.flatMap((a) => a.categories)))];

  const filtered =
    activeCategory === 'all'
      ? articles
      : articles.filter((a) => a.categories.includes(activeCategory));

  const totalPages = Math.ceil(filtered.length / ARTICLES_PER_PAGE);
  const paginated = filtered.slice(
    page * ARTICLES_PER_PAGE,
    (page + 1) * ARTICLES_PER_PAGE
  );

  function handleCategoryChange(cat: string) {
    setActiveCategory(cat);
    setPage(0);
  }

  return (
    <div>
      {/* Category filter bar */}
      <div className="flex flex-wrap gap-3 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-5 py-2 text-sm font-semibold transition-colors border-b-2 ${
              activeCategory === cat
                ? 'text-brand border-brand'
                : 'text-muted-foreground border-transparent hover:text-brand hover:border-brand'
            }`}
          >
            {cat === 'all' ? allLabel : cat}
          </button>
        ))}
      </div>

      {/* Article cards - alternating layout */}
      {paginated.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">{noArticlesLabel}</p>
      ) : (
        <div className="flex flex-col gap-8">
          {paginated.map((article, index) => {
            const isEven = index % 2 === 1;
            return (
              <article
                key={article.slug}
                className="flex flex-col md:flex-row bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] overflow-hidden"
              >
                {/* Image */}
                {article.image && (
                  <div
                    className={`md:w-1/2 relative min-h-[250px] md:min-h-[300px] ${
                      isEven ? 'md:order-2' : ''
                    }`}
                  >
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                )}

                {/* Content */}
                <div
                  className={`md:w-1/2 p-8 flex flex-col justify-center ${
                    !article.image ? 'md:w-full' : ''
                  } ${isEven ? 'md:order-1' : ''}`}
                >
                  <p className="text-sm text-muted-foreground mb-2">
                    {formatDate(article.date)}
                  </p>
                  <h3 className="text-xl md:text-2xl font-bold text-[rgb(30,90,100)] mb-3 leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {article.categories.join(', ')}
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {article.excerpt}
                  </p>
                  {article.externalUrl && (
                    <a
                      href={article.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-brand text-white px-6 py-2.5 text-sm font-semibold hover:bg-brand/90 transition-colors self-start"
                    >
                      {readMoreLabel}
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          {Array.from({length: totalPages}, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-10 h-10 rounded-full text-sm font-semibold transition-colors ${
                page === i
                  ? 'bg-brand text-white'
                  : 'bg-white text-foreground border border-border hover:bg-brand hover:text-white'
              }`}
            >
              {i + 1}
            </button>
          ))}
          {page < totalPages - 1 && (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-5 py-2 rounded-full bg-white text-foreground font-semibold border border-border hover:bg-brand hover:text-white transition-colors ml-2"
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
}
