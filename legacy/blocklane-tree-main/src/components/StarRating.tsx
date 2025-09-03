import { useState, useEffect } from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

export function StarRating({ rating, onRatingChange }: StarRatingProps) {
  const [selected, setSelected] = useState(rating);
  const [hovered, setHovered] = useState(0);

  useEffect(() => {
    setSelected(rating);
  }, [rating]);

  const filledCount = hovered || selected;

  const handleClick = (starIndex: number) => {
    setSelected(starIndex);
    onRatingChange(starIndex);
  };

  const handleKeyDown = (event: React.KeyboardEvent, starIndex: number) => {
    if (event.key === 'ArrowLeft' && starIndex > 1) {
      const newRating = starIndex - 1;
      setSelected(newRating);
      onRatingChange(newRating);
      // Focus previous star
      const prevButton = event.currentTarget.previousElementSibling as HTMLButtonElement;
      prevButton?.focus();
    } else if (event.key === 'ArrowRight' && starIndex < 5) {
      const newRating = starIndex + 1;
      setSelected(newRating);
      onRatingChange(newRating);
      // Focus next star
      const nextButton = event.currentTarget.nextElementSibling as HTMLButtonElement;
      nextButton?.focus();
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handleClick(starIndex);
    }
  };

  return (
    <div role="radiogroup" aria-label="Waardering" className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFilled = starIndex <= filledCount;
        const isSelected = starIndex <= selected;
        
        return (
          <button
            key={starIndex}
            type="button"
            role="radio"
            aria-checked={starIndex === selected}
            aria-label={`${starIndex} ${starIndex === 1 ? 'ster' : 'sterren'}`}
            className="w-10 h-10 p-1 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
            onMouseEnter={() => setHovered(starIndex)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => handleClick(starIndex)}
            onKeyDown={(e) => handleKeyDown(e, starIndex)}
            tabIndex={starIndex === 1 ? 0 : -1}
          >
            <svg
              className={`w-full h-full transition-colors ${
                isFilled
                  ? isSelected 
                    ? 'text-amber-500 hover:text-amber-600 active:text-amber-700'
                    : 'text-amber-500 hover:text-amber-600'
                  : 'text-gray-300'
              }`}
              viewBox="0 0 24 24"
              fill={isFilled ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          </button>
        );
      })}
      <input type="hidden" name="rating" value={selected || ''} />
    </div>
  );
}