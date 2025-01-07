import { format } from 'date-fns';
import * as SQLite from 'expo-sqlite';
const database_name = "HomeInventory.db";
const database_version = "1.0";
const database_displayname = "Home Inventory Database";
const database_size = 2000000;

let db = null;

export const openDatabase = async () => {
  if (!db) {
    try {
      db = SQLite.openDatabase(
        database_name,
        database_version,
        database_displayname,
        database_size
      );
      console.log("Database opened successfully");
    } catch (error) {
      console.error("Error opening database: ", error);
    }
  }
  return db;
};

export const createTables = async () => {
  try {
    const db = await openDatabase();
    if (!db) throw new Error("Database not opened");

    await db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS room (
          roomid INTEGER PRIMARY KEY AUTOINCREMENT,
          roomname TEXT NOT NULL
        );`,
        [],
        () => console.log("Room table created successfully"),
        (_, error) => console.log("Error creating room table:", error)
      );

      tx.executeSql(
       `CREATE TABLE IF NOT EXISTS location (
        locationid INTEGER PRIMARY KEY AUTOINCREMENT,
        roomid INTEGER,
        locationname TEXT NOT NULL,
        FOREIGN KEY (roomid) REFERENCES room(roomid) ON DELETE CASCADE
      );`,
        [],
        () => console.log("Location table created successfully"),
        (_, error) => console.log("Error creating location table:", error)
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS item (
          itemid INTEGER PRIMARY KEY,
          locationid INTEGER,
          itemname TEXT NOT NULL,
          itemqty INTEGER,
          alertqty INTEGER,
          expdate TEXT,
          FOREIGN KEY (locationid) REFERENCES location(locationid) ON DELETE CASCADE
        );`,
        [],
        () => console.log("Item table created successfully"),
        (_, error) => console.log("Error creating item table:", error)
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS inout (
          inoutid INTEGER PRIMARY KEY,
          inoutname TEXT,
          date TEXT,
          totalqty INTEGER
        );`,
        [],
        () => console.log("Inout table created successfully"),
        (_, error) => console.log("Error creating item table:", error)
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS itemdetail (
        itemid INTEGER,
        inoutid INTEGER,
        itemqty INTEGER,
        FOREIGN KEY (itemid) REFERENCES item(itemid) ON DELETE CASCADE,
        FOREIGN KEY (inoutid) REFERENCES inout(inoutid) ON DELETE CASCADE
      );`,
        [],
        () => console.log("ItemDetail table created successfully"),
        (_, error) => console.log("Error creating location table:", error)
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS alerttime (
          id INTEGER PRIMARY KEY,
          alerttime TEXT,
          cleartext INTEGER
        );`,
        [],
        () => console.log("AlertTime table created successfully"),
        (_, error) => console.log("Error creating AlertTime table:", error)
      );

      tx.executeSql(
        `INSERT OR IGNORE INTO alerttime (id, alerttime, cleartext) VALUES (1, '12:00 PM', 1);`,
        [],
        () => console.log("Default alerttime inserted"),
        (_, error) => console.log("Error inserting default alerttime:", error)
      );


    });

    
  } catch (error) {
    console.log("Error creating tables: ", error);
  }
};


export const addRoomToDatabase = async (roomName) => {
  const db = await openDatabase();
  console.log("Insert Task Started");
  console.log("roomname is ",roomName);
  
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO room (roomname) VALUES (?)',
        [roomName], 
        (_, result) => {
          resolve(result);
          console.log("result: ", result);
          console.log("Insert room end");
        },
        (tx, error) => {
          console.error("Error inserting room:", error);
          reject(error);
        }
      );
    });
  });
};

export const getRoomsFromDatabase = async () => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM room',
        [],
        (_, { rows: { _array } }) => {
          resolve(_array);
        },
        (tx, error) => {
          console.error("Error fetching rooms:", error);
          reject(error);
        }
      );
    });
  });
};
export const addLocationToDatabase = async (roomId, locationName) => {
  const db = await openDatabase();
  console.log("Insert location Started");
  console.log("roomid is ",roomId);
  console.log("locationName is ",locationName);
  
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO location (roomid, locationname) VALUES (?, ?)',
        [roomId, locationName],
        (_, result) => {
          resolve(result);
          console.log("result: ", result);
          console.log("Insert location end");
        },
        (tx, error) => {
          console.error("Error inserting location:", error);
          reject(error);
        }
      );
    });
  });
};
export const getLocationsFromDatabase = async (roomId) => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM location WHERE roomid = ?',
        [roomId],
        (_, { rows: { _array } }) => {
          resolve(_array);
        },
        (tx, error) => {
          console.error("Error fetching locations:", error);
          reject(error);
        }
      );
    });
  });
};

export const getInOutCount = async () => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT MAX(inoutid) as count FROM inout',
        [],
        (_, { rows: { _array } }) => {
          resolve(_array[0].count);
        },
        (tx, error) => {
          console.error("Error fetching inout count:", error);
          reject(error);
        }
      );
    });
  });
};
export const getNextItemId = async () => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT COUNT(*) as count FROM item`,
        [],
        (_, { rows: { _array } }) => {
          resolve(_array[0].count);
        },
        (_, error) => {
          console.log("Error fetching item count:", error);
          reject(error);
        }
      );
    });
  });
};
export const addInOutToDatabase = async (inoutId, inoutName, date, totalQty) => {
  const db = await openDatabase();
  console.log('addInOutToDatabase:', { inoutId, inoutName, date, totalQty });
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO inout (inoutid, inoutname, date, totalqty) VALUES (?, ?, ?, ?)',
        [inoutId, inoutName, date, totalQty],
        (_, result) => {
          console.log('addInOutToDatabase result:', result);
          resolve(result);
        },
        (_, error) => {
          console.error('addInOutToDatabase error:', error);
          reject(error);
        }
      );
    });
  });
};

export const addItemToDatabase = async (itemId, locationId, itemName, itemQty, alertQty, expDate) => {
  const db = await openDatabase();
  console.log('addItemToDatabase:', { itemId, locationId, itemName, itemQty, alertQty, expDate });
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO item (itemid, locationid, itemname, itemqty, alertqty, expdate) VALUES (?, ?, ?, ?, ?, ?)',
        [itemId, locationId, itemName, itemQty, alertQty, expDate],
        (_, result) => {
          console.log('addItemToDatabase result:', result);
          resolve(result);
        },
        (_, error) => {
          console.error('addItemToDatabase error:', error);
          reject(error);
        }
      );
    });
  });
};

export const addItemDetailToDatabase = async (itemId, inoutId, itemQty) => {
  const db = await openDatabase();
  console.log('addItemDetailToDatabase:', { itemId, inoutId, itemQty });
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO itemdetail (itemid, inoutid, itemqty) VALUES (?, ?, ?)',
        [itemId, inoutId, itemQty],
        (_, result) => {
          console.log('addItemDetailToDatabase result:', result);
          resolve(result);
        },
        (_, error) => {
          console.error('addItemDetailToDatabase error:', error);
          reject(error);
        }
      );
    });
  });
};

export const getItemsByLocation = async (locationId) => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT itemid, itemname, itemqty FROM item WHERE locationid = ? AND itemqty > 0',  
        [locationId],
        (_, { rows: { _array } }) => {
          resolve(_array || []);  
        },
        (tx, error) => {
          console.error("Error fetching items by location:", error);
          reject(error);
        }
      );
    });
  });
};

export const getAllItemsByLocation = async (locationId) => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT itemname, itemqty, alertqty, expdate, itemid FROM item WHERE locationid = ? AND itemqty > 0',  
        [locationId],
        (_, { rows: { _array } }) => {
          resolve(_array || []);
        },
        (tx, error) => {
          console.error("Error fetching items by location:", error);
          reject(error);
        }
      );
    });
  });
};


export const insertInOut = async (inoutId, inoutName, date, totalQty) => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO inout (inoutid, inoutname, date, totalqty) VALUES (?, ?, ?, ?)',
        [inoutId, inoutName, date, totalQty],
        (_, result) => {
          console.log(`Inserted into inout table: inoutid=${inoutId}, inoutname=${inoutName}, date=${date}, totalQty=${totalQty}`);
          resolve(result);
        },
        (tx, error) => {
          console.error("Error inserting into inout table:", error);
          reject(error);
        }
      );
    });
  });
};

export const insertItemDetail = async (inoutId, itemId, itemQty) => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO itemdetail (inoutid, itemid, itemqty) VALUES (?, ?, ?)',
        [inoutId, itemId, itemQty],
        (_, result) => {
          console.log(`Inserted into itemdetail table: inoutid=${inoutId}, itemid=${itemId}, itemqty=${itemQty}`);
          resolve(result);
        },
        (tx, error) => {
          console.error("Error inserting into itemdetail table:", error);
          reject(error);
        }
      );
    });
  });
};

export const updateItemQuantity = async (itemId, newQty) => {
  const db = await openDatabase();
  console.log("updateItemQuantity database.js itemid-", itemId, "newQty-",  newQty);

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE item SET itemqty = ? WHERE itemid = ?',
        [newQty, itemId],
        (_, result) => {
          console.log(`Updated item table: itemid=${itemId}, newQty=${newQty}`);
          resolve(result);
        },
        (tx, error) => {
          console.error("Error updating item table:", error);
          reject(error);
        }
      );
    });
  });
};

export const getInOutHistory = async () => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT inoutid, inoutname, date, totalqty FROM inout ORDER BY date DESC, inoutid DESC',
        [],
        (_, { rows: { _array } }) => {
          resolve(_array || []); 
        },
        (tx, error) => {
          console.error("Error fetching inout history:", error);
          reject(error);
        }
      );
    });
  });
};

export const getItemDetailsByInOutId = async (inoutId) => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT itd.itemid, itd.inoutid, itd.itemqty as itd_itemqty, i.itemname, i.itemqty as i_itemqty, l.locationname, r.roomname
         FROM itemdetail itd, item i, location l, room r
         WHERE itd.itemid = i.itemid
         AND i.locationid = l.locationid
         AND l.roomid = r.roomid
         AND itd.inoutid = ?`,
        [inoutId],
        (_, { rows: { _array } }) => {
          resolve(_array || []);
        },
        (tx, error) => {
          console.error("Error fetching item details by inoutId:", error);
          reject(error);
        }
      );
    });
  });
};

export const updateItemDetailQuantity = async (inoutid, itemid, newQty) => {
  const db = await openDatabase();
  console.log( "updateItemDetailQuantity database.js - inout id-", inoutid, "itemid-", itemid, "newQty-", newQty);


  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE itemdetail SET itemqty = ? WHERE inoutid = ? AND itemid = ?`,
        [newQty, inoutid, itemid],
        (_, result) => {
          console.log('updateItemDetailQuantity successfully executed:', result);
          resolve(result);
        },
        (tx, error) => {
          console.error('Error updating item detail quantity:', error);
          reject(error);
        }
      );
    });
  });
};

export const updateInOutTotalQuantity = async (inoutid, totalQty) => {
  const db = await openDatabase();
  console.log( "updateInOutTotalQuantity database.js - inout id-", inoutid, "totalQty-", totalQty);

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE inout SET totalqty = ? WHERE inoutid = ?',
        [totalQty, inoutid],
        (_, result) => {
          console.log(`Updated inout table: inoutid =${inoutid}, totalQty=${totalQty}`);
          resolve(result);
        },
        (tx, error) => {
          console.error("Error updating inout table:", error);
          reject(error);
        }
      );
    });
  });
};

export const updateRoomNameInDatabase = async (roomId, roomName) => {
  const db = await openDatabase();
  console.log("updateRoomNameInDatabase - roomId:", roomId, "roomName:", roomName);

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE room SET roomname = ? WHERE roomid = ?',
        [roomName, roomId],
        (_, result) => {
          console.log(`Updated RoomTable: roomid = ${roomId}, roomname = ${roomName}`);
          resolve(result);
        },
        (tx, error) => {
          console.error("Error updating RoomTable:", error);
          reject(error);
        }
      );
    });
  });
};



export const updateLocationNameInDatabase = async (locationId, locationName) => {

  const db = await openDatabase();
  console.log("updateLocationNameInDatabase - locationId:", locationId, "locationName:", locationName);

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE location SET locationname = ? WHERE locationid = ?',
        [locationName, locationId],
        (_, result) => {
          console.log(`Updated LocationTable: Locationid = ${locationId}, Locationname = ${locationName}`);
          resolve(result);
        },
        (tx, error) => {
          console.error("Error updating LocationTable:", error);
          reject(error);
        }
      );
    });
  });
};
  
export const updateItemNameInDatabase = async (itemId, itemName) => {

  const db = await openDatabase();
  console.log("updateItemNameInDatabase - itemId:", itemId, "itemName:", itemName);

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE item SET itemname = ? WHERE itemid = ?',
        [itemName, itemId],
        (_, result) => {
          console.log(`Updated ItemTable: Itemid = ${itemId}, Item nname = ${itemName}`);
          resolve(result);
        },
        (tx, error) => {
          console.error("Error updating ItemTable:", error);
          reject(error);
        }
      );
    });
  });
};

export const updateItemAlertQtyAndExpDate = async (itemid, alertqty, expdate) => {

  const db = await openDatabase();
  console.log("updateItemNameInDatabase - itemId:", itemid, "alertqty:", alertqty, "expdate:", expdate);

  
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE item SET alertqty = ?, expdate = ? WHERE itemid = ?',
        [alertqty, expdate, itemid],
        (_, result) => {
          console.log(`Updated ItemTable: Itemid = ${itemid}, alertqty = ${alertqty}, expdate = ${expdate}`);
          resolve(result);
        },
        (tx, error) => {
          console.error("Error updating ItemTable:", error);
          reject(error);
        }
      );
    });
  });
};


export const getalerttime = async () => {
  const db = await openDatabase();  // Open the database
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT alerttime FROM alerttime WHERE id = 1', // Select the alerttime where id is 1
        [],
        (_, { rows: { _array } }) => {
          resolve(_array);  // Resolve the promise with the array of results
        },
        (tx, error) => {
          console.error("Error fetching alert time:", error);
          reject(error);  // Reject the promise in case of an error
        }
      );
    });
  });
};

export const updateAlertTime = async (newTime) => {
  const db = await openDatabase();
  console.log(newTime);
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE alerttime SET alerttime = ? WHERE id = 1',
        [newTime],
        (_, result) => {
          resolve(result); 
        },
        (tx, error) => {
          console.error("Error updating alerttime:", error);
          reject(error);
        }
      );
    });
  });
};


export const getNotificationItem = async () => {
  const db = await openDatabase();

  // Get today's date in the format YYYY-MM-DD (for SQLite comparison)
  const todayDate = format(new Date(), 'yyyy-MM-dd');
  console.log(todayDate, " today is");

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT i.itemid, i.itemname, i.itemqty, i.alertqty, i.expdate, l.locationname, r.roomname 
         FROM item i
         JOIN location l ON i.locationid = l.locationid
         JOIN room r ON l.roomid = r.roomid
         WHERE 
             (i.itemqty IS NOT NULL AND i.itemqty <= i.alertqty)
             OR 
             (i.expdate IS NOT NULL AND date(substr(i.expdate, 7, 4) || '-' || substr(i.expdate, 4, 2) || '-' || substr(i.expdate, 1, 2)) <= date(?))`,
        [todayDate],
        (_, { rows: { _array } }) => {
          // Combine itemname, locationname, and roomname in the result
          const formattedArray = _array.map(item => ({
            ...item,
            displayName: `${item.itemname}\n${item.roomname}, ${item.locationname}`
          }));
          resolve(formattedArray || []);
        },
        (tx, error) => {
          console.error("Error fetching items for notification", error);
          reject(error);
        }
      );
    });
  });
};
export const getNotificationItemname = async () => {
  const db = await openDatabase();

  // Get today's date in the format YYYY-MM-DD (for SQLite comparison)
  const todayDate = format(new Date(), 'yyyy-MM-dd');

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT  i.itemname, l.locationname, r.roomname 
         FROM item i
         JOIN location l ON i.locationid = l.locationid
         JOIN room r ON l.roomid = r.roomid
         WHERE 
             (i.itemqty IS NOT NULL AND i.itemqty <= i.alertqty)
             OR 
             (i.expdate IS NOT NULL AND date(substr(i.expdate, 7, 4) || '-' || substr(i.expdate, 4, 2) || '-' || substr(i.expdate, 1, 2)) <= date(?))`,
        [todayDate],
        (_, { rows: { _array } }) => {
          // Combine itemname, locationname, and roomname in the result
          const formattedArray = _array.map(item => ({
            ...item,
            displayName: `\n${item.itemname},${item.roomname}, ${item.locationname}`
          }));
          resolve(formattedArray || []);
        },
        (tx, error) => {
          console.error("Error fetching items for notification", error);
          reject(error);
        }
      );
    });
  });
};


export const getcleartext = async () => {
  const db = await openDatabase();  // Open the database
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT cleartext FROM alerttime WHERE id = 1', // Select the alerttime where id is 1
        [],
        (_, { rows: { _array } }) => {
          resolve(_array);  // Resolve the promise with the array of results
        },
        (tx, error) => {
          console.error("Error fetching alert time:", error);
          reject(error);  // Reject the promise in case of an error
        }
      );
    });
  });
};

export const updatecleartext = async (newTime) => {
  const db = await openDatabase();
  console.log("updatecleartext is ", newTime);
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE alerttime SET cleartext = ? WHERE id = 1',
        [newTime],
        (_, result) => {
          resolve(result); 
        },
        (tx, error) => {
          console.error("Error updating alerttime:", error);
          reject(error);
        }
      );
    });
  });
};

export const getAllRoom = async () => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT roomname FROM room',
        [],
        (_, { rows: { _array } }) => {
          resolve(_array);
        },
        (tx, error) => {
          console.error("Error fetching locations:", error);
          reject(error);
        }
      );
    });
  });
};

export const getAllLocation = async () => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT r.roomname, l.locationname FROM room r, location l WHERE r.roomid = l.roomid',
        [],
        (_, { rows: { _array } }) => {
          resolve(_array);
        },
        (tx, error) => {
          console.error("Error fetching locations:", error);
          reject(error);
        }
      );
    });
  });
};

export const getAllItem = async () => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT r.roomname, l.locationname, i.itemname, i.itemqty, i.alertqty, i.expdate 
         FROM room r 
         JOIN location l ON r.roomid = l.roomid
         JOIN item i ON l.locationid = i.locationid
         ORDER BY r.roomname, l.locationname`,
        [],
        (_, { rows: { _array } }) => {
          // Process the results here
          const groupedData = _array.reduce((acc, row) => {
            // Create a room group if it doesn't exist
            if (!acc[row.roomname]) {
              acc[row.roomname] = {};
            }

            // Create a location group within the room if it doesn't exist
            if (!acc[row.roomname][row.locationname]) {
              acc[row.roomname][row.locationname] = [];
            }

            // Add the item to the corresponding location group
            acc[row.roomname][row.locationname].push({
              itemname: row.itemname,
              itemqty: row.itemqty,
              alertqty: row.alertqty,
              expdate: row.expdate,
            });

            return acc;
          }, {});

          // Flatten the grouped data
          const flattenedData = [];
          for (const room in groupedData) {
            for (const location in groupedData[room]) {
              groupedData[room][location].forEach(item => {
                flattenedData.push({
                  itemname: item.itemname,
                  roomname: room,
                  locationname: location,
                  itemqty: item.itemqty,
                  alertqty: item.alertqty,
                  expdate: item.expdate,
                });
              });
            }
          }

          resolve(flattenedData);
        },
        (tx, error) => {
          console.error("Error fetching items:", error);
          reject(error);
        }
      );
    });
  });
};

export const getAllIn = async () => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT r.roomname, l.locationname, i.itemname, itd.itemqty, io.inoutid, io.date, io.totalqty
         FROM room r
         JOIN location l ON r.roomid = l.roomid
         JOIN item i ON l.locationid = i.locationid
         JOIN itemdetail itd ON i.itemid = itd.itemid
         JOIN inout io ON itd.inoutid = io.inoutid
         WHERE io.inoutname = 'IN'`,
        [],
        (_, { rows: { _array } }) => {
          resolve(_array);
        },
        (tx, error) => {
          console.error("Error fetching incoming items:", error);
          reject(error);
        }
      );
    });
  });
};

export const getAllOut = async () => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT r.roomname, l.locationname, i.itemname, itd.itemqty, io.inoutid, io.date, io.totalqty
         FROM room r
         JOIN location l ON r.roomid = l.roomid
         JOIN item i ON l.locationid = i.locationid
         JOIN itemdetail itd ON i.itemid = itd.itemid
         JOIN inout io ON itd.inoutid = io.inoutid
         WHERE io.inoutname = 'OUT'`,
        [],
        (_, { rows: { _array } }) => {
          resolve(_array);
        },
        (tx, error) => {
          console.error("Error fetching incoming items:", error);
          reject(error);
        }
      );
    });
  });
};

