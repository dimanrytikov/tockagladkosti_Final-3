import React, { useState, useMemo, useRef, useEffect } from 'react';
import { calculatorData } from '../constants';
import { ModalData, CalculatorZone, CalculatorCategory } from '../types';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface PriceCalculatorProps {
    onOpenModal: (data: ModalData) => void;
}

const CategoryCard: React.FC<{
    category: CalculatorCategory;
    selectedZones: Record<string, boolean>;
    onZoneChange: (zoneId: string, isSelected: boolean) => void;
    isFullBodySelected: boolean;
}> = ({ category, selectedZones, onZoneChange, isFullBodySelected }) => {
    const isSpecialPackage = category.id === 'full-package';

    if (isSpecialPackage) {
        const isSelected = selectedZones[category.zones[0].id];
        return (
            <div className="md:col-span-2">
                <label className={`relative block p-5 bg-secondary rounded-2xl cursor-pointer transition-all duration-300 border-2 ${isSelected ? 'border-accent shadow-lg shadow-accent/20 scale-[1.02]' : 'border-transparent hover:border-accent/50'}`}>
                    <div className="absolute top-2 right-2 bg-accent text-text-on-accent text-xs font-bold px-3 py-1 rounded-full animate-pulse-glow">Хит Продаж</div>
                    <div className="flex items-center gap-4">
                        <span className={`${category.icon} text-3xl text-accent`}></span>
                        <div>
                            <h3 className="font-heading text-xl text-text-main">{category.zones[0].name}</h3>
                            <p className="text-sm text-text-muted">Получите максимальную выгоду на комплекс!</p>
                        </div>
                    </div>
                    <input
                        type="checkbox"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        checked={isSelected}
                        onChange={(e) => onZoneChange(category.zones[0].id, e.target.checked)}
                    />
                </label>
            </div>
        );
    }

    return (
        <div className="bg-secondary p-5 rounded-2xl h-full">
            <div className="flex items-center gap-3 mb-4">
                <span className={`${category.icon} text-2xl text-accent w-8 text-center`}></span>
                <h3 className="font-heading text-xl text-text-main">{category.title}</h3>
            </div>
            <div className="flex flex-wrap gap-2.5">
                {category.zones.map(zone => (
                    <label key={zone.id} className={`zone-label ${selectedZones[zone.id] ? 'checked' : ''} ${isFullBodySelected ? 'disabled:opacity-50 disabled:cursor-not-allowed' : ''}`}>
                        <input
                            type="checkbox"
                            name="zone"
                            className="hidden"
                            checked={!!selectedZones[zone.id]}
                            onChange={(e) => onZoneChange(zone.id, e.target.checked)}
                            disabled={isFullBodySelected}
                        />
                        {zone.name} <span className="text-xs opacity-70 ml-1">({zone.price}р)</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

const DiscountMeter: React.FC<{ count: number }> = ({ count }) => {
    const steps = [
        { threshold: 2, discount: 10, label: '10%' },
        { threshold: 3, discount: 15, label: '15%' },
        { threshold: 4, discount: 20, label: '20%' },
        { threshold: 5, discount: 25, label: '25%' },
    ];

    const currentStepIndex = steps.findIndex(step => count < step.threshold);
    const progressPercent = count > 0 ? (count / 5) * 100 : 0;
    
    let message = 'Выберите зоны для скидки';
    if (count === 1) message = 'Выберите еще 1 зону для скидки 10%';
    else if (count >= 2 && currentStepIndex !== -1) message = `+1 зона до скидки ${steps[currentStepIndex].discount}%`;
    else if (count >= 5) message = 'Максимальная скидка 25% получена!';

    return (
        <div className="my-5 p-4 bg-surface rounded-xl">
            <div className="flex justify-between items-center text-xs font-bold text-text-muted mb-2">
                <span>Ваш прогресс по скидке:</span>
                <span className="text-accent">{message}</span>
            </div>
            <div className="w-full bg-primary rounded-full h-3.5 overflow-hidden relative">
                <div className="absolute inset-0 flex justify-around">
                    {steps.map((step, i) => (
                        <div key={i} className={`h-full ${i > 0 ? 'border-l-2 border-primary' : ''}`} style={{ width: '20%' }}></div>
                    ))}
                </div>
                <div 
                    className="bg-gradient-to-r from-accent/50 to-accent h-full rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                ></div>
            </div>
            <div className="flex justify-between mt-1.5 text-xs font-bold text-text-muted">
                {steps.map(step => (
                     <span key={step.discount} className={`${count >= step.threshold ? 'text-accent' : ''}`}>{step.label}</span>
                ))}
            </div>
        </div>
    );
};


const PriceCalculator: React.FC<PriceCalculatorProps> = ({ onOpenModal }) => {
    const [selectedZones, setSelectedZones] = useState<Record<string, boolean>>({});
    const [isForMen, setIsForMen] = useState(false);
    const [animateTotal, setAnimateTotal] = useState(false);
    const priceRef = useRef(0);

    const allZones = useMemo(() => calculatorData.flatMap(cat => cat.zones), []);
    const fullBodyZone = useMemo(() => allZones.find(z => z.id === 'full-body'), [allZones]);

    const handleZoneChange = (zoneId: string, isSelected: boolean) => {
        if (zoneId === 'full-body') {
            setSelectedZones(isSelected ? { 'full-body': true } : {});
        } else {
             setSelectedZones(prev => {
                const newSelection = { ...prev, [zoneId]: isSelected };
                if (newSelection['full-body']) {
                    delete newSelection['full-body'];
                }
                return newSelection;
            });
        }
    };

    const calculation = useMemo(() => {
        const isFullBodySelected = !!selectedZones['full-body'];
        let basePrice = 0;
        const details = {
            isFullBodyMode: false,
            activeZones: [] as CalculatorZone[],
            total: 0,
            count: 0,
            discountPercent: 0,
            discountAmount: 0,
        };

        if (isFullBodySelected && fullBodyZone) {
            const fullBodyComponentIds = [
                'full-face', 'armpits', 'bikini-deep', 'stomach-full', 
                'buttocks', 'chest-full', 'back-full', 'neck-full', 
                'arms-full', 'legs-full'
            ];
            const totalIndividualPrice = allZones
                .filter(zone => fullBodyComponentIds.includes(zone.id))
                .reduce((sum, zone) => sum + zone.price, 0);

            basePrice = fullBodyZone.price;
            details.discountAmount = totalIndividualPrice - basePrice;
            details.discountPercent = 35;
            
            details.isFullBodyMode = true;
            details.activeZones = [fullBodyZone];
            details.total = totalIndividualPrice;
            details.count = 1;

        } else {
            details.activeZones = allZones.filter(zone => selectedZones[zone.id] && zone.id !== 'full-body');
            details.total = details.activeZones.reduce((sum, zone) => sum + zone.price, 0);
            details.count = details.activeZones.length;
            
            if (details.count === 2) details.discountPercent = 10;
            else if (details.count === 3) details.discountPercent = 15;
            else if (details.count === 4) details.discountPercent = 20;
            else if (details.count >= 5) details.discountPercent = 25;
            
            details.discountAmount = Math.floor(details.total * (details.discountPercent / 100));
            basePrice = details.total - details.discountAmount;
        }

        const surcharge = isForMen ? Math.ceil(basePrice * 0.3) : 0;
        const finalPrice = basePrice + surcharge;

        return { ...details, surcharge, finalPrice };
    }, [selectedZones, isForMen, allZones, fullBodyZone]);

    useEffect(() => {
        if (calculation.finalPrice > 0 && calculation.finalPrice !== priceRef.current) {
            setAnimateTotal(true);
            const timer = setTimeout(() => setAnimateTotal(false), 500);
            priceRef.current = calculation.finalPrice;
            return () => clearTimeout(timer);
        }
        if (calculation.finalPrice === 0) {
             priceRef.current = 0;
        }
    }, [calculation.finalPrice]);

    const handleBookComplex = () => {
        if (calculation.count === 0) return;
        
        const serviceName = calculation.isFullBodyMode
            ? "Комплекс 'Всё тело'"
            : `Комплекс (${calculation.count} ${calculation.count === 1 ? 'зона' : (calculation.count > 1 && calculation.count < 5 ? 'зоны' : 'зон')})`;

        const activeZoneNames = calculation.isFullBodyMode 
            ? ["Все ключевые зоны включены"] 
            : calculation.activeZones.map(z => z.name);

        onOpenModal({
            name: `${serviceName}${isForMen ? " (мужской)" : ""}`,
            price: calculation.finalPrice,
            isComplex: true,
            zones: activeZoneNames
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {calculatorData.map(category => (
                                <CategoryCard
                                    key={category.id}
                                    category={category}
                                    selectedZones={selectedZones}
                                    onZoneChange={handleZoneChange}
                                    isFullBodySelected={!!selectedZones['full-body']}
                                />
                            ))}
                        </div>
                    </div>
                    <div className={`lg:col-span-1 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '300ms' }}>
                        <div className="sticky top-32 bg-primary p-6 rounded-2xl shadow-lg text-text-main font-sans">
                            <h3 className="font-heading text-2xl font-normal text-text-main mb-4">Расчетный лист:</h3>
                            <div className="min-h-[120px] max-h-48 overflow-y-auto border-b border-gray-700 pb-4 mb-4 pr-2">
                                {calculation.count === 0 ? (
                                    <p className="text-text-muted pt-8 text-center">Выберите зоны для расчета...</p>
                                ) : (
                                    <div className="space-y-1">
                                    {calculation.activeZones.map(zone => (
                                        <div key={zone.id} className="flex justify-between animate-fade-in text-sm">
                                            <span>{zone.name}</span>
                                            <span className="font-medium">{zone.price.toLocaleString('ru-RU')}р</span>
                                        </div>
                                    ))}
                                    </div>
                                )}
                            </div>
                            
                            {!calculation.isFullBodyMode && <DiscountMeter count={calculation.count} />}

                            <div className="space-y-2 mt-4 text-sm">
                                {calculation.count > 0 && (
                                    <>
                                        <div className="flex justify-between">
                                            <span>Сумма:</span>
                                            <span className={`font-bold ${calculation.discountAmount > 0 ? 'line-through text-text-muted' : ''}`}>{calculation.total.toLocaleString('ru-RU')} р.</span>
                                        </div>
                                        {calculation.discountAmount > 0 &&
                                            <div className="flex justify-between text-accent">
                                                <span>Скидка ({calculation.discountPercent}%):</span>
                                                <span className="font-bold">- {calculation.discountAmount.toLocaleString('ru-RU')} р.</span>
                                            </div>
                                        }
                                        {isForMen && (
                                             <div className="flex justify-between text-sky-400">
                                                <span>Наценка для мужчин (30%):</span>
                                                <span className="font-bold">+ {calculation.surcharge.toLocaleString('ru-RU')} р.</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <hr className="my-3 border-gray-700" />
                            <div className={`flex justify-between items-center text-2xl font-bold text-accent ${animateTotal ? 'animate-jiggle' : ''}`}>
                                <span>ИТОГО:</span>
                                <span className="text-3xl">{calculation.finalPrice.toLocaleString('ru-RU')} р.</span>
                            </div>

                             <div className="mt-5">
                                <label className="flex items-center justify-center cursor-pointer p-3 bg-secondary rounded-lg hover:bg-surface transition-colors">
                                    <input 
                                        type="checkbox" 
                                        checked={isForMen} 
                                        onChange={() => setIsForMen(!isForMen)} 
                                        className="h-5 w-5 rounded border-gray-300 text-accent focus:ring-accent bg-transparent" 
                                    />
                                    <span className="ml-3 text-text-main font-semibold text-sm">Мужская эпиляция (+30%)</span>
                                </label>
                            </div>
                            <button
                                onClick={handleBookComplex}
                                disabled={calculation.count === 0}
                                className={`w-full mt-4 cta-button px-10 py-3 text-base ${calculation.count === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Записаться на комплекс
                            </button>
                        </div>
                    </div>
                </div>
                 <div className={`text-center text-text-muted mt-12 space-y-2 font-sans max-w-3xl mx-auto transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>
                    <p className="text-base"><strong className="text-text-main">Скидка 40%</strong> на ПЕРВЫЙ визит на любую зону или комплекс!</p>
                    <p className="text-sm">А также: <strong className="text-text-main">2 зоны:</strong> 10% | <strong className="text-text-main">3 зоны:</strong> 15% | <strong className="text-text-main">4 зоны:</strong> 20% | <strong className="text-text-main">5+ зон:</strong> 25%</p>
                </div>
            </div>
        </section>
    );
};

export default PriceCalculator;