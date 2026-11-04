---
name: feature-com-spec
description: "Use when implementing a feature through a controlled CDCI flow: understand the project, write and approve a specification, plan dependent tasks, implement incrementally, and validate observable behavior."
---

# Feature com especificação

## Objetivo

Conduzir uma feature pelo fluxo:

**contexto do projeto → especificação → plano → implementação incremental →
validação → commits**.

A skill é agnóstica à linguagem, arquitetura, ferramentas e organização de cada
projeto. Sempre siga as convenções e os caminhos já existentes no repositório.

## Entradas

- Descrição do comportamento desejado e seus limites.
- Projeto, repositório ou diretório onde a feature será implementada.
- Restrições, critérios de aceite, forma de validação e decisões já tomadas.

Se uma decisão alterar o comportamento, escopo ou compatibilidade, pare e
resolva a ambiguidade antes de escrever a especificação.

## Etapa 2 — Entender o contexto do projeto

Leia a documentação principal, instruções locais, configuração, código relevante,
testes e histórico relacionado. Identifique:

- fluxo atual e pontos de entrada;
- persistência, interfaces e contratos existentes;
- comandos reais de execução e testes;
- limitações, dados antigos e comportamento que precisa ser preservado.

**Gerar:** um resumo factual do contexto, arquivos envolvidos, riscos e lacunas.
**Revisar:** separar fatos verificados de hipóteses, documentação desatualizada e
cenários ainda não executados. Não inventar ferramentas, resultados ou suporte.

## Etapa 3 — Escrever e aprovar a especificação

Crie `spec.md` no local adotado pelo projeto. A especificação deve conter:

- contexto e objetivo;
- regras de negócio;
- casos de borda, dados antigos e compatibilidade;
- critérios de aceite observáveis em Given/When/Then;
- impacto nas funcionalidades existentes;
- fora do escopo.

Resolva explicitamente ambiguidades como criação versus edição, valores legados,
comparações, limites, mensagens e comportamento em erro. Não escreva código
antes da aprovação da spec.

**Gerar:** a especificação versionável e uma lista das decisões que precisam de
confirmação. **Revisar:** cada requisito deve ser testável, não contradizer o
comportamento existente sem declarar o impacto e cobrir os casos de borda
relevantes.

## Etapa 4 — Criar e aprovar o plano

Crie `plan.md` no local adotado pelo projeto. Divida o trabalho em tarefas
pequenas, numeradas e independentes o suficiente para revisão. Para cada tarefa,
registre:

- o que será feito;
- arquivos criados ou alterados;
- dependências;
- testes e verificações manuais;
- checkbox de acompanhamento.

Ordene as tarefas por dependência real: contratos, modelos ou estruturas
necessárias vêm antes dos fluxos que os consomem. Se o escopo crescer, atualize
primeiro a spec e o plano, obtenha aprovação e só então implemente a ampliação.

**Gerar:** plano executável e rastreável. **Revisar:** nenhuma tarefa deve
depender implicitamente de uma tarefa posterior; os arquivos e validações devem
corresponder à spec.

## Etapa 5 — Implementar incrementalmente

Antes do primeiro código, registre a spec aprovada em um commit. Depois:

1. execute uma única tarefa do plano por vez;
2. altere somente o escopo aprovado;
3. adicione ou ajuste os testes correspondentes;
4. preserve contratos e funcionalidades não relacionadas;
5. execute a validação prevista;
6. marque a tarefa concluída e crie um commit específico antes da próxima.

Não inicie a próxima tarefa enquanto a atual não tiver testes, revisão e commit.
Se a implementação revelar uma necessidade fora da spec, pare, atualize spec e
plano e peça aprovação; não contorne a decisão com uma alteração silenciosa.

## Etapa 6 — Validar e relatar

Valide em camadas:

- testes automatizados para regras, integrações e regressões;
- verificações estáticas ou de build, quando o projeto as possuir;
- verificação real da interface, serviço ou ambiente quando exigida pelos
  critérios de aceite.

Registre os comandos, resultados observados, cenários realmente executados e
limitações. Diferencie claramente “teste automatizado passou” de “comportamento
foi verificado no navegador” ou em outro ambiente. Se uma ferramenta, ambiente
ou cenário não estiver disponível, declare a limitação e não marque a
verificação como concluída. Nunca alegue sucesso com base apenas em intenção,
código existente ou um teste indireto.

### Modelo preenchível de `spec.md`

```markdown
# Especificação — [feature]

## Contexto e objetivo
[Problema atual, usuários afetados e resultado esperado.]

## Regras de negócio
- [Regra observável.]

## Casos de borda e compatibilidade
- [Entrada limite, erro, dado antigo ou comportamento preservado.]

## Critérios de aceite
### Cenário 1 — [nome]
**Given** [contexto]
**When** [ação]
**Then** [resultado observável]
**And** [resultado adicional]

## Impacto nas funcionalidades existentes
- [O que muda e o que permanece.]

## Fora do escopo
- [O que não será implementado.]
```

### Modelo preenchível de `plan.md`

```markdown
# Plano de implementação — [feature]

## 1. [tarefa]
- **Dependências:** [tarefas anteriores ou nenhuma]
- [ ] **O que será feito:** [mudança pequena e verificável]
- **Arquivos criados ou alterados:** [caminhos do projeto]
- **Como validar:** [testes, comandos e verificação manual]

## 2. [tarefa seguinte]
...
```

## Regras invariáveis

- Não escrever código antes da spec aprovada.
- Criar um commit da spec antes do código.
- Executar uma tarefa de implementação por vez.
- Criar um commit por tarefa de implementação.
- Não alterar nada fora do escopo aprovado.
- Atualizar spec e plano antes de ampliar o escopo.
- Manter evidências separadas entre fatos verificados, afirmações antigas e
  cenários não executados.

## Revisão de aplicabilidade

Antes de concluir, faça uma revisão mental com uma feature em outra stack, por
exemplo adicionar paginação a uma API Rust com banco SQL. Verifique se o fluxo
ainda orienta contexto, contratos, dados existentes, tarefas dependentes,
testes automatizados e validação real sem assumir linguagem, framework, banco ou
ferramenta específicos. Essa revisão demonstra aplicabilidade do texto; não é
execução comprovada da feature, dos testes ou da skill nesse outro projeto.
