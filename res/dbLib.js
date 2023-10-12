const sqlite = require('sqlite3').verbose();
const path = require('path');
const { DB_FILE_NAME } = require('./constant');
const { dbDir } = require('./filePath');

const db = new sqlite.Database(
  path.resolve(dbDir, DB_FILE_NAME)
);

module.exports.each = function (sql, cb = someVal => someVal) {
  return new Promise((resolve) =>{
    db.serialize(() => {
      const data = [];
      db.each(
        sql,
        (_, row) => {
          data.push(cb(row));
        },
        () => resolve(data)
      );
    });
  });
};