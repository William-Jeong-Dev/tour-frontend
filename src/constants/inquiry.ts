export const INQUIRY_CATEGORIES = [
    { value: 'PRODUCT', label: '상품문의' },
    { value: 'BOOKING', label: '예약문의' },
    { value: 'ETC', label: '기타문의' },
] as const

export type InquiryCategory =
    typeof INQUIRY_CATEGORIES[number]['value']

export const INQUIRY_CATEGORY_LABEL: Record<InquiryCategory, string> = {
    PRODUCT: '상품문의',
    BOOKING: '예약문의',
    ETC: '기타문의',
}
