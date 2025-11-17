import React, { useState, useMemo, useRef, useEffect } from 'react';
import { calculatorData } from '../constants';
import { ModalData, CalculatorZone } from '../types';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface PriceCalculatorProps {
    onOpenModal: (data: ModalData) => void;
}

const AccordionItem: React.FC<{
    category: typeof calculatorData[0];
    isOpen: boolean;
    onToggle: () => void;
    selectedZones: Record<string, boolean>;
    onZoneChange: (zoneId: string, isSelected: boolean) => void;
}> = ({ category, isOpen, onToggle, selectedZones, onZoneChange }) => (
    <div>
        <button
            className="w-full flex justify-between items-center text-left p-4 sm:p-5 bg-surface hover:bg-gray-700 text-text-main rounded-xl transition-colors duration-200"
            onClick={onToggle}
        >
            <span className="font-heading text-lg sm:text-xl">{category.title}</span>
            <span className={`fas fa-chevron-down text-xl transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true"></span>
        </button>
        {isOpen && (
            <div className="animate-fade-in pt-5 pb-2 px-2">
                <div className="flex flex-wrap gap-3">
                    {category.zones.map(zone => (
                        <label key={zone.id} className={`zone-label ${selectedZones[zone.id] ? 'checked' : ''}`}>
                            <input
                                type="checkbox"
                                name="zone"
                                className="hidden"
                                checked={!!selectedZones[zone.id]}
                                onChange={(e) => onZoneChange(zone.id, e.target.checked)}
                            />
                            {zone.label}
                        </label>
                    ))}
                </div>
            </div>
        )}
    </div>
);

const PriceCalculator: React.FC<PriceCalculatorProps> = ({ onOpenModal }) => {
    const [openAccordion, setOpenAccordion] = useState<string | null>(calculatorData[0].id);
    const [selectedZones, setSelectedZones] = useState<Record<string, boolean>>({});
    const [isForMen, setIsForMen] = useState(false);
    const [animateTotal, setAnimateTotal] = useState(false);
    const priceRef = useRef(0);

    const allZones = useMemo(() => calculatorData.flatMap(cat => cat.zones), []);
    const fullBodyZone = useMemo(() => allZones.find(z => z.id === 'full-body'), [allZones]);

    const handleZoneChange = (zoneId: string, isSelected: boolean) => {
        if (zoneId === 'full-body' && isSelected) {
            setSelectedZones({ 'full-body': true });
        } else {
            setSelectedZones(prev => {
                const newSelection = { ...prev, [zoneId]: isSelected };
                // If another zone is selected, unselect 'full-body'
                if (isSelected && newSelection['full-body']) {
                    delete newSelection['full-body'];
                }
                return newSelection;
            });
        }
    };

    const calculation = useMemo(() => {
        const isFullBodySelected = !!selectedZones['full-body'];
        let basePrice = 0;
        let details = {
            isFullBodyMode: false,
            activeZones: [] as CalculatorZone[],
            total: 0,
            count: 0,
            discountPercent: 0,
            discountAmount: 0,
        };

        if (isFullBodySelected && fullBodyZone) {
            // Sum of the most granular parts to show the maximum possible saving.
            const fullBodyComponentZoneIds = [
                // Face parts
                'upper-lip', 'chin', 'glabella', 'sideburns', 'cheeks',
                // Arm parts
                'arms-lower', 'arms-upper', 'hands',
                // Leg parts
                'lower-legs', 'thighs', 'feet',
                // Body parts
                'armpits', 'bikini-deep', 'stomach-full',
                'buttocks', 'back-full', 'areolas', 'chest-full', 'neck-full',
            ];
            const totalIndividualPrice = allZones
                .filter(zone => fullBodyComponentZoneIds.includes(zone.id))
                .reduce((sum, zone) => sum + zone.price, 0);

            basePrice = fullBodyZone.price;
            details = {
                isFullBodyMode: true,
                activeZones: [fullBodyZone],
                total: totalIndividualPrice,
                count: 1,
                discountPercent: 0,
                discountAmount: totalIndividualPrice - fullBodyZone.price,
            };
        } else {
            const activeZones = allZones.filter(zone => selectedZones[zone.id] && zone.id !== 'full-body');
            const total = activeZones.reduce((sum, zone) => sum + zone.price, 0);
            const count = activeZones.length;
            
            let discountPercent = 0;
            if (count === 2) discountPercent = 10;
            else if (count === 3) discountPercent = 15;
            else if (count === 4) discountPercent = 20;
            else if (count >= 5) discountPercent = 25;
            
            const discountAmount = Math.floor(total * (discountPercent / 100));
            basePrice = total - discountAmount;
            details = { 
                isFullBodyMode: false,
                activeZones, 
                total, 
                count, 
                discountPercent, 
                discountAmount, 
            };
        }

        const surcharge = isForMen ? Math.ceil(basePrice * 0.3) : 0;
        const finalPrice = basePrice + surcharge;

        return { ...details, surcharge, finalPrice };
    }, [selectedZones, isForMen, allZones, fullBodyZone]);

    useEffect(() => {
        // Only animate if the price is not 0 and has changed from the previous render.
        if (calculation.finalPrice > 0 && calculation.finalPrice !== priceRef.current) {
            setAnimateTotal(true);
            const timer = setTimeout(() => setAnimateTotal(false), 500); // Animation duration
            priceRef.current = calculation.finalPrice;
            return () => clearTimeout(timer);
        }
        // If price goes to 0, just update the ref without animating
        if (calculation.finalPrice === 0) {
             priceRef.current = 0;
        }
    }, [calculation.finalPrice]);

    const handleBookComplex = () => {
        if (calculation.count === 0) return;
        
        let serviceName: string;
        if (calculation.isFullBodyMode) {
            serviceName = "Комплекс 'Всё тело'";
        } else {
            const zoneCount = calculation.count;
            let zoneCountText;
            if (zoneCount === 1) zoneCountText = 'зона';
            else if (zoneCount > 1 && zoneCount < 5) zoneCountText = 'зоны';
            else zoneCountText = 'зон';
            serviceName = `Комплекс (${zoneCount} ${zoneCountText})`;
        }

        if (isForMen) {
            serviceName += " (мужской)";
        }

        onOpenModal({
            name: serviceName,
            price: calculation.finalPrice,
            isComplex: true,
            zones: calculation.activeZones.map(z => z.name)
        });
    };
    
    const sectionRef = useRef<HTMLElement>(null);
    const isVisible = useIntersectionObserver(sectionRef, { threshold: 0.1 });

    return (
        <section id="price-calc" ref={sectionRef} className="py-16 sm:py-24 bg-secondary">
            <div className="container mx-auto px-4">
                 <div className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h2 className="font-heading text-4xl sm:text-5xl font-normal text-center mb-4">Ваш Идеальный Комплекс</h2>
                    <p className="text-lg text-center text-text-muted font-sans mb-12 max-w-2xl mx-auto">Выберите от двух зон и получите скидку до 25%. Калькулятор поможет рассчитать финальную стоимость.</p>
                </div>
                
                <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto">
                    <div className={`lg:col-span-2 bg-primary p-4 sm:p-6 rounded-2xl shadow-lg transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
                        <div className="space-y-4">
                            {calculatorData.map(category => (
                                <AccordionItem
                                    key={category.id}
                                    category={category}
                                    isOpen={openAccordion === category.id}
                                    onToggle={() => setOpenAccordion(openAccordion === category.id ? null : category.id)}
                                    selectedZones={selectedZones}
                                    onZoneChange={handleZoneChange}
                                />
                            ))}
                        </div>
                    </div>
                    <div className={`lg:col-span-1 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '300ms' }}>
                        <div className="sticky top-28 bg-primary p-6 rounded-2xl shadow-lg text-text-main font-sans">
                            <h3 className="font-heading text-2xl font-normal text-text-main mb-4">Ваш Комплекс:</h3>
                            <div className="min-h-[100px] border-b border-gray-700 pb-4 mb-4 text-text-main">
                                {calculation.count === 0 ? (
                                    <p className="text-text-muted">Выберите зоны слева...</p>
                                ) : (
                                    calculation.activeZones.map(zone => (
                                        <div key={zone.id} className="flex justify-between">
                                            <span>{zone.name}</span>
                                            <span className="font-medium">{zone.price.toLocaleString('ru-RU')}р</span>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="space-y-3">
                                {calculation.isFullBodyMode ? (
                                    <>
                                        <div className="flex justify-between text-lg">
                                            <span>Полная стоимость:</span>
                                            <span className="font-bold line-through text-text-muted">{calculation.total.toLocaleString('ru-RU')} р.</span>
                                        </div>
                                        <div className="flex justify-between text-lg text-accent">
                                            <span>Ваша выгода:</span>
                                            <span className="font-bold">- {calculation.discountAmount.toLocaleString('ru-RU')} р.</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between text-lg">
                                            <span>Общая сумма:</span>
                                            <span className="font-bold">{calculation.total.toLocaleString('ru-RU')} р.</span>
                                        </div>
                                        <div className="flex justify-between text-lg text-accent">
                                            <span>Скидка ({calculation.discountPercent}%):</span>
                                            <span className="font-bold">- {calculation.discountAmount.toLocaleString('ru-RU')} р.</span>
                                        </div>
                                    </>
                                )}
                                {isForMen && calculation.count > 0 && (
                                     <div className="flex justify-between text-lg text-sky-400">
                                        <span>Наценка для мужчин (30%):</span>
                                        <span className="font-bold">+ {calculation.surcharge.toLocaleString('ru-RU')} р.</span>
                                    </div>
                                )}
                                <hr className="my-3 border-gray-700" />
                                <div className={`flex justify-between text-3xl font-bold text-accent ${animateTotal ? 'animate-jiggle' : ''}`}>
                                    <span>ИТОГО:</span>
                                    <span>{calculation.finalPrice.toLocaleString('ru-RU')} р.</span>
                                </div>
                            </div>
                             <div className="mt-6">
                                <label className="flex items-center justify-center cursor-pointer p-3 bg-secondary rounded-lg hover:bg-surface transition-colors">
                                    <input 
                                        type="checkbox" 
                                        checked={isForMen} 
                                        onChange={() => setIsForMen(!isForMen)} 
                                        className="h-5 w-5 rounded border-gray-300 text-accent focus:ring-accent bg-transparent" 
                                    />
                                    <span className="ml-3 text-text-main font-semibold">Мужская эпиляция (+30%)</span>
                                </label>
                            </div>
                            <button
                                onClick={handleBookComplex}
                                disabled={calculation.count === 0}
                                className={`w-full mt-6 cta-button px-10 py-4 text-lg ${calculation.count === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Записаться на комплекс
                            </button>
                        </div>
                    </div>
                </div>
                <div className={`text-center text-text-muted mt-12 space-y-2 font-sans max-w-2xl mx-auto transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>
                    <p className="text-lg"><strong className="text-text-main">2 зоны:</strong> скидка 10% | <strong className="text-text-main">3 зоны:</strong> скидка 15% | <strong className="text-text-main">4 зоны:</strong> скидка 20% | <strong className="text-text-main">5+ зон:</strong> скидка 25%</p>
                </div>
            </div>
        </section>
    );
};

export default PriceCalculator;