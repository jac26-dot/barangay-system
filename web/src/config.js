export const APP_NAME    = 'BaryoHub';
// Branding: change these to rebrand this deployment.
export const PRODUCT_NAME = 'BaryoHub';
export const ORGANIZATION_NAME = 'Barangay Malate, Manila, District V, City of Manila';
export const SHORT_NAME = 'Barangay Malate';
// Name printed above the Punong Barangay signature line on documents. Leave empty to print a blank line.
export const CAPTAIN_NAME = '';
export const BARANGAY_NAME = ORGANIZATION_NAME;
export const MUNICIPALITY  = 'District V, City of Manila';

export const ROLES = {
  ADMIN:  'admin',
  STAFF:  'staff',
  VIEWER: 'viewer',
};

export const DOCUMENT_TYPES = [
  'Barangay Clearance',
  'Certificate of Residency',
  'Certificate of Indigency',
  'Business Clearance',
  'Good Moral Certificate',
];

export const DOCUMENT_STATUS = ['Pending', 'Approved', 'Released', 'Rejected'];

export const BLOTTER_STATUS = ['Open', 'Ongoing', 'Settled', 'Escalated', 'Closed'];

export const INCIDENT_TYPES = [
  'Physical Assault',
  'Verbal Abuse',
  'Property Dispute',
  'Noise Complaint',
  'Theft',
  'Trespassing',
  'Domestic Violence',
  'Others',
];

export const CIVIL_STATUS = ['Single', 'Married', 'Widowed', 'Separated'];

export const OFFICIAL_POSITIONS = [
  'Barangay Captain',
  'Barangay Kagawad',
  'SK Chairman',
  'SK Kagawad',
  'Barangay Secretary',
  'Barangay Treasurer',
];

export const STATUS_BADGE = {
  Active:    'badge-success',
  Pending:   'badge-warning',
  Approved:  'badge-primary',
  Released:  'badge-success',
  Rejected:  'badge-danger',
  Open:      'badge-danger',
  Ongoing:   'badge-warning',
  Settled:   'badge-success',
  Escalated: 'badge-danger',
  Closed:    'badge-gray',
  Deceased:  'badge-gray',
  Transferred: 'badge-gray',
  Inactive:  'badge-gray',
};
