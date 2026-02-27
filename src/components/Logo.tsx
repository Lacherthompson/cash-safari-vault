import { useNavigate } from 'react-router-dom';
import savetogetherLogo from '@/assets/savetogether-logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  clickable?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-[74px] sm:h-[86px]',
  md: 'h-[108px] sm:h-[132px]',
  lg: 'h-[108px] sm:h-[132px] md:h-[132px] lg:h-[172px]',
  hero: 'h-[160px] sm:h-[200px] md:h-64',
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
      className={`inline-block ${clickable ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleClick}
    >
      <img 
        src={savetogetherLogo} 
        alt="SaveTogether" 
        className={`${sizeClasses[size]} w-auto dark:brightness-0 dark:invert`}
      />
    </div>
  );
};
