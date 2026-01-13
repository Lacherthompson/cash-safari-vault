import { useNavigate } from 'react-router-dom';
import savetogetherLogo from '@/assets/savetogether-logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  clickable?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-14 sm:h-16',
  md: 'h-20 sm:h-[104px]',
  lg: 'h-20 sm:h-[104px] md:h-[104px] lg:h-[138px]',
  hero: 'h-32 sm:h-40 md:h-52',
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
