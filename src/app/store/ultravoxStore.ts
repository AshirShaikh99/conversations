import { create } from 'zustand';
import { UltravoxSession, UltravoxSessionStatus } from 'ultravox-client';

// Re-define Transcript if not directly exportable or for augmentation
// Forcing the Transcript type to match the one used in page.tsx
interface CustomTranscript {
  text: string;
  isFinal: boolean;
  speaker: 'user' | 'agent';
  medium: 'voice' | 'text';
}

interface UltravoxState {
  uvSession: UltravoxSession | null;
  sessionStatus: UltravoxSessionStatus | null;
  transcripts: CustomTranscript[];
  isCallActive: boolean;
  error: string | null;
  joinUrl: string | null; // To store the join URL

  initializeSession: () => void;
  setJoinUrl: (url: string) => void;
  startCall: () => Promise<void>;
  leaveCall: () => Promise<void>;
  _setSessionStatus: (status: UltravoxSessionStatus | null) => void;
  _setTranscripts: (transcripts: CustomTranscript[]) => void;
  _setError: (error: string | null) => void;
  _setIsCallActive: (isActive: boolean) => void;
}

export const useUltravoxStore = create<UltravoxState>((set, get) => ({
  uvSession: null,
  sessionStatus: UltravoxSessionStatus.DISCONNECTED,
  transcripts: [],
  isCallActive: false,
  error: null,
  joinUrl: null,

  initializeSession: () => {
    if (get().uvSession) {
      // Prevent re-initialization if session already exists
      // console.log('Ultravox session already initialized.');
      return;
    }
    const session = new UltravoxSession();
    set({ uvSession: session });

    session.addEventListener('status', () => {
      const currentStatus = session.status;
      get()._setSessionStatus(currentStatus);
      if (currentStatus === UltravoxSessionStatus.DISCONNECTED) {
        get()._setIsCallActive(false);
        // Potentially clear transcripts or reset other states as needed
      }
      console.log('Ultravox Session status changed (store): ', currentStatus);
    });

    session.addEventListener('transcripts', () => {
      // Assuming session.transcripts conforms to CustomTranscript[]
      get()._setTranscripts([...(session.transcripts as CustomTranscript[] || [])]);
      console.log('Ultravox Transcripts updated (store): ', session.transcripts);
    });
    console.log('Ultravox session initialized via store.');
  },

  setJoinUrl: (url: string) => {
    set({ joinUrl: url });
  },

  startCall: async () => {
    const { uvSession, joinUrl } = get();
    if (!uvSession) {
      get()._setError('Ultravox session not initialized.');
      console.error('Ultravox session not initialized.');
      return;
    }
    if (!joinUrl) {
      get()._setError('Join URL is not set.');
      console.error('Join URL is not set.');
      // For demonstration, we'll alert here, but in a real app, this might be handled differently.
      alert('Ultravox Join URL is missing. Please configure it before starting a call.');
      return;
    }

    try {
      get()._setSessionStatus(UltravoxSessionStatus.CONNECTING);
      get()._setIsCallActive(true); // Tentatively set active, status listener will confirm
      get()._setError(null);
      await uvSession.joinCall(joinUrl);
      // Status listener will update to IDLE, LISTENING, etc.
      console.log('Call joined successfully via store.');
    } catch (e: unknown) {
      console.error('Error starting call (store):', e);
      if (e instanceof Error) {
        get()._setError(e.message);
      } else {
        get()._setError('Failed to start call due to an unknown error.');
      }
      get()._setSessionStatus(UltravoxSessionStatus.DISCONNECTED);
      get()._setIsCallActive(false);
    }
  },

  leaveCall: async () => {
    const { uvSession } = get();
    if (uvSession && get().sessionStatus !== UltravoxSessionStatus.DISCONNECTED) {
      try {
        get()._setSessionStatus(UltravoxSessionStatus.DISCONNECTING);
        await uvSession.leaveCall();
        // Status listener should set to DISCONNECTED
        console.log('Call left successfully via store.');
      } catch (e: unknown) {
        console.error('Error leaving call (store):', e);
        if (e instanceof Error) {
          get()._setError(e.message);
        } else {
          get()._setError('Failed to leave call due to an unknown error.');
        }
        // Even if leaveCall fails, we might want to force status to DISCONNECTED client-side
        get()._setSessionStatus(UltravoxSessionStatus.DISCONNECTED);
        get()._setIsCallActive(false);
      }
    } else {
      console.warn('No active call to leave or session not initialized.');
      // Ensure state is consistent
      get()._setSessionStatus(UltravoxSessionStatus.DISCONNECTED);
      get()._setIsCallActive(false);
    }
  },

  // Internal setters
  _setSessionStatus: (status) => set({ sessionStatus: status, error: null }), // Clear error on status change
  _setTranscripts: (transcripts) => set({ transcripts }),
  _setError: (error) => set({ error }),
  _setIsCallActive: (isActive) => set({ isCallActive: isActive }),
}));

// Ensure the store initializes the session once when the app loads.
// This depends on how/where you want to trigger initialization.
// If it should be available globally as soon as the app starts,
// you can call it here, but it's often better to call it from a root component's useEffect.
// useUltravoxStore.getState().initializeSession(); 