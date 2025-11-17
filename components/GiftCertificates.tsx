import React, { useState, useRef, useEffect } from 'react';
import { ModalData } from '../types';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface GiftCertificatesProps {
    onOpenModal: (data: ModalData) => void;
}

const GiftCertificates: React.FC<GiftCertificatesProps> = ({ onOpenModal }) => {
    const [amount, setAmount] = useState<number | string>(5000);
    const [customAmount, setCustomAmount] = useState('');

    const sectionRef = useRef<HTMLElement>(null);
    const isVisible = useIntersectionObserver(sectionRef, { threshold: 0.1 });

    const handleAmountSelect = (value: number) => {
        setAmount(value);
        setCustomAmount('');
    };

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Allow only digits
        setCustomAmount(value);
        setAmount(value);
    };

    const handleBookCertificate = () => {
        const finalAmount = Number(amount);
        if (finalAmount > 0) {
            onOpenModal({
                name: `Подарочный сертификат`,
                price: finalAmount,
                isComplex: false,
            });
        }
    };
    
    const presetAmounts = [3000, 5000, 10000];

    return (
        <section id="gift-certificates" ref={sectionRef} className="py-16 sm:py-24 bg-primary">
            <div className="container mx-auto px-4">
                <div className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h2 className="font-heading text-4xl sm:text-5xl font-normal text-center mb-4">Подарочные Сертификаты</h2>
                    <p className="text-lg text-center text-text-muted font-sans mb-12 max-w-3xl mx-auto">
                        Лучший подарок — это забота. Подарите своим близким сертификат на любую услугу или косметику в "Точке Гладкости".
                    </p>
                </div>
                
                <div className={`max-w-4xl mx-auto bg-secondary rounded-2xl shadow-lg overflow-hidden grid md:grid-cols-2 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
                    
                    {/* Left Column: Certificate Visual */}
                    <div className="p-8 flex items-center justify-center">
                        <div className="w-full max-w-sm aspect-[1.6/1] bg-gradient-to-br from-surface to-secondary rounded-xl border-2 border-accent/50 shadow-lg p-6 flex flex-col justify-between text-left relative overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 hover:-rotate-1">
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent/10 rounded-full blur-2xl"></div>
                            <div>
                                <h4 className="font-heading text-accent text-2xl">Подарочный Сертификат</h4>
                                <p className="text-text-muted text-sm">от студии "Точка Гладкости"</p>
                            </div>
                            <div className="text-right">
                                <p className="text-text-muted text-sm">Номинал</p>
                                <p className="font-sans font-bold text-4xl text-text-main tracking-wider">
                                    {Number(amount) > 0 ? `${Number(amount).toLocaleString('ru-RU')} ₽` : '---- ₽'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="p-8 bg-primary/20 flex flex-col justify-center">
                        <div className="w-full max-w-sm mx-auto">
                            <h3 className="font-heading text-2xl font-normal text-text-main mb-6">Выберите или введите номинал:</h3>
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                {presetAmounts.map(preset => (
                                    <button
                                        key={preset}
                                        onClick={() => handleAmountSelect(preset)}
                                        className={`p-3 rounded-lg text-lg font-bold transition-colors duration-200 border-2 ${amount === preset && customAmount === '' ? 'bg-accent text-text-on-accent border-accent' : 'bg-surface border-transparent text-text-main hover:border-accent'}`}
                                    >
                                        {preset.toLocaleString('ru-RU')}
                                    </button>
                                ))}
                            </div>
                            
                            <input
                                id="custom-amount"
                                type="text"
                                inputMode="numeric"
                                placeholder="Другая сумма"
                                value={customAmount}
                                onChange={handleCustomAmountChange}
                                className="w-full p-3 border-2 border-surface rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-primary placeholder:text-text-muted focus:border-accent focus:ring-accent text-lg font-bold text-center"
                            />

                            <p className="text-xs text-text-muted text-center my-6">
                                Сертификат действует на все услуги и товары. Все акции и скидки также применяются.
                            </p>

                            <button
                                onClick={handleBookCertificate}
                                disabled={!amount || Number(amount) <= 0}
                                className="w-full cta-button px-8 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Оформить Сертификат
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GiftCertificates;