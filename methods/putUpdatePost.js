const mysql = require('mysql')

module.exports = async (database, idpost, newTitle, newContent) => {
    let sql =  `UPDATE post
                SET title = ${mysql.escape(newTitle)}, content = ${mysql.escape(newContent)}
                WHERE idpost = ${mysql.escape(idpost)}`
    var result = {}
    console.log(`Attempting putUpdatePost ${idpost} / ${newTitle} / ${newContent}`)
    await database.query(sql)
        .then(() => {
            console.log(`Success in putUpdatePost`)
            result.correct = true
            database.close()
        })
        .catch((err) => {
            database.close()
            console.log(`Error in putUpdatePost - DB Issue ${err}`)
            result.correct = false
            result.error = err
        })
    return result
}