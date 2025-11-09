import { z } from 'zod'
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  adminLoginSchema,
  tagSchema,
  lineSchema,
  updateApplicationSchema,
} from './validations'

// フォームデータの型
export type Step1Data = z.infer<typeof step1Schema>
export type Step2Data = z.infer<typeof step2Schema>
export type Step3Data = z.infer<typeof step3Schema>
export type Step4Data = z.infer<typeof step4Schema>
export type AdminLoginData = z.infer<typeof adminLoginSchema>
export type TagData = z.infer<typeof tagSchema>
export type LineData = z.infer<typeof lineSchema>
export type UpdateApplicationData = z.infer<typeof updateApplicationSchema>

// 申し込みステップ
export type ApplicationStep = 1 | 2 | 3 | 4 | 5

// 完全な申し込みデータ
export interface CompleteApplicationData extends Step1Data, Step2Data, Step3Data {
  totalAmount: number
}

// ステータスの型
export type VerificationStatus = 'unverified' | 'verified' | 'issue'
export type PaymentStatus = 'not_issued' | 'issued' | 'paid'
export type ApplicationStatus = 'draft' | 'submitted' | 'processing' | 'completed'
export type LineStatus = 'not_opened' | 'opened' | 'shipped' | 'waiting_return' | 'returned' | 'canceled'
export type TagType = 'sim_location' | 'spare'

// プラン料金
export const PLAN_PRICES = {
  '3month-50plus': 4200,
  '3month-under50': 4600,
} as const

export type PlanType = keyof typeof PLAN_PRICES
