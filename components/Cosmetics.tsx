import React, { useState, useEffect, useRef } from 'react';
import { cosmeticsData } from '../constants';
import { ModalData, CosmeticProduct, CartItem } from '../types';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface ProductCardProps {
    product: CosmeticProduct;
    onAddToCart: (item: CartItem) => void;
}

const getProductThemeColors = (theme: string) => {
    // Returns a unique color accent for each product line to match the "bottle color".
    // The colors are chosen to be visible and harmonious on the dark theme.
    switch (theme) {
        case 'sky':
            return { accentText: 'text-sky-400', tagBg: 'bg-sky-900/50', shadow: 'hover:shadow-sky-400/20' };
        case 'cyan':
            return { accentText: 'text-cyan-400', tagBg: 'bg-cyan-900/50', shadow: 'hover:shadow-cyan-400/20' };
        case 'teal':
            return { accentText: 'text-teal-400', tagBg: 'bg-teal-900/50', shadow: 'hover:shadow-teal-400/20' };
        case 'purple':
            return { accentText: 'text-purple-400', tagBg: 'bg-purple-900/50', shadow: 'hover:shadow-purple-400/20' };
        case 'rose':
            return { accentText: 'text-rose-400', tagBg: 'bg-rose-900/50', shadow: 'hover:shadow-rose-400/20' };
        case 'red':
            return { accentText: 'text-red-400', tagBg: 'bg-red-900/50', shadow: 'hover:shadow-red-400/20' };
        case 'lime':
            return { accentText: 'text-lime-400', tagBg: 'bg-lime-900/50', shadow: 'hover:shadow-lime-400/20' };
        case 'violet':
            return { accentText: 'text-violet-400', tagBg: 'bg-violet-900/50', shadow: 'hover:shadow-violet-400/20' };
        case 'amber':
            return { accentText: 'text-amber-400', tagBg: 'bg-amber-900/50', shadow: 'hover:shadow-amber-400/20' };
        case 'indigo':
            return { accentText: 'text-indigo-400', tagBg: 'bg-indigo-900/50', shadow: 'hover:shadow-indigo-400/20' };
        case 'fuchsia':
            return { accentText: 'text-fuchsia-400', tagBg: 'bg-fuchsia-900/50', shadow: 'hover:shadow-fuchsia-400/20' };
        case 'orange':
            return { accentText: 'text-orange-400', tagBg: 'bg-orange-900/50', shadow: 'hover:shadow-orange-400/20' };
        case 'slate':
            return { accentText: 'text-slate-400', tagBg: 'bg-slate-800/50', shadow: 'hover:shadow-slate-400/20' };
        case 'emerald':
            return { accentText: 'text-emerald-400', tagBg: 'bg-emerald-900/50', shadow: 'hover:shadow-emerald-400/20' };
        case 'stone':
            return { accentText: 'text-stone-400', tagBg: 'bg-stone-800/50', shadow: 'hover:shadow-stone-400/20' };
        default:
            return { accentText: 'text-accent', tagBg: 'bg-accent/10', shadow: 'hover:shadow-accent/20' }; // Fallback to main gold accent
    }
};


const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
    const themeColors = getProductThemeColors(product.theme);

    const handleAddToCartClick = (variant: { size: string; price: number; }) => {
        const cartItem: CartItem = {
            id: `product-${product.name}-${variant.size}`,
            type: 'product',
            name: product.name,
            details: variant.size,
            price: variant.price,
            quantity: 1, // Initial quantity
            productRef: product,
        };
        onAddToCart(cartItem);
    };

    return (
        <div className={`bg-secondary rounded-xl shadow-lg flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${themeColors.shadow}`}>
            <div className={`p-5 flex flex-col flex-grow text-text-main`}>
                <div className="flex-grow">
                    <h4 className={`font-heading text-xl font-bold leading-tight mb-2 ${themeColors.accentText}`}>
                        {product.name}
                    </h4>
                    {product.subtitle && <p className={`text-sm mb-3 text-text-muted`}>{product.subtitle}</p>}
                    <p className={`text-sm mb-4 text-text-muted`}>{product.description}</p>
                </div>
                <div className="my-3">
                    <h5 className={`font-semibold text-sm mb-2 text-text-main`}>Активные компоненты:</h5>
                    <div className="flex flex-wrap gap-2">
                        {product.activeComponents.map((component) => (
                            <span key={component} className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${themeColors.tagBg} ${themeColors.accentText}`}>
                                {component}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="mt-auto pt-4 space-y-3 border-t border-white/10">
                    {product.variants.map(variant => (
                        <div key={variant.size} className="flex justify-between items-center text-sm">
                            <div className='flex-grow'>
                                <span className={`text-text-muted`}>{variant.size}</span>
                                <span className={`block font-bold text-base text-accent`}>{variant.price.toLocaleString('ru-RU')} р.</span>
                            </div>
                            <button 
                                onClick={() => handleAddToCartClick(variant)}
                                className="bg-accent text-text-on-accent font-semibold px-4 py-2 text-sm rounded-lg hover:bg-yellow-600 transition-colors whitespace-nowrap"
                                aria-label={`Добавить в корзину ${product.name} ${variant.size}`}
                            >
                                В корзину
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

interface CosmeticsProps {
    onOpenModal: (data: ModalData) => void;
    onAddToCart: (item: CartItem) => void;
}

export const Cosmetics: React.FC<CosmeticsProps> = ({ onOpenModal, onAddToCart }) => {
    const [activeBrandId, setActiveBrandId] = useState(cosmeticsData[0].id);
    const [activeTabId, setActiveTabId] = useState(cosmeticsData[0].tabs[0].id);
    
    useEffect(() => {
        // When brand changes, set the active tab to the first tab of the new brand
        const currentBrandData = cosmeticsData.find(b => b.id === activeBrandId);
        if (currentBrandData && currentBrandData.tabs.length > 0) {
            setActiveTabId(currentBrandData.tabs[0].id);
        }
    }, [activeBrandId]);

    const activeBrandData = cosmeticsData.find(b => b.id === activeBrandId);
    const activeTabData = activeBrandData?.tabs.find(tab => tab.id === activeTabId);
    
    const handleBookConsultation = () => {
        onOpenModal({
            name: `Общая консультация по подбору ухода`,
            price: 'Консультация',
            isComplex: false
        });
    };

    const sectionRef = useRef<HTMLElement>(null);
    const isVisible = useIntersectionObserver(sectionRef, { threshold: 0.1 });

    return (
        <section id="cosmetics" ref={sectionRef} className="py-16 sm:py-24 bg-surface">
            <div className="container mx-auto px-4">
                 <div className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h2 className="font-heading text-4xl sm:text-5xl font-normal text-center mb-4">Ваш Профессиональный Уход Дома</h2>
                    
                    <div className="flex justify-center mb-8 bg-primary p-1.5 rounded-xl max-w-md mx-auto">
                        {cosmeticsData.map(brand => (
                            <button
                                key={brand.id}
                                onClick={() => setActiveBrandId(brand.id)}
                                className={`w-1/2 py-2.5 rounded-lg text-base font-semibold transition-colors duration-300 ${activeBrandId === brand.id ? 'bg-accent text-text-on-accent shadow-lg' : 'text-text-muted hover:bg-secondary'}`}
                            >
                                {brand.name}
                            </button>
                        ))}
                    </div>

                    <p className="text-lg text-center text-text-muted font-sans mb-12 max-w-3xl mx-auto">
                        {activeBrandData?.tagline}
                    </p>
                </div>
                
                <div className={`max-w-4xl mx-auto mb-16 p-6 bg-secondary rounded-2xl border border-accent/50 shadow-lg transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
                    <p className="text-center text-lg text-text-main font-heading">
                        <span className="text-2xl block text-accent mb-2">Эксклюзивно для наших клиентов</span>
                        Продлите сияние вашей кожи. Приобретая профессиональный уход в день процедуры, Вы получаете <strong className="font-bold">скидку 10%</strong> на всю линейку.
                        <br/>
                        <span className="text-base text-green-400 font-semibold">Это экономия до 800 р. с одного премиум-средства!</span>
                    </p>
                </div>
                
                <div className={`relative mb-12 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '300ms' }}>
                     <div className="flex flex-wrap justify-center gap-3 sm:gap-4 pb-4">
                        {activeBrandData?.tabs.map(tab => (
                             <button
                                key={tab.id}
                                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-accent/80 hover:-translate-y-1 ${
                                    activeTabId === tab.id
                                        ? 'bg-accent text-text-on-accent shadow-lg'
                                        : 'bg-primary text-text-muted hover:bg-secondary hover:text-accent'
                                }`}
                                onClick={() => setActiveTabId(tab.id)}
                            >
                                {tab.title}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={`max-w-7xl mx-auto transition-all duration-700 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '400ms' }}>
                    {activeTabData && (
                         <div key={activeTabData.id} className="animate-fade-in p-4 sm:p-6 bg-primary rounded-3xl">
                            <div className="text-center mb-6 sm:mb-8 max-w-3xl mx-auto">
                                <h3 className="font-heading text-xl sm:text-2xl font-normal mb-3">{activeTabData.heading}</h3>
                                <p className="text-text-muted">{activeTabData.description}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 font-sans">
                                {activeTabData.products.map(product => (
                                    <ProductCard key={`${activeBrandId}-${product.name}`} product={product} onAddToCart={onAddToCart} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className={`text-center text-lg mt-16 text-text-muted font-sans p-6 bg-secondary border border-gray-700 rounded-2xl shadow-lg max-w-4xl mx-auto transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '500ms' }}>
                    <p className='mb-4'>
                        <strong className="text-text-main">Не уверены в выборе?</strong>
                        <br />Чтобы уход был точным и эффективным, я (Екатерина) помогу подобрать ваши идеальные средства на консультации. Это усилит и продлит результат от процедур.
                    </p>
                     <button onClick={handleBookConsultation} className="cta-button px-8 py-3">
                        Записаться на консультацию по уходу
                    </button>
                </div>
            </div>
        </section>
    );
};