const path = require('path')
const express = require('express')
const xss = require('xss')
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
        const { title, thumbnail_url, link, is_favorite, description, category_id } = req.body
        const newBookmark = { title, thumbnail_url, link, is_favorite, description, category_id }

        if (!link) {
            return res.status(400).json({
                error: { message: `Missing '${key}' in request body` }
            })
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
    .patch(jsonParser, (req, res, next) => {
        const { title, category_id, is_favorite, description } = req.body
        const bookmarkToUpdate = { title, category_id, is_favorite, description }

        if (!title) {
            return res.status(400).json({
                error: { message: `Missing 'title' in request body` }
            })
        }

        BookmarksService.updateBookmark(
            req.app.get('db'),
            parseInt(req.params.bookmark_id),
            bookmarkToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = bookmarksRouter