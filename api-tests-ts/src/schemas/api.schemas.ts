/**
 * JSON Schemas for response validation
 * Используются с AJV для строгой валидации структуры API-ответов
 */

export const postSchema = {
  type: 'object',
  required: ['userId', 'id', 'title', 'body'],
  properties: {
    userId: { type: 'integer', minimum: 1 },
    id: { type: 'integer', minimum: 1 },
    title: { type: 'string', minLength: 1, maxLength: 1000 },
    body: { type: 'string', minLength: 1, maxLength: 5000 },
  },
  additionalProperties: false,
} as const;

export const postArraySchema = {
  type: 'array',
  items: postSchema,
} as const;

export const commentSchema = {
  type: 'object',
  required: ['postId', 'id', 'name', 'email', 'body'],
  properties: {
    postId: { type: 'integer', minimum: 1 },
    id: { type: 'integer', minimum: 1 },
    name: { type: 'string', minLength: 1 },
    email: { type: 'string', format: 'email' },
    body: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
} as const;

export const userSchema = {
  type: 'object',
  required: ['id', 'name', 'username', 'email'],
  properties: {
    id: { type: 'integer', minimum: 1 },
    name: { type: 'string', minLength: 1 },
    username: { type: 'string', minLength: 1 },
    email: { type: 'string', format: 'email' },
  },
  additionalProperties: true,
} as const;

export const errorSchema = {
  type: 'object',
  required: ['statusCode', 'error', 'message'],
  properties: {
    statusCode: { type: 'integer' },
    error: { type: 'string' },
    message: { type: 'string' },
  },
} as const;
