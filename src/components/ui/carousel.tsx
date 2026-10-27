"use client";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";

interface SlideData {
  title: string;
  /** Sem ele o slide mostra só o título — usado nas galerias de foto. */
  button?: string;
  src: string;
  /** Linha de apoio sob o título: categoria, bairro, nota. */
  subtitle?: string;
  /** Torna o slide ativo clicável. Slide vizinho continua só trazendo o foco. */
  href?: string;
}

interface SlideProps {
  slide: SlideData;
  index: number;
  current: number;
  handleSlideClick: (index: number) => void;
  width: string;
  height: string;
  gap: string;
}

const Slide = ({
  slide,
  index,
  current,
  handleSlideClick,
  width,
  height,
  gap,
}: SlideProps) => {
  const slideRef = useRef<HTMLLIElement>(null);

  const xRef = useRef(0);
  const yRef = useRef(0);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const animate = () => {
      if (!slideRef.current) return;

      const x = xRef.current;
      const y = yRef.current;

      slideRef.current.style.setProperty("--x", `${x}px`);
      slideRef.current.style.setProperty("--y", `${y}px`);

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handleMouseMove = (event: React.MouseEvent) => {
    const el = slideRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    xRef.current = event.clientX - (r.left + Math.floor(r.width / 2));
    yRef.current = event.clientY - (r.top + Math.floor(r.height / 2));
  };

  const handleMouseLeave = () => {
    xRef.current = 0;
    yRef.current = 0;
  };

  const imageLoaded = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.opacity = "1";
  };

  const { src, button, title, subtitle, href } = slide;

  return (
    <div className="[perspective:1200px] [transform-style:preserve-3d]">
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: onClick aqui é atalho de mouse pra pular pro slide vizinho — a navegação por teclado já existe via o Link/button focável dentro do slide ativo (linhas abaixo); tornar cada <li> (x3 com o loop) focável adicionaria tab-stops indesejados. */}
      <li
        ref={slideRef}
        className="flex flex-1 flex-col items-center justify-center relative text-center text-white opacity-100 transition-all duration-300 ease-in-out z-10 "
        onClick={() => handleSlideClick(index)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          width,
          height,
          marginInline: gap,
          transform:
            current !== index
              ? "scale(0.98) rotateX(8deg)"
              : "scale(1) rotateX(0deg)",
          transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          transformOrigin: "bottom",
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-full bg-[#1D1F2F] rounded-[1%] overflow-hidden transition-all duration-150 ease-out"
          style={{
            transform:
              current === index
                ? "translate3d(calc(var(--x) / 30), calc(var(--y) / 30), 0)"
                : "none",
          }}
        >
          {/* biome-ignore lint/performance/noImgElement: crossfade depende do onLoad nativo de <img> mutando style diretamente, e slide.src aceita URL arbitrária não coberta por remotePatterns do next/image. */}
          <img
            className="absolute inset-0 w-[120%] h-[120%] object-cover opacity-100 transition-opacity duration-600 ease-in-out"
            style={{
              opacity: current === index ? 1 : 0.5,
            }}
            alt={title}
            src={src}
            onLoad={imageLoaded}
            loading="eager"
            decoding="sync"
          />
          {current === index && (
            <div className="absolute inset-0 bg-black/30 transition-all duration-300" />
          )}
        </div>

        <article
          className={`relative p-[4vmin] transition-opacity duration-300 ease-in-out ${
            current === index ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          <h2 className="text-lg md:text-2xl lg:text-4xl font-semibold  relative">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-2 text-sm text-white/80 md:text-base">
              {subtitle}
            </p>
          )}

          <div className={button ? "flex justify-center" : "hidden"}>
            {href ? (
              <Link
                href={href}
                className="mt-6  px-4 py-2 w-fit mx-auto sm:text-sm text-black bg-white h-12 border border-transparent text-xs flex justify-center items-center rounded-2xl hover:shadow-lg transition duration-200 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]"
              >
                {button}
              </Link>
            ) : (
              <button
                type="button"
                className="mt-6  px-4 py-2 w-fit mx-auto sm:text-sm text-black bg-white h-12 border border-transparent text-xs flex justify-center items-center rounded-2xl hover:shadow-lg transition duration-200 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]"
              >
                {button}
              </button>
            )}
          </div>
        </article>
      </li>
    </div>
  );
};

interface CarouselControlProps {
  type: string;
  title: string;
  handleClick: () => void;
}

const CarouselControl = ({
  type,
  title,
  handleClick,
}: CarouselControlProps) => {
  return (
    <button
      type="button"
      className={`p-1 flex items-center mx-2 justify-center bg-foreground border-none border-transparent rounded-full focus:border-[#6D64F7] focus:outline-none hover:-translate-y-0.5 active:translate-y-0.5 transition duration-200 ${
        type === "previous" ? "rotate-180" : ""
      }`}
      title={title}
      onClick={handleClick}
    >
      <ChevronRightIcon size={12} className="text-background" />
    </button>
  );
};

interface CarouselDotsProps {
  total: number;
  current: number;
  handleDotClick: (index: number) => void;
}

/**
 * Indicador de paginação interativo com formato de pill animada no slide ativo.
 */
const CarouselDots = ({
  total,
  current,
  handleDotClick,
}: CarouselDotsProps) => {
  return (
    <div
      role="tablist"
      aria-label="Paginação do carrossel"
      className="flex h-6 items-center gap-1.5 rounded-full bg-foreground px-2.5"
    >
      {Array.from({ length: total }, (_, index) => index).map((index) => {
        const isCurrent = index === current;
        return (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={isCurrent}
            aria-label={`Ir para o slide ${index + 1}`}
            onClick={() => handleDotClick(index)}
            className="group flex h-4 items-center justify-center p-0.5 focus:outline-none"
          >
            <span
              className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
                isCurrent
                  ? "w-6 bg-primary"
                  : "w-2 bg-background/50 group-hover:bg-background/80"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

interface CarouselProps {
  slides: SlideData[];

  /**
   * Tamanho de um slide, em qualquer unidade CSS **absoluta ou de viewport**.
   * Porcentagem não serve: a `<ul>` é `absolute` e teria largura circular.
   *
   * O container assume a mesma medida, porque a translação avança
   * `100 / looped.length` % da lista — o que só cai em cima do slide seguinte
   * se os dois casarem.
   */
  width?: string;
  height?: string;

  /** Respiro entre slides; entra como margem lateral e é compensado na lista. */
  gap?: string;
}

/** Cópias da lista renderizadas lado a lado: uma antes, a visível, uma depois. */
const LOOP_COPIES = 3;

export default function Carousel({
  slides,
  width = "min(48rem, 55vw)",
  height = "min(18rem, 22vw)",
  gap = "1rem",
}: CarouselProps) {
  const total = slides.length;
  const canLoop = total > 1;

  /**
   * A lista repetida é o que garante slide à esquerda e à direita em qualquer
   * posição. `position` anda livre dentro dela, e o `onTransitionEnd` devolve
   * para a cópia do meio sem animar — a volta não tem costura visível.
   */
  const looped = useMemo(
    () =>
      canLoop
        ? Array.from({ length: LOOP_COPIES }, () => slides).flat()
        : slides,
    [slides, canLoop],
  );

  const [position, setPosition] = useState(canLoop ? total : 0);
  const [animated, setAnimated] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const current = ((position % total) + total) % total;

  useEffect(() => {
    if (!canLoop || isPaused) return;

    const autoplayInterval = setInterval(() => {
      setPosition((previousPosition) => previousPosition + 1);
    }, 5000);

    return () => clearInterval(autoplayInterval);
  }, [canLoop, isPaused]);

  // Dois frames: um para o salto sem transição pintar, outro para religá-la
  useEffect(() => {
    if (animated) return;

    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setAnimated(true));
    });

    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [animated]);

  const handleTransitionEnd = () => {
    if (!canLoop) return;

    if (position >= total * 2) {
      setAnimated(false);
      setPosition(position - total);
    } else if (position < total) {
      setAnimated(false);
      setPosition(position + total);
    }
  };

  const handlePreviousClick = () => {
    setPosition(canLoop ? position - 1 : Math.max(position - 1, 0));
  };

  const handleNextClick = () => {
    setPosition(canLoop ? position + 1 : Math.min(position + 1, total - 1));
  };

  const handleSlideClick = (index: number) => {
    if (position !== index) setPosition(index);
  };

  const handleDotClick = (targetIndex: number) => {
    if (targetIndex === current) return;

    if (canLoop) {
      setPosition(total + targetIndex);
      return;
    }

    setPosition(targetIndex);
  };

  const id = useId();

  return (
    <section
      className="relative mx-auto"
      style={{ width, height }}
      aria-labelledby={`carousel-heading-${id}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <ul
        className={`absolute flex ease-in-out ${
          animated ? "transition-transform duration-500" : ""
        }`}
        style={{
          marginInline: `calc(${gap} * -1)`,
          transform: `translateX(-${position * (100 / looped.length)}%)`,
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {looped.map((slide, index) => (
          <Slide
            key={`${slide.src}-${index}`}
            slide={slide}
            index={index}
            current={position}
            handleSlideClick={handleSlideClick}
            width={width}
            height={height}
            gap={gap}
          />
        ))}
      </ul>

      <div className="absolute flex items-center justify-center w-full top-[calc(100%+1rem)]">
        <CarouselControl
          type="previous"
          title="Ver foto anterior"
          handleClick={handlePreviousClick}
        />

        <CarouselDots
          total={total}
          current={current}
          handleDotClick={handleDotClick}
        />

        <CarouselControl
          type="next"
          title="Ver próxima foto"
          handleClick={handleNextClick}
        />
      </div>

      <p className="sr-only" aria-live="polite">
        Foto {current + 1} de {total}
      </p>
    </section>
  );
}
