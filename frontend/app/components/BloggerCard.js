'use client';

import Link from 'next/link';
import { FiHeart } from 'react-icons/fi';

export default function BloggerCard({ blogger, variant = 'default' }) {
  const formatVotes = (n) => {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return n.toString();
  };

  if (variant === 'compact') {
    return (
      <div className="glass rounded-xl p-3 flex items-center gap-3 card-hover">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-bold shrink-0">
          {blogger.rank}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate">{blogger.name}</p>
          <p className="text-xs text-text-muted">{blogger.nickname}</p>
        </div>
        <div className="flex items-center gap-1 text-vote-free shrink-0">
          <FiHeart size={14} className="fill-current" />
          <span className="text-sm font-semibold">{formatVotes(blogger.votes)}</span>
        </div>
      </div>
    );
  }

  const getAvatarSrc = (url) => {
    if (!url) return null;
    // Images like /bloggers/real1.png are served from Next.js public folder
    return url;
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl card-hover bg-surface-card" id={`blogger-card-${blogger.id}`}>
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20"></div>
        
        {/* Avatar image */}
        {blogger.avatar && (
          <img 
            src={getAvatarSrc(blogger.avatar)} 
            alt={blogger.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10"></div>
        
        {/* Category badge */}
        <div className="absolute top-3 left-3 z-20">
          <span className="gradient-bg text-white text-xs font-semibold px-3 py-1 rounded-full">
            {blogger.categoryName || blogger.category || ''}
          </span>
        </div>

        {/* Vote count */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 text-white">
          <FiHeart size={16} className="fill-vote-free text-vote-free" />
          <span className="text-sm font-bold">{formatVotes(blogger.votes)}</span>
        </div>

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
          <h3 className="text-white font-semibold text-base mb-0.5">{blogger.name}</h3>
          <p className="text-text-secondary text-sm">{blogger.nickname}</p>
        </div>
      </div>

      {/* Action buttons - shown on hover */}
      <div className="absolute inset-0 z-30 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50">
        <Link
          href={`/blogger/${blogger.id}`}
          className="gradient-bg text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity"
        >
          Голосовать
        </Link>
        <Link
          href={`/blogger/${blogger.id}`}
          className="glass text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-white/10 transition-colors"
        >
          Подробнее
        </Link>
      </div>
    </div>
  );
}
