import type { KubekFrontendModule } from '@kubekpanel/extension-sdk';
import { PlayersDashboard } from './components/PlayersDashboard';
import './styles/players.css';

// Automatically patches the sidebar item icon to ensure the Lucide Users SVG is always displayed
function patchSidebarIcon() {
  if (typeof document === 'undefined') return;

  const replaceIcon = () => {
    const elements = document.querySelectorAll('a, button, [role="button"], div, li');
    elements.forEach((el) => {
      const href = el.getAttribute('href') || '';
      const text = (el.textContent || '').trim();
      if (
        href.includes('com.kubek.players') ||
        href.includes('PlayersDashboard') ||
        (text.startsWith('Players') && text.length <= 15)
      ) {
        const svg = el.querySelector('svg');
        if (svg && svg.getAttribute('data-kubek-icon') !== 'users') {
          svg.setAttribute('data-kubek-icon', 'users');
          svg.setAttribute('viewBox', '0 0 24 24');
          svg.setAttribute('fill', 'none');
          svg.setAttribute('stroke', 'currentColor');
          svg.setAttribute('stroke-width', '2');
          svg.setAttribute('stroke-linecap', 'round');
          svg.setAttribute('stroke-linejoin', 'round');
          svg.innerHTML = '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path>';
        }
      }
    });
  };

  replaceIcon();
  if (typeof MutationObserver !== 'undefined' && document.body) {
    const observer = new MutationObserver(() => {
      replaceIcon();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchSidebarIcon);
  } else {
    patchSidebarIcon();
  }
}

const frontendModule: KubekFrontendModule = {
  components: {
    PlayersDashboard,
  },
};

export default frontendModule;
