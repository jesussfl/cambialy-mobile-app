import { useCallback, useEffect, useRef } from "react";
import { Easing, cancelAnimation, runOnJS, runOnUI, useSharedValue, withTiming } from "react-native-reanimated";

type UseSlideTimerParams = {
  activeIndex: number;
  durationMs: number;
  onElapsed: () => void;
};

/**
 * Drives the countdown for the slide currently on screen.
 *
 * `timerProgress` runs 0 -> 1 across the active slide's duration and is the
 * only time-driven animated value in the feature; scroll position still owns
 * every other animation. It restarts from zero whenever the active slide
 * changes, and pauses while the user is touching the deck so a slow reader is
 * never advanced mid-swipe.
 */
export function useSlideTimer({ activeIndex, durationMs, onElapsed }: UseSlideTimerParams) {
  const timerProgress = useSharedValue(0);
  const isPausedRef = useRef(false);

  // Kept in a ref so restarting the timer never depends on the identity of a
  // callback that closes over the current slide index. Synced in an effect
  // rather than during render, and declared first so the timer effect below
  // always fires against the current callback.
  const onElapsedRef = useRef(onElapsed);

  useEffect(() => {
    onElapsedRef.current = onElapsed;
  }, [onElapsed]);

  const notifyElapsed = useCallback(() => {
    onElapsedRef.current();
  }, []);

  /**
   * Starts a run on the UI thread, either from zero or from wherever a paused
   * run left off. Reading and writing the shared value there keeps the timer
   * off the JS thread, so a busy render never stretches a slide's dwell time.
   */
  const startTimer = useCallback(
    (resumeFromCurrent: boolean) => {
      runOnUI((shouldResume: boolean, totalMs: number) => {
        const from = shouldResume ? timerProgress.value : 0;
        const remainingMs = totalMs * (1 - from);

        if (remainingMs <= 0) {
          return;
        }

        // Assigning a new animation supersedes any run already in flight, so no
        // explicit cancel is needed here.
        timerProgress.value = from;
        timerProgress.value = withTiming(1, { duration: remainingMs, easing: Easing.linear }, (finished) => {
          // A cancelled run means the slide changed or the user grabbed the
          // deck; only a run that reached the end should advance the carousel.
          if (finished) {
            runOnJS(notifyElapsed)();
          }
        });
      })(resumeFromCurrent, durationMs);
    },
    [durationMs, notifyElapsed, timerProgress],
  );

  useEffect(() => {
    isPausedRef.current = false;
    startTimer(false);

    return () => {
      cancelAnimation(timerProgress);
    };
  }, [activeIndex, startTimer, timerProgress]);

  const pauseTimer = useCallback(() => {
    if (isPausedRef.current) {
      return;
    }

    isPausedRef.current = true;
    cancelAnimation(timerProgress);
  }, [timerProgress]);

  const resumeTimer = useCallback(() => {
    if (!isPausedRef.current) {
      return;
    }

    isPausedRef.current = false;
    startTimer(true);
  }, [startTimer]);

  return { pauseTimer, resumeTimer, timerProgress };
}
