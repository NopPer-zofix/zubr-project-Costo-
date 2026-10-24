// Константы движения из MOTION.md. Значения менять только там и здесь вместе.

type Bezier = [number, number, number, number];

// Фирменный easing, примерно 80% анимаций
export const EASE: Bezier = [0.2, 0, 0, 1];
// Вход: замедление в конце
export const EASE_ENTER: Bezier = [0.05, 0.7, 0.1, 1];
// Выход: ускорение
export const EASE_EXIT: Bezier = [0.3, 0, 1, 1];

// Три длительности бренда, секунды
export const DUR = { quick: 0.15, standard: 0.3, slow: 0.5 } as const;

// Единый паттерн входа: подъём на 16 px и проявление
export const rise = (delay = 0, duration: number = DUR.standard) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration, delay, ease: EASE_ENTER },
});
