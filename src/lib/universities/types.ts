export interface SearchResult {
  name: string;
  links: { name: string; oid: string }[];
}

export interface FetchResult {
  name: string;
  lectures: { name: string; cfu: number }[];
}

export interface UniversityAdapter {
  id: string;
  name: string;
  searchCourses: (anno: string, query?: string) => Promise<SearchResult[]>;
  fetchLectures: (oid: string, anno?: string) => Promise<FetchResult>;
}
