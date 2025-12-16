/**
 * Centralized validation utilities for BrandLaunch Studio
 * 
 * Use these schemas and helpers to validate user input
 * and prevent XSS/injection attacks.
 */

import { z } from 'zod';

// ============================================================
// Sanitization Helpers
// ============================================================

/**
 * Sanitize string input by removing potential XSS vectors
 */
export const sanitizeString = (input: string): string => {
    return input
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
};

/**
 * Sanitize object values recursively
 */
export const sanitizeObject = <T extends Record<string, unknown>>(obj: T): T => {
    const result = { ...obj };
    for (const key in result) {
        const value = result[key];
        if (typeof value === 'string') {
            (result as Record<string, unknown>)[key] = sanitizeString(value);
        } else if (typeof value === 'object' && value !== null) {
            (result as Record<string, unknown>)[key] = sanitizeObject(value as Record<string, unknown>);
        }
    }
    return result;
};

// ============================================================
// Common Validation Schemas
// ============================================================

/**
 * Bangladesh phone number validation
 * Accepts: 01XXXXXXXXX format
 */
export const bdPhoneSchema = z
    .string()
    .regex(/^01[3-9]\d{8}$/, 'Please enter a valid BD phone number (01XXXXXXXXX)');

/**
 * Email validation
 */
export const emailSchema = z
    .string()
    .email('Please enter a valid email address')
    .max(255, 'Email is too long');

/**
 * URL-friendly slug validation
 */
export const slugSchema = z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only')
    .max(100, 'Slug is too long');

/**
 * Safe text input (no HTML)
 */
export const safeTextSchema = z
    .string()
    .transform(sanitizeString);

/**
 * Price validation (positive number with 2 decimal places max)
 */
export const priceSchema = z
    .number()
    .positive('Price must be greater than 0')
    .multipleOf(0.01, 'Price can only have 2 decimal places');

/**
 * Stock quantity validation
 */
export const stockSchema = z
    .number()
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative');

// ============================================================
// Form Validation Schemas
// ============================================================

/**
 * Checkout form validation
 */
export const checkoutFormSchema = z.object({
    phone: bdPhoneSchema,
    alt_phone: bdPhoneSchema.optional().or(z.literal('')),
    division: z.string().min(1, 'Please select a division'),
    district: z.string().min(1, 'Please select a district'),
    area: z.string().min(3, 'Please enter your area').max(200, 'Area is too long'),
    shipping_address: z
        .string()
        .min(10, 'Please enter a complete address')
        .max(500, 'Address is too long'),
    notes: z.string().max(1000, 'Notes are too long').optional(),
});

/**
 * Product form validation
 */
export const productFormSchema = z.object({
    name: z.string().min(2, 'Name is too short').max(200, 'Name is too long'),
    price: priceSchema,
    stock: stockSchema,
    category: z.string().min(1, 'Please select a category'),
    description: z.string().max(5000, 'Description is too long').optional(),
});

/**
 * Discount code validation
 */
export const discountCodeSchema = z.object({
    code: z
        .string()
        .min(3, 'Code must be at least 3 characters')
        .max(20, 'Code is too long')
        .regex(/^[A-Z0-9]+$/, 'Use uppercase letters and numbers only'),
    type: z.enum(['percentage', 'fixed']),
    value: z.number().positive('Value must be greater than 0'),
    min_order_amount: z.number().min(0).optional(),
    usage_limit: z.number().int().positive().optional(),
});

// ============================================================
// Type Exports
// ============================================================

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
export type ProductFormData = z.infer<typeof productFormSchema>;
export type DiscountCodeData = z.infer<typeof discountCodeSchema>;
