import { useAspect, useTexture } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import { SCENE, SOURCE, TEXTURE } from './config';
import { createDepthScanMaterial } from './depth-scan-material';
import type { SceneState } from './scene-state';

export interface DepthFieldProps {
  readonly state: SceneState;
}

/**
 * O plano onde a cena acontece.
 *
 * `useTexture` SUSPENDE até as duas texturas chegarem, e é isso que queremos: o
 * `<Suspense>` do `HeroScene` segura a montagem, então o pipeline de pós-processamento
 * (irmão dele) também não roda antes da hora — nenhum quadro é desenhado com metade
 * dos dados. Enquanto isso, quem está lendo a página vê o herói estático, que já
 * nasceu pronto no HTML pré-renderizado.
 *
 * `useAspect` escala o plano para COBRIR a viewport na proporção da textura; o
 * `SCENE.scale` recua daí para a forma não encostar nas bordas em telas largas.
 */
export function DepthField({ state }: DepthFieldProps) {
  const [colorMap, depthMap] = useTexture([TEXTURE.color, TEXTURE.depth]);

  const material = useMemo(
    () => createDepthScanMaterial(colorMap, depthMap, state),
    [colorMap, depthMap, state],
  );

  /**
   * O material é NOSSO e morre conosco (§10).
   *
   * As texturas não: elas vivem no cache do `useLoader` que o drei compartilha, e
   * descartá-las aqui deixaria o cache apontando para GPU handles mortos — a próxima
   * montagem da cena renderizaria em branco. Quem cria, descarta.
   */
  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  const [width, height] = useAspect(SOURCE.width, SOURCE.height);

  return (
    <mesh scale={[width * SCENE.scale, height * SCENE.scale, 1]} material={material}>
      <planeGeometry />
    </mesh>
  );
}
