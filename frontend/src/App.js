import { useState } from "react";
import "./App.css";
import Bar from "./Bar.js";

function App() {
  const [heights, setHeights] = useState([60, 70, 80, 90, 100]);
  const [count, setCount] = useState(5);
  const [index, setIndex] = useState(0);
  const [activePair, setActivePair] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [sortedFrom, setSortedFrom] = useState(null);
  const [speedMs, setSpeedMs] = useState(250);

  //helper to make random ints
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const makeRandomArray = (len) =>
    Array.from({ length: len }, () => rand(30, 220));

  const handleNewArray = () => {
    setHeights(makeRandomArray(count));
    setIndex((i) => Math.min(Math.max(0, i), Math.max(0, count - 2)));
    setSortedFrom(null);
  };
  const handleCountChange = (e) => {
    const nextCount = Math.max(1, Math.min(50, Number(e.target.value) || 1));
    setCount(nextCount);
    setHeights(makeRandomArray(nextCount)); //auto refresh bars to match new count
    setIndex((i) => Math.min(Math.max(0, i), Math.max(0, nextCount - 2)));
    setSortedFrom(null);
  };

  const handleCompareSwapAtIndex = () => {
    if (heights.length < 2) return;
    const maxI = Math.max(0, heights.length - 2);
    const i = Math.max(0, Math.min(index, maxI));
    setActivePair([i, i + 1]);
    setHeights((hs) => {
      const next = [...hs];
      if (next[i] > next[i + 1]) {
        [next[i], next[i + 1]] = [next[i + 1], next[i]];
      }
      return next;
    });
    setTimeout(() => setActivePair([]), STEP_MS);
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const STEP_MS = 250;

  const handleBubblePass = async () => {
    if (isRunning || heights.length < 2) return;
    setIsRunning(true);

    let a = [...heights];
    const last = a.length - 1;

    for (let i = 0; i < last; i++) {
      setActivePair([i, i + 1]);

      if (a[i] > a[i + 1]) {
        [a[i], a[i + 1]] = [a[i + 1], a[i]];
        setHeights([...a]);
      } else {
        setHeights((hs) => hs);
      }
      await sleep(STEP_MS);
    }
    setSortedFrom((prev) =>
      prev == null ? a.length - 1 : Math.max(0, prev - 1)
    );
    setActivePair([]);
    setIsRunning(false);
  };

  const handleBubbleSort = async () => {
    if (isRunning || heights.length < 2) {
      return;
    }
    setIsRunning(true);

    let a = [...heights];
    for (let end = a.length - 1; end > 0; end--) {
      let swapped = false;

      for (let i = 0; i < end; i++) {
        setActivePair([i, i + 1]);
        if (a[i] > a[i + 1]) {
          [a[i], a[i + 1]] = [a[i + 1], a[i]];
          swapped = true;
          setHeights([...a]);
        } else {
          setHeights((hs) => hs);
        }
        await sleep(STEP_MS);
      }
      setSortedFrom(end);
      if (!swapped) {
        setSortedFrom(0);
        break;
      }
    }
    setActivePair([]);
    setIsRunning(false);
  };
  const maxI = Math.max(0, heights.length - 2);

  const handleBubbleSortJava = async () => {
    if (isRunning || heights.length < 2) return;
    setIsRunning(true);
    try {
      const res = await fetch("http://localhost:8080/api/sort/bubble", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ array: heights }),
      });
      const data = await res.json();
      setHeights(data.sorted); // replace with Java-sorted array
      setSortedFrom(0); // mark all as sorted (green)
      setActivePair([]); // clear any highlight
    } catch (e) {
      alert("Java sort failed. Is the server on :8080?\n" + e.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleBubbleSortJavaAnimated = async () => {
    if (isRunning || heights.length < 2) return;
    setIsRunning(true);
    setActivePair([]);
    setSortedFrom(null);

    try {
      // 1) fetch steps from Java
      const res = await fetch("http://localhost:8080/api/sort/bubble/steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ array: heights }),
      });
      const data = await res.json(); // { steps: [{i,j,swap},...], sorted: [...] }

      // 2) play them back locally
      let a = [...heights];

      // simple sleep helper (if you don’t already have one in this file)
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

      for (const step of data.steps) {
        const { i, j, swap } = step;

        // highlight compared pair
        setActivePair([i, j]);

        if (swap) {
          // mirror the swap locally so the bars move
          const tmp = a[i];
          a[i] = a[j];
          a[j] = tmp;
          setHeights([...a]);
        } else {
          // force a re-render so highlight appears even without swap
          setHeights((hs) => hs);
        }

        // wait according to your speed slider
        await sleep(speedMs);
      }

      // 3) done — mark all as sorted
      setActivePair([]);
      setHeights(data.sorted); // already equals a, but keeps things consistent
      setSortedFrom(0); // turn all bars green
    } catch (e) {
      alert("Animated Java sort failed: " + e.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="App">
      <h1> Sorting Visualizer </h1>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <button onClick={handleNewArray} disabled={isRunning}>
          New Array
        </button>
        <label>
          Bars:&nbsp;
          <input
            type="number"
            min="1"
            max="50"
            value={count}
            onChange={handleCountChange}
            style={{ width: 64 }}
            disabled={isRunning}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          Speed(ms) : <span> {speedMs} </span>
          <input
            type="range"
            min="0"
            max="600"
            value={speedMs}
            onChange={(e) => setSpeedMs(Number(e.target.value))}
            disabled={isRunning}
          />
        </label>

        <label>
          i (0...{maxI}):&nbsp;
          <input
            type="number"
            min="0"
            max={maxI}
            value={index}
            onChange={(e) => {
              const v = Number(e.target.value);
              const clamped = Number.isNaN(v)
                ? 0
                : Math.max(0, Math.min(v, maxI));
              setIndex(clamped);
            }}
            style={{ width: 64 }}
            disabled={heights.length < 2}
          />
        </label>

        <button
          onClick={handleCompareSwapAtIndex}
          disabled={heights.length < 2}
        >
          Compare and swap at i
        </button>

        <button
          onClick={handleBubblePass}
          disabled={heights.length < 2 || isRunning}
        >
          One bubble pass
        </button>

        <button
          onClick={handleBubbleSort}
          disabled={heights.length < 2 || isRunning}
        >
          Bubble Sort
        </button>

        <button
          onClick={handleBubbleSortJava}
          disabled={heights.length < 2 || isRunning}
        >
          Bubble Sort (Java)
        </button>

        <button
          onClick={handleBubbleSortJavaAnimated}
          disabled={heights.length < 2 || isRunning}
        >
          Bubble Sort (Java • animated)
        </button>
      </div>

      <div className="board">
        {heights.map((h, i) => (
          <Bar
            key={i}
            height={h}
            active={activePair.includes(i)}
            sorted={sortedFrom !== null && i >= sortedFrom}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
