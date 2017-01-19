var each = require('agraddy.async.each');
var mysql = require('mysql');
var path = require('path');

var config = require(path.join(process.cwd(), 'config'));

var mod = {};

var conn = mysql.createConnection(config.db);
conn.connect();

mod.compare = function(input, cb) {
	if(typeof input == 'object') {
		run(input, cb);
	} else if(typeof input == 'string') {
		run(require(path.join(process.cwd(), path.normalize(input))), cb);
	} else {
		cb(new Error('The compare function needs either an object or a string to a file location.'));
	}

	function run(input, callback) {
		var error;
		var keys = [];
		var subkeys = [];
		var i = 0;
		var j = 0;
		var row;
		var actual = {};
		var expected = input;

		keys = Object.keys(input);
		each(keys, function(item, cb2) {
			if(!Array.isArray(keys)) {
				cb2(new Error('The ' + item + ' is not an array.'));
			} else {
				mod.select(item, function(err, rows, fields) {
					if(err) {
						return cb2(err);
					}

					actual[item] = rows;

					if(rows.length != input[item].length) {
						error = new Error('The ' + item + ' did not have the proper amount of rows.');
						return cb2();
					} else {
						for(i = 0; i < input[item].length; i++) {
							subkeys = Object.keys(input[item][i]);
							for(j = 0; j < subkeys.length; j++) {
								if(input[item][i][subkeys[j]] != rows[i][subkeys[j]]) {
									error = new Error('The ' + item + ' did not match fully.');
									return cb2();
								}
							}
						}
						cb2();
					}
				});
			}
		}, function(err) {
			if(err) {
				callback(err, false, actual, expected);
			} else if(error) {
				callback(error, false, actual, expected);
			} else {
				callback(null, true, actual, expected);
			}
		});
	}
}; 

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

	if(where && typeof where == 'object') {
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
	} else if(where && typeof where == 'function') {
		cb = where;
	}

	var query = conn.query(sql, values, function(err, rows, fields) {
		cb(err, rows, fields);
	}); 

	//console.log(query.sql);
}; 

mod.setup = function(input, cb) {
	if(typeof input == 'object') {
		run(input, cb);
	} else if(typeof input == 'string') {
		run(require(path.join(process.cwd(), path.normalize(input))), cb);
	} else {
		cb(new Error('The setup function needs either an object or a string to a file location.'));
	}

	function run(input, callback) {
		var keys = [];
		var i = 0;

		keys = Object.keys(input);
		each(keys, function(item, cb2) {
			if(!Array.isArray(keys)) {
				cb2(new Error('The ' + item + ' is not an array.'));
			} else {
				mod.truncate(item, function(err) {
					if(err) {
						return cb2(err);
					}
					each(input[item], function(item2, cb3) {
						mod.insert(item, item2, cb3);
					}, cb2);
				});
			}
		}, callback);
	}
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

