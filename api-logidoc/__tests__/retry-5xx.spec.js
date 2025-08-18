// __tests__/getFilaCliente.test.js

const MockAdapter = require("axios-mock-adapter");
const { api } = require("../client.js");
const { getFilaCliente } = require("../services/getFilaCliente.js");

describe("getFilaCliente", () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(api);
  });

  afterEach(() => {
    mock.reset();
  });

  it("deve retornar a lista quando GET /fila_cliente?cod_cli=:codCli retornar 200 com FilaCli não vazio", async () => {
    const codCli = "cliente123";
    const dummyFila = [{ id: 1, nome: "A" }, { id: 2, nome: "B" }];
    // Simula GET /fila_cliente?cod_cli=cliente123 retornando { FilaCli: [...] }
    mock
      .onGet("/fila_cliente", { params: { cod_cli: codCli } })
      .reply(200, { FilaCli: dummyFila });

    const result = await getFilaCliente(codCli);
    expect(result).toEqual(dummyFila);
  });

  it("deve retornar null quando GET /fila_cliente retornar 200 com FilaCli = []", async () => {
    const codCli = "clienteVazio";
    mock
      .onGet("/fila_cliente", { params: { cod_cli: codCli } })
      .reply(200, { FilaCli: [] });

    const result = await getFilaCliente(codCli);
    expect(result).toBeNull();
  });

  it("deve retornar null quando GET /fila_cliente retornar 200 sem a chave FilaCli", async () => {
    const codCli = "semFila";
    // Resposta com corpo sem FilaCli
    mock
      .onGet("/fila_cliente", { params: { cod_cli: codCli } })
      .reply(200, { outraChave: [1, 2, 3] });

    const result = await getFilaCliente(codCli);
    expect(result).toBeNull();
  });

  it("deve retornar null quando GET /fila_cliente falhar com status 500", async () => {
    const codCli = "erro500";
    mock
      .onGet("/fila_cliente", { params: { cod_cli: codCli } })
      .reply(500);

    const result = await getFilaCliente(codCli);
    expect(result).toBeNull();
  });

  it("deve retornar null quando ocorrer timeout na requisição GET /fila_cliente", async () => {
    const codCli = "timeoutCli";
    mock
      .onGet("/fila_cliente", { params: { cod_cli: codCli } })
      .timeout();

    const result = await getFilaCliente(codCli);
    expect(result).toBeNull();
  });
});
