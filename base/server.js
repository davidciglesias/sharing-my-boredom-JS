const http = require('http')
const url = require('url')
const dbSettings = require('./../config/dbSettings')
const database = require('./../classes/database')
const port = 2005
const getPostById = require('./../methods/getPostById')
const getPostByPartialTitle = require('./../methods/getPostByPartialTitle')
const getAllPosts = require('./../methods/getAllPosts')
const getAllAuthors = require('./../methods/getAllAuthors')
const postNewPost = require('./../methods/postNewPost')
const putUpdateStatus = require('./../methods/putUpdateStatus')

const example = require('dotenv').config({ path: './config/data.env', debug: process.env.DEBUG})
//const result = example.parse(Buffer.from('POTATO=potato'))
console.log(example)
//console.log(result)



http.createServer(async (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    response.setHeader('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')

    request.on('error', (err) => {
        console.error(err)
    });
    
    response.on('error', (err) => {
        console.error(err)
    });

    
    const parsedUrl = url.parse(request.url, true)
    const pathName = parsedUrl.pathname
    const query = parsedUrl.query
    const columnOptions = ['happy', 'sad', 'angry', 'surprised']

    if (pathName && pathName.split("/").pop() === 'favicon.ico') {
        response.statusCode = 204
        response.end()
    }
    else {
        if(request.method === "POST"
        && pathName === '/postNewPost' ) {

            var body = ''
            request.on('data', async function (data) {
                body += data.toString();
            });
            request.on('end', async function () {
                try {
                    var postRequestJson = JSON.parse(body)
                    const dbConnection = new database(dbSettings)
                    var result = await postNewPost(dbConnection, postRequestJson.idauthor,
                        postRequestJson.title, postRequestJson.content)
                
                    if(!result.correct) {
                        response.statusCode = 400
                        response.end(result.error.toString())
                    } else {
                        response.setHeader('Content-Type', 'text/plain; charset=utf-8')
                        response.setHeader('X-Content-Type-Options', 'nosniff')
                        response.setHeader('Access-Control-Allow-Origin', '*')
                        response.statusCode = 201
                        response.end()
                    }
                }
                catch(err) {
                    console.log(err)
                    response.statusCode = 400
                    response.end(err.toString())
                }
            })
        } 
        else if(request.method === "PUT"
        && pathName === '/putUpdate' 
        && query.id !== undefined
        && query.column !== undefined && columnOptions.includes(query.column)
        && query.change !== undefined && (query.change == 1 || query.change == -1)) {
            console.log('Starting put')
            const dbConnection = new database(dbSettings)
            var result = await putUpdateStatus(dbConnection, query.id,
                query.column, query.change)
        
            if(!result.correct) {
                response.statusCode = 404
                response.end(result.error.toString())
            } else {
                response.statusCode = 200
                response.end()
            }
        } 
        else if(request.method === "GET"
        && pathName === '/getPostById' 
        && query.id !== undefined) {
            const dbConnection = new database(dbSettings)
            var result = await getPostById(dbConnection, query.id)
            
            if(!result.correct) {
                response.statusCode = 404
                response.end(JSON.stringify(result.content))
            } else {
                response.setHeader('Content-Type', 'text/plain; charset=utf-8')
                response.setHeader('X-Content-Type-Options', 'nosniff')
                response.setHeader('Access-Control-Allow-Origin', '*')
                response.statusCode = 200
                response.write(JSON.stringify(result.content))
                response.end()
            }
        }
        else if(request.method === "GET"
        && pathName === '/getPostByPartialTitle' 
        && query.partialTitle !== undefined) {
            const dbConnection = new database(dbSettings)
            var result = await getPostByPartialTitle(dbConnection, query.partialTitle)
            
            if(!result.correct) {
                response.statusCode = 404
                response.end(result.error)
            } else {
                response.setHeader('Content-Type', 'text/plain; charset=utf-8')
                response.setHeader('X-Content-Type-Options', 'nosniff')
                response.setHeader('Access-Control-Allow-Origin', '*')
                response.statusCode = 200
                response.write(JSON.stringify(result.content))
                response.end()
            }
        } 
        else if(request.method === "GET"
        && pathName === '/getAllPosts' ) {
            const dbConnection = new database(dbSettings)
            var result = await getAllPosts(dbConnection)
            
            if(!result.correct) {
                response.statusCode = 404
                response.end(result.error)
            } else {
                response.setHeader('Content-Type', 'text/plain; charset=utf-8')
                response.setHeader('X-Content-Type-Options', 'nosniff')
                response.setHeader('Access-Control-Allow-Origin', '*')
                response.statusCode = 200
                response.write(JSON.stringify(result.content))
                response.end()
            }
        } 
        else if(request.method === "GET"
        && pathName === '/getAllAuthors' ) {
            const dbConnection = new database(dbSettings)
            var result = await getAllAuthors(dbConnection)
            
            if(!result.correct) {
                response.statusCode = 404
                response.end(result.error)
            } else {
                response.setHeader('Content-Type', 'text/plain; charset=utf-8')
                response.setHeader('X-Content-Type-Options', 'nosniff')
                response.setHeader('Access-Control-Allow-Origin', '*')
                response.statusCode = 200
                response.write(JSON.stringify(result.content))
                response.end()
            }
        } else {
            response.StatusCode = 400
            response.end()
        }
    }
}).listen(port)

console.log(`Application at: ${port}`)