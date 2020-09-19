let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;
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


function checkDatabase() {
  // open a transaction on your pending db
  const transaction = db.transaction(["pending"], "readwrite");
  // access your pending object store
  const store = transaction.objectStore("pending");
  // get all records from store and set to a variable
  const getAll = store.getAll();

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
          // if successful, open a transaction on your pending db
          // access your pending object store
          // clear all items in your store
        });
    }

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


// listen for app coming back online
window.addEventListener("online", sendCachedTransactions);