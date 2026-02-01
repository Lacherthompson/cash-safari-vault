import { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';

interface Testimonial {
  quote: string;
  name: string;
  location: string;
  initials: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "I discovered three subscriptions I'd forgotten about — that's $47/month I now put straight into savings. Three months in, I'm finally seeing real progress toward my goals.",
    name: "Michelle R.",
    location: "Atlanta, GA",
    initials: "MR",
  },
  {
    quote: "I've tried budgeting apps before and always gave up. This is different — checking off each save feels like a little win. I've saved $800 in two months without even thinking about it.",
    name: "James T.",
    location: "Austin, TX",
    initials: "JT",
  },
  {
    quote: "My partner and I use this for our vacation fund. Seeing the progress bar fill up together keeps us both motivated. We're halfway to our trip already!",
    name: "Sarah K.",
    location: "Denver, CO",
    initials: "SK",
  },
  {
    quote: "I started small — just $5 here and there. Now I have an actual emergency fund for the first time in my life. The visual progress really keeps me going.",
    name: "David L.",
    location: "Seattle, WA",
    initials: "DL",
  },
];

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
        setIsTransitioning(false);
      }, 300);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const testimonial = TESTIMONIALS[currentIndex];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative bg-muted/50 rounded-2xl p-6 sm:p-8">
        <Quote className="absolute top-4 left-4 h-8 w-8 text-primary/20" />
        <blockquote className="relative z-10">
          <p 
            className={`text-base sm:text-lg text-foreground leading-relaxed mb-4 transition-opacity duration-300 ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
          >
            "{testimonial.quote}"
          </p>
          <footer 
            className={`flex items-center gap-3 transition-opacity duration-300 ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">{testimonial.initials}</span>
            </div>
            <div className="text-left">
              <cite className="not-italic font-medium text-foreground">{testimonial.name}</cite>
              <p className="text-sm text-muted-foreground">{testimonial.location}</p>
            </div>
          </footer>
        </blockquote>
        
        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {TESTIMONIALS.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentIndex(index);
                  setIsTransitioning(false);
                }, 300);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-6 bg-primary' 
                  : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`View testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
