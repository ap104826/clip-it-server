require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const categoriesRouter = require('./categories/categories-router')
const bookmarksRouter = require('./bookmarks/bookmarks-router')

const app = express()

// const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan())
app.use(helmet())
app.use(cors())
app.use('/api/categories', categoriesRouter)
app.use('/api/bookmarks', bookmarksRouter)


    app.use((error, req, res, next) => {
        let response
        if (process.env.NODE_ENV === 'production') {
            response = { error: { message: 'server error' } }
        } else {
            response = { error }
        }
    res.status(500).json(response)
})

module.exports = app