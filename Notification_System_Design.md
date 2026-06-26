# Notification System Design

## Stage 1

### Problem
Users are overwhelmed by the high volume of campus notifications. We need a Priority Inbox that always shows the top N most important unread notifications, where priority is based on notification type and recency.

### Priority Scoring

Each notification has a type — Placement, Result, or Event. These are weighted as:

| Type | Weight |
|------|--------|
| Placement | 3 (highest) |
| Result | 2 |
| Event | 1 (lowest) |

When two notifications share the same type, the more recent one (newer timestamp) takes precedence.

### Approach — Min-Heap of Size N

I used a **min-heap bounded to size N** (where N = 10 by default) to efficiently find the top N priority notifications.

**Why a heap instead of just sorting?**

Sorting the entire list works fine when the dataset is small (like the 20 notifications we get from the API right now). But the problem says "new notifications will keep coming in" — so we need something that handles a growing stream efficiently.

With a min-heap of size N:
- The root always holds the **lowest-priority item** currently in the top N
- When a new notification arrives, we compare it against the root
- If the new one has higher priority, we replace the root and re-heapify
- Each insertion takes **O(log N)** instead of re-sorting the full list at **O(M log M)** where M is the total notification count

After processing all notifications, we extract and sort the heap contents (only N items) to get the final ordered list.

### How the Min-Heap Works

The heap uses a custom `_isLower(a, b)` comparator that returns true when `a` has strictly lower priority than `b`. This ensures:
1. Lower-priority items bubble up to the root
2. When a higher-priority item arrives and the heap is full, it replaces the root (weakest item)
3. The heap always retains the N strongest items

### Handling New Notifications

Since notifications keep coming, the heap-based approach is ideal:
- We don't need to re-sort everything when a new notification arrives
- Just call `heap.insert(newNotification)` — O(log N)
- The heap auto-evicts the weakest if the new one is better
- To get the current top N at any time, call `heap.getSorted()`

### Output Screenshot

Running `node priority-notifications.js` produces the top 10 notifications sorted by priority:

```
=== Top 10 Priority Notifications ===

1. [Placement] (weight=3) — most recent placement
2. [Placement] (weight=3) — next recent placement
...
10. [Result] (weight=2) — fills remaining slots
```

Placements dominate the top slots due to their weight advantage. Results appear next, and Events only show up if there aren't enough higher-weighted notifications to fill the top N.
