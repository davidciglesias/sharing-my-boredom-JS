const mysql = require('mysql')
const moment = require('moment')

module.exports = async (database, idauthor, title, content) => {
    let sql =  `INSERT INTO post 
    (idauthor,
    title,
    content,
    happy,
    sad,
    angry,
    surprised,
    creationdate)
    VALUES
    (${mysql.escape(idauthor)},
    ${mysql.escape(title)},
    ${mysql.escape(content)},
    0,
    0,
    0,
    0,
    '${moment.utc().format('YYYY-MM-DD HH:mm:ss')}')`
    var result = {}
    console.log(sql)
    console.log(`Attempting postNewPost ${idauthor} / ${title} / ${content}`)
    await database.query(sql)
        .then(() => {
            console.log(`Success in postNewPost`)
            result.correct = true
            database.close()
        })
        .catch((err) => {
            database.close()
            console.log(`Error in postNewPost - DB Issue ${err}`)
            result.correct = false
            result.error = err
        })
    return result
}