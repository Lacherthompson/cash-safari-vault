import { useNavigate } from 'react-router-dom';
import savetogetherLogo from '@/assets/savetogether-logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  clickable?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-10 sm:h-12',
  md: 'h-16 sm:h-20',
  lg: 'h-16 sm:h-20 md:h-[80px] lg:h-[106px]',
  hero: 'h-24 sm:h-32 md:h-40',
};

export const Logo = ({ size = 'md', clickable = true, className = '' }: LogoProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (clickable) {
      navigate('/');
    }
  };

  return (
    <div 
      className={`dark:bg-white/95 dark:rounded-lg dark:px-3 dark:py-1.5 inline-block ${clickable ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleClick}
    >
      <img 
        src={savetogetherLogo} 
        alt="SaveTogether" 
        className={`${sizeClasses[size]} w-auto`} 
      />
    </div>
  );
};
