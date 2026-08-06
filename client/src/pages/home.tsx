import { useState } from 'react';
import UnitConverterApp from '@/features/unit-converter/app/UnitConverterApp';
import { ConverterProvider } from '@/components/unit-converter/context/ConverterContext';

const APP_VERSION = '5.0.0.0';

export default function Home() {
  const [helpOpen, setHelpOpenRaw] = useState(false);
  const [sourcesOpen, setSourcesOpenRaw] = useState(false);
  const setHelpOpen = (open: boolean) => { setHelpOpenRaw(open); if (open) setSourcesOpenRaw(false); };
  const setSourcesOpen = (open: boolean) => { setSourcesOpenRaw(open); if (open) setHelpOpenRaw(false); };

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-background text-foreground font-sans selection:bg-accent selection:text-accent-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm flex-none z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center text-primary-foreground font-bold font-mono text-lg" aria-hidden="true">
              Ω
            </div>
            <h1 className="font-bold text-xl tracking-tight m-0">Omni<span className="text-primary">Unit</span> & Calculator</h1>
            <button
              onClick={() => setHelpOpen(!helpOpen)}
              data-testid="button-open-help"
              aria-label="Open help"
              className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold leading-none hover:bg-blue-400 transition-colors flex-shrink-0"
            >
              i
            </button>
            <button
              onClick={() => setSourcesOpen(!sourcesOpen)}
              data-testid="button-open-sources"
              aria-label="Open sources"
              className="w-5 h-5 rounded-full bg-muted-foreground/70 flex items-center justify-center text-background text-xs font-bold leading-none hover:bg-muted-foreground transition-colors flex-shrink-0"
            >
              ※
            </button>
          </div>
          <div className="text-xs font-mono text-muted-foreground hidden sm:block" aria-label={`Version ${APP_VERSION}`}>
            v{APP_VERSION}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 min-h-0 overflow-y-auto py-4 md:py-6">
        <ConverterProvider>
          <UnitConverterApp helpOpen={helpOpen} setHelpOpen={setHelpOpen} sourcesOpen={sourcesOpen} setSourcesOpen={setSourcesOpen} />
        </ConverterProvider>
      </main>
    </div>
  );
}
