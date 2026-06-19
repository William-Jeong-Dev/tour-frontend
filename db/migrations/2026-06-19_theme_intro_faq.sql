-- ============================================================
-- product_themes: 테마 페이지 안내 문구 + FAQ(SEO 구조화데이터) 컬럼 추가
-- 실행 위치: Supabase 대시보드 > SQL Editor
-- ============================================================

-- 1) 컬럼 추가
alter table public.product_themes
    add column if not exists intro_title text,
    add column if not exists intro_body  text,
    add column if not exists faq jsonb not null default '[]'::jsonb;

-- 2) 기존 하드코딩 문구 이관 (일본 골프)
update public.product_themes
set intro_title = '일본 골프여행 안내',
    intro_body  = '일본 골프여행은 규슈, 사가, 구마모토, 후쿠오카 등 다양한 지역에서 고품질 골프장을 경험할 수 있는 인기 여행 상품입니다. 청원여행사는 일본 골프패키지 및 맞춤 골프투어를 제공합니다.',
    faq = '[
        {"question": "일본 골프 여행은 어떻게 예약하나요?", "answer": "청원여행사를 통해 일본 골프 여행 예약부터 일정 구성까지 맞춤형으로 진행할 수 있습니다."},
        {"question": "일본 골프 여행 인기 지역은 어디인가요?", "answer": "규슈, 간사이, 도쿄, 홋카이도 지역이 골프 여행지로 인기가 많습니다."}
    ]'::jsonb
where slug = 'japan-golf';

-- 3) 기존 하드코딩 문구 이관 (중국 골프)
update public.product_themes
set intro_title = '중국 골프여행 안내',
    intro_body  = '중국 골프여행은 청도를 중심으로 가성비 높은 골프패키지를 제공합니다. 청원여행사는 2박3일, 3박4일 일정의 맞춤 골프투어를 지원합니다.',
    faq = '[
        {"question": "중국 골프 여행은 어떤 장점이 있나요?", "answer": "중국 골프 여행은 합리적인 비용과 다양한 골프장 선택이 가능한 해외 골프 여행 옵션입니다."},
        {"question": "중국 골프 여행 일정은 어떻게 구성되나요?", "answer": "청원여행사는 고객 일정에 맞춘 맞춤형 골프 여행 패키지를 제공합니다."}
    ]'::jsonb
where slug = 'china-golf';
