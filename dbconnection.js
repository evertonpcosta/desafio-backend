var mysql=require('mysql');
var connection=mysql.createPool({
    host:'localhost',
    user:'root',
    password:'T0n231988%',
    database:'desafio_backend'

});
 module.exports=connection;