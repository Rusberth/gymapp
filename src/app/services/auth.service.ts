import { Injectable, signal } from '@angular/core';

export type UserRole = 'admin' | 'recepcion';

type AuthSession = {
  username: string;
  role: UserRole;
};

type StoredCredential = {
  username: string;
  password: string;
  role: UserRole;
  displayName: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sessionKey = 'gymapp_session';
  private readonly credentialsKey = 'gymapp_credentials';

  readonly currentUser = signal<AuthSession | null>(this.readSession());

  constructor() {
    this.ensureSeedUser();
  }

  login(username: string, password: string): boolean {
    const normalizedUsername = username.trim().toLowerCase();
    const credential = this.getStoredCredentials().find(
      (item) => item.username === normalizedUsername && item.password === password
    );

    if (!credential) {
      return false;
    }

    const session: AuthSession = {
      username: credential.displayName,
      role: credential.role
    };

    localStorage.setItem(this.sessionKey, JSON.stringify(session));
    this.currentUser.set(session);
    return true;
  }

  logout(): void {
    localStorage.removeItem(this.sessionKey);
    this.currentUser.set(null);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  hasRole(roles: UserRole | UserRole[]): boolean {
    const currentRole = this.currentUser()?.role;

    if (!currentRole) {
      return false;
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(currentRole);
  }

  private ensureSeedUser(): void {
    const defaultCredentials: StoredCredential[] = [
      {
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        displayName: 'Administrador'
      },
      {
        username: 'recepcion',
        password: 'recepcion123',
        role: 'recepcion',
        displayName: 'Recepción'
      }
    ];

    const storedCredentials = this.getStoredCredentials();

    if (storedCredentials.length === 0) {
      localStorage.setItem(this.credentialsKey, JSON.stringify(defaultCredentials));
      return;
    }

    const mergedCredentials = [...storedCredentials];

    for (const credential of defaultCredentials) {
      const alreadyExists = mergedCredentials.some((item) => item.username === credential.username);

      if (!alreadyExists) {
        mergedCredentials.push(credential);
      }
    }

    localStorage.setItem(this.credentialsKey, JSON.stringify(mergedCredentials));
  }

  private getStoredCredentials(): StoredCredential[] {
    const raw = localStorage.getItem(this.credentialsKey);

    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as StoredCredential[];
    } catch {
      return [];
    }
  }

  private readSession(): AuthSession | null {
    const raw = localStorage.getItem(this.sessionKey);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  }
}
