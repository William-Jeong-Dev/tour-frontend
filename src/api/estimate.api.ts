import { sendEstimateEmail as sendEmailViaEmailJS } from "../utils/emailService";

export type EstimatePayload = {
    name: string;
    phone: string;
    email?: string | null;

    depart_date: string;      // YYYY-MM-DD
    return_date?: string | null; // optional

    people_count: number;

    region?: string | null;
    budget?: string | null;
    memo?: string | null;

    privacy_agreed: boolean;
    marketing_agreed: boolean;

    // 추가 필드 (UI에서 사용)
    travel_regions?: string; // 원하는 여행지 (복수 선택)
    call_time?: string; // 통화 가능 시간
};

const RECEIVE_EMAIL = "chungwon87@naver.com";

export async function sendEstimateEmail(payload: EstimatePayload) {
    // EmailJS를 사용하여 이메일 전송
    await sendEmailViaEmailJS({
        to_email: RECEIVE_EMAIL,
        subject: `[1:1 맞춤견적] ${payload.name}님의 견적 요청`,
        user_name: payload.name,
        user_phone: payload.phone,
        user_email: payload.email || "미입력",
        depart_date: payload.depart_date,
        return_date: payload.return_date || "미정",
        people_count: payload.people_count,
        travel_regions: payload.travel_regions || "미입력",
        region: payload.region || "미입력",
        budget: payload.budget || "미입력",
        call_time: payload.call_time || "미입력",
        memo: payload.memo || "없음",
        privacy_agreed: payload.privacy_agreed ? "동의함" : "동의안함",
        marketing_agreed: payload.marketing_agreed ? "동의함" : "동의안함",
    });
}
