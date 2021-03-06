// You will need to run the jefe command ```mig up``` from within the test directory before running these tests
process.chdir('test');
var tap = require('agraddy.test.tap')(__filename);

var mod = require('../');

var setup = {people: [{first_name: 'John', last_name: 'Smith', age: 11},
	{first_name: 'Jane', last_name: 'Doe', age: 22},
	{first_name: 'John', last_name: 'Doe', age: 33}
]};

var full = {people: [
	{id: 1, first_name: 'John', last_name: 'Smith', age: 11, deleted: 0},
	{id: 2, first_name: 'Jane', last_name: 'Doe', age: 22, deleted: 0},
	{id: 3, first_name: 'John', last_name: 'Doe', age: 33, deleted: 0}
]};

var fail = {
	people: [
	{first_name: 'John', last_name: 'Smith', age: 11}
	]
};

// Truncate is used by setup
mod.setup(setup, compareObjectPass) ;

function compareObjectPass() {
		mod.compare(setup, function(err, result, actual, expected) {
			tap.assert.deepEqual(actual, full, 'Actual should match what is in the database.');
			tap.assert.deepEqual(expected, setup, 'Expected should match what was passed into compare().');
			tap.assert.notDeepEqual(actual, expected, 'Actual and expected will never match unless expected lists every field.');
			tap.assert(result, 'Compare should pass when it matches.');

			compareObjectFail();
		});
}

function compareObjectFail() {
	mod.compare(fail, function(err, result, actual, expected) {
		tap.assert.deepEqual(actual, full, 'Actual should match what is in the database.');
		tap.assert.deepEqual(expected, fail, 'Expected should match what was passed into compare().');
		tap.assert.notDeepEqual(actual, expected, 'Actual and expected will never match unless expected lists every field.');
		tap.assert(!result, 'Compare should fail when it does not match.');

		selectAll();
	});
}


function selectAll() {
	mod.select('people', function(err, rows, fields) {
		tap.assert.equal(rows.length, 3, 'Select all should work.');

		select();
	});
}

function select() {
	mod.select('people', {id: 3}, function(err, rows, fields) {
		tap.assert.equal(rows[0].id, 3, 'Select should work.');
		tap.assert.equal(rows[0].first_name, 'John', 'Select should work.');
		tap.assert.equal(rows[0].last_name, 'Doe', 'Select should work.');
		tap.assert.equal(rows[0].age, 33, 'Select should work.');

		update();
	});
}

function update() {
	mod.update('people', {age: 34}, {id: 3}, function(err, rows, fields) {
		mod.select('people', {id: 3}, function(err, rows, fields) {
			tap.assert.equal(rows[0].id, 3, 'Update should work.');
			tap.assert.equal(rows[0].first_name, 'John', 'Update should work.');
			tap.assert.equal(rows[0].last_name, 'Doe', 'Update should work.');
			tap.assert.equal(rows[0].age, 34, 'Update should work.');

			insertQuery();
		});
	});
}

function insertQuery() {
	mod.insert('people', {first_name: 'Anna', last_name: 'Roberts', age: 44}, function(err, rows, fields) {
		mod.query('SELECT * FROM people WHERE id = ?', [4], function(err, rows, fields) {
			tap.assert.equal(rows[0].id, 4, 'Insert should work.');
			tap.assert.equal(rows[0].first_name, 'Anna', 'Insert should work.');
			tap.assert.equal(rows[0].last_name, 'Roberts', 'Insert should work.');
			tap.assert.equal(rows[0].age, 44, 'Insert should work.');

			setupCompareFilesPass();
		});
	});
}

function setupCompareFilesPass() {
	mod.setup('./fixtures/pass_setup.js', function(err) {
		mod.compare('./fixtures/pass_compare.js', function(err, result) {
			tap.assert(result, 'Setup & Compare should pass when files are used and they match.');

			setupCompareFilesFail();
		});
	});
}

function setupCompareFilesFail() {
	mod.setup('./fixtures/fail_setup.js', function(err) {
		mod.compare('./fixtures/fail_compare.js', function(err, result) {
			tap.assert(!result, 'Setup & Compare should fail when files are used and they do not match.');

			end();
		});
	});
}

function end() {
	process.exit();
}

