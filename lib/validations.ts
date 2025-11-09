import { z } from 'zod'

// ステップ1: 個人情報入力のバリデーション
export const step1IndividualSchema = z.object({
  applicantType: z.literal('individual'),
  lastName: z.string().min(1, '姓を入力してください'),
  firstName: z.string().min(1, '名を入力してください'),
  lastNameKana: z.string().min(1, '姓（カナ）を入力してください'),
  firstNameKana: z.string().min(1, '名（カナ）を入力してください'),
  phone: z.string().regex(/^0\d{9,10}$/, '有効な電話番号を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  postalCode: z.string().regex(/^\d{7}$/, '郵便番号は7桁の数字で入力してください'),
  address: z.string().min(1, '住所を入力してください'),
  dateOfBirth: z.string().min(1, '生年月日を入力してください'),
})

export const step1CorporateSchema = z.object({
  applicantType: z.literal('corporate'),
  companyName: z.string().min(1, '会社名を入力してください'),
  companyNameKana: z.string().min(1, '会社名（カナ）を入力してください'),
  corporateNumber: z.string().min(1, '法人番号を入力してください'),
  establishedDate: z.string().min(1, '設立年月日を入力してください'),
  phone: z.string().regex(/^0\d{9,10}$/, '有効な電話番号を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  representativeLastName: z.string().min(1, '代表者姓を入力してください'),
  representativeFirstName: z.string().min(1, '代表者名を入力してください'),
  representativeLastNameKana: z.string().min(1, '代表者姓（カナ）を入力してください'),
  representativeFirstNameKana: z.string().min(1, '代表者名（カナ）を入力してください'),
  representativeBirthDate: z.string().min(1, '代表者生年月日を入力してください'),
  contactLastName: z.string().min(1, '担当者姓を入力してください'),
  contactFirstName: z.string().min(1, '担当者名を入力してください'),
  contactLastNameKana: z.string().min(1, '担当者姓（カナ）を入力してください'),
  contactFirstNameKana: z.string().min(1, '担当者名（カナ）を入力してください'),
  postalCode: z.string().regex(/^\d{7}$/, '郵便番号は7桁の数字で入力してください'),
  address: z.string().min(1, '住所を入力してください'),
})

export const step1Schema = z.discriminatedUnion('applicantType', [
  step1IndividualSchema,
  step1CorporateSchema,
])

// ステップ2: プラン選択のバリデーション
export const step2Schema = z.object({
  planType: z.enum(['3month-50plus', '3month-under50'], {
    required_error: 'プランを選択してください',
  }),
  lineCount: z.number()
    .min(1, '回線数は1以上で入力してください')
    .refine((val, ctx) => {
      const planType = (ctx as any)?.planType
      if (planType === '3month-50plus' && val < 50) {
        return false
      }
      if (planType === '3month-under50' && val >= 50) {
        return false
      }
      return true
    }, '選択したプランに合った回線数を入力してください'),
}).superRefine((data, ctx) => {
  if (data.planType === '3month-50plus' && data.lineCount < 50) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '50回線以上のプランを選択している場合、回線数は50以上である必要があります',
      path: ['lineCount'],
    })
  }
  if (data.planType === '3month-under50' && data.lineCount >= 50) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '50回線未満のプランを選択している場合、回線数は50未満である必要があります',
      path: ['lineCount'],
    })
  }
})

// ステップ3: 書類アップロードのバリデーション
export const step3Schema = z.object({
  idCardFrontUrl: z.string().min(1, '身分証明書（表）をアップロードしてください'),
  idCardBackUrl: z.string().min(1, '身分証明書（裏）をアップロードしてください'),
  registrationUrl: z.string().optional(),
}).refine((data) => {
  // 法人の場合は登記簿謄本も必須（applicantTypeはコンテキストから判断）
  return true
}, {
  message: '必要な書類をすべてアップロードしてください',
})

// ステップ4: 確認画面のバリデーション
export const step4Schema = z.object({
  agreePrivacy: z.boolean().refine((val) => val === true, {
    message: 'プライバシーポリシーに同意してください',
  }),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: '利用規約に同意してください',
  }),
  agreeTelecom: z.boolean().refine((val) => val === true, {
    message: '電気通信事業法約款に同意してください',
  }),
  agreeWithdrawal: z.boolean().refine((val) => val === true, {
    message: '初期契約解除制度を確認してください',
  }),
  agreeNoAntisocial: z.boolean().refine((val) => val === true, {
    message: '反社会的勢力でないことを確認してください',
  }),
})

// 管理者ログインのバリデーション
export const adminLoginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
})

// タグ作成・更新のバリデーション
export const tagSchema = z.object({
  name: z.string().min(1, 'タグ名を入力してください'),
  type: z.enum(['sim_location', 'spare']),
  color: z.string().optional(),
  order: z.number().default(0),
})

// 回線情報のバリデーション
export const lineSchema = z.object({
  phoneNumber: z.string().optional(),
  simLocationId: z.string().optional(),
  spareTagId: z.string().optional(),
  returnDate: z.string().optional(),
  shipmentDate: z.string().optional(),
  lineStatus: z.enum([
    'not_opened',
    'opened',
    'shipped',
    'waiting_return',
    'returned',
    'canceled'
  ]).default('not_opened'),
})

// 申し込み情報更新のバリデーション（管理者用）
export const updateApplicationSchema = z.object({
  verificationStatus: z.enum(['unverified', 'verified', 'issue']).optional(),
  paymentStatus: z.enum(['not_issued', 'issued', 'paid']).optional(),
  comment1: z.string().optional(),
  comment2: z.string().optional(),
})
