'use client';

import Image from 'next/image';
import type { Property } from '@/lib/content';

type PropertyCardProps = {
  property: Property;
  onSelect: (property: Property) => void;
};

export function PropertyCard({ property, onSelect }: PropertyCardProps) {
  return (
    <button className="property-card" type="button" aria-label={`Ver detalles de ${property.title}`} onClick={() => onSelect(property)}>
      <div className="property-card__image-wrap">
        <Image src={property.image} alt={property.imageAlt} fill sizes="(max-width: 767px) 92vw, (max-width: 1100px) 45vw, 30vw" className="property-card__image" unoptimized />
        <span className="property-card__tag">{property.tag}</span>
        <span className="property-card__arrow" aria-hidden="true">↗</span>
      </div>
      <div className="property-card__body">
        <div><h3>{property.title}</h3><p>{property.location}</p></div>
        <div className="property-card__meta"><strong>{property.price}</strong><span>{property.details}</span></div>
      </div>
    </button>
  );
}
