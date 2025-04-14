interface RegistrationData {
  universityId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginData {
  universityId: string;
  password: string;
}

export function validateRegistration(data: any): RegistrationData {
  if (!data.universityId || !/^\d{8}$/.test(data.universityId)) {
    throw new Error('University ID must be exactly 8 digits');
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    throw new Error('Invalid email format');
  }

  if (!data.password || data.password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  if (!data.firstName || data.firstName.trim().length === 0) {
    throw new Error('First name is required');
  }

  if (!data.lastName || data.lastName.trim().length === 0) {
    throw new Error('Last name is required');
  }

  return {
    universityId: data.universityId.trim(),
    email: data.email.trim().toLowerCase(),
    password: data.password,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim()
  };
}

export function validateLogin(data: any): LoginData {
  if (!data.universityId || !/^\d{8}$/.test(data.universityId)) {
    throw new Error('University ID must be exactly 8 digits');
  }

  if (!data.password) {
    throw new Error('Password is required');
  }

  return {
    universityId: data.universityId.trim(),
    password: data.password
  };
} 