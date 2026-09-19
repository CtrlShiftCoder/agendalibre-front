import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/** Soft mint-white surface — matches theme/colors flujo.surface + app.json splash */
const BRAND_SURFACE = '#F7FAF8';
const BRAND_SURFACE_DARK = '#121814';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es-CL">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>AgendaLibre</title>
        <meta name="theme-color" content={BRAND_SURFACE} />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: ${BRAND_SURFACE};
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: ${BRAND_SURFACE_DARK};
  }
}
/* prefers-reduced-motion: native uses lib/reduceMotion flag; web CSS no-op hook */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
  }
}
`;
