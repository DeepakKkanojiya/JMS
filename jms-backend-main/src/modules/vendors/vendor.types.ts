export interface CreateVendorDTO {
  branchId: string;
  vendorCode: string;
  companyName: string;
  contactPerson?: string;
  email?: string;
  mobile: string;
  gstNumber?: string;
  panNumber?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  vendorType?: string;
  isActive?: boolean;
}

export interface UpdateVendorDTO {
  branchId?: string;
  companyName?: string;
  contactPerson?: string;
  email?: string;
  mobile?: string;
  gstNumber?: string;
  panNumber?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  vendorType?: string;
  isActive?: boolean;
}

export interface VendorQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  branchId?: string;
  gstNumber?: string;
  gstin?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
