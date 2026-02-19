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
};

// FormSubmit: 메일을 받을 이메일 주소
const RECEIVE_EMAIL = "chungwon87@naver.com";

export async function sendEstimateEmail(payload: EstimatePayload) {
    const formData = new FormData();

    formData.append("_subject", `[1:1 맞춤견적] ${payload.name}님의 견적 요청`);
    formData.append("이름", payload.name);
    formData.append("연락처", payload.phone);
    formData.append("이메일", payload.email || "미입력");
    formData.append("출발일", payload.depart_date);
    formData.append("리턴일", payload.return_date || "미정");
    formData.append("인원", String(payload.people_count) + "명");
    formData.append("여행지/테마", payload.region || "미입력");
    formData.append("예산", payload.budget || "미입력");
    formData.append("요청사항", payload.memo || "없음");
    formData.append("개인정보 수집 동의", payload.privacy_agreed ? "동의함" : "동의안함");
    formData.append("마케팅 수신 동의", payload.marketing_agreed ? "동의함" : "동의안함");

    // 리다이렉트 방지 (AJAX 모드)
    formData.append("_captcha", "false");
    formData.append("_template", "table");

    const response = await fetch(`https://formsubmit.co/ajax/${RECEIVE_EMAIL}`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("메일 전송에 실패했습니다.");
    }

    return response.json();
}
