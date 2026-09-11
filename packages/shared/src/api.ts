export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  q?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface Data<T> {
  data: T;
}
