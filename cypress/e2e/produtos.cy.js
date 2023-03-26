/// <reference types="cypress" />
import contrato from '../contratos/produtos.contratos'

describe('Teste da funcionalidade produtos', () => {
    let token
    before(() => {
        cy.token('fulano@qa.com', 'teste').then(tkn => { token = tkn})
    });

    it.only('Deve validar contrato de produtos', () => {
        cy.request('produtos').then(response => {
            return contrato.validateAsync(response.body)
        })
    });

    it('Listar produtos', () => {

        cy.request({
            method: 'GET',
            url: 'produtos'
        }).then((response) =>{
            expect(response.body.produtos[4].nome).to.equal('Xbox Serie X') /// validação especifica
            expect(response.status).to.equal(200) ///validação com status da requisição 200-OK
            expect(response.body).to.have.property('produtos') ///Validação com propriedade no body
            expect(response.duration).to.be.lessThan(15) ///Validação de timer de carregamento
        })

    });

    it('Cadastrar Produto', () => {
        let produto = `Produto TEC ${Math.floor(Math.random() * 10000000) }`
        
        cy.cadastrarProduto(token, produto, 250, "inovação", 100)

        .then((response) =>{
            expect(response.status).to.equal(201)
            expect(response.body.message).to.equal("Cadastro realizado com sucesso")
        })
    });

    it('Deve validar mensagem de erro ao cadastrar produto repetido', () => {
        
        cy.cadastrarProduto(token, "Produto TEC 1", 250, "Inovação", 100)

        .then((response) =>{
            expect(response.status).to.equal(400)
            expect(response.body.message).to.equal("Já existe produto com esse nome")
        })
    });

    it('Deve editar um produto já cadastrado', () => {
        cy.request('produtos/').then(response => {
            let id = response.body.produtos[0]._id
            cy.request({
                method: 'PUT',
                url: `produtos/${id}`,
                headers: {authorization: token},
                body: {
                    "nome": "Produto TEC 317944",
                    "preco": 250,
                    "descricao": "Inovaproduto editado",
                    "quantidade": 30
                  }
            }).then(response => {
                expect(response.body.message).to.equal('Registro alterado com sucesso')
            })
        })
        
    });

    it('Deve editar um produto cadastrado previamente', () => {
        let produto = `Produto TEC ${Math.floor(Math.random() * 10000000) }`
        cy.cadastrarProduto(token, produto, 250, "inovação", 100)
        .then(response => {
            let id = response.body._id
            cy.request('produtos/').then(response => {
                let id = response.body.produtos[0]._id
                cy.request({
                    method: 'PUT',
                    url: `produtos/${id}`,
                    headers: {authorization: token},
                    body: {
                        "nome": "Produto TEC editado",
                        "preco": 200,
                        "descricao": "Inovaproduto editado",
                        "quantidade": 50
                      }
                }).then(response => {
                    expect(response.body.message).to.equal('Registro alterado com sucesso')
                })
            })
        })
    });

    it('Deve deletar um produto previamente cadastrado', () => {
        let produto = `Produto TEC ${Math.floor(Math.random() * 10000000) }`
        cy.cadastrarProduto(token, produto, 250, "inovação", 100)
        .then(response =>{
            let id = response.body._id
            cy.request({
                method: 'DELETE',
                url: `produtos/${id}`,
                headers: {authorization: token}
            }).then(response =>{
                expect(response.body.message).to.equal('Registro excluído com sucesso')
                expect(response.status).to.equal(200)
            })
        })
    });

});