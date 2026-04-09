import { AiOutlineInstagram } from 'react-icons/ai';
import { RiTelegram2Fill } from 'react-icons/ri';
import { BiLogoVk } from 'react-icons/bi';

function socialIconKind(name: string): 'instagram' | 'telegram' | 'vk' | 'other' {
  const k = name.toLowerCase();
  if (k.includes('insta') || k === 'instagram') return 'instagram';
  if (k.includes('telegram') || k === 'tg') return 'telegram';
  if (k.includes('vk') || k.includes('вк')) return 'vk';
  return 'other';
}

export interface ContactSocialLinkInput {
  name: string;
  icon?: string;
}

export function ContactSocialIcon({ name, icon }: ContactSocialLinkInput) {
  const kind = socialIconKind(name);
  switch (kind) {
    case 'instagram':
      return <AiOutlineInstagram className="social-svg-icon" aria-hidden="true" />;
    case 'telegram':
      return <RiTelegram2Fill className="social-svg-icon" aria-hidden="true" />;
    case 'vk':
      return <BiLogoVk className="social-svg-icon" aria-hidden="true" />;
    default:
      return <span className="social-icon">{icon ?? '🔗'}</span>;
  }
}
