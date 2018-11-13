const mysql = require('mysql')
const bcrypt = require('bcryptjs')

module.exports = async (database, email, unsaltedpassword) => {
    let sql =  `SELECT
    email,
    password
    FROM user
    WHERE email = ${mysql.escape(email)}`
    var result = {}
    console.log(unsaltedpassword)
    console.log(`Attempting postCheckCredentials ${email}`)
    await database.query(sql)
        .then(async(sqlResult) => {
            console.log(`Success in postCheckCredentials`)
            console.log(sqlResult.length)
            console.log(sqlResult[0].email)
            if(sqlResult.length > 0) {
                console.log(unsaltedpassword)
                console.log("P "+ sqlResult[0].password)
                await bcrypt.compare(unsaltedpassword, sqlResult[0].password)
                    .then((res) => {
                        console.log("correct!")
                        result.correct = res
                        if(!res) {
                            result.error = 'Wrong password'
                        }
                    })
            }
            else {
                result.correct = false
            }
            database.close()
        })
        .catch((err) => {
            database.close()
            console.log(`Error in postCheckCredentials - DB Issue ${err}`)
            result.correct = false
            result.error = err
        })
    
    return result
}