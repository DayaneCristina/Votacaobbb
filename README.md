## 🏆 Sistema de Votação Paredão BBB

Um sistema completo de votação para o paredão do Big Brother Brasil.

## 🤖 Tecnologias Utilizadas
- GoLang
- React
- Grafana
- Prometheus
- Docker
- Redis
- PostgreSQL

## 🚀 Começando
Para executar este projeto local, só é necessário como pré-requisito somente o Docker.

## ⚙️ Execução Local

### Backend
Para rodarmos o Backend do projeto podemos utilizar os comandos disponíveis no arquivo MAKEFILE. Na primeira execução, será necessário rodar o `make migrate` para criar a estrutura da base de dados. Uma vez que o banco esteja OK, podemos rodar o `make up` para subir o projeto ou `docker-compose up` a partir da raiz do diretório `backend`. A API pode ser acessadaa a partir do link `http://localhost:8080`.

### Frontend
O Frontend pode ser executado utilizando o Docker executando `docker-compose up` a partir da raiz do diretório `frontend`. O Frontend fica disponível no endereço `http://localhost:3001`.

## 🏗️ Estrutura do Projeto
```
📦bbb-voting-system 
├───📂 backend
│   ├───📂cmd
│   │   ├───📂api
│   │   └───📂migrate
│   ├───📂grafana-data
│   ├───📂internal
│   │   ├───📂config
│   │   ├───📂controller
│   │   ├───📂entity
│   │   ├───📂metrics
│   │   ├───📂repository
│   │   │   ├───📂cache
│   │   │   └───📂database
│   │   └───📂service
│   └───📂migrations
└───📂frontend
    ├───📂public
    └───📂src
        ├───📂assets
        │   └───📂images
        ├───📂components
        ├───📂pages
        ├───📂services
        └───📂styles
```
## 🔍 Documentação da API

Os endpoints disponíveis na API são:

[GET] /api/v1/votes/results
```
curl --location --request GET 'localhost:8080/api/v1/votes/results' \
--header 'X-Request-Id: 61953821-f607-495e-b067-bdb240b0145c' \
--header 'Content-Type: application/json' \
--data '{
    "option_id": 1
}'
```

[POST] /api/v1/votes
```
curl --location 'http://localhost:8080/api/v1/votes' \
--header 'X-Request-Id: 7cbf1b3f-0db5-474b-aab7-68235eb634f5' \
--header 'Content-Type: application/json' \
--data '{"option_id":1}'
```

## 📊 Métricas e Monitoramento
Nesse projeto utilizei o Prometheus para coleta de métricas e o Grafana para gerar os dashboards. O Grafana pode ser acessado através do link `http://localhost:3000` para acompanhar o Dashboard.

[grafana](https://github.com/DayaneCristina/Votacaobbb/docs/grafana.png "Grafana")

## 👷‍♂️ Arquitetura
### Local
Arquitetura local se basei em Containers, ou seja, o projeto roda suas dependendencias a partir do Docker, o que facilita a execução. Abaixo um esboço do desenho de arquitetura:

[local](https://github.com/DayaneCristina/Votacaobbb/docs/local.jpg "Arquitetura Local")

### PROD
Para uma arquitetura em Ambiente produtivo, o ideal é a adição de Load Balancer entre a requisição do usuário e o Frontend e também entre o Frontend e o Backend para garantir que a aplicação seja escalável. Abaixo um esboço do desenho de arquitetura:

[prod](https://github.com/DayaneCristina/Votacaobbb/docs/prod.jpg "Arquitetura PROD")

## 🚧 Melhorias e Desenvolvimento
Nessa primeira versão, foi possível o desenvolvimento e a entrega das funcionaldiade de computar o voto e exibir os resultados. Porém alguns pontos de qualidade e arquitetura ficaram de fora da entrega final. Para um plano de desenvolvimento e evolução futuro, seria ideal:
- Implementação de testes unitários e de integração
- Melhorias na comunicação entre Frontend e Backend (adicionar Load Balancer e Otimização de Base de Dados)
- Adicionar validação de reCaptcha no Backend
- Melhoria no Design de Código e otimização de Fluxos
- Adicionar Swagger para documentação dos endpoints da API