import { useInstallPrompt } from "@/hooks/useInstallPrompt";

export function InstallBanner() {
  const { showBanner, install, dismiss } = useInstallPrompt();

  if (!showBanner) return null;

  return (
    <div
      role="banner"
      className="fixed bottom-20 left-3 right-3 z-50 flex items-center gap-3 rounded-xl border border-red-500/30 bg-neutral-900/95 px-4 py-3 shadow-lg shadow-black/50 backdrop-blur-sm sm:left-auto sm:right-4 sm:w-80"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-white"
        >
          <path d="M12 2v13M8 11l4 4 4-4" />
          <path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" />
        </svg>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">Install F1 2026</p>
        <p className="text-xs text-neutral-400">Works offline. No app store needed.</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={install}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-500 active:bg-red-700"
        >
          Install
        </button>
        <button
          onClick={dismiss}
          aria-label="Dismiss install banner"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
