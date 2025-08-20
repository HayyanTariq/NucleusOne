
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'owner' | 'admin' | 'employee';
  department: string;
  position: string;
  phone: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  employmentDetails: {
    employeeId: string;
    startDate: string;
    manager: string;
    salary: number;
    employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
  };
  status: 'active' | 'inactive';
  avatar?: string;
  lastLogin?: string;
  isFirstLogin?: boolean;
  createdAt: string;
  updatedAt: string;
  // Nucleus One specific fields
  nucleusUserId?: string;
  appRole?: 'admin' | 'employee';
  hasCertifyOneAccess?: boolean;
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: 'owner' | 'admin' | 'employee';
  department: string;
  position: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  employeeId: string;
  startDate: string;
  manager: string;
  salary: number;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
  status: 'active' | 'inactive';
}
