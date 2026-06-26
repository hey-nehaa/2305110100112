# Notification System Design

## Stage 1

### The Problem

Users get too many notifications and miss the important ones. We need to show the top N (like top 10) most important notifications first based on their type and how recent they are.

### How I'm Determining Priority

I'm using two factors:
- **Type weight** — Placement notifications are most important (weight 3), Results are next (weight 2), Events are least (weight 1)
- **Recency** — newer notifications rank higher than older ones of the same type

To combine both into a single comparable number, I do:
```
score = typeWeight * 1e15 + timestamp_in_ms
```
This way type always dominates, but within the same type, newer ones win.

### Why I Used a Min-Heap

The straightforward approach would be to sort all notifications and take the first 10. That works but it's O(n log n) every time.

Since the problem says new notifications keep coming in, I went with a min-heap of fixed size 10:
- The heap root always has the weakest item in my top 10
- When a new notification comes in, I compare it with the root
- If the new one is better, swap it in and re-heapify — that's O(log 10) which is basically O(1)
- No need to re-sort the whole thing every time

So for a stream of M incoming notifications, total cost is O(M log N) instead of O(M * N log N) if I re-sorted each time.

### How It Works in Code

1. Fetch all notifications from the API
2. Push each one into a `MinHeap(10)`
3. The heap keeps only the 10 strongest, automatically evicting weaker ones
4. Call `heap.sorted()` to get them in order

### Output

_(screenshots to be added)_
