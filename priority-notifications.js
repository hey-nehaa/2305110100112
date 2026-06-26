import { initLogger, Log } from "./logging-middleware/index.js";

const BASE_URL = "http://4.224.186.213/evaluation-service";

const creds = {
  email: "neha.kumari2023@glbajajgroup.org",
  name: "Neha Kumari",
  rollNo: "2305110100112",
  accessCode: "xxkJnk",
  clientID: "86e346f6-e68b-4f94-bed3-cdefb4b6a8f7",
  clientSecret: "xKYFtjTgWehgdFXy",
};

initLogger(creds);

const TYPE_WEIGHT = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function comparePriority(a, b) {
  const wA = TYPE_WEIGHT[a.Type] || 0;
  const wB = TYPE_WEIGHT[b.Type] || 0;

  if (wA !== wB) return wB - wA;

  const tA = new Date(a.Timestamp).getTime();
  const tB = new Date(b.Timestamp).getTime();
  return tB - tA;
}

// min-heap that keeps the N highest-priority items
// the root always holds the lowest-priority item in the heap
// so when a better item comes in, we can quickly evict the weakest
class MinHeap {
  constructor(maxSize) {
    this.heap = [];
    this.maxSize = maxSize;
  }

  _isLower(a, b) {
    const wA = TYPE_WEIGHT[a.Type] || 0;
    const wB = TYPE_WEIGHT[b.Type] || 0;
    if (wA !== wB) return wA < wB;
    const tA = new Date(a.Timestamp).getTime();
    const tB = new Date(b.Timestamp).getTime();
    return tA < tB;
  }

  insert(item) {
    if (this.heap.length < this.maxSize) {
      this.heap.push(item);
      this._bubbleUp(this.heap.length - 1);
    } else if (this._isLower(this.heap[0], item)) {
      this.heap[0] = item;
      this._sinkDown(0);
    }
  }

  getSorted() {
    return [...this.heap].sort(comparePriority);
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this._isLower(this.heap[i], this.heap[parent])) {
        [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
        i = parent;
      } else break;
    }
  }

  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this._isLower(this.heap[left], this.heap[smallest]))
        smallest = left;
      if (right < n && this._isLower(this.heap[right], this.heap[smallest]))
        smallest = right;
      if (smallest !== i) {
        [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
        i = smallest;
      } else break;
    }
  }
}

async function getToken() {
  const res = await fetch(`${BASE_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(creds),
  });
  const data = await res.json();
  return data.access_token;
}

async function fetchNotifications(token) {
  const res = await fetch(`${BASE_URL}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.notifications || [];
}

async function main() {
  const N = 10;

  await Log("backend", "info", "service", "starting priority notification finder");

  const token = await getToken();
  const notifications = await fetchNotifications(token);

  await Log("backend", "info", "service", `fetched ${notifications.length} notifications`);

  const heap = new MinHeap(N);
  for (const notif of notifications) {
    heap.insert(notif);
  }

  const top = heap.getSorted();

  console.log(`\n=== Top ${N} Priority Notifications ===\n`);
  top.forEach((n, i) => {
    const weight = TYPE_WEIGHT[n.Type];
    console.log(
      `${i + 1}. [${n.Type}] (weight=${weight}) ${n.Message} — ${n.Timestamp}`
    );
  });
  console.log();

  await Log("backend", "info", "service", `displayed top ${N} priority notifications`);
}

main();
