import { useEffect, useState } from "react";

type BrowserStats = {
  memoryUsedMb: number | null;
  memoryTotalMb: number | null;
  memoryLimitMb: number | null;
  fps: number | null;
  cpuThreads: number | null;
};

type ChromePerformanceMemory = {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
};

type PerformanceWithMemory = Performance & {
  memory?: ChromePerformanceMemory;
};

export function useBrowserStats(updateMs = 1000): BrowserStats {
  const [stats, setStats] = useState<BrowserStats>({
    memoryUsedMb: null,
    memoryTotalMb: null,
    memoryLimitMb: null,
    fps: null,
    cpuThreads:
      typeof navigator !== "undefined"
        ? navigator.hardwareConcurrency ?? null
        : null,
  });

  useEffect(() => {
    let frameCount = 0;
    let lastFpsTime = performance.now();
    let currentFps: number | null = null;
    let rafId = 0;
    let intervalId: number | undefined;

    const loop = () => {
      frameCount++;

      const now = performance.now();
      const elapsed = now - lastFpsTime;

      if (elapsed >= 1000) {
        currentFps = Math.round((frameCount * 1000) / elapsed);
        frameCount = 0;
        lastFpsTime = now;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    intervalId = window.setInterval(() => {
      const perf = performance as PerformanceWithMemory;
      const memory = perf.memory;

      setStats({
        memoryUsedMb: memory ? bytesToMb(memory.usedJSHeapSize) : null,
        memoryTotalMb: memory ? bytesToMb(memory.totalJSHeapSize) : null,
        memoryLimitMb: memory ? bytesToMb(memory.jsHeapSizeLimit) : null,
        fps: currentFps,
        cpuThreads: navigator.hardwareConcurrency ?? null,
      });
    }, updateMs);

    return () => {
      cancelAnimationFrame(rafId);

      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, [updateMs]);

  return stats;
}

function bytesToMb(value: number): number {
  return Math.round(value / 1024 / 1024);
}