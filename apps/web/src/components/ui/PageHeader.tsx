import React from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, breadcrumbs, actions, className = "" }: PageHeaderProps) {
  return (
    <div className={`pb-5 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${className}`}>
      <div className="space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 mb-1">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-zinc-600">/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-zinc-200 transition-colors">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-zinc-300 font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
        {description && <p className="text-xs text-zinc-400">{description}</p>}
      </div>

      {actions && <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">{actions}</div>}
    </div>
  );
}
