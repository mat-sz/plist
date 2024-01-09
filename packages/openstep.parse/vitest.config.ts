import { defineProject } from 'vitest/config';

// https://vitejs.dev/config/
export default defineProject(() => ({
  name: '@plist/openstep.parse',
  test: {
    globals: true,
  },
}));
