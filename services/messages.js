// Definição do conteúdo das mensagens do robô 
// que são enviadas pelo webhook

export const encerraAtendimento = () => {
    return 'O atendimento foi encerrado. Envie um *Olá* para iniciar novamente.';
};

export const saudacoes = (nome, horario) => {
    let resposta = '';
    if(horario < 5)
        resposta += `Boa madrugada, *${nome}*. `;
    else if(horario < 13)
        resposta += `Bom dia, *${nome}*. `;
    else if(horario < 18)
        resposta += `Boa tarde, *${nome}*. `;
    else
        resposta += `Boa noite, *${nome}*. `;
    return resposta + "Bem vindo(a) ao Chatbot de atendimento Logicbox!";
};

export const reinicio = () => {
    return '*Atenção*: Após 5 minutos de inatividade, o atendimento é reiniciado.\nAlém disso, você pode também reiniciá-lo digitando *0*.'
} 

export const opcoesMenu = (NOME_DA_FILA) => {
    let resposta = 'Digite o *número* de atendimento desejado:\n- *1* - Comercial\n- *2* - Suporte';
    if(NOME_DA_FILA)
        resposta += `\n- *3* - ${NOME_DA_FILA}`
    return resposta;
}

export const menuSelecionado = (selecionado, NOME_DA_FILA='') => {
    if(selecionado === 1)
        return '*Atendimento comercial selecionado.*\nEstamos redirecionando sua solicitação para a fila de atendimentos. Aguarde que em alguns instantes um de nossos colaboradores entrará em contato com você.';
    else if(selecionado === 2)
        return '*Atendimento de suporte selecionado.*';
    else if(selecionado === 3)
        return `*Atendimento com ${NOME_DA_FILA} selecionado.*\nAguarde que, em alguns instantes, nosso colaborador entrará em contato com você.`;
    else if(selecionado != 0)
        return '*Opção inválida.*';
}

export const horarioDeAtendimento = () => {
    return 'Nosso horário de atendimento é\n\n*Segunda a Sexta* das *8:00* às *22:00*\n*Finais de semana e feriados* das 8:00 às 18:00';
}

export const opcoesSuporte = () => {
    return 'Digite o *número* de atendimento desejado:\n- *1* - Retaguarda\n- *2* - Frente de Caixa\n- *3* - TEF';
}

export const suporteSelecionado = (selecionado) => {
    if(selecionado === 1)
        return '*Retaguarda selecionado.*';
    else if(selecionado === 2)
        return '*Frente de Caixa selecionado.*';
    else if(selecionado === 3)
        return '*TEF selecionado.*';
    else if(selecionado != 0)
        return '*Opção inválida.*';
}

export const pedirDetalhes = () => {
    return 'Para facilitar o atendimento, por favor, *informe um breve resumo sobre o que está ocorrendo*, enquanto repassamos seu atendimento para o setor de suporte.';
}

export const pedirAvaliacao = (link) => {
    return `Por gentileza, avalie seu atendimento pelo link abaixo:\n\n${link}`
}