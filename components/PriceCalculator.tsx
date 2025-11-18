import React, { useState, useMemo, useRef, useCallback } from 'react';
import { calculatorData } from '../constants';
import { ModalData, CalculatorZone } from '../types';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const ZonePill: React.FC<{ zone: CalculatorZone; isSelected: boolean; onToggle: () => void; }> = ({ zone, isSelected, onToggle }) => (
    <button
        onClick={onToggle}
        aria-pressed={isSelected}
        className={`zone-label ${isSelected ? 'checked' : ''}`}
    >
        {zone.label}
    </button>
);


const FullBodyCard: React.FC<{zone: CalculatorZone, isSelected: boolean, onToggle: () => void}> = ({ zone, isSelected, onToggle }) => (
    <button
        onClick={onToggle}
        aria-pressed={isSelected}
        className={`relative w-full text-center p-4 rounded-xl border-2 transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-secondary focus:ring-accent group ${
            isSelected
                ? 'bg-accent text-text-on-accent border-transparent shadow-2xl shadow-accent/40'
                : 'bg-gradient-to-br from-surface to-secondary border-accent hover:border-yellow-400'
        }`}
    >
        <div className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 bg-red-600 text-white rounded-full transform rotate-6 animate-pulse-glow group-hover:animate-none">
            Хит!
        </div>
        <h4 className={`font-heading text-xl font-bold transition-colors ${isSelected ? 'text-text-on-accent' : 'text-accent'}`}>{zone.name}</h4>
        <p className={`text-sm mt-1 transition-colors ${isSelected ? 'text-yellow-200' : 'text-text-muted'}`}>Получите максимальную выгоду в комплексе!</p>
        <div className="flex items-baseline justify-center gap-3 mt-2">
            {zone.originalPrice && (
                <span className={`text-xl font-sans font-medium line-through transition-colors ${isSelected ? 'text-yellow-200/70' : 'text-text-muted'}`}>
                    {zone.originalPrice.toLocaleString('ru-RU')} р.
                </span>
            )}
            <p className={`text-4xl font-bold font-sans transition-colors ${isSelected ? 'text-white' : 'text-accent'}`}>{zone.price.toLocaleString('ru-RU')} р.</p>
        </div>
        {zone.originalPrice && (
            <div className={`mt-1 text-sm font-bold transition-colors ${isSelected ? 'text-yellow-200' : 'text-green-400'}`}>Скидка 35%</div>
        )}
    </button>
);


const DiscountTracker: React.FC<{ count: number; discountPercent: number }> = React.memo(({ count, discountPercent }) => {
    let message, subMessage;
    let nextStepText = '';
    
    const maxZonesForDiscount = 5;
    const progress = Math.min((count / maxZonesForDiscount) * 100, 100);

    if (count >= 5) {
        message = '🎉 Максимальная выгода!';
        subMessage = `Ваша скидка: 25%`;
    } else if (count >= 2) {
        const nextDiscountMap: { [key: number]: number } = { 2: 15, 3: 20, 4: 25 };
        const zonesNeeded = 1;
        nextStepText = `Выберите ещё ${zonesNeeded} зону`;
        message = ` до скидки ${nextDiscountMap[count]}%`;
        subMessage = `Текущая скидка: ${discountPercent}%`;
    } else {
        const zonesNeeded = 2 - count;
        nextStepText = `Выберите ещё ${zonesNeeded} ${zonesNeeded === 1 ? 'зону' : 'зоны'}`;
        message = '... чтобы получить скидку 10%';
        subMessage = `Скидка от 2-х зон`;
    }
    
    return (
        <div className="my-5 p-4 bg-surface rounded-xl text-center space-y-3 animate-fade-in">
            <p className="font-bold text-text-main text-base">
                <span className="text-accent animate-pulse-accent [animation-duration:3s]">{nextStepText}</span>
                {message}
            </p>
             <div className="w-full bg-primary rounded-full h-2.5">
                <div className="bg-accent h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-sm text-text-muted">{subMessage}</p>
        </div>
    );
});


const ToggleSwitch: React.FC<{ id: string; label: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ id, label, checked, onChange }) => (
    <label htmlFor={id} className="flex items-center justify-between cursor-pointer p-4 bg-secondary rounded-xl hover:bg-surface transition-colors w-full">
        <span className="text-text-main font-semibold text-sm">{label}</span>
        <div className="relative">
            <input
                type="checkbox"
                id={id}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only" // Hide default checkbox
            />
            <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${checked ? 'bg-accent' : 'bg-primary'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${checked ? 'transform translate-x-6' : ''}`}></div>
        </div>
    </label>
);


const PriceCalculator: React.FC<{ onOpenModal: (data: ModalData) => void; }> = ({ onOpenModal }) => {
    const [selectedZones, setSelectedZones] = useState<Record<string, boolean>>({});
    const [isForMen, setIsForMen] = useState(false);
    const [isFirstVisit, setIsFirstVisit] = useState(false);
    const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);
    const [openCategory, setOpenCategory] = useState<string | null>(
        calculatorData.find(c => c.id !== 'full-package')?.id || null
    );
    
    const sectionRef = useRef<HTMLElement>(null);
    const isVisible = useIntersectionObserver(sectionRef, { threshold: 0.05 });
    
    const zoneMap = useMemo(() => {
        const map = new Map<string, CalculatorZone>();
        calculatorData.forEach(category => {
            category.zones.forEach(zone => {
                map.set(zone.id, zone);
            });
        });
        return map;
    }, []);

    const calculation = useMemo(() => {
        const isFullBodySelected = selectedZones['full-body'];

        if (isFullBodySelected) {
            const fullBodyZone = zoneMap.get('full-body')!;
            const originalPrice = fullBodyZone.originalPrice!;
            
            let discountPercent: number;
            let priceAfterDiscount: number;

            if (isFirstVisit) {
                discountPercent = 40;
                priceAfterDiscount = originalPrice - Math.floor(originalPrice * 0.4);
            } else {
                discountPercent = 35; 
                priceAfterDiscount = fullBodyZone.price;
            }

            const discountAmount = originalPrice - priceAfterDiscount;
            const surcharge = isForMen ? Math.ceil(priceAfterDiscount * 0.3) : 0;
            const finalPrice = priceAfterDiscount + surcharge;

            return {
                activeZones: [fullBodyZone],
                total: originalPrice,
                count: 1,
                discountPercent,
                discountAmount,
                surcharge,
                finalPrice,
                isFullBody: true,
            };
        } else {
            const activeZones = Object.keys(selectedZones)
                .filter(id => selectedZones[id])
                .map(id => zoneMap.get(id))
                .filter((z): z is CalculatorZone => !!z);
            
            const total = activeZones.reduce((sum, zone) => sum + zone.price, 0);
            const count = activeZones.length;
            let discountPercent = 0;

            if (isFirstVisit && count > 0) {
                discountPercent = 40;
            } else if (count >= 5) {
                discountPercent = 25;
            } else if (count === 4) {
                discountPercent = 20;
            } else if (count === 3) {
                discountPercent = 15;
            } else if (count === 2) {
                discountPercent = 10;
            }

            const discountAmount = Math.floor(total * (discountPercent / 100));
            const priceAfterDiscount = total - discountAmount;
            const surcharge = isForMen ? Math.ceil(priceAfterDiscount * 0.3) : 0;
            const finalPrice = priceAfterDiscount + surcharge;

            return {
                activeZones,
                total,
                count,
                discountPercent,
                discountAmount,
                surcharge,
                finalPrice,
                isFullBody: false,
            };
        }
    }, [selectedZones, isForMen, isFirstVisit, zoneMap]);

    const handleZoneToggle = useCallback((zoneId: string) => {
        if (zoneId === 'full-body') {
            setSelectedZones(prev => ({ 'full-body': !prev['full-body'] }));
        } else {
            setSelectedZones(prev => {
                const newSelection = { ...prev, 'full-body': false };
                newSelection[zoneId] = !newSelection[zoneId];
                return newSelection;
            });
        }
    }, []);
    
    const handleBookComplex = () => {
        if (calculation.count === 0) return;

        let serviceName = calculation.isFullBody 
            ? 'Комплекс "Всё тело"'
            : `Комплекс (${calculation.count} ${calculation.count === 1 ? 'зона' : (calculation.count > 1 && calculation.count < 5 ? 'зоны' : 'зон')})`;
        
        const modifiers = [];
        if (isFirstVisit) modifiers.push("первый визит");
        if (isForMen) modifiers.push("мужской");

        if (modifiers.length > 0) {
            serviceName += ` (${modifiers.join(', ')})`;
        }
            
        const activeZoneNames = calculation.activeZones.map(z => z.name);
        onOpenModal({ 
            name: serviceName, 
            price: calculation.finalPrice, 
            isComplex: true, 
            zones: activeZoneNames 
        });
    };

    const SummaryPanel = ({ isMobile = false }) => (
        <div className={`bg-primary p-6 rounded-2xl shadow-lg text-text-main font-sans ${isMobile ? 'h-full flex flex-col' : 'sticky top-32'}`}>
            <h3 className="font-heading text-2xl font-normal text-text-main mb-4 border-b border-gray-700 pb-3">Ваш Комплекс</h3>
            
            <div className={`min-h-[120px] pr-2 ${isMobile ? 'flex-grow overflow-y-auto' : 'max-h-60 overflow-y-auto'}`}>
                {calculation.activeZones.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <span className="fas fa-hand-pointer text-3xl text-text-muted mb-2"></span>
                        <p className="text-text-muted">Выберите зоны, чтобы собрать ваш идеальный комплекс.</p>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {calculation.activeZones.map(zone => (
                            <li key={zone.id} className="flex justify-between items-center text-sm animate-slide-in-right">
                                <span>{zone.name}</span>
                                <div className="flex items-center gap-3">
                                    <span className="font-medium">{zone.price.toLocaleString('ru-RU')}р</span>
                                    <button onClick={() => handleZoneToggle(zone.id)} className="text-xs text-text-muted hover:text-red-500 w-5 h-5 flex items-center justify-center" aria-label={`Удалить ${zone.name}`}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
            {isFirstVisit && calculation.count > 0 && (
                <div className="my-5 p-3 bg-green-900/50 rounded-xl border border-green-500 text-center animate-fade-in">
                    <p className="font-bold text-green-400 text-base">🎉 Применена скидка 40% для первого визита!</p>
                </div>
            )}

            {calculation.count > 0 && !calculation.isFullBody && !isFirstVisit && (
                 <DiscountTracker count={calculation.count} discountPercent={calculation.discountPercent} />
            )}
            
            <div className={`mt-auto pt-4 border-t border-gray-700 space-y-2 text-sm ${isMobile ? 'flex-shrink-0' : ''}`}>
                {calculation.count > 0 && (
                    <>
                        <div className="flex justify-between">
                            <span>Сумма:</span>
                            <span className={`font-bold ${calculation.discountAmount > 0 ? 'line-through text-text-muted' : ''}`}>
                                {calculation.total.toLocaleString('ru-RU')} р.
                            </span>
                        </div>
                        {calculation.discountAmount > 0 &&
                            <div className="flex justify-between text-green-400 font-bold">
                                <span>Скидка ({calculation.discountPercent}%):</span>
                                <span>- {calculation.discountAmount.toLocaleString('ru-RU')} р.</span>
                            </div>
                        }
                    </>
                )}
                 {isForMen && calculation.surcharge > 0 && (
                    <div className="flex justify-between text-sky-400 font-bold">
                        <span>Наценка для мужчин (+30%):</span>
                        <span>+ {calculation.surcharge.toLocaleString('ru-RU')} р.</span>
                    </div>
                )}
                 <div className="flex justify-between items-center text-2xl font-bold text-accent pt-2 border-t border-gray-700 mt-2">
                    <span>ИТОГО:</span>
                    <span className="text-3xl">{calculation.finalPrice.toLocaleString('ru-RU')} р.</span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3">
                    <ToggleSwitch
                        id="first-visit"
                        label="Первый визит (-40%)"
                        checked={isFirstVisit}
                        onChange={setIsFirstVisit}
                    />
                     <ToggleSwitch
                        id="is-for-men"
                        label="Мужская эпиляция (+30%)"
                        checked={isForMen}
                        onChange={setIsForMen}
                    />
                </div>

                <button onClick={handleBookComplex} disabled={calculation.count === 0} className="w-full mt-4 cta-button px-10 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                    Записаться на комплекс
                </button>
            </div>
        </div>
    );


    return (
        <>
        <section id="price-calc" ref={sectionRef} className="py-16 sm:py-24 bg-secondary">
            <div className="container mx-auto px-4">
                <div className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h2 className="font-heading text-4xl sm:text-5xl font-normal text-center mb-4">Ваш Идеальный Комплекс</h2>
                    <p className="text-lg text-center text-text-muted font-sans mb-12 max-w-3xl mx-auto">Выберите готовый комплекс "Всё тело" или соберите свой, открывая категории ниже. Калькулятор автоматически применит скидку.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 xl:gap-12 max-w-7xl mx-auto">
                    {/* Left: Zone Selection */}
                     <div className={`space-y-8 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
                        {/* Render Full Body Package first */}
                        {calculatorData.filter(c => c.id === 'full-package').map(category => (
                            <div key={category.id}>
                                <h3 className="font-heading text-2xl mb-4 flex items-center gap-3">
                                    <span className={`${category.icon} text-accent text-2xl w-8 text-center`} aria-hidden="true"></span>
                                    {category.title}
                                </h3>
                                <FullBodyCard
                                    zone={category.zones[0]}
                                    isSelected={!!selectedZones[category.zones[0].id]}
                                    onToggle={() => handleZoneToggle(category.zones[0].id)}
                                />
                            </div>
                        ))}

                        {/* Divider */}
                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-700"></div>
                            <span className="flex-shrink mx-4 text-text-muted text-sm">или соберите свой комплекс</span>
                            <div className="flex-grow border-t border-gray-700"></div>
                        </div>
                        
                        {/* Render other categories as accordions */}
                        <div className="space-y-4">
                            {calculatorData.filter(c => c.id !== 'full-package').map(category => {
                                const isOpen = openCategory === category.id;
                                return (
                                    <div key={category.id}>
                                        <button
                                            onClick={() => setOpenCategory(isOpen ? null : category.id)}
                                            aria-expanded={isOpen}
                                            className="w-full flex justify-between items-center text-left p-4 bg-surface rounded-lg transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-accent"
                                        >
                                            <h3 className="font-heading text-2xl flex items-center gap-3">
                                                <span className={`${category.icon} text-accent text-2xl w-8 text-center`} aria-hidden="true"></span>
                                                {category.title}
                                            </h3>
                                            <span className={`fas fa-chevron-down text-accent text-xl transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true"></span>
                                        </button>
                                        <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
                                            <div className="pt-4 px-2">
                                                <div className="flex flex-wrap gap-2">
                                                    {category.zones.map(zone => (
                                                        <ZonePill
                                                            key={zone.id}
                                                            zone={zone}
                                                            isSelected={!!selectedZones[zone.id]}
                                                            onToggle={() => handleZoneToggle(zone.id)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Summary */}
                    <div className={`hidden lg:block transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '300ms' }}>
                        <SummaryPanel />
                    </div>
                </div>

                <div className={`text-center text-text-muted mt-12 space-y-2 font-sans max-w-3xl mx-auto transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>
                    <p className="text-base"><strong className="text-text-main">Скидка 40%</strong> на ПЕРВЫЙ визит на любую зону или комплекс!</p>
                    <p className="text-sm">А также: <strong className="text-text-main">2 зоны:</strong> 10% | <strong className="text-text-main">3 зоны:</strong> 15% | <strong className="text-text-main">4 зоны:</strong> 20% | <strong className="text-text-main">5+ зон:</strong> 25%</p>
                </div>
            </div>
        </section>
        
        {/* Mobile Sticky Footer Summary */}
        <div className={`lg:hidden fixed bottom-0 left-0 w-full z-30 transition-transform duration-500 ease-in-out ${(calculation.count > 0) ? 'translate-y-0' : 'translate-y-full'}`}>
             <div className="bg-secondary/80 backdrop-blur-lg shadow-xl-top p-3">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div>
                        <span className="font-bold text-lg text-accent">{calculation.finalPrice.toLocaleString('ru-RU')} р.</span>
                        {!calculation.isFullBody && <span className="text-sm text-text-muted ml-2">({calculation.count} {calculation.count === 1 ? 'зона' : 'зон'})</span>}
                    </div>
                    <button onClick={() => setIsMobileSummaryOpen(true)} className="cta-button py-2 px-5 text-sm">
                        Итог и Запись
                    </button>
                </div>
            </div>
        </div>
        
        {/* Mobile Fullscreen Summary Modal */}
        {isMobileSummaryOpen && (
            <div className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col animate-fade-in">
                <div className="flex-grow" onClick={() => setIsMobileSummaryOpen(false)}></div>
                <div className="flex-shrink-0 w-full max-h-[85vh] bg-secondary rounded-t-2xl animate-slide-in-up">
                    <div className="p-4 text-center border-b border-gray-700">
                         <h2 className="font-heading text-xl">Ваш комплекс</h2>
                         <button onClick={() => setIsMobileSummaryOpen(false)} className="absolute top-3 right-3 text-2xl text-text-muted">
                            <i className="fas fa-times"></i>
                         </button>
                    </div>
                    <div className="overflow-y-auto" style={{maxHeight: 'calc(85vh - 65px)'}}>
                        <SummaryPanel isMobile={true} />
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default PriceCalculator;