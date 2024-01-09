import { defineProject } from 'vitest/config';

// https://vitejs.dev/config/
export default defineProject(() => ({
  name: '@plist/binary.serialize',
  test: {
    globals: true,
  },
}));
