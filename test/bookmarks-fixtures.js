function makeBookmarksArray() {
    return [
        {
            id: 1,
            title: 'First test bookmark!',
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
            modified: '2019-01-22T16:28:32.615Z',
            thumbnail_url: 'https://google.com',
            is_favorite: true,
            link: 'https://google.com',
            category_id: null
        },
        {
            id: 2,
            title: 'Second test bookmark!',
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
            modified: '2019-01-22T16:28:32.615Z',
            thumbnail_url: 'https://google.com',
            is_favorite: true,
            link: 'https://google.com',
            category_id: null
        }
    ]
};
function makeMaliciousBookmark() {
    const maliciousBookmark = {
        id: 911,
        date_created: new Date().toISOString(),
        name: 'Naughty naughty very naughty <script>alert("xss");</script>',
        content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        category: 1
    }
    const expectedBookmark = {
        ...maliciousBookmark,
        name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
        categeory: 1
    }
    return {
        maliciousBookmark,
        expectedBookmark,
    }

};

module.exports = { makeBookmarksArray, makeMaliciousBookmark };