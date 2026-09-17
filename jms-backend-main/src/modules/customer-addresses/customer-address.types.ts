export interface CreateCustomerAddressDTO {
  addressType?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface UpdateCustomerAddressDTO {
  addressType?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isDefault?: boolean;
}
