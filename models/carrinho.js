var db = require('../dbconnection'); //reference of dbconnection.js
var Request = require("request");

var Carrinho = {

    getAllCarrinhos: function(callback) {

        var sql = `SELECT 
            p.id as pedido,
            i.id as item,
            pr.id as produto,
            pr.valor as valor,
            p.valor_total,
            p.valor_total as valor_total,
            pr.nome
        FROM 
        pedido p 
        INNER JOIN item i ON i.id_pedido = p.id
        INNER JOIN produtos pr ON pr.id = i.id_produtos;`;
        var dados = [];
        var itens = [];
        db.query(sql, function (err, result, fields){
            result.forEach((item) =>{
                dados[item.pedido] = {
                    "pedido" :  item.pedido,
                    "valor_total" : item.valor_total
                };
                itens[item.item] = {
                    "pedido" : item.pedido ,
                    "itens": {
                        "id" : item.item,
                        "produto" : item.produto,
                        "valor" : item.valor,
                        "nome" : item.nome,
                    }
                };
                
                
            });

            var return_data = [];
            dados.forEach((item_dados) => {
                var re_item = [];
                itens.forEach((res_itens) => {
                    if(res_itens.pedido === item_dados.pedido){
                        re_item[res_itens.itens.id] = res_itens.itens;
                    }
                })
                return_data[item_dados.pedido] = {
                    "pedido" : item_dados.pedido,
                    "valor_total" : item_dados.valor_total,
                    "itens" : re_item.filter(x => x != null)   
                }
            });
            return callback(return_data.filter(x => x != null));
        });
        

    },

    getCarrinhoById: function(id, callback) {

        var sql = `SELECT 
                p.id as pedido,
                i.id as item,
                pr.id as produto,
                pr.valor as valor,
                pr.fator as fator,
                p.valor_total as valor_total,
                pr.nome
            FROM 
            pedido p 
            INNER JOIN item i ON i.id_pedido = p.id
            INNER JOIN produtos pr ON pr.id = i.id_produtos WHERE p.id = ?`;
            var dados = [];
            var itens = [];
            db.query(sql, id, function (err, result, fields){
                result.forEach((item) =>{

                    dados[item.pedido] = {
                        "pedido" :  item.pedido,
                        "valor_total" : item.valor_total
                    };
                    itens[item.item] = {
                        "pedido" : item.pedido ,
                        "itens": {
                            "id" : item.item,
                            "produto" : item.produto,
                            "valor" : item.valor,
                            "nome" : item.nome
                        }
                    };
                    
                    
                });
    
                var return_data = [];
                dados.forEach((item_dados) => {
                    var re_item = [];
                    itens.forEach((res_itens) => {
                        if(res_itens.pedido === item_dados.pedido){
                            re_item[res_itens.itens.id] = res_itens.itens;
                        }
                    })
                    console.log(item_dados);
                    return_data[item_dados.pedido] = {
                        "pedido" : item_dados.pedido,
                        "valor_total" : item_dados.valor_total,
                        "itens" : re_item.filter(x => x != null)   
                    }
                });
                return callback(return_data.filter(x => x != null));
            });
    },

    calcularDesconto: function(data, callback){
        var fator_a = { valor : 0, max_desc : 5, value_desc : 1};
        var fator_b = { valor : 0, max_desc : 15, value_desc : 5};
        var fator_c = { valor : 0, max_desc : 30, value_desc : 15};
        var fator_total = {valor : 0, max_desc : 30};
        var valor_total = 0;
        var valor_total_desc = 0;

        var sql = `SELECT 
                p.id as pedido,
                i.id as item,
                pr.id as produto,
                pr.valor as valor,
                pr.fator as fator
            FROM 
            pedido p 
            INNER JOIN item i ON i.id_pedido = p.id
            INNER JOIN produtos pr ON pr.id = i.id_produtos WHERE p.id = ?`;
        
        
        db.query(sql, data, function (err, result, fields){
            result.forEach((item) =>{
                if(fator_total.valor <= fator_total.max_desc) {
                    if(item.fator == "A" && fator_a.valor <= fator_a.max_desc){
                        fator_a.valor += fator_a.value_desc;
                        fator_total.valor += fator_a.value_desc
                    }
                    if(item.fator == "B" && fator_b.valor <= fator_b.max_desc){
                        fator_b.valor += fator_b.value_desc;
                        fator_total.valor += fator_b.value_desc
                    }
                    if(item.fator == "C" && fator_c.valor <= fator_c.max_desc){
                        fator_c.valor += fator_c.value_desc;
                        fator_total.valor += fator_c.value_desc
                    }
                }
                valor_total += item.valor;
            });
            valor_total_desc = valor_total - (valor_total * (fator_total.valor / 100));

            db.query("update pedido set valor_total=? where id=?", [valor_total_desc, data], callback);
            dados = {pedidos : data}
            return callback(dados);
        });

    },

    addCarrinho: function(Carrinho, callback) {
        console.log("Connected!");
        var pedidos = Carrinho['pedidos']['itens'];
        var sql = "INSERT INTO pedido (valor_total) VALUES (0)";
        var return_i = db.query(sql, function (err, result, fields) {
            if (err) throw err;
            var dados_return = []
            
            pedidos.forEach(function(element) {
                var sql = "INSERT INTO item (id_pedido, id_produtos) VALUES (?,?)";
                db.query(sql, [result.insertId, element['id']]);
            });
            return callback(result.insertId);
        });
    
    },

    deleteCarrinho: function(id_produto, id_pedido, callback) {
        return db.query("delete from item where id_produtos=? AND id_pedido", [id_produto,id_pedido], callback);
    },

    checkoutCarrinho: function(id, callback) {
        

        this.getCarrinhoById(id, function(err, rows) {

            dados_itens = []
            valor_total = 0
            err.forEach(function(err_res) {
                
                err_res.itens.forEach(function(item) {
                    
                    dados_itens[item.id] = {
                        "id": item.id.toString(),
                        "title": item.nome,
                        "unit_price": item.valor,
                        "quantity": 1,
                        "tangible": true
                    };
                });
                valor_total += err_res.valor_total;
            });
            console.log(dados_itens);
            
            stringRequest = JSON.stringify({
                "api_key": 'ak_test_Fdo1KyqBTdnTFeLgBhkgRcgm9hwdzd',
                "amount": valor_total,
                "card_number": "4111111111111111",
                "card_cvv": "123",
                "card_expiration_date": "0922",
                "card_holder_name": "João das Neves",
                "customer": {
                  "external_id": "#3311",
                  "name": "João das Neves Braulio",
                  "type": "individual",
                  "country": "br",
                  "email": "joaodasneves@got.com",
                  "documents": [
                    {
                      "type": "cpf",
                      "number": "00000000000"
                    }
                  ],
                  "phone_numbers": ["+5511999998888", "+5511888889999"],
                  "birthday": "1965-01-01"
                },
                "billing": {
                  "name": "João das Neves",
                  "address": {
                    "country": "br",
                    "state": "sp",
                    "city": "Cotia",
                    "neighborhood": "Rio Cotia",
                    "street": "Rua Matrix",
                    "street_number": "9999",
                    "zipcode": "06714360"
                  }
                },
                "shipping": {
                  "name": "Neo Reeves",
                  "fee": 1000,
                  "delivery_date": "2000-12-21",
                  "expedited": true,
                  "address": {
                    "country": "br",
                    "state": "sp",
                    "city": "Cotia",
                    "neighborhood": "Rio Cotia",
                    "street": "Rua Matrix",
                    "street_number": "9999",
                    "zipcode": "06714360"
                  }
                },
                "items":  [
                  ]
            });

            console.log(stringRequest);
            Request.post({
                "headers": { "content-type": "application/json" },
                "url": "https://api.pagar.me/1/transactions",
                "body": stringRequest
            }, (error, response, body) => {
                if(error) {
                    return console.dir(error);
                }
                
                console.dir(JSON.parse(response.statusCode));
                return callback({
                    "status" : response.statusCode,
                    "data_return" : {
                        body
                    }
                })
            });
        });
        
    },

};
module.exports = Carrinho;