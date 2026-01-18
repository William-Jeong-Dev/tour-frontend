export default function ProductGallery({ images }: { images: string[] }) {
    const main = images[0];
    return (
        <div className="overflow-hidden rounded-3xl border border-neutral-900 bg-neutral-900/20">
            <div className="aspect-[4/3] overflow-hidden">
                <img src={main} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-2 p-3">
                {images.slice(0, 4).map((src) => (
                    <div key={src} className="aspect-square overflow-hidden rounded-xl border border-neutral-800">
                        <img src={src} alt="" className="h-full w-full object-cover" />
                    </div>
                ))}
            </div>
        </div>
    );
}
