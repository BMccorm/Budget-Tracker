// let db;
// // create a new db request for a "budget" database.
// console.log("dbjs works")

// request.onupgradeneeded = function (event) {
//   // create object store called "pending" and set autoIncrement to true
// };

function openDb() {
  const request = indexedDB.open("budget", 1);

  request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
  };

  request.onsuccess = function (event) {
    db = event.target.result;
    if (navigator.onLine) {
      checkDatabase();
    }
  };
  request.onerror = function (event) {
    console.log("Woops! " + event.target.errorCode);
  };
}

function getTransaction() {
  const transaction = db.transaction(["pending"], "readwrite");
  return transaction.objectStore("pending");
}

function saveRecord(record) {
  getTransaction().add(record);
}

function clearDB() {
  getTransaction().clear();
}

function sendCachedTransactions() {
  let getAll = getTransaction().getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then(response => response.json())
        .then(() => {
          clearDB()
        });
    }
  };
}

openDb();

// listen for app coming back online
window.addEventListener("online", sendCachedTransactions);