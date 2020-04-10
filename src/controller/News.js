const db = require('../data/db')

module.exports = {

    async index(req,res){
        let pagina = req.query.page

        if(typeof(pagina) != 'string' || pagina < 0){
            pagina = 0
        }

        const banner = {
            text:"SELECT url_image, url_target FROM banner WHERE ativo = true"
        }
        
        let banner_list
        
        db.query(banner,(err,res)=>{
            if(res)
                banner_list = res.rows
        })

        const pages = {
            text: "SELECT id FROM notificado",
        }

        let maxPage
        db.query(pages,(err,res)=>{
            if(res)
                maxPage = res.rowCount
        })

        const query = {
            text: "SELECT id,title,description,TO_CHAR(date :: DATE, 'dd/mm/yyyy')AS date, TO_CHAR(hour :: TIME, 'hh24:mi')AS hour, url, image_url FROM notificado ORDER BY id DESC LIMIT 10 OFFSET $1*2",
            values: [pagina]
        }

        pagina = parseInt(pagina)


        db.query(query,(err, news)=>{
            if(news)
                return res.render('index',{news:news.rows,pagina,showPages: 2,maxPage,banner: banner_list})
            else  
                return res.json(err)
        }) 
        
    },

    async sobre(req,res){
        return res.render('sobre')
    }
}