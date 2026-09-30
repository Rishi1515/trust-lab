import { CalPanel } from './CalPanel';
import { PageTitle } from './PageTitle';

/** In-text citations follow MLA style and link to the full Works Cited list on the Credits page. */
function Cite({ children }: { children: string }) {
  return (
    <a className="cite" href="#/credits">
      ({children})
    </a>
  );
}

export function WhyView({ backHref }: { backHref: string }) {
  return (
    <div className="layout-with-cal why-layout">
      <div className="content prose why">
        <p className="mono eyebrow">Why I made this</p>
        <PageTitle>Why TrustLab exists</PageTitle>

        <h2>AI gives advice at work now</h2>
        <p>
          AI tools are part of everyday work. In McKinsey's 2026 global survey, eight in ten respondents said AI has improved
          their own productivity <Cite>Tinkoff et al.</Cite>. More and more, these tools don't just answer questions. They
          recommend what to do.
        </p>

        <h2>The risk is trusting it too much</h2>
        <p>
          When a computer gives advice, people tend to follow it without checking, even when it is wrong. Researchers call this
          automation bias and have studied it since the 1990s <Cite>Parasuraman and Riley; Skitka et al.</Cite>. A good
          explanation can make it worse. In one study, explanations made people more likely to accept the AI's recommendation
          whether it was right or not <Cite>Bansal et al.</Cite>.
        </p>

        <h2>Trusting it too little is a problem too</h2>
        <p>
          People who see an algorithm make a mistake often lose confidence in it faster than they would in a person, and stop
          using it even when it is the better forecaster <Cite>Dietvorst et al.</Cite>. So the goal is not to distrust AI. It is
          to trust it when it has earned it.
        </p>

        <h2>Why a game</h2>
        <p>
          You can read about bias and still think it only happens to other people. A short game lets you see your own pattern
          in about ten minutes. My other projects build or test AI systems. This one looks at the people using them, which felt
          like the missing piece.
        </p>

        <h2>What I hope you take away</h2>
        <p>
          Read the facts before the advice. Treat "95% sure" and a neat explanation as claims, not proof. And when the AI is
          right, it's fine to agree with it.
        </p>
        <p className="muted small">Full references are on the Credits page.</p>

        <p className="actions-row">
          <a className="button primary" href={`#${backHref}`}>
            Back to the game
          </a>
        </p>
      </div>
      <CalPanel line="Oh. Hi. You found the serious page. It's short, I checked. I'd stay, but I have a very busy schedule of standing here." />
    </div>
  );
}
