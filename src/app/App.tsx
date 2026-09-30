import { useEffect, useReducer, useRef } from 'react';
import { BriefingView } from '../components/BriefingView';
import { CreditsView } from '../components/CreditsView';
import { FeedbackView } from '../components/FeedbackView';
import { IntroView } from '../components/IntroView';
import { Layout } from '../components/Layout';
import { MethodView } from '../components/MethodView';
import { MidpointView } from '../components/MidpointView';
import { ResultsView } from '../components/ResultsView';
import { ScenarioView } from '../components/ScenarioView';
import { SCENARIOS } from '../data/scenarios';
import { MIDPOINT_AFTER, SCORED_TRIALS } from '../experiment/assignment';
import { isValidSeed, newSeed } from '../experiment/rng';
import { buildTrialResults, evaluateDecision, resultBand, summarise } from '../experiment/scoring';
import type { Session } from '../types/session';
import { isInfoPath, navigate, readHash, replacePath, useHashPath } from './router';
import { canonicalPath, createSession, decisionFor, loadSession, presentTrial, saveSession, sessionReducer } from './session';
import { cueForBand, cueForDecision, playCue } from './sound';

function initialSession(): Session {
  const stored = loadSession();
  const seed = readHash().query.get('seed');
  // A ?seed= link replays that seed, unless a run with decisions is already in progress in this tab.
  if (seed && isValidSeed(seed) && seed !== stored?.seed && !stored?.decisions.length) return createSession(seed);
  return stored ?? createSession(newSeed());
}

function continueLabel(trial: number | 'warmup'): string {
  if (trial === 'warmup') return 'Start the real game';
  if (trial === SCORED_TRIALS) return 'See my score';
  if (trial === MIDPOINT_AFTER) return 'Continue';
  return `Next decision (${trial + 1} of ${SCORED_TRIALS})`;
}

export function App() {
  const [session, dispatch] = useReducer(sessionReducer, undefined, initialSession);
  const path = useHashPath();
  const canonical = canonicalPath(session.step);
  const lastCanonical = useRef(canonical);

  useEffect(() => {
    saveSession(session);
  }, [session]);

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
  // Braces matter: current Chrome returns a Promise from scrollTo, and an effect must never
  // return anything but a cleanup function, or React crashes on the next page change.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  // Sounds play inside click handlers, which is what browsers require before audio can start.
  function submitDecision(trial: number | 'warmup', chosenActionId: string, evidenceMs: number, decisionMs: number) {
    const { correct, pattern } = evaluateDecision(presentTrial(session, trial), chosenActionId);
    playCue(cueForDecision(correct, pattern));
    dispatch({ type: 'submit', trial, chosenActionId, evidenceMs, decisionMs });
  }

  function continueFromFeedback(trial: number | 'warmup') {
    if (trial === SCORED_TRIALS) {
      playCue(cueForBand(resultBand(summarise(buildTrialResults(session.plan, session.decisions, SCENARIOS)))));
    }
    dispatch({ type: 'continue' });
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
        return (
          <BriefingView
            seed={session.seed}
            returning={Boolean(session.returning)}
            onStartWarmup={() => dispatch({ type: 'start-warmup' })}
          />
        );
      case 'scenario':
        return (
          <ScenarioView
            trial={step.trial}
            scenario={presentTrial(session, step.trial)}
            onSubmit={(chosenActionId, evidenceMs, decisionMs) => submitDecision(step.trial, chosenActionId, evidenceMs, decisionMs)}
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
            onContinue={() => continueFromFeedback(step.trial)}
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
    <Layout experimentHref={canonical} current={view}>
      <div key={view} className="view">
        {renderView()}
      </div>
    </Layout>
  );
}
