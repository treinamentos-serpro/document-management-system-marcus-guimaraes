---
description: "Valida testes, build e integração do DMS via /api antes de commits ou PRs, sem alterar código ou testes."
name: validar-dms
agent: integration-tester
---

# Validar DMS

Execute o procedimento do agente
[integration-tester](../agents/integration-tester.agent.md), seguindo as
[instruções do projeto](../copilot-instructions.md) e a
[especificação](../../docs/specs/dms-spec.md).

Valide testes do backend, build do frontend e upload, listagem e download pelo
proxy `/api`, incluindo isolamento entre usuários e entradas inválidas.
Use armazenamento temporário e instâncias isoladas para chamadas que gravam dados.
Não modifique código, testes ou arquivos reais, nem aplique correções automaticamente.

Entregue o relatório com resultados, evidências, falhas, verificações pendentes e
confirmação de limpeza dos recursos temporários.