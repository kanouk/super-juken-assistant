
export interface TagMaster {
  id: string;
  subject: string;
  major_category: string;
  minor_category: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTagRequest {
  subject: string;
  major_category: string;
  minor_category: string;
}

export interface UpdateTagRequest {
  id: string;
  major_category: string;
  minor_category: string;
}
