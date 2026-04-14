import UnitConverterApp from '@/features/unit-converter/app/UnitConverterApp';
import { ConverterProvider } from '@/components/unit-converter/context/ConverterContext';

const APP_VERSION = '3.2.1.0';

export default function Home() {
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
          </div>
          <div className="text-xs font-mono text-muted-foreground hidden sm:block" aria-label={`Version ${APP_VERSION}`}>
            v{APP_VERSION}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 min-h-0 overflow-y-auto py-4 md:py-6">
        <ConverterProvider>
          <UnitConverterApp />
        </ConverterProvider>
      </main>
    </div>
  );
}
