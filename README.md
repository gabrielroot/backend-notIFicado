# notIFicado
Uma plataforma que acessa o portal de notícias do IFNMG - Campus Januária e realiza uma raspagem de dados (Web Scraping) coletando o básico das notícias {title, url, image_url, description, date, hour}, com a intenção de notificar ao usuário final a cada notícia nova postada por servidores do IFNMG - Campus januária

# OBS: Hospedagem
Como dito, aplicação está programada para realizar acessos de tempos em tempos. Entretanto, como não foi disponibilizada para os usuários e está sendo disponibilizada somente para amostragem, passei a utilizar uma hospedagem gratuita que por sua vez suspende o website a partir de meia hora de inatividade, logo, esta não irá trabalhar como diz sua programação.
Mas criei uma **função** que chama o WebScrapping assim que a aplicação é iniciada, portanto, logo que o notIFicado for acessado, o heroku irá alternar entre o estado de hibernação/ativo, permitindo que o app execute a **função**. O webscrapping dura cerca de 10s para ser totalmente executado portanto, para visualizar o conteúdo atualizado, se faz necessário atualizar a página após o tempo da raspagem.


# Tecnologias em destaque{
    NODEJS: "Interpretador de javaScript",
    NUNJUCKS: "Template engine",
    POSTGRES: "Sistema gerenciador de banco de dados relacional",
    PUPPETEER: "Uma biblioteca Node que fornece uma API de alto nível para controlar o Chrome ou o Chromium por meio do protocolo DevTools.",
    PWA: "Progressive Web App"
# }

# Página Inicial
![Captura de tela](screenshot.png?raw=true "Title")
