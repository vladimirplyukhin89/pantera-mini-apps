import { ImPointRight } from 'react-icons/im';

interface HeroAccentProps {
  linkTo?: string;
  className?: string;
}

const HeroAccent = ({ linkTo = '/sportsmen', className = '' }: HeroAccentProps) => {
  const iconSize = 40;

  return (
    <a href={linkTo} className={className} aria-label="Перейти">
      <ImPointRight size={iconSize} />
    </a>
  );
};

export default HeroAccent;
