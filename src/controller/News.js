const db = require('../data/db')

module.exports = {

    async index(req,res){
        const query = {
            text: "SELECT * FROM notificado ORDER BY id DESC LIMIT 30 OFFSET 0"
        }

        db.query(query) .then((result)=>{
            return res.json(result.rows)
        })
    }
}