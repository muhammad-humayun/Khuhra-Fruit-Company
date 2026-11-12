import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T | null;
}

/** An admin account as the Users screen sees it. Never carries a password or a hash. */
export interface AdminUser {
  id: number;
  email: string;
  displayName: string;
  createdAt: string;
  lastLoginAt: string | null;
  isActive: boolean;
}

export interface AdminUserCreateRequest {
  email: string;
  displayName: string;
  password: string;
}

/**
 * Who can get into the shop setup screens.
 *
 * Every call needs the admin token, which the interceptor adds. Note that nothing here deletes an
 * account: removing access switches it off, so the person can be let back in later and the record
 * of when they were created and last signed in survives.
 */
@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private readonly http = inject(HttpClient);

  private readonly base = `${APP_CONFIG.apiBaseUrl}/api/admin/users`;

  list() {
    return this.http.get<ApiResponse<AdminUser[]>>(this.base);
  }

  /** Which of the listed accounts belongs to the person signed in right now. */
  me() {
    return this.http.get<ApiResponse<AdminUser>>(`${this.base}/me`);
  }

  /**
   * Adds another admin.
   *
   * The password is set by whoever creates the account and has to be passed on in person - the
   * server stores only a one-way hash, so it cannot be read back out afterwards, by anyone.
   */
  create(request: AdminUserCreateRequest) {
    return this.http.post<ApiResponse<AdminUser[]>>(this.base, request);
  }

  /** Grants or withdraws access. The list comes back updated. */
  setActive(id: number, isActive: boolean) {
    return this.http.put<ApiResponse<AdminUser[]>>(
      `${this.base}/${id}/active?isActive=${isActive}`,
      {},
    );
  }

  changeOwnPassword(currentPassword: string, newPassword: string) {
    return this.http.put<ApiResponse<string>>(`${this.base}/me/password`, {
      currentPassword,
      newPassword,
    });
  }
}
