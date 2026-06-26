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

const typeWeight = { Placement: 3, Result: 2, Event: 1 };

// using a min-heap so we can efficiently keep only the top N
// the smallest (lowest priority) sits at root and gets kicked out
// when something better comes along
class MinHeap {
  constructor(n) {
    this.data = [];
    this.n = n;
  }

  _priority(item) {
    return (typeWeight[item.Type] || 0) * 1e15 + new Date(item.Timestamp).getTime();
  }

  push(item) {
    if (this.data.length < this.n) {
      this.data.push(item);
      this._up(this.data.length - 1);
    } else if (this._priority(item) > this._priority(this.data[0])) {
      this.data[0] = item;
      this._down(0);
    }
  }

  sorted() {
    return [...this.data].sort((a, b) => this._priority(b) - this._priority(a));
  }

  _up(i) {
    while (i > 0) {
      let p = (i - 1) >> 1;
      if (this._priority(this.data[i]) < this._priority(this.data[p])) {
        [this.data[i], this.data[p]] = [this.data[p], this.data[i]];
        i = p;
      } else break;
    }
  }

  _down(i) {
    let n = this.data.length;
    while (true) {
      let min = i, l = 2*i+1, r = 2*i+2;
      if (l < n && this._priority(this.data[l]) < this._priority(this.data[min])) min = l;
      if (r < n && this._priority(this.data[r]) < this._priority(this.data[min])) min = r;
      if (min !== i) {
        [this.data[i], this.data[min]] = [this.data[min], this.data[i]];
        i = min;
      } else break;
    }
  }
}

async function run() {
  await Log("backend", "info", "service", "starting priority finder");

  // get auth token
  let res = await fetch(`${BASE_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(creds),
  });
  const { access_token } = await res.json();

  // grab notifications
  res = await fetch(`${BASE_URL}/notifications`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const { notifications } = await res.json();

  await Log("backend", "info", "service", `got ${notifications.length} notifications`);

  // shove them all into the heap
  const heap = new MinHeap(10);
  notifications.forEach(n => heap.push(n));

  const top10 = heap.sorted();

  console.log(`\nTop 10 Priority Notifications:\n`);
  top10.forEach((n, i) => {
    console.log(`  ${i+1}. [${n.Type}] ${n.Message} (${n.Timestamp})`);
  });

  await Log("backend", "info", "service", "done");
}

run();
