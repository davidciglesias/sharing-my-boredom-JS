require('dotenv').config({ path: './config/data.env', debug: process.env.DEBUG})

const http = require('http')
const url = require('url')
const dbSettings = require('./../config/dbSettings')
const database = require('./../classes/database')
const port = 8080
const getPostById = require('./../methods/getPostById')
const getPostByPartialTitle = require('./../methods/getPostByPartialTitle')
const getAllPosts = require('./../methods/getAllPosts')
const getAllAuthors = require('./../methods/getAllAuthors')
const postNewPost = require('./../methods/postNewPost')
const putUpdateStatus = require('./../methods/putUpdateStatus')
const passport = require('passport')
const socketio = require('socket.io')
const { OAuth2Strategy: GoogleStrategy } = require('passport-google-oauth')
const { Strategy: TwitterStrategy } = require('passport-twitter')
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser');
const cors = require('cors')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
app.use(express.json())
app.use(passport.initialize())
app.use(cors())
app.use(session({ 
    secret: 'KeyboardKittens', 
    resave: true, 
    saveUninitialized: true 
  }))

const TWITTER_CONFIG = {
    consumerKey: process.env.TWITTER_ACCESS_TOKEN,
    consumerSecret: process.env.TWITTER_ACCESS_SECRET,
    callbackURL: 'http://localhost:8080/twitter/callback',
}

const GOOGLE_CONFIG = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:8080/google/callback',
    scope: 'https://www.googleapis.com/auth/userinfo.profile'
}

passport.serializeUser((user, cb) => cb(null, user))
passport.deserializeUser((obj, cb) => cb(null, obj))
passport.use(new GoogleStrategy(
    GOOGLE_CONFIG, 
    (accessToken, refreshToken, profile, cb) => {
      
      // save the user right here to a database if you want
    //   const user = { 
    //       name: profile.username,
    //       photo: profile.photos[0].value.replace(/_normal/, '')
    //   }
        const user = {
            name: profile.displayName,
            photo: profile.photos[0].value.replace(/sz=50/gi, 'sz=250')
        }
      cb(null, user)
    })
  )
// passport.use(new TwitterStrategy(
//     TWITTER_CONFIG, 
//     (accessToken, refreshToken, profile, cb) => {
      
//       // save the user right here to a database if you want
//       console.log(profile)
//       const user = { 
//           name: profile.username,
//           photo: profile.photos[0].value.replace(/_normal/, '')
//       }
//       cb(null, user)
//     })
//   )


const twitterAuth = passport.authenticate('twitter')

const googleAuth = passport.authenticate('google', { failureRedirect: '/', scope: ['profile'] })

const addSocketIdToSession = (req, res, next) => {
    console.log("Adding SocketId to Session")
    console.log(req.query)
    req.session.socketId = req.query.socketId
    next()
}

app.use(bodyParser.json())

app.get('/twitter', addSocketIdToSession, twitterAuth)
app.get('/twitter/callback', (req, res, n2) => {console.log("Twitter Back"); n2() },  twitterAuth, (req, res) => {
    console.log("Returning!")
    io.in(req.session.socketId).emit('user', req.user)
    res.end()
  })

app.get('/google', addSocketIdToSession, googleAuth)
app.get('/google/callback', (req, res, n2) => {console.log("Google Back"); n2() },  googleAuth, (req, res) => {
    console.log("Returning!")
    io.in(req.session.socketId).emit('user', req.user)
    res.end()
  })

app.get('/logout', (req, res) => {
    console.log("logging out!")
    req.logout();
    req.session = null;
    passport
    res.redirect('/');
});

app.post('/postNewPost', async(request, response) => {
    var postRequestJson = request.body
    const dbConnection = new database(dbSettings)
    var result = await postNewPost(dbConnection, postRequestJson.idauthor,
        postRequestJson.title, postRequestJson.content)

    if(!result.correct) {
        response.status(400).end(result.error.toString())
    } else {
        response.set({
            'Content-Type': 'text/plain',
            'Charset': 'utf-8',
            'X-Content-Type-Options': 'nosniff',
            'Access-Control-Allow-Origin': '*'
        }).status(201).end()
    }
})

app.put('/putUpdate', async(request, response) => {
    const parsedUrl = url.parse(request.url, true)
    const query = parsedUrl.query
    const columnOptions = ['happy', 'sad', 'angry', 'surprised']

    if(query.id !== undefined
    && query.column !== undefined && columnOptions.includes(query.column)
    && query.change !== undefined && (query.change == 1 || query.change == -1)) {
        const dbConnection = new database(dbSettings)
        var result = await putUpdateStatus(dbConnection, query.id,
            query.column, query.change)
    
        if(!result.correct) {
            response.status(404).end(result.error.toString())
        } else {
            response.status(200).end()
        }
    } 
})

app.get('/getPostById', async(request, response) => {
    const parsedUrl = url.parse(request.url, true)
    const query = parsedUrl.query
    if(query.id !== undefined) {
        const dbConnection = new database(dbSettings)
        var result = await getPostById(dbConnection, query.id)
        
        if(!result.correct) {
            response.status(404).end(JSON.stringify(result.content))
        } else {
            response.set( {
                'Content-Type': 'text/plain',
                'Charset': 'utf-8',
                'X-Content-Type-Options': 'nosniff',
                'Access-Control-Allow-Origin': '*'
            }).status(200).send(JSON.stringify(result.content))
        }
    }
})

app.get('/getPostByPartialTitle', async(request, response) => {
    const parsedUrl = url.parse(request.url, true)
    const query = parsedUrl.query
    if(query.partialTitle !== undefined) {
        const dbConnection = new database(dbSettings)
        var result = await getPostByPartialTitle(dbConnection, query.partialTitle)
        
        if(!result.correct) {
            response.status(404).end(result.error)
        } else {
            response.set( {
                'Content-Type': 'text/plain',
                'Charset': 'utf-8',
                'X-Content-Type-Options': 'nosniff',
                'Access-Control-Allow-Origin': '*'
            }).status(200).send(JSON.stringify(result.content))
        }
    }
})

app.get('/getAllPosts', async (request, response) => {
    const dbConnection = new database(dbSettings)
    var result = await getAllPosts(dbConnection)
    
    if(!result.correct) {
        response.status(404).end(result.error)
    } else {
        response.set({
            'Content-Type': 'text/plain',
            'Charset': 'utf-8',
            'X-Content-Type-Options': 'nosniff',
            'Access-Control-Allow-Origin': '*'
        }).status(200).send(JSON.stringify(result.content))
    }
})

app.get('/getAllAuthors', async (request, response) => {
    const dbConnection = new database(dbSettings)
    var result = await getAllAuthors(dbConnection)
    
    if(!result.correct) {
        response.status(404).end(result.error)
    } else {
        response.set({
            'Content-Type': 'text/plain',
            'Charset': 'utf-8',
            'X-Content-Type-Options': 'nosniff',
            'Access-Control-Allow-Origin': '*'
        }).status(200).send(JSON.stringify(result.content))
    }
})

app.use("/favicon.ico", express.static('public/favicon.ico')); 

server.listen(port, () => console.log(`Application at: ${port}`))