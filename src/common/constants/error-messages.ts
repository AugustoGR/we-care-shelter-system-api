/**
 * Mensagens de erro padronizadas para toda a aplicação
 */
export const ERROR_MESSAGES = {
  // Autenticação
  AUTH: {
    USER_NOT_AUTHENTICATED: 'Usuário não autenticado',
    INVALID_CREDENTIALS: 'Credenciais inválidas',
    USER_NOT_FOUND: 'Usuário não encontrado',
    TOKEN_INVALID: 'Token inválido ou expirado',
  },

  // Permissões
  PERMISSION: {
    INSUFFICIENT_PERMISSION: 'Você não tem permissão para realizar esta ação',
    INSUFFICIENT_ROLE: 'Você não tem o nível de acesso necessário para esta ação',
    MODULE_READ_DENIED: 'Você não tem permissão de leitura neste módulo',
    MODULE_WRITE_DENIED: 'Você não tem permissão de escrita neste módulo',
    MODULE_MANAGE_DENIED: 'Você não tem permissão de gerenciamento neste módulo',
    SHELTER_ADMIN_ONLY: 'Apenas proprietários e administradores do abrigo podem realizar esta ação',
  },

  // Validação
  VALIDATION: {
    SHELTER_ID_REQUIRED: 'ID do abrigo é obrigatório',
    MODULE_ID_REQUIRED: 'ID do módulo é obrigatório',
    MODULE_KEY_REQUIRED: 'Chave do módulo é obrigatória para permissão de escrita',
    INVALID_DATA: 'Dados inválidos fornecidos',
  },

  // Recursos não encontrados
  NOT_FOUND: {
    SHELTER: 'Abrigo não encontrado',
    USER: 'Usuário não encontrado',
    VOLUNTEER: 'Voluntário não encontrado',
    ANIMAL: 'Animal não encontrado',
    RESOURCE: 'Recurso não encontrado',
    SHELTERED_PERSON: 'Abrigado não encontrado',
    MODULE: 'Módulo não encontrado',
  },

  // Conflitos
  CONFLICT: {
    EMAIL_EXISTS: 'Email já cadastrado',
    CPF_EXISTS: 'CPF já cadastrado',
    ALREADY_EXISTS: 'Registro já existe',
  },

  // Erros gerais
  GENERAL: {
    INTERNAL_ERROR: 'Erro interno do servidor',
    BAD_REQUEST: 'Requisição inválida',
    FORBIDDEN: 'Acesso negado',
    UNAUTHORIZED: 'Não autorizado',
  },
} as const;

/**
 * Mensagens de sucesso padronizadas
 */
export const SUCCESS_MESSAGES = {
  CREATED: 'Registro criado com sucesso',
  UPDATED: 'Registro atualizado com sucesso',
  DELETED: 'Registro excluído com sucesso',
  OPERATION_SUCCESS: 'Operação realizada com sucesso',
} as const;
