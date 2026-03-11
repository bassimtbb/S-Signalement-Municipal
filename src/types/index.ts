export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  location: Coordinates;
  imageUrl?: string;
  date: Date | string;
  status: 'pending' | 'in_progress' | 'resolved';
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
