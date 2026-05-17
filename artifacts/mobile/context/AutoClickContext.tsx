import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export type StepType =
  | "tap_gift"
  | "watch_ad"
  | "skip_ad"
  | "close_x"
  | "wait"
  | "tap_custom";

export interface Step {
  id: string;
  type: StepType;
  label: string;
  delay: number;
  duration?: number;
  x?: number;
  y?: number;
}

export interface Sequence {
  id: string;
  name: string;
  steps: Step[];
  loopCount: number;
  createdAt: number;
  runsCompleted: number;
}

export type RunStatus = "idle" | "running" | "paused" | "done";

interface RunState {
  sequenceId: string;
  currentStep: number;
  currentLoop: number;
  status: RunStatus;
  progress: number;
}

interface AutoClickContextValue {
  sequences: Sequence[];
  runState: RunState | null;
  totalRuns: number;
  addSequence: (seq: Sequence) => void;
  updateSequence: (seq: Sequence) => void;
  deleteSequence: (id: string) => void;
  startRun: (sequenceId: string) => void;
  pauseRun: () => void;
  resumeRun: () => void;
  stopRun: () => void;
  onStepComplete: (cb: (step: Step, stepIndex: number) => void) => void;
}

const AutoClickContext = createContext<AutoClickContextValue | null>(null);

const STORAGE_KEY = "@autoclickpro:sequences";
const RUNS_KEY = "@autoclickpro:totalruns";

const DEFAULT_SEQUENCES: Sequence[] = [
  {
    id: "preset_gift_ad",
    name: "Presente + Anuncio",
    loopCount: 1,
    createdAt: Date.now(),
    runsCompleted: 0,
    steps: [
      { id: "s1", type: "tap_gift", label: "Clicar no Presente", delay: 1000 },
      { id: "s2", type: "watch_ad", label: "Assistir Anuncio", delay: 500, duration: 30000 },
      { id: "s3", type: "skip_ad", label: "Pular Anuncio", delay: 500 },
      { id: "s4", type: "close_x", label: "Fechar (X)", delay: 800 },
    ],
  },
];

function makeId() {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

export function AutoClickProvider({ children }: { children: React.ReactNode }) {
  const [sequences, setSequences] = useState<Sequence[]>(DEFAULT_SEQUENCES);
  const [runState, setRunState] = useState<RunState | null>(null);
  const [totalRuns, setTotalRuns] = useState(0);
  const stepCallbackRef = useRef<((step: Step, idx: number) => void) | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved: Sequence[] = JSON.parse(raw);
          setSequences([DEFAULT_SEQUENCES[0], ...saved.filter((s) => s.id !== "preset_gift_ad")]);
        }
        const runs = await AsyncStorage.getItem(RUNS_KEY);
        if (runs) setTotalRuns(parseInt(runs, 10));
      } catch {}
    })();
  }, []);

  const saveSequences = useCallback(async (seqs: Sequence[]) => {
    const custom = seqs.filter((s) => s.id !== "preset_gift_ad");
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
  }, []);

  const addSequence = useCallback(
    (seq: Sequence) => {
      const updated = [...sequences, { ...seq, id: makeId() }];
      setSequences(updated);
      saveSequences(updated);
    },
    [sequences, saveSequences]
  );

  const updateSequence = useCallback(
    (seq: Sequence) => {
      const updated = sequences.map((s) => (s.id === seq.id ? seq : s));
      setSequences(updated);
      saveSequences(updated);
    },
    [sequences, saveSequences]
  );

  const deleteSequence = useCallback(
    (id: string) => {
      const updated = sequences.filter((s) => s.id !== id);
      setSequences(updated);
      saveSequences(updated);
    },
    [sequences, saveSequences]
  );

  const onStepComplete = useCallback((cb: (step: Step, idx: number) => void) => {
    stepCallbackRef.current = cb;
  }, []);

  const stopRun = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    isPausedRef.current = false;
    setRunState(null);
  }, []);

  const pauseRun = useCallback(() => {
    isPausedRef.current = true;
    setRunState((prev) => (prev ? { ...prev, status: "paused" } : null));
  }, []);

  const resumeRun = useCallback(() => {
    isPausedRef.current = false;
    setRunState((prev) => (prev ? { ...prev, status: "running" } : null));
  }, []);

  const startRun = useCallback(
    (sequenceId: string) => {
      const seq = sequences.find((s) => s.id === sequenceId);
      if (!seq) return;

      if (timerRef.current) clearTimeout(timerRef.current);
      isPausedRef.current = false;

      const totalSteps = seq.steps.length * seq.loopCount;
      let globalStep = 0;

      setRunState({
        sequenceId,
        currentStep: 0,
        currentLoop: 0,
        status: "running",
        progress: 0,
      });

      const runStep = (loopIndex: number, stepIndex: number) => {
        if (isPausedRef.current) {
          timerRef.current = setTimeout(() => runStep(loopIndex, stepIndex), 200);
          return;
        }

        if (stepIndex >= seq.steps.length) {
          const nextLoop = loopIndex + 1;
          if (nextLoop >= seq.loopCount) {
            setRunState(null);
            setSequences((prev) =>
              prev.map((s) =>
                s.id === sequenceId ? { ...s, runsCompleted: s.runsCompleted + 1 } : s
              )
            );
            setTotalRuns((t) => {
              const next = t + 1;
              AsyncStorage.setItem(RUNS_KEY, next.toString());
              return next;
            });
            return;
          }
          runStep(nextLoop, 0);
          return;
        }

        const step = seq.steps[stepIndex];
        globalStep++;

        setRunState({
          sequenceId,
          currentStep: stepIndex,
          currentLoop: loopIndex,
          status: "running",
          progress: globalStep / totalSteps,
        });

        if (stepCallbackRef.current) {
          stepCallbackRef.current(step, stepIndex);
        }

        const waitTime = step.delay + (step.duration ?? 0);
        timerRef.current = setTimeout(() => {
          runStep(loopIndex, stepIndex + 1);
        }, waitTime);
      };

      runStep(0, 0);
    },
    [sequences]
  );

  return (
    <AutoClickContext.Provider
      value={{
        sequences,
        runState,
        totalRuns,
        addSequence,
        updateSequence,
        deleteSequence,
        startRun,
        pauseRun,
        resumeRun,
        stopRun,
        onStepComplete,
      }}
    >
      {children}
    </AutoClickContext.Provider>
  );
}

export function useAutoClick() {
  const ctx = useContext(AutoClickContext);
  if (!ctx) throw new Error("useAutoClick must be used inside AutoClickProvider");
  return ctx;
}
