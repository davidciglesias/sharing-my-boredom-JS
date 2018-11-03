module.exports = async (database) => {
    let sql =  `SELECT idauthor, fullname
                FROM author`
    var result = {}
    console.log(`Attempting getAllAuthors`)
    await database.query(sql)
        .then((rows) => {
            if(rows.length > 0) {
                console.log(rows)
                result.content = rows
                result.correct = true
                console.log(`Success in getAllAuthors`)
                database.close()
            } else {
                database.close()
                console.log(`Error in getAllAuthors - No results`)
                result.correct = false
                result.error = 'No results'
            }
        })
        .catch((err) => {
            database.close()
            console.log(`Error in getAllAuthors - DB Issue ${err}`)
            result.correct = false
            result.error = err
        })
    return result
}