// src/email-signature/dto/create-signature.dto.ts
export class CreateSignatureDto {
  user_id: number;
  name: string;
  signature_text: string; // HTML allowed
  is_default?: boolean;
}

// src/email-signature/dto/update-signature.dto.ts
export class UpdateSignatureDto {
  name?: string;
  signature_text?: string;
  is_default?: boolean;
}
