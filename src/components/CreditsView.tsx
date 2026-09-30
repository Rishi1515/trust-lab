import { APP_VERSION, BUILD_SHA, REPOSITORY_URL, SCENARIO_BANK_VERSION } from '../app/version';
import { PageTitle } from './PageTitle';
import { Sprite, type SpriteName } from './Sprite';

const ART: { name: SpriteName; file: string; source: string; use: string; alt: string }[] = [
  { name: 'idle', file: 'cal-idle.png', source: 'skelly.png', use: 'Cal at rest beside every screen', alt: 'Cal, a small pale skeleton, standing at rest.' },
  { name: 'attack', file: 'cal-audit-strike.png', source: 'Skeleton_01_White_Attack1.png', use: 'Audit strike, after overruling confident wrong advice', alt: 'A skeleton mid-lunge with a thin sword.' },
  { name: 'die', file: 'cal-collapse.png', source: 'Skeleton_01_White_Die.png', use: 'Collapse, after accepting confident wrong advice (once per run)', alt: 'A skeleton collapsed into a heap of bones.' },
  { name: 'skull', file: 'risk-skull.png', source: 'skull1-sheet.png', use: 'Risk marker beside accepted wrong advice', alt: 'A small floating skull.' },
  { name: 'torch', file: 'torch.png', source: 'torch.png', use: 'Opening screen accent, beside Cal', alt: 'A standing brazier with a flame.' },
  { name: 'torch2', file: 'torch2.png', source: 'torch2.png', use: 'Midpoint accent', alt: 'A standing brazier with a flame and a cast shadow.' },
];

export function CreditsView({ backHref }: { backHref: string }) {
  return (
    <div className="content prose">
      <p className="mono eyebrow">Credits</p>
      <PageTitle>Credits</PageTitle>
      <p className="credit-statement">
        Designed and developed by Vegesna Rishi Varma. Original character artwork and sprite animations contributed by P. Tejas
        Varma.
      </p>

      <h2>Character art</h2>
      <p>
        Cal and every sprite on this site are original artwork by P. Tejas Varma. Web files were exported from the supplied
        sheets without redrawing; renamed files map back to their source names below.
      </p>
      <ul className="art-list">
        {ART.map((a) => (
          <li key={a.file}>
            <span className="art-frame">
              <Sprite name={a.name} className="sprite-static" label={a.alt} />
            </span>
            <span>
              <span className="mono">{a.file}</span>
              {a.file !== a.source && <span className="muted"> (source: {a.source})</span>}
              <br />
              {a.use}
            </span>
          </li>
        ))}
      </ul>

      <h2>Licences</h2>
      <ul>
        <li>Source code: MIT licence.</li>
        <li>
          Character art and sprites: all rights reserved by P. Tejas Varma, used with permission. The art is not covered by the
          MIT licence.
        </li>
        <li>Runtime dependencies: React and React DOM (MIT). No fonts, images or icons from third parties.</li>
      </ul>

      <h2>Source</h2>
      <p>
        Repository: <a href={REPOSITORY_URL}>{REPOSITORY_URL.replace('https://', '')}</a>
        <br />
        <span className="mono meta">
          app {APP_VERSION} ({BUILD_SHA}) · scenario bank {SCENARIO_BANK_VERSION}
        </span>
      </p>

      <p className="actions-row">
        <a className="button" href={`#${backHref}`}>
          Back to the experiment
        </a>
      </p>
    </div>
  );
}
