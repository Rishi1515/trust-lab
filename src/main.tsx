import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { SCENARIOS, WARMUP } from './data/scenarios';
import { validateBank } from './experiment/validate';
import './styles/tokens.css';
import './styles/base.css';
import './styles/sprites.css';

const problems = validateBank(SCENARIOS, WARMUP);
const root = createRoot(document.getElementById('root')!);

if (problems.length > 0) {
  // Refuse to run an experiment on a broken scenario bank.
  root.render(
    <main style={{ padding: 16 }}>
      <h1>TrustLab cannot start</h1>
      <p>The scenario bank failed validation:</p>
      <ul>
        {problems.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </main>,
  );
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
