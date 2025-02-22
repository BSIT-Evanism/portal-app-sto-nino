import { useState } from 'react';

interface ImageItem {
    id: number;
    src: string;
    title: string;
}

interface SubCategory {
    name: string;
    images: ImageItem[];
}

interface GalleryData {
    [category: string]: {
        subCategories: SubCategory[];
    };
}

interface GalleryProps {
    data: GalleryData;
}

export default function GalleryComp({ data }: GalleryProps) {
    const [modalImage, setModalImage] = useState<ImageItem | null>(null);

    const openModal = (image: ImageItem) => {
        setModalImage(image);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setModalImage(null);
        document.body.style.overflow = 'auto';
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8 text-center">Photo Gallery</h1>

            {Object.entries(data).map(([category, { subCategories }]) => (
                <div key={category} className="mb-16">
                    <h2 className="text-3xl font-bold mb-6 text-gray-800">{category}</h2>
                    {subCategories.map((subCat) => (
                        <div key={subCat.name} className="mb-12">
                            <h3 className="text-2xl font-semibold mb-4 text-gray-700 ml-4">
                                {subCat.name}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {subCat.images.map((image) => (
                                    <div
                                        key={image.id}
                                        onClick={() => openModal(image)}
                                        className="group relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer"
                                    >
                                        <img
                                            referrerPolicy="no-referrer"
                                            src={image.src}
                                            alt={image.title}
                                            className="object-cover w-full h-64 transition-transform duration-300 group-hover:scale-110"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                            <h3 className="text-lg font-semibold text-white">
                                                {image.title}
                                            </h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ))}

            {/* Modal */}
            {modalImage && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                    onClick={(e) => e.target === e.currentTarget && closeModal()}
                >
                    <div className="relative max-w-4xl mx-auto p-4">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-white text-xl hover:text-gray-300"
                        >
                            ×
                        </button>
                        <img
                            src={modalImage.src}
                            alt={modalImage.title}
                            className="max-h-[90vh] w-auto mx-auto"
                        />
                        <h3 className="text-white text-center mt-4 text-xl">
                            {modalImage.title}
                        </h3>
                    </div>
                </div>
            )}
        </div>
    );
}