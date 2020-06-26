const getTests = require('./bookmarksGET.spec');
const getIdTests = require('./bookmarksGET-ID.spec');
const postTests = require('./bookmarksPOST.spec');
const patchTests = require('./bookmarksPATCH.spec');
const deleteTests = require('./bookmarksDELETE.spec');

describe('Bookmarks endpoints', function () {

    describe('GET /clipit/bookmarks', () => {
        getTests.emptyDB();
        getTests.bookmarksInsideDB();
        getTests.xssAttack();

    });

    describe('POST /clipit/bookmarks', () => {
        postTests.insertBookmark();
        postTests.missingField();
        postTests.xssAttack();
    });

    describe('GET /clipit/bookmarks/bookmark_id', () => {
        getIdTests.emptyDB();
        getIdTests.bookmarksInsideDB();
        getIdTests.xssAttack();
    });

    describe('PATCH /clipit/bookmarks/bookmark_id', () => {
        patchTests.emptyDB();
        patchTests.bookmarksInsideDB();
    });

    describe('DELETE /clipit/bookmarks/bookmark_id', () => {
        deleteTests.emptyDB();
        deleteTests.bookmarksInsideDB();

    });

});