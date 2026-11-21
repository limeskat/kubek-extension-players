import type { KubekFrontendModule } from '@kubekpanel/extension-sdk';
import { PlayersDashboard } from './components/PlayersDashboard';
import styles from './styles/players.css' with { type: 'text' };

const STYLE_ID = 'kubek-ext-players-styles';

// The panel serves one ESM bundle per extension, so styles ride along as text and are
// mounted once when the module is imported.
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.setAttribute('data-extension', 'io.github.limeskat.players');
  style.textContent = styles;
  document.head.appendChild(style);
}

const frontendModule: KubekFrontendModule = {
  components: {
    PlayersDashboard,
  },
};

export default frontendModule;
