import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/StarRating';

export default function Review() {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');

  const handleSubmit = () => {
    if (rating === 5) {
      window.location.href = 'https://www.google.com/search?sa=X&sca_esv=831661049e449a6f&rlz=1C5CHFA_enNL1145NL1145&tbm=lcl&sxsrf=AE3TifOKMTGj_xYVu5kABJ9dcMYYH8wVVA:1755996769760&q=Keij+%26+Stefels+%7C+Makelaars+en+Vastgoedbeheerders+onder+%C3%A9%C3%A9n+dak+Reviews&rflfq=1&num=20&stick=H4sIAAAAAAAAAONgkxIxNDY0NzI0NDI1MDQ0MDU3NrQwstzAyPiK0cM7NTNLQU0huCQ1LTWnWKFGwTcxOzUnMbGoWCE1TyEssbgkPT81JSk1IzW1KCUVKJqfB6QUDq88vDJPISUxWyEotSwztbx4ESvVjAIA8IDPcrEAAAA&rldimm=13172112501105731829&hl=en-NL&ved=2ahUKEwi10MDdnaKPAxWG87sIHQ-jGAAQ9fQKegQIRBAF&cshid=1755996776921453&biw=1512&bih=784&dpr=2#';
    } else {
      window.location.href = '/dankuwel';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto pt-12">
        <div className="text-center space-y-8">
          <h1 className="text-2xl font-semibold text-foreground">
            Beoordeel alstublieft uw ervaring
          </h1>
          
          <div className="space-y-6">
            <p className="text-foreground font-medium">
              Beoordeel uw ervaring
            </p>
            
            <div className="flex justify-center">
              <StarRating rating={rating} onRatingChange={setRating} />
            </div>
            
            <div className="space-y-3 text-left">
              <label className="block text-foreground font-medium">
                Eventuele extra opmerkingen
              </label>
              <Textarea
                name="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="min-h-32"
                placeholder="Typ hier uw opmerkingen..."
              />
            </div>
            
            <Button
              onClick={handleSubmit}
              className="w-full py-3 text-lg"
              size="lg"
            >
              Bevestig
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}