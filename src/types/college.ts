export interface CollegeCourse {
  id?: string;
  name: string;
  degreeLevel: 'Bachelor' | 'Master' | 'Doctorate' | 'Diploma' | 'Certificate';
  duration: string;
  eligibility?: string;
  estimatedFees?: string;
  mode?: 'Full-time' | 'Part-time' | 'Distance / Online' | 'Hybrid';
  specializations?: string[];
}

export interface College {
  id: string;
  name: string;
  shortName?: string;
  country: string;
  state: string;
  city: string;
  type: 'Government' | 'Private' | 'Deemed University' | 'Autonomous' | 'Institute of National Importance' | 'Other';
  website: string;
  logo?: string;
  bannerImage?: string;
  description: string;
  coursesOffered: CollegeCourse[];
  feesRange?: string;
  admissionProcess?: string;
  accreditation?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  ranking?: string;
  facilities?: string[];
  featured?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CollegeFilters {
  searchQuery: string;
  country: string;
  state: string;
  city: string;
  degreeLevel: string;
  institutionType: string;
  featuredOnly: boolean;
}
