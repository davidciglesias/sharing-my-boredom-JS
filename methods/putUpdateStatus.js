const mysql = require('mysql')

module.exports = async (database, idpost, status, change) => {
    let sql =  `UPDATE post
                SET \`${status}\` = \`${status}\` + ${parseInt(change)}
                WHERE idpost = ${mysql.escape(idpost)}`
    var result = {}
    console.log(sql)
    console.log(`Attempting putUpdateStatus ${idpost} / ${change} / ${status}`)
    await database.query(sql)
        .then(() => {
            console.log(`Success in putUpdateStatus`)
            result.correct = true
            database.close()
        })
        .catch((err) => {
            database.close()
            console.log(`Error in putUpdateStatus - DB Issue ${err}`)
            result.correct = false
            result.error = err
        })
    return result
}