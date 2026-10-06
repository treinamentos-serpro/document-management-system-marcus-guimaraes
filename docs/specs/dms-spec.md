# Especificação - Document Management System

## 1. Objetivo

Permitir que usuários enviem, listem e baixem seus documentos, mantendo os arquivos no filesystem local e os metadados em memória.

## 2. Escopo

### Dentro do escopo

- Upload de um documento por requisição.
- Listagem dos documentos associados a um usuário.
- Download de um documento pelo identificador, restrito ao usuário associado.
- Armazenamento dos arquivos em `backend/storage`.
- Armazenamento dos metadados em memória durante a execução do backend.

### Fora do escopo

- Armazenamento externo ou em nuvem.
- Banco de dados ou persistência durável dos metadados.
- Autenticação, autorização robusta ou gerenciamento de contas.
- Versionamento, edição ou exclusão de documentos.
- Busca, paginação e compartilhamento entre usuários.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário pode enviar um arquivo com o campo multipart `file`. |
| RF-02 | O upload exige um identificador de usuário no cabeçalho `X-User-Id`. |
| RF-03 | O sistema registra metadados do documento após o upload bem-sucedido. |
| RF-04 | O usuário pode listar somente documentos associados ao seu identificador. |
| RF-05 | O usuário pode baixar um documento associado ao seu identificador. |
| RF-06 | O sistema retorna erro apropriado para arquivo ausente, documento inexistente, usuário ausente ou arquivo acima do limite configurado. |
| RF-07 | O nome original é usado como nome de download, nunca como caminho de armazenamento. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos são gravados localmente por `multer` com `diskStorage`, por padrão em `backend/storage`. |
| RNF-02 | Os metadados permanecem em memória; reiniciar o backend os apaga. |
| RNF-03 | Configurações operacionais são obtidas de variáveis de ambiente. |
| RNF-04 | O identificador do arquivo armazenado é gerado pelo servidor e não expõe o nome original. |
| RNF-05 | O caminho interno do arquivo não é retornado pela API. |
| RNF-06 | O backend usa Node.js, Express e JavaScript CommonJS; os testes usam `node:test`. |
| RNF-07 | `X-User-Id` é apenas contexto de usuário para este MVP, não um mecanismo de autenticação. |

## 5. Modelo de dados

| Campo | Tipo | Público | Descrição |
| --- | --- | --- | --- |
| `id` | string | Sim | Identificador único do documento. |
| `originalName` | string | Sim | Nome original informado no upload. |
| `size` | number | Sim | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Sim | Data e hora em ISO 8601. |
| `owner` | string | Sim | Identificador recebido em `X-User-Id`. |
| `mimeType` | string | Sim | Tipo de mídia recebido no upload. |
| `storageName` | string | Não | Nome opaco gerado para o arquivo no disco. |
| `storagePath` | string | Não | Caminho local usado para leitura do arquivo. |

`storageName` e `storagePath` são detalhes internos e não aparecem nas respostas JSON.

## 6. Contratos de API

Todas as rotas são servidas pelo backend sem prefixo. No desenvolvimento, o frontend chama `/api`, removido pelo proxy do Vite.

Formato de erro:

```json
{
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "Documento não encontrado."
  }
}
```

### `POST /upload`

- Cabeçalho obrigatório: `X-User-Id`.
- Entrada: `multipart/form-data` com um arquivo no campo `file`.
- Sucesso: `201 Created`, com `document` contendo `id`, `originalName`, `size`, `uploadedAt`, `owner` e `mimeType`.
- Erros: `400` para usuário ou arquivo ausente/inválido; `413` para tamanho acima do limite; `500` para falha inesperada de armazenamento.

### `GET /documents`

- Cabeçalho obrigatório: `X-User-Id`.
- Sucesso: `200 OK`, com `{ "documents": [...] }`; lista vazia quando não houver documentos.
- Retorna somente metadados do usuário informado e não inclui caminhos internos.
- Erros: `400` para usuário ausente; `500` para falha inesperada.

### `GET /documents/:id/download`

- Cabeçalho obrigatório: `X-User-Id`.
- Sucesso: `200 OK`, conteúdo binário e `Content-Disposition: attachment` com o nome original.
- Erro: `404` quando o documento não existe, não está disponível ou pertence a outro usuário; `400` para usuário ausente.

## 7. Decisões arquiteturais e riscos

- Fluxo: `routes -> controllers -> services -> repositories`.
- `routes` conectam endpoints, middleware de upload e controllers.
- `controllers` validam dados HTTP e traduzem resultados em respostas.
- `services` aplicam as regras de associação entre usuário e documento.
- `repositories` encapsulam metadados em memória e acesso aos arquivos locais.
- `multer` usa `diskStorage`; o nome salvo é gerado pelo servidor. O nome original não compõe o caminho.
- Após reinicialização, arquivos podem permanecer no disco sem metadados correspondentes.
- `X-User-Id` não autentica o usuário e pode ser falsificado. O sistema não deve ser exposto publicamente sem uma decisão posterior de identidade e autorização.
- Configurações: `PORT`, `STORAGE_DIR` (padrão `backend/storage`) e `MAX_FILE_SIZE_BYTES` (padrão 10 MiB). `STORAGE_DIR` aponta para filesystem local.

## 8. Plano de execução

1. Confirmar as decisões pendentes de identidade e limites de upload antes da implementação.
2. Implementar upload, metadados em memória e gravação local respeitando as camadas definidas.
3. Implementar listagem e download com isolamento por `owner`.
4. Integrar a interface React aos contratos por `/api` e tratar estados de erro e sucesso.
5. Validar contratos, erros, isolamento entre usuários e armazenamento local com testes e execução integrada.

## 9. Critérios de aceite

- Upload válido grava o arquivo localmente e retorna metadados sem caminho interno.
- Listagem retorna somente documentos do usuário informado.
- Download entrega o arquivo correto e não permite acesso por outro `owner`.
- Entradas inválidas, documento inexistente e limite excedido retornam os códigos previstos.
- Reiniciar o backend apaga os metadados em memória; não há dependência de armazenamento externo.
- O frontend usa o proxy `/api` e permite enviar, listar e baixar documentos.