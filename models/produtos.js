var db=require('../dbconnection'); //reference of dbconnection.js
 
var Produtos={
 
getAllProdutos:function(callback){
 
return db.query("Select * from produtos",callback);
 
},
 getProdutosById:function(id,callback){
 
return db.query("select * from produtos where Id=?",[id],callback);
 },
 addProdutos:function(Produtos,callback){
     console.log(Produtos);
 return db.query("Insert into produtos (nome, descricao, imagem, valor, fator) values(?,?,?,?,?)",[Produtos.nome, Produtos.descricao, Produtos.imagem, Produtos.valor, Produtos.fator],callback);
 },
 deleteProdutos:function(id,callback){
  return db.query("delete from produtos where Id=?",[id],callback);
 },
 updateProdutos:function(id,Produtos,callback){
    return db.query("update produtos set nome=?,descricao=?,image=?,valor=?,fator=? where Id=?",[Produtos.nome,Produtos.descricao, Produtos.image, Produtos.valor, Produtos.fator],callback);
   }
 
};
 module.exports=Produtos;