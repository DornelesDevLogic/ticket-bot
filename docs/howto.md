# Manual de utilização

## Comandos
Todos os comandos devem ser usados a partir da raiz (/ticket-bot).

## Instalação
Na raiz do projeto
```sh
npm install
cd client
npm install
```

## Testes
Testar apenas o servidor do robô
```sh
npm run start
```

Testar apenas o client de notas
```sh
npm run client:dev
```

Testar ambos
```sh
npm run dev
```

Teste unitário login logidoc
```sh
cd api-logidoc
npm test
```

## Rodar com PM2

Para colocar o projeto no ar
```sh
pm2 start npm --name ticketbot-server -- start
pm2 start npm --name ticketbot-client -- run client:dev
```

Para apagar os processos
```sh
pm2 delete all
pm2 delete $NOME_DO_PROCESSO
```

Para monitorar os processos
```sh
pm2 monit
# Ou
pm2 logs # Logs completos em ~/.pm2/logs
```