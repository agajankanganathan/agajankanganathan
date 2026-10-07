import { Link } from 'react-router';

import { Icon, type IconName } from '../components/icons';
import { PageHead } from '../components/ui';
import { useStore } from '../state/store';

const GUIDES: { icon: IconName; title: string; to: string; steps: string[] }[] = [
  {
    icon: 'overview',
    title: 'Read your Overview',
    to: '/',
    steps: [
      'Pick Last 7 days or Last 30 days at the top.',
      'Hover the ⓘ beside any number to see what it measures.',
      'Hover a bar in the Revenue chart for the exact amount.',
      'Work through “Needs your attention” from top to bottom.',
    ],
  },
  {
    icon: 'insights',
    title: 'Find out why customers leave',
    to: '/insights',
    steps: [
      'Open Customer insights. Reasons are ranked by lost visits.',
      'Click a reason to see how often it’s mentioned and what guests say.',
      'Follow the suggested fix, or use the button to act on it right away.',
    ],
  },
  {
    icon: 'promos',
    title: 'Launch a promotion',
    to: '/promotions?new=1',
    steps: [
      'Click + New promotion.',
      'Choose who gets it, for example guests away 30+ days.',
      'Slide the discount and check the projected weekly lift.',
      'Click Launch. Pause it any time with the switch.',
    ],
  },
  {
    icon: 'gift',
    title: 'Win back a regular',
    to: '/loyalty?filter=risk',
    steps: [
      'Open Loyalty & members and choose the At risk filter.',
      'Click a member to see their habits and favourite order.',
      'Click Send reward to offer them a free drink.',
    ],
  },
  {
    icon: 'menu',
    title: 'Fix your margins',
    to: '/menu',
    steps: [
      'Open Menu. Red margins are under 45%.',
      'Click a price or cost, type the new amount and press Enter.',
      'Switch an item off to mark it sold out for the day.',
      'Use + Add item for new dishes; Sero shows the margin before you save.',
    ],
  },
  {
    icon: 'box',
    title: 'Cost a recipe from bulk buys',
    to: '/ingredients',
    steps: [
      'Open Ingredients & costs and click + Add ingredient.',
      'Type it as you buy it: e.g. 12 × 1 L oat milk for $43.20, plus any waste %.',
      'On the Menu, click an item’s cost (or Build recipe) and pick a starter template.',
      'Adjust the amounts (18 g beans, 220 ml milk…) and click Save recipe.',
    ],
  },
  {
    icon: 'camera',
    title: 'Update prices from an invoice',
    to: '/ingredients?scan=1',
    steps: [
      'Click Scan an invoice and take a photo of the delivery invoice.',
      'Check the matched lines and the old → new prices.',
      'Click Update. Every recipe and margin recalculates.',
      'If anything drops below your target, Sero suggests a new price.',
    ],
  },
  {
    icon: 'reviews',
    title: 'Reply to reviews',
    to: '/reviews?filter=open',
    steps: [
      'Open Reviews and choose Needs reply. Start with low ratings.',
      'Pick a tone: Warm, Professional or Short.',
      'Edit the draft if you like, or click Regenerate for another version.',
      'Click Post. Nothing is published until you do.',
    ],
  },
];

const FAQ = [
  ['Where does Sero get its data?', 'From your point of sale (sales and visits), your loyalty program, and reviews on Google and Instagram. This demo workspace uses sample data for a fictional café.'],
  ['Does Sero post replies automatically?', 'No. Sero drafts every reply, and you decide whether to edit, regenerate or post it.'],
  ['How is “revenue at risk” calculated?', 'It’s the usual monthly spend of regulars who are visiting much less than normal. If they stopped coming entirely, that’s what you’d lose.'],
  ['How accurate is the promotion estimate?', 'It’s an estimate based on how many guests an offer reaches, how often similar guests come back, your average spend and the discount. It gets sharper as Sero learns from your own promotions.'],
  ['My supplier sells in bulk. How do I enter that?', 'Enter exactly what’s on the invoice: how many units in the case, the size of each, and the case price (e.g. 12 × 1 L for $43.20). Sero converts it to a cost per ml, gram or piece, so recipes can use any amount.'],
  ['What about recipes that make several servings?', 'Set “Servings from this recipe” in the recipe builder. A banana bread loaf cut into 8 slices costs ⅛ of its ingredients per slice.'],
  ['Can my staff use Sero?', 'Yes. Growth includes 3 logins and Multi-location includes unlimited logins with roles. See Settings → Plan & billing.'],
  ['How do I undo my changes in this demo?', 'Go to Settings and click Reset demo data. Everything goes back to the starting sample data.'],
];

const GLOSSARY = [
  ['Return rate', 'Share of guests who come back within 30 days of a visit.'],
  ['Revenue at risk', 'Monthly spend from regulars who are visiting much less than usual.'],
  ['Lost visit', 'A visit a regular would normally have made but didn’t.'],
  ['Margin', '(Price − cost to make) ÷ price. How much of each sale you keep before staff and rent.'],
  ['Cost to make', 'Ingredients plus packaging for one item.'],
  ['Pack price', 'What you pay for the whole case, bag or box on the supplier invoice.'],
  ['Waste', 'Share of an ingredient lost before serving (steaming, trimming, spills). It raises the real cost.'],
  ['Recipe', 'The ingredients and amounts in one serving (or one batch, split into servings).'],
  ['Target margin', 'The margin you aim for. Sero flags items below it and suggests prices.'],
  ['Projected lift', 'Extra revenue per week Sero expects from a promotion.'],
  ['At risk', 'A member away more than twice their usual gap between visits (and at least 2 weeks).'],
];

export default function Help() {
  const { dispatch } = useStore();
  return (
    <>
      <PageHead crumb="Account" title="Help & guides" sub="Everything you need to get the most out of Sero, in a few minutes." />

      <section className="card hero row wrap" style={{ justifyContent: 'space-between', gap: 20 }}>
        <div className="stack" style={{ gap: 6, maxWidth: 560 }}>
          <h2 style={{ fontSize: 22 }}>New to Sero? Take the 1-minute tour</h2>
          <p className="muted">We’ll walk you through each part of the platform and show you where to start.</p>
        </div>
        <button type="button" className="btn" style={{ background: 'var(--linen)', color: 'var(--mahogany)' }} onClick={() => dispatch({ type: 'restartTour' })}>
          <Icon name="play" size={16} /> Start the tour
        </button>
      </section>

      <div>
        <h2 style={{ marginBottom: 12 }}>How-to guides</h2>
        <div className="grid cols-3">
          {GUIDES.map((g) => (
            <section key={g.title} className="card guide stack" style={{ gap: 10 }}>
              <span className="ico-circle">
                <Icon name={g.icon} />
              </span>
              <h3>{g.title}</h3>
              <ol>
                {g.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <Link className="link small" to={g.to} style={{ marginTop: 'auto' }}>
                Try it now →
              </Link>
            </section>
          ))}
        </div>
      </div>

      <div className="grid split start">
        <section className="card">
          <h2 style={{ marginBottom: 6 }}>Frequently asked questions</h2>
          {FAQ.map(([q, a]) => (
            <details key={q} className="faq">
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </section>
        <div className="stack" style={{ gap: 16 }}>
          <section className="card">
            <h2 style={{ marginBottom: 12 }}>Keyboard shortcuts</h2>
            <ul className="list">
              <li>
                <span className="grow">Search and jump anywhere</span>
                <span>
                  <kbd>⌘</kbd> <kbd>K</kbd>
                </span>
              </li>
              <li>
                <span className="grow">Save a price or cost edit</span>
                <kbd>Enter</kbd>
              </li>
              <li>
                <span className="grow">Undo an edit / close a panel</span>
                <kbd>Esc</kbd>
              </li>
              <li>
                <span className="grow">Tour: next / back</span>
                <span>
                  <kbd>→</kbd> <kbd>←</kbd>
                </span>
              </li>
            </ul>
          </section>
          <section className="card stack">
            <h2>Still stuck?</h2>
            <p className="muted small">Our team replies within one business day. Growth and Multi-location plans also get chat support.</p>
            <a className="btn ghost" style={{ justifySelf: 'start' }} href="mailto:support@sero.example?subject=Help%20with%20Sero">
              Email support
            </a>
          </section>
        </div>
      </div>

      <section className="card">
        <h2 style={{ marginBottom: 14 }}>Glossary</h2>
        <dl className="glossary">
          {GLOSSARY.map(([t, d]) => (
            <div key={t} style={{ display: 'contents' }}>
              <dt>{t}</dt>
              <dd>{d}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
