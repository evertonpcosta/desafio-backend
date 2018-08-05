var express = require('express');
var router = express.Router();
var Produtos = require('../models/Produtos');

router.get('/:id?', function(req, res, next) {

    if (req.params.id) {

        Produtos.getProdutosById(req.params.id, function(err, rows) {

            if (err) {
                res.json(err);
            } else {
                res.json(rows);
            }
        });
    } else {

        Produtos.getAllProdutos(function(err, rows) {

            if (err) {
                res.json(err);
            } else {
                res.json(rows);
            }

        });
    }
});
router.post('/', function(req, res, next) {

    Produtos.addProdutos(req.body, function(err, count) {
        if (err) {
            res.json(err);
        } else {
            res.json(req.body);
        }
    });
});
router.delete('/:id', function(req, res, next) {

    Produtos.deleteProdutos(req.params.id, function(err, count) {

        if (err) {
            res.json(err);
        } else {
            res.json(count);
        }

    });
});
router.put('/:id', function(req, res, next) {

    Produtos.updateProdutos(req.params.id, req.body, function(err, rows) {

        if (err) {
            res.json(err);
        } else {
            res.json(rows);
        }
    });
});
module.exports = router;