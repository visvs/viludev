import type { TranslationKey } from './en';

/**
 * Typed against the English key set, so omitting or inventing a key fails the
 * type check rather than silently rendering the wrong string.
 */
export const es: Record<TranslationKey, string> = {
  'nav.about': 'Sobre mí',
  'nav.skills': 'Tecnologías',
  'nav.experience': 'Experiencia',
  'nav.contact': 'Contacto',

  'a11y.skipToContent': 'Saltar al contenido',
  'a11y.mainNavigation': 'Navegación principal',
  'a11y.toggleTheme': 'Cambiar entre tema claro y oscuro',
  'a11y.openMenu': 'Abrir menú',
  'a11y.closeMenu': 'Cerrar menú',
  'a11y.switchLanguage': 'Cambiar idioma',

  'meta.title': 'Violeta Vera Salazar — Desarrolladora Frontend',
  'meta.description':
    'Desarrolladora frontend y líder técnica con más de cuatro años construyendo interfaces accesibles y de alto rendimiento con React, TypeScript y React Native.',

  'footer.builtWith': 'Construido con Astro, TypeScript y Tailwind CSS.',
  'footer.viewSource': 'Ver código',
  'footer.backToTop': 'Volver arriba',
};
