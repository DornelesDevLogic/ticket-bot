
# Erros conhecidos robô

## Erro1: Não consigo ver a mensagem enviada pelo notify-ticket-closed (grupo e privado) pelo celular, mas no Whatsapp Web funciona

### Possíveis soluções
Esse erro pode ser por conta de uma autenticação de sessão expirada no baileys. No web deve funcionar por conta do navegador lidar com a sessão de outra forma. No BD a mensagem mostra como enviada.

### Como foi resolvido
Após alguns envios de mensagem, a sessão foi resetada e voltou a funcionar.

### Logs
Quando dá o erro
```sh
0|logicbox-backend  | Decrypted message with closed session.
```

```sh
0|logicbox-backend  | Closing stale open session for new outgoing prekey bundle
0|logicbox-backend  | Closing session: SessionEntry {
0|logicbox-backend  |   _chains: {
0|logicbox-backend  |     BdE1OPQtHNVoBnjcPKDCLDg6IsyiQc8gSGHgzvv1sBoA: { chainKey: [Object], chainType: 1, messageKeys: {} }
0|logicbox-backend  |   },
0|logicbox-backend  |   registrationId: 105206820,
0|logicbox-backend  |   currentRatchet: {
0|logicbox-backend  |     ephemeralKeyPair: {
0|logicbox-backend  |       pubKey: <Buffer 05 d1 35 38 f4 2d 1c d5 68 06 78 dc 3c a0 c2 2c 38 3a 22 cc a2 41 cf 20 48 61 e0 ce fb f5 b0 1a 00>,
0|logicbox-backend  |       privKey: <Buffer 60 86 3c 25 67 2d 4f 5c a1 17 6f 6c 84 a1 32 38 e0 8e df 83 52 78 c5 a9 7b b2 89 41 67 d4 36 79>
0|logicbox-backend  |     },
0|logicbox-backend  |     lastRemoteEphemeralKey: <Buffer 05 38 43 15 07 42 70 f9 9d f0 41 c2 5c 34 67 f1 19 2d cd 83 16 f6 d2 88 de 74 13 c0 48 9b 0c 56 67>,
0|logicbox-backend  |     previousCounter: 0,
0|logicbox-backend  |     rootKey: <Buffer fe 89 35 10 a5 a8 da 32 bb f0 9f 83 52 74 fd ab ef 19 cf 10 d3 8c 43 f7 cb e4 f8 32 05 33 16 12>
0|logicbox-backend  |   },
0|logicbox-backend  |   indexInfo: {
0|logicbox-backend  |     baseKey: <Buffer 05 29 e5 db c7 98 d0 62 d0 ea 7b 0d a9 e8 3c c3 87 ee 15 78 e6 4c ef 5f 9a d4 ca 55 05 55 6b 9d 58>,
0|logicbox-backend  |     baseKeyType: 1,
0|logicbox-backend  |     closed: -1,
0|logicbox-backend  |     used: 1748607030456,
0|logicbox-backend  |     created: 1748607030456,
0|logicbox-backend  |     remoteIdentityKey: <Buffer 05 3d aa 49 81 54 46 23 bc 62 06 f3 35 dc 7f 03 d6 63 de be b2 dd e1 bd 3b 7f a1 a4 f5 3b ab 64 69>
0|logicbox-backend  |   },
0|logicbox-backend  |   pendingPreKey: {
0|logicbox-backend  |     signedKeyId: 1,
0|logicbox-backend  |     baseKey: <Buffer 05 29 e5 db c7 98 d0 62 d0 ea 7b 0d a9 e8 3c c3 87 ee 15 78 e6 4c ef 5f 9a d4 ca 55 05 55 6b 9d 58>,
0|logicbox-backend  |     preKeyId: 5393472
0|logicbox-backend  |   }
0|logicbox-backend  | }
```

Quando resolve
```sh
0|logicbox-backend  | Removing old closed session: SessionEntry {
0|logicbox-backend  |   _chains: {
0|logicbox-backend  |     'BcK1xkj6Mxpau0zj7bKfoxCcTIiF0ukr28STmBG+G65z': { chainKey: [Object], chainType: 1, messageKeys: {} }
0|logicbox-backend  |   },
0|logicbox-backend  |   registrationId: 105206820,
0|logicbox-backend  |   currentRatchet: {
0|logicbox-backend  |     ephemeralKeyPair: {
0|logicbox-backend  |       pubKey: <Buffer 05 c2 b5 c6 48 fa 33 1a 5a bb 4c e3 ed b2 9f a3 10 9c 4c 88 85 d2 e9 2b db c4 93 98 11 be 1b ae 73>,
0|logicbox-backend  |       privKey: <Buffer b0 4d 5d 6e 36 a6 f7 df 47 79 75 20 2d 27 1d 41 4e 41 be c9 60 a9 36 0b 2f 91 31 cd 82 d0 6c 6c>
0|logicbox-backend  |     },
0|logicbox-backend  |     lastRemoteEphemeralKey: <Buffer 05 38 43 15 07 42 70 f9 9d f0 41 c2 5c 34 67 f1 19 2d cd 83 16 f6 d2 88 de 74 13 c0 48 9b 0c 56 67>,
0|logicbox-backend  |     previousCounter: 0,
0|logicbox-backend  |     rootKey: <Buffer 42 51 6e 63 6b e9 58 63 8b d6 fd 2b 1e 3b 45 b6 84 1d 5f 32 37 7f 14 32 02 a4 e7 4a 56 99 db f3>
0|logicbox-backend  |   },
0|logicbox-backend  |   indexInfo: {
0|logicbox-backend  |     baseKey: <Buffer 05 59 69 47 76 68 e7 1c ea 0c 46 6e eb 72 57 e3 6e 12 3f f0 34 d2 cc 55 e9 97 a6 7e 2d c8 80 44 16>,
0|logicbox-backend  |     baseKeyType: 1,
0|logicbox-backend  |     closed: 1748460017434,
0|logicbox-backend  |     used: 1748460015564,
0|logicbox-backend  |     created: 1748460015564,
0|logicbox-backend  |     remoteIdentityKey: <Buffer 05 3d aa 49 81 54 46 23 bc 62 06 f3 35 dc 7f 03 d6 63 de be b2 dd e1 bd 3b 7f a1 a4 f5 3b ab 64 69>
0|logicbox-backend  |   },
0|logicbox-backend  |   pendingPreKey: {
0|logicbox-backend  |     signedKeyId: 1,
0|logicbox-backend  |     baseKey: <Buffer 05 59 69 47 76 68 e7 1c ea 0c 46 6e eb 72 57 e3 6e 12 3f f0 34 d2 cc 55 e9 97 a6 7e 2d c8 80 44 16>,
0|logicbox-backend  |     preKeyId: 5392987
0|logicbox-backend  |   }
0|logicbox-backend  | }
```