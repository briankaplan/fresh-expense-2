// Common DTOs
export interface PaginationDto {
  page: number;
  limit: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface DateRangeDto {
  startDate: Date;
  endDate: Date;
}

export interface SearchDto {
  query: string;
  fields?: string[];
}

export interface FilterDto {
  field: string;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "regex";
  value: any;
}

export interface QueryDto extends Partial<PaginationDto> {
  search?: SearchDto;
  filters?: FilterDto[];
  dateRange?: DateRangeDto;
}

export interface CreateDto {
  userId: string;
  companyId: string;
}

export interface UpdateDto {
  updatedAt?: Date;
}
