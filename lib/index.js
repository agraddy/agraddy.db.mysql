var mysql = require('mysql');
var path = require('path');

var config = require(path.join(process.cwd(), 'config'));

var mod = {};

var conn = mysql.createConnection(config.db);
conn.connect();

mod.insert = function(table, data, cb) {
	var query = conn.query('INSERT INTO ?? SET ?', [table, data], function(err, rows, fields) {
		cb(err, rows, fields);
	}); 

	//console.log(query.sql);
}; 

mod.query = function(sql, data, cb) {
	if(typeof data === 'function') {
		cb = data;
		data = {}; 
	}   
	var query = conn.query(sql, data, function(err, rows, fields) {
		cb(err, rows, fields);
	}); 

	//console.log(query.sql);
};

mod.select = function(table, where, cb) {
	var sql = 'SELECT * FROM ??';
	var values = [];
	var i;
	var keys;
	values.push(table);

	if(where) {
		keys = Object.keys(where);

		for(i = 0; i < keys.length; i++) {
			if(i == 0) {
				sql += ' WHERE ';
			} else {
				sql += ' AND ';
			}
			sql += '?? = ?';

			values.push(keys[i], where[keys[i]]);
		}
	}

	var query = conn.query(sql, values, function(err, rows, fields) {
		cb(err, rows, fields);
	}); 

	//console.log(query.sql);
}; 

mod.truncate = function(table, cb) {
	var query = conn.query('TRUNCATE TABLE ??', [table], function(err, rows, fields) {
		cb(err, rows, fields);
	});

	//console.log(query.sql);
};

mod.update = function(table, data, where, cb) {
	var i;
	var keys;
	var sql = 'UPDATE ?? SET ?';
	var values = [];

	values.push(table);
	values.push(data);

	if(where) {
		keys = Object.keys(where);

		for(i = 0; i < keys.length; i++) {
			if(i == 0) {
				sql += ' WHERE ';
			} else {
				sql += ' AND ';
			}
			sql += '?? = ?';

			values.push(keys[i], where[keys[i]]);
		}
	}

	var query = conn.query(sql, values, function(err, rows, fields) {
		cb(err, rows, fields);
	});
	
	//console.log(query.sql);
};

module.exports = mod;

