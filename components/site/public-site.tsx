'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { Property, SiteContent } from '@/lib/content';
import { PropertyCard } from './property-card';

function whatsappUrl(content: SiteContent, message = content.business.whatsappMessage) {
  return `https://wa.me/${content.business.whatsapp}?text=${encodeURIComponent(message)}`;
}

function propertyWhatsappUrl(content: SiteContent, property: Property) {
  return whatsappUrl(content, `Hola, me interesa la propiedad “${property.title}” en ${property.location}. ¿Podrían compartir disponibilidad y coordinar una visita?`);
}

function PropertyModal({ content, property, onClose }: { content: SiteContent; property: Property; onClose: () => void }) {
  return (
    <div className="property-modal" role="presentation" onClick={onClose}>
      <article className="property-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="property-modal-title" onClick={(event) => event.stopPropagation()}>
        <div className="property-modal__visual"><Image src={property.image} alt={property.imageAlt} fill sizes="(max-width: 800px) 100vw, 48vw" className="property-modal__image" unoptimized /><span className="property-modal__tag">{property.tag}</span></div>
        <div className="property-modal__body"><button className="property-modal__close" type="button" onClick={onClose} aria-label="Cerrar detalles">×</button><p className="eyebrow">Ficha de propiedad</p><h2 id="property-modal-title">{property.title}</h2><p className="property-modal__location">{property.location}</p><p className="property-modal__description">{property.description}</p><dl className="property-modal__facts"><div><dt>Precio</dt><dd>{property.price}</dd></div><div><dt>Características</dt><dd>{property.details}</dd></div></dl><a className="button button--dark property-modal__cta" href={propertyWhatsappUrl(content, property)} target="_blank" rel="noreferrer">Consultar por WhatsApp <span>↗</span></a><p className="property-modal__hint">Te responderemos con disponibilidad, fotos y opciones para visitar.</p></div>
      </article>
    </div>
  );
}

export function PublicSite({ content }: { content: SiteContent }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const heroSlides = content.hero.slides?.length ? content.hero.slides : [{ image: content.hero.image, imageAlt: content.hero.imageAlt, label: 'Una mirada más humana' }];
  const currentHeroSlide = heroSlides[activeSlide] ?? heroSlides[0];
  const closeMenu = () => setMenuOpen(false);
  const chatUrl = whatsappUrl(content);

  useEffect(function rotateHeroSlides() {
    const interval = window.setInterval(function advanceHeroSlide() {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 3500);

    return () => window.clearInterval(interval);
  }, [heroSlides.length]);

  return (
    <>
      <main className="site-shell">
        <div className="demo-strip">{content.demoNotice}</div>
        <header className="site-header">
          <a className="brand" href="#inicio" onClick={closeMenu} aria-label="Ir al inicio"><span className="brand__mark">CN</span><span className="brand__name">{content.business.name}</span></a>
          <div className="site-header__social" aria-label="Redes sociales"><a href={content.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook de Cumbre Norte"><Image src="https://cdn.simpleicons.org/facebook/10231f" alt="" width={15} height={15} unoptimized /></a><a href={content.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram de Cumbre Norte"><Image src="https://cdn.simpleicons.org/instagram/10231f" alt="" width={15} height={15} unoptimized /></a><a href={content.social.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok de Cumbre Norte"><Image src="https://cdn.simpleicons.org/tiktok/10231f" alt="" width={15} height={15} unoptimized /></a></div><button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="site-navigation" onClick={() => setMenuOpen((open) => !open)}><span>{menuOpen ? 'Cerrar' : 'Menú'}</span><span className="menu-toggle__lines" aria-hidden="true"><i /><i /></span></button>
          <nav id="site-navigation" className={`site-nav${menuOpen ? ' site-nav--open' : ''}`} aria-label="Navegación principal"><a href="#propiedades" onClick={closeMenu}>Propiedades</a><a href="#visitanos" onClick={closeMenu}>Visítanos</a><a className="site-nav__cta" href={chatUrl} target="_blank" rel="noreferrer" onClick={closeMenu}>Hablemos <span>↗</span></a></nav>
        </header>

        <section id="inicio" className="hero-section"><div className="hero-section__content"><p className="eyebrow">{content.business.eyebrow}</p><h1>{content.hero.title}</h1><p className="hero-section__subtitle">{content.hero.subtitle}</p><div className="hero-section__actions"><a className="button button--dark" href="#propiedades">{content.hero.primaryCta} <span>↓</span></a><a className="text-link" href={chatUrl} target="_blank" rel="noreferrer">{content.hero.secondaryCta} <span>↗</span></a></div></div><div className="hero-section__visual" role="region" aria-roledescription="carousel" aria-label="Galería de Cumbre Norte">{heroSlides.map((slide, index) => <Image key={slide.image} src={slide.image} alt={slide.imageAlt} fill priority={index === 0} sizes="(max-width: 767px) 100vw, 55vw" className={`hero-section__image${index === activeSlide ? ' hero-section__image--active' : ''}`} unoptimized />)}<div className="hero-section__caption"><span>{String(activeSlide + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}</span><span>{currentHeroSlide.label}</span></div><div className="hero-section__dots" aria-label="Seleccionar imagen">{heroSlides.map((slide, index) => <button className={`hero-section__dot${index === activeSlide ? ' hero-section__dot--active' : ''}`} type="button" key={slide.image} aria-label={`Ver imagen ${index + 1}`} aria-current={index === activeSlide} onClick={() => setActiveSlide(index)} />)}</div></div></section>

        <section className="stats-section" aria-label="Cumbre Norte en cifras">{content.stats.map((stat) => <div className="stat" key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</section>

        <section id="propiedades" className="properties-section section-padding"><div className="section-heading"><div><p className="eyebrow">Selección actual</p><h2>Propiedades con algo que decir.</h2></div><p className="section-heading__note">Una colección breve de espacios que combinan buena arquitectura, ubicación y potencial. Haz clic en una propiedad para conocerla mejor.</p></div><div className="property-grid">{content.featuredProperties.map((property) => <PropertyCard key={property.id} property={property} onSelect={setSelectedProperty} />)}</div><div className="section-end-link"><a className="text-link" href={chatUrl} target="_blank" rel="noreferrer">Solicitar catálogo completo <span>↗</span></a></div></section>

        <section className="services-section section-padding"><div className="section-heading section-heading--services"><div><p className="eyebrow">Cómo ayudamos</p><h2>Claridad en cada paso.</h2></div><span className="section-heading__index">03 / 04</span></div><div className="services-list">{content.services.map((service) => <div className="service-row" key={service.number}><span className="service-row__number">{service.number}</span><h3>{service.title}</h3><p>{service.description}</p><span className="service-row__arrow" aria-hidden="true">↗</span></div>)}</div></section>

        <section className="gallery-section section-padding"><div className="section-heading"><div><p className="eyebrow">Detalles que importan</p><h2>Espacios para mirar despacio.</h2></div><p className="section-heading__note">La belleza de una propiedad también vive en sus materiales, su luz y la forma en que se recorre.</p></div><div className="gallery-grid">{content.gallery.map((item, index) => <div className={`gallery-item gallery-item--${index + 1}`} key={item.image}><Image src={item.image} alt={item.alt} fill sizes="(max-width: 767px) 92vw, 33vw" className="gallery-item__image" unoptimized /></div>)}</div></section>

        <section id="visitanos" className="location-section section-padding"><div className="location-section__copy"><p className="eyebrow">Pasa a saludar</p><h2>{content.location.title}</h2><p className="body-copy">{content.location.description}</p><div className="contact-detail"><span>Dirección</span><strong>{content.business.address}</strong></div><div className="contact-detail"><span>Horario</span><strong>{content.business.hours}</strong></div><a className="button button--dark" href={chatUrl} target="_blank" rel="noreferrer">Agendar conversación <span>↗</span></a></div><div className="map-frame"><iframe title={`Mapa de ${content.location.mapQuery}`} src={content.location.mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div></section>

        <footer className="site-footer"><div className="site-footer__top"><div><a className="brand brand--footer" href="#inicio"><span className="brand__mark">CN</span><span className="brand__name">{content.business.name}</span></a><p>{content.business.description}</p></div><div className="site-footer__links"><a href={`mailto:${content.business.email}`}>{content.business.email}</a><a href={`tel:${content.business.phone.replace(/\s/g, '')}`}>{content.business.phone}</a></div><div className="site-footer__social"><p className="site-footer__social-label">Redes sociales</p><div className="site-footer__social-links"><a href={content.social.instagram} target="_blank" rel="noreferrer" aria-label="Visitar Instagram de Cumbre Norte">Instagram <span>↗</span></a><a href={content.social.facebook} target="_blank" rel="noreferrer" aria-label="Visitar Facebook de Cumbre Norte">Facebook <span>↗</span></a><a href={content.social.tiktok} target="_blank" rel="noreferrer" aria-label="Visitar TikTok de Cumbre Norte">TikTok <span>↗</span></a></div></div></div><div className="site-footer__bottom"><span>© 2026 {content.business.name}</span><span>Hecho para elegir mejor.</span><a href="#inicio">Volver arriba ↑</a></div></footer>
      </main>
      {selectedProperty ? <PropertyModal content={content} property={selectedProperty} onClose={() => setSelectedProperty(null)} /> : null}
      <a className="whatsapp-float" href={chatUrl} target="_blank" rel="noreferrer" aria-label="Escribir por WhatsApp"><Image className="whatsapp-float__icon" src="https://cdn.simpleicons.org/whatsapp/ffffff" alt="" width={25} height={25} unoptimized /></a>
    </>
  );
}
