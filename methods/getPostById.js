const mysql = require('mysql')

module.exports = async (database, id) => {
    let sql =  `SELECT fullname, email, title, content, happy, sad, angry, surprised, creationDate
                FROM post_with_author
                WHERE idpost = ${mysql.escape(id)}`
    var result = {}
    console.log(`Attempting getPostById - ${id}`)
    await database.query(sql)
        .then((rows) => {
            if(rows.length > 0) {
                result.content = rows[0]
                result.correct = true
                console.log(`Success in getPostById - ${id} - ${rows[0]}`)
                database.close()
            } else {
                database.close()
                console.log(`Error in getPostById - ${id} - No results`)
                result.correct = false
                result.content = ""
                result.error = 'No results'
            }
        })
        .catch((err) => {
            database.close()
            console.log(`Error in getPostById - ${id} - DB Issue ${err}`)
            result.correct = false
            result.content = ""
            result.error = err
        })
    return result
}