import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.agrosoft.app',
  appName: 'agrosoft',
  webDir: './build',
  server: {
    // Esto es lo único que necesitas para que funcione el login con tu API local
    androidScheme: 'http',
    cleartext: true,
    allowNavigation: ['10.0.2.2']
  }
};

export default config;