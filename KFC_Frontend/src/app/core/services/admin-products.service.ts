import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';
import { Category, PackType, ProductKind } from '../models/catalogue.model';

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T | null;
}

/** A product as the setup screen sees it, including items that are switched off. */
export interface AdminProduct {
  id: number;
  categoryId: number;
  categorySlug: string;
  kind: ProductKind;
  slug: string;
  nameEn: string;
  nameSd: string;
  localName: string | null;
  descriptionEn: string | null;
  descriptionSd: string | null;
  imageUrl: string | null;
  seasonMonths: string | null;
  basePrice: number | null;
  packType: PackType;
  isActive: boolean;
  sortOrder: number;
  updatedAt: string;
}

/** What the add/edit form sends. */
export interface ProductSaveRequest {
  kind: ProductKind;
  categorySlug: string;
  nameEn: string;
  nameSd: string;
  localName?: string | null;
  descriptionEn?: string | null;
  descriptionSd?: string | null;
  imageUrl?: string | null;
  seasonMonths?: string | null;
  basePrice?: number | null;
  packType: PackType;
  isActive: boolean;
  sortOrder: number;
}

/**
 * The setup screen's data layer.
 *
 * Every call here needs the admin token, which the interceptor adds on the way out. Note what is
 * *not* here: nothing deletes a row. "Remove" on the screen hides the item instead, so a mis-tap
 * cannot destroy a product's Sindhi name, description and photo.
 */
@Injectable({ providedIn: 'root' })
export class AdminProductsService {
  private readonly http = inject(HttpClient);

  private readonly base = `${APP_CONFIG.apiBaseUrl}/api/admin/products`;

  /** Everything, hidden items included. */
  list() {
    return this.http.get<ApiResponse<AdminProduct[]>>(this.base);
  }

  /** The categories the form's dropdown offers. Public, so no token is needed. */
  categories() {
    return this.http.get<ApiResponse<Category[]>>(`${APP_CONFIG.apiBaseUrl}/api/categories`);
  }

  create(request: ProductSaveRequest) {
    return this.http.post<ApiResponse<AdminProduct>>(this.base, request);
  }

  update(id: number, request: ProductSaveRequest) {
    return this.http.put<ApiResponse<AdminProduct>>(`${this.base}/${id}`, request);
  }

  /** The daily job, kept separate so changing a price is one tap and cannot disturb anything else. */
  updatePrice(id: number, basePrice: number | null) {
    return this.http.put<ApiResponse<AdminProduct>>(`${this.base}/${id}/price`, { basePrice });
  }

  /** Shows or hides an item in the shop. */
  setActive(id: number, isActive: boolean) {
    return this.http.put<ApiResponse<AdminProduct>>(
      `${this.base}/${id}/active?isActive=${isActive}`,
      {},
    );
  }
}
