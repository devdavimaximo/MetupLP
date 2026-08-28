import { defineConfig, type Plugin, type UserConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import type { ViteReactSSGOptions } from 'vite-react-ssg';

/** Módulo que vira o chunk da cena do herói. Casado pelo fim do caminho. */
const SCENE_MODULE = 'src/three/hero/HeroScene.tsx';

/** Onde a URL é anotada. Espelhado em `CHUNK_META`, em `src/hooks/useHeroScene.ts`. */
const CHUNK_META = 'metup:hero-scene';

/**
 * Anota no HTML a URL COM HASH do chunk da cena.
 *
 * `useHeroScene` precisa desse endereço para dar `<link rel="prefetch">` logo após o
 * `load` — baixar a cena sem executá-la, tirando ~1,2 s do tempo até ela aparecer no
 * celular (o porquê completo está no cabeçalho daquele arquivo). O nome do arquivo só
 * existe depois do bundle, então nem o HTML nem o hook podem escrevê-lo à mão.
 *
 * ⚠ Um `<link rel="prefetch">` ESTÁTICO aqui no HTML seria mais simples e estaria
 * errado: ele dispararia junto com o carregamento da página, disputando banda com a
 * fonte e o CSS da primeira dobra num celular. A anotação é passiva — quem decide a
 * hora é o hook, depois do `load`.
 *
 * Se o módulo mudar de lugar, o `find` abaixo devolve `undefined`, nenhuma meta é
 * escrita e o hook segue sem prefetch — mais lento, nunca quebrado.
 */
function heroScenePrefetch(): Plugin {
  let base = '/';

  return {
    name: 'metup:hero-scene-prefetch',
    apply: 'build',

    configResolved(config) {
      base = config.base;
    },

    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        if (ctx.bundle === undefined) return;

        for (const item of Object.values(ctx.bundle)) {
          if (item.type !== 'chunk') continue;

          const id = item.facadeModuleId;
          if (id === null || id === undefined) continue;
          if (!id.replaceAll('\\', '/').endsWith(SCENE_MODULE)) continue;

          return [
            {
              tag: 'meta',
              attrs: { name: CHUNK_META, content: `${base}${item.fileName}` },
              injectTo: 'head',
            },
          ];
        }

        return;
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin(), tailwindcss(), heroScenePrefetch()],
    server: {
        port: 59788,
    },
    ssgOptions: {
        script: 'async',
        formatting: 'none',
    },
} satisfies UserConfig & { ssgOptions: Partial<ViteReactSSGOptions> })
