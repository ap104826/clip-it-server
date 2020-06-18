const path = require('path')
const express = require('express')
const xss = require('xss')
const metaScraper = require("meta-scraper").default
const BookmarksService = require('./bookmarks-service')

const bookmarksRouter = express.Router()
const jsonParser = express.json()

const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: xss(bookmark.title),
    category_id: bookmark.category_id,
    thumbnail_url: bookmark.thumbnail_url,
    description: bookmark.description,
    is_favorite: bookmark.is_favorite,
    link: xss(bookmark.link),
    modified: bookmark.modified
})

bookmarksRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        BookmarksService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.json(bookmarks.map(serializeBookmark))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {

        const { link, category_id } = req.body

        if (!link) {
            return res.status(400).json({
                error: { message: `Missing '${key}' in request body` }
            })
        }

        metaScraper(link)
            .then(function (data) {
                console.log(data);

                const newBookmark = {
                    title: data.title,
                    thumbnail_url: data.image,
                    link,
                    description: data.description,
                    category_id
                }

                BookmarksService.insertBookmark(
                    req.app.get('db'),
                    newBookmark
                )
                    .then(bookmark => {
                        res
                            .status(201)
                            .location(path.posix.join(req.originalUrl, `/${bookmark.id}`))
                            .json(serializeBookmark(bookmark))
                    })
            });
    })


bookmarksRouter
    .route('/:bookmark_id')
    .all((req, res, next) => {
        BookmarksService.getById(
            req.app.get('db'),
            parseInt(req.params.bookmark_id)
        )
            .then(bookmark => {
                if (!bookmark) {
                    return res.status(404).json({
                        error: { message: `bookmark doesn't exist` }
                    })
                }
                res.bookmark = bookmark
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeBookmark(res.bookmark))
    })
    .delete((req, res, next) => {
        BookmarksService.deleteBookmark(
            req.app.get('db'),
            parseInt(req.params.bookmark_id)
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })
    .put(jsonParser, (req, res, next) => {
        const { is_favorite } = req.body
        const bookmarkToUpdate = { is_favorite }


        if (is_favorite !== true && is_favorite !== false)
            return res.status(400).json({
                error: {
                    message: `Request body must contain 'is_favorite'`
                }
            })

        BookmarksService.updateBookmark(
            req.app.get('db'),
            req.params.bookmark_id,
            bookmarkToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = bookmarksRouter