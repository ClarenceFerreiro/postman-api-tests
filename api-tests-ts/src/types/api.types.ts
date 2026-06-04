/**
 * API Response Models
 * Строгая типизация для всех ответов API
 */

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: Address;
  phone: string;
  website: string;
  company: Company;
}

export interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: Geo;
}

export interface Geo {
  lat: string;
  lng: string;
}

export interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

export interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
}

export interface ApiResponse<T> {
  status: number;
  body: T;
  headers: Record<string, string>;
  duration: number;
}

export interface TestCase<TInput, TExpected> {
  description: string;
  input: TInput;
  expected: TExpected;
  tags: string[];
}
