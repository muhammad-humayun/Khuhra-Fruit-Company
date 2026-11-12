/**
 * Where the catalogue comes from.
 *
 * `useApi: true` means the shop reads live items and prices from the Web API, so whatever the admin
 * saves in the admin screens is what customers see. The bundled catalogue in `core/data` is kept as
 * a fallback: if the API cannot be reached the shop still renders rather than showing an empty page.
 *
 * Set `useApi` back to false to run the site with no backend at all.
 */
export const APP_CONFIG = {
  useApi: true,

  /**
   * The plain HTTP address from the API's launchSettings.json. Both the "http" and "https" launch
   * profiles bind this port, and the API skips its HTTPS redirect in development, so this works
   * either way without the browser complaining about the development certificate.
   */
  apiBaseUrl: 'http://localhost:5077',
} as const;
