import { motion } from 'framer-motion';
import { Timer, Music } from 'lucide-react';
import { cn } from '../lib/utils'

export default function BottomNav({ page, onChange }) {
  return (
    <nav className="flex items-center justify-around border-t border-border bg-background/80 backdrop-blur-lg px-6 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
      {[
        { id: 'timer', label: 'Timer', Icon: Timer },
        { id: 'music', label: 'Music', Icon: Music },
      ].map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={cn(
            'flex flex-col items-center gap-0.5 py-2 px-6 rounded-xl transition-colors',
            page === id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={page === id ? 2.5 : 1.5} />
          <span className="text-[10px] font-medium">{label}</span>
        </button>
      ))}
    </nav>
  );
}
