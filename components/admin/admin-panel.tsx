'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { siteContent, type SiteContent } from '@/lib/content';
import { ActiveEditor, editorSections, type EditorActions, type EditorSectionId } from './admin-editors';

type Notice = { tone: 'success' | 'error' | 'info'; text: string } | null;

function copyContent() {
  return JSON.parse(JSON.stringify(siteContent)) as SiteContent;
}

function LoginPanel({ busy, notice, onLogin }: { busy: boolean; notice: Notice; onLogin: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <main className="admin-shell admin-shell--login">
      <div className="admin-login">
        <Link className="brand" href="/" aria-label="Volver a Cumbre Norte">
          <span className="brand__mark">CN</span>
          <span className="brand__name">Cumbre Norte</span>
        </Link>
        <p className="eyebrow">Área privada</p>
        <h1>Editar la página</h1>
        <p className="admin-lead">Administra fotos, propiedades, servicios, textos y datos de contacto desde un solo lugar.</p>
        <form onSubmit={onLogin} className="admin-form">
          <label>
            <span>Usuario</span>
            <input name="username" autoComplete="username" required maxLength={80} />
          </label>
          <label>
            <span>Contraseña</span>
            <input name="password" type="password" autoComplete="current-password" required minLength={8} />
          </label>
          <button className="button button--dark" type="submit" disabled={busy}>
            {busy ? 'Validando…' : 'Iniciar sesión'} <span>↗</span>
          </button>
        </form>
        {notice ? <p className={`admin-notice admin-notice--${notice.tone}`} role={notice.tone === 'error' ? 'alert' : 'status'} aria-live="polite">{notice.text}</p> : null}
        <Link className="admin-back" href="/">← Volver a la web pública</Link>
      </div>
    </main>
  );
}

export function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [activeSection, setActiveSection] = useState<EditorSectionId>('contact');

  useEffect(function restoreAdminSession() {
    let cancelled = false;

    async function checkSession() {
      try {
        const response = await fetch('/api/admin/content', { cache: 'no-store' });
        if (!cancelled && response.ok) {
          setLoggedIn(true);
          setContent(copyContent());
        }
      } catch {
        // La pantalla de acceso sigue disponible aunque la comprobación no responda.
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    }

    void checkSession();
    return function cancelSessionCheck() {
      cancelled = true;
    };
  }, []);

  useEffect(function protectUnsavedChanges() {
    if (!dirty) return;

    function warnBeforeLeaving(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = '';
    }

    window.addEventListener('beforeunload', warnBeforeLeaving);
    return function removeLeaveWarning() {
      window.removeEventListener('beforeunload', warnBeforeLeaving);
    };
  }, [dirty]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setNotice(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.get('username'), password: form.get('password') }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        setNotice({ tone: 'error', text: result.error || 'No se pudo iniciar sesión.' });
        return;
      }
      setLoggedIn(true);
      setContent(copyContent());
      setDirty(false);
      setNotice({ tone: 'success', text: 'Sesión iniciada. Ya puedes editar todo el contenido.' });
    } catch {
      setNotice({ tone: 'error', text: 'No se pudo conectar con el servidor.' });
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    if (dirty && !window.confirm('Tienes cambios sin guardar. ¿Quieres cerrar sesión y descartarlos?')) return;
    await fetch('/api/auth/logout', { method: 'POST' });
    setLoggedIn(false);
    setContent(null);
    setDirty(false);
    setNotice(null);
  }

  function markDirty() {
    setDirty(true);
  }

  function updateBusiness(field: keyof SiteContent['business'], value: string) {
    setContent((current) => current ? { ...current, business: { ...current.business, [field]: value } } : current);
    markDirty();
  }

  function updateHero(field: Exclude<keyof SiteContent['hero'], 'slides'>, value: string) {
    setContent((current) => current ? { ...current, hero: { ...current.hero, [field]: value } } : current);
    markDirty();
  }

  function updateHeroSlide(index: number, field: 'image' | 'imageAlt' | 'label', value: string) {
    setContent((current) => {
      if (!current) return current;
      const slides = current.hero.slides?.length
        ? [...current.hero.slides]
        : [{ image: current.hero.image, imageAlt: current.hero.imageAlt, label: 'Una mirada más humana' }];
      slides[index] = { ...slides[index], [field]: value };
      return {
        ...current,
        hero: {
          ...current.hero,
          image: index === 0 && field === 'image' ? value : current.hero.image,
          imageAlt: index === 0 && field === 'imageAlt' ? value : current.hero.imageAlt,
          slides,
        },
      };
    });
    markDirty();
  }

  function updateProperty(index: number, field: keyof SiteContent['featuredProperties'][number], value: string) {
    setContent((current) => current ? { ...current, featuredProperties: current.featuredProperties.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) } : current);
    markDirty();
  }

  function updateGallery(index: number, field: keyof SiteContent['gallery'][number], value: string) {
    setContent((current) => current ? { ...current, gallery: current.gallery.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) } : current);
    markDirty();
  }

  function updateService(index: number, field: keyof SiteContent['services'][number], value: string) {
    setContent((current) => current ? { ...current, services: current.services.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) } : current);
    markDirty();
  }

  function updateStat(index: number, field: keyof SiteContent['stats'][number], value: string) {
    setContent((current) => current ? { ...current, stats: current.stats.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) } : current);
    markDirty();
  }

  function updateAbout(field: keyof SiteContent['about'], value: string) {
    setContent((current) => current ? { ...current, about: { ...current.about, [field]: value } } : current);
    markDirty();
  }

  function updateLocation(field: keyof SiteContent['location'], value: string) {
    setContent((current) => current ? { ...current, location: { ...current.location, [field]: value } } : current);
    markDirty();
  }

  function updateSocial(field: keyof SiteContent['social'], value: string) {
    setContent((current) => current ? { ...current, social: { ...current.social, [field]: value } } : current);
    markDirty();
  }

  function updateSeo(field: keyof SiteContent['seo'], value: string) {
    setContent((current) => current ? { ...current, seo: { ...current.seo, [field]: value } } : current);
    markDirty();
  }

  function updateNotice(value: string) {
    setContent((current) => current ? { ...current, demoNotice: value } : current);
    markDirty();
  }

  function addProperty() {
    setContent((current) => current ? {
      ...current,
      featuredProperties: [...current.featuredProperties, {
        id: `propiedad-${Date.now()}`,
        tag: 'Propiedad · Venta',
        title: 'Nueva propiedad',
        location: 'Lima, Perú',
        price: 'US$ 0',
        details: 'Completa los detalles',
        description: 'Describe aquí la propiedad para tus visitantes.',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=86',
        imageAlt: 'Imagen de la nueva propiedad',
      }],
    } : current);
    markDirty();
  }

  function removeProperty(index: number) {
    if (!window.confirm('¿Eliminar esta propiedad? El cambio se aplicará cuando guardes.')) return;
    setContent((current) => current ? { ...current, featuredProperties: current.featuredProperties.filter((_, itemIndex) => itemIndex !== index) } : current);
    markDirty();
  }

  function addGallery() {
    setContent((current) => current ? { ...current, gallery: [...current.gallery, { image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=86', alt: 'Nuevo espacio de la propiedad' }] } : current);
    markDirty();
  }

  function removeGallery(index: number) {
    if (!window.confirm('¿Eliminar esta foto? El cambio se aplicará cuando guardes.')) return;
    setContent((current) => current ? { ...current, gallery: current.gallery.filter((_, itemIndex) => itemIndex !== index) } : current);
    markDirty();
  }

  function addService() {
    setContent((current) => current ? { ...current, services: [...current.services, { number: String(current.services.length + 1).padStart(2, '0'), title: 'Nuevo servicio', description: 'Describe este servicio para tus visitantes.' }] } : current);
    markDirty();
  }

  function removeService(index: number) {
    if (!window.confirm('¿Eliminar este servicio? El cambio se aplicará cuando guardes.')) return;
    setContent((current) => current ? { ...current, services: current.services.filter((_, itemIndex) => itemIndex !== index) } : current);
    markDirty();
  }

  async function uploadImage(file: File, onUploaded: (url: string) => void) {
    setBusy(true);
    setNotice({ tone: 'info', text: 'Subiendo imagen…' });

    try {
      const form = new FormData();
      form.append('file', file);
      const response = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const result = await response.json() as { error?: string; url?: string };
      if (!response.ok || !result.url) {
        setNotice({ tone: 'error', text: result.error || 'No se pudo subir la imagen.' });
        return;
      }
      onUploaded(result.url);
      setNotice({ tone: 'success', text: 'Imagen cargada. Guarda los cambios para publicarla.' });
    } catch {
      setNotice({ tone: 'error', text: 'No se pudo conectar con el servidor de imágenes.' });
    } finally {
      setBusy(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!content || busy) return;
    if (!form.checkValidity()) {
      form.reportValidity();
      setNotice({ tone: 'error', text: 'Revisa los campos de esta sección antes de guardar.' });
      return;
    }

    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      const result = await response.json() as { error?: string; message?: string };
      if (response.ok) {
        setDirty(false);
        setNotice({ tone: 'success', text: result.message || 'Cambios guardados correctamente.' });
      } else {
        setNotice({ tone: 'error', text: result.error || 'No se pudieron guardar los cambios.' });
      }
    } catch {
      setNotice({ tone: 'error', text: 'No se pudo conectar con el servidor. Tus cambios siguen en pantalla.' });
    } finally {
      setBusy(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="admin-shell admin-shell--login" aria-busy="true">
        <div className="admin-login admin-login--loading">
          <p className="eyebrow">Área privada</p>
          <p role="status">Comprobando acceso…</p>
        </div>
      </main>
    );
  }

  if (!loggedIn || !content) return <LoginPanel busy={busy} notice={notice} onLogin={login} />;

  const currentSection = editorSections.find((section) => section.id === activeSection) || editorSections[0];
  const actions: EditorActions = {
    updateBusiness,
    updateHero,
    updateHeroSlide,
    updateProperty,
    updateGallery,
    updateService,
    updateStat,
    updateAbout,
    updateLocation,
    updateSocial,
    updateSeo,
    updateNotice,
    addProperty,
    removeProperty,
    addGallery,
    removeGallery,
    addService,
    removeService,
    uploadHero: (index, file) => void uploadImage(file, (url) => updateHeroSlide(index, 'image', url)),
    uploadProperty: (index, file) => void uploadImage(file, (url) => updateProperty(index, 'image', url)),
    uploadGallery: (index, file) => void uploadImage(file, (url) => updateGallery(index, 'image', url)),
    uploadAbout: (file) => void uploadImage(file, (url) => updateAbout('image', url)),
  };

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <Link className="brand" href="/" aria-label="Volver a Cumbre Norte">
          <span className="brand__mark">CN</span>
          <span className="brand__name">Cumbre Norte</span>
        </Link>
        <div className="admin-header__actions">
          <Link href="/" target="_blank" rel="noreferrer">Ver página ↗</Link>
          <button type="button" onClick={logout}>Cerrar sesión</button>
        </div>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <p className="eyebrow">Panel privado</p>
          <h1>Contenido web</h1>
          <p>Edita cada parte del sitio desde su propia sección.</p>
          <nav className="admin-section-nav" aria-label="Secciones del editor">
            {editorSections.map((section) => (
              <button
                className={`admin-section-nav__item${section.id === activeSection ? ' admin-section-nav__item--active' : ''}`}
                type="button"
                key={section.id}
                aria-current={section.id === activeSection ? 'page' : undefined}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="admin-section-nav__number">{section.number}</span>
                <span className="admin-section-nav__copy">
                  <strong>{section.label}</strong>
                  <small>{section.description}</small>
                </span>
                <span className="admin-section-nav__arrow" aria-hidden="true">→</span>
              </button>
            ))}
          </nav>
          <span className="admin-sidebar__status"><i /> Sesión segura</span>
        </aside>

        <form className="admin-editor" onSubmit={save}>
          <div className="admin-editor__intro">
            <div>
              <p className="eyebrow">{currentSection.number} · Editor de contenido</p>
              <h2>{currentSection.label}</h2>
              <p className="admin-editor__description">{currentSection.description}</p>
            </div>
            <div className="admin-editor__actions">
              <span className={`admin-editor__state${dirty ? ' admin-editor__state--dirty' : ''}`} role="status">
                {dirty ? 'Cambios sin guardar' : 'Todo guardado'}
              </span>
              <button className="button button--dark" type="submit" disabled={busy}>
                {busy ? 'Guardando…' : 'Guardar cambios'} <span>↓</span>
              </button>
            </div>
          </div>
          {notice ? <p className={`admin-notice admin-notice--${notice.tone}`} role={notice.tone === 'error' ? 'alert' : 'status'} aria-live="polite">{notice.text}</p> : null}
          <div className="admin-section-stage">
            <ActiveEditor section={activeSection} content={content} busy={busy} actions={actions} />
          </div>
          <div className="admin-editor__bottom">
            <p>{dirty ? 'Tienes cambios pendientes. Pulsa “Guardar cambios” para publicarlos.' : 'Los cambios de esta sección se guardan junto con el contenido completo.'}</p>
          </div>
        </form>
      </div>
    </main>
  );
}
