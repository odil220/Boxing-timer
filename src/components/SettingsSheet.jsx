import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Toggle } from './ui/toggle';

export default function SettingsSheet({ open, onOpenChange, settings, setSettings }) {
  const setTheme = (theme) => {
    setSettings(s => ({ ...s, theme }));
    onOpenChange?.(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end justify-center"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange?.(false)} />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative z-50 w-full max-w-lg rounded-t-2xl border-t border-border bg-background p-6 pb-8"
          >
            <div className="mx-auto h-1.5 w-12 rounded-full bg-muted mb-6" />
            <h3 className="text-lg font-semibold mb-6">Settings</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Theme</span>
                <div className="flex gap-1 bg-secondary rounded-lg p-1">
                  {['system', 'light', 'dark'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        settings.theme === t ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sound</span>
                <Toggle checked={settings.soundEnabled} onCheckedChange={(v) => setSettings(s => ({ ...s, soundEnabled: v }))} />
              </div>
            </div>

            <Button className="w-full mt-6" onClick={() => onOpenChange?.(false)}>Done</Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
