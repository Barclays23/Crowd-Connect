// frontend/src/components/streaming/EventHostModerationPanel.tsx
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { eventServices } from '@/services/eventServices';
import { getApiErrorMessage } from '@/utils/errorMessages.utils';
import { useLocalParticipant, useParticipants } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Mic, MicOff, Settings2, UserX, Video, VideoOff, X } from 'lucide-react';
import { toast } from 'react-toastify';

interface EventHostModerationPanelProps {
  eventId: string;
  hostId?: string;
}

export function EventHostModerationPanel({ eventId, hostId }: EventHostModerationPanelProps) {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const [isOpen, setIsOpen] = useState(false);
  const [kickTarget, setKickTarget] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape (hooks must stay above the early return)
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setKickTarget(null);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setKickTarget(null);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  // Only the host (matched by LiveKit identity) sees the panel
  if (!hostId || localParticipant.identity !== hostId.toString()) return null;

  // Filter out the host so they can't kick themselves
  const attendees = participants.filter((p) => p.identity !== localParticipant.identity);

  const handleMuteTrack = async (
    identity: string,
    trackSid: string,
    trackType: 'audio' | 'video',
  ) => {
    try {
      await eventServices.muteParticipant(eventId, { identity, trackSid });
      toast.success(
        `${trackType === 'audio' ? 'Microphone muted' : 'Camera turned off'} for participant`,
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to mute participant');
    }
  };

  const handleKick = async (identity: string) => {
    try {
      await eventServices.kickParticipant(eventId, { identity });
      toast.success('Participant removed from event');
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to remove participant');
    } finally {
      setKickTarget(null);
    }
  };

  return (
    // static on mobile (dropdown spans the header), relative from `sm` up
    <div ref={wrapperRef} className="sm:relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="gap-1.5 border-(--border-muted) bg-(--bg-tertiary) text-(--text-primary) hover:bg-(--bg-accent) sm:gap-2"
      >
        <Settings2 className="h-4 w-4 text-(--brand-primary)" />
        <span className="hidden sm:inline">Manage Users</span>
        <span className="sm:hidden">Manage</span>
        {attendees.length > 0 && (
          <span className="ml-0.5 rounded-full bg-(--brand-primary) px-1.5 text-[10px] font-bold leading-4 text-(--btn-primary-text)">
            {attendees.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Manage attendees"
          className="absolute inset-x-3 top-full z-50 mt-2 overflow-hidden rounded-xl border border-(--card-border) bg-(--card-bg) ring-1 ring-(--border-default) sm:inset-x-auto sm:right-0 sm:w-80"
        >
          {/* Panel header */}
          <div className="flex items-center justify-between border-b border-(--border-default) bg-(--bg-tertiary) px-3.5 py-2.5">
            <h3 className="text-sm font-semibold text-(--heading-primary)">
              Attendees <span className="text-(--text-tertiary)">({attendees.length})</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setKickTarget(null);
              }}
              aria-label="Close panel"
              className="rounded-md p-1 text-(--text-tertiary) transition-colors hover:bg-(--bg-neutral) hover:text-(--text-primary)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Panel body */}
          {attendees.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-(--text-tertiary)">
              No other users in the room yet.
            </div>
          ) : (
            <ul className="max-h-[60vh] space-y-2 overflow-y-auto p-2.5 sm:max-h-80">
              {attendees.map((p) => {
                const audioTrack = p.getTrackPublication(Track.Source.Microphone);
                const videoTrack = p.getTrackPublication(Track.Source.Camera);
                const displayName = p.name || p.identity;
                const micOn = !!audioTrack && !audioTrack.isMuted;
                const camOn = !!videoTrack && !videoTrack.isMuted;
                const confirming = kickTarget === p.identity;

                return (
                  <li
                    key={p.identity}
                    className="rounded-lg border border-(--border-default) bg-(--bg-secondary) p-2.5"
                  >
                    {/* Identity row */}
                    <div className="mb-2.5 flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--badge-primary-bg) text-xs font-bold uppercase text-(--brand-primary)">
                        {displayName.charAt(0)}
                      </div>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-(--text-primary)">
                        {displayName}
                      </span>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span title={micOn ? 'Mic on' : 'Mic off'}>
                          {micOn ? (
                            <Mic className="h-3.5 w-3.5 text-(--status-success)" />
                          ) : (
                            <MicOff className="h-3.5 w-3.5 text-(--text-tertiary)" />
                          )}
                        </span>
                        <span title={camOn ? 'Camera on' : 'Camera off'}>
                          {camOn ? (
                            <Video className="h-3.5 w-3.5 text-(--status-success)" />
                          ) : (
                            <VideoOff className="h-3.5 w-3.5 text-(--text-tertiary)" />
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    {confirming ? (
                      <div className="rounded-md border border-(--badge-error-border) bg-(--badge-error-bg) p-2">
                        <p className="mb-2 text-xs text-(--badge-error-text)">
                          Remove {displayName} from the event?
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 bg-(--btn-secondary-bg) text-xs text-(--btn-secondary-text) hover:bg-(--btn-secondary-hover)"
                            onClick={() => setKickTarget(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 bg-(--status-error) text-xs text-(--btn-primary-text) hover:bg-(--status-error-hover)"
                            onClick={() => handleKick(p.identity)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 gap-1 bg-(--btn-secondary-bg) px-1.5 text-xs text-(--btn-secondary-text) hover:bg-(--btn-secondary-hover) disabled:opacity-40"
                          disabled={!audioTrack || audioTrack.isMuted}
                          onClick={() =>
                            audioTrack?.trackSid &&
                            handleMuteTrack(p.identity, audioTrack.trackSid, 'audio')
                          }
                        >
                          <MicOff className="h-3.5 w-3.5" />
                          Mute
                        </Button>

                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 gap-1 bg-(--btn-secondary-bg) px-1.5 text-xs text-(--btn-secondary-text) hover:bg-(--btn-secondary-hover) disabled:opacity-40"
                          disabled={!videoTrack || videoTrack.isMuted}
                          onClick={() =>
                            videoTrack?.trackSid &&
                            handleMuteTrack(p.identity, videoTrack.trackSid, 'video')
                          }
                        >
                          <VideoOff className="h-3.5 w-3.5" />
                          Cam
                        </Button>

                        <Button
                          size="sm"
                          className="h-8 gap-1 bg-(--status-error) px-1.5 text-xs text-(--btn-primary-text) hover:bg-(--status-error-hover)"
                          onClick={() => setKickTarget(p.identity)}
                        >
                          <UserX className="h-3.5 w-3.5" />
                          Kick
                        </Button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}