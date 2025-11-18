import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import { Cosmetics } from './components/Cosmetics';
import PriceCalculator from './components/PriceCalculator';
import GiftCertificates from './components/GiftCertificates';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import CartModal from './components/CartModal';
import TelegramFloat from './components/TelegramFloat';
import AutumnLeaves from './components/AutumnLeaves';
import { ModalData, CartItem } from './types';

const Preloader: React.FC = () => (
    <div className="fixed inset-0 bg-primary z-[100] flex items-center justify-center">
        <div className="font-heading text-8xl text-accent animate-pulse-glow">
            ТГ
        </div>
    </div>
);


const BackToTopButton: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`back-to-top-button ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            aria-label="Вернуться наверх"
        >
            <span className="fas fa-arrow-up" aria-hidden="true"></span>
        </button>
    );
};

const getInitialCart = (): CartItem[] => {
    try {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
        return [];
    }
};

function App() {
    const [loading, setLoading] = useState(true);
    const [modalData, setModalData] = useState<ModalData | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState<CartItem[]>(getInitialCart);
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        const timer = setTimeout(() => {
            setLoading(false);
            document.body.style.overflow = '';
        }, 1800);

        return () => {
            clearTimeout(timer);
            document.body.style.overflow = '';
        };
    }, []);

    useEffect(() => {
        // Save cart to localStorage whenever it changes
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        if (loading) return; 

        // Scroll listener
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [loading]);


    const handleOpenModal = (data: ModalData) => {
        setModalData(data);
    };

    const handleCloseModal = useCallback(() => {
        setModalData(null);
    }, []);

    const handleAddToCart = useCallback((itemToAdd: CartItem) => {
        setCartItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(item => item.id === itemToAdd.id);

            if (existingItemIndex > -1) {
                const existingItem = prevItems[existingItemIndex];
                if (existingItem.type === 'product') {
                    const updatedItems = [...prevItems];
                    updatedItems[existingItemIndex] = {
                        ...existingItem,
                        quantity: existingItem.quantity + 1
                    };
                    return updatedItems;
                }
                return prevItems;
            }
            
            return [...prevItems, itemToAdd];
        });
        setIsCartOpen(true);
    }, []);
    
    const handleClearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    const handleUpdateQuantity = useCallback((itemId: string, newQuantity: number) => {
        setCartItems(prevItems => {
            if (newQuantity <= 0) {
                return prevItems.filter(item => item.id !== itemId);
            }
            return prevItems.map(item =>
                item.id === itemId && item.type === 'product'
                    ? { ...item, quantity: newQuantity }
                    : item
            );
        });
    }, []);
    
    const totalCartItems = cartItems.reduce((total, item) => {
        return total + (item.type === 'product' ? item.quantity : 1);
    }, 0);
    
    const openGeneralModal = () => handleOpenModal({ name: 'Общая запись (без процедуры)', price: 'по прайсу', isComplex: false });

    return (
        <>
            {loading && <Preloader />}
            <AutumnLeaves />
            <div className={loading ? 'opacity-0' : 'animate-fade-in'}>
                <Header 
                    onOpenModal={openGeneralModal}
                    cartItemCount={totalCartItems}
                    onCartClick={() => setIsCartOpen(true)}
                />
                <main>
                    <Hero />
                    <PriceCalculator onOpenModal={handleOpenModal} />
                    <Services onOpenModal={handleOpenModal} onAddToCart={handleAddToCart} />
                    <Cosmetics onOpenModal={handleOpenModal} onAddToCart={handleAddToCart} />
                    <GiftCertificates onOpenModal={handleOpenModal} />
                    <Footer />
                </main>
                {modalData && <BookingModal data={modalData} onClose={handleCloseModal} />}
                {isCartOpen && <CartModal items={cartItems} onClose={() => setIsCartOpen(false)} onUpdateQuantity={handleUpdateQuantity} onClearCart={handleClearCart} />}
                <TelegramFloat isVisible={showBackToTop} />
                <BackToTopButton isVisible={showBackToTop} />
            </div>
        </>
    );
}

export default App;