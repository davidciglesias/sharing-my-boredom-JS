module.exports = async (database) => {
    let sql =  `SELECT idpost, title
                FROM post_with_author`
    var result = {}
    console.log(`Attempting getAllPosts`)
    await database.query(sql)
        .then((rows) => {
            if(rows.length > 0) {
                console.log(rows)
                result.content = rows
                result.correct = true
                console.log(`Success in getAllPosts`)
                database.close()
            } else {
                database.close()
                console.log(`Error in getAllPosts - No results`)
                result.correct = false
                result.error = 'No results'
            }
        })
        .catch((err) => {
            database.close()
            console.log(`Error in getAllPosts - DB Issue ${err}`)
            result.correct = false
            result.error = err
        })
    return result
}