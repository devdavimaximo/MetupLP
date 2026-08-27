import gsap from 'gsap';
import { useRef, useState } from 'react';
import { DURATION, EASE, gsapEase, registerMotion, type EaseName } from '../../animations/motion';
import { fadeIn, fadeUp, maskReveal, type MotionPreset } from '../../animations/presets';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const EASE_NAMES = Object.keys(EASE) as readonly EaseName[];

const PRESETS: readonly { name: string; preset: MotionPreset }[] = [
  { name: 'fadeUp', preset: fadeUp() },
  { name: 'fadeIn', preset: fadeIn() },
  { name: 'maskReveal', preset: maskReveal() },
];

function EaseTrack({ name }: { name: EaseName }) {
  const dot = useRef<HTMLDivElement>(null);

  const play = (): void => {
    if (dot.current === null) return;
    registerMotion();
    gsap.fromTo(
      dot.current,
      { xPercent: 0 },
      { xPercent: 0, x: 'calc(100% - 1.75rem)', duration: DURATION.slow, ease: gsapEase(name) },
    );
    gsap.to(dot.current, { x: 0, duration: DURATION.fast, delay: DURATION.slow + 0.3 });
  };

  return (
    <div>
      <div className="sg-row" style={{ justifyContent: 'space-between', marginBottom: '0.375rem' }}>
        <span className="sg-label">metup.{name}</span>
        <button type="button" className="sg-button" onClick={play}>
          tocar
        </button>
      </div>
      <div className="sg-track">
        <div ref={dot} className="sg-dot" />
      </div>
    </div>
  );
}

function PresetDemo({ name, preset, forceCalm }: { name: string; preset: MotionPreset; forceCalm: boolean }) {
  const scope = useRef<HTMLDivElement>(null);

  const play = (): void => {
    if (scope.current === null) return;
    registerMotion();
    const variant = forceCalm ? preset.calm : preset.full;
    const targets = gsap.utils.toArray<HTMLElement>('[data-demo]', scope.current);
    gsap.fromTo(targets, variant.from, { ...variant.to, ease: gsapEase('out') });
  };

  return (
    <div>
      <div className="sg-row" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span className="sg-label">
          {name} · {forceCalm ? 'calm' : 'full'}
        </span>
        <button type="button" className="sg-button" onClick={play}>
          tocar
        </button>
      </div>
      <div ref={scope} className="sg-row" style={{ gap: '0.5rem' }}>
        {[0, 1, 2].map((index) => (
          <div key={index} data-demo className="sg-box" style={{ width: '3.5rem', height: '3.5rem' }}>
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * O toggle força a variante calma sem precisar mexer na configuração do sistema
 * operacional — sem isso, ninguém testa `prefers-reduced-motion` de verdade.
 *
 * O que conferir na variante calma: os blocos AINDA aparecem. Se algum ficasse em
 * `opacity: 0`, o conteúdo sumiria de vez para quem pediu movimento reduzido.
 */
export function MotionPanel() {
  const systemReduce = useReducedMotion();
  const [forceCalm, setForceCalm] = useState(false);

  return (
    <section className="sg-section" id="motion">
      <h2>Motion</h2>

      <div className="sg-controls">
        <button type="button" className="sg-button" onClick={() => { setForceCalm((value) => !value); }}>
          {forceCalm ? 'usando: calm' : 'usando: full'} — alternar
        </button>
        <span className="sg-label">
          sistema: {systemReduce ? 'prefers-reduced-motion ATIVO' : 'movimento permitido'}
        </span>
      </div>

      <div className="sg-stack">
        <div>
          <p className="sg-label" style={{ marginBottom: '0.75rem' }}>
            Curvas registradas no GSAP — resolvidas com a mesma matemática do cubic-bezier() do
            CSS, sem CustomEase, para não haver divergência entre as duas camadas
          </p>
          <div className="sg-grid">
            {EASE_NAMES.map((name) => (
              <EaseTrack key={name} name={name} />
            ))}
          </div>
        </div>

        <div>
          <p className="sg-label" style={{ marginBottom: '0.75rem' }}>
            Presets — cada um obrigado pelo tipo a ter par full/calm
          </p>
          <div className="sg-grid">
            {PRESETS.map((item) => (
              <PresetDemo
                key={item.name}
                name={item.name}
                preset={item.preset}
                forceCalm={forceCalm}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
