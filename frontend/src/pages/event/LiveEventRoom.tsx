// frontend/src/pages/event/LiveEventRoom.tsx
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';

import { eventServices } from '@/services/eventServices';
import { getApiErrorMessage } from '@/utils/errorMessages.utils';
import { LoadingSpinner1 } from '@/components/shared/LoadingSpinner1';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Clock } from 'lucide-react';
import type { ApiResponse } from '@/types/common.types';
import type { JoinOnlineEventResponse } from '@/types/streaming.types';
import type { IEventState } from '@/types/event.types';
import { isLiveStreamingRoomOpen } from '@/utils/event.utils';
import { formatCountdownTimer } from '@/utils/dateAndTime.utils';
import { ONLINE_EARLY_JOIN_BUFFER_MS } from '@/constants/checkin.constants';
import { toast } from 'react-toastify';
import { playNotificationSound } from '@/lib/audio-utils';
import { LiveRoomHeader } from '@/components/streaming/LiveRoomHeader';

/**
 * Maps LiveKit's own CSS variables to YOUR theme variables, so the whole
 * VideoConference UI (tiles, control bar, chat, buttons) follows light/dark mode.
 */
const lkThemeVars = {
  '--lk-bg': 'var(--bg-primary)',
  '--lk-bg2': 'var(--bg-secondary)',
  '--lk-bg3': 'var(--bg-tertiary)',
  '--lk-fg': 'var(--text-primary)',
  '--lk-fg2': 'var(--text-secondary)',
  '--lk-border-color': 'var(--border-default)',
  '--lk-control-bg': 'var(--bg-secondary)',
  '--lk-control-hover-bg': 'var(--bg-tertiary)',
  '--lk-control-active-bg': 'var(--bg-tertiary)',
  '--lk-control-active-hover-bg': 'var(--bg-tertiary)',
  '--lk-accent-bg': 'var(--brand-primary)',
  '--lk-accent2': 'var(--brand-primary-hover)',
  '--lk-accent-fg': 'var(--btn-primary-text)',
  '--lk-danger': 'var(--status-error)',
  '--lk-danger-fg': 'var(--btn-primary-text)',
  '--lk-success-bg': 'var(--status-success)',
} as CSSProperties;

const EARLY_JOIN_MINUTES = ONLINE_EARLY_JOIN_BUFFER_MS / (60 * 1000);

/* ---------- Small shared layout pieces for the non-room states ---------- */

function StateScreen({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-(--bg-primary) p-4 sm:p-6">
      {/* soft brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-(--brand-primary)/20 blur-3xl sm:h-96 sm:w-96"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 right-0 h-64 w-64 rounded-full bg-(--accent-violet)/15 blur-3xl sm:h-80 sm:w-80"
      />
      {children}
    </div>
  );
}

function StateCard({
  icon,
  iconClassName,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  iconClassName: string;
  title: string;
  description: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="relative w-full max-w-md rounded-2xl border border-(--card-border) bg-(--card-bg) p-6 text-center sm:p-8">
      <div
        className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full sm:mb-5 sm:h-20 sm:w-20 ${iconClassName}`}
      >
        {icon}
      </div>
      <h2 className="mb-2 text-xl font-bold text-(--heading-primary) sm:text-2xl">{title}</h2>
      <p className="mb-6 text-sm leading-relaxed text-(--text-secondary) sm:text-base">
        {description}
      </p>
      {children}
    </div>
  );
}

/* ------------------------------ Page ------------------------------ */

export default function LiveEventRoom() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [connectionData, setConnectionData] = useState<JoinOnlineEventResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Timer states
  const [event, setEvent] = useState<IEventState | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isEarly, setIsEarly] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const connectToRoom = async () => {
      if (!eventId) return;

      try {
        const eventRes: ApiResponse<IEventState> = await eventServices.getEventDetails(eventId);
        const eventData = eventRes.data;

        if (isMounted) setEvent(eventData);

        const isOpen = isLiveStreamingRoomOpen(eventData.startDateTime, eventData.endDateTime);

        if (!isOpen) {
          const startMs = new Date(eventData.startDateTime).getTime();
          const joinOpenTimeMs = startMs - ONLINE_EARLY_JOIN_BUFFER_MS;
          const nowMs = Date.now();

          // Only warn when it's genuinely too early (not when the event already ended)
          if (nowMs < joinOpenTimeMs) {
            if (isMounted) {
              setIsEarly(true);
              toast.warning(
                `The live room isn't open yet. Check back ${EARLY_JOIN_MINUTES} minutes before the start time.`,
                { onOpen: () => playNotificationSound() },
              );
            }
            return; // Stop execution, wait for timer
          }
        }

        // Room is open, proceed to generate connection token
        if (isMounted) setIsEarly(false);
        const response: ApiResponse<JoinOnlineEventResponse> =
          await eventServices.joinOnlineEvent(eventId);

        if (isMounted && response.data) {
          setConnectionData(response.data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(getApiErrorMessage(err) || 'Failed to join the live event.');
        }
      }
    };

    connectToRoom();

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  // Countdown while the room is not open yet
  useEffect(() => {
    if (!isEarly || !event) return;

    const updateTimer = () => {
      const startMs = new Date(event.startDateTime).getTime();
      const joinOpenTimeMs = startMs - ONLINE_EARLY_JOIN_BUFFER_MS;
      const nowMs = Date.now();

      if (nowMs >= joinOpenTimeMs) {
        // Timer finished, reload to safely attempt connection & initialize WebRTC
        window.location.reload();
      } else {
        setTimeRemaining(joinOpenTimeMs - nowMs);
      }
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [isEarly, event]);

  /* ---------- Early access ---------- */
  if (isEarly && event) {
    return (
      <StateScreen>
        <StateCard
          icon={<Clock className="h-8 w-8 sm:h-10 sm:w-10" />}
          iconClassName="bg-(--badge-primary-bg) text-(--brand-primary)"
          title="Room Not Open Yet"
          description={`The live room opens ${EARLY_JOIN_MINUTES} minutes before the event starts.`}
        >
          {event.title && (
            <p className="mb-4 truncate text-xs font-medium uppercase tracking-wide text-(--text-tertiary) sm:text-sm">
              {event.title}
            </p>
          )}
          <div
            role="timer"
            aria-live="off"
            className="mb-6 rounded-xl border border-(--border-muted) bg-(--bg-primary) px-4 py-4 font-mono text-3xl font-bold tabular-nums text-(--brand-primary) sm:mb-8 sm:py-5 sm:text-4xl"
          >
            {formatCountdownTimer(timeRemaining)}
          </div>
          <Button onClick={() => navigate(-1)} variant="default" className="w-full gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </StateCard>
      </StateScreen>
    );
  }

  /* ---------- Error (no valid booking, already ended, etc.) ---------- */
  if (error) {
    return (
      <StateScreen>
        <StateCard
          icon={<AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10" />}
          iconClassName="bg-(--badge-error-bg) text-(--status-error)"
          title="Access Denied"
          description={error}
        >
          <Button onClick={() => navigate(-1)} variant="default" className="w-full gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </StateCard>
      </StateScreen>
    );
  }

  /* ---------- Loading (waiting for backend token) ---------- */
  if (!connectionData) {
    return (
      <StateScreen>
        <div className="relative">
          <LoadingSpinner1
            size="lg"
            message="Securing connection..."
            subMessage="Generating your access token"
          />
        </div>
      </StateScreen>
    );
  }

  /* ---------- Success: render the WebRTC room ---------- */
  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-(--bg-primary) pb-5">
      <LiveKitRoom
        video={false} // start with camera off
        audio={false} // start with mic off
        token={connectionData.token}
        serverUrl={connectionData.serverUrl}
        // When the user clicks "Leave" in the LiveKit UI, redirect them
        onDisconnected={() => navigate(`/events/${eventId}`)}
        className="flex min-h-0 flex-1 flex-col"
        style={lkThemeVars}
        data-lk-theme="default"
      >
        <LiveRoomHeader
          eventId={eventId!}
          eventTitle={event?.title}
          hostId={event?.organizer?.hostId?.toString()}
        />

        {/* Header sits in normal flow, so the video grid never hides underneath it */}
        <div className="min-h-0 flex-1">
          {/* Renders the video grid, chat, and control bar */}
          <VideoConference />
        </div>

        {/* Lets you hear other participants */}
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}