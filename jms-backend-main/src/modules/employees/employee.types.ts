export interface CreateEmployeeDTO {
  branchId: string;
  userId?: string;
  employeeCode: string;
  firstName: string;
  lastName?: string;
  email?: string;
  mobile: string;
  designation?: string;
  joiningDate?: string;
  isActive?: boolean;
}

export interface UpdateEmployeeDTO {
  branchId?: string;
  userId?: string;
  employeeCode?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  designation?: string;
  joiningDate?: string;
  isActive?: boolean;
}

export interface EmployeeQueryDTO {
  page?: string;
  limit?: string;
  search?: string;
  companyId?: string;
  branchId?: string;
  designation?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
