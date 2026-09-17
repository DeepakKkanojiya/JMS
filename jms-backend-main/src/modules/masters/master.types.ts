export interface DropdownItem {
  id: string;
  name: string;
  code?: string;
  type?: string;
}

export interface MasterDropdownsResponse {
  companies: DropdownItem[];
  branches: DropdownItem[];
  categories: DropdownItem[];
  subCategories: DropdownItem[];
  roles: DropdownItem[];
  customerTypes: string[];
  vendorTypes: string[];
  metalTypes: string[];
}
