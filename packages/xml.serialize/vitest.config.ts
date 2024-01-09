import { defineProject } from 'vitest/config';

// https://vitejs.dev/config/
export default defineProject(() => ({
  name: '@plist/xml.serialize',
  test: {
    globals: true,
  },
}));
