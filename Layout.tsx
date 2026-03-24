export interface EmailStats {
  sent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent';
  createdAt: Date;
  sentAt?: Date;
  stats?: EmailStats;
  recipientCount: number;
  templateId: string;
  recipientListId?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  content: EmailBlock[];
  html?: string;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailBlock {
  id: string;
  type: 'header' | 'text' | 'image' | 'button' | 'divider' | 'footer' | 'columns' | 'spacer';
  content?: string;
  styles?: BlockStyles;
  settings?: BlockSettings;
  columns?: EmailBlock[][];
}

export interface BlockStyles {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: string;
  fontFamily?: string;
  padding?: string;
  textAlign?: 'left' | 'center' | 'right';
  borderRadius?: string;
  width?: string;
}

export interface BlockSettings {
  src?: string;
  alt?: string;
  href?: string;
  buttonText?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  height?: number;
}

export interface DNSRecord {
  type: 'TXT' | 'CNAME' | 'MX';
  host: string;
  value: string;
  status: 'pending' | 'verified' | 'error';
}

export interface DomainConfig {
  domain: string;
  records: DNSRecord[];
  isVerified: boolean;
}

export interface Contact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  subscribed: boolean;
  createdAt: Date;
}

export interface ContactList {
  id: string;
  name: string;
  contacts: Contact[];
  count: number;
}

export type ViewType = 'dashboard' | 'campaigns' | 'templates' | 'builder' | 'contacts' | 'dns' | 'settings';
