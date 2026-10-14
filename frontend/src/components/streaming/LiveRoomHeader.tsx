// frontend/src/components/streaming/LiveRoomHeader.tsx
import { EventHostModerationPanel } from '@/components/streaming/EventHostModerationPanel';
import { useParticipants } from '@livekit/components-react';
import { Users } from 'lucide-react';

interface LiveRoomHeaderProps {
  eventId: string;
  eventTitle?: string;
  hostId?: string;
}

export function LiveRoomHeader({ eventId, eventTitle, hostId }: LiveRoomHeaderProps) {
  const participants = useParticipants();
  const count = participants.length;

  return (
    // `relative` so the moderation dropdown can span the header width on mobile
    <header className="relative z-20 flex shrink-0 items-center justify-between gap-2 border-b border-(--border-default) bg-(--brand-primary-light)/35 px-3 py-2.5 backdrop-blur-md sm:gap-4 sm:px-5 sm:py-3">
      {/* Left: live badge + title */}
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-(--badge-error-border) bg-(--badge-error-bg) px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-(--badge-error-text) sm:px-2.5 sm:text-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--status-error) opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-(--status-error)" />
          </span>
          Live
        </span>

        <h1
          title={eventTitle || 'Live Event'}
          className="truncate text-sm font-semibold text-(--heading-primary) sm:text-base lg:text-lg"
        >
          {eventTitle || 'Live Event'}
        </h1>
      </div>

      {/* Right: participant counter + host tools */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div
          className="flex items-center gap-1.5 rounded-full border border-(--border-muted) bg-(--bg-tertiary) px-2.5 py-1.5 text-xs font-medium text-(--text-primary) sm:gap-2 sm:px-3 sm:text-sm"
          aria-label={`${count} ${count === 1 ? 'participant' : 'participants'}`}
        >
          <Users className="h-3.5 w-3.5 text-(--brand-primary) sm:h-4 sm:w-4" />
          <span className="tabular-nums">{count}</span>
          <span className="hidden sm:inline">{count === 1 ? 'Participant' : 'Participants'}</span>
        </div>

        <EventHostModerationPanel eventId={eventId} hostId={hostId} />
      </div>
    </header>
  );
}