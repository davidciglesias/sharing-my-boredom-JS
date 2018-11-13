const mysql = require('mysql')
const moment = require('moment')

module.exports = async (database, fullname, email, saltedpassword, isAuthor) => {
    let sql =  `INSERT INTO user 
    (fullname,
    email,
    password,
    creationdate)
    VALUES
    (${mysql.escape(fullname)},
    ${mysql.escape(email)},
    ${mysql.escape(saltedpassword)},
    '${moment.utc().format('YYYY-MM-DD HH:mm:ss')}')`
    var result = {}
    console.log(`Attempting postNewUser ${fullname} / ${email} / ${isAuthor}`)
    await database.query(sql)
        .then(async(sqlResult) => {
            console.log(sqlResult.insertId)
            console.log(`Success in postNewUser`)
            result.correct = true
            if(isAuthor) {
                let sql =  `INSERT INTO author 
                (iduser)
                VALUES
                (${sqlResult.insertId})`
                console.log(sql)
                console.log(`Attempting postNewAuthor ${fullname} / ${email} / ${isAuthor}`)
                await database.query(sql)
                    .then(() => {
                        console.log(`Success in postNewAuthor`)
                        result.correct = true
                        database.close()
                    })
                    .catch((err) => {
                        database.close()
                        console.log(`Error in postNewAuthor - DB Issue ${err}`)
                        result.correct = false
                        result.error = err
                    })
            }
        })
        .catch((err) => {
            database.close()
            console.log(`Error in postNewUser - DB Issue ${err}`)
            result.correct = false
            result.error = err
        })
    
    return result
}