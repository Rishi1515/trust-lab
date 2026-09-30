import { useEffect, useReducer, useRef, useState } from 'react';
import { BriefingView } from '../components/BriefingView';
import { CreditsView } from '../components/CreditsView';
import { FeedbackView } from '../components/FeedbackView';
import { IntroView } from '../components/IntroView';
import { Layout } from '../components/Layout';
import { MethodView } from '../components/MethodView';
import { MidpointView } from '../components/MidpointView';
import { ResultsView } from '../components/ResultsView';
import { ScenarioView } from '../components/ScenarioView';
import { MIDPOINT_AFTER, SCORED_TRIALS } from '../experiment/assignment';
import { isValidSeed, newSeed } from '../experiment/rng';
import type { Session } from '../types/session';
import { isInfoPath, navigate, readHash, replacePath, useHashPath } from './router';
import { canonicalPath, createSession, decisionFor, loadSession, presentTrial, saveSession, sessionReducer } from './session';

const MOTION_KEY = 'trustlab.motion';

function initialSession(): Session {
  const stored = loadSession();
  const seed = readHash().query.get('seed');
  // A ?seed= link replays that seed, unless a run with decisions is already in progress in this tab.
  if (seed && isValidSeed(seed) && seed !== stored?.seed && !stored?.decisions.length) return createSession(seed);
  return stored ?? createSession(newSeed());
}

function initialMotion(): 'on' | 'off' {
  try {
    const saved = localStorage.getItem(MOTION_KEY);
    if (saved === 'on' || saved === 'off') return saved;
  } catch {
    // localStorage unavailable: fall through to the system preference.
  }
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'off' : 'on';
}

function continueLabel(trial: number | 'warmup'): string {
  if (trial === 'warmup') return 'Start the scored scenarios';
  if (trial === SCORED_TRIALS) return 'See your results';
  if (trial === MIDPOINT_AFTER) return 'Continue';
  return `Next scenario (${trial + 1} of ${SCORED_TRIALS})`;
}

export function App() {
  const [session, dispatch] = useReducer(sessionReducer, undefined, initialSession);
  const [motion, setMotion] = useState(initialMotion);
  const path = useHashPath();
  const canonical = canonicalPath(session.step);
  const lastCanonical = useRef(canonical);

  useEffect(() => saveSession(session), [session]);

  // A new step pushes a history entry; any other flow address is corrected to the current step,
  // so the back button or an edited URL cannot reopen or skip a decision.
  useEffect(() => {
    if (lastCanonical.current !== canonical) {
      lastCanonical.current = canonical;
      navigate(canonical);
    } else if (!isInfoPath(path) && path !== canonical) {
      replacePath(canonical);
    }
  }, [path, canonical]);

  const view = isInfoPath(path) ? path : canonical;
  useEffect(() => window.scrollTo?.(0, 0), [view]);

  useEffect(() => {
    document.documentElement.dataset.motion = motion;
  }, [motion]);

  function toggleMotion() {
    const next = motion === 'on' ? 'off' : 'on';
    setMotion(next);
    try {
      localStorage.setItem(MOTION_KEY, next);
    } catch {
      // Preference just will not persist.
    }
  }

  function restart(seed: string) {
    dispatch({ type: 'restart', seed });
  }

  function renderView() {
    if (view === '/method') return <MethodView backHref={canonical} seed={session.seed} />;
    if (view === '/credits') return <CreditsView backHref={canonical} />;
    const { step } = session;
    switch (step.kind) {
      case 'intro':
        return <IntroView seed={session.seed} onStart={() => dispatch({ type: 'open-briefing' })} />;
      case 'briefing':
        return <BriefingView seed={session.seed} onStartWarmup={() => dispatch({ type: 'start-warmup' })} />;
      case 'scenario':
        return (
          <ScenarioView
            trial={step.trial}
            scenario={presentTrial(session, step.trial)}
            onSubmit={(chosenActionId, evidenceMs, decisionMs) =>
              dispatch({ type: 'submit', trial: step.trial, chosenActionId, evidenceMs, decisionMs })
            }
          />
        );
      case 'feedback': {
        const decision = decisionFor(session, step.trial);
        if (!decision) return null;
        return (
          <FeedbackView
            trial={step.trial}
            scenario={presentTrial(session, step.trial)}
            decision={decision}
            continueLabel={continueLabel(step.trial)}
            onContinue={() => dispatch({ type: 'continue' })}
          />
        );
      }
      case 'midpoint':
        return <MidpointView seed={session.seed} history={session.calHistory} onContinue={() => dispatch({ type: 'continue' })} />;
      case 'results':
        return <ResultsView session={session} onReplay={() => restart(session.seed)} onNewRun={() => restart(newSeed())} />;
    }
  }

  return (
    <Layout experimentHref={canonical} current={view} motion={motion} onToggleMotion={toggleMotion}>
      <div key={view} className="view">
        {renderView()}
      </div>
    </Layout>
  );
}
