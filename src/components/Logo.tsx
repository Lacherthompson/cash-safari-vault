import { useNavigate } from 'react-router-dom';
import savetogetherLogo from '@/assets/savetogether-logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  clickable?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-16 sm:h-[74px]',
  md: 'h-[92px] sm:h-[120px]',
  lg: 'h-[92px] sm:h-[120px] md:h-[120px] lg:h-[159px]',
  hero: 'h-[147px] sm:h-[184px] md:h-60',
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
        className={`${sizeClasses[size]} w-auto`} 
      />
    </div>
  );
};
