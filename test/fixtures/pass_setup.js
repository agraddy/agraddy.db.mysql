var mod = {};
var row;

mod.people = [];          
row = {};                  
row.first_name = 'Bob';
row.last_name = 'Smith';
row.age = 44;
mod.people.push(row); 
row = {};                  
row.first_name = 'Cindy';
row.last_name = 'Smith';
row.age = 55;
mod.people.push(row); 

module.exports = mod;
