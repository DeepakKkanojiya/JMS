export interface CreateBranchDTO {
  companyId: string;
  branchCode: string;
  name: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isMainBranch?: boolean;
  isActive?: boolean;
}

export interface UpdateBranchDTO {
  companyId?: string;
  branchCode?: string;
  name?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isMainBranch?: boolean;
  isActive?: boolean;
}

export interface BranchQueryDTO {
  page?: string;
  limit?: string;
  search?: string;
  companyId?: string;
  city?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
