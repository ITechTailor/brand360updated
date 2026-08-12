import { defineConfig } from 'vite';
import { copyFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const copyStaticHtml = () => ({
  name: 'copy-static-html',
  closeBundle() {
    const root = process.cwd();
    const dist = join(root, 'dist');
    if (!existsSync(dist)) return;
    for (const file of readdirSync(root)) {
      if (file.endsWith('.html') && file !== 'index.html') {
        copyFileSync(join(root, file), join(dist, file));
      }
    }
  }
});

export default defineConfig({
  plugins: [copyStaticHtml()],
  server: {
    host: true,
    port: 5173
  }
});
