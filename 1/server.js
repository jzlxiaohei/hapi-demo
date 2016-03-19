'use strict'
const fs = require('fs')
const path = require('path')
const Hapi = require('hapi')
const joi = require('joi')
const Inert = require('inert')
const Vision = require('vision')
const HapiSwagger = require('hapi-swagger')
const HapiAsyncHandler = require('hapi-async-handler')
const Promise = require('bluebird')
const readFile = Promise.promisify(fs.readFile)

const internals = {
    servers: {
        port: 3333,
        host: 'localhost'
    }
}

const server = new Hapi.Server({})
server.connection(internals.servers)

const SwaggerOptions = {
    info: {
        'title': 'Test API Documentation',
        'version': '0.0.1'
    }
}

server.register([
        Inert,
        Vision,
        HapiAsyncHandler,
        {
            'register': HapiSwagger,
            'options': SwaggerOptions
        }], (err) => {
        if (err) throw new Error('')
    }
)

server.route({
    method: 'get',
    path: '/',
    config: {
        description: 'get posts list', notes: '注意这是首页',
        tags: ['api'],
        validate: {
            query: {
                offset: joi.number().integer().min(0).default(0).description('query offset'),
                limit: joi.number().integer().default(10).description('query limit'),
                order: joi.string().default('-created_at').description('query order')
            }
            //payload,path params
        }
        //response: {schema: responseModel},//responseModel 是joi.object()构造出来的
    },
    handler: {
        async: async function (req, reply) {
            const text = await readFile(path.join(__dirname, './foo.txt'), 'utf-8');
            reply(text)
        }
    }
})

module.exports = server