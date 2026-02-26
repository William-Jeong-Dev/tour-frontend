import { useEffect, useState } from "react";
import { useFooterSettings, useUpdateFooterSettings, useUploadFooterLogo } from "../../hooks/useFooterSettings";
import type { FooterSettings } from "../../hooks/useFooterSettings";

export default function AdminFooter() {
    const footerQuery = useFooterSettings();
    const updateMut = useUpdateFooterSettings();
    const uploadLogoMut = useUploadFooterLogo();

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>("");

    const [formData, setFormData] = useState<FooterSettings>({
        customerService: {
            phone1: "",
            phone2: "",
        },
        companyInfo: {
            name: "",
            representative: "",
            address: "",
            phone: "",
            email: "",
            fax: "",
            businessNumber: "",
            onlineBusinessNumber: "",
            tourLicense: "",
        },
        logo: "",
        copyright: "",
        poweredBy: "",
    });

    // Load initial data
    useEffect(() => {
        if (footerQuery.data && !formData.companyInfo.name) {
            setFormData(footerQuery.data);
            setLogoPreview(footerQuery.data.logo);
        }
    }, [footerQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            let updatedData = { ...formData };

            // Upload logo if a new file was selected
            if (logoFile) {
                const logoPath = await uploadLogoMut.mutateAsync(logoFile);
                updatedData.logo = logoPath;
            }

            // Save all settings
            await updateMut.mutateAsync(updatedData);
            setLogoFile(null);
        } catch (error) {
            console.error("Failed to save footer settings:", error);
        }
    };

    const isLoading = updateMut.isPending || uploadLogoMut.isPending;

    return (
        <div className="space-y-4">
            <div>
                <div className="text-lg font-extrabold">Footer 관리</div>
                <div className="text-sm text-neutral-400">Footer 영역의 고객센터 정보와 회사 정보를 관리합니다.</div>
            </div>

            {/* Customer Service Section */}
            <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 p-4">
                <div className="text-sm font-extrabold text-neutral-200 mb-3">고객센터</div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">대표 전화번호</label>
                        <input
                            type="text"
                            value={formData.customerService.phone1}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    customerService: { ...formData.customerService, phone1: e.target.value },
                                })
                            }
                            placeholder="051-747-8207"
                            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">예약 문의 전화번호</label>
                        <input
                            type="text"
                            value={formData.customerService.phone2}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    customerService: { ...formData.customerService, phone2: e.target.value },
                                })
                            }
                            placeholder="010-8688-8810"
                            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Company Information Section */}
            <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 p-4">
                <div className="text-sm font-extrabold text-neutral-200 mb-3">회사 정보</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">상호</label>
                        <input
                            type="text"
                            value={formData.companyInfo.name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    companyInfo: { ...formData.companyInfo, name: e.target.value },
                                })
                            }
                            placeholder="청원여행사"
                            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">대표</label>
                        <input
                            type="text"
                            value={formData.companyInfo.representative}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    companyInfo: { ...formData.companyInfo, representative: e.target.value },
                                })
                            }
                            placeholder="김동현"
                            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs text-neutral-400 mb-1">주소</label>
                        <input
                            type="text"
                            value={formData.companyInfo.address}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    companyInfo: { ...formData.companyInfo, address: e.target.value },
                                })
                            }
                            placeholder="부산광역시 해운대구 해운대로 216 2층"
                            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">대표번호</label>
                        <input
                            type="text"
                            value={formData.companyInfo.phone}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    companyInfo: { ...formData.companyInfo, phone: e.target.value },
                                })
                            }
                            placeholder="(051) 747-8207"
                            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">이메일</label>
                        <input
                            type="email"
                            value={formData.companyInfo.email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    companyInfo: { ...formData.companyInfo, email: e.target.value },
                                })
                            }
                            placeholder="chungwon87@naver.com"
                            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">팩스</label>
                        <input
                            type="text"
                            value={formData.companyInfo.fax}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    companyInfo: { ...formData.companyInfo, fax: e.target.value },
                                })
                            }
                            placeholder="(051) 747-8204"
                            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">사업자등록번호</label>
                        <input
                            type="text"
                            value={formData.companyInfo.businessNumber}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    companyInfo: { ...formData.companyInfo, businessNumber: e.target.value },
                                })
                            }
                            placeholder="473-15-00667"
                            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs text-neutral-400 mb-1">통신판매업신고번호</label>
                        <input
                            type="text"
                            value={formData.companyInfo.onlineBusinessNumber}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    companyInfo: { ...formData.companyInfo, onlineBusinessNumber: e.target.value },
                                })
                            }
                            placeholder="제2023-부산해운대-1696호"
                            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs text-neutral-400 mb-1">관광사업자등록번호</label>
                        <input
                            type="text"
                            value={formData.companyInfo.tourLicense}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    companyInfo: { ...formData.companyInfo, tourLicense: e.target.value },
                                })
                            }
                            placeholder="제2017-000026호"
                            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Logo Section */}
            <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 p-4">
                <div className="text-sm font-extrabold text-neutral-200 mb-3">로고</div>

                <div className="mb-3">
                    <div className="text-xs text-neutral-400 mb-2">현재 로고 미리보기</div>
                    <div className="flex items-center justify-center rounded-xl bg-black/40 p-4">
                        {logoPreview ? (
                            <img src={logoPreview} alt="Footer Logo" className="h-20 w-auto max-w-[300px] object-contain" />
                        ) : (
                            <div className="text-xs text-neutral-500">로고가 없습니다.</div>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-neutral-400 mb-1">새 로고 업로드</label>
                    <input
                        type="file"
                        accept=".svg,.png,.jpg,.jpeg,.webp"
                        onChange={handleLogoFileChange}
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm text-neutral-200"
                    />
                    <p className="mt-1 text-xs text-neutral-500">권장: SVG 또는 PNG (투명 배경)</p>
                </div>
            </div>

            {/* Copyright & Powered By Section */}
            <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 p-4">
                <div className="text-sm font-extrabold text-neutral-200 mb-3">하단 문구</div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">저작권 문구</label>
                        <input
                            type="text"
                            value={formData.copyright}
                            onChange={(e) => setFormData({ ...formData, copyright: e.target.value })}
                            placeholder="Copyright @ 청원여행사 All Rights Reserved."
                            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">Powered by 문구</label>
                        <input
                            type="text"
                            value={formData.poweredBy}
                            onChange={(e) => setFormData({ ...formData, poweredBy: e.target.value })}
                            placeholder="Powered by Findvalue Crop"
                            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 p-4">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isLoading}
                    className="w-full rounded-xl bg-neutral-50 px-4 py-3 text-sm font-extrabold text-neutral-950 disabled:opacity-50"
                >
                    {isLoading ? "저장 중..." : "저장"}
                </button>

                {updateMut.isError && (
                    <div className="mt-3 text-xs text-red-400">
                        저장 실패: {(updateMut.error as any)?.message ?? "unknown error"}
                    </div>
                )}

                {updateMut.isSuccess && <div className="mt-3 text-xs text-green-400">저장 완료!</div>}
            </div>
        </div>
    );
}
