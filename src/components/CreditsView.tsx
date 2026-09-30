import { APP_VERSION, BUILD_SHA, REPOSITORY_URL, SCENARIO_BANK_VERSION } from '../app/version';
import { SOURCES } from '../content/sources';
import { PageTitle } from './PageTitle';
import { Sprite } from './Sprite';

export function CreditsView({ backHref }: { backHref: string }) {
  return (
    <div className="content prose">
      <p className="mono eyebrow">Credits</p>
      <PageTitle>Credits</PageTitle>
      <div className="credit-block">
        <Sprite name="idle" label="Cal, TrustLab's skeletal risk officer, standing at rest." />
        <p className="credit-statement">
          Designed and developed by Vegesna Rishi Varma. Original character artwork and sprite animations contributed by P.
          Tejas Varma.
        </p>
      </div>

      <h2>Research background</h2>
      <p>
        The ideas TrustLab measures, automation bias, appropriate reliance, and the effects of stated confidence and
        explanations, come from the research below. TrustLab does not reproduce these studies or claim their findings.
      </p>
      <h3>Works Cited</h3>
      <ul className="works-cited">
        {SOURCES.map((s) => (
          <li key={s.doi}>
            {s.authors} “{s.title}” <em>{s.container}</em>, {s.details},{' '}
            <a href={`https://doi.org/${s.doi}`}>https://doi.org/{s.doi}</a>.
          </li>
        ))}
      </ul>

      <h2>Licences</h2>
      <p>
        Code: MIT licence. Character art and sprites: all rights reserved by P. Tejas Varma, used with permission, and not
        covered by the MIT licence.
      </p>

      <h2>Source code</h2>
      <p>
        <a href={REPOSITORY_URL}>{REPOSITORY_URL.replace('https://', '')}</a>
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
