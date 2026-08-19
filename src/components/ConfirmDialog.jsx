import { motion } from 'framer-motion';
import { Button } from './ui/button';

export default function ConfirmDialog({ open, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: open ? 1 : 0 }}
      transition={{ duration: 0.2 }}
      className={!open ? 'pointer-events-none' : ''}
      style={{ visibility: open ? 'visible' : 'hidden' }}
    >
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.95, y: open ? 0 : 10 }}
          transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative z-50 w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-2xl"
        >
          <h3 className="text-lg font-semibold mb-1">End workout?</h3>
          <p className="text-sm text-muted-foreground mb-6">Your current session will stop.</p>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={onCancel}>Keep Training</Button>
            <Button variant="destructive" className="flex-1" onClick={onConfirm}>End Workout</Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
