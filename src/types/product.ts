export type ProductStatus = "DRAFT" | "PUBLISHED" | "HIDDEN";

export type MealType = "NONE" | "HOTEL" | "INCLUDED" | "EXCLUDED" | "FREE";

export type OfferType = "NORMAL" | "EVENT" | "SPECIAL";
export type DepartStatus = "AVAILABLE" | "CONFIRMED" | "INQUIRY";

export type ItineraryRow = {
    id: string;
    place: string;       // 장소
    transport: string;   // 교통편
    time: string;        // 시간
    content: string;     // 여행일정(멀티라인)
    mealMorning: MealType;
    mealLunch: MealType;
    mealDinner: MealType;
};

export type ItineraryDay = {
    id: string;
    dayNo: number;
    title: string;      // "1일차"
    dateText: string;   // "2026/04/20(월)" 같은 표시용
    rows: ItineraryRow[];
};

export type Departure = {
    id: string;

    dateISO: string; // YYYY-MM-DD

    // 같은 날짜여도 오퍼 타입/가격이 다를 수 있음
    offerType: OfferType; // NORMAL/EVENT/SPECIAL

    // 예약 가능 상태
    status: DepartStatus; // AVAILABLE/CONFIRMED/INQUIRY

    // 가격 (INQUIRY면 0으로)
    priceAdult: number;

    // 운영 확장용(선택)
    remain?: number; // 잔여좌석
    min?: number;    // 최소출발
    max?: number;    // 최대예약
    note?: string;   // 메모
};

export type Product = {
    id: string;

    // 기본정보
    title: string;
    subtitle: string;
    region: string;
    nights: number;
    days: number;
    status: ProductStatus;

    // 리스트/표시용
    priceText: string; // "649,000원~" 같은 텍스트(목록/상세 상단)
    description: string;

    // 미디어
    thumbnailUrl: string;
    images: string[];

    // 문서 기반 리스트
    included: string[];
    excluded: string[];
    notices: string[];

    // 일정표
    itinerary: ItineraryDay[];

    //  출발일 + 오퍼(특가/이벤트)
    departures: Departure[];

    createdAt: string;
    updatedAt: string;
};

export type ProductUpsert = Omit<Product, "id" | "createdAt" | "updatedAt">;
