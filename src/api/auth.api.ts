export async function adminLogin(input: { email: string; password: string }) {
    // TODO: 실제로는 서버에서 검증
    if (input.email === "admin@tour.com" && input.password === "admin1234") {
        return { token: "mock-admin-token" };
    }
    throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
}
