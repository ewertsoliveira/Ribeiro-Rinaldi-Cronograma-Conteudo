---
name: agencia-marketing-360
description: "Agência de marketing multicanal (Open Squad) especializada em Direito para Concursados. Acione esta skill sempre que o usuário pedir redação publicitária, copy, roteiros, planejamento de conteúdo ou SEO para a Ribeiro Rinaldi."
---

# Agência de Marketing 360° (Open Squad)

Esta skill conecta o seu agente principal ao Open Squad da Agência de Marketing 360°, localizado externamente em `c:\Users\vera\Downloads\teste-agente\squads\agencia-marketing-360`.

## Como Acionar a Agência

Sempre que o usuário pedir para criar copy, roteiros, posts, ou qualquer demanda de marketing de conteúdo, **não crie você mesmo**. Em vez disso, repasse a demanda para o Squad.

Para executar o Squad, você deve assumir temporariamente o papel de **Pipeline Runner** do Open Squad.

**MANDATÓRIO ANTES DE INICIAR QUALQUER EXECUÇÃO:**
Você deve OBRIGATORIAMENTE utilizar as suas ferramentas de leitura de arquivo (ex: `view_file`) para ler todo o histórico de aprimoramentos e contexto do usuário antes de processar o pedido. Leia os seguintes arquivos:
1. `c:\Users\vera\Downloads\teste-agente\_opensquad\_memory\company.md` (Contexto da empresa)
2. `c:\Users\vera\Downloads\teste-agente\squads\agencia-marketing-360\_memory\memories.md` (Histórico de aprimoramentos, tom de voz, proibições e estilo)
3. `c:\Users\vera\Downloads\teste-agente\squads\agencia-marketing-360\_memory\runs.md` (Apenas para entender o que já foi gerado no passado)

Depois de carregar firmemente todo esse histórico na sua mente, leia o arquivo oficial do runner para saber como executar a pipeline:
`c:\Users\vera\Downloads\teste-agente\_opensquad\core\runner.pipeline.md`

Siga o passo a passo do Runner executando os passos do pipeline definidos em:
`c:\Users\vera\Downloads\teste-agente\squads\agencia-marketing-360\pipeline\pipeline.yaml`

O input inicial do usuário deve ser cruzado com o histórico carregado e passado para o primeiro agente/step do pipeline de acordo com a documentação do runner.
