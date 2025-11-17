import React, { useState, useRef } from 'react';
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
                    <h2 className="font-heading text-4xl sm:text-5xl font-normal text-center mb-4">Подарите Заботу</h2>
                    <p className="text-lg text-center text-text-muted font-sans mb-12 max-w-2xl mx-auto">Подарочный сертификат — это идеальный способ выразить любовь и заботу. Выберите номинал или укажите свою сумму.</p>
                </div>
                
                <div className={`max-w-4xl mx-auto mt-12 grid lg:grid-cols-5 gap-0 bg-secondary rounded-2xl shadow-lg border border-gray-700/50 overflow-hidden transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
                    
                    {/* Left side: Certificate Visual */}
                    <div className="lg:col-span-3 p-8 flex flex-col justify-between bg-surface relative overflow-hidden min-h-[350px]">
                        <div className="absolute -top-10 -right-10 w-40 h-40 border-2 border-accent/10 rounded-full"></div>
                        <div className="absolute bottom-[-5rem] left-[-5rem] w-60 h-60 bg-accent/5 rounded-full"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-heading text-3xl text-accent">Подарочный</p>
                                    <p className="font-heading text-3xl text-text-main">Сертификат</p>
                                </div>
                                <div className="font-heading text-5xl text-accent opacity-50 font-bold">ТГ</div>
                            </div>
                        </div>

                        <div className="relative z-10 text-center my-8">
                            <p className="text-text-muted text-sm mb-2">На сумму</p>
                            <div className="font-sans font-bold text-6xl text-accent transition-all duration-300 h-16 flex items-center justify-center">
                                {Number(amount) > 0 ? (
                                    <span className="animate-fade-in">
                                        {Number(amount).toLocaleString('ru-RU')}
                                        <span className="text-4xl ml-2">р.</span>
                                    </span>
                                ) : (
                                    <span className="text-text-muted">...</span>
                                )}
                            </div>
                        </div>

                        <div className="relative z-10">
                            <p className="text-xs text-text-muted text-center">Действителен на все услуги и косметику в студии "Точка Гладкости".</p>
                        </div>
                    </div>

                    {/* Right side: Controls */}
                    <div className="lg:col-span-2 p-8 flex flex-col justify-center bg-secondary">
                        <h3 className="font-heading text-2xl text-text-main mb-6 text-center">Выберите номинал</h3>
                        
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {presetAmounts.map(preset => (
                                <button
                                    key={preset}
                                    onClick={() => handleAmountSelect(preset)}
                                    className={`py-3 rounded-lg font-bold text-base transition-all duration-300 border ${
                                        amount === preset && !customAmount
                                            ? 'bg-accent text-text-on-accent border-accent shadow-lg'
                                            : 'bg-primary text-text-main border-transparent hover:border-accent'
                                    }`}
                                >
                                    {preset / 1000} т.
                                </button>
                            ))}
                        </div>

                        <div>
                            <label htmlFor="custom-amount" className="block text-sm font-medium text-text-muted mb-2 text-center">Или укажите свою сумму:</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="custom-amount"
                                    value={customAmount}
                                    onChange={handleCustomAmountChange}
                                    placeholder="Например, 4500"
                                    className="w-full p-3 pr-8 text-center text-xl font-bold border-2 border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-accent focus:ring-accent bg-primary placeholder:text-text-muted"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xl font-bold text-text-muted pointer-events-none">₽</span>
                            </div>
                        </div>
                        
                        <div className="mt-auto pt-8">
                            <button
                                onClick={handleBookCertificate}
                                disabled={Number(amount) <= 0 || Number(amount) < 1000}
                                className="w-full cta-button px-10 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <span className="fas fa-gift" aria-hidden="true"></span>
                                Оформить Сертификат
                            </button>
                             {Number(amount) > 0 && Number(amount) < 1000 && (
                                <p className="text-red-400 text-xs text-center mt-2 animate-fade-in">Минимальная сумма 1000 р.</p>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GiftCertificates;