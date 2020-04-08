const db = require('../data/db')

module.exports = {

    async index(req,res){
        const query = {
            text: "SELECT * FROM notificado ORDER BY id DESC LIMIT 30 OFFSET 0"
        }

        db.query(query,(err, result)=>{
            if(result)
                return res.json(result.rows)
            else  
                return res.json(err)
        }) 
        
    }
}