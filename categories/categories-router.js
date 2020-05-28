const path = require('path')
const express = require('express')
const xss = require('xss')
const CategoriesService = require('./categories-service')
const BookmarksService = require('../bookmarks/bookmarks-service')
const categoriesRouter = express.Router()
const jsonParser = express.json()

const serializeCategory = category => ({
    id: category.id,
    name: xss(category.name),
    modified: category.modified
})

categoriesRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        CategoriesService.getAll(knexInstance)
            .then(categories => {
                res.json(categories.map(serializeCategory))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { name } = req.body
        const newCategory = { name }

        for (const [key, value] of Object.entries(newCategory)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        CategoriesService.insert(
            req.app.get('db'),
            newCategory
        )
            .then(category => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${category.id}`))
                    .json(serializeCategory(category))
            })
            .catch(next)
    })

categoriesRouter
    .route('/:category_id')
    .all((req, res, next) => {
        CategoriesService.getById(
            req.app.get('db'),
            req.params.category_id
        )
            .then(category => {
                if (!category) {
                    return res.status(404).json({
                        error: { message: `Category doesn't exist` }
                    })
                }
                res.category = category
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeCategory(res.category))
    })
    .delete((req, res, next) => {
        BookmarksService.removeCategoryFromBookmarks(
            req.app.get('db'),
            req.params.category_id
        )
        .then(() => {
            CategoriesService.deleteCategory(
                req.app.get('db'),
                req.params.category_id
            )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { name } = req.body
        const categoryToUpdate = { name }

        const numberOfValues = Object.values(categoryToUpdate).filter(Boolean).length
        if (numberOfValues === 0)
            return res.status(400).json({
                error: {
                    message: `Request body must contain name`
                }
            })

        CategoriesService.updateCategory(
            req.app.get('db'),
            req.params.category_id,
            categoryToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = categoriesRouter