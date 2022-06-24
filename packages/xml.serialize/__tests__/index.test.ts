import { serialize } from '../src';
import { TextEncoder } from 'util';

const encoder = new TextEncoder();

describe('xml:serialize', () => {
  describe('boolean', () => {
    it('should create a plist XML true from a `true` Boolean', () => {
      const xml = serialize(true);
      expect(xml).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<true/>
</plist>`);
    });

    it('should create a plist XML false from a `false` Boolean', () => {
      const xml = serialize(false);
      expect(xml).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<false/>
</plist>`);
    });
  });

  describe('string', () => {
    it('should create <string> from a String', () => {
      const xml = serialize('test');
      expect(xml).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<string>test</string>
</plist>`);
    });

    it('should properly encode an empty string', () => {
      const xml = serialize('');
      expect(xml).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<string/>
</plist>`);
    });
  });

  describe('number', () => {
    it('should create <integer> from an integer Number', () => {
      const xml = serialize(3);
      expect(xml).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<integer>3</integer>
</plist>`);
    });

    it('should create <real> from a decimal Number', () => {
      const xml = serialize(Math.PI);
      expect(xml).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<real>3.141592653589793</real>
</plist>`);
    });
  });

  describe('Date', () => {
    it('should create <date> from a Date', () => {
      const xml = serialize(new Date('2010-02-08T21:41:23Z'));
      expect(xml).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<date>2010-02-08T21:41:23Z</date>
</plist>`);
    });
  });

  describe('ArrayBuffer', () => {
    it('should create <data> from an ArrayBuffer', () => {
      const xml = serialize(encoder.encode('☃').buffer);
      expect(xml).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<data>4piD</data>
</plist>`);
    });
  });

  describe('Object', () => {
    it('should create a plist XML dict from an Object', () => {
      const xml = serialize({ foo: 'bar' });
      expect(xml).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict><key>foo</key><string>bar</string></dict>
</plist>`);
    });

    it('should properly encode an empty key', () => {
      const xml = serialize({ '': 'test' });
      expect(xml).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict><key/><string>test</string></dict>
</plist>`);
    });

    it('should properly encode an empty string value', () => {
      const xml = serialize({ a: '' });
      expect(xml).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict><key>a</key><string/></dict>
</plist>`);
    });

    it('should omit undefined and null values', () => {
      const xml = serialize({ a: null });
      expect(xml).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict/>
</plist>`);
    });
  });

  describe('Array', () => {
    it('should create a plist XML array from an Array', () => {
      const xml = serialize([1, 'foo', false, new Date(1234)]);
      expect(xml).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<array><integer>1</integer><string>foo</string><false/><date>1970-01-01T00:00:01Z</date></array>
</plist>`);
    });
  });
});
