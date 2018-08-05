var express = require('express');
var router = express.Router();
var Carrinho = require('../models/Carrinho');

router.get('/:id?', function(req, res, next) {

    if (req.params.id) {

        Carrinho.getCarrinhoById(req.params.id, function(err, rows) {

            if (err) {
                res.json(err);
            } else {
                res.json(rows);
            }
        });
    } else {

        Carrinho.getAllCarrinhos(function(err, rows) {

            if (err) {
                res.json(err);
            } else {
                res.json(rows);
            }

        });
    }
});
router.post('/', function(req, res, next) {
    Carrinho.addCarrinho(req.body, function(err, count) {
        if (err) {
            Carrinho.calcularDesconto(err, function(err2, count){
                if (err2) {
                    res.json(err2);
                } else {
                    res.json(count);
                }
            });
        } else {
            res.json(count);
        }
        
    });
});
router.delete('/:id_produto/:id_pedido', function(req, res, next) {

    Carrinho.deleteCarrinho(req.params.id_produto,req.params.id_pedido,  function(err, count) {

        if (err) {
            res.json(err);
        } else {
            res.json(count);
        }

    });
});
router.put('/:id', function(req, res, next) {

    Carrinho.updateCarrinho(req.params.id, req.body, function(err, rows) {

        if (err) {
            res.json(err);
        } else {
            res.json(rows);
        }
    });
});

router.get('/checkout/:id', function(req, res, next) {

    Carrinho.checkoutCarrinho(req.params.id, function(err, rows) {

        if (err) {
            res.json(err);
        } else {
            res.json(rows);
        }
    });
});

module.exports = router;