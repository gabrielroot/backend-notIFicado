const db = require('../data/db')

module.exports = {

    async index(req,res){
        const query = {
            text: "SELECT id,title,description,TO_CHAR(date :: DATE, 'dd/mm/yyyy')AS date, TO_CHAR(hour :: TIME, 'hh24:mi')AS hour, url, image_url FROM notificado ORDER BY id DESC LIMIT 30 OFFSET 0"
        }

        db.query(query,(err, news)=>{
            console.log(news.rows)
            if(news)
                return res.render('index',{news:news.rows})
            else  
                return res.json(err)
        }) 
        
    }
}