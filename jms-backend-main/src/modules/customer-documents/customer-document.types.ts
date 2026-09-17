export interface CreateCustomerDocumentDTO {
  documentType: string;
  documentNumber?: string;
  fileUrl?: string;
}

export interface UpdateCustomerDocumentDTO {
  documentType?: string;
  documentNumber?: string;
  fileUrl?: string;
}
