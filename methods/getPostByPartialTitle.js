const mysql = require('mysql')

module.exports = async (database, partialTitle) => {
    let sql =  `SELECT idpost, title
                FROM post_with_author
                WHERE title like ${mysql.escape(`%${partialTitle}%`, true)}`
    var result = {}
    console.log(`Attempting getPostByPartialTitle - ${partialTitle}`)
    await database.query(sql)
        .then((rows) => {
            if(rows.length > 0) {
                result.content = rows[0]
                result.correct = true
                console.log(`Success in getPostByPartialTitle - ${partialTitle} - ${rows[0]}`)
                database.close()
            } else {
                database.close()
                console.log(`Error in getPostByPartialTitle - ${partialTitle} - No results`)
                result.correct = false
                result.error = 'No results'
            }
        })
        .catch((err) => {
            database.close()
            console.log(`Error in getPostByPartialTitle - ${partialTitle} - DB Issue ${err}`)
            result.correct = false
            result.error = err
            
        })
    return result
}