// Web3Forms 설정 (https://web3forms.com)
const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '';
const RECEIVE_EMAIL = 'chungwon87@naver.com';

export type EstimateEmailParams = {
    to_email: string;
    subject: string;
    user_name: string;
    user_phone: string;
    user_email: string;
    depart_date: string;
    return_date: string;
    people_count: number;
    travel_regions: string;
    region: string;
    budget: string;
    call_time: string;
    memo: string;
    privacy_agreed: string;
    marketing_agreed: string;
};

export type BookingEmailParams = {
    to_email: string;
    subject: string;
    product_title: string;
    user_name: string;
    user_phone: string;
    user_email: string;
    travel_date: string;
    people_count: number;
    memo: string;
};

// 1:1 맞춤견적 이메일 전송
export async function sendEstimateEmail(params: EstimateEmailParams): Promise<void> {
    if (!WEB3FORMS_ACCESS_KEY) {
        throw new Error('Web3Forms 설정이 완료되지 않았습니다. .env.local 파일에 VITE_WEB3FORMS_ACCESS_KEY를 추가하세요.');
    }

    const emailContent = `
[청원여행사 1:1 맞춤견적 요청]

■ 고객 정보
- 이름: ${params.user_name}
- 연락처: ${params.user_phone}
- 이메일: ${params.user_email}

■ 여행 정보
- 출발일: ${params.depart_date}
- 리턴일: ${params.return_date}
- 인원: ${params.people_count}명
- 원하는 여행지: ${params.travel_regions}
- 희망 지역/테마: ${params.region}
- 예산: ${params.budget}

■ 연락 정보
- 통화 가능 시간: ${params.call_time}

■ 요청사항
${params.memo}

■ 동의 사항
- 개인정보 수집 동의: ${params.privacy_agreed}
- 마케팅 수신 동의: ${params.marketing_agreed}
    `.trim();

    const formData = new FormData();
    formData.append('access_key', WEB3FORMS_ACCESS_KEY);
    formData.append('subject', params.subject);
    formData.append('email', RECEIVE_EMAIL);
    formData.append('message', emailContent);
    formData.append('from_name', `청원여행사 웹사이트 (${params.user_name})`);
    formData.append('replyto', params.user_email || RECEIVE_EMAIL);

    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || '메일 전송에 실패했습니다.');
        }
    } catch (error: any) {
        console.error('Web3Forms Error:', error);
        throw new Error(error?.message || '메일 전송에 실패했습니다.');
    }
}

// 예약 이메일 전송
export async function sendBookingEmail(params: BookingEmailParams): Promise<void> {
    if (!WEB3FORMS_ACCESS_KEY) {
        throw new Error('Web3Forms 설정이 완료되지 않았습니다. .env.local 파일에 VITE_WEB3FORMS_ACCESS_KEY를 추가하세요.');
    }

    const emailContent = `
[청원여행사 예약 요청]

■ 상품 정보
- 상품명: ${params.product_title}

■ 고객 정보
- 이름: ${params.user_name}
- 연락처: ${params.user_phone}
- 이메일: ${params.user_email}

■ 여행 정보
- 출발일: ${params.travel_date}
- 인원: ${params.people_count}명

■ 요청사항
${params.memo}
    `.trim();

    const formData = new FormData();
    formData.append('access_key', WEB3FORMS_ACCESS_KEY);
    formData.append('subject', params.subject);
    formData.append('email', RECEIVE_EMAIL);
    formData.append('message', emailContent);
    formData.append('from_name', `청원여행사 웹사이트 (${params.user_name})`);
    formData.append('replyto', params.user_email || RECEIVE_EMAIL);

    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || '메일 전송에 실패했습니다.');
        }
    } catch (error: any) {
        console.error('Web3Forms Error:', error);
        throw new Error(error?.message || '메일 전송에 실패했습니다.');
    }
}
