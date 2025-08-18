const axios = require("axios");
const MockAdapter = require("axios-mock-adapter");
const { api } = require("../client.js");
const auth = require("../services/auth.js");

jest.mock("../services/auth.js", () => ({
  login: jest.fn(),
}));

describe("Interceptor de 401 com retry", () => {
  let mock;
  beforeEach(() => {
    mock = new MockAdapter(api);
    auth.login.mockClear();
  });
  afterEach(() => mock.reset());

  it("chama login e retry após 401", async () => {
    mock.onGet("/minha-rota").replyOnce(401);
    auth.login.mockResolvedValue();
    mock.onGet("/minha-rota").replyOnce(200, { sucesso: true });

    const res = await api.get("/minha-rota");
    expect(auth.login).toHaveBeenCalledTimes(1);
    expect(res.data).toEqual({ sucesso: true });
  });

  it("falha se o retry também der 401", async () => {
    mock.onGet("/minha-rota").reply(401);
    auth.login.mockResolvedValue();
    await expect(api.get("/minha-rota")).rejects.toThrow();
    expect(auth.login).toHaveBeenCalledTimes(1);
  });
});
