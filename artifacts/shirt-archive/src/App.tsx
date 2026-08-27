import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  ArrowUpRight,
  ChevronRight,
  Menu,
  Plus,
  Search,
  X,
} from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

type Shirt = {
  id: string;
  artist: string;
  design: string;
  year: string;
  origin: string;
  imageTone: 'ink' | 'charcoal' | 'paper' | 'rust' | 'olive';
  artTone: 'sun' | 'red' | 'grid' | 'type';
  art: string;
  label: string;
  note: string;
};

const latestAdditions: Shirt[] = [
  {
    id: 'metallica-pushead-1986',
    artist: 'Metallica',
    design: 'Damage, Inc. / Pushead',
    year: '1986',
    origin: 'Fruit of the Loom · US',
    imageTone: 'charcoal',
    artTone: 'red',
    art: 'DAMAGE\nINC.',
    label: 'MA-86 / 001',
    note: 'Tour-era back print with the early Pushead skull. Submitted from a private Oakland collection.',
  },
  {
    id: 'nirvana-in-utero-1993',
    artist: 'Nirvana',
    design: 'In Utero Angel',
    year: '1993',
    origin: 'Giant · US',
    imageTone: 'paper',
    artTone: 'sun',
    art: 'IN\nUTERO',
    label: 'NV-93 / 014',
    note: 'A soft-washed angel study from the In Utero campaign, printed in reverse on black cotton.',
  },
  {
    id: 'black-sabbath-cross-1971',
    artist: 'Black Sabbath',
    design: 'The Cross / Vol. 4',
    year: '1971',
    origin: 'NEMS · UK',
    imageTone: 'olive',
    artTone: 'grid',
    art: 'BLACK\nSABBATH',
    label: 'BS-71 / 006',
    note: 'A rare NEMS-era reference piece with the four-point cross and condensed wordmark.',
  },
];

const collectedThisMonth: Shirt[] = [
  {
    id: 'sonic-youth-goo-1990',
    artist: 'Sonic Youth',
    design: 'Goo / Raymond Pettibon',
    year: '1990',
    origin: 'DGC · US',
    imageTone: 'ink',
    artTone: 'type',
    art: 'SONIC\nYOUTH',
    label: 'SY-90 / 022',
    note: 'The black-and-white Goo study that made its way from art-school walls to record shops.',
  },
  {
    id: 'metallica-master-1986',
    artist: 'Metallica',
    design: 'Master of Puppets',
    year: '1986',
    origin: 'Music for Nations · UK',
    imageTone: 'charcoal',
    artTone: 'sun',
    art: 'MASTER\nOF PUPPETS',
    label: 'MA-86 / 009',
    note: 'A UK pressing companion with the cemetery horizon and stark cream ink.',
  },
  {
    id: 'nirvana-smiley-1992',
    artist: 'Nirvana',
    design: 'Corporate Rock Whores',
    year: '1992',
    origin: 'Screen Stars · US',
    imageTone: 'rust',
    artTone: 'red',
    art: 'NEVER\nMIND',
    label: 'NV-92 / 003',
    note: 'The familiar smiley appears here as a small chest mark with a hand-lettered back hit.',
  },
  {
    id: 'sleep-dopesmoker-2003',
    artist: 'Sleep',
    design: 'Dopesmoker',
    year: '2003',
    origin: 'Southern Lord · US',
    imageTone: 'olive',
    artTone: 'grid',
    art: 'SLEEP\nIII',
    label: 'SL-03 / 011',
    note: 'Southern Lord edition in faded military green, logged for its unusual sleeve placement.',
  },
];

const archiveSeed = [...latestAdditions, ...collectedThisMonth];

function ImagePlaceholder({ shirt, large = false }: { shirt: Shirt; large?: boolean }) {
  return (
    <div
      className={`shirt-card__image shirt-card__image--${shirt.imageTone}${large ? ' detail-modal__visual' : ''}`}
      data-testid={`img-shirt-${shirt.id}`}
      aria-label={`Archive image placeholder for ${shirt.artist}, ${shirt.design}`}
      role="img"
    >
      <div className={`shirt-card__art shirt-card__art--${shirt.artTone}`}>
        {shirt.art.split('\n').map((line) => (
          <span key={line}>{line}<br /></span>
        ))}
      </div>
      <span className="shirt-card__label">{shirt.label} / PLATE</span>
    </div>
  );
}

function ShirtCard({ shirt, onInspect }: { shirt: Shirt; onInspect: (shirt: Shirt) => void }) {
  return (
    <button
      className="shirt-card"
      type="button"
      onClick={() => onInspect(shirt)}
      data-testid={`card-shirt-${shirt.id}`}
      aria-label={`Inspect ${shirt.artist}, ${shirt.design}`}
    >
      <ImagePlaceholder shirt={shirt} />
      <div className="shirt-card__info">
        <span className="shirt-card__artist" data-testid={`text-artist-${shirt.id}`}>{shirt.artist}</span>
        <span className="shirt-card__year" data-testid={`text-year-${shirt.id}`}>{shirt.year}</span>
        <span className="shirt-card__design" data-testid={`text-design-${shirt.id}`}>{shirt.design}</span>
        <span className="shirt-card__origin" data-testid={`text-origin-${shirt.id}`}>{shirt.origin}</span>
      </div>
    </button>
  );
}

function AddShirtModal({ onClose, onAdd }: { onClose: () => void; onAdd: (shirt: Shirt) => void }) {
  const [artist, setArtist] = useState('');
  const [design, setDesign] = useState('');
  const [year, setYear] = useState('');
  const [origin, setOrigin] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!artist.trim() || !design.trim()) return;
    onAdd({
      id: `submitted-${Date.now()}`,
      artist: artist.trim(),
      design: design.trim(),
      year: year.trim() || 'YEAR UNKNOWN',
      origin: origin.trim() || 'Origin unrecorded',
      imageTone: 'rust',
      artTone: 'type',
      art: artist.trim().toUpperCase().slice(0, 12),
      label: 'NEW / PENDING',
      note: 'Newly submitted record. Image and provenance notes can be added during cataloguing.',
    });
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-shirt-title"
        onMouseDown={(event) => event.stopPropagation()}
        data-testid="dialog-add-shirt"
      >
        <div className="modal__head">
          <div>
            <div className="archive-kicker">Submission desk / 04</div>
            <h2 id="add-shirt-title">Place a record<br />in the drawer.</h2>
          </div>
          <button className="modal__close" type="button" onClick={onClose} data-testid="button-close-add-shirt" aria-label="Close add a shirt dialog">
            <X size={16} />
          </button>
        </div>
        <p className="modal__note">This is a local preview only. Your entry will appear in the current catalogue while this page is open.</p>
        <form className="archive-form" onSubmit={handleSubmit}>
          <label>
            Artist / band
            <input value={artist} onChange={(event) => setArtist(event.target.value)} placeholder="e.g. Fugazi" data-testid="input-shirt-artist" autoFocus />
          </label>
          <label>
            Design or tour
            <input value={design} onChange={(event) => setDesign(event.target.value)} placeholder="e.g. Repeater back print" data-testid="input-shirt-design" />
          </label>
          <div className="form-row">
            <label>
              Approx. year
              <input value={year} onChange={(event) => setYear(event.target.value)} placeholder="1991" data-testid="input-shirt-year" />
            </label>
            <label>
              Brand / origin
              <input value={origin} onChange={(event) => setOrigin(event.target.value)} placeholder="Screen Stars · US" data-testid="input-shirt-origin" />
            </label>
          </div>
          <div className="form-actions">
            <button className="header-button" type="button" onClick={onClose} data-testid="button-cancel-add-shirt">Cancel</button>
            <button className="header-button header-button--add" type="submit" data-testid="button-submit-shirt"><Plus size={14} /> Add record</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function DetailModal({ shirt, onClose }: { shirt: Shirt; onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="detail-title" onMouseDown={(event) => event.stopPropagation()} data-testid={`dialog-detail-${shirt.id}`}>
        <div className="modal__head">
          <div>
            <div className="archive-kicker">Record {shirt.label}</div>
            <h2 id="detail-title">{shirt.artist}<br />{shirt.design}</h2>
          </div>
          <button className="modal__close" type="button" onClick={onClose} data-testid="button-close-detail" aria-label="Close shirt details">
            <X size={16} />
          </button>
        </div>
        <ImagePlaceholder shirt={shirt} large />
        <p className="modal__note">{shirt.note}</p>
        <div className="detail-meta">
          <span><b>YEAR</b> {shirt.year}</span>
          <span><b>ORIGIN</b> {shirt.origin}</span>
        </div>
      </section>
    </div>
  );
}

function Home() {
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedShirt, setSelectedShirt] = useState<Shirt | null>(null);
  const [submittedShirts, setSubmittedShirts] = useState<Shirt[]>([]);
  const [feedback, setFeedback] = useState('');

  const visibleArchive = useMemo(() => {
    const query = search.trim().toLowerCase();
    const records = [...submittedShirts, ...archiveSeed];
    if (!query) return records;
    return records.filter((shirt) =>
      [shirt.artist, shirt.design, shirt.year, shirt.origin, shirt.note].some((value) => value.toLowerCase().includes(query)),
    );
  }, [search, submittedShirts]);

  const visibleLatest = visibleArchive.filter((shirt) => latestAdditions.some((item) => item.id === shirt.id) || shirt.id.startsWith('submitted'));
  const visibleCollected = visibleArchive.filter((shirt) => collectedThisMonth.some((item) => item.id === shirt.id));
  const randomShirt = visibleArchive[visibleArchive.length > 0 ? visibleArchive.length - 1 : 0];

  const announce = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 3200);
  };

  const handleAdd = (shirt: Shirt) => {
    setSubmittedShirts((current) => [shirt, ...current]);
    setAddOpen(false);
    announce('Record placed in the local intake drawer.');
  };

  return (
    <div className="archive-shell">
      <header className="archive-header">
        <a href="/" className="archive-mark" data-testid="link-home">SHIRT ARCHIVE</a>
        <div className="archive-kicker">A community catalogue / est. 2018</div>
        <div className="header-actions">
          <button className="header-button header-button--add" type="button" onClick={() => setAddOpen(true)} data-testid="button-add-shirt">
            <Plus size={14} /> <span>Add a shirt</span>
          </button>
          <button className="header-button header-button--menu" type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label={menuOpen ? 'Close archive menu' : 'Open archive menu'} data-testid="button-menu">
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
        {menuOpen && (
          <nav className="menu-panel" aria-label="Archive menu" data-testid="menu-panel">
            <div className="menu-panel__eyebrow">The reference room</div>
            <button className="menu-link" type="button" onClick={() => { setMenuOpen(false); announce('Decade index is being carefully filed.'); }} data-testid="menu-decade-index">
              Browse the decade index <ChevronRight size={14} />
            </button>
            <button className="menu-link" type="button" onClick={() => { setMenuOpen(false); announce('Archive notes: provenance over popularity.'); }} data-testid="menu-archive-notes">
              Read archive notes <ChevronRight size={14} />
            </button>
            <button className="menu-link" type="button" onClick={() => { setMenuOpen(false); setAddOpen(true); }} data-testid="menu-submit-record">
              Submit a record <ChevronRight size={14} />
            </button>
          </nav>
        )}
      </header>

      <main>
        <section className="hero" aria-labelledby="page-title">
          <div className="hero__stamp">A living reference catalogue</div>
          <h1 id="page-title" data-testid="heading-home">The graphic language<br />of <em>loud music.</em></h1>
          <p className="hero__copy" data-testid="text-home-intro">A quiet, obsessive record of the shirts that travelled with the music. Browse the marks, blanks, bootlegs, and memories.</p>
          <div className="search-wrap">
            <Search className="search-icon" size={22} strokeWidth={1.5} />
            <input
              className="search-input"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search artists, designs, years, brands..."
              aria-label="Search artists, designs, years, brands"
              data-testid="input-search"
            />
            <div className="search-meta">
              <span>{search ? `${visibleArchive.length} matching records` : 'Try: Pushead, 1990, Screen Stars'}</span>
              <span>CTRL K / search</span>
            </div>
          </div>
        </section>

        <div className="catalogue">
          <section className="catalogue-section catalogue-section--latest" aria-labelledby="latest-title">
            <div className="section-heading">
              <h2 id="latest-title">Latest additions</h2>
              <span data-testid="text-latest-count">{visibleLatest.length} records / recent intake</span>
            </div>
            {visibleLatest.length > 0 ? (
              <div className="shirt-grid">
                {visibleLatest.map((shirt) => <ShirtCard key={shirt.id} shirt={shirt} onInspect={setSelectedShirt} />)}
              </div>
            ) : (
              <div className="empty-state" data-testid="empty-latest"><strong>No record found.</strong>The drawer is quiet for this search.</div>
            )}
          </section>

          <section className="catalogue-section" aria-labelledby="collected-title">
            <div className="section-heading">
              <h2 id="collected-title">Most collected this month</h2>
              <span>Filed by the community / 06.24</span>
            </div>
            {visibleCollected.length > 0 ? (
              <div className="collected-rail" data-testid="collection-rail">
                {visibleCollected.map((shirt) => <ShirtCard key={shirt.id} shirt={shirt} onInspect={setSelectedShirt} />)}
              </div>
            ) : (
              <div className="empty-state" data-testid="empty-collected"><strong>Nothing in this index.</strong>Try a broader search term.</div>
            )}
          </section>

          {randomShirt && (
            <section className="catalogue-section" aria-labelledby="random-title">
              <div className="section-heading">
                <h2 id="random-title">Random shirt</h2>
                <span>One record pulled from the drawer</span>
              </div>
              <article className="random-record" data-testid="feature-random-shirt">
                <button className="random-record__visual" type="button" onClick={() => setSelectedShirt(randomShirt)} aria-label={`Inspect random shirt: ${randomShirt.artist}`} data-testid="button-random-shirt">
                  <div className="shirt-card__art shirt-card__art--sun">
                    {randomShirt.art.split('\n').map((line) => <span key={line}>{line}<br /></span>)}
                  </div>
                </button>
                <div className="random-record__content">
                  <div>
                    <div className="archive-kicker">Pulled at random / {randomShirt.label}</div>
                    <h3>{randomShirt.artist}<br />{randomShirt.design}</h3>
                    <p>{randomShirt.note}</p>
                  </div>
                  <button className="record-link" type="button" onClick={() => setSelectedShirt(randomShirt)} data-testid="button-inspect-random">
                    Inspect this record <ArrowUpRight size={15} />
                  </button>
                </div>
              </article>
            </section>
          )}
        </div>
      </main>

      <footer className="archive-header" style={{ borderTop: '1px solid #34363a', marginTop: 15 }}>
        <span className="archive-kicker">© Shirt Archive / all provenance welcome</span>
        <span className="archive-kicker">Vol. 06 — graphic language</span>
      </footer>
      {feedback && <div className="feedback" role="status" data-testid="status-feedback">{feedback}</div>}
      {addOpen && <AddShirtModal onClose={() => setAddOpen(false)} onAdd={handleAdd} />}
      {selectedShirt && <DetailModal shirt={selectedShirt} onClose={() => setSelectedShirt(null)} />}
    </div>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
