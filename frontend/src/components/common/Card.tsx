import type { ReactNode } from 'react';
import './Card.css';

interface CardProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function Card({ title, description, children }: CardProps) {
  return (
    <article className="card">
      <header>
        <h3>{title}</h3>
        {description && <p className="card__description">{description}</p>}
      </header>
      {children && <div className="card__content">{children}</div>}
    </article>
  );
}
