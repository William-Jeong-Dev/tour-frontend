export default function ScrollTopFloating() {
    return (
        <div className="fixed bottom-6 right-6 z-50 translate-y-[60px]">
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="h-12 w-12 rounded-full border border-neutral-300 bg-white text-sm font-bold text-neutral-800 shadow hover:bg-neutral-50"
                aria-label="scroll top"
            >
                ↑
            </button>
        </div>
    );
}
