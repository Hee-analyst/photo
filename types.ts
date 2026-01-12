
export interface ProcessingResult {
  originalUrl: string;
  resultUrl?: string;
  isProcessing: boolean;
  error?: string;
}

export enum PhotoStyle {
  CORPORATE = 'corporate',
  MODERN = 'modern',
  ID_PHOTO = 'id_photo',
  CREATIVE = 'creative'
}
