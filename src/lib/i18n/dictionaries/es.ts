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

  'hero.eyebrow': 'Desarrolladora Frontend',
  'hero.statement':
    'Construyo interfaces que siguen siendo rápidas y usables en condiciones reales.',
  'hero.intro':
    'Cuatro años de trabajo frontend, la mayor parte en software de punto de venta que se usa todo el día por personas que no pueden detenerse a descifrar una pantalla. Ese contexto me enseñó más sobre rendimiento y claridad que cualquier proyecto personal.',
  'about.statYears': 'Años',
  'about.statCompanies': 'Empresas',
  'experience.current': 'Actual',
  'hero.ctaContact': 'Hablemos',
  'hero.ctaGithub': 'GitHub',

  'about.heading': 'Sobre mí',
  'about.lead':
    'Soy desarrolladora frontend y líder técnica, con más de cuatro años construyendo interfaces accesibles y adaptables con React, React Native y Node.js.',
  'about.body':
    'Actualmente lidero el equipo frontend en Ambit, donde defino la dirección técnica, establezco las prácticas con las que trabajamos y dedico buena parte del tiempo a lo que nadie ve: observabilidad, presupuestos de rendimiento y automatización de pruebas. Ese trabajo es lo que permite que todo lo demás se entregue sin miedo.',
  'about.body2':
    'Me gustan los problemas que premian el cuidado: una interfaz que sigue siendo legible bajo presión, una suite de tests que falla por las razones correctas, un código en el que alguien nuevo pueda moverse desde su primera semana.',
  'about.educationHeading': 'Formación',
  'about.degree': 'Ingeniería en Sistemas Computacionales',
  'about.institution': 'Instituto Tecnológico Superior de Irapuato (ITESI)',
  'about.educationYears': '2017 – 2022',
  'about.educationNote':
    'Participé en el Laboratorio de Divulgación de la Ciencia y la Tecnología, contribuyendo a actividades de divulgación académica y técnica.',

  'skills.heading': 'Tecnologías',
  'skills.lead': 'Lo que uso a diario y con lo que he entregado en producción.',
  'skills.group.languages': 'Lenguajes y frameworks',
  'skills.group.interface': 'Interfaz y diseño',
  'skills.group.testing': 'Pruebas y calidad',
  'skills.group.practice': 'Práctica y herramientas',
  'skills.languagesHeading': 'Idiomas',
  'languages.spanish': 'Español',
  'languages.english': 'Inglés',
  'languages.native': 'Nativo',
  'languages.intermediate': 'Intermedio',

  'experience.heading': 'Experiencia',
  'experience.lead': 'Dónde he trabajado y de qué fui responsable.',
  'experience.present': 'Actualidad',

  'contact.heading': 'Contacto',
  'contact.lead':
    'Abierta a posiciones de frontend y liderazgo técnico. La vía más rápida es el correo.',
  'contact.emailLabel': 'Correo',

  'contact.formHeading': 'Envíame un mensaje',
  'contact.nameLabel': 'Nombre',
  'contact.emailLabel2': 'Correo',
  'contact.messageLabel': 'Mensaje',
  'contact.submit': 'Enviar mensaje',
  'contact.submitting': 'Enviando…',
  'contact.successTitle': 'Mensaje enviado',
  'contact.successBody': 'Gracias — leo todo y te responderé pronto.',
  'contact.sendAnother': 'Enviar otro',
  'contact.errorTitle': 'Algo salió mal',
  'contact.errorBody': 'El mensaje no se envió. Inténtalo de nuevo o escríbeme directamente.',
  'contact.rateLimited': 'Son muchos mensajes seguidos. Espera un minuto e inténtalo otra vez.',
  'contact.errorSummary': 'Revisa los campos marcados abajo.',
  'contact.optionalHint': 'No rellenes este campo',
  'contact.required': 'obligatorio',

  'validation.nameTooShort': 'Escribe al menos 2 caracteres.',
  'validation.nameTooLong': 'Máximo 100 caracteres.',
  'validation.emailInvalid': 'Escribe un correo válido.',
  'validation.emailTooLong': 'Máximo 254 caracteres.',
  'validation.messageTooShort': 'Escribe al menos 20 caracteres.',
  'validation.messageTooLong': 'Máximo 4000 caracteres.',

  'footer.builtWith': 'Construido con Astro, TypeScript y Tailwind CSS.',
  'footer.viewSource': 'Ver código',
  'footer.backToTop': 'Volver arriba',
};
