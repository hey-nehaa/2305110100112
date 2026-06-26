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

Running `node priority-notifications.js`:

```
Top 10 Priority Notifications:

  1. [Placement] CSX Corporation hiring (2026-06-25 22:42:52)
  2. [Placement] Berkshire Hathaway Inc. hiring (2026-06-25 22:42:34)
  3. [Placement] Broadcom Inc. hiring (2026-06-25 20:42:07)
  4. [Placement] PayPal Holdings Inc. hiring (2026-06-25 19:11:58)
  5. [Placement] Amgen Inc. hiring (2026-06-25 18:11:49)
  6. [Placement] PayPal Holdings Inc. hiring (2026-06-25 11:14:13)
  7. [Placement] Meta Platforms Inc. hiring (2026-06-25 10:43:19)
  8. [Placement] Visa Inc. hiring (2026-06-25 07:14:04)
  9. [Result] internal (2026-06-25 20:11:31)
  10. [Result] external (2026-06-25 19:42:16)
```

Placements take all the top spots because of their weight (3 vs 2 vs 1). The two Results that snuck in are there because there weren't enough Placements to fill all 10 slots.

### Screenshots

![All Notifications Page](media/all-notifications.png)

![Priority Inbox Page](media/priority-inbox.png)

## Stage 2

### Frontend App

Took over the scaffolded React app from the previous developer. The main issues I found and fixed:
- `useNotifications` hook had an infinite re-render loop (notifications array as useEffect dependency)
- `NotificationsPage` had broken loading/error conditionals
- `NotificationFilter` wasn't wired up (onChange was missing)
- No `NotificationCard` component existed
- API layer was incomplete

The app now has two pages:
- **All Notifications** (`/`) — shows every notification with type filter
- **Priority Inbox** (`/priority`) — shows top N sorted by weight+recency, with adjustable limit (5/10/15/20) and type filter

Read/unread tracking uses localStorage — clicking an unread notification marks it as read. Unread ones have a blue left border and darker background.

### Video Demos

#### Desktop View
<video src="media/desktop.mp4" width="100%" controls></video>

#### Mobile View
<video src="media/mobile.mp4" width="100%" controls></video>

